"use client";

import { useAuth } from "@ksu/auth";
import { useMemo } from "react";

export function usePermissions() {
  const { user } = useAuth();

  const permissions = useMemo(() => {
    if (!user?.permissions) return new Set<string>();

    const allPermissions = new Set<string>();
    user.permissions.forEach((p) => allPermissions.add(p));

    return allPermissions;
  }, [user]);

  const hasPermission = (scope: string): boolean => {
    if (permissions.has("*")) return true;
    if (permissions.has(scope)) return true;

    const parts = scope.split(":");
    for (let i = parts.length - 1; i > 0; i--) {
      const wildcard = [...parts.slice(0, i), "*"].join(":");
      if (permissions.has(wildcard)) return true;
    }

    return false;
  };

  const hasAllPermissions = (scopes: string[]): boolean => {
    return scopes.every(hasPermission);
  };

  const hasAnyPermission = (scopes: string[]): boolean => {
    return scopes.some(hasPermission);
  };

  const canView = (resource: string) => hasPermission(`${resource}:read`);
  const canCreate = (resource: string) => hasPermission(`${resource}:write`) || hasPermission(`${resource}:create`);
  const canEdit = (resource: string) => hasPermission(`${resource}:write`) || hasPermission(`${resource}:update`);
  const canDelete = (resource: string) => hasPermission(`${resource}:delete`);

  return {
    permissions,
    hasPermission,
    hasAllPermissions,
    hasAnyPermission,
    canView,
    canCreate,
    canEdit,
    canDelete,
    isAdmin: permissions.has("*"),
  };
}