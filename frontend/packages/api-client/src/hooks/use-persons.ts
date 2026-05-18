import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { personsApi } from "../main/api";
import { queryKeys } from "./query-keys";
import type { Person, PaginatedResponse } from "../main/types";
import type { PaginationParams } from "../client";

export function usePersons(params?: PaginationParams & { type?: string }) {
  return useQuery({
    queryKey: queryKeys.persons.list(params),
    queryFn: () => personsApi.list(params),
  });
}

export function usePerson(id: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.persons.detail(id),
    queryFn: () => personsApi.get(id),
    enabled: options?.enabled !== false && !!id,
  });
}

export function usePersonBySlug(slug: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.persons.bySlug(slug),
    queryFn: () => personsApi.getBySlug(slug),
    enabled: options?.enabled !== false && !!slug,
  });
}

export function useCreatePerson() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<Person>) => personsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.persons.all });
    },
  });
}

export function useUpdatePerson() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Person> }) =>
      personsApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.persons.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.persons.detail(id) });
    },
  });
}

export function useDeletePerson() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => personsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.persons.all });
    },
  });
}