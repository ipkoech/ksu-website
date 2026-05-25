import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  ApiKey,
  ApiKeyCreatePayload,
  ApiKeyUpdatePayload,
  BulkSettingsUpdatePayload,
  Setting,
  SettingCreatePayload,
  SettingUpdatePayload,
  Webhook,
  WebhookCreatePayload,
  WebhookUpdatePayload,
} from "../../types/admin";
import { adminRequest } from "./_utils";

export const systemKeys = {
  settings: ["admin", "system", "settings"] as const,
  apiKeys: ["admin", "system", "api-keys"] as const,
  webhooks: ["admin", "system", "webhooks"] as const,
};

const SETTINGS_FIELDS = "id,key,value,value_type,category,description,is_public,updated_by_id,created_at,updated_at";
const API_KEYS_FIELDS = "id,name,description,scopes,rate_limit,expires_at,last_used_at,is_active,created_by_id,key_prefix,created_at,updated_at";
const WEBHOOKS_FIELDS = "id,name,url,secret,events,is_active,last_triggered_at,last_status,failure_count,created_by_id,created_at,updated_at";

export function useSettings(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: systemKeys.settings,
    queryFn: () =>
      adminRequest<{ data: Setting[] }>("GET", "/api/admin/system/settings", {
        params: { fields: SETTINGS_FIELDS },
      }),
    select: (response) => response.data,
    enabled: options?.enabled ?? true,
  });
}

export function useSetting(id: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: [...systemKeys.settings, id] as const,
    queryFn: () =>
      adminRequest<{ data: Setting }>("GET", `/api/admin/system/settings/${id}`, {
        params: { fields: SETTINGS_FIELDS },
      }),
    select: (response) => response.data,
    enabled: options?.enabled !== false && !!id,
  });
}

export function useApiKeys(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: systemKeys.apiKeys,
    queryFn: () =>
      adminRequest<{ data: ApiKey[] }>("GET", "/api/admin/system/api-keys", {
        params: { fields: API_KEYS_FIELDS },
      }),
    select: (response) => response.data,
    enabled: options?.enabled ?? true,
  });
}

export function useApiKey(id: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: [...systemKeys.apiKeys, id] as const,
    queryFn: () =>
      adminRequest<{ data: ApiKey }>("GET", `/api/admin/system/api-keys/${id}`, {
        params: { fields: API_KEYS_FIELDS },
      }),
    select: (response) => response.data,
    enabled: options?.enabled !== false && !!id,
  });
}

export function useUpdateSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: BulkSettingsUpdatePayload) =>
      adminRequest<{ data: Setting[] }>("PUT", "/api/admin/system/settings", { body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: systemKeys.settings });
    },
  });
}

export function useCreateSetting() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: SettingCreatePayload) =>
      adminRequest<{ data: Setting }>("POST", "/api/admin/system/settings", { body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: systemKeys.settings });
    },
  });
}

export function useUpdateSetting() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: SettingUpdatePayload }) =>
      adminRequest<{ data: Setting }>("PATCH", `/api/admin/system/settings/${id}`, { body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: systemKeys.settings });
    },
  });
}

export function useDeleteSetting() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminRequest<void>("DELETE", `/api/admin/system/settings/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: systemKeys.settings });
    },
  });
}

export function useCreateApiKey() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ApiKeyCreatePayload) =>
      adminRequest<{ data: { api_key: string; record: ApiKey } }>("POST", "/api/admin/system/api-keys", { body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: systemKeys.apiKeys });
    },
  });
}

export function useUpdateApiKey() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ApiKeyUpdatePayload }) =>
      adminRequest<{ data: ApiKey }>("PATCH", `/api/admin/system/api-keys/${id}`, { body: data }),
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

export function useWebhooks(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: systemKeys.webhooks,
    queryFn: () =>
      adminRequest<{ data: Webhook[] }>("GET", "/api/admin/system/webhooks", {
        params: { fields: WEBHOOKS_FIELDS },
      }),
    select: (response) => response.data,
    enabled: options?.enabled ?? true,
  });
}

export function useWebhook(id: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: [...systemKeys.webhooks, id] as const,
    queryFn: () =>
      adminRequest<{ data: Webhook }>("GET", `/api/admin/system/webhooks/${id}`, {
        params: { fields: WEBHOOKS_FIELDS },
      }),
    select: (response) => response.data,
    enabled: options?.enabled !== false && !!id,
  });
}

export function useCreateWebhook() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: WebhookCreatePayload) =>
      adminRequest<{ data: Webhook }>("POST", "/api/admin/system/webhooks", { body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: systemKeys.webhooks });
    },
  });
}

export function useUpdateWebhook() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: WebhookUpdatePayload }) =>
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
