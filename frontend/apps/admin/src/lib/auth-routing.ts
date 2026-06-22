import type { Service, User } from "@ksu/auth";
import type { PortalAccess } from "@ksu/api-client";

type RoleDestination = {
  roles: string[];
  href: string;
  service: Service;
};

const roleDestinations: RoleDestination[] = [
  { roles: ["system-admin"], href: "/system", service: "system" },
  { roles: ["library-admin", "library-manager", "library-staff"], href: "/library", service: "library" },
  { roles: ["research-admin", "research-manager", "research-staff", "innovation-officer"], href: "/research", service: "research" },
  { roles: ["researcher", "lecturer"], href: "/publications/submissions", service: "research" },
  { roles: ["school-admin", "academic-admin"], href: "/schools", service: "main" },
  { roles: ["dept-admin", "dept-staff"], href: "/departments", service: "main" },
  { roles: ["institution-admin", "office-admin", "office-editor", "office-staff-manager"], href: "/institutional-administration", service: "main" },
  { roles: ["content-admin", "content-manager", "content-staff"], href: "/corporate-communication", service: "main" },
  { roles: ["staff-admin"], href: "/governance", service: "main" },
  { roles: ["staff"], href: "/settings/profile", service: "main" },
];

const broadAdminRoles = new Set(["super-admin", "admin"]);
const broaderPortalRoles = new Set(
  roleDestinations
    .filter((destination) => destination.href !== "/settings/profile")
    .flatMap((destination) => destination.roles),
);

export const staffProfileHref = "/settings/profile";

const serviceFallbacks: Record<Service, string> = {
  main: "/select-service",
  research: "/research",
  library: "/library",
  system: "/system",
};

function normalizeRole(role: string) {
  return role.trim().toLowerCase().replace(/_/g, "-");
}

function userHasService(user: User, service: Service) {
  return user.services.some((access) => access.service === service);
}

export function resolvePostLoginDestination(user: User, redirect?: string | null) {
  if (redirect?.startsWith("/")) {
    return { href: redirect, service: null };
  }

  const roles = new Set(user.roles.map(normalizeRole));
  const isBroadAdmin = Array.from(broadAdminRoles).some((role) => roles.has(role));

  if (!isBroadAdmin) {
    const destination = roleDestinations.find((item) =>
      item.roles.some((role) => roles.has(role)) && userHasService(user, item.service),
    );

    if (destination) {
      return { href: destination.href, service: destination.service };
    }
  }

  if (user.services.length === 1) {
    const service = user.services[0].service;
    return { href: serviceFallbacks[service], service };
  }

  return { href: "/select-service", service: null };
}

export function resolvePortalAccessDestination(
  portals: PortalAccess[] | undefined,
  user: User,
  redirect?: string | null,
) {
  if (redirect?.startsWith("/")) {
    return { href: redirect, service: null };
  }

  const available = portals ?? [];
  const staffProfileOnly =
    available.length === 1 && available[0]?.key === "staff-profile";

  if (staffProfileOnly) {
    return { href: staffProfileHref, service: "main" as Service };
  }

  const nonProfilePortals = available.filter((portal) => portal.key !== "staff-profile");
  if (nonProfilePortals.length === 1) {
    return {
      href: nonProfilePortals[0].href,
      service: nonProfilePortals[0].service,
    };
  }

  if (nonProfilePortals.length > 1) {
    return { href: "/select-service", service: null };
  }

  return resolvePostLoginDestination(user, null);
}

export function isStaffProfileOnlyUser(user: User) {
  const roles = new Set(user.roles.map(normalizeRole));
  const permissions = new Set(user.permissions.map((permission) => permission.trim().toLowerCase()));
  const scopes = new Set(
    user.services.flatMap((service) => service.scopes.map((scope) => scope.trim().toLowerCase())),
  );
  const hasProfileAccess =
    roles.has("staff") ||
    permissions.has("profile.self_edit") ||
    scopes.has("profile.self_edit");
  const hasBroaderAccess =
    Array.from(broadAdminRoles).some((role) => roles.has(role)) ||
    Array.from(broaderPortalRoles).some((role) => roles.has(role));

  return hasProfileAccess && !hasBroaderAccess;
}
