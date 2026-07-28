import { libraryApi } from "../client";
import type { FieldSelectionParams, QueryParams } from "../client";
import type { PaginatedResponse } from "../main/types";
import type { PublicStatsResponse } from "../main/types";

type ListParams<
  T extends Record<string, string | number | boolean | undefined> = Record<
    string,
    string | number | boolean | undefined
  >,
> = QueryParams & T;

export interface LibraryBranch {
  id: string;
  name: string;
  code?: string | null;
  short_name?: string | null;
  slug: string;
  description?: string | null;
  about_content?: string | null;
  objectives?: string | null;
  mandates?: string | null;
  regulations?: string | null;
  mission?: string | null;
  vision?: string | null;
  address?: string | null;
  location?: string | null;
  email?: string | null;
  contact_email?: string | null;
  phone?: string | null;
  contact_phone?: string | null;
  website_url?: string | null;
  catalogue_url?: string | null;
  ebooks_url?: string | null;
  repositories_url?: string | null;
  opening_hours?: Record<string, string> | string | null;
  latitude?: number | null;
  longitude?: number | null;
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
  objectives?: string | null;
  regulations?: string | null;
  mission?: string | null;
  vision?: string | null;
  address?: string | null;
  email?: string | null;
  phone?: string | null;
  website_url?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  library_type?: string;
  is_active?: boolean;
  is_public?: boolean;
  sort_order?: number;
}

