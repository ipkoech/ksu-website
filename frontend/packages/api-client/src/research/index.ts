import { getStoredAccessToken } from "../auth-tokens";
import { mainApi, researchApi } from "../client";
import type { FieldSelectionParams, QueryParams } from "../client";
import type { PaginatedResponse } from "../main/types";
import type { PublicStatsResponse } from "../main/types";
import { getResearchApiBaseUrl } from "../service-urls";

type ListParams<
  T extends Record<string, string | number | boolean | undefined> = Record<
    string,
    string | number | boolean | undefined
  >,
> = QueryParams &
  T & {
    category?: string;
    project_type?: string;
    partner_type?: string;
    partnership_level?: string;
    consultancy_type?: string;
    client_type?: string;
    innovation_type?: string;
    development_stage?: string;
    ip_status?: string;
    commercialization_status?: string;
    venture_stage?: string;
    registration_status?: string;
    startup_id?: string;
    incubation_type?: string;
    stage?: string;
    entry_type?: string;
    entry_status?: string;
    case_type?: string;
    transfer_status?: string;
    event_type?: string;
    output_type?: string;
    program_type?: string;
    scholarship_type?: string;
    initiative_type?: string;
    center_id?: string;
    program_id?: string;
    project_id?: string;
    partner_id?: string;
    pi_id?: string;
    journal_id?: string;
    author_id?: string;
    grant_id?: string;
    has_grant?: boolean;
    missing_pi?: boolean;
    start_date_from?: string;
    end_date_to?: string;
    application_id?: string;
    applicant_id?: string;
    reviewer_id?: string;
    submitter_id?: string;
    report_type?: string;
    funder_type?: string;
    is_required?: boolean;
    is_accepting_contributions?: boolean;
  };

export type ResearchExportFormat = "csv" | "json";
export type ResearchExportParams = ListParams & {
  format?: ResearchExportFormat;
  limit?: number;
};

export interface ResearchExportJob {
  job_id: string;
  status: "PENDING" | "STARTED" | "SUCCESS" | "FAILURE" | "RETRY" | string;
  resource?: string | null;
  download_url?: string | null;
  filename?: string | null;
  format?: ResearchExportFormat | string | null;
  total_rows?: number | null;
  error?: string | null;
}

export interface PublicDonationSubmission {
  donor_type?: string;
  display_name?: string | null;
  organization_name?: string | null;
  is_anonymous?: boolean;
  email?: string | null;
  phone?: string | null;
  amount: number;
  currency?: string;
  donation_type?: string;
  recurring_frequency?: string | null;
  designation?: string;
  purpose?: string | null;
  fund_id?: string | null;
  project_id?: string | null;
  center_id?: string | null;
  scholarship_id?: string | null;
  preferred_payment_method?: string | null;
  message?: string | null;
  dedication?: string | null;
  is_tribute?: boolean;
  tribute_type?: string | null;
  tribute_name?: string | null;
  recognition_public?: boolean;
}

export interface PublicDonationSubmissionRead {
  donation_id: string;
  donor_id: string;
  status: string;
  amount: number;
  currency: string;
  donation_type: string;
  recurring_frequency?: string | null;
  designation: string;
  payment_method?: string | null;
}

