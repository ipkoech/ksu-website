import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { departmentsApi } from "../main/api";
import { queryKeys } from "./query-keys";
import type { Department, PaginatedResponse } from "../main/types";
import type { PaginationParams } from "../client";

export function useDepartments(params?: PaginationParams & { school_id?: string }) {
  return useQuery({
    queryKey: queryKeys.departments.list(params),
    queryFn: () => departmentsApi.list(params),
  });
}

export function useDepartment(id: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.departments.detail(id),
    queryFn: () => departmentsApi.get(id),
    enabled: options?.enabled !== false && !!id,
  });
}

export function useDepartmentBySlug(slug: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.departments.bySlug(slug),
    queryFn: () => departmentsApi.getBySlug(slug),
    enabled: options?.enabled !== false && !!slug,
  });
}

export function useCreateDepartment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<Department>) => departmentsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.departments.all });
    },
  });
}

export function useUpdateDepartment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Department> }) =>
      departmentsApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.departments.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.departments.detail(id) });
    },
  });
}

export function useDeleteDepartment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => departmentsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.departments.all });
    },
  });
}