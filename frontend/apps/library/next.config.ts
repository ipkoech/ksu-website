import type { NextConfig } from "next";
import path from "node:path";
import { createRequire } from "node:module";

const { ensureSharedPublic } = createRequire(path.join(__dirname, "package.json"))(
  "../../scripts/shared-public.cjs",
);

ensureSharedPublic(__dirname);

const basePath = process.env.NEXT_BASE_PATH || "";

const nextConfig: NextConfig = {
  ...(basePath ? { basePath } : {}),
  distDir: process.env.NEXT_DIST_DIR || ".next",
  // Keep Windows production builds usable without pnpm symlink privileges;
  // Linux deployment still emits the standalone runtime used by the image.
  ...(process.platform === "win32" ? {} : { output: "standalone" as const }),
  outputFileTracingRoot: path.join(__dirname, "../.."),
  transpilePackages: ["@ksu/ui", "@ksu/api-client"],
  async redirects() {
    return [
      { source: "/news", destination: "/updates", permanent: true },
      { source: "/news/:slug", destination: "/updates/news/:slug", permanent: true },
      { source: "/events", destination: "/updates?type=events", permanent: true },
      { source: "/events/:slug", destination: "/updates/events/:slug", permanent: true },
      { source: "/articles", destination: "/updates?type=articles", permanent: true },
      { source: "/articles/:slug", destination: "/updates/articles/:slug", permanent: true },
      { source: "/hours", destination: "/contact#hours", permanent: true },
      { source: "/staff", destination: "/about#staff", permanent: true },
      { source: "/leadership", destination: "/about#leadership", permanent: true },
      { source: "/repositories", destination: "/electronic#external-links", permanent: true },
      { source: "/downloads", destination: "/electronic#downloads", permanent: true },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "kisiiuniversity.ac.ke",
      },
      {
        protocol: "https",
        hostname: "*.kisiiuniversity.ac.ke",
      },
      {
        protocol: "http",
        hostname: "localhost",
      },
    ],
  },
};

export default nextConfig;
