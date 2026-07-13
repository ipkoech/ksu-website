import type { AxiosRequestConfig } from "axios";
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
export const SECTION_ITEM_TYPES = ["text", "card", "stat", "cta", "media", "video", "reference"] as const;
export const PAGE_CMS_SOURCE_TYPES = [
  "intake",
  "programme",
  "academic_calendar",
  "person",
  "staff_assignment",
  "research_project",
  "publication",
  "news",
  "event",
  "research_partner",
  "alumni",
  "testimonial",
  "public_stat",
  "club_activity",
] as const;
export const PAGE_CMS_CATALOG_SOURCE_TYPES = [
  "intake",
  "programme",
  "academic_calendar",
  "person",
  "staff_assignment",
  "research_project",
  "publication",
  "news",
  "event",
  "research_partner",
  "alumni",
  "testimonial",
  "public_stat",
  "club_activity",
] as const satisfies readonly PageCmsSourceType[];
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
export type PageCmsSourceType = (typeof PAGE_CMS_SOURCE_TYPES)[number];
export type PageCmsCatalogSourceType = (typeof PAGE_CMS_CATALOG_SOURCE_TYPES)[number];
export type PartnershipCtaSource = (typeof PARTNERSHIP_CTA_SOURCES)[number];
export type PageSectionWorkflowAction = (typeof PAGE_SECTION_WORKFLOW_ACTIONS)[number];
export type PartnershipSpotlightWorkflowAction = PageSectionWorkflowAction;
export type PageCmsMediaRole = (typeof PAGE_CMS_MEDIA_ROLES)[number];

export interface SectionItem {
  id: string;
  page_section_id: string;
  item_type: SectionItemType;
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
  source_type?: PageCmsSourceType | null;
  source_id?: string | null;
  editorial_overrides?: Record<string, unknown> | null;
  display_order: number;
  revision: number;
  is_enabled: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface SectionItemPayload {
  id?: string | null;
  revision?: number | null;
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
  source_type?: PageCmsSourceType | null;
  source_id?: string | null;
  editorial_overrides?: Record<string, unknown> | null;
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
  display_order: number;
  revision: number;
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

export interface PageCmsStats {
  draft_count: number;
  in_review_count: number;
  changes_requested_count: number;
  approved_count: number;
  scheduled_count: number;
  published_count: number;
  expired_count: number;
  validation_blocker_count: number;
  spotlight_count: number;
}

export interface PageCmsMediaRoleDefinition {
  label: string;
  media_type: string;
  required: boolean;
  multiple: boolean;
}

export interface PageCmsSectionDefinition {
  key: PageSectionLayoutVariant;
  label: string;
  description: string;
  allowed_scopes: PageScopeType[];
  min_items: number;
  max_items: number;
  allowed_item_types: SectionItemType[];
  allowed_source_types: PageCmsSourceType[];
  media_roles: Record<string, PageCmsMediaRoleDefinition>;
  settings_schema: Record<string, unknown>;
  required_fields: string[];
}

export type PageCmsSourceSummary = {
  id: string;
  source_type: PageCmsSourceType;
  label: string;
  secondary_label?: string | null;
  status: string;
  published_at?: string | null;
  thumbnail_url?: string | null;
  metadata: Record<string, unknown>;
  selectable: boolean;
};

export interface PageCmsSourceSearchParams {
  q?: string;
  scope_type: PageScopeType;
  scope_id?: string | null;
  layout_variant: PageSectionLayoutVariant;
  page?: number;
  per_page?: number;
}

export interface PageCmsValidationIssue {
  code: string;
  severity: "error" | "warning";
  section_id: string;
  item_id?: string | null;
  field?: string | null;
  message: string;
  blocking: boolean;
}

export interface PageCmsValidationResult {
  page_key: string;
  scope_type: PageScopeType;
  scope_id?: string | null;
  issues: PageCmsValidationIssue[];
}

export interface PagePreviewResolvedSource extends PageCmsSourceSummary {}

export interface PagePreviewMedia {
  id: string;
  filename: string;
  original_filename: string;
  mime_type: string;
  media_type: string;
  url: string;
  public_url?: string | null;
  cdn_url?: string | null;
  thumbnail_url?: string | null;
  alt_text?: string | null;
  title?: string | null;
  caption?: string | null;
  width?: number | null;
  height?: number | null;
  duration?: number | null;
}

export interface PagePreviewMediaLink {
  id: string;
  media_id: string;
  entity_type: string;
  entity_id: string;
  role: string;
  display_order: number;
  media: PagePreviewMedia;
}

export interface PagePreviewItem {
  id: string;
  page_section_id: string;
  item_type: string;
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
  source_type?: string | null;
  source_id?: string | null;
  editorial_overrides?: Record<string, unknown> | null;
  source?: PagePreviewResolvedSource | null;
  display_order: number;
  is_enabled: boolean;
}

export interface PagePreviewSection {
  id: string;
  page_key: string;
  scope_type: string;
  scope_id?: string | null;
  section_key: string;
  title?: string | null;
  subtitle?: string | null;
  description?: string | null;
  settings?: Record<string, unknown> | null;
  display_order: number;
  revision: number;
  is_enabled: boolean;
  layout_variant: string;
  status: string;
  workflow_status: string;
  valid_from?: string | null;
  valid_to?: string | null;
  approved_at?: string | null;
  published_at?: string | null;
  items: PagePreviewItem[];
  media: Record<string, PagePreviewMediaLink[]>;
}

export interface PageCmsPreview {
  page_key: string;
  scope_type: string;
  scope_id?: string | null;
  issues: PageCmsValidationIssue[];
  sections: PagePreviewSection[];
}

export interface PageCmsReorderEntry {
  id: string;
  display_order: number;
  revision: number;
}

export interface ReorderSectionsPayload {
  scope_type: PageScopeType;
  scope_id?: string | null;
  items: PageCmsReorderEntry[];
}

export interface ReorderItemsPayload {
  items: PageCmsReorderEntry[];
}

export const pageCmsApi = {
  getHomepage: (params?: PageCompositionParams) =>
    api.get<PageComposition>("/homepage", { params }),
  getPage: (pageKey: string, params?: PageCompositionParams, config?: AxiosRequestConfig) =>
    api.get<PageComposition>(`/pages/${pageKey}`, { ...config, params }),
  definitions: (config?: AxiosRequestConfig) =>
    api.get<PageCmsSectionDefinition[]>("/page-section-definitions", config),
  searchSources: (
    sourceType: PageCmsCatalogSourceType,
    params: PageCmsSourceSearchParams,
    config?: AxiosRequestConfig,
  ) =>
    api.get<PageCmsSourceSummary[]>(`/page-section-sources/${sourceType}`, { ...config, params }),
  previewPage: (pageKey: string, params: PageCompositionParams) =>
    api.get<PageCmsPreview>(`/pages/${pageKey}/preview`, { params }),
  validatePage: (pageKey: string, params: PageCompositionParams) =>
    api.get<PageCmsValidationResult>(`/pages/${pageKey}/validate`, { params }),
  reorderSections: (pageKey: string, data: ReorderSectionsPayload) =>
    api.patch<PageSection[]>(`/pages/${pageKey}/sections/reorder`, data),
  reorderItems: (sectionId: string, data: ReorderItemsPayload) =>
    api.patch<SectionItem[]>(`/page-sections/${sectionId}/items/reorder`, data),
};

export const pageCmsStatsApi = {
  get: () => api.get<PageCmsStats>("/stats/portal/cocms"),
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
