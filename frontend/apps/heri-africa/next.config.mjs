import path from "node:path";
import { ensureSharedPublic } from "../../scripts/shared-public.cjs";

ensureSharedPublic(import.meta.dirname);

const basePath = process.env.NEXT_BASE_PATH || "/heri-africa";
// Windows cannot preserve pnpm virtual-store symlinks during Next standalone
// tracing. Use the regular .next runtime locally; Linux images stay standalone.
const output = process.platform === "win32" ? undefined : "standalone";

/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath,
  distDir: process.env.NEXT_DIST_DIR || ".next",
  // next/image does not apply basePath to string src values; components prefix
  // local assets via withBasePath, which reads this inlined value.
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
  ...(output ? { output } : {}),
  outputFileTracingRoot: path.join(import.meta.dirname, "../.."),
  transpilePackages: ["@ksu/ui", "@ksu/api-client"],
  async redirects() {
    return [
      {
        source: "/contact",
        destination: "/partner-with-us#partnership-enquiry",
        permanent: false,
      },
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
