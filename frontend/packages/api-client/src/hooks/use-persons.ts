import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { personsApi } from "../main/api";
import { queryKeys } from "./query-keys";
import type { PersonCreatePayload, PersonStatusFilter, PersonUpdatePayload } from "../main/types";
import type { PaginationParams } from "../client";

export const PERSON_LIST_FIELDS = [
  "id",
  "title",
  "first_name",
  "middle_name",
  "last_name",
  "full_name",
  "email",
  "phone",
  "photo_id",
  "photo_url",
  "employee_number",
  "department_id",
  "academic_rank",
  "employment_type",
  "publications_count",
  "is_active",
  "is_public",
  "is_researcher",
  "is_featured",
  "show_on_directory",
  "created_at",
  "updated_at",
].join(",");

export const PERSON_LIST_INCLUDE = "department:id,name,code,school_id";
export const PERSON_DETAIL_INCLUDE = "department:id,name,code,school_id";
export const PERSON_DETAIL_FIELDS = [
  "id",
  "user_id",
  "slug",
  "title",
  "first_name",
  "middle_name",
  "last_name",
  "full_name",
  "email",
  "phone",
  "alternative_email",
  "alternative_phone",
  "bio",
  "full_bio",
  "qualifications",
  "education_background",
  "professional_memberships",
  "awards_honors",
  "photo_id",
  "photo_url",
  "cv_file_id",
  "employee_number",
  "employment_type",
  "employment_start_date",
  "employment_end_date",
  "date_of_appointment",
  "job_group",
  "contract_type",
  "department_id",
  "academic_rank",
  "tenure_status",
  "specialization",
  "research_interests",
  "teaching_areas",
  "courses_taught",
  "publications_count",
  "h_index",
  "office_location",
  "office_hours",
  "office_phone",
  "google_scholar_id",
  "google_scholar_url",
  "orcid",
  "linkedin_url",
  "website_url",
  "researchgate_url",
  "scopus_id",
  "institutional_role",
  "leadership_message",
  "is_active",
  "is_public",
  "is_researcher",
  "is_featured",
  "show_on_directory",
  "deleted_at",
  "created_at",
  "updated_at",
].join(",");

type PersonListParams = PaginationParams & {
  search?: string;
  department_id?: string;
  school_id?: string;
  academic_rank?: string;
  employment_type?: string;
  status?: PersonStatusFilter;
  fields?: string;
  include?: string;
};

function withDefaultPersonListSelection(params?: PersonListParams): PersonListParams {
  return {
    ...params,
    fields: params?.fields ?? PERSON_LIST_FIELDS,
    include: params?.include ?? PERSON_LIST_INCLUDE,
  };
}

export function usePersons(params?: PersonListParams) {
  const queryParams = withDefaultPersonListSelection(params);
  return useQuery({
    queryKey: queryKeys.persons.list(queryParams),
    queryFn: () => personsApi.list(queryParams),
  });
}

export function usePerson(id: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.persons.detail(id),
    queryFn: () => personsApi.get(id, { fields: PERSON_DETAIL_FIELDS, include: PERSON_DETAIL_INCLUDE }),
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
    mutationFn: (data: PersonCreatePayload) => personsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.persons.all });
    },
  });
}

export function useUpdatePerson() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: PersonUpdatePayload }) =>
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

export function useActivatePerson() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => personsApi.activate(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.persons.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.persons.detail(id) });
    },
  });
}

export function useDeactivatePerson() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => personsApi.deactivate(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.persons.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.persons.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.staff.all });
    },
  });
}

export function useUploadPersonPhoto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, file }: { id: string; file: File }) => personsApi.uploadPhoto(id, file),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.persons.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.persons.detail(id) });
    },
  });
}

export function useRemovePersonPhoto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => personsApi.removePhoto(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.persons.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.persons.detail(id) });
    },
  });
}
