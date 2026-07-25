import api from "./client";

export const ABOUT_WORKFLOW_STATUSES = [
  "draft",
  "in_review",
  "changes_requested",
  "approved",
  "published",
  "archived",
] as const;

export const ABOUT_WORKFLOW_ACTIONS = [
  "submit",
  "request_changes",
  "approve",
  "publish",
  "unpublish",
  "archive",
] as const;

export type AboutWorkflowStatus = (typeof ABOUT_WORKFLOW_STATUSES)[number];
export type AboutWorkflowAction = (typeof ABOUT_WORKFLOW_ACTIONS)[number];
export type AboutWorkflowKind =
  | "about" | "milestone" | "edition" | "group" | "item"
  | "institutional_page" | "institutional_section" | "institutional_item";

interface EditorialRecord {
  id: string;
  status: AboutWorkflowStatus;
  workflow_status: AboutWorkflowStatus;
  is_enabled: boolean;
  published_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface AboutPageContent extends EditorialRecord {
  university_info_id: string;
  hero_eyebrow?: string | null;
  hero_headline?: string | null;
  hero_introduction?: string | null;
  identity_heading?: string | null;
  identity_narrative?: string | null;
  mandate_introduction?: string | null;
  video_title?: string | null;
  video_url?: string | null;
  video_transcript_url?: string | null;
  virtual_tour_type?: "embed" | "video" | null;
  virtual_tour_title?: string | null;
  virtual_tour_provider?: string | null;
  virtual_tour_url?: string | null;
  virtual_tour_accessibility_url?: string | null;
  hero_media_id?: string | null;
  identity_media_id?: string | null;
  video_poster_media_id?: string | null;
  virtual_tour_media_id?: string | null;
  virtual_tour_poster_media_id?: string | null;
  old_campus_media_id?: string | null;
  modern_campus_media_id?: string | null;
  history_document_id?: string | null;
  section_settings?: Record<string, unknown> | null;
}

export type AboutPageContentPayload = Omit<
  AboutPageContent,
  keyof EditorialRecord | "id" | "section_settings"
> & {
  university_info_id?: string | null;
  is_enabled?: boolean;
  section_settings?: Record<string, unknown> | null;
};

export interface HistoryMilestone extends EditorialRecord {
  about_page_content_id: string;
  slug: string;
  year_label: string;
  event_date?: string | null;
  title: string;
  summary: string;
  expanded_body?: string | null;
  image_id?: string | null;
  image_alt_text?: string | null;
  source_title?: string | null;
  source_url?: string | null;
  source_document_id?: string | null;
  display_order: number;
  is_featured: boolean;
  is_public: boolean;
}

export type HistoryMilestonePayload = Omit<
  HistoryMilestone,
  keyof EditorialRecord | "id"
> & { is_enabled?: boolean };

export interface FactEdition extends EditorialRecord {
  reporting_year: number;
  title: string;
  introduction?: string | null;
  methodology_note?: string | null;
  verified_on?: string | null;
  source_document_id?: string | null;
  is_current: boolean;
}

export type FactEditionPayload = Omit<FactEdition, keyof EditorialRecord | "id"> & {
  is_enabled?: boolean;
};

export interface FactGroup extends EditorialRecord {
  fact_edition_id?: string | null;
  slug: string;
  heading: string;
  summary?: string | null;
  image_id?: string | null;
  image_alt_text?: string | null;
  display_order: number;
}

export type FactGroupPayload = Omit<FactGroup, keyof EditorialRecord | "id"> & {
  is_enabled?: boolean;
};

export interface FactItem extends EditorialRecord {
  fact_group_id: string;
  fact_kind: "evergreen" | "annual";
  label: string;
  display_value: string;
  numeric_value?: number | string | null;
  prefix?: string | null;
  suffix?: string | null;
  unit?: string | null;
  explanation?: string | null;
  icon_key?: string | null;
  link_url?: string | null;
  link_label?: string | null;
  source_title?: string | null;
  source_url?: string | null;
  verified_on?: string | null;
  display_order: number;
  is_featured: boolean;
}

export type FactItemPayload = Omit<FactItem, keyof EditorialRecord | "id"> & {
  is_enabled?: boolean;
};

export type InstitutionalPageType = "about" | "service_charter" | "strategic_plan";
export type InstitutionalSectionType = "narrative" | "commitments" | "process" | "priorities" | "outcomes" | "quote" | "document_collection" | "related_links" | "governance_links" | "institutional_profile";
export type InstitutionalSectionTheme = "light" | "ivory" | "blue" | "green";

export interface InstitutionalPage extends EditorialRecord {
  university_info_id: string;
  page_type: InstitutionalPageType;
  slug: string;
  eyebrow?: string | null;
  title: string;
  introduction: string;
  hero_media_id?: string | null;
  mobile_hero_media_id?: string | null;
  hero_alt_text?: string | null;
  primary_document_id?: string | null;
  reporting_period_label?: string | null;
  effective_date?: string | null;
  review_date?: string | null;
  seo_title?: string | null;
  seo_description?: string | null;
}

export type InstitutionalPagePayload = Partial<Omit<InstitutionalPage, keyof EditorialRecord | "id" | "slug" | "page_type" | "university_info_id">> & { is_enabled?: boolean };

export interface InstitutionalPageSection extends EditorialRecord {
  institutional_page_id: string;
  slug: string;
  section_type: InstitutionalSectionType;
  eyebrow?: string | null;
  heading: string;
  summary?: string | null;
  body?: string | null;
  layout_variant: string;
  theme: InstitutionalSectionTheme;
  primary_media_id?: string | null;
  media_alt_text?: string | null;
  video_url?: string | null;
  display_order: number;
}

export type InstitutionalSectionPayload = Omit<InstitutionalPageSection, keyof EditorialRecord | "id"> & { is_enabled?: boolean };

export interface InstitutionalPageItem extends EditorialRecord {
  section_id: string;
  title: string;
  description?: string | null;
  supporting_label?: string | null;
  supporting_value?: string | null;
  icon_key?: string | null;
  image_id?: string | null;
  image_alt_text?: string | null;
  link_label?: string | null;
  link_url?: string | null;
  display_order: number;
}

export type InstitutionalItemPayload = Omit<InstitutionalPageItem, keyof EditorialRecord | "id"> & { is_enabled?: boolean };

export interface InstitutionalSectionDocument {
  id: string;
  section_id: string;
  document_id: string;
  public_label?: string | null;
  display_order: number;
  is_featured: boolean;
  is_enabled: boolean;
}

export const aboutContentApi = {
  get: () => api.get<AboutPageContent | null>("/about-content"),
  create: (payload: AboutPageContentPayload) =>
    api.post<AboutPageContent>("/about-content", payload),
  update: (id: string, payload: Partial<AboutPageContentPayload>) =>
    api.patch<AboutPageContent>(`/about-content/${id}`, payload),
  delete: (id: string) => api.delete<void>(`/about-content/${id}`),
};

export const historyMilestonesApi = {
  list: (aboutPageContentId: string) =>
    api.get<HistoryMilestone[]>("/about-content/history-milestones", {
      params: { about_page_content_id: aboutPageContentId },
    }),
  create: (payload: HistoryMilestonePayload) =>
    api.post<HistoryMilestone>("/about-content/history-milestones", payload),
  update: (id: string, payload: Partial<HistoryMilestonePayload>) =>
    api.patch<HistoryMilestone>(`/about-content/history-milestones/${id}`, payload),
  delete: (id: string) =>
    api.delete<void>(`/about-content/history-milestones/${id}`),
  reorder: (
    aboutPageContentId: string,
    items: Array<{ id: string; display_order: number }>,
  ) =>
    api.post<HistoryMilestone[]>("/about-content/history-order", { items }, {
      params: { about_page_content_id: aboutPageContentId },
    }),
};

export const factEditionsApi = {
  list: () => api.get<FactEdition[]>("/fact-editions"),
  create: (payload: FactEditionPayload) =>
    api.post<FactEdition>("/fact-editions", payload),
  update: (id: string, payload: Partial<FactEditionPayload>) =>
    api.patch<FactEdition>(`/fact-editions/${id}`, payload),
  delete: (id: string) => api.delete<void>(`/fact-editions/${id}`),
  clone: (id: string, reportingYear: number) =>
    api.post<FactEdition>(`/fact-editions/${id}/clone`, {
      reporting_year: reportingYear,
    }),
};

export const factGroupsApi = {
  listForEdition: (editionId: string) =>
    api.get<FactGroup[]>(`/fact-editions/${editionId}/groups`),
  listEvergreen: () => api.get<FactGroup[]>("/fact-groups/evergreen"),
  createForEdition: (editionId: string, payload: FactGroupPayload) =>
    api.post<FactGroup>(`/fact-editions/${editionId}/groups`, payload),
  createEvergreen: (payload: FactGroupPayload) =>
    api.post<FactGroup>("/fact-groups/evergreen", payload),
  update: (id: string, payload: Partial<FactGroupPayload>) =>
    api.patch<FactGroup>(`/fact-groups/${id}`, payload),
  delete: (id: string) => api.delete<void>(`/fact-groups/${id}`),
};

export const factItemsApi = {
  list: (groupId: string) =>
    api.get<FactItem[]>(`/fact-groups/${groupId}/items`),
  create: (groupId: string, payload: FactItemPayload) =>
    api.post<FactItem>(`/fact-groups/${groupId}/items`, payload),
  update: (id: string, payload: Partial<FactItemPayload>) =>
    api.patch<FactItem>(`/fact-items/${id}`, payload),
  delete: (id: string) => api.delete<void>(`/fact-items/${id}`),
};

export const institutionalPagesApi = {
  getBySlug: (slug: string) => api.get<InstitutionalPage[]>("/institutional-pages", { params: { slug } }),
  update: (id: string, payload: InstitutionalPagePayload) => api.patch<InstitutionalPage>(`/institutional-pages/${id}`, payload),
  listSections: (pageId: string) => api.get<InstitutionalPageSection[]>(`/institutional-pages/${pageId}/sections`),
  createSection: (pageId: string, payload: InstitutionalSectionPayload) => api.post<InstitutionalPageSection>(`/institutional-pages/${pageId}/sections`, payload),
  updateSection: (id: string, payload: Partial<InstitutionalSectionPayload>) => api.patch<InstitutionalPageSection>(`/institutional-sections/${id}`, payload),
  deleteSection: (id: string) => api.delete<void>(`/institutional-sections/${id}`),
  reorderSections: (pageId: string, items: Array<{ id: string; display_order: number }>) => api.post<InstitutionalPageSection[]>(`/institutional-pages/${pageId}/sections/reorder`, { items }),
  listItems: (sectionId: string) => api.get<InstitutionalPageItem[]>(`/institutional-sections/${sectionId}/items`),
  createItem: (sectionId: string, payload: InstitutionalItemPayload) => api.post<InstitutionalPageItem>(`/institutional-sections/${sectionId}/items`, payload),
  updateItem: (id: string, payload: Partial<InstitutionalItemPayload>) => api.patch<InstitutionalPageItem>(`/institutional-items/${id}`, payload),
  deleteItem: (id: string) => api.delete<void>(`/institutional-items/${id}`),
  reorderItems: (sectionId: string, items: Array<{ id: string; display_order: number }>) => api.post<InstitutionalPageItem[]>(`/institutional-sections/${sectionId}/items/reorder`, { items }),
  listDocuments: (sectionId: string) => api.get<InstitutionalSectionDocument[]>(`/institutional-sections/${sectionId}/documents`),
  attachDocument: (sectionId: string, payload: Omit<InstitutionalSectionDocument, "id" | "section_id">) => api.post<InstitutionalSectionDocument>(`/institutional-sections/${sectionId}/documents`, payload),
  deleteDocument: (id: string) => api.delete<void>(`/institutional-section-documents/${id}`),
};

export const aboutWorkflowApi = {
  transition: (
    kind: AboutWorkflowKind,
    id: string,
    action: AboutWorkflowAction,
    reason?: string,
  ) =>
    api.post<EditorialRecord>(`/about-content/workflow/${kind}/${id}`, {
      action,
      reason: reason || null,
    }),
};
