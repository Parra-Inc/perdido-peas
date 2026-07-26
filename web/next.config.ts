import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

const nextConfig: NextConfig = {};

// Exposes simulated Cloudflare bindings inside `next dev` (miniflare). No-op in
// production builds.
initOpenNextCloudflareForDev();

export default nextConfig;
