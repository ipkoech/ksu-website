import { SERVICE_ROLES } from "./permissions";
import type { AuthResponse, LoginCredentials, Service, User } from "./types";

type BackendAuthEnvelope<T> = {
  status?: string;
  message?: string;
  detail?: string;
  data?: T;
  errors?: Record<string, string[]>;
};

type BackendUser = {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  roles?: string[];
  permissions?: string[];
};

type TokenResponse = {
  access_token: string;
  refresh_token: string;
  token_type?: string;
};

type StoredTokens = {
  accessToken?: string;
  refreshToken?: string;
};

const TOKEN_STORAGE_KEY = "ksu-auth-tokens";
const SYSTEM_RESOURCES = new Set([
  "users",
  "roles",
  "permissions",
  "audit",
  "analytics",
  "settings",
  "api_keys",
  "webhooks",
  "notifications",
  "logs",
  "sessions",
]);
const RESEARCH_RESOURCES = new Set([
  "research",
  "innovation",
  "publications",
  "funding",
  "partnerships",
  "scholarship",
  "scholarship_application",
  "training_program",
  "mentorship",
  "donations",
  "sustainability",
  "community_initiative",
  "research_theme",
  "research_program",
  "external_publications",
]);
const LIBRARY_RESOURCES = new Set(["library"]);

function getMainApiBaseUrl() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const fallback = apiUrl?.replace(/\/api\/v1\/?$/, "");
  return (process.env.NEXT_PUBLIC_MAIN_API_URL || fallback || "http://localhost:8000").replace(/\/$/, "");
}

function canUseSessionStorage() {
  return typeof window !== "undefined" && typeof window.sessionStorage !== "undefined";
}

export function getStoredAuthTokens(): StoredTokens {
  if (!canUseSessionStorage()) return {};
  const raw = window.sessionStorage.getItem(TOKEN_STORAGE_KEY);
  if (!raw) return {};
  try {
    return JSON.parse(raw) as StoredTokens;
  } catch {
    window.sessionStorage.removeItem(TOKEN_STORAGE_KEY);
    return {};
  }
}

export function setStoredAuthTokens(tokens: StoredTokens) {
  if (!canUseSessionStorage()) return;
  window.sessionStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(tokens));
}

export function clearStoredAuthTokens() {
  if (!canUseSessionStorage()) return;
  window.sessionStorage.removeItem(TOKEN_STORAGE_KEY);
}

export function getStoredAccessToken() {
  return getStoredAuthTokens().accessToken;
}

function unwrapApiData<T>(payload: T | BackendAuthEnvelope<T>): T {
  if (payload && typeof payload === "object" && "data" in (payload as Record<string, unknown>)) {
    return (payload as BackendAuthEnvelope<T>).data as T;
  }
  return payload as T;
}

function errorMessage(payload: BackendAuthEnvelope<unknown>, fallback: string) {
  return payload.detail || payload.message || fallback;
}

async function readJson<T>(response: Response): Promise<T> {
  return response.json().catch(() => ({} as T));
}

function normalizeRole(role: string) {
  return role.trim().toLowerCase().replace(/_/g, "-");
}

function normalizePermission(permission: string) {
  return permission.trim().toLowerCase();
}

function splitPermission(permission: string) {
  const normalized = normalizePermission(permission);
  const colonIndex = normalized.indexOf(":");
  const dotIndex = normalized.indexOf(".");
  const separatorIndex =
    colonIndex === -1 ? dotIndex : dotIndex === -1 ? colonIndex : Math.min(colonIndex, dotIndex);

  if (separatorIndex === -1) {
    return { resource: normalized, action: "", separator: ":" as const };
  }

  const separator = normalized[separatorIndex] === ":" ? ":" : ".";
  return {
    resource: normalized.slice(0, separatorIndex),
    action: normalized.slice(separatorIndex + 1),
    separator,
  };
}

function mapPermissionToScopes(permission: string): string[] {
  const normalized = normalizePermission(permission);
  const { resource, action } = splitPermission(normalized);
  const wildcard = `${resource}.*`;
  const dotScope = action ? `${resource}.${action}` : resource;

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
    case "analytics":
      if (action === "read") return ["analytics.view"];
      if (action === "write") return ["analytics.manage", "analytics.view"];
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
    case "admissions":
      if (action === "read") return ["admissions.view", "admissions.view_applications"];
      if (action === "write") return ["admissions.manage_intakes", "admissions.manage_info", "admissions.manage_applications"];
      return [wildcard];
    case "content":
      if (action === "read") return ["content.view", "content.view_drafts"];
      if (action === "write") {
        return [
          "content.manage_pages",
          "content.manage_news",
          "content.manage_events",
          "content.manage_blogs",
          "content.manage_announcements",
          "content.publish",
          "content.view",
        ];
      }
      return [wildcard];
    case "staff":
      if (action === "read") return ["staff.view_assignments"];
      if (action === "write") return ["staff.manage_assignments"];
      if (action === "delete") return ["staff.delete"];
      return [wildcard];
    case "governance":
      if (action === "read") return ["governance.view"];
      if (action === "write") return ["governance.manage", "governance.manage_boards", "organization.manage_divisions"];
      return [wildcard];
    case "organization":
      if (action === "read") return ["governance.view"];
      if (action === "write") return ["organization.manage_divisions"];
      return [wildcard];
    case "persons":
      if (action === "read") return ["persons.view"];
      if (action === "write" || action === "delete") return ["persons.manage", "persons.view"];
      return [wildcard];
    case "media":
      if (action === "upload") return ["media.upload", "media.view"];
      if (action === "manage") return ["media.manage", "media.view"];
      if (action === "delete") return ["media.delete"];
      return [wildcard];
    case "marketing":
      if (action === "read") return ["marketing.view"];
      if (action === "write") return ["marketing.manage_sliders", "marketing.manage_testimonials", "marketing.manage_newsletters"];
      return [wildcard];
    case "research":
      return action ? [dotScope, wildcard] : [wildcard];
    case "library":
      return action ? [dotScope, wildcard] : [wildcard];
    default:
      return [dotScope];
  }
}

