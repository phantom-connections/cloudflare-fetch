import * as test from "https://deno.land/std@0.133.0/testing/asserts.ts";

import { CloudflareFetcher } from "./mod.ts";

Deno.test({
    name: "Attempt download without starting browser.",
    fn() {
        test.assertRejects(async () => {
            const cff = new CloudflareFetcher("CloudflareFetcher-Test-Instance");
            const __ = await cff.fetch("https://www.fanfiction.net/u/4463712/");
        });
    },
});

{
    Deno.test({
        name: "Download from FF.Net",
        async fn(t) {
            const cff = new CloudflareFetcher("CloudflareFetcher-Test-Instance");
            await cff.startBrowser();
            await t.step("Download WWJDTD's Profile", async ()=>{
                const { content, status } = await cff.fetch("https://www.fanfiction.net/u/4463712/");
                test.assertStringIncludes(content, "id: 4463712");
                test.assertEquals(status, 200);
            })
            await t.step("Download story '11689623'", async () => {
                const { content, status } = await cff.fetch("https://www.fanfiction.net/s/11689623/");
                test.assertStringIncludes(content, "id: 11689623");
                test.assertEquals(status, 200);
            })
            await t.step("Download reviews for '10415866'", async () => {
                const { content, status } = await cff.fetch("https://www.fanfiction.net/r/11689623/0/1/");
                test.assertStringIncludes(content, "Reviews for Linked in Life and Love");
                test.assertEquals(status, 200);
            })
            await cff.closeBrowser();
        },
    });
}