import type { MetadataRoute } from "next";

const BASE_URL = "https://kisiiuniversity.ac.ke";

const staticPages: MetadataRoute.Sitemap = [
  { url: "/", priority: 1, changeFrequency: "weekly" },
  { url: "/about", priority: 0.9, changeFrequency: "monthly" },
  { url: "/about/history", priority: 0.7, changeFrequency: "monthly" },
  { url: "/about/mission-vision", priority: 0.7, changeFrequency: "monthly" },
  { url: "/about/governance", priority: 0.7, changeFrequency: "monthly" },
  { url: "/about/university-management", priority: 0.7, changeFrequency: "monthly" },
  { url: "/about/quality-assurance", priority: 0.6, changeFrequency: "monthly" },
  { url: "/about/service-charter", priority: 0.6, changeFrequency: "monthly" },
  { url: "/about/strategic-plan", priority: 0.6, changeFrequency: "monthly" },
  { url: "/admissions", priority: 0.9, changeFrequency: "weekly" },
  { url: "/academics", priority: 0.9, changeFrequency: "monthly" },
  { url: "/academics/schools", priority: 0.8, changeFrequency: "monthly" },
  { url: "/academics/programmes", priority: 0.8, changeFrequency: "monthly" },
  { url: "/administration", priority: 0.8, changeFrequency: "monthly" },
  { url: "/campus-life", priority: 0.8, changeFrequency: "monthly" },
  { url: "/campus-life/clubs", priority: 0.6, changeFrequency: "monthly" },
  { url: "/campus-life/sports", priority: 0.6, changeFrequency: "monthly" },
  { url: "/campus-life/accommodation", priority: 0.6, changeFrequency: "monthly" },
  { url: "/campus-life/support", priority: 0.6, changeFrequency: "monthly" },
  { url: "/media/news", priority: 0.9, changeFrequency: "daily" },
  { url: "/media/events", priority: 0.9, changeFrequency: "daily" },
  { url: "/media/articles", priority: 0.7, changeFrequency: "weekly" },
  { url: "/media/announcements", priority: 0.8, changeFrequency: "daily" },
  { url: "/media/gallery", priority: 0.5, changeFrequency: "monthly" },
  { url: "/contact", priority: 0.8, changeFrequency: "monthly" },
  { url: "/search", priority: 0.6, changeFrequency: "monthly" },
  { url: "/help-desk", priority: 0.7, changeFrequency: "monthly" },
  { url: "/faq", priority: 0.7, changeFrequency: "monthly" },
  { url: "/downloads", priority: 0.7, changeFrequency: "monthly" },
  // /careers and /tenders permanently redirect to the external digital
  // portals and are intentionally excluded from the sitemap.
  { url: "/conferences", priority: 0.6, changeFrequency: "monthly" },
  { url: "/visitors", priority: 0.6, changeFrequency: "monthly" },
  { url: "/alumni", priority: 0.5, changeFrequency: "monthly" },
  { url: "/accessibility", priority: 0.5, changeFrequency: "monthly" },
  { url: "/privacy", priority: 0.5, changeFrequency: "monthly" },
  { url: "/terms", priority: 0.5, changeFrequency: "monthly" },
  { url: "/sitemap", priority: 0.4, changeFrequency: "monthly" },
  { url: "/az-index", priority: 0.4, changeFrequency: "monthly" },
];

export default function sitemap(): MetadataRoute.Sitemap {
  return staticPages.map((entry) => ({
    ...entry,
    url: `${BASE_URL}${entry.url}`,
    lastModified: new Date(),
  }));
}