export interface LibraryHours {
  id: string;
  library_id: string;
  day_type: string;
  opens_at?: string | null;
  closes_at?: string | null;
  is_closed?: boolean;
  note?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface LibraryTodayHours {
  library_id: string;
  library_name: string;
  library_slug: string;
  day_type: string;
  is_open: boolean;
  is_closed: boolean;
  opens_at?: string | null;
  closes_at?: string | null;
  note?: string | null;
  checked_at: string;
  timezone: string;
}

export interface LibraryExternalLink {
  id: string;
  library_id: string;
  link_type: string;
  label: string;
  url: string;
  description?: string | null;
  is_active?: boolean;
  opens_in_new_tab?: boolean;
  icon?: string | null;
  sort_order?: number;
  created_at?: string;
  updated_at?: string;
}

export interface LibraryFile {
  id: string;
  library_id: string;
  media_id: string;
  title: string;
  description?: string | null;
  file_category?: string;
  access_level?: string;
  is_public?: boolean;
  sort_order?: number;
  related_entity_type?: string | null;
  related_entity_id?: string | null;
  file_url?: string | null;
  thumbnail_url?: string | null;
  media?: Record<string, unknown> | null;
  created_at?: string;
  updated_at?: string;
}

export interface LibraryStaff {
  id: string;
  library_id: string;
  person_id: string;
  job_title?: string | null;
  department?: string | null;
  department_section?: string | null;
  role?: string;
  is_public?: boolean;
  is_active?: boolean;
  bio?: string | null;
  specialization?: string | null;
  person?: {
    id: string;
    full_name?: string | null;
    email?: string | null;
    photo?: string | null;
    title?: string | null;
  } | null;
  sort_order?: number;
  created_at?: string;
  updated_at?: string;
}

export type LibraryGuideType = "subject" | "course" | "database" | "research" | "other";

export interface LibraryGuideSection {
  id: string;
  guide_id: string;
  heading: string;
  content?: string | null;
  section_type?: string | null;
  resource_links?: Array<Record<string, unknown>> | null;
  file_ids?: string[] | null;
  sort_order?: number;
  is_active?: boolean;
}

export interface LibrarySpecialist {
  id: string;
  library_id?: string | null;
  staff_id?: string | null;
  subjects?: string[] | null;
  schools?: string[] | null;
  departments?: string[] | null;
  support_areas?: string[] | null;
  booking_url?: string | null;
  is_public?: boolean;
  is_active?: boolean;
  sort_order?: number;
  created_at?: string;
  updated_at?: string;
}

export interface LibraryGuide {
  id: string;
  library_id?: string | null;
  title: string;
  slug: string;
  summary?: string | null;
  guide_type?: LibraryGuideType | string;
  subject?: string | null;
  course_code?: string | null;
  audience?: string | null;
  school_id?: string | null;
  department_id?: string | null;
  owner_staff_id?: string | null;
  is_public?: boolean;
  is_active?: boolean;
  sort_order?: number;
  sections?: LibraryGuideSection[] | null;
  specialists?: LibrarySpecialist[] | null;
  created_at?: string;
  updated_at?: string;
}

export type LibraryWorkflowType =
  | "borrowing"
  | "clearance"
  | "research"
  | "repository"
  | "other";

export interface LibraryWorkflowStep {
  id: string;
  workflow_id: string;
  title: string;
  instructions?: string | null;
  link_url?: string | null;
  file_id?: string | null;
  sort_order?: number;
  is_active?: boolean;
}

export interface LibraryWorkflow {
  id: string;
  library_id?: string | null;
  workflow_type?: LibraryWorkflowType | string;
  title: string;
  slug: string;
  summary?: string | null;
  audience?: string | null;
  is_public?: boolean;
  is_active?: boolean;
  sort_order?: number;
  steps?: LibraryWorkflowStep[] | null;
  created_at?: string;
  updated_at?: string;
}

export type LibraryPolicyType =
  | "borrowing"
  | "access"
  | "clearance"
  | "repository"
  | "other";

export interface LibraryPolicyPage {
  id: string;
  library_id?: string | null;
  policy_type?: LibraryPolicyType | string;
  title: string;
  slug: string;
  content?: string | null;
  related_regulation_id?: string | null;
  file_id?: string | null;
  is_public?: boolean;
  status?: string;
  sort_order?: number;
  created_at?: string;
  updated_at?: string;
}

export type LibraryAssistantContextStatus = "draft" | "active" | "archived";

export interface LibraryAssistantSource {
  id: string;
  context_id: string;
  source_type: string;
  source_id: string;
  title: string;
  public_url?: string | null;
  sort_order?: number;
  is_approved: boolean;
  approved_by_person_id?: string | null;
  approved_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface LibraryAssistantContext {
  id: string;
  library_id?: string | null;
  name: string;
  slug: string;
  description?: string | null;
  audience?: string | null;
  instructions?: string | null;
  allowed_source_types?: string[];
  suggested_prompts?: Array<Record<string, unknown>>;
  escalation_guidance?: string | null;
  status?: LibraryAssistantContextStatus;
  is_public?: boolean;
  published_at?: string | null;
  sort_order?: number;
  sources?: LibraryAssistantSource[];
  created_at?: string;
  updated_at?: string;
}

export interface LibraryAssistantSourcePayload {
  source_type: string;
  source_id: string;
  title: string;
  public_url?: string | null;
  sort_order?: number;
}

export interface LibraryAssistantContextPayload {
  library_id?: string | null;
  name: string;
  slug: string;
  description?: string | null;
  audience?: string | null;
  instructions: string;
  allowed_source_types?: string[];
  suggested_prompts?: Array<Record<string, unknown>>;
  escalation_guidance?: string | null;
  sort_order?: number;
  sources?: LibraryAssistantSourcePayload[];
}

export interface LibraryServiceRecord {
  id: string;
  library_id: string;
  name: string;
  slug?: string;
  description?: string | null;
  eligibility?: string | null;
  service_type?: string;
  how_to_access?: string | null;
  contact_info?: string | null;
  is_public?: boolean;
  is_active?: boolean;
  sort_order?: number;
  icon_media_id?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface LibraryRegulation {
  id: string;
  library_id?: string | null;
  title: string;
  slug?: string;
  category?: string | null;
  content?: string | null;
  effective_date?: string | null;
  status?: string;
  is_public?: boolean;
  sort_order?: number;
  created_at?: string;
  updated_at?: string;
}

export interface LibraryInquiry {
  id: string;
  library_id?: string | null;
  library?: LibraryBranch | null;
  sender_name: string;
  sender_email: string;
  sender_phone?: string | null;
  person_id?: string | null;
  subject: string;
  message: string;
  status: string;
  replied_at?: string | null;
  reply_message?: string | null;
  replied_by_person_id?: string | null;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface LibraryInquiryPayload {
  library_id?: string | null;
  sender_name: string;
  sender_email: string;
  sender_phone?: string | null;
  subject: string;
  message: string;
}

export interface LibraryInquiryUpdatePayload {
  status?: string;
}

export interface LibraryInquiryReplyPayload {
  reply_message: string;
}

export interface LibrarySupportTicket {
  id: string;
  requester_person_id?: string | null;
  requester_email?: string | null;
  requester_name?: string | null;
  subject: string;
  description: string;
  target_entity_type?: string | null;
  target_entity_id?: string | null;
  target?: {
    id: string;
    type: string;
    label: string;
    description?: string | null;
  } | null;
  status: string;
  priority: string;
  category: string;
  assigned_to_person_id?: string | null;
  resolved_at?: string | null;
  resolution_notes?: string | null;
  meta?: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface LibrarySupportTicketPayload {
  requester_email?: string | null;
  requester_name?: string | null;
  subject: string;
  description: string;
  target_entity_type?: string | null;
  target_entity_id?: string | null;
  priority?: string;
  category?: string;
}

export interface LibrarySupportTicketUpdatePayload {
  status?: string | null;
  priority?: string | null;
  assigned_to_person_id?: string | null;
  resolved_at?: string | null;
  resolution_notes?: string | null;
  meta?: Record<string, unknown> | null;
}

export interface LibraryElectronicResource {
  id: string;
  library_id?: string | null;
  name: string;
  title?: string | null;
  slug?: string;
  provider?: string | null;
  description?: string | null;
  access_url?: string | null;
  url?: string | null;
  section_letter?: string;
  resource_type?: string;
  type?: string | null;
  subjects?: string[] | null;
  coverage_dates?: string | null;
  simultaneous_users?: string | null;
  access_level?: string;
  access_type?: string;
  requires_vpn?: boolean;
  requires_registration?: boolean;
  is_active?: boolean;
  is_available?: boolean;
  is_featured?: boolean;
  sort_order?: number;
  logo_image_id?: string | null;
  notes?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface LibraryResource {
  id: string;
  library_id: string;
  title: string;
  subtitle?: string | null;
  authors?: string | null;
  author?: string | null;
  publisher?: string | null;
  publication_year?: number | null;
  edition?: string | null;
  language?: string | null;
  isbn?: string | null;
  issn?: string | null;
  call_number?: string | null;
  barcode?: string | null;
  type?: string | null;
  resource_type?: string;
  status?: string;
  location_shelf?: string | null;
  location?: string | null;
  total_copies?: number;
  quantity?: number;
  available_copies?: number;
  available_quantity?: number;
  subject_tags?: string[] | null;
  description?: string | null;
  url?: string | null;
  cover_image?: string | null;
  default_loan_days?: number | null;
  is_loanable?: boolean;
  is_available?: boolean;
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
  edition?: string | null;
  language?: string | null;
  isbn?: string | null;
  issn?: string | null;
  call_number?: string | null;
  barcode?: string | null;
  resource_type?: string;
  status?: string;
  location_shelf?: string | null;
  total_copies?: number;
  available_copies?: number;
  subject_tags?: string[] | null;
  description?: string | null;
  default_loan_days?: number | null;
  is_loanable?: boolean;
  is_reference_only?: boolean;
  is_active?: boolean;
}

export interface LibraryLoan {
  id: string;
  resource_id: string;
  resource?: LibraryResource | null;
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

export interface LibraryReservation {
  id: string;
  resource_id: string;
  resource?: LibraryResource | null;
  requester_person_id: string;
  reserved_at: string;
  expires_at?: string | null;
  ready_at?: string | null;
  status: string;
  queue_position: number;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface LibraryReservationPayload {
  resource_id: string;
  requester_person_id: string;
  notes?: string | null;
}

export interface LibraryReservationUpdatePayload {
  status?: string;
  expires_at?: string | null;
  ready_at?: string | null;
  queue_position?: number;
  notes?: string | null;
}

export interface LibraryCharge {
  id: string;
  library_id: string;
  name: string;
  description?: string | null;
  charge_type: string;
  amount: string;
  rate_unit: string;
  currency: string;
  is_active: boolean;
  effective_from?: string | null;
  effective_to?: string | null;
  created_at: string;
  updated_at: string;
}

export type LibraryChargePayload = Omit<
  LibraryCharge,
  "id" | "created_at" | "updated_at"
>;

export type LibraryGenericRecord = Record<string, unknown> & {
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

export type LibraryGenericPayload = Record<string, unknown>;

export interface LibrarySearchResult {
  id: string;
  type: string;
  title: string;
  description?: string | null;
  url?: string | null;
  library_id?: string | null;
  library_name?: string | null;
  metadata: Record<string, unknown>;
}

export interface LibrarySearchResponse {
  query: string;
  total: number;
  results: LibrarySearchResult[];
  by_type: Record<string, number>;
}

function crudApi<TRecord, TPayload>(path: string) {
  return {
    list: (params?: ListParams) =>
      libraryApi.get<PaginatedResponse<TRecord>>(path, params),
    get: (id: string, params?: FieldSelectionParams) =>
      libraryApi.get<{ data: TRecord }>(`${path}${id}`, params),
    create: (data: TPayload) => libraryApi.post<{ data: TRecord }>(path, data),
    update: (id: string, data: Partial<TPayload>) =>
      libraryApi.patch<{ data: TRecord }>(`${path}${id}`, data),
    delete: (id: string) => libraryApi.delete<void>(`${path}${id}`),
  };
}

function publicSlugApi<TRecord, TPayload>(path: string) {
  return {
    ...crudApi<TRecord, TPayload>(path),
    getBySlug: (slug: string, params?: FieldSelectionParams) =>
      libraryApi.get<{ data: TRecord }>(`${path}slug/${slug}`, params),
  };
}

export const libraryServiceApi = {
  stats: () => libraryApi.get<{ data: PublicStatsResponse }>("/api/v1/stats"),
  adminStats: () =>
    libraryApi.get<{ data: PublicStatsResponse }>("/api/v1/stats/admin"),
  branches: {
    list: (params?: ListParams<{ active_only?: boolean }>) =>
      libraryApi.get<PaginatedResponse<LibraryBranch>>(
        "/api/v1/library/branches/",
        params,
      ),
    get: (id: string, params?: FieldSelectionParams) =>
      libraryApi.get<{ data: LibraryBranch }>(
        `/api/v1/library/branches/${id}`,
        params,
      ),
    create: (data: LibraryBranchPayload) =>
      libraryApi.post<{ data: LibraryBranch }>(
        "/api/v1/library/branches/",
        data,
      ),
    update: (id: string, data: Partial<LibraryBranchPayload>) =>
      libraryApi.patch<{ data: LibraryBranch }>(
        `/api/v1/library/branches/${id}`,
        data,
      ),
    delete: (id: string) =>
      libraryApi.delete<void>(`/api/v1/library/branches/${id}`),
    hours: (id: string) =>
      libraryApi.get<{ data: LibraryHours[] }>(
        `/api/v1/library/branches/${id}/hours/`,
      ),
    todayHours: (id: string, params?: ListParams<{ timezone?: string }>) =>
      libraryApi.get<{ data: LibraryTodayHours | null }>(
        `/api/v1/library/branches/${id}/hours/today`,
        params,
      ),
    links: (id: string, params?: ListParams<{ active_only?: boolean }>) =>
      libraryApi.get<{ data: LibraryExternalLink[] }>(
        `/api/v1/library/branches/${id}/links/`,
        params,
      ),
    files: (id: string, params?: FieldSelectionParams) =>
      libraryApi.get<{ data: LibraryFile[] }>(
        `/api/v1/library/branches/${id}/files/`,
        params,
      ),
  },
  todayHours: (params?: ListParams<{ timezone?: string }>) =>
    libraryApi.get<{ data: LibraryTodayHours[] }>(
      "/api/v1/library/hours/today",
      params,
    ),
  search: (
    params: ListParams<{
      q: string;
      types?: string;
      library_id?: string;
      limit?: number;
    }>,
  ) =>
    libraryApi.get<{ data: LibrarySearchResponse }>(
      "/api/v1/library/search",
      params,
    ),
  assistantContexts: {
    publicList: (params?: ListParams<{ library_id?: string }>) =>
      libraryApi.get<{ data: LibraryAssistantContext[] }>(
        "/api/v1/library/assistant-contexts/public",
        params,
      ),
    list: (params?: ListParams<{ library_id?: string; status?: string }>) =>
      libraryApi.get<{ data: LibraryAssistantContext[] }>(
        "/api/v1/library/assistant-contexts/",
        params,
      ),
    get: (id: string) =>
      libraryApi.get<{ data: LibraryAssistantContext }>(
        `/api/v1/library/assistant-contexts/${id}`,
      ),
    create: (data: LibraryAssistantContextPayload) =>
      libraryApi.post<{ data: LibraryAssistantContext }>(
        "/api/v1/library/assistant-contexts/",
        data,
      ),
    update: (id: string, data: Partial<LibraryAssistantContextPayload>) =>
      libraryApi.patch<{ data: LibraryAssistantContext }>(
        `/api/v1/library/assistant-contexts/${id}`,
        data,
      ),
    publish: (id: string) =>
      libraryApi.post<{ data: LibraryAssistantContext }>(
        `/api/v1/library/assistant-contexts/${id}/publish`,
        {},
      ),
    archive: (id: string) =>
      libraryApi.post<{ data: LibraryAssistantContext }>(
        `/api/v1/library/assistant-contexts/${id}/archive`,
        {},
      ),
  },
  resources: {
    list: (
      params: ListParams<{
        library_id: string;
        resource_type?: string;
        status?: string;
        q?: string;
      }>,
    ) =>
      libraryApi.get<PaginatedResponse<LibraryResource>>(
        "/api/v1/library/resources/",
        params,
      ),
    get: (id: string, params?: FieldSelectionParams) =>
      libraryApi.get<{ data: LibraryResource }>(
        `/api/v1/library/resources/${id}`,
        params,
      ),
    create: (data: LibraryResourcePayload) =>
      libraryApi.post<{ data: LibraryResource }>(
        "/api/v1/library/resources/",
        data,
      ),
    update: (id: string, data: Partial<LibraryResourcePayload>) =>
      libraryApi.patch<{ data: LibraryResource }>(
        `/api/v1/library/resources/${id}`,
        data,
      ),
    delete: (id: string) =>
      libraryApi.delete<void>(`/api/v1/library/resources/${id}`),
  },
  loans: {
    list: (
      params?: ListParams<{
        library_id?: string;
        resource_id?: string;
        status?: string;
      }>,
    ) =>
      libraryApi.get<PaginatedResponse<LibraryLoan>>(
        "/api/v1/library/loans/",
        params,
      ),
    get: (id: string) =>
      libraryApi.get<{ data: LibraryLoan }>(`/api/v1/library/loans/${id}`),
    create: (data: LibraryLoanPayload) =>
      libraryApi.post<{ data: LibraryLoan }>("/api/v1/library/loans/", data),
    update: (id: string, data: Partial<LibraryLoan>) =>
      libraryApi.patch<{ data: LibraryLoan }>(
        `/api/v1/library/loans/${id}`,
        data,
      ),
    renew: (id: string) =>
      libraryApi.post<{ data: LibraryLoan }>(
        `/api/v1/library/loans/${id}/renew`,
        {},
      ),
  },
  reservations: {
    list: (
      params?: ListParams<{
        library_id?: string;
        resource_id?: string;
        status?: string;
      }>,
    ) =>
      libraryApi.get<PaginatedResponse<LibraryReservation>>(
        "/api/v1/library/reservations/",
        params,
      ),
    create: (data: LibraryReservationPayload) =>
      libraryApi.post<{ data: LibraryReservation }>(
        "/api/v1/library/reservations/",
        data,
      ),
    update: (id: string, data: LibraryReservationUpdatePayload) =>
      libraryApi.patch<{ data: LibraryReservation }>(
        `/api/v1/library/reservations/${id}`,
        data,
      ),
    cancel: (id: string) =>
      libraryApi.delete<void>(`/api/v1/library/reservations/${id}`),
  },
  charges: {
    list: (params: ListParams<{ library_id: string; active_only?: boolean }>) =>
      libraryApi.get<{ data: LibraryCharge[] }>(
        "/api/v1/library/charges/",
        params,
      ),
    create: (data: LibraryChargePayload) =>
      libraryApi.post<{ data: LibraryCharge }>(
        "/api/v1/library/charges/",
        data,
      ),
    update: (id: string, data: Partial<LibraryChargePayload>) =>
      libraryApi.patch<{ data: LibraryCharge }>(
        `/api/v1/library/charges/${id}`,
        data,
      ),
    delete: (id: string) =>
      libraryApi.delete<void>(`/api/v1/library/charges/${id}`),
  },
  databases: crudApi<LibraryElectronicResource, LibraryGenericPayload>(
    "/api/v1/library/databases/",
  ),
  guides: publicSlugApi<LibraryGuide, LibraryGenericPayload>(
    "/api/v1/library/guides/",
  ),
  specialists: crudApi<LibrarySpecialist, LibraryGenericPayload>(
    "/api/v1/library/specialists/",
  ),
  workflows: publicSlugApi<LibraryWorkflow, LibraryGenericPayload>(
    "/api/v1/library/workflows/",
  ),
  policies: publicSlugApi<LibraryPolicyPage, LibraryGenericPayload>(
    "/api/v1/library/policies/",
  ),
  inquiries: {
    ...crudApi<LibraryInquiry, LibraryInquiryPayload>(
      "/api/v1/library/inquiries/",
    ),
    update: (id: string, data: LibraryInquiryUpdatePayload) =>
      libraryApi.patch<{ data: LibraryInquiry }>(
        `/api/v1/library/inquiries/${id}`,
        data,
      ),
    reply: (id: string, data: LibraryInquiryReplyPayload) =>
      libraryApi.post<{ data: LibraryInquiry }>(
        `/api/v1/library/inquiries/${id}/reply`,
        data,
      ),
  },
  tickets: crudApi<
    LibrarySupportTicket,
    LibrarySupportTicketPayload | LibrarySupportTicketUpdatePayload
  >("/api/v1/library/tickets/"),
  regulations: crudApi<LibraryRegulation, LibraryGenericPayload>(
    "/api/v1/library/regulations/",
  ),
  staff: {
    list: (params: ListParams<{ library_id: string }>) =>
      libraryApi.get<{ data: LibraryStaff[] }>(
        "/api/v1/library/staff/",
        params,
      ),
    leadership: (params?: ListParams<{ library_id?: string }>) =>
      libraryApi.get<{ data: LibraryStaff[] }>(
        "/api/v1/library/staff/leadership",
        params,
      ),
    create: (data: LibraryGenericPayload) =>
      libraryApi.post<{ data: LibraryStaff }>("/api/v1/library/staff/", data),
    update: (id: string, data: Partial<LibraryGenericPayload>) =>
      libraryApi.patch<{ data: LibraryStaff }>(
        `/api/v1/library/staff/${id}`,
        data,
      ),
    delete: (id: string) =>
      libraryApi.delete<void>(`/api/v1/library/staff/${id}`),
  },
  services: crudApi<LibraryServiceRecord, LibraryGenericPayload>(
    "/api/v1/library/services/",
  ),
  statistics: crudApi<LibraryGenericRecord, LibraryGenericPayload>(
    "/api/v1/library/statistics/",
  ),
};
