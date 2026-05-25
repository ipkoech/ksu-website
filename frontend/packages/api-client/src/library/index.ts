import { libraryApi } from "../client";
import type { FieldSelectionParams, QueryParams } from "../client";
import type { PaginatedResponse } from "../main/types";

type ListParams<T extends Record<string, string | number | boolean | undefined> = Record<string, string | number | boolean | undefined>> = QueryParams & T;

export interface LibraryBranch {
  id: string;
  name: string;
  short_name?: string | null;
  slug: string;
  description?: string | null;
  email?: string | null;
  phone?: string | null;
  library_type?: string;
  is_active?: boolean;
  is_public?: boolean;
  sort_order?: number;
  created_at: string;
  updated_at: string;
}

export interface LibraryBranchPayload {
  name: string;
  short_name?: string | null;
  slug: string;
  description?: string | null;
  email?: string | null;
  phone?: string | null;
  library_type?: string;
  is_active?: boolean;
  is_public?: boolean;
  sort_order?: number;
}

export interface LibraryResource {
  id: string;
  library_id: string;
  title: string;
  subtitle?: string | null;
  authors?: string | null;
  publisher?: string | null;
  publication_year?: number | null;
  resource_type?: string;
  status?: string;
  total_copies?: number;
  available_copies?: number;
  description?: string | null;
  is_loanable?: boolean;
  is_reference_only?: boolean;
  is_active?: boolean;
  created_at: string;
  updated_at: string;
}

export interface LibraryResourcePayload {
  library_id: string;
  title: string;
  subtitle?: string | null;
  authors?: string | null;
  publisher?: string | null;
  publication_year?: number | null;
  resource_type?: string;
  status?: string;
  total_copies?: number;
  available_copies?: number;
  is_loanable?: boolean;
  is_reference_only?: boolean;
  is_active?: boolean;
}

export interface LibraryLoan {
  id: string;
  resource_id: string;
  borrower_person_id: string;
  borrowed_at: string;
  due_at: string;
  returned_at?: string | null;
  status: string;
  renewals_count?: number;
  max_renewals?: number;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface LibraryLoanPayload {
  resource_id: string;
  borrower_person_id: string;
  borrowed_at: string;
  due_at: string;
  max_renewals?: number;
  notes?: string | null;
}

export type LibraryGenericRecord = Record<string, any> & {
  id: string;
  title?: string;
  name?: string;
  slug?: string;
  status?: string;
  is_active?: boolean;
  is_public?: boolean;
  created_at?: string;
  updated_at?: string;
};

export type LibraryGenericPayload = Record<string, any>;

function crudApi<TRecord, TPayload>(path: string) {
  return {
    list: (params?: ListParams) => libraryApi.get<PaginatedResponse<TRecord>>(path, params),
    get: (id: string, params?: FieldSelectionParams) => libraryApi.get<{ data: TRecord }>(`${path}${id}`, params),
    create: (data: TPayload) => libraryApi.post<{ data: TRecord }>(path, data),
    update: (id: string, data: Partial<TPayload>) => libraryApi.patch<{ data: TRecord }>(`${path}${id}`, data),
    delete: (id: string) => libraryApi.delete<void>(`${path}${id}`),
  };
}

export const libraryServiceApi = {
  branches: {
    list: (params?: ListParams<{ active_only?: boolean }>) =>
      libraryApi.get<PaginatedResponse<LibraryBranch>>("/api/v1/library/branches/", params),
    get: (id: string, params?: FieldSelectionParams) =>
      libraryApi.get<{ data: LibraryBranch }>(`/api/v1/library/branches/${id}`, params),
    create: (data: LibraryBranchPayload) =>
      libraryApi.post<{ data: LibraryBranch }>("/api/v1/library/branches/", data),
    update: (id: string, data: Partial<LibraryBranchPayload>) =>
      libraryApi.patch<{ data: LibraryBranch }>(`/api/v1/library/branches/${id}`, data),
    delete: (id: string) => libraryApi.delete<void>(`/api/v1/library/branches/${id}`),
  },
  resources: {
    list: (params: ListParams<{ library_id: string; resource_type?: string; status?: string; q?: string }>) =>
      libraryApi.get<PaginatedResponse<LibraryResource>>("/api/v1/library/resources/", params),
    get: (id: string, params?: FieldSelectionParams) =>
      libraryApi.get<{ data: LibraryResource }>(`/api/v1/library/resources/${id}`, params),
    create: (data: LibraryResourcePayload) =>
      libraryApi.post<{ data: LibraryResource }>("/api/v1/library/resources/", data),
    update: (id: string, data: Partial<LibraryResourcePayload>) =>
      libraryApi.patch<{ data: LibraryResource }>(`/api/v1/library/resources/${id}`, data),
    delete: (id: string) => libraryApi.delete<void>(`/api/v1/library/resources/${id}`),
  },
  loans: {
    list: (params?: ListParams<{ resource_id?: string; status?: string }>) =>
      libraryApi.get<PaginatedResponse<LibraryLoan>>("/api/v1/library/loans/", params),
    create: (data: LibraryLoanPayload) =>
      libraryApi.post<{ data: LibraryLoan }>("/api/v1/library/loans/", data),
    update: (id: string, data: Partial<LibraryLoan>) =>
      libraryApi.patch<{ data: LibraryLoan }>(`/api/v1/library/loans/${id}`, data),
  },
  databases: crudApi<LibraryGenericRecord, LibraryGenericPayload>("/api/v1/library/databases/"),
  inquiries: crudApi<LibraryGenericRecord, LibraryGenericPayload>("/api/v1/library/inquiries/"),
  tickets: crudApi<LibraryGenericRecord, LibraryGenericPayload>("/api/v1/library/tickets/"),
  regulations: crudApi<LibraryGenericRecord, LibraryGenericPayload>("/api/v1/library/regulations/"),
  staff: crudApi<LibraryGenericRecord, LibraryGenericPayload>("/api/v1/library/staff/"),
  services: crudApi<LibraryGenericRecord, LibraryGenericPayload>("/api/v1/library/services/"),
  statistics: crudApi<LibraryGenericRecord, LibraryGenericPayload>("/api/v1/library/statistics/"),
};
