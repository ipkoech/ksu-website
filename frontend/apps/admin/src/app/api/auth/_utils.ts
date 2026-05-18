export type BackendAuthEnvelope<T> = {
  status?: string;
  message?: string;
  data?: T;
};

type BackendUser = {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  roles?: string[];
  permissions?: string[];
};

type Service = "main" | "research" | "library";

type FrontendServiceAccess = {
  service: Service;
  roles: string[];
  scopes: string[];
};

type FrontendUser = {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  roles: string[];
  permissions: string[];
  services: FrontendServiceAccess[];
};

const SERVICE_ROLES: Record<Service, readonly string[]> = {
  main: [
    "super-admin",
    "admin",
    "content-admin",
    "content-manager",
    "content-staff",
    "school-admin",
    "dept-admin",
    "dept-staff",
    "lecturer",
  ],
  research: [
    "super-admin",
    "research-admin",
    "research-manager",
    "research-staff",
    "researcher",
    "innovation-officer",
    "lecturer",
  ],
  library: [
    "super-admin",
    "library-admin",
    "library-manager",
    "library-staff",
  ],
};

function normalizeRole(role: string): string {
  return role.trim().toLowerCase().replace(/_/g, "-");
}

function normalizePermission(permission: string): string {
  return permission.trim().toLowerCase();
}

function mapPermissionToScopes(permission: string): string[] {
  const normalized = normalizePermission(permission);
  const [resource, action = ""] = normalized.split(":");
  const wildcard = `${resource}.*`;

  switch (resource) {
    case "admin":
      return ["*"];
    case "users":
      if (action === "read") return ["users.view"];
      if (action === "write") return ["users.create", "users.edit", "users.invite", "users.suspend"];
      if (action === "delete") return ["users.delete"];
      return [wildcard];
    case "roles":
      if (action === "read") return ["roles.view"];
      if (action === "write") return ["roles.manage"];
      if (action === "delete") return ["roles.delete"];
      return [wildcard];
    case "permissions":
      if (action === "read") return ["permissions.view"];
      if (action === "write") return ["permissions.manage"];
      return [wildcard];
    case "audit":
      if (action === "read") return ["audit.view"];
      return [wildcard];
    case "settings":
      if (action === "read") return ["settings.view"];
      if (action === "write") return ["settings.manage"];
      return [wildcard];
    case "api_keys":
      if (action === "read") return ["api_keys.view"];
      if (action === "write" || action === "delete") return ["api_keys.manage"];
      return [wildcard];
    case "webhooks":
      if (action === "read") return ["webhooks.view"];
      if (action === "write" || action === "delete") return ["webhooks.manage"];
      return [wildcard];
    case "notifications":
      if (action === "read") return ["notifications.view"];
      if (action === "write" || action === "delete") return ["notifications.manage"];
      if (action === "send") return ["notifications.send"];
      return [wildcard];
    case "academic":
      if (action === "read") return ["academic.view", "admissions.view", "persons.view"];
      if (action === "write") {
        return [
          "academic.manage_schools",
          "academic.manage_departments",
          "academic.manage_programmes",
          "academic.manage_staff",
          "academic.manage_calendar",
          "admissions.manage_info",
          "admissions.manage_intakes",
        ];
      }
      if (action === "delete") return ["academic.delete"];
      return [wildcard];
    case "staff":
      if (action === "read") return ["staff.view_assignments"];
      if (action === "write") return ["staff.manage_assignments"];
      if (action === "delete") return ["staff.delete"];
      return [wildcard];
    case "governance":
      if (action === "read") return ["governance.view"];
      if (action === "write") return ["governance.manage"];
      return [wildcard];
    case "media":
      if (action === "upload") return ["media.upload", "media.view"];
      if (action === "manage") return ["media.manage", "media.view"];
      if (action === "delete") return ["media.delete"];
      return [wildcard];
    case "research":
      return [wildcard];
    case "library":
      return [wildcard];
    default:
      return [normalized.replace(":", ".")];
  }
}

function serviceForPermission(permission: string): Service | null {
  const normalized = normalizePermission(permission);
  if (normalized.startsWith("library:")) return "library";
  if (normalized.startsWith("research:")) return "research";
  if (normalized.startsWith("admin:")) return "main";
  return "main";
}

function inferServiceScopes(service: Service, roles: string[], permissions: string[]): string[] {
  const permissionScopes = permissions
    .filter((permission) => {
      const mappedService = serviceForPermission(permission);
      return mappedService === service || permission === "admin:*";
    })
    .flatMap(mapPermissionToScopes);

  if (permissionScopes.includes("*")) {
    return ["*"];
  }

  if (roles.includes("super-admin")) {
    return ["*"];
  }
  if (roles.includes("admin")) {
    return ["*"];
  }
  if (service === "main" && roles.includes("content-admin")) {
    return ["content.*", "media.*", "support.*", "marketing.*"];
  }
  if (service === "main" && roles.includes("content-manager")) {
    return [
      "content.manage_news",
      "content.manage_events",
      "content.manage_blogs",
      "content.manage_announcements",
      "content.view",
      "media.upload",
      "media.view",
    ];
  }
  if (service === "main" && roles.includes("school-admin")) {
    return ["academic.manage_schools", "academic.manage_departments", "academic.manage_staff", "academic.view"];
  }
  if (service === "main" && roles.includes("dept-admin")) {
    return ["academic.manage_departments", "academic.manage_staff", "academic.manage_programmes", "academic.view"];
  }
  if (service === "research" && roles.includes("research-admin")) {
    return ["research.*"];
  }
  if (service === "library" && roles.includes("library-admin")) {
    return ["library.*"];
  }
  return Array.from(new Set(permissionScopes));
}

function deriveServices(roles: string[], permissions: string[]): FrontendServiceAccess[] {
  return (Object.entries(SERVICE_ROLES) as [Service, readonly string[]][])
    .map(([service, serviceRoles]) => {
      const matchedRoles = roles.filter((role) => serviceRoles.includes(role));
      const scopes = inferServiceScopes(service, matchedRoles, permissions);
      if (matchedRoles.length === 0 && scopes.length === 0) {
        return null;
      }
      return {
        service,
        roles: matchedRoles,
        scopes,
      };
    })
    .filter((value): value is FrontendServiceAccess => value !== null);
}

export function unwrapApiData<T>(payload: T | BackendAuthEnvelope<T>): T {
  if (payload && typeof payload === "object" && "data" in (payload as Record<string, unknown>)) {
    return (payload as BackendAuthEnvelope<T>).data as T;
  }
  return payload as T;
}

export function normalizeBackendUser(payload: BackendUser | BackendAuthEnvelope<BackendUser>): FrontendUser {
  const user = unwrapApiData(payload);
  const roles = (user.roles || []).map(normalizeRole);
  const permissions = (user.permissions || []).map(normalizePermission);
  return {
    id: user.id,
    email: user.email,
    name: user.full_name || user.email,
    avatarUrl: user.avatar_url,
    roles,
    permissions,
    services: deriveServices(roles, permissions),
  };
}
