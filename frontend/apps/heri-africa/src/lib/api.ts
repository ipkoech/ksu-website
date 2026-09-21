export type SiteSettings = {
  name: string;
  tagline: string | null;
  contact: Record<string, unknown>;
  social_links: Record<string, unknown>;
  seo_defaults: Record<string, unknown>;
  research_center_slug: string | null;
};
export type ChairProfile = {
  id: string;
  name: string;
  acronym: string | null;
  host_institution: string;
  initiative_name: string;
  about: string;
  tagline: string | null;
  vision: string;
  mission: string;
  mandate: string;
  objectives: string;
  values: string[] | Record<string, unknown> | null;
  why_it_matters: string;
  logo_url: string | null;
  cover_image_url: string | null;
  seo: Record<string, unknown>;
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
  title?: string | null;
  expertise?: string[] | Record<string, unknown> | null;
  education?: string | null;
  research_interests?: string | null;
  email?: string | null;
  social_links?: Record<string, unknown> | null;
  is_featured?: boolean;
};
export type ResearchSummary = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  cover_image_url?: string | null;
  publication_date?: string | null;
  publication_type?: string | null;
  theme_id?: string | null;
  is_featured?: boolean;
  position?: number;
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
  event_type?: string | null;
  featured_image_url?: string | null;
  is_virtual?: boolean;
  virtual_url?: string | null;
  is_featured?: boolean;
  position?: number;
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

import { ApiClientError, ApiTransport } from "@ksu/api-client/transport";
import {
  getHeriPublicApiUrl,
} from "@ksu/api-client/service-urls";

const API_PREFIX = "/api/v1/heri";

// Accepts both bare gateway origins (http://gateway) and full base URLs so a
// misconfigured env var cannot silently 404 every server-side fetch.
function normalizeBase(base: string): string {
  const trimmed = base.replace(/\/+$/, "");
  return trimmed.endsWith(API_PREFIX) ? trimmed : `${trimmed}${API_PREFIX}`;
}

const configuredApiBase =
  typeof window === "undefined"
    ? process.env.KSU_HERI_API_URL ?? process.env.NEXT_PUBLIC_HERI_API_URL
    : getHeriPublicApiUrl();
const apiBase = normalizeBase(configuredApiBase ?? "http://localhost:8080");

/**
 * Generate a stable command key even in browsers that do not expose
 * crypto.randomUUID (or expose it with an incompatible receiver).
 */
export function createHeriIdempotencyKey(): string {
  const randomUUID = globalThis.crypto?.randomUUID;
  if (randomUUID) {
    try {
      return randomUUID.call(globalThis.crypto);
    } catch {
      // Fall through to the portable entropy fallback below.
    }
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}-${Math.random()
    .toString(36)
    .slice(2)}`;
}

type HeriPayloadShape = "object" | "list";

export function validateHeriPayload<T>(
  value: unknown,
  path: string,
  shape: HeriPayloadShape,
): T {
  const valid = shape === "list"
    ? Array.isArray(value)
    : Boolean(value) && typeof value === "object" && !Array.isArray(value);
  if (!valid) {
    throw new ApiClientError(
      `HERI endpoint ${path} returned an invalid ${shape} payload`,
      502,
      undefined,
      "INVALID_RESPONSE",
    );
  }
  return value as T;
}

async function get<T>(path: string, shape: HeriPayloadShape = "object"): Promise<T> {
  const value = await new ApiTransport({
    baseUrl: apiBase,
    credentials: "omit",
    runtime: typeof window === "undefined" ? "server" : "browser",
  }).get<T>(path, undefined, {
    auth: "none",
    timeoutMs: 5000,
    next: { revalidate: 300 },
  });
  return validateHeriPayload<T>(value, path, shape);
}

export async function getSite(): Promise<SiteSettings> {
  return get<SiteSettings>("/site");
}
export async function getChair(): Promise<ChairProfile> {
  return get<ChairProfile>("/chair");
}

export async function getNews(): Promise<NewsSummary[]> {
  return get<NewsSummary[]>("/news?limit=24", "list");
}
export async function getNewsDetail(slug: string): Promise<NewsDetail> {
  return get<NewsDetail>(`/news/${encodeURIComponent(slug)}`);
}

export async function getCenterPartners(
  centerId: string,
): Promise<PartnerSummary[]> {
  return get<PartnerSummary[]>(
    `/centers/${encodeURIComponent(centerId)}/partners?limit=50`,
    "list",
  );
}

export async function getTeam(): Promise<TeamSummary[]> {
  return get<TeamSummary[]>("/team?limit=24", "list");
}
export async function getTeamMember(slug: string): Promise<TeamSummary> {
  return get<TeamSummary>(`/team/${encodeURIComponent(slug)}`);
}
export async function getProjects(): Promise<ResearchSummary[]> {
  return get<ResearchSummary[]>("/research/projects?limit=24", "list");
}
export async function getPublications(): Promise<ResearchSummary[]> {
  return get<ResearchSummary[]>("/research/publications?limit=24", "list");
}
export async function getPartners(
  centerId?: string,
  centerSlug?: string,
): Promise<PartnerSummary[]> {
  const query = centerId
    ? `&center_id=${encodeURIComponent(centerId)}`
    : centerSlug
      ? `&center_slug=${encodeURIComponent(centerSlug)}`
      : "";
  return get<PartnerSummary[]>(`/partners?limit=50${query}`, "list");
}
export async function getEvents(): Promise<EventSummary[]> {
  return get<EventSummary[]>("/events?limit=24", "list");
}
export type OpportunitySummary = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  application_url: string | null;
  closing_at: string | null;
  description?: string;
  eligibility?: string;
  application_instructions?: string;
  opportunity_type?: string | null;
  featured_image_url?: string | null;
  is_featured?: boolean;
  position?: number;
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
  return get<OpportunitySummary[]>("/opportunities?limit=24", "list");
}
export async function getResearchThemes(): Promise<ResearchSummary[]> {
  return get<ResearchSummary[]>("/research/themes?limit=24", "list");
}
export async function getImpactMetrics(): Promise<ImpactMetricSummary[]> {
  return get<ImpactMetricSummary[]>("/impact-metrics", "list");
}
export async function getHeroSlides(): Promise<HeroSlide[]> {
  return get<HeroSlide[]>("/hero-slides", "list");
}

export async function submitContact(
  payload: Record<string, unknown>,
  idempotencyKey = createHeriIdempotencyKey(),
  signal?: AbortSignal,
): Promise<{ status: string; message: string }> {
  return new ApiTransport({
    baseUrl: apiBase,
    credentials: "omit",
    runtime: "browser",
  }).post("/contact", payload, {
    auth: "none",
    headers: { "Idempotency-Key": idempotencyKey },
    signal,
  });
}
