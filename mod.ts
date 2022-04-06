import { Cookie, CookieJar, wrapFetch } from 'https://deno.land/x/another_cookiejar@v4.0.2/mod.ts';
import { fillCookiesJar } from "./fillCookiesJar.ts";
import { isCloudflareHold } from "./cloudflare_tests.ts";

export class CloudflareFetcher {
    readonly useragent: string;
    readonly cookieJar: CookieJar;
    private readonly wfetch;

    constructor(useragent: string) {
        this.useragent = useragent;
        // you can also pass your own cookiejar to wrapFetch to save/load your cookies
        this.cookieJar = new CookieJar();
        // Now use this fetch and any cookie that is set will be sent with your next requests automatically
        this.wfetch = wrapFetch({ "cookieJar": this.cookieJar });
    }

    private static isCloudflareHold(response: Response): boolean {
        return isCloudflareHold(response);
    }

    private async handleNotOK(response: Response, url: string, options: RequestInit) {
        if (CloudflareFetcher.isCloudflareHold(response)){
            response.body?.cancel();
            console.log(this.cookieJar.cookies);
            await fillCookiesJar(url, this.useragent, this.cookieJar);
            console.log(this.cookieJar.cookies);
            return this.wfetch(url, options);
        }
        console.error("Unknown error in handleNotOK.");
        return response;
    }

    private handleResponse(response: Response, url: string, options: RequestInit) {
        return response;
    }

    async fetch(url: string, options?: RequestInit) {
        const fullOptions = { ...options };
        fullOptions.headers = { ...fullOptions.headers, "User-Agent": this.useragent};
        let response = await this.wfetch(url, fullOptions);
        if(!response.ok){
            response = await this.handleNotOK(response, url, fullOptions)
        }
        return this.handleResponse(response, url, fullOptions);
    }
}