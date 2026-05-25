import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { divisionsApi } from "../main/api";
import { queryKeys } from "./query-keys";
import type { Division } from "../main/types";
import type { PaginationParams } from "../client";

export function useDivisions(params?: PaginationParams & { is_active?: boolean; fields?: string; include?: string }) {
  return useQuery({
    queryKey: queryKeys.divisions.list(params),
    queryFn: () => divisionsApi.list(params),
  });
}

export function useDivision(id: string, options?: { enabled?: boolean; fields?: string; include?: string }) {
  return useQuery({
    queryKey: queryKeys.divisions.detail(id),
    queryFn: () => divisionsApi.get(id, { fields: options?.fields, include: options?.include }),
    enabled: options?.enabled !== false && !!id,
  });
}

export function useDivisionBySlug(slug: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.divisions.bySlug(slug),
    queryFn: () => divisionsApi.getBySlug(slug),
    enabled: options?.enabled !== false && !!slug,
  });
}

export function useCreateDivision() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<Division>) => divisionsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.divisions.all });
    },
  });
}

export function useUpdateDivision() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Division> }) => divisionsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.divisions.all });
    },
  });
}

export function useDeleteDivision() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => divisionsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.divisions.all });
    },
  });
}
