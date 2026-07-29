import type { Service, User } from "@ksu/auth";
import type { PortalAccess } from "@ksu/api-client";

type RoleDestination = {
  roles: string[];
  href: string;
  service: Service;
};

const roleDestinations: RoleDestination[] = [
  { roles: ["super-admin", "system-admin"], href: "/super-admin", service: "system" },
  { roles: ["admin", "institution-admin", "office-admin", "office-editor", "office-staff-manager", "staff-admin"], href: "/admin", service: "main" },
  { roles: ["content-admin", "content-manager", "content-staff", "cocms-admin", "corporate-admin"], href: "/corporate-communication", service: "main" },
  { roles: ["story-contributor"], href: "/story-contributor", service: "main" },
  { roles: ["library-admin", "library-manager", "library-staff"], href: "/library", service: "library" },
  { roles: ["research-content"], href: "/research/content", service: "research" },
  { roles: ["research-farm"], href: "/research/farm", service: "research" },
  { roles: ["research-sustainability"], href: "/research/sustainability", service: "research" },
  { roles: ["research-admin", "research-manager", "research-staff", "innovation-officer", "publications-admin"], href: "/research", service: "research" },
  { roles: ["researcher", "lecturer"], href: "/research/publications/submissions", service: "research" },
  { roles: ["school-admin", "school-editor", "academic-admin"], href: "/schools", service: "main" },
  { roles: ["dept-admin", "dept-staff"], href: "/departments", service: "main" },
  { roles: ["staff"], href: "/settings/profile", service: "main" },
];

const portalPriority = [
  "/super-admin",
  "/admin",
  "/corporate-communication",
  "/story-contributor",
  "/research",
  "/schools",
  "/departments",
  "/library",
  "/settings/profile",
];

const broadAdminRoles = new Set(["super-admin"]);
const broaderPortalRoles = new Set(
  roleDestinations
    .filter((destination) => destination.href !== "/settings/profile")
    .flatMap((destination) => destination.roles),
);

export const staffProfileHref = "/settings/profile";

const serviceFallbacks: Record<Service, string> = {
  main: "/admin",
  research: "/research",
  library: "/library",
  system: "/super-admin",
};

const legacyPortalDestinations: Record<string, string> = {
  cocms: "/corporate-communication",
  "/cocms": "/corporate-communication",
  publications: "/research",
  "/publications": "/research",
  "student-clubs": "/corporate-communication",
  "/student-clubs": "/corporate-communication",
  governance: "/admin",
  "/governance": "/admin",
  "institutional-administration": "/admin",
  "/institutional-administration": "/admin",
};

function normalizeRole(role: string) {
  return role.trim().toLowerCase().replace(/_/g, "-");
}

function requiredRoleDestination(user: User) {
  const roles = new Set(user.roles.map(normalizeRole));
  if (roles.has("school-admin") || roles.has("school-editor")) {
    return { href: "/schools", service: "main" as Service };
  }
  return null;
}

function userHasService(user: User, service: Service) {
  return user.services.some((access) => access.service === service);
}

function normalizePortalAccess(portal: PortalAccess): PortalAccess {
  const href = legacyPortalDestinations[portal.key] ?? legacyPortalDestinations[portal.href];
  return href ? { ...portal, href } : portal;
}

export function resolvePostLoginDestination(user: User, redirect?: string | null) {
  const requiredDestination = requiredRoleDestination(user);
  if (requiredDestination) return requiredDestination;

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

  return { href: serviceFallbacks.main, service: "main" as Service };
}

export function resolvePortalAccessDestination(
  portals: PortalAccess[] | undefined,
  user: User,
  redirect?: string | null,
) {
  const requiredDestination = requiredRoleDestination(user);
  if (requiredDestination) return requiredDestination;

  if (redirect?.startsWith("/")) {
    return { href: redirect, service: null };
  }

  const available = (portals ?? []).map(normalizePortalAccess);
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
    const ordered = [...nonProfilePortals].sort(
      (left, right) =>
        portalPriority.indexOf(left.href) - portalPriority.indexOf(right.href),
    );
    const preferred = ordered.find((portal) => portalPriority.includes(portal.href));
    if (preferred) {
      return { href: preferred.href, service: preferred.service };
    }
    return { href: nonProfilePortals[0].href, service: nonProfilePortals[0].service };
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
