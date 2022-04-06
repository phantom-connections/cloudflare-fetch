import * as test from "https://deno.land/std@0.133.0/testing/asserts.ts";
import { delay, deferred, deadline } from "https://deno.land/std@0.133.0/async/mod.ts";

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
    const cff = new CloudflareFetcher("CloudflareFetcher-Test-Instance");
    await cff.startBrowser();
    await Deno.test({
        name: "Download WWJDTD's Profile from FF.Net",
        async fn() {
            const { content, status } = await cff.fetch("https://www.fanfiction.net/u/4463712/");
            test.assertStringIncludes(content, "id: 4463712");
            test.assertEquals(status, 200);
        },
    });
    await Deno.test({
        name: "Download story '11689623' from FF.Net",
        async fn() {
            await delay(1000)
            const { content, status } = await cff.fetch("https://www.fanfiction.net/s/11689623/");
            test.assertStringIncludes(content, "id: 11689623");
            test.assertEquals(status, 200);
        },
    });
    await Deno.test({
        name: "Download reviews for '10415866' from FF.Net",
        async fn() {
            await delay(1000)
            const { content, status } = await cff.fetch("https://www.fanfiction.net/r/11689623/0/1/");
            test.assertStringIncludes(content, "Reviews for Linked in Life and Love");
            test.assertEquals(status, 200);
            await cff.closeBrowser();
        },
    });
}