type SystemAccessUser = {
  roles?: string[];
  permissions?: string[];
};

function normalizedRoles(user: SystemAccessUser | null | undefined) {
  return (user?.roles ?? []).map((role) => role.trim().toLowerCase().replace(/_/g, "-"));
}

function normalizedPermissions(user: SystemAccessUser | null | undefined) {
  return (user?.permissions ?? []).map((permission) => permission.trim().toLowerCase());
}

function hasPermission(user: SystemAccessUser | null | undefined, permission: string) {
  const normalized = permission.trim().toLowerCase();
  const permissions = normalizedPermissions(user);
  const [resource] = normalized.split(":");
  return permissions.includes("admin:*") || permissions.includes(normalized) || permissions.includes(`${resource}:*`);
}

function hasAnySystemScope(
  user: SystemAccessUser | null | undefined,
  hasScope: (scope: string) => boolean,
  scopes: string[],
) {
  return scopes.some((scope) => {
    const normalized = scope.trim().toLowerCase();
    const dotted = normalized.replace(/:/g, ".");
    const colon = normalized.replace(/\./g, ":");
    return hasScope(normalized) || hasScope(dotted) || hasScope(colon) || hasPermission(user, colon);
  });
}

export function hasSystemAdminAccess(user: SystemAccessUser | null | undefined) {
  const roles = normalizedRoles(user);
  const permissions = normalizedPermissions(user);
  return (
    roles.includes("super-admin") ||
    roles.includes("admin") ||
    roles.includes("system-admin") ||
    permissions.includes("admin:*") ||
    permissions.includes("system:*") ||
    permissions.includes("system:manage") ||
    permissions.includes("users:write") ||
    permissions.includes("roles:write") ||
    permissions.includes("permissions:write")
  );
}

export function canManageUsers(user: SystemAccessUser | null | undefined, hasScope: (scope: string) => boolean) {
  return hasSystemAdminAccess(user) || hasAnySystemScope(user, hasScope, ["users:write", "users.create", "users.edit", "users.suspend"]);
}

export function canDeleteUsers(user: SystemAccessUser | null | undefined, hasScope: (scope: string) => boolean) {
  return hasSystemAdminAccess(user) || hasAnySystemScope(user, hasScope, ["users:delete", "users.delete"]);
}

export function canViewUsers(user: SystemAccessUser | null | undefined, hasScope: (scope: string) => boolean) {
  return hasSystemAdminAccess(user) || hasAnySystemScope(user, hasScope, ["users:read", "users.view"]);
}

export function canViewRoles(user: SystemAccessUser | null | undefined, hasScope: (scope: string) => boolean) {
  return hasSystemAdminAccess(user) || hasAnySystemScope(user, hasScope, ["roles:read", "roles.view"]);
}

export function canManageRoles(user: SystemAccessUser | null | undefined, hasScope: (scope: string) => boolean) {
  return hasSystemAdminAccess(user) || hasAnySystemScope(user, hasScope, ["roles:write", "roles.manage"]);
}

export function canDeleteRoles(user: SystemAccessUser | null | undefined, hasScope: (scope: string) => boolean) {
  return hasSystemAdminAccess(user) || hasAnySystemScope(user, hasScope, ["roles:delete", "roles.delete"]);
}

export function canViewPermissions(user: SystemAccessUser | null | undefined, hasScope: (scope: string) => boolean) {
  return hasSystemAdminAccess(user) || hasAnySystemScope(user, hasScope, ["permissions:read", "permissions.view"]);
}

export function canViewAudit(user: SystemAccessUser | null | undefined, hasScope: (scope: string) => boolean) {
  return hasSystemAdminAccess(user) || hasAnySystemScope(user, hasScope, ["audit:read", "audit.view"]);
}

export function canViewSettings(user: SystemAccessUser | null | undefined, hasScope: (scope: string) => boolean) {
  return hasSystemAdminAccess(user) || hasAnySystemScope(user, hasScope, ["settings:read", "settings.view", "settings.manage"]);
}

export function canManageSettings(user: SystemAccessUser | null | undefined, hasScope: (scope: string) => boolean) {
  return hasSystemAdminAccess(user) || hasAnySystemScope(user, hasScope, ["settings:write", "settings.manage"]);
}

export function canViewApiKeys(user: SystemAccessUser | null | undefined, hasScope: (scope: string) => boolean) {
  return hasSystemAdminAccess(user) || hasAnySystemScope(user, hasScope, ["api_keys:read", "api_keys.view", "api_keys.manage"]);
}

export function canManageApiKeys(user: SystemAccessUser | null | undefined, hasScope: (scope: string) => boolean) {
  return hasSystemAdminAccess(user) || hasAnySystemScope(user, hasScope, ["api_keys:write", "api_keys:delete", "api_keys.manage"]);
}

export function canViewWebhooks(user: SystemAccessUser | null | undefined, hasScope: (scope: string) => boolean) {
  return hasSystemAdminAccess(user) || hasAnySystemScope(user, hasScope, ["webhooks:read", "webhooks.view", "webhooks.manage"]);
}

export function canManageWebhooks(user: SystemAccessUser | null | undefined, hasScope: (scope: string) => boolean) {
  return hasSystemAdminAccess(user) || hasAnySystemScope(user, hasScope, ["webhooks:write", "webhooks:delete", "webhooks.manage"]);
}

export function canViewNotifications(user: SystemAccessUser | null | undefined, hasScope: (scope: string) => boolean) {
  return hasSystemAdminAccess(user) || hasAnySystemScope(user, hasScope, ["notifications:read", "notifications.view"]);
}

export function canManageNotifications(user: SystemAccessUser | null | undefined, hasScope: (scope: string) => boolean) {
  return hasSystemAdminAccess(user) || hasAnySystemScope(user, hasScope, ["notifications:write", "notifications:delete", "notifications.manage"]);
}

export function canSendNotifications(user: SystemAccessUser | null | undefined, hasScope: (scope: string) => boolean) {
  return hasSystemAdminAccess(user) || hasAnySystemScope(user, hasScope, ["notifications:send", "notifications.send"]);
}
