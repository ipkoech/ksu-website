import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { announcementsApi } from "../main/api";
import { queryKeys } from "./query-keys";
import type { Announcement } from "../main/types";
import type { PaginationParams } from "../client";

export function useAnnouncements(params?: PaginationParams & { scope_type?: string; scope_id?: string; is_main?: boolean; is_published?: boolean; search?: string }) {
  return useQuery({
    queryKey: queryKeys.announcements.list(params),
    queryFn: () => announcementsApi.list(params),
  });
}

export function useAnnouncement(id: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.announcements.detail(id),
    queryFn: () => announcementsApi.get(id),
    enabled: options?.enabled !== false && !!id,
  });
}

export function useAnnouncementBySlug(slug: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.announcements.bySlug(slug),
    queryFn: () => announcementsApi.getBySlug(slug),
    enabled: options?.enabled !== false && !!slug,
  });
}

export function useCreateAnnouncement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<Announcement>) => announcementsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.announcements.all });
    },
  });
}

export function useUpdateAnnouncement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Announcement> }) => announcementsApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.announcements.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.announcements.detail(id) });
    },
  });
}

export function useDeleteAnnouncement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => announcementsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.announcements.all });
    },
  });
}

export function usePublishAnnouncement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => announcementsApi.publish(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.announcements.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.announcements.detail(id) });
    },
  });
}

export function useUnpublishAnnouncement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => announcementsApi.unpublish(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.announcements.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.announcements.detail(id) });
    },
  });
}
