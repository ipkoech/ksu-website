import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { wingsApi } from "../main/api";
import { queryKeys } from "./query-keys";
import type { Wing } from "../main/types";

export function useWingsByDivision(
  divisionId: string,
  params?: { is_active?: boolean; fields?: string; include?: string },
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: queryKeys.wings.byDivision(divisionId, params),
    queryFn: () => wingsApi.listByDivision(divisionId, params),
    enabled: options?.enabled !== false && !!divisionId,
  });
}

export function useWing(id: string, options?: { enabled?: boolean; fields?: string; include?: string }) {
  return useQuery({
    queryKey: queryKeys.wings.detail(id),
    queryFn: () => wingsApi.get(id, { fields: options?.fields, include: options?.include }),
    enabled: options?.enabled !== false && !!id,
  });
}

export function useWingBySlug(slug: string, options?: { enabled?: boolean; fields?: string; include?: string }) {
  return useQuery({
    queryKey: queryKeys.wings.bySlug(slug),
    queryFn: () => wingsApi.getBySlug(slug, { fields: options?.fields, include: options?.include }),
    enabled: options?.enabled !== false && !!slug,
  });
}

export function useCreateWing() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<Wing>) => wingsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.wings.all });
    },
  });
}

export function useUpdateWing() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Wing> }) => wingsApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.wings.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.wings.detail(id) });
    },
  });
}
