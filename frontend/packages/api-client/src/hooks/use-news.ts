import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { newsApi } from "../main/api";
import { queryKeys } from "./query-keys";
import type { News } from "../main/types";
import type { PaginationParams } from "../client";

export function useNewsList(params?: PaginationParams & { category?: string; is_published?: boolean }) {
  return useQuery({
    queryKey: queryKeys.news.list(params),
    queryFn: () => newsApi.list(params),
  });
}

export function useNews(id: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.news.detail(id),
    queryFn: () => newsApi.get(id),
    enabled: options?.enabled !== false && !!id,
  });
}

export function useNewsBySlug(slug: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.news.bySlug(slug),
    queryFn: () => newsApi.getBySlug(slug),
    enabled: options?.enabled !== false && !!slug,
  });
}

export function useCreateNews() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<News>) => newsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.news.all });
    },
  });
}

export function useUpdateNews() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<News> }) =>
      newsApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.news.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.news.detail(id) });
    },
  });
}

export function useDeleteNews() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => newsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.news.all });
    },
  });
}

export function usePublishNews() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => newsApi.publish(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.news.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.news.detail(id) });
    },
  });
}

export function useUnpublishNews() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => newsApi.unpublish(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.news.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.news.detail(id) });
    },
  });
}
