import type { MetadataRoute } from "next";
import { researchSiteUrl } from "../config/institution";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = [
    "/", "/projects", "/publications", "/partners", "/partners/how-to-partner", "/partners/stories", "/funding",
    "/innovations", "/startups", "/incubation", "/competitions", "/technology-transfer", "/centers", "/outputs", "/events", "/news",
    "/expertise", "/team", "/about", "/connect", "/donate",
    "/farm", "/sustainability", "/impact-metrics", "/community-impact",
    "/consultancies", "/endowments", "/scholarships", "/training",
    "/mentorship", "/programs", "/facilities", "/guidelines",
    "/services", "/resources-tools", "/forms", "/capacity", "/search",
    "/privacy", "/terms", "/sitemap",
  ];
  return pages.map((path) => ({
    url: `${researchSiteUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: path === "/" ? "weekly" as const : "monthly" as const,
    priority: path === "/" ? 1 : path.startsWith("/news") || path.startsWith("/events") ? 0.8 : 0.6,
  }));
}
