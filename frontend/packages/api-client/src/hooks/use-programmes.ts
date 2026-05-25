import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { programmesApi } from "../main/api";
import { queryKeys } from "./query-keys";
import type { Programme, PaginatedResponse } from "../main/types";
import type { PaginationParams } from "../client";

export function useProgrammes(params?: PaginationParams & { q?: string; school_id?: string; department_id?: string; level?: string; mode_of_study?: string }) {
  return useQuery({
    queryKey: queryKeys.programmes.list(params),
    queryFn: () => programmesApi.list(params),
  });
}

export function useProgramme(id: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.programmes.detail(id),
    queryFn: () => programmesApi.get(id),
    enabled: options?.enabled !== false && !!id,
  });
}

export function useProgrammeBySlug(slug: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.programmes.bySlug(slug),
    queryFn: () => programmesApi.getBySlug(slug),
    enabled: options?.enabled !== false && !!slug,
  });
}

export function useCreateProgramme() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<Programme>) => programmesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.programmes.all });
    },
  });
}

export function useUpdateProgramme() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Programme> }) =>
      programmesApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.programmes.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.programmes.detail(id) });
    },
  });
}

export function useAddProgrammeTutor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: { person_id: string; role?: string; is_lead?: boolean };
    }) => programmesApi.addTutor(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.programmes.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.programmes.detail(id) });
    },
  });
}

export function useAddProgrammeIntake() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: { intake_id: string; slots_available?: number; application_deadline?: string; is_active?: boolean };
    }) =>
      programmesApi.addIntake(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.programmes.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.programmes.detail(id) });
    },
  });
}

export function useDeleteProgramme() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => programmesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.programmes.all });
    },
  });
}
