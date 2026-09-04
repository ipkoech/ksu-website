import path from "node:path";

const basePath = process.env.NEXT_BASE_PATH || "/heri-africa";

/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath,
  distDir: process.env.NEXT_DIST_DIR || ".next",
  // next/image does not apply basePath to string src values; components prefix
  // local assets via withBasePath, which reads this inlined value.
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
  output: "standalone",
  outputFileTracingRoot: path.join(import.meta.dirname, "../.."),
  transpilePackages: ["@ksu/ui", "@ksu/api-client"],
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
