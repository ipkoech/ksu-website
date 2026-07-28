import api, { type ListParams } from "./client";

export const PAGE_SCOPE_TYPES = ["university", "school", "research", "library"] as const;
export const PAGE_SECTION_STATUSES = [
  "draft",
  "in_review",
  "changes_requested",
  "approved",
  "published",
  "archived",
] as const;
export const PAGE_SECTION_LAYOUT_VARIANTS = [
  "hero_admissions",
  "pulse_strip",
  "featured_partnership",
  "programme_finder",
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
export const SECTION_ITEM_TYPES = ["text", "card", "stat", "cta", "media", "video"] as const;
export const LIFE_AROUND_STUDIES_AUDIENCES = ["all", "prospective", "current_student", "visitor_partner"] as const;
export const LIFE_AROUND_STUDIES_SOURCE_TYPES = [
  "manual",
  "club",
  "club_activity",
  "sport",
  "accommodation",
  "arts",
  "governance",
  "story",
  "event",
] as const;
export const PARTNERSHIP_CTA_SOURCES = [
  "manual",
  "partner_website",
  "generated_detail_page",
] as const;
export const PAGE_SECTION_WORKFLOW_ACTIONS = [
  "submit",
  "approve",
  "request_changes",
  "publish",
  "archive",
  "unpublish",
] as const;
export const PAGE_CMS_MEDIA_ROLES = [
  "hero_image",
  "mobile_image",
  "logo",
  "signing_photo",
  "gallery",
  "video",
  "background",
  "poster",
] as const;

export type PageScopeType = (typeof PAGE_SCOPE_TYPES)[number];
export type PageSectionStatus = (typeof PAGE_SECTION_STATUSES)[number];
export type PageSectionLayoutVariant = (typeof PAGE_SECTION_LAYOUT_VARIANTS)[number];
export type SectionItemType = (typeof SECTION_ITEM_TYPES)[number];
export type PartnershipCtaSource = (typeof PARTNERSHIP_CTA_SOURCES)[number];
export type PageSectionWorkflowAction = (typeof PAGE_SECTION_WORKFLOW_ACTIONS)[number];
export type PartnershipSpotlightWorkflowAction = PageSectionWorkflowAction;
export type PageCmsMediaRole = (typeof PAGE_CMS_MEDIA_ROLES)[number];
export type LifeAroundStudiesAudience = (typeof LIFE_AROUND_STUDIES_AUDIENCES)[number];
export type LifeAroundStudiesSourceType = (typeof LIFE_AROUND_STUDIES_SOURCE_TYPES)[number];

export interface SectionItem {
  id: string;
  page_section_id: string;
  item_type: SectionItemType;
  title?: string | null;
  subtitle?: string | null;
  body_text?: string | null;
  content?: Record<string, unknown> | null;
  content_enriched?: {
    linked_content?: {
      id: string;
      type: "news" | "event";
      title: string;
      slug?: string | null;
      summary?: string | null;
      status?: string | null;
      is_published?: boolean | null;
      published_at?: string | null;
      start_date?: string | null;
      href?: string | null;
    } | null;
  } | null;
  cta_label?: string | null;
  cta_url?: string | null;
  cta_description?: string | null;
  media_caption?: string | null;
  media_alt_text?: string | null;
  video_provider?: string | null;
  video_url?: string | null;
  video_duration_seconds?: number | null;
  audience?: LifeAroundStudiesAudience;
  source_type?: LifeAroundStudiesSourceType | null;
  source_id?: string | null;
  is_featured?: boolean;
  poster_media_id?: string | null;
  transcript?: string | null;
  display_order: number;
  is_enabled: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface SectionItemPayload {
  page_section_id?: string | null;
  item_type?: SectionItemType;
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
  audience?: LifeAroundStudiesAudience;
  source_type?: LifeAroundStudiesSourceType | null;
  source_id?: string | null;
  is_featured?: boolean;
  poster_media_id?: string | null;
  transcript?: string | null;
  display_order?: number;
  is_enabled?: boolean;
}

export interface PageSection {
  id: string;
  page_key: string;
  scope_type: PageScopeType;
  scope_id?: string | null;
  section_key: string;
  title?: string | null;
  subtitle?: string | null;
  description?: string | null;
  settings?: Record<string, unknown> | null;
  settings_enriched?: {
    staff_profile?: {
      id: string;
      title?: string | null;
      full_name?: string | null;
      display_name?: string | null;
      email?: string | null;
      institutional_role?: string | null;
      photo_id?: string | null;
      photo_url?: string | null;
    } | null;
  } | null;
  display_order: number;
  is_enabled: boolean;
  layout_variant: PageSectionLayoutVariant;
  status: PageSectionStatus;
  valid_from?: string | null;
  valid_to?: string | null;
  approved_at?: string | null;
  published_at?: string | null;
  created_at?: string;
  updated_at?: string;
  items: SectionItem[];
}

export interface PageSectionPayload {
  page_key?: string;
  scope_type?: PageScopeType;
  scope_id?: string | null;
  section_key?: string;
  title?: string | null;
  subtitle?: string | null;
  description?: string | null;
  settings?: Record<string, unknown> | null;
  display_order?: number;
  is_enabled?: boolean;
  layout_variant?: PageSectionLayoutVariant;
  valid_from?: string | null;
  valid_to?: string | null;
  items?: SectionItemPayload[];
}

export interface PageSectionListParams extends ListParams {
  page_key?: string;
  scope_type?: PageScopeType;
  scope_id?: string;
}

export interface PartnershipSpotlight {
  id: string;
  source_type: "research_partner";
  source_id: string;
  primary_cta_source: PartnershipCtaSource;
  primary_cta_label?: string | null;
  primary_cta_url?: string | null;
  headline: string;
  summary?: string | null;
  pillars?: Record<string, unknown>[] | null;
  opportunities?: Record<string, unknown>[] | null;
  is_enabled: boolean;
  status: string;
  valid_from?: string | null;
  valid_to?: string | null;
  approved_at?: string | null;
  published_at?: string | null;
  media?: Record<string, unknown>;
}

export interface PartnershipSpotlightPayload {
  source_type?: "research_partner";
  source_id?: string;
  primary_cta_source?: PartnershipCtaSource;
  primary_cta_label?: string | null;
  primary_cta_url?: string | null;
  headline?: string;
  summary?: string | null;
  pillars?: Record<string, unknown>[] | null;
  opportunities?: Record<string, unknown>[] | null;
  is_enabled?: boolean;
  valid_from?: string | null;
  valid_to?: string | null;
}

export interface PageComposition {
  page_key?: string;
  scope_type?: string;
  scope_id?: string | null;
  sections: PageSection[];
  partnership_spotlights: PartnershipSpotlight[];
}

export interface PageCompositionParams {
  scope_type?: PageScopeType;
  scope_id?: string;
}

export const pageCmsApi = {
  getHomepage: (params?: PageCompositionParams) =>
    api.get<PageComposition>("/homepage", { params }),
  getPage: (pageKey: string, params?: PageCompositionParams) =>
    api.get<PageComposition>(`/pages/${pageKey}`, { params }),
};

export const pageSectionsApi = {
  listAdmin: (params?: PageSectionListParams) =>
    api.get<PageSection[]>("/page-sections/admin", { params }),
  get: (sectionId: string) =>
    api.get<PageSection>(`/page-sections/${sectionId}`),
  create: (data: PageSectionPayload) =>
    api.post<PageSection>("/page-sections", data),
  update: (sectionId: string, data: PageSectionPayload) =>
    api.patch<PageSection>(`/page-sections/${sectionId}`, data),
  workflow: (sectionId: string, action: PageSectionWorkflowAction) =>
    api.post<PageSection>(`/page-sections/${sectionId}/${action}`),
  archive: (sectionId: string) =>
    api.post<PageSection>(`/page-sections/${sectionId}/archive`),
};

export const sectionItemsApi = {
  create: (sectionId: string, data: SectionItemPayload) =>
    api.post<SectionItem>(`/page-sections/${sectionId}/items`, data),
  update: (itemId: string, data: SectionItemPayload) =>
    api.patch<SectionItem>(`/section-items/${itemId}`, data),
  disable: (itemId: string) =>
    api.patch<SectionItem>(`/section-items/${itemId}`, { is_enabled: false }),
};

export const partnershipSpotlightsApi = {
  listAdmin: (params?: ListParams) =>
    api.get<PartnershipSpotlight[]>("/partnership-spotlights/admin", { params }),
  get: (spotlightId: string) =>
    api.get<PartnershipSpotlight>(`/partnership-spotlights/${spotlightId}`),
  create: (data: PartnershipSpotlightPayload) =>
    api.post<PartnershipSpotlight>("/partnership-spotlights", data),
  update: (spotlightId: string, data: PartnershipSpotlightPayload) =>
    api.patch<PartnershipSpotlight>(`/partnership-spotlights/${spotlightId}`, data),
  workflow: (spotlightId: string, action: PartnershipSpotlightWorkflowAction) =>
    api.post<PartnershipSpotlight>(`/partnership-spotlights/${spotlightId}/${action}`),
  disable: (spotlightId: string) =>
    api.patch<PartnershipSpotlight>(`/partnership-spotlights/${spotlightId}`, {
      is_enabled: false,
    }),
};
