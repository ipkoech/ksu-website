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
  service_memberships?: string[];
  must_change_password?: boolean;
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
const HERI_RESOURCES = new Set(["heri"]);
const LIBRARY_RESOURCES = new Set(["library"]);

function getMainApiBaseUrl() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const fallback = apiUrl?.replace(/\/api\/v1\/?$/, "");
  const serverUrl = typeof window === "undefined" ? process.env.KSU_MAIN_API_URL : undefined;
  return (serverUrl || process.env.NEXT_PUBLIC_MAIN_API_URL || fallback || "http://localhost:8000").replace(/\/$/, "");
}

function canUseSessionStorage() {
  return typeof window !== "undefined" && typeof window.sessionStorage !== "undefined";
}

export function getStoredAuthTokens(): Record<string, never> {
  // Remove credentials persisted by older frontend releases. Browser auth is
  // now carried exclusively by HttpOnly cookies.
  if (canUseSessionStorage()) window.sessionStorage.removeItem(TOKEN_STORAGE_KEY);
  return {};
}

export function setStoredAuthTokens(_tokens: unknown) {
  clearStoredAuthTokens();
}

export function clearStoredAuthTokens() {
  if (!canUseSessionStorage()) return;
  window.sessionStorage.removeItem(TOKEN_STORAGE_KEY);
}

export function getStoredAccessToken() {
  getStoredAuthTokens();
  return undefined;
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
  const dotScope = action ? `${resource}.${action}` : resource;

  switch (resource) {
    case "admin":
      return [dotScope];
    case "users":
      if (action === "read") return ["users.view"];
      if (action === "write") return ["users.create", "users.edit", "users.invite", "users.suspend"];
      if (action === "delete") return ["users.delete"];
      return [dotScope];
    case "roles":
      if (action === "read") return ["roles.view"];
      if (action === "write") return ["roles.manage"];
      if (action === "delete") return ["roles.delete"];
      return [dotScope];
    case "permissions":
      if (action === "read") return ["permissions.view"];
      if (action === "write") return ["permissions.manage"];
      return [dotScope];
    case "audit":
      if (action === "read") return ["audit.view"];
      return [dotScope];
    case "analytics":
      if (action === "read") return ["analytics.view"];
      if (action === "write") return ["analytics.manage", "analytics.view"];
      return [dotScope];
    case "settings":
      if (action === "read") return ["settings.view"];
      if (action === "write") return ["settings.manage"];
      return [dotScope];
    case "api_keys":
      if (action === "read") return ["api_keys.view"];
      if (action === "write" || action === "delete") return ["api_keys.manage"];
      return [dotScope];
    case "webhooks":
      if (action === "read") return ["webhooks.view"];
      if (action === "write" || action === "delete") return ["webhooks.manage"];
      return [dotScope];
    case "notifications":
      if (action === "read") return ["notifications.view"];
      if (action === "write" || action === "delete") return ["notifications.manage"];
      if (action === "send") return ["notifications.send"];
      return [dotScope];
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
      return [dotScope];
    case "admissions":
      if (action === "read") return ["admissions.view", "admissions.view_applications"];
      if (action === "write") return ["admissions.manage_intakes", "admissions.manage_info", "admissions.manage_applications"];
      return [dotScope];
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
      return [dotScope];
    case "staff":
      if (action === "read") return ["staff.view_assignments"];
      if (action === "write") return ["staff.manage_assignments"];
      if (action === "delete") return ["staff.delete"];
      return [dotScope];
    case "administration":
      if (action === "view" || action === "read") return ["administration.view"];
      if (action === "write" || action === "manage") {
        return [
          "administration.manage_units",
          "administration.manage_content",
          "administration.manage_staff",
          "administration.manage_services",
          "administration.view",
        ];
      }
      return [dotScope];
    case "office":
      if (action === "view" || action === "read") return ["office.view"];
      if (action === "write" || action === "manage") {
        return ["office.manage_content", "office.manage_staff", "office.manage_services", "office.view"];
      }
      return [dotScope];
    case "governance":
      if (action === "read") return ["governance.view"];
      if (action === "write") return ["governance.manage", "governance.manage_boards", "organization.manage_divisions"];
      return [dotScope];
    case "organization":
      if (action === "read") return ["governance.view"];
      if (action === "write") return ["organization.manage_divisions"];
      return [dotScope];
    case "persons":
      if (action === "read") return ["persons.view"];
      if (action === "write" || action === "delete") return ["persons.manage", "persons.view"];
      return [dotScope];
    case "media":
      if (action === "upload") return ["media.upload", "media.view"];
      if (action === "manage") return ["media.manage", "media.view"];
      if (action === "delete") return ["media.delete"];
      return [dotScope];
    case "marketing":
      if (action === "read") return ["marketing.view"];
      if (action === "write") return ["marketing.manage_sliders", "marketing.manage_testimonials", "marketing.manage_newsletters"];
      return [dotScope];
    case "research":
      return [dotScope];
    case "library":
      return [dotScope];
    default:
      return [dotScope];
  }
}

