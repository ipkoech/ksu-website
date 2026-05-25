import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { governanceApi } from "../main";
import { queryKeys } from "./query-keys";
import type { Board, StaffAssignment } from "../main/types";

export function useBoards(params?: { board_type?: string; parent_entity_type?: string; parent_entity_id?: string; fields?: string; include?: string }) {
  return useQuery({
    queryKey: queryKeys.governance.boards(params),
    queryFn: () => governanceApi.listBoards(params),
  });
}

export function useBoard(id: string, options?: { enabled?: boolean; fields?: string; include?: string }) {
  return useQuery({
    queryKey: queryKeys.governance.board(id),
    queryFn: () => governanceApi.getBoard(id, { fields: options?.fields, include: options?.include }),
    enabled: options?.enabled !== false && !!id,
  });
}

export function useBoardBySlug(slug: string, options?: { enabled?: boolean; fields?: string; include?: string }) {
  return useQuery({
    queryKey: queryKeys.governance.board(`slug:${slug}`),
    queryFn: () => governanceApi.getBoardBySlug(slug, { fields: options?.fields, include: options?.include }),
    enabled: options?.enabled !== false && !!slug,
  });
}

export function useBoardMembers(id: string, options?: { enabled?: boolean; fields?: string; include?: string }) {
  return useQuery({
    queryKey: queryKeys.governance.boardMembers(id),
    queryFn: () => governanceApi.getBoardMembers(id, { fields: options?.fields, include: options?.include }),
    enabled: options?.enabled !== false && !!id,
  });
}

export function useBoardMembersBySlug(slug: string, options?: { enabled?: boolean; fields?: string; include?: string }) {
  return useQuery({
    queryKey: queryKeys.governance.boardMembers(`slug:${slug}`),
    queryFn: () => governanceApi.getBoardMembersBySlug(slug, { fields: options?.fields, include: options?.include }),
    enabled: options?.enabled !== false && !!slug,
  });
}

export function useCouncil() {
  return useQuery({
    queryKey: queryKeys.governance.council,
    queryFn: () => governanceApi.getCouncil(),
  });
}

export function useManagementBoard() {
  return useQuery({
    queryKey: queryKeys.governance.managementBoard,
    queryFn: () => governanceApi.getManagementBoard(),
  });
}

export function useCreateBoard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<Board>) => governanceApi.createBoard(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.governance.boards() });
    },
  });
}

export function useUpdateBoard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Board> }) =>
      governanceApi.updateBoard(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.governance.boards() });
    },
  });
}

export function useDeleteBoard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => governanceApi.deleteBoard(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.governance.boards() });
    },
  });
}

export function useAddBoardMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, personId, role, data }: { id: string; personId: string; role: string; data?: Partial<StaffAssignment> }) =>
      governanceApi.addMember(id, personId, role, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.governance.boardMembers(id) });
    },
  });
}

export function useRemoveBoardMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, personId }: { id: string; personId: string }) =>
      governanceApi.removeMember(id, personId),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.governance.boardMembers(id) });
    },
  });
}
