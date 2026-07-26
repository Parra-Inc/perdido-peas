import { defineCloudflareConfig } from "@opennextjs/cloudflare";

// Default config: no incremental cache. Single static page, so ISR/"use cache"
// storage isn't needed.
export default defineCloudflareConfig();
