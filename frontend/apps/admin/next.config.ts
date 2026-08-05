import type { NextConfig } from "next";
import { PHASE_DEVELOPMENT_SERVER } from "next/constants";
import path from "node:path";

const basePath = process.env.NEXT_BASE_PATH || "";

const baseConfig: NextConfig = {
  ...(basePath ? { basePath } : {}),
  distDir: process.env.NEXT_DIST_DIR || ".next",
  outputFileTracingRoot: path.join(__dirname, "../.."),
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
  const output =
    phase === PHASE_DEVELOPMENT_SERVER
      ? undefined
      : process.env.NEXT_OUTPUT_EXPORT === "0"
        ? "standalone"
        : "export";

  return {
    ...baseConfig,
    ...(output ? { output } : {}),
  };
}
