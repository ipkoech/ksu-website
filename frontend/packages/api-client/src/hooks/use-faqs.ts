import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { faqsApi } from "../main/api";
import { queryKeys } from "./query-keys";
import type { FAQ } from "../main/types";
import type { PaginationParams } from "../client";

export function useFAQs(params?: PaginationParams & { scope_type?: string; scope_id?: string; is_main?: boolean }) {
  return useQuery({
    queryKey: queryKeys.faqs.list(params),
    queryFn: () => faqsApi.list(params),
  });
}

export function useFAQ(id: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.faqs.detail(id),
    queryFn: () => faqsApi.get(id),
    enabled: options?.enabled !== false && !!id,
  });
}

export function useCreateFAQ() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<FAQ>) => faqsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.faqs.all });
    },
  });
}

export function useUpdateFAQ() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<FAQ> }) => faqsApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.faqs.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.faqs.detail(id) });
    },
  });
}

export function useDeleteFAQ() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => faqsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.faqs.all });
    },
  });
}
