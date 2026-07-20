import { cache } from "react";
import { mainApi, resolveMainMediaUrl } from "@ksu/api-client";

export const HOMEPAGE_SECTION_LAYOUT_VARIANTS = [
  "hero_admissions",
  "pulse_strip",
  "featured_partnership",
  "programme_finder",
  "featured_stories",
  "date_timeline",
  "pillar_grid",
  "media_mosaic",
  "leadership_activity",
  "research_cards",
  "news_grid",
  "events_list",
  "logo_carousel",
  "alumni_story",
  "facts_strip",
] as const;

export type HomepageSectionLayoutVariant =
  (typeof HOMEPAGE_SECTION_LAYOUT_VARIANTS)[number];

export const HOMEPAGE_MEDIA_ROLES = [
  "heroImage",
  "mobileImage",
  "logos",
  "gallery",
  "video",
  "background",
  "poster",
] as const;

export type HomepageMediaRole = (typeof HOMEPAGE_MEDIA_ROLES)[number];

export type HomepageMedia = {
  id?: string;
  media_id?: string;
  role?: string;
  display_order?: number;
  media?: {
    id?: string;
    filename?: string | null;
    original_filename?: string | null;
    mime_type?: string | null;
    media_type?: string | null;
    url?: string | null;
    public_url?: string | null;
    cdn_url?: string | null;
    thumbnail_url?: string | null;
    alt_text?: string | null;
    title?: string | null;
    caption?: string | null;
    width?: number | null;
    height?: number | null;
    duration?: number | null;
  } | null;
};

export type HomepageMediaGroups = Record<HomepageMediaRole, HomepageMedia[]>;

export type HomepageSectionItem = {
  id: string;
  page_section_id?: string;
  item_type?: string | null;
  title?: string | null;
  subtitle?: string | null;
  body_text?: string | null;
  content?: Record<string, unknown> | null;
  cta_label?: string | null;
  cta_url?: string | null;
  cta_description?: string | null;
  media_caption?: string | null;
  media_alt_text?: string | null;
  video_provider?: string | null;
  video_url?: string | null;
  video_duration_seconds?: number | null;
  display_order?: number;
  is_enabled?: boolean;
  content_enriched?: {
    linked_content?: {
      id?: string;
      type?: "news" | "blog" | "event";
      title?: string;
      slug?: string;
      summary?: string | null;
      status?: string | null;
      is_published?: boolean | null;
      published_at?: string | null;
      start_date?: string | null;
      href?: string | null;
      featured_media?: HomepageMedia["media"] | null;
    } | null;
    research_partner?: {
      id?: string | null;
      name?: string | null;
      acronym?: string | null;
      slug?: string | null;
      website?: string | null;
      logo_url?: string | null;
      partner_type?: string | null;
      country?: string | null;
    } | null;
  } | null;
};

export type HomepageSection = {
  id: string;
  page_key: string;
  scope_type: string;
  scope_id?: string | null;
  section_key: string;
  title?: string | null;
  subtitle?: string | null;
  description?: string | null;
  settings?: Record<string, unknown> | null;
  settings_enriched?: {
    staff_profile?: {
      id?: string;
      title?: string | null;
      full_name?: string | null;
      display_name?: string | null;
      email?: string | null;
      institutional_role?: string | null;
      leadership_message?: string | null;
      photo_id?: string | null;
      photo_url?: string | null;
      profile_href?: string | null;
    } | null;
  } | null;
  display_order?: number;
  is_enabled?: boolean;
  layout_variant: string;
  status?: string;
  items?: HomepageSectionItem[];
  media?: Partial<HomepageMediaGroups> | null;
};

export type HomepagePartnershipSpotlight = {
  id: string;
  source_type: "research_partner";
  source_id: string;
  primary_cta_source?: string;
  primary_cta_label?: string | null;
  primary_cta_url?: string | null;
  headline: string;
  summary?: string | null;
  pillars?: Array<Record<string, unknown>> | null;
  opportunities?: Array<Record<string, unknown>> | null;
  primary_cta?: {
    label?: string | null;
    href?: string | null;
  } | null;
  media?: Partial<HomepageMediaGroups> | null;
};

export type HomepageHeroAction = {
  key?: string | null;
  type?: string | null;
  label: string;
  href: string;
  style?: "primary" | "secondary" | null;
  open_in_new_tab?: boolean;
};

export type HomepageHeroContent = {
  eyebrow?: string | null;
  headline?: string | null;
  highlight?: string | null;
  description?: string | null;
  actions?: HomepageHeroAction[];
};

export type HomepageHeroAdmissions = {
  state: "applications_open" | "admission_letters_available" | "hidden";
  visible: boolean;
  intake?: {
    id?: string | null;
    name?: string | null;
    slug?: string | null;
  } | null;
  application_phase?: "standard" | "late" | null;
  closing_at?: string | null;
  countdown_target?: string | null;
  reporting?: {
    title?: string | null;
    starts_at?: string | null;
    location?: string | null;
    instructions_url?: string | null;
  } | null;
  primary_action?: HomepageHeroAction | null;
  secondary_actions?: HomepageHeroAction[];
};

