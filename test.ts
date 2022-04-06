import * as test from "https://deno.land/std@0.133.0/testing/asserts.ts";

import { CloudflareFetcher } from "./mod.ts";

const profileID = 4463712;
const profile = { id: profileID, name: "WWJDTD" };
const profileURL = `https://www.fanfiction.net/u/${profile.id}/`;
const storyID = 11689623;
const story1 = { id: storyID, name: "Linked in Life and Love" };
const story1URL = `https://www.fanfiction.net/s/${story1.id}/`;
const story1URL2 = `https://www.fanfiction.net/s/${story1.id}/1/`;
const review1URL = `https://www.fanfiction.net/r/${story1.id}/0/1/`;

Deno.test({
  name: "Attempt download without starting browser.",
  fn() {
    test.assertRejects(async () => {
      const cff = new CloudflareFetcher("CloudflareFetcher-Test-Instance");
      const __ = await cff.fetch(profileURL);
    });
  },
});

Deno.test({
  name: `Download ${profile.name}'s Profile from FF.Net`,
  async fn() {
    const cff = new CloudflareFetcher("CloudflareFetcher-Test-Instance");
    await cff.startBrowser();
    const { content, status } = await cff.fetch(profileURL);
    test.assertStringIncludes(content, `id: ${profile.id}`);
    test.assertEquals(status, 200);
    await cff.closeBrowser();
  },
});

Deno.test({
  name: "Download story '11689623' from FF.Net",
  async fn() {
    const cff = new CloudflareFetcher("CloudflareFetcher-Test-Instance", 7.5);
    await cff.startBrowser();
    const { content, status } = await cff.fetch(story1URL);
    test.assertStringIncludes(content, `id: ${story1.id}`);
    test.assertEquals(status, 200);
    await cff.closeBrowser();
  },
});

Deno.test({
  name: "Download story '11689623' from FF.Net but with chapter in URL",
  async fn() {
    const cff = new CloudflareFetcher("CloudflareFetcher-Test-Instance", 7.5);
    await cff.startBrowser();
    const { content, status } = await cff.fetch(story1URL2);
    test.assertStringIncludes(content, `id: ${story1.id}`);
    test.assertEquals(status, 200);
    await cff.closeBrowser();
  },
});

Deno.test({
  name: "Download reviews for '10415866' from FF.Net",
  async fn() {
    const cff = new CloudflareFetcher("CloudflareFetcher-Test-Instance");
    await cff.startBrowser();
    const { content, status } = await cff.fetch(review1URL);
    test.assertStringIncludes(content, `Reviews for ${story1.name}`);
    test.assertEquals(status, 200);
    await cff.closeBrowser();
  },
});

Deno.test({
  name: "Download from FF.Net Sequentially Without a story",
  async fn(t) {
    const cff = new CloudflareFetcher("CloudflareFetcher-Test-Instance");
    await cff.startBrowser();
    await t.step("Download WWJDTD's Profile", async () => {
      const { content, status } = await cff.fetch(profileURL);
      test.assertStringIncludes(content, "id: 4463712");
      test.assertEquals(status, 200);
    });
    /*await t.step("Download story '11689623'", async () => {
            const { content, status } = await cff.fetch(story1URL);
            test.assertStringIncludes(content, `id: ${story1.id}`);
            test.assertEquals(status, 200);
        })*/
    await t.step("Download reviews for '10415866'", async () => {
      const { content, status } = await cff.fetch(review1URL);
      test.assertStringIncludes(content, `Reviews for ${story1.name}`);
      test.assertEquals(status, 200);
    });
    await cff.closeBrowser();
  },
});

Deno.test({
  name: "Download from FF.Net Sequentially With a story",
  async fn(t) {
    const cff = new CloudflareFetcher("CloudflareFetcher-Test-Instance");
    await cff.startBrowser();
    await t.step("Download WWJDTD's Profile", async () => {
      const { content, status } = await cff.fetch(profileURL);
      test.assertStringIncludes(content, "id: 4463712");
      test.assertEquals(status, 200);
    });
    await t.step("Download story '11689623'", async () => {
      const { content, status } = await cff.fetch(story1URL);
      test.assertStringIncludes(content, `id: ${story1.id}`);
      test.assertEquals(status, 200);
    });
    await t.step("Download reviews for '10415866'", async () => {
      const { content, status } = await cff.fetch(review1URL);
      test.assertStringIncludes(content, `Reviews for ${story1.name}`);
      test.assertEquals(status, 200);
    });
    await cff.closeBrowser();
  },
});
