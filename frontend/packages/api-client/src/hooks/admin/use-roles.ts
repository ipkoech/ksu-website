import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { PaginatedResponse, Role, RoleListParams } from "../../types/admin";
import { adminRequest, unwrapAdminData } from "./_utils";

export const roleKeys = {
  all: ["admin", "roles"] as const,
  list: (params?: RoleListParams) => [...roleKeys.all, "list", params] as const,
  detail: (id: string) => [...roleKeys.all, "detail", id] as const,
  permissions: (id: string) => [...roleKeys.detail(id), "permissions"] as const,
};

const ROLES_LIST_FIELDS = "id,name,display_name,description,is_system,is_active";

export function useRoles(params?: RoleListParams, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: roleKeys.list(params),
    queryFn: () =>
      adminRequest<PaginatedResponse<Role>>("GET", "/api/admin/roles", {
        params: {
          ...params,
          per_page: params?.limit,
          limit: undefined,
          fields: ROLES_LIST_FIELDS,
          include: "role_permissions(permission(id,name))",
        } as Record<string, unknown> | undefined,
      }),
    enabled: options?.enabled ?? true,
  });
}

export function useRole(id: string) {
  return useQuery({
    queryKey: roleKeys.detail(id),
    queryFn: async () => unwrapAdminData(await adminRequest<{ data: Role }>("GET", `/api/admin/roles/${id}`)),
    enabled: Boolean(id),
  });
}

export function useCreateRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => adminRequest<{ data: Role }>("POST", "/api/admin/roles", { body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roleKeys.all });
    },
  });
}

export function useUpdateRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      adminRequest<{ data: Role }>("PUT", `/api/admin/roles/${id}`, { body: data }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: roleKeys.all });
      queryClient.invalidateQueries({ queryKey: roleKeys.detail(variables.id) });
    },
  });
}

export function useDeleteRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminRequest<void>("DELETE", `/api/admin/roles/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roleKeys.all });
    },
  });
}

export function useUpdateRolePermissions() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, permissions }: { id: string; permissions: string[] }) =>
      adminRequest<void>("PUT", `/api/admin/roles/${id}/permissions`, { body: { permissions } }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: roleKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: roleKeys.permissions(variables.id) });
    },
  });
}
