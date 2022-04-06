import { assert } from "https://deno.land/std@0.133.0/testing/asserts.ts";

import { CloudflareFetcher } from "./mod.ts";

// Approval for accessing WWJDTD's profile and stories given by WWJDTD.
// No approval from FF.NET was asked or received.

Deno.test({
    name: "Download WWJDTD's Profile from FF.Net",
    async fn() {
        console.log();
        const cff = new CloudflareFetcher("CloudflareFetcher-Test-Instance");
        const resp = await cff.fetch("https://www.fanfiction.net/u/4463712/");
        const a = false;
        if(a){
            console.log(await resp.text());
        } else {
            await resp.body?.cancel();
        }
        console.log({
            redirected: resp.redirected,
            status: resp.status,
            statusText: resp.statusText
        })
        assert(resp.ok);
    },
});