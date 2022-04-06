import { Cookie, CookieJar } from 'https://deno.land/x/another_cookiejar@v4.0.2/mod.ts';
import puppeteer from "https://deno.land/x/puppeteer_plus@0.12.0/mod.ts";
import type { HTTPResponse } from "https://deno.land/x/puppeteer_plus@0.12.0/mod.ts";
import * as cloudflareTests from "./cloudflare_tests.ts";

export async function fillCookiesJar(url: string, agent: string, jar: CookieJar) {

    const browser = await puppeteer.launch();
    try {
        const page = await browser.newPage();
        const jarExport = jar.getCookies();
        //transfer the jar to puppeteer.
        for(const cookie of jarExport){
            page.setCookie({
                name: cookie.name || "Error",
                value: cookie.value || "Error",
                domain: cookie.domain,
                path: cookie.path,
                expires: cookie.expires,
                httpOnly: cookie.httpOnly,
                secure: cookie.secure,
                sameSite: cookie.sameSite
            });
        }

        page.setUserAgent(agent);

        let response: HTTPResponse | null = await page.goto(url, {
            timeout: 45000,
            waitUntil: 'domcontentloaded'
        });

        let count = 1;
        let content = await page.content();

        while (cloudflareTests.isCloudflareJSChallenge(content) || cloudflareTests.isCloudflareHold(response)) {
            response = await page.waitForNavigation({
                timeout: 45000,
                waitUntil: 'domcontentloaded'
            });
            content = await page.content();
            if (count++ === 100) {
                throw new Error('timeout on just a moment');
            }
        }
        if (cloudflareTests.isCloudflareCaptchaChallenge(content)) {
            console.error("Not Yet Implemented.")
            throw new Error("Hit actual captcha.")
        }

        console.log(response?.headers());
        console.log(await page.content());

        const cookies = await page.cookies();
        for (const cookie of cookies) {
            const intCookie = new Cookie(
                {
                    name: cookie.name || "Error",
                    value: cookie.value || "Error",
                    domain: cookie.domain,
                    path: cookie.path,
                    expires: cookie.expires * Math.pow(10, 3),
                    httpOnly: cookie.httpOnly,
                    secure: cookie.secure,
                    sameSite: cookie.sameSite
                });
            jar.setCookie(intCookie, url);
        }
        page.close();
    } finally {
        await browser.close();
    }
}