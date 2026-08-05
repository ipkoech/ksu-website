import { mainApi } from "../client";
import type { PaginatedResponse } from "./types";

const BASE_PATH = "/api/v1/social-posts";

export type SocialPlatform = "x" | "facebook" | "instagram" | "linkedin";

export const SOCIAL_PLATFORMS: SocialPlatform[] = [
  "x",
  "facebook",
  "instagram",
  "linkedin",
];

/** Mirrors PLATFORM_CONSTRAINTS in services/main/app/helpers/social.py */
export const SOCIAL_PLATFORM_LIMITS: Record<
  SocialPlatform,
  { label: string; maxTextLength: number; maxMediaCount: number }
> = {
  x: { label: "X (Twitter)", maxTextLength: 280, maxMediaCount: 4 },
  facebook: { label: "Facebook", maxTextLength: 63206, maxMediaCount: 10 },
  instagram: { label: "Instagram", maxTextLength: 2200, maxMediaCount: 10 },
  linkedin: { label: "LinkedIn", maxTextLength: 3000, maxMediaCount: 9 },
};

export type SocialPostStatus =
  | "draft"
  | "scheduled"
  | "published"
  | "failed"
  | "validated";

export type SocialDeliveryStatus =
  | "draft"
  | "scheduled"
  | "posted"
  | "failed"
  | "validated";

export interface SocialMediaDelivery {
  id: string;
  social_post_id: string;
  platform: SocialPlatform | string;
  account_id?: string | null;
  status: SocialDeliveryStatus | string;
  provider_post_id?: string | null;
  attempts: number;
  last_attempted_at?: string | null;
  posted_at?: string | null;
  error_message?: string | null;
  validation_errors?: Array<Record<string, unknown>> | null;
  created_at?: string;
  updated_at?: string;
}

export interface SocialMediaPost {
  id: string;
  source_type: string;
  source_id?: string | null;
  title?: string | null;
  content: string;
  media_ids?: string[] | null;
  platforms: Array<SocialPlatform | string>;
  scheduled_at?: string | null;
  posted_at?: string | null;
  platform_post_ids?: Record<string, string> | null;
  status: SocialPostStatus | string;
  error_message?: string | null;
  validation_summary?: Record<string, unknown> | null;
  created_by_id?: string;
  created_by?: { id?: string; email?: string; full_name?: string } | null;
  deliveries?: SocialMediaDelivery[] | null;
  created_at?: string;
  updated_at?: string;
}

export interface SocialPlatformAccount {
  id: string;
  provider: SocialPlatform | string;
  name: string;
  account_ref: string;
  settings?: Record<string, unknown> | null;
  is_active: boolean;
  last_validated_at?: string | null;
  last_used_at?: string | null;
  last_error?: string | null;
  created_by_id?: string;
  created_at?: string;
  updated_at?: string;
}

export type SocialPostFilters = {
  page?: number;
  per_page?: number;
  status?: string;
  source_type?: string;
  fields?: string;
}

export interface SocialPostCreatePayload {
  source_type: string;
  source_id?: string | null;
  title?: string | null;
  content: string;
  media_ids?: string[] | null;
  platforms: string[];
  scheduled_at?: string | null;
  status?: "draft" | "scheduled";
}

export type SocialPostUpdatePayload = Partial<SocialPostCreatePayload>;

export const socialQueryKeys = {
  all: ["social-posts"] as const,
  list: (filters: SocialPostFilters = {}) =>
    [...socialQueryKeys.all, "list", filters] as const,
  detail: (id: string) => [...socialQueryKeys.all, "detail", id] as const,
  deliveries: (id: string) =>
    [...socialQueryKeys.all, "deliveries", id] as const,
  accounts: ["social-posts", "accounts"] as const,
};

export const socialPostsApi = {
  list: (params: SocialPostFilters = {}) =>
    mainApi.get<PaginatedResponse<SocialMediaPost>>(BASE_PATH, params),
  get: (id: string) =>
    mainApi.get<{ data: SocialMediaPost }>(`${BASE_PATH}/${id}`),
  create: (payload: SocialPostCreatePayload) =>
    mainApi.post<{ data: SocialMediaPost }>(BASE_PATH, payload),
  update: (id: string, payload: SocialPostUpdatePayload) =>
    mainApi.patch<{ data: SocialMediaPost }>(`${BASE_PATH}/${id}`, payload),
  delete: (id: string) => mainApi.delete<void>(`${BASE_PATH}/${id}`),
  publish: (id: string) =>
    mainApi.post<{ data: SocialMediaPost }>(`${BASE_PATH}/${id}/publish`),
  validate: (id: string) =>
    mainApi.post<{ data: Record<string, unknown> }>(
      `${BASE_PATH}/${id}/validate`,
    ),
  listDeliveries: (id: string) =>
    mainApi.get<{ data: SocialMediaDelivery[] }>(
      `${BASE_PATH}/${id}/deliveries`,
    ),
  listAccounts: (params: { provider?: string; active_only?: boolean } = {}) =>
    mainApi.get<{ data: SocialPlatformAccount[] }>(
      `${BASE_PATH}/accounts`,
      params,
    ),
  validateAccount: (id: string) =>
    mainApi.post<{ data: { valid: boolean; error: string | null } }>(
      `${BASE_PATH}/accounts/${id}/validate`,
    ),
};
