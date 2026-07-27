"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getStoredAccessToken } from "@ksu/auth";

export type HeriRecord = { id: string; [key: string]: unknown };
export type HeriListParams = { page?: number; per_page?: number; search?: string; status?: string };
export type HeriListResponse<T extends HeriRecord = HeriRecord> = { data: T[]; meta: { page: number; per_page: number; total: number; pages: number } };

const HERI_API = process.env.NEXT_PUBLIC_HERI_API_URL ?? "http://localhost:8003/api/v1/heri";

async function heriRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getStoredAccessToken();
  const response = await fetch(`${HERI_API}${path}`, { ...init, credentials: "include", headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(init?.headers ?? {}) } });
  if (!response.ok) throw new Error((await response.json().catch(() => ({}))).detail ?? `HERI request failed (${response.status})`);
  return response.status === 204 ? undefined as T : response.json() as Promise<T>;
}

export const heriQueryKeys = { resource: (resource: string, params: HeriListParams) => ["heri", resource, params] as const };

export function useHeriResourceQuery<T extends HeriRecord = HeriRecord>(resource: string, params: HeriListParams) {
  return useQuery({ queryKey: heriQueryKeys.resource(resource, params), queryFn: () => { const query = new URLSearchParams(); Object.entries(params).forEach(([key, value]) => value && query.set(key, String(value))); return heriRequest<HeriListResponse<T>>(`/admin/${resource}?${query.toString()}`); }, placeholderData: (previous) => previous, staleTime: 30_000 });
}

export function useHeriResourceMutation(resource: string) {
  const client = useQueryClient();
  return useMutation({ mutationFn: ({ id, payload }: { id?: string; payload?: Record<string, unknown> }) => heriRequest<TypedMutationResult>(`/admin/${resource}${id ? `/${id}` : ""}`, { method: id ? "PATCH" : "POST", body: JSON.stringify(payload ?? {}) }), onSuccess: () => client.invalidateQueries({ queryKey: ["heri", resource] }) });
}

type TypedMutationResult = HeriRecord | undefined;

export { heriRequest };
