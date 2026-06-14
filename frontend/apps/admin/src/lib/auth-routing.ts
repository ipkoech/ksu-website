import type { Service, User } from "@ksu/auth";

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
  { roles: ["content-admin", "content-manager", "content-staff"], href: "/corporate-communication", service: "main" },
  { roles: ["staff-admin"], href: "/governance", service: "main" },
];

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
  const isBroadAdmin = roles.has("super-admin") || roles.has("admin");

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
