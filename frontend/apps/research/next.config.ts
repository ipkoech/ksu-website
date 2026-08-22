import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  distDir: process.env.NEXT_DIST_DIR || ".next",
  output: "standalone",
  outputFileTracingRoot: path.join(__dirname, "../.."),
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
        protocol: "https",
        hostname: "www.kumc.edu",
      },
      {
        protocol: "https",
        hostname: "icons.duckduckgo.com",
      },
      {
        protocol: "https",
        hostname: "www.knls.ac.ke",
      },
      {
        protocol: "https",
        hostname: "www.computeraid.org",
      },
      {
        protocol: "https",
        hostname: "www.jci.edu.cn",
      },
      {
        protocol: "https",
        hostname: "www.semyung.ac.kr",
      },
      {
        protocol: "https",
        hostname: "www.iyf.org",
      },
      {
        protocol: "https",
        hostname: "www.knchr.org",
      },
      {
        protocol: "http",
        hostname: "localhost",
      },
    ],
  },
};

export default nextConfig;
