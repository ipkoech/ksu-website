import type { NextConfig } from "next";
import { PHASE_DEVELOPMENT_SERVER } from "next/constants";

const basePath = process.env.NEXT_BASE_PATH || "";

const baseConfig: NextConfig = {
  ...(basePath ? { basePath } : {}),
  distDir: process.env.NEXT_DIST_DIR || ".next",
  trailingSlash: true,
  transpilePackages: ["@ksu/ui", "@ksu/auth", "@ksu/api-client"],
  images: {
    unoptimized: true,
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

export default function nextConfig(phase: string): NextConfig {
  return {
    ...baseConfig,
    ...(phase === PHASE_DEVELOPMENT_SERVER ? {} : { output: "export" }),
  };
}
