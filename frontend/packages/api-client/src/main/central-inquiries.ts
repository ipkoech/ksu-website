import { mainApi } from "../client";
import type {
  PaginatedResponse,
  SchoolInquiry,
  SchoolInquiryMessage,
  SchoolInquiryStatus,
} from "./types";

const BASE_PATH = "/api/v1/admin/inquiries";

export type CentralInquiryFilters = {
  page?: number;
  per_page?: number;
  status?: string;
  category?: string;
  priority?: string;
  assigned_to_user_id?: string;
  target_entity_type?: string;
  owner_scope_type?: string;
  owner_scope_id?: string;
  search?: string;
  created_from?: string;
  created_to?: string;
};

export const centralInquiryQueryKeys = {
  all: ["admin", "inquiries"] as const,
  list: (filters: CentralInquiryFilters) =>
    [...centralInquiryQueryKeys.all, "list", filters] as const,
  detail: (id: string) =>
    [...centralInquiryQueryKeys.all, "detail", id] as const,
};

export const centralInquiryApi = {
  list: (params: CentralInquiryFilters = {}) =>
    mainApi.get<PaginatedResponse<SchoolInquiry>>(BASE_PATH, params),
  get: (id: string) =>
    mainApi.get<{ data: SchoolInquiry }>(`${BASE_PATH}/${id}`),
  assign: (id: string, assignedToUserId: string | null) =>
    mainApi.patch<{ data: SchoolInquiry }>(`${BASE_PATH}/${id}/assign`, {
      assigned_to_user_id: assignedToUserId,
    }),
  updateStatus: (id: string, status: SchoolInquiryStatus) =>
    mainApi.patch<{ data: SchoolInquiry }>(`${BASE_PATH}/${id}/status`, {
      status,
    }),
  addNote: (id: string, body: string) =>
    mainApi.post<{ data: SchoolInquiryMessage }>(`${BASE_PATH}/${id}/notes`, {
      body,
    }),
  reply: (id: string, body: string, idempotencyKey: string) =>
    mainApi.post<{ data: SchoolInquiryMessage }>(
      `${BASE_PATH}/${id}/replies`,
      { body, idempotency_key: idempotencyKey },
    ),
  retryMessage: (id: string, messageId: string) =>
    mainApi.post<{ data: SchoolInquiryMessage }>(
      `${BASE_PATH}/${id}/messages/${messageId}/retry`,
    ),
};
