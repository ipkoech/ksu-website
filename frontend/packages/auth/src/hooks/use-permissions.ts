"use client";

import { useMemo } from "react";
import { useAuthStore } from "../store";
import { hasServiceAccess, isSuperAdmin } from "../permissions";
import type { Service } from "../types";

export function usePermissions() {
  const { user, activeService } = useAuthStore();

  const currentServiceAccess = useMemo(() => {
    if (!user || !activeService) return null;
    return user.services.find((s) => s.service === activeService) || null;
  }, [user, activeService]);

  const scopes = useMemo(() => {
    return currentServiceAccess?.scopes || [];
  }, [currentServiceAccess]);

  const hasScope = (scope: string): boolean => {
    if (!user) return false;
    if (isSuperAdmin(user.roles)) return true;
    if (!currentServiceAccess) return false;

    return (
      scopes.includes("*") ||
      scopes.includes(scope) ||
      scopes.some((s) => {
        const [resource] = s.split(".");
        return s === `${resource}.*` && scope.startsWith(`${resource}.`);
      })
    );
  };

  const hasAnyScope = (checkScopes: string[]): boolean => {
    return checkScopes.some((scope) => hasScope(scope));
  };

  const hasAllScopes = (checkScopes: string[]): boolean => {
    return checkScopes.every((scope) => hasScope(scope));
  };

  const canAccessService = (service: Service): boolean => {
    if (!user) return false;
    return hasServiceAccess(user.roles, service);
  };

  const isAdmin = useMemo(() => {
    if (!user) return false;
    return user.roles.some((r) =>
      ["super-admin", "admin", "content-admin", "research-admin", "library-admin"].includes(r)
    );
  }, [user]);

  return {
    scopes,
    hasScope,
    hasAnyScope,
    hasAllScopes,
    canAccessService,
    isAdmin,
    isSuperAdmin: user ? isSuperAdmin(user.roles) : false,
  };
}
