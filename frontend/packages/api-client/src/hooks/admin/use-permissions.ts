import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Permission } from "../../types/admin";
import { adminRequest } from "./_utils";

export const permissionKeys = {
  all: ["admin", "permissions"] as const,
  list: (params?: { resource?: string }) => [...permissionKeys.all, params] as const,
};

export function usePermissions(params?: { resource?: string }, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: permissionKeys.list(params),
    queryFn: () => adminRequest<{ data: Permission[] }>("GET", "/api/admin/permissions", { params }),
    select: (response) => response.data,
    enabled: options?.enabled ?? true,
  });
}

export function useCreatePermission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { name: string; description?: string; resource?: string; action?: string }) =>
      adminRequest<{ data: Permission }>("POST", "/api/admin/permissions", { params: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: permissionKeys.all });
    },
  });
}
