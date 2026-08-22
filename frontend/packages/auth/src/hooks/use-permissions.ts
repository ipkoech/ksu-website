"use client";

import { useMemo } from "react";
import { useAuthStore } from "../store";
import { isSuperAdmin } from "../permissions";
import type { Service } from "../types";

function normalizeScope(scope: string) {
  return scope.trim().toLowerCase();
}

function equivalentScopes(scope: string) {
  const normalized = normalizeScope(scope);
  const scopes = new Set([normalized]);

  if (normalized.includes(":")) {
    const [resource, action = ""] = normalized.split(":");
    scopes.add(`${resource}.${action}`);
    if (action === "read") scopes.add(`${resource}.view`);
    if (["write", "create", "update", "delete", "manage"].includes(action)) {
      scopes.add(`${resource}.manage`);
      scopes.add(`${resource}.create`);
      scopes.add(`${resource}.edit`);
    }
  }

  if (normalized.includes(".")) {
    const [resource, action = ""] = normalized.split(".");
    scopes.add(`${resource}:${action}`);
    if (action === "view") scopes.add(`${resource}:read`);
    if (action.startsWith("manage") || ["create", "edit", "update"].includes(action)) {
      scopes.add(`${resource}:write`);
    }
    if (action === "delete") scopes.add(`${resource}:delete`);
  }

  return Array.from(scopes);
}

export function usePermissions() {
  const { user, activeService } = useAuthStore();

  const currentServiceAccess = useMemo(() => {
    if (!user || !activeService) return null;
    return user.services.find((s) => s.service === activeService) || null;
  }, [user, activeService]);

  const scopes = useMemo(() => {
    return (currentServiceAccess?.scopes || []).map(normalizeScope);
  }, [currentServiceAccess]);

  const availableScopes = useMemo(() => {
    return new Set([
      ...scopes,
      ...(user?.permissions ?? []).map(normalizeScope),
    ]);
  }, [scopes, user?.permissions]);

  const hasScope = (scope: string): boolean => {
    if (!user) return false;
    if (availableScopes.has("*") || availableScopes.has("admin:*")) return true;

    const candidates = equivalentScopes(scope);
    if (candidates.some((candidate) => availableScopes.has(candidate))) return true;

    return candidates.some((candidate) => {
      const resource = candidate.split(candidate.includes(":") ? ":" : ".")[0];
      return availableScopes.has(`${resource}:*`) || availableScopes.has(`${resource}.*`);
    });
  };

  const hasAnyScope = (checkScopes: string[]): boolean => {
    return checkScopes.some((scope) => hasScope(scope));
  };

  const hasAllScopes = (checkScopes: string[]): boolean => {
    return checkScopes.every((scope) => hasScope(scope));
  };

  const canAccessService = (service: Service): boolean => {
    if (!user) return false;
    return user.services.some((access) => access.service === service);
  };

  const isAdmin = useMemo(() => {
    if (!user) return false;
    return user.roles.some((r) =>
      ["super-admin", "admin", "system-admin", "content-admin", "research-admin", "library-admin"].includes(r)
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
