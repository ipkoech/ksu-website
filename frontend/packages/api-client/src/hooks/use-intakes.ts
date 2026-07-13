import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { intakesApi } from "../main/api";
import { queryKeys } from "./query-keys";
import type { Intake, IntakeHomepageAdmissionUpdate } from "../main/types";
import type { PaginationParams } from "../client";

export function useIntakes(params?: PaginationParams & { academic_calendar_id?: string; is_open?: boolean }) {
  return useQuery({
    queryKey: queryKeys.intakes.list(params),
    queryFn: () => intakesApi.list(params),
  });
}

export function useIntake(id: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.intakes.detail(id),
    queryFn: () => intakesApi.get(id),
    enabled: options?.enabled !== false && !!id,
  });
}

export function useIntakeHomepageAdmission(id: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.intakes.homepageAdmission(id),
    queryFn: () => intakesApi.getHomepageAdmission(id),
    enabled: options?.enabled !== false && !!id,
  });
}

export function useIntakeBySlug(slug: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.intakes.bySlug(slug),
    queryFn: () => intakesApi.getBySlug(slug),
    enabled: options?.enabled !== false && !!slug,
  });
}

export function useCreateIntake() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<Intake>) => intakesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.intakes.all });
    },
  });
}

export function useUpdateIntake() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Intake> }) => intakesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.intakes.all });
    },
  });
}

export function useUpdateIntakeHomepageAdmission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: IntakeHomepageAdmissionUpdate }) =>
      intakesApi.updateHomepageAdmission(id, data),
    onSuccess: (_response, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.intakes.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.intakes.homepageAdmission(variables.id) });
    },
  });
}

export function useDeleteIntake() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => intakesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.intakes.all });
    },
  });
}
