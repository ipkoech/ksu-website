import { mainApi } from "../client";
import { getStoredAccessToken } from "../auth-tokens";
import { getMainApiBaseUrl } from "../service-urls";
import type {
  ImportCommitResult,
  ImportPreview,
  PaginatedResponse,
  SchoolDepartmentPayload,
  SchoolDepartmentRecord,
  SchoolPortalCapabilitiesResponse,
  SchoolPortalContextResponse,
  SchoolPortalDashboardRange,
  SchoolPortalDashboardResponse,
  SchoolPortalProfile,
  SchoolPortalProfileUpdate,
  SchoolProgrammePayload,
  SchoolProgrammeRecord,
  SchoolTeamMember,
  SchoolTeamMemberCreate,
} from "./types";

const BASE_PATH = "/api/v1/school-portal";

async function schoolPortalUpload<T>(path: string, file: File): Promise<T> {
  const formData = new FormData();
  formData.append("file", file);
  const token = getStoredAccessToken();
  const response = await fetch(`${getMainApiBaseUrl()}${path}`, {
    method: "POST",
    credentials: "include",
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    body: formData,
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || error.message || "Upload failed");
  }
  return response.json() as Promise<T>;
}

export const schoolPortalQueryKeys = {
  bootstrap: ["school-portal", "context"] as const,
  root: (schoolId: string) => ["school-portal", schoolId] as const,
  context: (schoolId: string) =>
    [...schoolPortalQueryKeys.root(schoolId), "context"] as const,
  dashboard: (schoolId: string, range: string) =>
    [...schoolPortalQueryKeys.root(schoolId), "dashboard", range] as const,
  profile: (schoolId: string) =>
    [...schoolPortalQueryKeys.root(schoolId), "profile"] as const,
  team: (schoolId: string) =>
    [...schoolPortalQueryKeys.root(schoolId), "team"] as const,
  departments: (schoolId: string) =>
    [...schoolPortalQueryKeys.root(schoolId), "departments"] as const,
  programmes: (schoolId: string) =>
    [...schoolPortalQueryKeys.root(schoolId), "programmes"] as const,
  publications: (schoolId: string) =>
    [...schoolPortalQueryKeys.root(schoolId), "publications"] as const,
  content: (schoolId: string) =>
    [...schoolPortalQueryKeys.root(schoolId), "content"] as const,
  media: (schoolId: string) =>
    [...schoolPortalQueryKeys.root(schoolId), "media"] as const,
  inquiries: (schoolId: string) =>
    [...schoolPortalQueryKeys.root(schoolId), "inquiries"] as const,
};

