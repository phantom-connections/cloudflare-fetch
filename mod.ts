import puppeteer from "https://deno.land/x/puppeteer_plus@0.12.0/mod.ts";
import type { HTTPResponse, Browser, Protocol } from "https://deno.land/x/puppeteer_plus@0.12.0/mod.ts";
import * as cloudflareTests from "./cloudflare_tests.ts";

export class CloudflareFetcher {
    readonly useragent: string;
    private browser: Browser | null = null
    private cookieJar: Protocol.Network.Cookie[] | null = null;
    private lastPage: string | undefined = undefined;
    readonly timeout: number;

    constructor(useragent: string, timeout: number = 15) {
        this.useragent = useragent;
        this.timeout = timeout;
    }

    async startBrowser() {
        this.browser = await puppeteer.launch();
    }

    async closeBrowser() {
        const browser = this.browser;
        this.browser = null;
        await browser?.close();
    }

    async fetch(url: string, options?: RequestInit) {
        if(!this.browser){
            throw new Error("No browser yet!");
        }
        const fullOptions = { ...options };
        fullOptions.headers = { ...fullOptions.headers, "User-Agent": this.useragent};
        const page = await this.browser.newPage();
        let content = "";
        let status = -1;
        try {

            if(this.cookieJar){
                page.setCookie(...this.cookieJar);
            }
            page.setUserAgent(this.useragent);

            let response: HTTPResponse | null = await page.goto(url, {
                timeout: this.timeout * 1000,
                waitUntil: 'domcontentloaded',
                referer: this.lastPage
            });

            let count = 1;
            content = await page.content();

            while (cloudflareTests.hasCloudflareChallengePlatform(content) ||cloudflareTests.isCloudflareJSChallenge(content) || cloudflareTests.isCloudflareHold(response)) {
                const res = page.waitForNavigation({
                    timeout: this.timeout * 1000,
                    waitUntil: 'domcontentloaded'
                });
                if (cloudflareTests.hasCloudflareChallengePlatform(content) || cloudflareTests.isCloudflareJSChallenge(content) || cloudflareTests.isCloudflareHold(response)) {
                    page.click(".bubbles", {delay: (Math.random() * Math.pow(10, 3))}).catch(()=>{})
                }
                response = await res;
                content = await page.content();
                if (count++ == 100) {
                    throw new Error('timeout on just a moment');
                }
            }
            if (cloudflareTests.isCloudflareCaptchaChallenge(content)) {
                console.error("Not Yet Implemented.")
                throw new Error("Hit actual captcha.")
            }
            status = response?.status() || -1;
            this.cookieJar = await page.cookies();
        } finally {
            this.lastPage = page.url();
            await page.close();
        }
        return {
            content,
            status
        };
    }
}