function serviceForPermission(permission: string): Service | null {
  const { resource } = splitPermission(permission);
  if (HERI_RESOURCES.has(resource)) return "heri";
  if (LIBRARY_RESOURCES.has(resource)) return "library";
  if (RESEARCH_RESOURCES.has(resource)) return "research";
  if (SYSTEM_RESOURCES.has(resource)) return "system";
  if (resource === "admin") return null;
  return "main";
}

function inferServiceScopes(service: Service, permissions: string[]) {
  const permissionScopes = permissions
    .filter((permission) => {
      const mappedService = serviceForPermission(permission);
      return mappedService === service;
    })
    .flatMap(mapPermissionToScopes);

  return Array.from(new Set(permissionScopes));
}

function deriveServices(roles: string[], permissions: string[], memberships: Service[]) {
  return (Object.entries(SERVICE_ROLES) as [Service, readonly string[]][])
    .map(([service, serviceRoles]) => {
      const matchedRoles = roles.filter((role) => serviceRoles.includes(role));
      const scopes = inferServiceScopes(service, permissions);
      if (!memberships.includes(service) && matchedRoles.length === 0 && scopes.length === 0) {
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
  const serviceMemberships = (user.service_memberships || []).filter(
    (service): service is Service => ["main", "research", "library", "heri", "system"].includes(service),
  );

  return {
    id: user.id,
    email: user.email,
    name: user.full_name || user.email,
    avatarUrl: user.avatar_url,
    roles,
    permissions,
    services: deriveServices(roles, permissions, serviceMemberships),
    serviceMemberships,
    mustChangePassword: Boolean(user.must_change_password),
  };
}

export async function refreshStoredAuthTokens() {
  const response = await fetch(`${getMainApiBaseUrl()}/api/v1/auth/refresh`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token_transport: "cookie" }),
  });

  if (!response.ok) {
    clearStoredAuthTokens();
    return false;
  }

  return true;
}

export async function fetchCurrentUser() {
  clearStoredAuthTokens();
  const response = await fetch(`${getMainApiBaseUrl()}/api/v1/auth/me?fields=id,email,full_name,avatar_url,roles,permissions`, {
    credentials: "include",
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
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });

  const raw = await readJson<BackendAuthEnvelope<{ authenticated: boolean }> | { authenticated: boolean }>(response);
  if (!response.ok) {
    throw new Error(errorMessage(raw as BackendAuthEnvelope<unknown>, "Login failed"));
  }

  unwrapApiData(raw);
  clearStoredAuthTokens();
  const user = await fetchCurrentUser();
  if (!user) {
    clearStoredAuthTokens();
    throw new Error("Authenticated, but failed to load user profile");
  }

  return {
    user,
  };
}

export async function logoutCurrentSession() {
  clearStoredAuthTokens();
  await fetch(`${getMainApiBaseUrl()}/api/v1/auth/logout`, {
    method: "POST",
    credentials: "include",
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

export async function changePassword(currentPassword: string, newPassword: string) {
  const response = await fetch(`${getMainApiBaseUrl()}/api/v1/auth/change-password`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ old_password: currentPassword, new_password: newPassword }),
  });

  const raw = await readJson<BackendAuthEnvelope<unknown>>(response);
  if (!response.ok) {
    throw new Error(errorMessage(raw, "Failed to change password"));
  }
}
