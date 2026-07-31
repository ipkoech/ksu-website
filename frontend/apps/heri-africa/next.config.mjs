import path from "node:path";

const basePath = process.env.NEXT_BASE_PATH || "/heri-africa";

/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath,
  distDir: process.env.NEXT_DIST_DIR || ".next",
  output: "standalone",
  outputFileTracingRoot: path.join(import.meta.dirname, "../.."),
  transpilePackages: ["@ksu/ui", "@ksu/api-client"],
};

export default nextConfig;