export const schoolPortalApi = {
  context: () =>
    mainApi.get<{ data: SchoolPortalContextResponse }>(
      "/api/v1/school-portal/context",
    ),
  capabilities: () =>
    mainApi.get<{ data: SchoolPortalCapabilitiesResponse }>(
      `${BASE_PATH}/capabilities`,
    ),
  dashboard: (range: SchoolPortalDashboardRange) =>
    mainApi.get<{ data: SchoolPortalDashboardResponse }>(
      `${BASE_PATH}/dashboard`,
      { range },
    ),
  profile: {
    get: () =>
      mainApi.get<{ data: SchoolPortalProfile }>(`${BASE_PATH}/profile`),
    update: (data: SchoolPortalProfileUpdate) =>
      mainApi.patch<{ data: SchoolPortalProfile }>(
        `${BASE_PATH}/profile`,
        data,
      ),
    setDean: (personId: string, reassignExisting = false) =>
      mainApi.put<{ data: SchoolPortalProfile }>(`${BASE_PATH}/profile/dean`, {
        person_id: personId,
        reassign_existing: reassignExisting,
      }),
    linkMedia: (
      mediaId: string,
      role: "logo" | "cover" | "brochure" | "gallery",
      displayOrder = 100,
    ) =>
      mainApi.post<{ data: SchoolPortalProfile }>(
        `${BASE_PATH}/profile/media`,
        { media_id: mediaId, role, display_order: displayOrder },
      ),
  },
  team: {
    list: (params?: {
      page?: number;
      per_page?: number;
      search?: string;
      status?: string;
      role?: string;
      sort?: "hierarchy_level" | "display_order" | "created_at" | "role";
      order?: "asc" | "desc";
    }) =>
      mainApi.get<PaginatedResponse<SchoolTeamMember>>(
        `${BASE_PATH}/team`,
        params,
      ),
    get: (assignmentId: string) =>
      mainApi.get<{ data: SchoolTeamMember }>(
        `${BASE_PATH}/team/${assignmentId}`,
      ),
    create: (data: SchoolTeamMemberCreate) =>
      mainApi.post<{ data: SchoolTeamMember }>(`${BASE_PATH}/team`, data),
    update: (assignmentId: string, data: Partial<SchoolTeamMemberCreate>) =>
      mainApi.patch<{ data: SchoolTeamMember }>(
        `${BASE_PATH}/team/${assignmentId}`,
        data,
      ),
    lifecycle: (
      assignmentId: string,
      action: "activate" | "deactivate" | "end",
      data?: {
        replacement_person_id?: string | null;
        acknowledge_vacancy?: boolean;
        notes?: string | null;
        effective_date?: string | null;
      },
    ) =>
      mainApi.post<{ data: SchoolTeamMember }>(
        `${BASE_PATH}/team/${assignmentId}/${action}`,
        data,
      ),
    revokeAccess: (assignmentId: string) =>
      mainApi.post<void>(`${BASE_PATH}/team/${assignmentId}/revoke-access`),
    resendInvite: (assignmentId: string) =>
      mainApi.post<void>(`${BASE_PATH}/team/${assignmentId}/resend-invite`),
    remove: (assignmentId: string) =>
      mainApi.delete<void>(`${BASE_PATH}/team/${assignmentId}`),
    previewImport: (file: File) =>
      schoolPortalUpload<{ data: ImportPreview }>(
        `${BASE_PATH}/team/imports/preview`,
        file,
      ),
    commitImport: (
      rows: Array<Record<string, unknown>>,
      mode: "partial" | "all_or_nothing",
      idempotencyKey: string,
    ) =>
      mainApi.post<{ data: { job_id: string; status: string } }>(
        `${BASE_PATH}/team/imports`,
        { rows, mode, idempotency_key: idempotencyKey },
      ),
    templateUrl: (format: "csv" | "xlsx" = "csv") =>
      `${getMainApiBaseUrl()}${BASE_PATH}/team/imports/template?format=${format}`,
  },
  departments: {
    list: (params?: {
      page?: number;
      per_page?: number;
      search?: string;
      department_type?: string;
      is_active?: boolean;
      is_public?: boolean;
    }) =>
      mainApi.get<PaginatedResponse<SchoolDepartmentRecord>>(
        `${BASE_PATH}/departments`,
        params,
      ),
    get: (id: string) =>
      mainApi.get<{ data: SchoolDepartmentRecord }>(
        `${BASE_PATH}/departments/${id}`,
      ),
    create: (data: SchoolDepartmentPayload) =>
      mainApi.post<{ data: SchoolDepartmentRecord }>(
        `${BASE_PATH}/departments`,
        data,
      ),
    update: (id: string, data: Partial<SchoolDepartmentPayload>) =>
      mainApi.patch<{ data: SchoolDepartmentRecord }>(
        `${BASE_PATH}/departments/${id}`,
        data,
      ),
    remove: (id: string) =>
      mainApi.delete<void>(`${BASE_PATH}/departments/${id}`),
    previewImport: (rows: Array<Record<string, unknown>>) =>
      mainApi.post<{ data: ImportPreview }>(
        `${BASE_PATH}/departments/imports/preview`,
        { resource: "departments", rows, mode: "partial" },
      ),
    commitImport: (
      rows: Array<Record<string, unknown>>,
      mode: "partial" | "all_or_nothing",
      _idempotencyKey: string,
    ) =>
      mainApi.post<{ data: ImportCommitResult }>(
        `${BASE_PATH}/departments/imports`,
        { resource: "departments", rows, mode },
      ),
  },
  programmes: {
    list: (params?: {
      page?: number;
      per_page?: number;
      search?: string;
      department_id?: string;
      level?: string;
      mode_of_study?: string;
      is_active?: boolean;
    }) =>
      mainApi.get<PaginatedResponse<SchoolProgrammeRecord>>(
        `${BASE_PATH}/programmes`,
        params,
      ),
    get: (id: string) =>
      mainApi.get<{ data: SchoolProgrammeRecord }>(
        `${BASE_PATH}/programmes/${id}`,
      ),
    create: (data: SchoolProgrammePayload) =>
      mainApi.post<{ data: SchoolProgrammeRecord }>(
        `${BASE_PATH}/programmes`,
        data,
      ),
    update: (id: string, data: Partial<SchoolProgrammePayload>) =>
      mainApi.patch<{ data: SchoolProgrammeRecord }>(
        `${BASE_PATH}/programmes/${id}`,
        data,
      ),
    remove: (id: string) =>
      mainApi.delete<void>(`${BASE_PATH}/programmes/${id}`),
    previewImport: (rows: Array<Record<string, unknown>>) =>
      mainApi.post<{ data: ImportPreview }>(
        `${BASE_PATH}/programmes/imports/preview`,
        { resource: "programmes", rows, mode: "partial" },
      ),
    commitImport: (
      rows: Array<Record<string, unknown>>,
      mode: "partial" | "all_or_nothing",
      _idempotencyKey: string,
    ) =>
      mainApi.post<{ data: ImportCommitResult }>(
        `${BASE_PATH}/programmes/imports`,
        { resource: "programmes", rows, mode },
      ),
  },
};
