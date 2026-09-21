"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getStoredAccessToken } from "@ksu/auth";
import { heriApi } from "@ksu/api-client";
import { revalidatePublicContent } from "@/lib/api/public-revalidation";

export type HeriRecord = { id: string; status?: string; [key: string]: unknown };
export type HeriListParams = { page?: number; per_page?: number; search?: string; status?: string };
export type HeriListResponse<T extends HeriRecord = HeriRecord> = { data: T[]; meta: { page: number; per_page: number; total: number; pages: number } };

async function heriRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getStoredAccessToken();
  let body: unknown = init?.body;
  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch {
      // Keep non-JSON bodies compatible with the transport's raw body path.
    }
  }
  const headers = new Headers(init?.headers);
  if (token) headers.set("Authorization", `Bearer ${token}`);
  return heriApi.request<T>(init?.method ?? "GET", path, {
    body,
    headers: Object.fromEntries(headers.entries()),
    auth: "session",
    timeoutMs: 15_000,
    signal: init?.signal ?? undefined,
  });
}

export const heriQueryKeys = { resource: (resource: string, params: HeriListParams) => ["heri", resource, params] as const };

export function useHeriResourceQuery<T extends HeriRecord = HeriRecord>(resource: string, params: HeriListParams) {
  return useQuery({ queryKey: heriQueryKeys.resource(resource, params), queryFn: ({ signal }) => { const query = new URLSearchParams(); Object.entries(params).forEach(([key, value]) => value && query.set(key, String(value))); return heriRequest<HeriListResponse<T>>(`/admin/${resource}?${query.toString()}`, { signal }); }, placeholderData: (previous) => previous, staleTime: 30_000 });
}

export function useHeriRecordQuery<T extends HeriRecord = HeriRecord>(resource: string, id: string) {
  return useQuery({ queryKey: ["heri", resource, id], queryFn: ({ signal }) => heriRequest<T>(`/admin/${resource}/${id}`, { signal }), enabled: Boolean(resource && id), staleTime: 30_000 });
}

export function useHeriResourceMutation(resource: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id?: string; payload?: Record<string, unknown> }) =>
      heriRequest<TypedMutationResult>(`/admin/${resource}${id ? `/${id}` : ""}`, {
        method: id ? "PATCH" : "POST",
        body: JSON.stringify(payload ?? {}),
      }),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: ["heri", resource] });
      void revalidatePublicContent("heri", resource);
    },
  });
}

export function useHeriPartnerSync() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: () => heriRequest<{ created: number; updated: number; total: number; deactivated?: number }>("/admin/partners/sync", { method: "POST", body: "{}" }),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: ["heri", "partners"] });
      void revalidatePublicContent("heri", "partners");
    },
  });
}

type TypedMutationResult = HeriRecord | undefined;

export { heriRequest };
