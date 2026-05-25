import { researchApi } from "../client";
import type { FieldSelectionParams, QueryParams } from "../client";
import type { PaginatedResponse } from "../main/types";

type ListParams<T extends Record<string, string | number | boolean | undefined> = Record<string, string | number | boolean | undefined>> = QueryParams & T;

export interface ResearchProject {
  id: string;
  title: string;
  slug: string;
  code?: string | null;
  project_type?: string;
  summary?: string | null;
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
  project_type?: string;
  summary?: string | null;
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
  journal_name?: string | null;
  year?: number | null;
  doi?: string | null;
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
  journal_name?: string | null;
  year?: number | null;
  doi?: string | null;
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
    list: (params?: ListParams) => researchApi.get<PaginatedResponse<TRecord>>(path, params),
    getBySlug: (slug: string, params?: FieldSelectionParams) => researchApi.get<{ data: TRecord }>(`${path}/${slug}`, params),
    create: (data: TPayload) => researchApi.post<{ data: TRecord }>(path, data),
    update: (id: string, data: Partial<TPayload>) => researchApi.patch<{ data: TRecord }>(`${path}/id/${id}`, data),
    delete: (id: string) => researchApi.delete<void>(`${path}/id/${id}`),
  };
}

export const researchServiceApi = {
  projects: crudApi<ResearchProject, ResearchProjectPayload>("/api/v1/projects"),
  publications: crudApi<ResearchPublication, ResearchPublicationPayload>("/api/v1/publications"),
  grants: crudApi<ResearchGrant, ResearchGrantPayload>("/api/v1/grants"),
  centers: crudApi<ResearchGenericRecord, ResearchGenericPayload>("/api/v1/centers"),
  farms: crudApi<ResearchGenericRecord, ResearchGenericPayload>("/api/v1/farms"),
  programs: crudApi<ResearchGenericRecord, ResearchGenericPayload>("/api/v1/programs"),
  themes: crudApi<ResearchGenericRecord, ResearchGenericPayload>("/api/v1/themes"),
  focusAreas: crudApi<ResearchGenericRecord, ResearchGenericPayload>("/api/v1/focus-areas"),
  expertiseTags: crudApi<ResearchGenericRecord, ResearchGenericPayload>("/api/v1/expertise-tags"),
  journals: crudApi<ResearchGenericRecord, ResearchGenericPayload>("/api/v1/journals"),
  grantGuidelines: crudApi<ResearchGenericRecord, ResearchGenericPayload>("/api/v1/grant-guidelines"),
  grantApplications: crudApi<ResearchGenericRecord, ResearchGenericPayload>("/api/v1/grant-applications"),
  funders: crudApi<ResearchGenericRecord, ResearchGenericPayload>("/api/v1/funders"),
  endowments: crudApi<ResearchGenericRecord, ResearchGenericPayload>("/api/v1/endowments"),
  outputs: crudApi<ResearchGenericRecord, ResearchGenericPayload>("/api/v1/outputs"),
  partners: crudApi<ResearchGenericRecord, ResearchGenericPayload>("/api/v1/partners"),
  consultancies: crudApi<ResearchGenericRecord, ResearchGenericPayload>("/api/v1/consultancies"),
  news: crudApi<ResearchGenericRecord, ResearchGenericPayload>("/api/v1/news"),
  articles: crudApi<ResearchGenericRecord, ResearchGenericPayload>("/api/v1/articles"),
  events: crudApi<ResearchGenericRecord, ResearchGenericPayload>("/api/v1/events"),
  resources: crudApi<ResearchGenericRecord, ResearchGenericPayload>("/api/v1/resources"),
  services: crudApi<ResearchGenericRecord, ResearchGenericPayload>("/api/v1/services"),
  guidelines: crudApi<ResearchGenericRecord, ResearchGenericPayload>("/api/v1/guidelines"),
};
