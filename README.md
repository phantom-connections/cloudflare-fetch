# cloudflare-fetch

A way to fetch pages from cloud-flare protected pages in Deno.

Currently this does not work as intended. This will be branched and eventually
I'll get back to fixing it... Possibly... Someday.

Until then I'm just going to make it a puppeteer system.

Code is maintained on [Gitlab](https://gitlab.com/phm-conn/cloudflare-fetch).

# Usage

```
import { CloudflareFetcher } from "https://deno.land/x/cloudflare_fetch/mod.ts";

const cff = new CloudflareFetcher("CloudflareFetcher-Test-Instance");
// Starts a puppeteer instance.
await cff.startBrowser();
const { content, status } = await cff.fetch(profileURL);
test.assertStringIncludes(content, `id: ${profile.id}`);
test.assertEquals(status, 200);
// Closes the puppeteer instance.
await cff.closeBrowser();
```

# Prior Work:
Loosely based around https://github.com/JimmyLaurent/cloudflare-scraper