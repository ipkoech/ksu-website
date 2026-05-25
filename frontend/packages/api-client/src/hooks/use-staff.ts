import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { staffApi } from "../main";
import { queryKeys } from "./query-keys";
import type {
  StaffAssignmentActivatePayload,
  StaffAssignmentConflictCheckPayload,
  StaffAssignmentCreatePayload,
  StaffAssignmentEndPayload,
  StaffAssignmentReassignPayload,
  StaffAssignmentStatusFilter,
  StaffAssignmentUpdatePayload,
} from "../main/types";
import type { PaginationParams } from "../client";

export function useStaffAssignments(
  params?: PaginationParams & { person_id?: string; entity_type?: string; entity_id?: string; status?: StaffAssignmentStatusFilter },
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: queryKeys.staff.assignments(params),
    queryFn: () => staffApi.listAssignments(params),
    enabled: options?.enabled !== false,
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
    mutationFn: (data: StaffAssignmentCreatePayload) => staffApi.createAssignment(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.staff.all });
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
    mutationFn: ({ id, data }: { id: string; data: StaffAssignmentUpdatePayload }) =>
      staffApi.updateAssignment(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.staff.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.staff.assignment(id) });
    },
  });
}

export function useEndStaffAssignment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data?: StaffAssignmentEndPayload }) =>
      staffApi.endAssignment(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.staff.all });
    },
  });
}

export function useActivateStaffAssignment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data?: StaffAssignmentActivatePayload }) =>
      staffApi.activateAssignment(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.staff.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.staff.assignment(id) });
    },
  });
}

export function useReassignStaffAssignment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: StaffAssignmentReassignPayload }) =>
      staffApi.reassignAssignment(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.staff.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.staff.assignment(id) });
    },
  });
}

export function useDeleteStaffAssignment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => staffApi.deleteAssignment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.staff.assignments() });
      queryClient.invalidateQueries({ queryKey: queryKeys.staff.all });
    },
  });
}

export function useCheckPositionConflict() {
  return useMutation({
    mutationFn: (data: StaffAssignmentConflictCheckPayload) => staffApi.checkConflict(data),
  });
}

export function useStaffEntities(params: { entity_type: string; search?: string; limit?: number }, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ["staff", "entities", params],
    queryFn: () => staffApi.listEntities(params),
    enabled: options?.enabled !== false && !!params.entity_type,
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
