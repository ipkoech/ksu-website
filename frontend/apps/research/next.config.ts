import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  distDir: process.env.NEXT_DIST_DIR || ".next",
  output: "standalone",
  outputFileTracingRoot: path.join(__dirname, "../.."),
  outputFileTracingIncludes: {
    "/institutional-research-images/[file]": [
      "../../public/images/research/*.jpg",
    ],
  },
  transpilePackages: ["@ksu/ui", "@ksu/api-client"],
  async redirects() {
    return [
      { source: "/resources-tools/forms", destination: "/forms", permanent: true },
      { source: "/resources-tools/outputs", destination: "/outputs", permanent: true },
      { source: "/resources-tools/services", destination: "/services", permanent: true },
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
