import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { eventsApi } from "../main/api";
import { queryKeys } from "./query-keys";
import type { Event } from "../main/types";
import type { PaginationParams } from "../client";

export function useEvents(params?: PaginationParams & { scope_type?: string; scope_id?: string; is_main?: boolean; is_published?: boolean; upcoming?: boolean; search?: string }) {
  return useQuery({
    queryKey: queryKeys.events.list(params),
    queryFn: () => eventsApi.list(params),
  });
}

export function useAdminEvents(params?: PaginationParams & { scope_type?: string; scope_id?: string; is_main?: boolean; is_published?: boolean; upcoming?: boolean; status?: string; search?: string }) {
  return useQuery({
    queryKey: [...queryKeys.events.list(params), "admin"] as const,
    queryFn: () => eventsApi.listAdmin(params),
  });
}

export function useEvent(id: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.events.detail(id),
    queryFn: () => eventsApi.get(id),
    enabled: options?.enabled !== false && !!id,
  });
}

export function useEventBySlug(slug: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.events.bySlug(slug),
    queryFn: () => eventsApi.getBySlug(slug),
    enabled: options?.enabled !== false && !!slug,
  });
}

export function useCreateEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<Event>) => eventsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.events.all });
    },
  });
}

export function useUpdateEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Event> }) =>
      eventsApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.events.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.events.detail(id) });
    },
  });
}

export function useDeleteEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => eventsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.events.all });
    },
  });
}

export function usePublishEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => eventsApi.publish(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.events.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.events.detail(id) });
    },
  });
}

export function useUnpublishEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => eventsApi.unpublish(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.events.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.events.detail(id) });
    },
  });
}
