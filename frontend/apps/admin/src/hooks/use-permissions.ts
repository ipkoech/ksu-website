"use client";

import { useAuth } from "@ksu/auth";
import { useMemo } from "react";

function normalizePermission(permission: string) {
  return permission.trim().toLowerCase();
}

function normalizeRole(role: string) {
  return role.trim().toLowerCase().replace(/_/g, "-");
}

export function usePermissions() {
  const { user } = useAuth();

  const permissions = useMemo(() => {
    if (!user?.permissions) return new Set<string>();

    const allPermissions = new Set<string>();
    user.permissions.forEach((p) => allPermissions.add(normalizePermission(p)));
    user.services?.forEach((service) => {
      service.scopes.forEach((scope) => allPermissions.add(normalizePermission(scope)));
    });

    if (user.roles?.some((role) => ["super-admin", "admin"].includes(normalizeRole(role)))) {
      allPermissions.add("*");
    }

    return allPermissions;
  }, [user]);

  const equivalentScopes = (scope: string): string[] => {
    const normalized = normalizePermission(scope);
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
      if (action.startsWith("manage") || ["create", "edit", "update"].includes(action)) scopes.add(`${resource}:write`);
      if (action === "delete") scopes.add(`${resource}:delete`);
    }

    return Array.from(scopes);
  };

  const hasPermission = (scope: string): boolean => {
    if (permissions.has("*")) return true;
    if (permissions.has("admin:*")) return true;

    const candidates = equivalentScopes(scope);
    if (candidates.some((candidate) => permissions.has(candidate))) return true;

    for (const candidate of candidates) {
      const separator = candidate.includes(":") ? ":" : ".";
      const parts = candidate.split(separator);

      for (let i = parts.length - 1; i > 0; i--) {
        const wildcard = [...parts.slice(0, i), "*"].join(separator);
        if (permissions.has(wildcard)) return true;
      }
    }

    return false;
  };

  const hasAllPermissions = (scopes: string[]): boolean => {
    return scopes.every(hasPermission);
  };

  const hasAnyPermission = (scopes: string[]): boolean => {
    return scopes.some(hasPermission);
  };

  const resourceManageScopes: Record<string, string[]> = {
    academic: ["academic:write", "academic.manage_schools", "academic.manage_departments", "academic.manage_programmes", "academic.manage_staff"],
    admissions: ["admissions:write", "admissions.manage_intakes", "admissions.manage_info", "admissions.manage_applications"],
    content: [
      "content:write",
      "content.manage_news",
      "content.manage_events",
      "content.manage_blogs",
      "content.manage_announcements",
      "content.manage_pages",
      "content.publish",
      "marketing.manage_sliders",
    ],
    governance: ["governance:write", "governance.manage", "governance.manage_boards"],
    organization: ["organization:write", "organization.manage", "organization.manage_divisions", "organization.manage_wings"],
    library: ["library:write", "library.manage_resources", "library.manage_services", "library.manage_collections", "library.manage_loans", "library.manage_staff"],
    marketing: ["marketing:write", "marketing.manage_sliders", "marketing.manage_testimonials", "marketing.manage_newsletters"],
    media: ["media:write", "media.manage", "media.upload", "media.delete"],
    persons: ["persons:write", "persons.manage", "staff.manage_assignments", "academic.manage_staff"],
    research: ["research:write", "research.manage_projects", "research.manage_publications", "research.manage_centers", "research.manage_collaborations"],
    settings: ["settings:write", "settings.manage"],
    staff: ["staff:write", "staff.manage_assignments", "academic.manage_staff"],
    support: ["support:write", "support.manage_faqs", "support.manage_contacts"],
    system: ["users:write", "roles:write", "permissions:write", "settings:write", "api_keys:write", "webhooks:write", "notifications:write", "users.edit", "users.create", "roles.manage", "permissions.manage", "settings.manage", "api_keys.manage", "webhooks.manage", "notifications.manage"],
    users: ["users:write", "users.edit", "users.create", "users.invite", "users.suspend"],
  };

  const resourceViewScopes: Record<string, string[]> = {
    ...resourceManageScopes,
    academic: ["academic:read", "academic.view", ...(resourceManageScopes.academic ?? [])],
    admissions: ["admissions:read", "admissions.view", "admissions.view_applications", ...(resourceManageScopes.admissions ?? [])],
    content: ["content:read", "content.view", "content.view_drafts", ...(resourceManageScopes.content ?? [])],
    governance: ["governance:read", "governance.view", ...(resourceManageScopes.governance ?? [])],
    organization: ["organization:read", "organization.view", ...(resourceManageScopes.organization ?? [])],
    library: ["library:read", "library.view", ...(resourceManageScopes.library ?? [])],
    marketing: ["marketing:read", "marketing.view", ...(resourceManageScopes.marketing ?? [])],
    media: ["media:read", "media.view", ...(resourceManageScopes.media ?? [])],
    persons: ["persons:read", "persons.view", ...(resourceManageScopes.persons ?? [])],
    research: ["research:read", "research.view", "research.view_projects", ...(resourceManageScopes.research ?? [])],
    staff: ["staff:read", "staff.view_assignments", ...(resourceManageScopes.staff ?? [])],
    support: ["support:read", "support.view", ...(resourceManageScopes.support ?? [])],
    system: ["users:read", "roles:read", "permissions:read", "audit:read", "settings:read", "api_keys:read", "webhooks:read", "notifications:read", "users.view", "roles.view", "permissions.view", "audit.view", "settings.view", "api_keys.view", "webhooks.view", "notifications.view", ...(resourceManageScopes.system ?? [])],
    users: ["users:read", "users.view", ...(resourceManageScopes.users ?? [])],
  };

  const hasResourcePermission = (resource: string, action: "view" | "manage" | "delete") => {
    const baseScopes = action === "view" ? resourceViewScopes[resource] : resourceManageScopes[resource];
    const actionScopes =
      action === "view"
        ? [`${resource}:read`, `${resource}.view`]
        : action === "delete"
          ? [`${resource}:delete`, `${resource}.delete`, `${resource}:write`, `${resource}.manage`]
          : [`${resource}:write`, `${resource}:create`, `${resource}:update`, `${resource}.manage`, `${resource}.create`, `${resource}.edit`];

    return [...actionScopes, ...(baseScopes ?? [])].some(hasPermission);
  };

  const canView = (resource: string) => hasResourcePermission(resource, "view");
  const canCreate = (resource: string) => hasResourcePermission(resource, "manage");
  const canEdit = (resource: string) => hasResourcePermission(resource, "manage");
  const canDelete = (resource: string) => hasResourcePermission(resource, "delete");

  return {
    permissions,
    hasPermission,
    hasAllPermissions,
    hasAnyPermission,
    canView,
    canCreate,
    canEdit,
    canDelete,
    isAdmin: permissions.has("*") || permissions.has("admin:*"),
  };
}
