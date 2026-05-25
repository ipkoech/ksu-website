import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { blogsApi } from "../main/api";
import { queryKeys } from "./query-keys";
import type { Blog } from "../main/types";
import type { PaginationParams } from "../client";

export function useBlogs(params?: PaginationParams & { scope_type?: string; scope_id?: string; is_main?: boolean; is_published?: boolean; search?: string }) {
  return useQuery({
    queryKey: queryKeys.blogs.list(params),
    queryFn: () => blogsApi.list(params),
  });
}

export function useAdminBlogs(params?: PaginationParams & { scope_type?: string; scope_id?: string; is_main?: boolean; is_published?: boolean; status?: string; search?: string }) {
  return useQuery({
    queryKey: [...queryKeys.blogs.list(params), "admin"] as const,
    queryFn: () => blogsApi.listAdmin(params),
  });
}

export function useBlog(id: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.blogs.detail(id),
    queryFn: () => blogsApi.get(id),
    enabled: options?.enabled !== false && !!id,
  });
}

export function useBlogBySlug(slug: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.blogs.bySlug(slug),
    queryFn: () => blogsApi.getBySlug(slug),
    enabled: options?.enabled !== false && !!slug,
  });
}

export function useCreateBlog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<Blog>) => blogsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.blogs.all });
    },
  });
}

export function useUpdateBlog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Blog> }) => blogsApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.blogs.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.blogs.detail(id) });
    },
  });
}

export function useDeleteBlog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => blogsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.blogs.all });
    },
  });
}

export function usePublishBlog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => blogsApi.publish(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.blogs.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.blogs.detail(id) });
    },
  });
}

export function useUnpublishBlog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => blogsApi.unpublish(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.blogs.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.blogs.detail(id) });
    },
  });
}
