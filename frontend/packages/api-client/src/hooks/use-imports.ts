import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { importsApi } from "../main/api";
import { queryKeys } from "./query-keys";
import type { ImportCommitRequest } from "../main/types";

const resourceQueryKeys: Record<string, readonly unknown[]> = {
  "academic-calendars": queryKeys.intakes.all,
  campuses: queryKeys.schools.all,
  schools: queryKeys.schools.all,
  departments: queryKeys.departments.all,
  divisions: queryKeys.divisions.all,
  wings: queryKeys.divisions.all,
  intakes: queryKeys.intakes.all,
  programmes: queryKeys.programmes.all,
  persons: queryKeys.persons.all,
  "staff-assignments": queryKeys.staff.all,
  faqs: queryKeys.faqs.all,
};

export function useImportResources() {
  return useQuery({
    queryKey: queryKeys.imports.resources,
    queryFn: () => importsApi.listResources(),
  });
}

export function useImportResource(resource: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.imports.resource(resource),
    queryFn: () => importsApi.getResource(resource),
    enabled: options?.enabled !== false && !!resource,
  });
}

export function usePreviewImport() {
  return useMutation({
    mutationFn: ({ resource, file }: { resource: string; file: File }) =>
      importsApi.preview(resource, file),
  });
}

export function useCommitImport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ resource, data }: { resource: string; data: ImportCommitRequest }) =>
      importsApi.commit(resource, data),
    onSuccess: (_, { resource }) => {
      const queryKey = resourceQueryKeys[resource];
      if (queryKey) {
        queryClient.invalidateQueries({ queryKey });
      }
    },
  });
}
