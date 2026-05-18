import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ApiKey, Setting, Webhook } from "../../types/admin";
import { adminRequest } from "./_utils";

export const systemKeys = {
  settings: ["admin", "system", "settings"] as const,
  apiKeys: ["admin", "system", "api-keys"] as const,
  webhooks: ["admin", "system", "webhooks"] as const,
};

const SETTINGS_FIELDS = "id,key,value,value_type,category,description,updated_at";
const API_KEYS_FIELDS = "id,name,scopes,expires_at,last_used_at,is_active,created_at";
const WEBHOOKS_FIELDS = "id,name,url,method,is_active,events,created_at";

export function useSettings() {
  return useQuery({
    queryKey: systemKeys.settings,
    queryFn: () =>
      adminRequest<{ data: Setting[] }>("GET", "/api/admin/system/settings", {
        params: { fields: SETTINGS_FIELDS },
      }),
    select: (response) => response.data,
  });
}

export function useApiKeys() {
  return useQuery({
    queryKey: systemKeys.apiKeys,
    queryFn: () =>
      adminRequest<{ data: ApiKey[] }>("GET", "/api/admin/system/api-keys", {
        params: { fields: API_KEYS_FIELDS },
      }),
    select: (response) => response.data,
  });
}

export function useUpdateSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      adminRequest<{ data: Setting[] }>("PUT", "/api/admin/system/settings", { body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: systemKeys.settings });
    },
  });
}

export function useCreateApiKey() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      adminRequest<{ data: { api_key: string; record: ApiKey } }>("POST", "/api/admin/system/api-keys", { body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: systemKeys.apiKeys });
    },
  });
}

export function useRevokeApiKey() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminRequest<void>("DELETE", `/api/admin/system/api-keys/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: systemKeys.apiKeys });
    },
  });
}

export function useWebhooks() {
  return useQuery({
    queryKey: systemKeys.webhooks,
    queryFn: () =>
      adminRequest<{ data: Webhook[] }>("GET", "/api/admin/system/webhooks", {
        params: { fields: WEBHOOKS_FIELDS },
      }),
    select: (response) => response.data,
  });
}

export function useCreateWebhook() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      adminRequest<{ data: Webhook }>("POST", "/api/admin/system/webhooks", { body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: systemKeys.webhooks });
    },
  });
}

export function useUpdateWebhook() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      adminRequest<{ data: Webhook }>("PUT", `/api/admin/system/webhooks/${id}`, { body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: systemKeys.webhooks });
    },
  });
}

export function useDeleteWebhook() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminRequest<void>("DELETE", `/api/admin/system/webhooks/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: systemKeys.webhooks });
    },
  });
}
