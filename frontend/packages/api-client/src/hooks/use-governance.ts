import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { governanceApi } from "../main";
import { queryKeys } from "./query-keys";
import type { Board, StaffAssignment } from "../main/types";

export function useBoards(params?: { board_type?: string; parent_entity_type?: string; parent_entity_id?: string }) {
  return useQuery({
    queryKey: queryKeys.governance.boards(params),
    queryFn: () => governanceApi.listBoards(params),
  });
}

export function useBoard(slug: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.governance.board(slug),
    queryFn: () => governanceApi.getBoard(slug),
    enabled: options?.enabled !== false && !!slug,
  });
}

export function useBoardMembers(slug: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.governance.boardMembers(slug),
    queryFn: () => governanceApi.getBoardMembers(slug),
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
    mutationFn: ({ slug, personId, role, data }: { slug: string; personId: string; role: string; data?: Partial<StaffAssignment> }) =>
      governanceApi.addMember(slug, personId, role, data),
    onSuccess: (_, { slug }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.governance.boardMembers(slug) });
    },
  });
}

export function useRemoveBoardMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ slug, personId }: { slug: string; personId: string }) =>
      governanceApi.removeMember(slug, personId),
    onSuccess: (_, { slug }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.governance.boardMembers(slug) });
    },
  });
}