import { mainApi } from "../client";
import { getStoredAccessToken } from "../auth-tokens";
import { getMainApiBaseUrl } from "../service-urls";
import type {
  ImportCommitResult,
  ImportPreview,
  Media,
  PaginatedResponse,
  SchoolDepartmentPayload,
  SchoolDepartmentRecord,
  SchoolAuditLog,
  SchoolContentListItem,
  SchoolContentRecord,
  SchoolContentType,
  SchoolPortalCapabilitiesResponse,
  SchoolPortalContextResponse,
  SchoolPortalDashboardRange,
  SchoolPortalDashboardResponse,
  SchoolPortalProfile,
  SchoolPortalProfileUpdate,
  SchoolInquiry,
  SchoolInquiryMessage,
  SchoolInquiryStatus,
  SchoolNotification,
  SchoolProgrammePayload,
  SchoolProgrammeRecord,
  SchoolPublicationPayload,
  SchoolPublicationRecord,
  SchoolTeamMember,
  SchoolTeamMemberCreate,
  SchoolTeamPersonOption,
  SchoolUploadBatch,
  SchoolUploadBatchFile,
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

async function schoolPortalUploadFiles<T>(
  path: string,
  files: File[],
  fields: Record<string, string> = {},
): Promise<T> {
  const formData = new FormData();
  files.forEach((file) => formData.append("files", file));
  Object.entries(fields).forEach(([key, value]) => formData.append(key, value));
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
  audit: (schoolId: string) =>
    [...schoolPortalQueryKeys.root(schoolId), "audit"] as const,
  notifications: (schoolId: string) =>
    [...schoolPortalQueryKeys.root(schoolId), "notifications"] as const,
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
    unlinkMedia: (linkId: string) =>
      mainApi.delete<{ data: SchoolPortalProfile }>(
        `${BASE_PATH}/profile/media/${linkId}`,
      ),
  },
  team: {
    personOptions: (params?: { page?: number; per_page?: number; search?: string }) =>
      mainApi.get<PaginatedResponse<SchoolTeamPersonOption>>(
        `${BASE_PATH}/team/person-options`,
        params,
      ),
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
  content: {
    list: (contentType?: SchoolContentType) =>
      mainApi.get<{ data: SchoolContentListItem[] }>(
        `${BASE_PATH}/content`,
        contentType ? { content_type: contentType } : undefined,
      ),
    get: (contentType: SchoolContentType, id: string) =>
      mainApi.get<{ data: SchoolContentRecord }>(
        `${BASE_PATH}/content/${contentType}/${id}`,
      ),
    create: (contentType: SchoolContentType, data: Record<string, unknown>) =>
      mainApi.post<{ data: SchoolContentRecord }>(`${BASE_PATH}/content`, {
        content_type: contentType,
        data,
      }),
    update: (
      contentType: SchoolContentType,
      id: string,
      data: Record<string, unknown>,
    ) =>
      mainApi.patch<{ data: SchoolContentRecord }>(
        `${BASE_PATH}/content/${contentType}/${id}`,
        { content_type: contentType, data },
      ),
    remove: (contentType: SchoolContentType, id: string) =>
      mainApi.delete<void>(`${BASE_PATH}/content/${contentType}/${id}`),
    action: (
      contentType: SchoolContentType,
      id: string,
      action: "submit" | "withdraw",
      comments?: string,
    ) =>
      mainApi.post<{ data: SchoolContentRecord }>(
        `${BASE_PATH}/content/${contentType}/${id}/${action}`,
        { comments: comments || null },
      ),
  },
  publications: {
    list: (params?: { page?: number; per_page?: number; status?: string }) =>
      mainApi.get<PaginatedResponse<SchoolPublicationRecord>>(
        `${BASE_PATH}/publications`,
        params,
      ),
    get: (id: string) =>
      mainApi.get<{ data: SchoolPublicationRecord }>(
        `${BASE_PATH}/publications/${id}`,
      ),
    create: (data: SchoolPublicationPayload) =>
      mainApi.post<{ data: SchoolPublicationRecord }>(
        `${BASE_PATH}/publications`,
        data,
      ),
    update: (id: string, data: SchoolPublicationPayload) =>
      mainApi.patch<{ data: SchoolPublicationRecord }>(
        `${BASE_PATH}/publications/${id}`,
        data,
      ),
    action: (id: string, action: "submit" | "withdraw") =>
      mainApi.post<{ data: SchoolPublicationRecord }>(
        `${BASE_PATH}/publications/${id}/${action}`,
      ),
  },
  media: {
    update: (
      mediaId: string,
      data: {
        title?: string | null;
        alt_text?: string | null;
        description?: string | null;
        caption?: string | null;
        credit?: string | null;
        tags?: string[] | null;
        is_public?: boolean | null;
        metadata?: Record<string, unknown> | null;
      },
    ) =>
      mainApi.patch<{ data: Media }>(
        `${BASE_PATH}/media/${mediaId}`,
        data,
      ),
    remove: (mediaId: string) =>
      mainApi.delete<void>(`${BASE_PATH}/media/${mediaId}`),
    createBatch: (
      files: File[],
      options?: {
        targetEntityType?: string;
        targetEntityId?: string;
        targetRole?: string;
      },
    ) =>
      schoolPortalUploadFiles<{ data: SchoolUploadBatch }>(
        `${BASE_PATH}/media/batches`,
        files,
        {
          ...(options?.targetEntityType
            ? { target_entity_type: options.targetEntityType }
            : {}),
          ...(options?.targetEntityId
            ? { target_entity_id: options.targetEntityId }
            : {}),
          target_role: options?.targetRole ?? "attachment",
        },
      ),
    getBatch: (batchId: string) =>
      mainApi.get<{ data: SchoolUploadBatch }>(
        `${BASE_PATH}/media/batches/${batchId}`,
      ),
    retryFile: (batchId: string, fileId: string) =>
      mainApi.post<{ data: SchoolUploadBatchFile }>(
        `${BASE_PATH}/media/batches/${batchId}/files/${fileId}/retry`,
      ),
  },
  inquiries: {
    list: (params?: {
      page?: number;
      per_page?: number;
      status?: string;
      category?: string;
      priority?: string;
      assigned_to_user_id?: string;
      created_from?: string;
      created_to?: string;
    }) =>
      mainApi.get<PaginatedResponse<SchoolInquiry>>(
        `${BASE_PATH}/inquiries`,
        params,
      ),
    get: (id: string) =>
      mainApi.get<{ data: SchoolInquiry }>(`${BASE_PATH}/inquiries/${id}`),
    assign: (id: string, assignedToUserId: string | null) =>
      mainApi.patch<{ data: SchoolInquiry }>(
        `${BASE_PATH}/inquiries/${id}/assign`,
        { assigned_to_user_id: assignedToUserId },
      ),
    updateStatus: (id: string, status: SchoolInquiryStatus) =>
      mainApi.patch<{ data: SchoolInquiry }>(
        `${BASE_PATH}/inquiries/${id}/status`,
        { status },
      ),
    addNote: (id: string, body: string) =>
      mainApi.post<{ data: SchoolInquiryMessage }>(
        `${BASE_PATH}/inquiries/${id}/notes`,
        { body },
      ),
    reply: (id: string, body: string, idempotencyKey: string) =>
      mainApi.post<{ data: SchoolInquiryMessage }>(
        `${BASE_PATH}/inquiries/${id}/replies`,
        { body, idempotency_key: idempotencyKey },
      ),
    retryMessage: (id: string, messageId: string) =>
      mainApi.post<{ data: SchoolInquiryMessage }>(
        `${BASE_PATH}/inquiries/${id}/messages/${messageId}/retry`,
      ),
  },
  notifications: {
    list: (params?: {
      page?: number;
      per_page?: number;
      unread_only?: boolean;
    }) =>
      mainApi.get<PaginatedResponse<SchoolNotification>>(
        `${BASE_PATH}/notifications`,
        params,
      ),
    markRead: (id: string) =>
      mainApi.patch<{ data: SchoolNotification }>(
        `${BASE_PATH}/notifications/${id}/read`,
      ),
    markAllRead: () =>
      mainApi.post<{ data: { updated: number } }>(
        `${BASE_PATH}/notifications/read-all`,
      ),
    archive: (id: string) =>
      mainApi.post<{ data: SchoolNotification }>(
        `${BASE_PATH}/notifications/${id}/archive`,
      ),
  },
  audit: {
    list: (params?: {
      page?: number;
      per_page?: number;
      action?: string;
      resource_type?: string;
      status?: string;
    }) =>
      mainApi.get<PaginatedResponse<SchoolAuditLog>>(
        `${BASE_PATH}/audit`,
        params,
      ),
  },
};