export interface ResearchProject {
  id: string;
  title: string;
  name?: string | null;
  slug: string;
  code?: string | null;
  program_id?: string | null;
  center_id?: string | null;
  farm_id?: string | null;
  program?: ResearchGenericRecord | null;
  center?: ResearchGenericRecord | null;
  farm?: ResearchGenericRecord | null;
  pi_id?: string | null;
  project_type?: string;
  start_date?: string | null;
  end_date?: string | null;
  summary?: string | null;
  abstract?: string | null;
  background?: string | null;
  objectives?: string | null;
  methodology?: string | null;
  expected_outcomes?: string | null;
  impact?: string | null;
  deliverables?: string | null;
  budget?: number | null;
  currency?: string | null;
  grant_id?: string | null;
  cover_image_url?: string | null;
  cover_image_id?: string | null;
  gallery_media_ids?: string[] | null;
  attachment_media_ids?: string[] | null;
  document_media_ids?: string[] | null;
  meta_title?: string | null;
  meta_description?: string | null;
  keywords?: Record<string, unknown> | null;
  status?: string;
  progress_percentage?: number;
  is_active?: boolean;
  is_featured?: boolean;
  is_public?: boolean;
  display_order?: number;
  published_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface ResearchProjectPayload {
  title: string;
  slug?: string | null;
  code?: string | null;
  program_id?: string | null;
  center_id?: string | null;
  farm_id?: string | null;
  pi_id?: string | null;
  project_type?: string;
  start_date?: string | null;
  end_date?: string | null;
  summary?: string | null;
  abstract?: string | null;
  background?: string | null;
  objectives?: string | null;
  methodology?: string | null;
  expected_outcomes?: string | null;
  impact?: string | null;
  deliverables?: string | null;
  budget?: number | null;
  currency?: string | null;
  grant_id?: string | null;
  cover_image_url?: string | null;
  cover_image_id?: string | null;
  gallery_media_ids?: string[] | null;
  attachment_media_ids?: string[] | null;
  document_media_ids?: string[] | null;
  meta_title?: string | null;
  meta_description?: string | null;
  keywords?: Record<string, unknown> | null;
  status?: string;
  progress_percentage?: number;
  is_active?: boolean;
  is_featured?: boolean;
  is_public?: boolean;
  display_order?: number;
}

export interface ResearchPublication {
  id: string;
  title: string;
  slug: string;
  publication_type?: string;
  project_id?: string | null;
  center_id?: string | null;
  journal_id?: string | null;
  project?: ResearchProject | null;
  center?: ResearchGenericRecord | null;
  journal?: ResearchGenericRecord | null;
  authors?: ResearchGenericRecord[] | null;
  abstract?: string | null;
  journal_name?: string | null;
  publisher?: string | null;
  volume?: string | null;
  issue?: string | null;
  pages?: string | null;
  article_number?: string | null;
  conference_name?: string | null;
  conference_location?: string | null;
  conference_date?: string | null;
  book_title?: string | null;
  editors?: string | null;
  edition?: string | null;
  isbn?: string | null;
  publication_date?: string | null;
  submission_date?: string | null;
  acceptance_date?: string | null;
  year?: number | null;
  doi?: string | null;
  pmid?: string | null;
  arxiv_id?: string | null;
  issn?: string | null;
  url?: string | null;
  pdf_url?: string | null;
  is_open_access?: boolean;
  access_type?: string | null;
  impact_factor?: number | null;
  quartile?: string | null;
  h_index?: number | null;
  funding_acknowledgment?: string | null;
  grant_numbers?: string[] | null;
  cover_image_url?: string | null;
  citation_count?: number;
  status?: string;
  is_active?: boolean;
  is_featured?: boolean;
  created_at: string;
  updated_at: string;
}

export interface ResearchPublicationPayload {
  title: string;
  slug?: string | null;
  publication_type?: string;
  project_id?: string | null;
  center_id?: string | null;
  journal_id?: string | null;
  abstract?: string | null;
  journal_name?: string | null;
  publisher?: string | null;
  volume?: string | null;
  issue?: string | null;
  pages?: string | null;
  article_number?: string | null;
  conference_name?: string | null;
  conference_location?: string | null;
  conference_date?: string | null;
  book_title?: string | null;
  editors?: string | null;
  edition?: string | null;
  isbn?: string | null;
  publication_date?: string | null;
  submission_date?: string | null;
  acceptance_date?: string | null;
  year?: number | null;
  doi?: string | null;
  pmid?: string | null;
  arxiv_id?: string | null;
  issn?: string | null;
  url?: string | null;
  pdf_url?: string | null;
  is_open_access?: boolean;
  access_type?: string | null;
  impact_factor?: number | null;
  quartile?: string | null;
  h_index?: number | null;
  funding_acknowledgment?: string | null;
  cover_image_url?: string | null;
  status?: string;
  is_active?: boolean;
  is_featured?: boolean;
}

export interface ResearchGrant {
  id: string;
  title: string;
  slug: string;
  code?: string | null;
  grant_type?: string;
  category?: string;
  funder_id?: string | null;
  funder_name?: string | null;
  summary?: string | null;
  description?: string | null;
  eligibility?: string | null;
  requirements?: string | null;
  total_budget?: number | string | null;
  min_award?: number | string | null;
  max_award?: number | string | null;
  currency?: string | null;
  open_date?: string | null;
  external_url?: string | null;
  application_url?: string | null;
  deadline?: string | null;
  status?: string;
  is_active?: boolean;
  is_featured?: boolean;
  created_at: string;
  updated_at: string;
}

export interface ResearchGrantPayload {
  title: string;
  slug?: string | null;
  code?: string | null;
  grant_type?: string;
  category?: string;
  funder_id?: string | null;
  funder_name?: string | null;
  description?: string | null;
  eligibility?: string | null;
  requirements?: string | null;
  total_budget?: number | string | null;
  min_award?: number | string | null;
  max_award?: number | string | null;
  currency?: string | null;
  open_date?: string | null;
  external_url?: string | null;
  application_url?: string | null;
  summary?: string | null;
  deadline?: string | null;
  status?: string;
  is_active?: boolean;
  is_featured?: boolean;
}

export interface ResearchDonor {
  id: string;
  donor_type?: string;
  display_name?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  organization_name?: string | null;
  email?: string | null;
  tier?: string | null;
  total_donated?: number | string;
  donation_count?: number;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export type ResearchGenericRecord = Record<string, any> & {
  id: string;
  title?: string;
  name?: string | null;
  slug?: string;
  code?: string | null;
  status?: string;
  is_active?: boolean;
  is_featured?: boolean;
  created_at?: string;
  updated_at?: string;
};

export type ResearchGenericPayload = Record<string, any>;

export interface ResearchPathwayActionNote {
  note?: string | null;
}

export interface StartupStageAction extends ResearchPathwayActionNote {
  venture_stage: string;
  registration_status?: string | null;
  status?: string | null;
}

export interface IncubationStageAction extends ResearchPathwayActionNote {
  stage: string;
  status?: string | null;
}

export interface MentorAssignmentAction extends ResearchPathwayActionNote {
  mentor_ids: string[];
}

export interface CompetitionEntryStatusAction extends ResearchPathwayActionNote {
  entry_status: string;
  award?: string | null;
  position?: string | null;
  status?: string | null;
}

export interface TechnologyTransferStatusAction extends ResearchPathwayActionNote {
  transfer_status: string;
  case_type?: string | null;
  status?: string | null;
}

export interface ResearchSearchResult {
  id: string;
  type: string;
  title: string;
  description?: string | null;
  url?: string | null;
  date?: string | null;
  status?: string | null;
  is_featured: boolean;
  metadata: Record<string, any>;
}

export interface ResearchSearchResponse {
  query: string;
  total: number;
  results: ResearchSearchResult[];
  by_type: Record<string, number>;
}

export interface ResearchAskAIPrompt {
  id: string;
  label: string;
  text: string;
  intent: string;
}

export interface ResearchAskAIReference {
  label: string;
  type: string;
  href: string;
  resource_key?: string | null;
}

export interface ResearchAskAIContextRequest {
  path?: string;
  section?: string | null;
  resource_key?: string | null;
  record_id?: string | null;
}

export interface ResearchAskAIContext {
  section_key: string;
  section_label: string;
  path: string;
  resource_key?: string | null;
  record_id?: string | null;
  scope: "page" | "global" | "mixed" | string;
  intent_mode: "summarize" | "find_gaps" | "compare" | "report" | "explain" | "navigate" | "next_actions" | string;
  capabilities: string[];
  guided_prompts: ResearchAskAIPrompt[];
  references: ResearchAskAIReference[];
}

export interface ResearchAskAIRequest {
  conversation_id?: string | null;
  message: string;
  context?: ResearchAskAIContextRequest;
  scope?: "page" | "global" | "mixed" | string;
  intent_mode?: "summarize" | "find_gaps" | "compare" | "report" | "explain" | "navigate" | "next_actions" | string;
  references?: ResearchAskAIReference[];
}

export interface ResearchAskAIResponse {
  mode: "read_only" | string;
  conversation_id?: string | null;
  user_message_id?: string | null;
  assistant_message_id?: string | null;
  answer: string;
  content_format: "markdown" | string;
  context: ResearchAskAIContext;
  service_exposure: Record<string, any>;
  references: ResearchAskAIReference[];
  suggested_prompts: ResearchAskAIPrompt[];
}

export interface ResearchAIConversation {
  id: string;
  title: string;
  section_key?: string | null;
  resource_key?: string | null;
  record_id?: string | null;
  context?: Record<string, any> | null;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface ResearchAIMessage {
  id: string;
  conversation_id: string;
  role: "user" | "assistant" | string;
  content: string;
  content_format: "markdown" | string;
  context_snapshot?: Record<string, any> | null;
  references?: ResearchAskAIReference[] | Record<string, any>[] | null;
  metadata?: Record<string, any> | null;
  created_at: string;
}

export type ResearchAskAIStreamEvent =
  | { event: "metadata"; data: Partial<ResearchAskAIResponse> }
  | { event: "delta"; data: { text?: string } }
  | { event: "done"; data: ResearchAskAIResponse }
  | { event: "error"; data: { message?: string } };

export interface ResearchAnalyticsPoint {
  key: string;
  label: string;
  value: number;
  secondary_value?: number | null;
  suffix?: string;
  href?: string | null;
  description?: string | null;
}

export interface ResearchAnalyticsChart {
  key: string;
  title: string;
  chart_type: "bar" | "donut" | "stacked" | "line" | string;
  description?: string | null;
  data: ResearchAnalyticsPoint[];
}

export interface ResearchAnalyticsKpi {
  key: string;
  label: string;
  value: number;
  suffix?: string;
  description: string;
  href?: string | null;
}

export interface ResearchAnalyticsAttentionItem {
  key: string;
  label: string;
  value: number;
  severity: "info" | "warning" | "danger" | string;
  description: string;
  href?: string | null;
}

export interface ResearchDashboardAnalytics {
  scope: string;
  title: string;
  kpis: ResearchAnalyticsKpi[];
  attention: ResearchAnalyticsAttentionItem[];
  portfolio_health: ResearchAnalyticsChart[];
  funding_pipeline: ResearchAnalyticsChart[];
  outputs_publications: ResearchAnalyticsChart[];
  partnerships_sustainability: ResearchAnalyticsChart[];
  applications_reviews: ResearchAnalyticsChart[];
  admin_activity: ResearchAnalyticsChart[];
}

function crudApi<TRecord, TPayload>(path: string) {
  return {
    list: (params?: ListParams) =>
      researchApi.get<PaginatedResponse<TRecord>>(path, params),
    getBySlug: (slug: string, params?: FieldSelectionParams) =>
      researchApi.get<{ data: TRecord }>(`${path}/${slug}`, params),
    create: (data: TPayload) => researchApi.post<{ data: TRecord }>(path, data),
    update: (id: string, data: Partial<TPayload>) =>
      researchApi.patch<{ data: TRecord }>(`${path}/id/${id}`, data),
    delete: (id: string) => researchApi.delete<void>(`${path}/id/${id}`),
  };
}

function pathwayCrudApi(path: string) {
  return {
    ...crudApi<ResearchGenericRecord, ResearchGenericPayload>(path),
    approve: (id: string, data?: ResearchPathwayActionNote) =>
      researchApi.post<{ data: ResearchGenericRecord }>(`${path}/id/${id}/approve`, data ?? {}),
    publish: (id: string, data?: ResearchPathwayActionNote) =>
      researchApi.post<{ data: ResearchGenericRecord }>(`${path}/id/${id}/publish`, data ?? {}),
    unpublish: (id: string, data?: ResearchPathwayActionNote) =>
      researchApi.post<{ data: ResearchGenericRecord }>(`${path}/id/${id}/unpublish`, data ?? {}),
    archive: (id: string, data?: ResearchPathwayActionNote) =>
      researchApi.post<{ data: ResearchGenericRecord }>(`${path}/id/${id}/archive`, data ?? {}),
    feature: (id: string, data?: ResearchPathwayActionNote) =>
      researchApi.post<{ data: ResearchGenericRecord }>(`${path}/id/${id}/feature`, data ?? {}),
    unfeature: (id: string, data?: ResearchPathwayActionNote) =>
      researchApi.post<{ data: ResearchGenericRecord }>(`${path}/id/${id}/unfeature`, data ?? {}),
  };
}

function mainContentCrudApi<TRecord, TPayload>(path: string, adminPath = `${path}/admin`) {
  return {
    list: (params?: ListParams) =>
      mainApi.get<PaginatedResponse<TRecord>>(path, params),
    listAdmin: (params?: ListParams) =>
      mainApi.get<PaginatedResponse<TRecord>>(adminPath, params),
    getBySlug: (slug: string, params?: FieldSelectionParams) =>
      mainApi.get<{ data: TRecord }>(`${path}/${slug}`, params),
    create: (data: TPayload) => mainApi.post<{ data: TRecord }>(path, data),
    update: (id: string, data: Partial<TPayload>) =>
      mainApi.patch<{ data: TRecord }>(`${path}/${id}`, data),
    delete: (id: string) => mainApi.delete<void>(`${path}/${id}`),
  };
}

function sustainabilityRelationApi(relation: "projects" | "partners" | "training" | "stories") {
  return {
    list: (sustainabilityId: string) =>
      researchApi.get<{ data: ResearchGenericRecord[] }>(
        `/api/v1/sustainability/id/${sustainabilityId}/${relation}`,
      ),
    add: (sustainabilityId: string, relatedId: string) =>
      researchApi.put<{ data: ResearchGenericRecord }>(
        `/api/v1/sustainability/id/${sustainabilityId}/${relation}/${relatedId}`,
      ),
    remove: (sustainabilityId: string, relatedId: string) =>
      researchApi.delete<void>(
        `/api/v1/sustainability/id/${sustainabilityId}/${relation}/${relatedId}`,
      ),
  };
}

function readonlyProjectRelationApi(relation: "activities" | "impact-stories" | "impact-metrics") {
  return {
    list: (projectId: string) =>
      researchApi.get<{ data: ResearchGenericRecord[] }>(
        `/api/v1/projects/id/${projectId}/${relation}`,
      ),
  };
}

function projectBindingApi(relation: "partners" | "funders" | "focus-areas") {
  return {
    list: (projectId: string) =>
      researchApi.get<{ data: ResearchGenericRecord[] }>(
        `/api/v1/projects/id/${projectId}/${relation}`,
      ),
    add: (projectId: string, relatedId: string) =>
      researchApi.put<{ data: ResearchGenericRecord }>(
        `/api/v1/projects/id/${projectId}/${relation}/${relatedId}`,
      ),
    remove: (projectId: string, relatedId: string) =>
      researchApi.delete<void>(
        `/api/v1/projects/id/${projectId}/${relation}/${relatedId}`,
      ),
  };
}

function readonlyFarmRelationApi(relation: "partners" | "activities" | "impact-stories") {
  return {
    list: (farmId: string) =>
      researchApi.get<{ data: ResearchGenericRecord[] }>(
        `/api/v1/farms/id/${farmId}/${relation}`,
      ),
  };
}

function farmProjectBindingApi() {
  return {
    list: (farmId: string) =>
      researchApi.get<{ data: ResearchGenericRecord[] }>(
        `/api/v1/farms/id/${farmId}/projects`,
      ),
    add: (farmId: string, relatedId: string) =>
      researchApi.put<{ data: ResearchGenericRecord }>(
        `/api/v1/farms/id/${farmId}/projects/${relatedId}`,
      ),
    remove: (farmId: string, relatedId: string) =>
      researchApi.delete<void>(
        `/api/v1/farms/id/${farmId}/projects/${relatedId}`,
      ),
  };
}

function readonlyCenterRelationApi(relation: "projects" | "programs" | "farms") {
  return {
    list: (centerId: string) =>
      researchApi.get<{ data: ResearchGenericRecord[] }>(
        `/api/v1/centers/id/${centerId}/${relation}`,
      ),
  };
}

function centerPartnerBindingApi() {
  return {
    list: (centerId: string) =>
      researchApi.get<{ data: ResearchGenericRecord[] }>(`/api/v1/centers/id/${centerId}/partners`),
    add: (centerId: string, partnerId: string, metadata?: Record<string, unknown>) =>
      researchApi.put<{ data: ResearchGenericRecord }>(`/api/v1/centers/id/${centerId}/partners/${partnerId}`, metadata),
    remove: (centerId: string, partnerId: string) =>
      researchApi.delete<void>(`/api/v1/centers/id/${centerId}/partners/${partnerId}`),
  };
}

function centerFocusAreaBindingApi() {
  return {
    list: (centerId: string) =>
      researchApi.get<{ data: ResearchGenericRecord[] }>(
        `/api/v1/centers/id/${centerId}/focus-areas`,
      ),
    add: (centerId: string, relatedId: string) =>
      researchApi.put<{ data: ResearchGenericRecord }>(
        `/api/v1/centers/id/${centerId}/focus-areas/${relatedId}`,
      ),
    remove: (centerId: string, relatedId: string) =>
      researchApi.delete<void>(
        `/api/v1/centers/id/${centerId}/focus-areas/${relatedId}`,
      ),
  };
}

function readonlyProgramRelationApi(relation: "projects") {
  return {
    list: (programId: string) =>
      researchApi.get<{ data: ResearchGenericRecord[] }>(
        `/api/v1/programs/id/${programId}/${relation}`,
      ),
  };
}

function programThemeBindingApi() {
  return {
    list: (programId: string) =>
      researchApi.get<{ data: ResearchGenericRecord[] }>(
        `/api/v1/programs/id/${programId}/themes`,
      ),
    add: (programId: string, relatedId: string) =>
      researchApi.put<{ data: ResearchGenericRecord }>(
        `/api/v1/programs/id/${programId}/themes/${relatedId}`,
      ),
    remove: (programId: string, relatedId: string) =>
      researchApi.delete<void>(
        `/api/v1/programs/id/${programId}/themes/${relatedId}`,
      ),
  };
}

function readonlyThemeRelationApi(relation: "focus-areas") {
  return {
    list: (themeId: string) =>
      researchApi.get<{ data: ResearchGenericRecord[] }>(
        `/api/v1/themes/id/${themeId}/${relation}`,
      ),
  };
}

function themeBindingApi(relation: "projects" | "programs" | "publications" | "grants") {
  return {
    list: (themeId: string) =>
      researchApi.get<{ data: ResearchGenericRecord[] }>(
        `/api/v1/themes/id/${themeId}/${relation}`,
      ),
    add: (themeId: string, relatedId: string) =>
      researchApi.put<{ data: ResearchGenericRecord }>(
        `/api/v1/themes/id/${themeId}/${relation}/${relatedId}`,
      ),
    remove: (themeId: string, relatedId: string) =>
      researchApi.delete<void>(
        `/api/v1/themes/id/${themeId}/${relation}/${relatedId}`,
      ),
  };
}

function grantBindingApi(relation: "themes") {
  return {
    list: (grantId: string) =>
      researchApi.get<{ data: ResearchGenericRecord[] }>(
        `/api/v1/grants/id/${grantId}/${relation}`,
      ),
    add: (grantId: string, relatedId: string) =>
      researchApi.put<{ data: ResearchGenericRecord }>(
        `/api/v1/grants/id/${grantId}/${relation}/${relatedId}`,
      ),
    remove: (grantId: string, relatedId: string) =>
      researchApi.delete<void>(
        `/api/v1/grants/id/${grantId}/${relation}/${relatedId}`,
      ),
  };
}

function readonlyGrantRelationApi(relation: "projects") {
  return {
    list: (grantId: string) =>
      researchApi.get<{ data: ResearchGenericRecord[] }>(
        `/api/v1/grants/id/${grantId}/${relation}`,
      ),
  };
}

function readonlyFunderRelationApi(relation: "grants" | "projects") {
  return {
    list: (funderId: string) =>
      researchApi.get<{ data: ResearchGenericRecord[] }>(
        `/api/v1/funders/id/${funderId}/${relation}`,
      ),
  };
}

function readonlyPartnerRelationApi(
  relation:
    | "projects"
    | "farms"
    | "activities"
    | "impact-stories"
    | "impact-metrics"
    | "consultancies"
    | "startups"
    | "incubation-records"
    | "competition-entries"
    | "technology-transfer-cases"
    | "sustainability",
) {
  return {
    list: (partnerId: string) =>
      researchApi.get<{ data: ResearchGenericRecord[] }>(
        `/api/v1/partners/id/${partnerId}/${relation}`,
      ),
  };
}

function readonlyInnovationRelationApi(
  relation:
    | "startups"
    | "incubation-records"
    | "competition-entries"
    | "technology-transfer-cases",
) {
  return {
    list: (innovationId: string) =>
      researchApi.get<{ data: ResearchGenericRecord[] }>(
        `/api/v1/innovations/id/${innovationId}/${relation}`,
      ),
  };
}

export const researchServiceApi = {
  // /research-prefixed paths: the gateway's shared /api/v1 space resolves
  // bare /search, /analytics, and /stats to the main service.
  stats: () => researchApi.get<{ data: PublicStatsResponse }>("/api/v1/research/stats"),
  adminStats: () =>
    researchApi.get<{ data: PublicStatsResponse }>("/api/v1/research/stats/admin"),
  dashboardAnalytics: () =>
    researchApi.get<{ data: ResearchDashboardAnalytics }>("/api/v1/research/analytics/dashboard"),
  search: (params: { q: string; types?: string; limit?: number }) =>
    researchApi.get<{ data: ResearchSearchResponse }>("/api/v1/research/search", params),
  askAI: (data: ResearchAskAIRequest) =>
    researchApi.post<{ data: ResearchAskAIResponse }>("/api/v1/ask-ai", data),
  submitDonation: (data: PublicDonationSubmission) =>
    researchApi.post<{ data: PublicDonationSubmissionRead; message?: string }>(
      "/api/v1/donations/submit",
      data,
    ),
  streamAskAI: (data: ResearchAskAIRequest, onEvent: (event: ResearchAskAIStreamEvent) => void) =>
    streamResearchAskAI(data, onEvent),
  listAskAIConversations: () =>
    researchApi.get<{ data: ResearchAIConversation[] }>("/api/v1/ask-ai/conversations"),
  listAskAIMessages: (conversationId: string) =>
    researchApi.get<{ data: ResearchAIMessage[] }>(`/api/v1/ask-ai/conversations/${conversationId}/messages`),
  exportResourceUrl: (resource: string, params?: ResearchExportParams) =>
    buildResearchExportUrl(resource, params),
  startExport: (resource: string, params?: ResearchExportParams) =>
    researchApi.request<{ data: ResearchExportJob }>("POST", `/api/v1/exports/${resource}/jobs`, { params }),
  getExportJob: (jobId: string) =>
    researchApi.get<{ data: ResearchExportJob }>(`/api/v1/exports/jobs/${jobId}`),
  downloadExportJob: async (jobId: string) => {
    const token = getStoredAccessToken();
    const response = await fetch(
      `${getResearchApiBaseUrl()}/api/v1/exports/jobs/${jobId}/download`,
      {
        credentials: "include",
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      },
    );
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.detail || error.message || "Research export download failed");
    }
    return response.blob();
  },
  downloadExport: async (resource: string, params?: ResearchExportParams) => {
    const token = getStoredAccessToken();
    const response = await fetch(buildResearchExportUrl(resource, params), {
      credentials: "include",
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.detail || error.message || "Research export failed");
    }
    return response.blob();
  },
  projects: crudApi<ResearchProject, ResearchProjectPayload>(
    "/api/v1/projects",
  ),
  projectDetail: (slug: string) =>
    researchApi.get<{ data: ResearchGenericRecord }>(`/api/v1/projects/${slug}/detail`),
  projectRelations: {
    activities: readonlyProjectRelationApi("activities"),
    impactStories: readonlyProjectRelationApi("impact-stories"),
    impactMetrics: readonlyProjectRelationApi("impact-metrics"),
    partners: projectBindingApi("partners"),
    funders: projectBindingApi("funders"),
    focusAreas: projectBindingApi("focus-areas"),
  },
  publications: crudApi<ResearchPublication, ResearchPublicationPayload>(
    "/api/v1/publications",
  ),
  grants: crudApi<ResearchGrant, ResearchGrantPayload>("/api/v1/grants"),
  grantRelations: {
    projects: readonlyGrantRelationApi("projects"),
    themes: grantBindingApi("themes"),
  },
  centers: crudApi<ResearchGenericRecord, ResearchGenericPayload>(
    "/api/v1/centers",
  ),
  centerRelations: {
    projects: readonlyCenterRelationApi("projects"),
    programs: readonlyCenterRelationApi("programs"),
    farms: readonlyCenterRelationApi("farms"),
    focusAreas: centerFocusAreaBindingApi(),
    partners: centerPartnerBindingApi(),
  },
  farms: crudApi<ResearchGenericRecord, ResearchGenericPayload>(
    "/api/v1/farms",
  ),
  farmDetail: (slug: string) =>
    researchApi.get<{ data: ResearchGenericRecord }>(`/api/v1/farms/${slug}/detail`),
  farmRelations: {
    projects: farmProjectBindingApi(),
    partners: readonlyFarmRelationApi("partners"),
    activities: readonlyFarmRelationApi("activities"),
    impactStories: readonlyFarmRelationApi("impact-stories"),
  },
  programs: crudApi<ResearchGenericRecord, ResearchGenericPayload>(
    "/api/v1/programs",
  ),
  programRelations: {
    projects: readonlyProgramRelationApi("projects"),
    themes: programThemeBindingApi(),
  },
  themes: crudApi<ResearchGenericRecord, ResearchGenericPayload>(
    "/api/v1/themes",
  ),
  themeRelations: {
    focusAreas: readonlyThemeRelationApi("focus-areas"),
    projects: themeBindingApi("projects"),
    programs: themeBindingApi("programs"),
    publications: themeBindingApi("publications"),
    grants: themeBindingApi("grants"),
  },
  focusAreas: crudApi<ResearchGenericRecord, ResearchGenericPayload>(
    "/api/v1/focus-areas",
  ),
  expertiseTags: crudApi<ResearchGenericRecord, ResearchGenericPayload>(
    "/api/v1/expertise-tags",
  ),
  journals: crudApi<ResearchGenericRecord, ResearchGenericPayload>(
    "/api/v1/journals",
  ),
  grantGuidelines: crudApi<ResearchGenericRecord, ResearchGenericPayload>(
    "/api/v1/grant-guidelines",
  ),
  grantApplications: crudApi<ResearchGenericRecord, ResearchGenericPayload>(
    "/api/v1/grant-applications",
  ),
  grantReviews: crudApi<ResearchGenericRecord, ResearchGenericPayload>(
    "/api/v1/grant-reviews",
  ),
  grantReports: crudApi<ResearchGenericRecord, ResearchGenericPayload>(
    "/api/v1/grant-reports",
  ),
  funders: crudApi<ResearchGenericRecord, ResearchGenericPayload>(
    "/api/v1/funders",
  ),
  funderRelations: {
    grants: readonlyFunderRelationApi("grants"),
    projects: readonlyFunderRelationApi("projects"),
  },
  endowments: crudApi<ResearchGenericRecord, ResearchGenericPayload>(
    "/api/v1/endowments",
  ),
  outputs: crudApi<ResearchGenericRecord, ResearchGenericPayload>(
    "/api/v1/outputs",
  ),
  impactMetrics: crudApi<ResearchGenericRecord, ResearchGenericPayload>(
    "/api/v1/impact-metrics",
  ),
  stories: crudApi<ResearchGenericRecord, ResearchGenericPayload>(
    "/api/v1/stories",
  ),
  sustainability: crudApi<ResearchGenericRecord, ResearchGenericPayload>(
    "/api/v1/sustainability",
  ),
  sustainabilityRelations: {
    projects: sustainabilityRelationApi("projects"),
    partners: sustainabilityRelationApi("partners"),
    training: sustainabilityRelationApi("training"),
    stories: sustainabilityRelationApi("stories"),
  },
  innovations: crudApi<ResearchGenericRecord, ResearchGenericPayload>(
    "/api/v1/innovations",
  ),
  innovationRelations: {
    startups: readonlyInnovationRelationApi("startups"),
    incubationRecords: readonlyInnovationRelationApi("incubation-records"),
    competitionEntries: readonlyInnovationRelationApi("competition-entries"),
    technologyTransferCases: readonlyInnovationRelationApi("technology-transfer-cases"),
  },
  startups: {
    ...pathwayCrudApi("/api/v1/startups"),
    setStage: (id: string, data: StartupStageAction) =>
      researchApi.post<{ data: ResearchGenericRecord }>(`/api/v1/startups/id/${id}/stage`, data),
  },
  incubationRecords: {
    ...pathwayCrudApi("/api/v1/incubation-records"),
    setStage: (id: string, data: IncubationStageAction) =>
      researchApi.post<{ data: ResearchGenericRecord }>(`/api/v1/incubation-records/id/${id}/stage`, data),
    assignMentors: (id: string, data: MentorAssignmentAction) =>
      researchApi.post<{ data: ResearchGenericRecord }>(`/api/v1/incubation-records/id/${id}/assign-mentors`, data),
  },
  competitionEntries: {
    ...pathwayCrudApi("/api/v1/competition-entries"),
    setEntryStatus: (id: string, data: CompetitionEntryStatusAction) =>
      researchApi.post<{ data: ResearchGenericRecord }>(`/api/v1/competition-entries/id/${id}/entry-status`, data),
  },
  technologyTransferCases: {
    ...pathwayCrudApi("/api/v1/technology-transfer-cases"),
    setTransferStatus: (id: string, data: TechnologyTransferStatusAction) =>
      researchApi.post<{ data: ResearchGenericRecord }>(`/api/v1/technology-transfer-cases/id/${id}/transfer-status`, data),
  },
  partners: crudApi<ResearchGenericRecord, ResearchGenericPayload>(
    "/api/v1/partners",
  ),
  partnerRelations: {
    projects: readonlyPartnerRelationApi("projects"),
    farms: readonlyPartnerRelationApi("farms"),
    activities: readonlyPartnerRelationApi("activities"),
    impactStories: readonlyPartnerRelationApi("impact-stories"),
    impactMetrics: readonlyPartnerRelationApi("impact-metrics"),
    consultancies: readonlyPartnerRelationApi("consultancies"),
    startups: readonlyPartnerRelationApi("startups"),
    incubationRecords: readonlyPartnerRelationApi("incubation-records"),
    competitionEntries: readonlyPartnerRelationApi("competition-entries"),
    technologyTransferCases: readonlyPartnerRelationApi("technology-transfer-cases"),
    sustainability: readonlyPartnerRelationApi("sustainability"),
  },
  consultancies: crudApi<ResearchGenericRecord, ResearchGenericPayload>(
    "/api/v1/consultancies",
  ),
  donors: crudApi<ResearchDonor, ResearchGenericPayload>("/api/v1/donors"),
  donations: crudApi<ResearchGenericRecord, ResearchGenericPayload>(
    "/api/v1/donations",
  ),
  donationImpacts: crudApi<ResearchGenericRecord, ResearchGenericPayload>(
    "/api/v1/donation-impacts",
  ),
  donationStories: crudApi<ResearchGenericRecord, ResearchGenericPayload>(
    "/api/v1/donation-stories",
  ),
  donationSettings: crudApi<ResearchGenericRecord, ResearchGenericPayload>(
    "/api/v1/donation-settings",
  ),
  training: crudApi<ResearchGenericRecord, ResearchGenericPayload>(
    "/api/v1/training",
  ),
  mentorship: crudApi<ResearchGenericRecord, ResearchGenericPayload>(
    "/api/v1/mentorship",
  ),
  mentorshipApplications: crudApi<
    ResearchGenericRecord,
    ResearchGenericPayload
  >("/api/v1/mentorship-applications"),
  mentorshipMatches: crudApi<ResearchGenericRecord, ResearchGenericPayload>(
    "/api/v1/mentorship-matches",
  ),
  scholarships: crudApi<ResearchGenericRecord, ResearchGenericPayload>(
    "/api/v1/scholarships",
  ),
  scholarshipApplications: crudApi<
    ResearchGenericRecord,
    ResearchGenericPayload
  >("/api/v1/scholarship-applications"),
  articles: mainContentCrudApi<ResearchGenericRecord, ResearchGenericPayload>(
    "/api/v1/news",
  ),
  events: mainContentCrudApi<ResearchGenericRecord, ResearchGenericPayload>(
    "/api/v1/events",
  ),
  resources: crudApi<ResearchGenericRecord, ResearchGenericPayload>(
    "/api/v1/resources",
  ),
  services: crudApi<ResearchGenericRecord, ResearchGenericPayload>(
    "/api/v1/services",
  ),
  guidelines: crudApi<ResearchGenericRecord, ResearchGenericPayload>(
    "/api/v1/guidelines",
  ),
};

function buildResearchExportUrl(resource: string, params?: ResearchExportParams) {
  const url = new URL(`/api/v1/exports/${resource}`, getResearchApiBaseUrl());
  Object.entries(params ?? {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.append(key, String(value));
    }
  });
  return url.toString();
}

