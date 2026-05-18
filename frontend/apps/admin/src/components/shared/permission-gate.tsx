"use client";

import { usePermissions } from "@/hooks/use-permissions";

interface PermissionGateProps {
  permission: string | string[];
  fallback?: React.ReactNode;
  children: React.ReactNode;
  requireAll?: boolean;
}

export function PermissionGate({
  permission,
  fallback = null,
  children,
  requireAll = false,
}: PermissionGateProps) {
  const { hasPermission, hasAllPermissions, hasAnyPermission } = usePermissions();

  const permissions = Array.isArray(permission) ? permission : [permission];

  const allowed = requireAll
    ? hasAllPermissions(permissions)
    : hasAnyPermission(permissions);

  if (!allowed) return <>{fallback}</>;

  return <>{children}</>;
}