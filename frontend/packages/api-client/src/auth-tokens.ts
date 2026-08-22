import { getMainApiBaseUrl as resolveMainApiBaseUrl } from "./service-urls";

const TOKEN_STORAGE_KEY = "ksu-auth-tokens";

function canUseSessionStorage() {
  return typeof window !== "undefined" && typeof window.sessionStorage !== "undefined";
}

export function getStoredAuthTokens(): Record<string, never> {
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

function getAuthRefreshBaseUrl() {
  return resolveMainApiBaseUrl();
}

export async function refreshStoredAccessToken(baseUrl = getAuthRefreshBaseUrl()) {
  const response = await fetch(`${baseUrl.replace(/\/$/, "")}/api/v1/auth/refresh`, {
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
