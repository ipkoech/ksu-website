import type { MetadataRoute } from "next";

const origin = "https://kisiiuniversity.ac.ke";
const base = `${origin}${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}`;

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${base}/sitemap.xml`,
  };
}
