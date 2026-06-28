import type { MetadataRoute } from "next";

const BASE = "https://research.kisiiuniversity.ac.ke";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = [
    "/", "/projects", "/publications", "/partners", "/funding",
    "/innovations", "/centers", "/outputs", "/events", "/news",
    "/expertise", "/team", "/about", "/connect", "/donate",
    "/farm", "/sustainability", "/impact-metrics", "/community-impact",
    "/consultancies", "/endowments", "/scholarships", "/training",
    "/mentorship", "/programs", "/facilities", "/guidelines",
    "/services", "/resources-tools", "/forms", "/capacity", "/search",
  ];
  return pages.map((path) => ({
    url: `${BASE}${path}`,
    lastModified: new Date(),
    changeFrequency: path === "/" ? "weekly" as const : "monthly" as const,
    priority: path === "/" ? 1 : path.startsWith("/news") || path.startsWith("/events") ? 0.8 : 0.6,
  }));
}