async function streamResearchAskAI(
  data: ResearchAskAIRequest,
  onEvent: (event: ResearchAskAIStreamEvent) => void,
) {
  const token = getStoredAccessToken();
  const response = await fetch(`${getResearchApiBaseUrl()}/api/v1/ask-ai/stream`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(data),
  });

  if (!response.ok || !response.body) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || error.message || "Ask AI stream failed");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const records = buffer.split("\n\n");
    buffer = records.pop() ?? "";
    for (const record of records) {
      dispatchResearchAskAIStreamRecord(record, onEvent);
    }
  }

  if (buffer.trim()) {
    dispatchResearchAskAIStreamRecord(buffer, onEvent);
  }
};

function dispatchResearchAskAIStreamRecord(
  record: string,
  onEvent: (event: ResearchAskAIStreamEvent) => void,
) {
  const event = record
    .split("\n")
    .find((line) => line.startsWith("event:"))
    ?.slice("event:".length)
    .trim();
  const dataText = record
    .split("\n")
    .filter((line) => line.startsWith("data:"))
    .map((line) => line.slice("data:".length).trim())
    .join("\n");

  if (!event || !dataText) return;

  try {
    onEvent({ event, data: JSON.parse(dataText) } as ResearchAskAIStreamEvent);
  } catch {
    onEvent({ event: "error", data: { message: "Ask AI stream returned invalid data." } });
  }
}
