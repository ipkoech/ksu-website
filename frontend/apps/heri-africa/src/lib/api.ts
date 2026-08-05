export type SiteSettings = {
  name: string;
  tagline: string | null;
  contact: Record<string, unknown>;
  social_links: Record<string, unknown>;
  seo_defaults: Record<string, unknown>;
  research_center_slug: string | null;
};

export type NewsSummary = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  published_at: string | null;
};
export type NewsDetail = NewsSummary & {
  body: string;
  featured_image_url: string | null;
};

export type TeamSummary = {
  id: string;
  slug: string;
  name: string;
  role: string;
  biography: string;
  photo_url: string | null;
};
export type ResearchSummary = {
  id: string;
  slug: string;
  title: string;
  summary: string;
};
export type PartnerSummary = {
  id: string;
  slug: string;
  name: string;
  description: string;
  logo_url: string | null;
  website_url: string | null;
  country: string | null;
};
export type EventSummary = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  starts_at: string | null;
  ends_at: string | null;
  location: string | null;
};
export type HeroSlide = {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  image_url: string;
  mobile_image_url: string | null;
  button_label: string;
  button_href: string;
  position: number;
  is_active: boolean;
};

const API_PREFIX = "/api/v1/heri";

// Accepts both bare origins (http://heri:8003) and full base URLs so a
// misconfigured env var cannot silently 404 every server-side fetch.
function normalizeBase(base: string): string {
  const trimmed = base.replace(/\/+$/, "");
  return trimmed.endsWith(API_PREFIX) ? trimmed : `${trimmed}${API_PREFIX}`;
}

const apiBase = normalizeBase(
  (typeof window === "undefined"
    ? process.env.KSU_HERI_API_URL
    : process.env.NEXT_PUBLIC_HERI_API_URL) ?? "http://localhost:8003",
);

async function get<T>(path: string): Promise<T> {
  const response = await fetch(`${apiBase}${path}`, {
    next: { revalidate: 300 },
    signal: AbortSignal.timeout(5000),
  });
  if (!response.ok)
    throw new Error(`HERI API request failed: ${response.status}`);
  return response.json() as Promise<T>;
}

export async function getSite(): Promise<SiteSettings> {
  return get<SiteSettings>("/site");
}

export async function getNews(): Promise<NewsSummary[]> {
  return get<NewsSummary[]>("/news?limit=24");
}
export async function getNewsDetail(slug: string): Promise<NewsDetail> {
  return get<NewsDetail>(`/news/${encodeURIComponent(slug)}`);
}

export async function getCenterPartners(centerId: string): Promise<PartnerSummary[]> {
  return get<PartnerSummary[]>(`/centers/${encodeURIComponent(centerId)}/partners?limit=50`);
}

export async function getTeam(): Promise<TeamSummary[]> {
  return get<TeamSummary[]>("/team?limit=24");
}
export async function getTeamMember(slug: string): Promise<TeamSummary> {
  return get<TeamSummary>(`/team/${encodeURIComponent(slug)}`);
}
export async function getProjects(): Promise<ResearchSummary[]> {
  return get<ResearchSummary[]>("/research/projects?limit=24");
}
export async function getPublications(): Promise<ResearchSummary[]> {
  return get<ResearchSummary[]>("/research/publications?limit=24");
}
export async function getPartners(centerId?: string, centerSlug?: string): Promise<PartnerSummary[]> {
  const query = centerId ? `&center_id=${encodeURIComponent(centerId)}` : centerSlug ? `&center_slug=${encodeURIComponent(centerSlug)}` : "";
  return get<PartnerSummary[]>(`/partners?limit=50${query}`);
}
export async function getEvents(): Promise<EventSummary[]> {
  return get<EventSummary[]>("/events?limit=24");
}
export type OpportunitySummary = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  application_url: string | null;
  closing_at: string | null;
};
export type ImpactMetricSummary = {
  id: string;
  label: string;
  value: string;
  unit: string | null;
  description: string;
  position: number;
};
export async function getOpportunities(): Promise<OpportunitySummary[]> {
  return get<OpportunitySummary[]>("/opportunities?limit=24");
}
export async function getResearchThemes(): Promise<ResearchSummary[]> {
  return get<ResearchSummary[]>("/research/themes?limit=24");
}
export async function getImpactMetrics(): Promise<ImpactMetricSummary[]> {
  return get<ImpactMetricSummary[]>("/impact-metrics");
}
export async function getHeroSlides(): Promise<HeroSlide[]> {
  return get<HeroSlide[]>("/hero-slides");
}

export async function submitContact(
  payload: Record<string, unknown>,
): Promise<{ status: string; message: string }> {
  const response = await fetch(`${apiBase}/contact`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.detail ?? "Unable to submit enquiry");
  return data;
}
