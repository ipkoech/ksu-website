import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { academicCalendarsApi } from "../main/api";
import { queryKeys } from "./query-keys";
import type { AcademicCalendar } from "../main/types";
import type { PaginationParams } from "../client";

export function useAcademicCalendars(params?: PaginationParams & { academic_year?: string; status?: string }) {
  return useQuery({
    queryKey: queryKeys.academicCalendars.list(params),
    queryFn: () => academicCalendarsApi.list(params),
  });
}

export function useAcademicCalendar(id: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.academicCalendars.detail(id),
    queryFn: () => academicCalendarsApi.get(id),
    enabled: options?.enabled !== false && !!id,
  });
}

export function useCreateAcademicCalendar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<AcademicCalendar>) => academicCalendarsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.academicCalendars.all });
    },
  });
}

export function useUpdateAcademicCalendar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<AcademicCalendar> }) => academicCalendarsApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.academicCalendars.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.academicCalendars.detail(id) });
    },
  });
}

export function useDeleteAcademicCalendar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => academicCalendarsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.academicCalendars.all });
    },
  });
}
