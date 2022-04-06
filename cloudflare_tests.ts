import { HTTPResponse } from "https://deno.land/x/puppeteer_plus@0.12.0/mod.ts";
export function isCloudflareHold(
  response: Response | HTTPResponse | null,
): boolean {
  if (response instanceof HTTPResponse) {
    const headers = response.headers();
    if (headers["cf-chl-bypass"] == "1") {
      return true;
    }
  }
  if (response instanceof Response) {
    if (response.headers.get("cf-chl-bypass") == "1") {
      return true;
    }
  }
  return false;
}

export function hasCloudflareChallengePlatform(body: string) {
  return body.includes("/cdn-cgi/challenge-platform");
}

export function isCloudflareJSChallenge(body: string) {
  return body.includes("managed_checking_msg");
}

export function isCloudflareCaptchaChallenge(body: string) {
  return body.includes("cf_captcha_kind");
}
