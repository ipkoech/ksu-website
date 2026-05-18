"use client";

import type { ReactNode } from "react";
import { usePermissions } from "../hooks/use-permissions";

interface PermissionGuardProps {
  scope: string | string[];
  mode?: "any" | "all";
  children: ReactNode;
  fallback?: ReactNode;
}

export function PermissionGuard({
  scope,
  mode = "any",
  children,
  fallback = null,
}: PermissionGuardProps) {
  const { hasScope, hasAnyScope, hasAllScopes } = usePermissions();

  const scopes = Array.isArray(scope) ? scope : [scope];
  const hasAccess =
    mode === "all" ? hasAllScopes(scopes) : hasAnyScope(scopes);

  if (!hasAccess) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

interface AdminOnlyProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function AdminOnly({ children, fallback = null }: AdminOnlyProps) {
  const { isAdmin } = usePermissions();

  if (!isAdmin) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

interface SuperAdminOnlyProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function SuperAdminOnly({ children, fallback = null }: SuperAdminOnlyProps) {
  const { isSuperAdmin } = usePermissions();

  if (!isSuperAdmin) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
