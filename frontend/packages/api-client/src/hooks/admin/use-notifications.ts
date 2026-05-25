import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  NotificationBroadcastPayload,
  NotificationCreatePayload,
  NotificationDelivery,
  NotificationTemplate,
  NotificationTemplateCreatePayload,
  NotificationTemplateUpdatePayload,
  PaginatedResponse,
} from "../../types/admin";
import { adminRequest } from "./_utils";

export const notificationKeys = {
  templates: ["admin", "notifications", "templates"] as const,
  template: (id: string) => ["admin", "notifications", "templates", id] as const,
  deliveries: (params?: Record<string, unknown>) => ["admin", "notifications", "deliveries", params] as const,
};

const TEMPLATE_FIELDS = "id,code,name,description,title_template,subject_template,message_template,channels,variables,is_active,created_at,updated_at";
const TEMPLATE_BASE_PATH = "/api/admin/notifications/templates";

export function useNotificationTemplates(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: notificationKeys.templates,
    queryFn: () =>
      adminRequest<{ data: NotificationTemplate[] }>("GET", TEMPLATE_BASE_PATH, {
        params: { fields: TEMPLATE_FIELDS },
      }),
    select: (response) => response.data,
    enabled: options?.enabled ?? true,
  });
}

export function useNotificationTemplate(id: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: notificationKeys.template(id),
    queryFn: () =>
      adminRequest<{ data: NotificationTemplate }>("GET", `${TEMPLATE_BASE_PATH}/${id}`, {
        params: { fields: TEMPLATE_FIELDS },
      }),
    select: (response) => response.data,
    enabled: options?.enabled !== false && !!id,
  });
}

export function useCreateNotificationTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: NotificationTemplateCreatePayload) =>
      adminRequest<{ data: NotificationTemplate }>("POST", TEMPLATE_BASE_PATH, { body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.templates });
    },
  });
}

export function useUpdateNotificationTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: NotificationTemplateUpdatePayload }) =>
      adminRequest<{ data: NotificationTemplate }>("PATCH", `${TEMPLATE_BASE_PATH}/${id}`, { body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.templates });
    },
  });
}

export function useDeleteNotificationTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => adminRequest<void>("DELETE", `${TEMPLATE_BASE_PATH}/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.templates });
    },
  });
}

export function useNotificationDeliveries(params?: {
  page?: number;
  limit?: number;
  status?: string;
  channel?: string;
}) {
  return useQuery({
    queryKey: notificationKeys.deliveries(params),
    queryFn: () =>
      adminRequest<PaginatedResponse<NotificationDelivery>>("GET", "/api/admin/notifications/deliveries", {
        params: {
          ...params,
          per_page: params?.limit,
          limit: undefined,
        } as Record<string, unknown> | undefined,
      }),
  });
}

export function useSendNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: NotificationCreatePayload) =>
      adminRequest<{ data: unknown }>("POST", "/api/admin/notifications/send", { body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "notifications"] });
    },
  });
}

export function useBroadcastNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: NotificationBroadcastPayload) =>
      adminRequest<{ data: unknown }>("POST", "/api/admin/notifications/broadcast", { body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "notifications"] });
    },
  });
}

export function usePreviewNotificationBroadcast() {
  return useMutation({
    mutationFn: (data: NotificationBroadcastPayload) =>
      adminRequest<{ data: unknown }>("POST", "/api/admin/notifications/broadcast/preview", { body: data }),
  });
}
