import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@ksu/ui", "@ksu/api-client"],
  images: {
    remotePatterns: [
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