export type HomepageResolvedHero = {
  content?: HomepageHeroContent | null;
  media?: {
    desktop?: HomepageMedia | null;
    mobile?: HomepageMedia | null;
    video?: HomepageMedia | null;
    poster?: HomepageMedia | null;
    focal_point?: Record<string, unknown> | null;
  } | null;
  admissions: HomepageHeroAdmissions;
  facts?: Array<Record<string, unknown>>;
};

export type HomepageCompositionResponse = {
  page_key: string;
  scope_type: string;
  scope_id?: string | null;
  resolved_at?: string | null;
  hero?: HomepageResolvedHero | null;
  sections: HomepageSection[];
  partnership_spotlights: HomepagePartnershipSpotlight[];
};

export type HomepageCompositionEnvelope = {
  success?: boolean;
  data?: HomepageCompositionResponse | null;
  meta?: unknown;
  message?: string | null;
};

export type HomepageCompositionApiResponse =
  | HomepageCompositionResponse
  | HomepageCompositionEnvelope;

export type HomepageCompositionState = {
  data: HomepageCompositionResponse | null;
  sections: HomepageSection[];
  hasRenderableSections: boolean;
  error: unknown;
};

export const getComposedHomepage = cache(
  async (): Promise<HomepageCompositionState> => {
    try {
      const response =
        await mainApi.get<HomepageCompositionApiResponse>("/api/v1/homepage");
      const composition = unwrapHomepageCompositionResponse(response);
      if (!composition) {
        return {
          data: null,
          sections: [],
          hasRenderableSections: false,
          error: null,
        };
      }

      const sections = normalizeSections(composition.sections);
      return {
        data: { ...composition, sections },
        sections,
        hasRenderableSections: sections.length > 0,
        error: null,
      };
    } catch (error) {
      if (!isAbortError(error)) {
        console.warn("Failed to load composed homepage", error);
      }
      return {
        data: null,
        sections: [],
        hasRenderableSections: false,
        error,
      };
    }
  },
);

export function unwrapHomepageCompositionResponse(
  response: HomepageCompositionApiResponse,
): HomepageCompositionResponse | null {
  if (isHomepageCompositionResponse(response)) {
    return response;
  }
  if (response.data && isHomepageCompositionResponse(response.data)) {
    return response.data;
  }
  return null;
}

export function isKnownHomepageLayoutVariant(
  value: string,
): value is HomepageSectionLayoutVariant {
  return HOMEPAGE_SECTION_LAYOUT_VARIANTS.includes(
    value as HomepageSectionLayoutVariant,
  );
}

export function sectionMedia(
  section: HomepageSection | HomepagePartnershipSpotlight,
  role: HomepageMediaRole,
): HomepageMedia[] {
  return section.media?.[role] ?? [];
}

export function heroImage(
  section: HomepageSection | HomepagePartnershipSpotlight,
) {
  return sectionMedia(section, "heroImage")[0] ?? null;
}

export function mobileImage(
  section: HomepageSection | HomepagePartnershipSpotlight,
) {
  return sectionMedia(section, "mobileImage")[0] ?? null;
}

export function logos(section: HomepageSection | HomepagePartnershipSpotlight) {
  return sectionMedia(section, "logos");
}

export function gallery(
  section: HomepageSection | HomepagePartnershipSpotlight,
) {
  return sectionMedia(section, "gallery");
}

export function video(section: HomepageSection | HomepagePartnershipSpotlight) {
  return sectionMedia(section, "video")[0] ?? null;
}

export function background(
  section: HomepageSection | HomepagePartnershipSpotlight,
) {
  return sectionMedia(section, "background")[0] ?? null;
}

export function poster(
  section: HomepageSection | HomepagePartnershipSpotlight,
) {
  return sectionMedia(section, "poster")[0] ?? null;
}

export function mediaUrl(media?: HomepageMedia | null): string | undefined {
  const value =
    media?.media?.cdn_url ??
    media?.media?.public_url ??
    media?.media?.url ??
    media?.media?.thumbnail_url;
  return resolveMainMediaUrl(value);
}

export function mediaAlt(
  media: HomepageMedia | null | undefined,
  fallback: string,
) {
  return media?.media?.alt_text || media?.media?.title || fallback;
}

function normalizeSections(sections: HomepageSection[] | undefined) {
  return (sections ?? [])
    .filter((section) => {
      const hasCopy = Boolean(
        section.title || section.subtitle || section.description,
      );
      const hasItems = Boolean(section.items?.length);
      const hasMedia = HOMEPAGE_MEDIA_ROLES.some(
        (role) => (section.media?.[role]?.length ?? 0) > 0,
      );
      return (
        section.is_enabled !== false &&
        isKnownHomepageLayoutVariant(section.layout_variant) &&
        (hasCopy || hasItems || hasMedia)
      );
    })
    .sort(
      (first, second) =>
        (first.display_order ?? 100) - (second.display_order ?? 100),
    );
}

function isHomepageCompositionResponse(
  value: HomepageCompositionApiResponse | null | undefined,
): value is HomepageCompositionResponse {
  return (
    value !== null &&
    value !== undefined &&
    typeof value === "object" &&
    "page_key" in value &&
    "scope_type" in value &&
    Array.isArray((value as HomepageCompositionResponse).sections) &&
    Array.isArray((value as HomepageCompositionResponse).partnership_spotlights)
  );
}

function isAbortError(error: unknown) {
  return (
    (error instanceof DOMException && error.name === "AbortError") ||
    (error instanceof Error && error.name === "AbortError")
  );
}
