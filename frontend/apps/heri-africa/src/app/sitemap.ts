import type { MetadataRoute } from "next";
import { getNews, getTeam } from "../lib/api";

const origin = "https://kisiiuniversity.ac.ke";
const base = `${origin}${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}`;

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${base}/`, priority: 1 },
    { url: `${base}/about`, priority: 0.9 },
    { url: `${base}/our-work`, priority: 0.9 },
    { url: `${base}/partner-with-us`, priority: 0.9 },
    { url: `${base}/team`, priority: 0.8 },
    { url: `${base}/news-insights`, priority: 0.8 },
    { url: `${base}/partners`, priority: 0.6 },
    { url: `${base}/events`, priority: 0.6 },
    { url: `${base}/research/projects`, priority: 0.6 },
    { url: `${base}/research/publications`, priority: 0.6 },
    { url: `${base}/privacy`, priority: 0.2 },
    { url: `${base}/accessibility`, priority: 0.2 },
  ];

  const [news, team] = await Promise.all([
    getNews().catch(() => []),
    getTeam().catch(() => []),
  ]);

  return [
    ...staticRoutes,
    ...news.map((item) => ({
      url: `${base}/news-insights/${item.slug}`,
      lastModified: item.published_at ?? undefined,
      priority: 0.7,
    })),
    ...team.map((member) => ({
      url: `${base}/team/${member.slug}`,
      priority: 0.5,
    })),
  ];
}
