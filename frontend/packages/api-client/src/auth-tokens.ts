type StoredTokens = {
  accessToken?: string;
  refreshToken?: string;
};

type TokenEnvelope = {
  data?: {
    access_token?: string;
    refresh_token?: string;
  };
  access_token?: string;
  refresh_token?: string;
};

const TOKEN_STORAGE_KEY = "ksu-auth-tokens";

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

export function getMainApiBaseUrl() {
  return (process.env.NEXT_PUBLIC_MAIN_API_URL || "http://localhost:8000").replace(/\/$/, "");
}

export async function refreshStoredAccessToken(baseUrl = getMainApiBaseUrl()) {
  const { refreshToken } = getStoredAuthTokens();
  if (!refreshToken) return false;

  const response = await fetch(`${baseUrl.replace(/\/$/, "")}/api/v1/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });

  if (!response.ok) {
    clearStoredAuthTokens();
    return false;
  }

  const raw = (await response.json().catch(() => ({}))) as TokenEnvelope;
  const data = raw.data ?? raw;
  if (!data.access_token) {
    clearStoredAuthTokens();
    return false;
  }

  setStoredAuthTokens({
    accessToken: data.access_token,
    refreshToken: data.refresh_token || refreshToken,
  });
  return true;
}
