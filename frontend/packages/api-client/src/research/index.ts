import { mainApi, researchApi } from "../client";
import type { FieldSelectionParams, QueryParams } from "../client";
import type { PaginatedResponse } from "../main/types";
import type { PublicStatsResponse } from "../main/types";

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
    grant_id?: string;
    has_grant?: boolean;
    missing_pi?: boolean;
    start_date_from?: string;
    end_date_to?: string;
  };

export interface ResearchProject {
  id: string;
  title: string;
  slug: string;
  code?: string | null;
  program_id?: string | null;
  center_id?: string | null;
  program?: ResearchGenericRecord | null;
  center?: ResearchGenericRecord | null;
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
  status?: string;
  progress_percentage?: number;
  is_active?: boolean;
  is_featured?: boolean;
  is_public?: boolean;
  created_at: string;
  updated_at: string;
}

export interface ResearchProjectPayload {
  title: string;
  slug?: string | null;
  code?: string | null;
  program_id?: string | null;
  center_id?: string | null;
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
  status?: string;
  progress_percentage?: number;
  is_active?: boolean;
  is_featured?: boolean;
  is_public?: boolean;
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
  funder_name?: string | null;
  summary?: string | null;
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
  funder_name?: string | null;
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
  name?: string;
  slug?: string;
  code?: string | null;
  status?: string;
  is_active?: boolean;
  is_featured?: boolean;
  created_at?: string;
  updated_at?: string;
};

export type ResearchGenericPayload = Record<string, any>;

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

export const researchServiceApi = {
  stats: () => researchApi.get<{ data: PublicStatsResponse }>("/api/v1/stats"),
  adminStats: () =>
    researchApi.get<{ data: PublicStatsResponse }>("/api/v1/stats/admin"),
  projects: crudApi<ResearchProject, ResearchProjectPayload>(
    "/api/v1/projects",
  ),
  publications: crudApi<ResearchPublication, ResearchPublicationPayload>(
    "/api/v1/publications",
  ),
  grants: crudApi<ResearchGrant, ResearchGrantPayload>("/api/v1/grants"),
  centers: crudApi<ResearchGenericRecord, ResearchGenericPayload>(
    "/api/v1/centers",
  ),
  farms: crudApi<ResearchGenericRecord, ResearchGenericPayload>(
    "/api/v1/farms",
  ),
  programs: crudApi<ResearchGenericRecord, ResearchGenericPayload>(
    "/api/v1/programs",
  ),
  themes: crudApi<ResearchGenericRecord, ResearchGenericPayload>(
    "/api/v1/themes",
  ),
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
  innovations: crudApi<ResearchGenericRecord, ResearchGenericPayload>(
    "/api/v1/innovations",
  ),
  partners: crudApi<ResearchGenericRecord, ResearchGenericPayload>(
    "/api/v1/partners",
  ),
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
