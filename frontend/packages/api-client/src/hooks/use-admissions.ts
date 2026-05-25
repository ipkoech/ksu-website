import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { admissionsApi } from "../main/api";
import { queryKeys } from "./query-keys";
import type { AdmissionInfo } from "../main/types";
import type { PaginationParams } from "../client";

type AdmissionInfoListParams = PaginationParams & {
  content_type?: string;
  audience_level?: string;
  school_id?: string;
};

type AdminAdmissionInfoListParams = AdmissionInfoListParams & {
  is_published?: boolean;
};

export function useAdmissionInfoList(params?: AdmissionInfoListParams) {
  return useQuery({
    queryKey: queryKeys.admissions.list(params),
    queryFn: () => admissionsApi.list(params),
  });
}

export function useAdminAdmissionInfoList(params?: AdminAdmissionInfoListParams) {
  return useQuery({
    queryKey: [...queryKeys.admissions.list(params), "admin"] as const,
    queryFn: () => admissionsApi.listAdmin(params),
  });
}

export function useAdmissionInfo(id: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.admissions.detail(id),
    queryFn: () => admissionsApi.get(id),
    enabled: options?.enabled !== false && !!id,
  });
}

export function useAdmissionInfoBySlug(slug: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.admissions.bySlug(slug),
    queryFn: () => admissionsApi.getBySlug(slug),
    enabled: options?.enabled !== false && !!slug,
  });
}

export function useCreateAdmissionInfo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<AdmissionInfo>) => admissionsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admissions.all });
    },
  });
}

export function useUpdateAdmissionInfo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<AdmissionInfo> }) => admissionsApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admissions.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.admissions.detail(id) });
    },
  });
}

export function useDeleteAdmissionInfo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => admissionsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admissions.all });
    },
  });
}
