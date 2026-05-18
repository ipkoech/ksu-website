import { useQuery } from "@tanstack/react-query";
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
