type SystemAccessUser = {
  roles?: string[];
  permissions?: string[];
};

function normalizedRoles(user: SystemAccessUser | null | undefined) {
  return user?.roles ?? [];
}

function normalizedPermissions(user: SystemAccessUser | null | undefined) {
  return user?.permissions ?? [];
}

export function hasSystemAdminAccess(user: SystemAccessUser | null | undefined) {
  const roles = normalizedRoles(user);
  const permissions = normalizedPermissions(user);
  return (
    roles.includes("super-admin") ||
    roles.includes("admin") ||
    permissions.includes("admin:*") ||
    permissions.includes("system:manage")
  );
}

export function canManageUsers(user: SystemAccessUser | null | undefined, hasScope: (scope: string) => boolean) {
  return hasSystemAdminAccess(user) || hasScope("users.create") || hasScope("users.edit") || hasScope("users.suspend");
}

export function canDeleteUsers(user: SystemAccessUser | null | undefined, hasScope: (scope: string) => boolean) {
  return hasSystemAdminAccess(user) || hasScope("users.delete");
}

export function canViewUsers(user: SystemAccessUser | null | undefined, hasScope: (scope: string) => boolean) {
  return hasSystemAdminAccess(user) || hasScope("users.view");
}

export function canViewRoles(user: SystemAccessUser | null | undefined, hasScope: (scope: string) => boolean) {
  return hasSystemAdminAccess(user) || hasScope("roles.view");
}

export function canManageRoles(user: SystemAccessUser | null | undefined, hasScope: (scope: string) => boolean) {
  return hasSystemAdminAccess(user) || hasScope("roles.manage");
}

export function canDeleteRoles(user: SystemAccessUser | null | undefined, hasScope: (scope: string) => boolean) {
  return hasSystemAdminAccess(user) || hasScope("roles.delete");
}

export function canViewPermissions(user: SystemAccessUser | null | undefined, hasScope: (scope: string) => boolean) {
  return hasSystemAdminAccess(user) || hasScope("permissions.view");
}

export function canViewAudit(user: SystemAccessUser | null | undefined, hasScope: (scope: string) => boolean) {
  return hasSystemAdminAccess(user) || hasScope("audit.view");
}

export function canViewSettings(user: SystemAccessUser | null | undefined, hasScope: (scope: string) => boolean) {
  return hasSystemAdminAccess(user) || hasScope("settings.view") || hasScope("settings.manage");
}

export function canManageSettings(user: SystemAccessUser | null | undefined, hasScope: (scope: string) => boolean) {
  return hasSystemAdminAccess(user) || hasScope("settings.manage");
}

export function canViewApiKeys(user: SystemAccessUser | null | undefined, hasScope: (scope: string) => boolean) {
  return hasSystemAdminAccess(user) || hasScope("api_keys.view") || hasScope("api_keys.manage");
}

export function canManageApiKeys(user: SystemAccessUser | null | undefined, hasScope: (scope: string) => boolean) {
  return hasSystemAdminAccess(user) || hasScope("api_keys.manage");
}

export function canViewWebhooks(user: SystemAccessUser | null | undefined, hasScope: (scope: string) => boolean) {
  return hasSystemAdminAccess(user) || hasScope("webhooks.view") || hasScope("webhooks.manage");
}

export function canManageWebhooks(user: SystemAccessUser | null | undefined, hasScope: (scope: string) => boolean) {
  return hasSystemAdminAccess(user) || hasScope("webhooks.manage");
}

export function canViewNotifications(user: SystemAccessUser | null | undefined, hasScope: (scope: string) => boolean) {
  return hasSystemAdminAccess(user) || hasScope("notifications.view");
}

export function canManageNotifications(user: SystemAccessUser | null | undefined, hasScope: (scope: string) => boolean) {
  return hasSystemAdminAccess(user) || hasScope("notifications.manage");
}

export function canSendNotifications(user: SystemAccessUser | null | undefined, hasScope: (scope: string) => boolean) {
  return hasSystemAdminAccess(user) || hasScope("notifications.send");
}
