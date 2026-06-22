import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  PaginatedResponse,
  User,
  UserCreatePayload,
  UserListParams,
  UserRoleAssignmentPayload,
  UserUpdatePayload,
} from "../../types/admin";
import { adminRequest, unwrapAdminData } from "./_utils";

export const userKeys = {
  all: ["admin", "users"] as const,
  list: (params?: UserListParams) => [...userKeys.all, "list", params] as const,
  detail: (id: string) => [...userKeys.all, "detail", id] as const,
  roles: (id: string) => [...userKeys.detail(id), "roles"] as const,
};

const USERS_LIST_FIELDS = "id,email,full_name,is_active,last_login_at";
const USERS_LIST_INCLUDE = "role_assignments(id,role_id,scope_type,scope_id,is_active,role(id,name,display_name),scope)";
export function useUsers(params?: UserListParams, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: userKeys.list(params),
    queryFn: () =>
      adminRequest<PaginatedResponse<User>>("GET", "/api/admin/users", {
        params: {
          ...params,
          per_page: params?.limit,
          limit: undefined,
          fields: USERS_LIST_FIELDS,
          include: USERS_LIST_INCLUDE,
        } as Record<string, unknown> | undefined,
      }),
    enabled: options?.enabled ?? true,
  });
}

const USER_DETAIL_FIELDS = "id,email,phone,full_name,avatar_url,push_tokens,is_active,is_verified,mfa_enabled,last_login_at,failed_login_attempts,locked_until,email_verified_at,roles,person_id,created_at,updated_at";
const USER_DETAIL_INCLUDE = "role_assignments(id,role_id,scope_type,scope_id,expires_at,note,is_active,role(id,name,display_name,is_active),scope)";

export function useUser(id: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: userKeys.detail(id),
    queryFn: async () =>
      unwrapAdminData(
        await adminRequest<{ data: User }>("GET", `/api/admin/users/${id}`, {
          params: {
            fields: USER_DETAIL_FIELDS,
            include: USER_DETAIL_INCLUDE,
          } as Record<string, unknown>,
        })
      ),
    enabled: (options?.enabled ?? true) && Boolean(id),
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UserCreatePayload) => adminRequest<{ data: User }>("POST", "/api/admin/users", { body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UserUpdatePayload }) =>
      adminRequest<{ data: User }>("PUT", `/api/admin/users/${id}`, { body: data }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
      queryClient.invalidateQueries({ queryKey: userKeys.detail(variables.id) });
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminRequest<void>("DELETE", `/api/admin/users/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
    },
  });
}

export function useUpdateUserRoles() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, roles }: { id: string; roles: UserRoleAssignmentPayload[] }) =>
      adminRequest<void>("PUT", `/api/admin/users/${id}/roles`, { body: { roles } }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: userKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: userKeys.roles(variables.id) });
    },
  });
}

export function useAssignUserRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      roleId,
      scope_type,
      scope_id,
    }: {
      id: string;
      roleId: string;
      scope_type?: string;
      scope_id?: string;
    }) =>
      adminRequest<void>("POST", `/api/admin/users/${id}/roles/${roleId}`, {
        params: { scope_type, scope_id },
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: userKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: userKeys.roles(variables.id) });
    },
  });
}
