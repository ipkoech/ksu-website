import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { staffApi } from "../main";
import { queryKeys } from "./query-keys";
import type { StaffAssignment, PaginatedResponse } from "../main/types";
import type { PaginationParams } from "../client";

export function useStaffAssignments(params?: PaginationParams & { person_id?: string; entity_type?: string; entity_id?: string }) {
  return useQuery({
    queryKey: queryKeys.staff.assignments(params),
    queryFn: () => staffApi.listAssignments(params),
  });
}

export function useStaffAssignment(id: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.staff.assignment(id),
    queryFn: () => staffApi.getAssignment(id),
    enabled: options?.enabled !== false && !!id,
  });
}

export function useReportingChain(assignmentId: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.staff.reportingChain(assignmentId),
    queryFn: () => staffApi.getReportingChain(assignmentId),
    enabled: options?.enabled !== false && !!assignmentId,
  });
}

export function useDirectReports(assignmentId: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.staff.directReports(assignmentId),
    queryFn: () => staffApi.getDirectReports(assignmentId),
    enabled: options?.enabled !== false && !!assignmentId,
  });
}

export function useCreateStaffAssignment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<StaffAssignment>) => staffApi.createAssignment(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.staff.assignments() });
      if (variables.person_id) {
        queryClient.invalidateQueries({ 
          queryKey: queryKeys.staff.assignments({ person_id: variables.person_id }) 
        });
      }
    },
  });
}

export function useUpdateStaffAssignment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<StaffAssignment> }) =>
      staffApi.updateAssignment(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.staff.assignments() });
      queryClient.invalidateQueries({ queryKey: queryKeys.staff.assignment(id) });
    },
  });
}

export function useEndStaffAssignment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data?: { end_date?: string; notes?: string } }) =>
      staffApi.endAssignment(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.staff.assignments() });
    },
  });
}

export function useDeleteStaffAssignment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => staffApi.deleteAssignment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.staff.assignments() });
    },
  });
}

export function useCheckPositionConflict() {
  return useMutation({
    mutationFn: (data: { entity_type: string; entity_id?: string; role: string; exclude_assignment_id?: string }) =>
      staffApi.checkConflict(data.entity_type, data.entity_id, data.role, data.exclude_assignment_id),
  });
}

export function useEntityTypes() {
  return useQuery({
    queryKey: ["staff", "entity-types"],
    queryFn: () => staffApi.getEntityTypes(),
  });
}

export function useRoles(entityType?: string) {
  return useQuery({
    queryKey: ["staff", "roles", entityType],
    queryFn: () => staffApi.getRoles(entityType),
    enabled: !!entityType,
  });
}

export function useAcademicRanks() {
  return useQuery({
    queryKey: ["staff", "academic-ranks"],
    queryFn: () => staffApi.getAcademicRanks(),
  });
}