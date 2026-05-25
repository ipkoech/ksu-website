import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { schoolsApi } from "../main/api";
import { queryKeys } from "./query-keys";
import type { School, PaginatedResponse } from "../main/types";
import type { PaginationParams } from "../client";

export function useSchools(params?: PaginationParams & { campus_id?: string; search?: string }) {
  return useQuery({
    queryKey: queryKeys.schools.list(params),
    queryFn: () => schoolsApi.list(params),
  });
}

export function useSchool(id: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.schools.detail(id),
    queryFn: () => schoolsApi.get(id),
    enabled: options?.enabled !== false && !!id,
  });
}

export function useSchoolBySlug(slug: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.schools.bySlug(slug),
    queryFn: () => schoolsApi.getBySlug(slug),
    enabled: options?.enabled !== false && !!slug,
  });
}

export function useCreateSchool() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<School>) => schoolsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.schools.all });
    },
  });
}

export function useUpdateSchool() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<School> }) =>
      schoolsApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.schools.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.schools.detail(id) });
    },
  });
}

export function useDeleteSchool() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => schoolsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.schools.all });
    },
  });
}
