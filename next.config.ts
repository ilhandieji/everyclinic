import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  compiler: {
    styledComponents: true,
  },
  cacheComponents: true,
  partialPrefetching: true,
  allowedDevOrigins: ["127.0.0.1"],
  experimental: {
    // Turbopack's on-disk dev cache keeps a stale globals.css compile across
    // restarts, so a color edit only appears after deleting .next.
    turbopackFileSystemCacheForDev: false,
  },
};

export default nextConfig;