function serviceForPermission(permission: string): Service | null {
  const { resource } = splitPermission(permission);
  if (LIBRARY_RESOURCES.has(resource)) return "library";
  if (RESEARCH_RESOURCES.has(resource)) return "research";
  if (SYSTEM_RESOURCES.has(resource)) return "system";
  if (resource === "admin") return null;
  return "main";
}

function inferServiceScopes(service: Service, roles: string[], permissions: string[]) {
  const permissionScopes = permissions
    .filter((permission) => {
      const mappedService = serviceForPermission(permission);
      return mappedService === service || permission === "admin:*";
    })
    .flatMap(mapPermissionToScopes);

  if (permissionScopes.includes("*") || roles.includes("super-admin") || roles.includes("admin")) {
    return ["*"];
  }
  if (service === "system" && roles.includes("system-admin")) {
    return [
      "users.*",
      "roles.*",
      "permissions.*",
      "audit.view",
      "settings.*",
      "api_keys.*",
      "webhooks.*",
      "notifications.*",
      "analytics.view",
    ];
  }
  if (service === "main" && roles.includes("academic-admin")) {
    return ["academic.*", "admissions.*", "staff.view_assignments", "persons.view"];
  }
  if (service === "main" && roles.includes("staff-admin")) {
    return ["staff.*", "persons.*", "governance.*", "organization.*", "academic.view"];
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

function deriveServices(roles: string[], permissions: string[]) {
  return (Object.entries(SERVICE_ROLES) as [Service, readonly string[]][])
    .map(([service, serviceRoles]) => {
      const matchedRoles = roles.filter((role) => serviceRoles.includes(role));
      const scopes = inferServiceScopes(service, matchedRoles, permissions);
      if (matchedRoles.length === 0 && scopes.length === 0) {
        return null;
      }
      return { service, roles: matchedRoles, scopes };
    })
    .filter((value): value is User["services"][number] => value !== null);
}

export function normalizeBackendUser(payload: BackendUser | BackendAuthEnvelope<BackendUser>): User {
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

export async function refreshStoredAuthTokens() {
  const { refreshToken } = getStoredAuthTokens();
  if (!refreshToken) return false;

  const response = await fetch(`${getMainApiBaseUrl()}/api/v1/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });

  if (!response.ok) {
    clearStoredAuthTokens();
    return false;
  }

  const raw = await readJson<BackendAuthEnvelope<TokenResponse> | TokenResponse>(response);
  const data = unwrapApiData(raw);
  setStoredAuthTokens({
    accessToken: data.access_token,
    refreshToken: data.refresh_token || refreshToken,
  });
  return true;
}

export async function fetchCurrentUser(accessToken = getStoredAccessToken()) {
  if (!accessToken) return null;

  const response = await fetch(`${getMainApiBaseUrl()}/api/v1/auth/me?fields=id,email,full_name,avatar_url,roles,permissions`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    return null;
  }

  const raw = await readJson<BackendUser | BackendAuthEnvelope<BackendUser>>(response);
  return normalizeBackendUser(raw);
}

export async function loginWithPassword(credentials: LoginCredentials): Promise<AuthResponse> {
  const response = await fetch(`${getMainApiBaseUrl()}/api/v1/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });

  const raw = await readJson<BackendAuthEnvelope<TokenResponse> | TokenResponse>(response);
  if (!response.ok) {
    throw new Error(errorMessage(raw as BackendAuthEnvelope<unknown>, "Login failed"));
  }

  const tokens = unwrapApiData(raw);
  setStoredAuthTokens({
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token,
  });

  const user = await fetchCurrentUser(tokens.access_token);
  if (!user) {
    clearStoredAuthTokens();
    throw new Error("Authenticated, but failed to load user profile");
  }

  return {
    user,
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token,
  };
}

export async function logoutCurrentSession() {
  const { accessToken } = getStoredAuthTokens();
  clearStoredAuthTokens();

  if (!accessToken) return;
  await fetch(`${getMainApiBaseUrl()}/api/v1/auth/logout`, {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}` },
  }).catch(() => undefined);
}

export async function requestPasswordReset(email: string) {
  const response = await fetch(`${getMainApiBaseUrl()}/api/v1/auth/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });

  const raw = await readJson<BackendAuthEnvelope<unknown>>(response);
  if (!response.ok) {
    throw new Error(errorMessage(raw, "Failed to send reset email"));
  }
}

export async function resetPassword(token: string, newPassword: string) {
  const response = await fetch(`${getMainApiBaseUrl()}/api/v1/auth/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, new_password: newPassword }),
  });

  const raw = await readJson<BackendAuthEnvelope<unknown>>(response);
  if (!response.ok) {
    throw new Error(errorMessage(raw, "Failed to reset password"));
  }
}
