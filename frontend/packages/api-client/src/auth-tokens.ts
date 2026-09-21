import { getMainApiBaseUrl as resolveMainApiBaseUrl } from "./service-urls";
import { ApiClientError } from "./transport";

const TOKEN_STORAGE_KEY = "ksu-auth-tokens";

function canUseSessionStorage() {
  try {
    return (
      typeof window !== "undefined" &&
      typeof window.sessionStorage !== "undefined"
    );
  } catch {
    return false;
  }
}

export function getStoredAuthTokens(): Record<string, never> {
  clearStoredAuthTokens();
  return {};
}

export function setStoredAuthTokens(_tokens: unknown) {
  clearStoredAuthTokens();
}

export function clearStoredAuthTokens() {
  if (!canUseSessionStorage()) return;
  try {
    window.sessionStorage.removeItem(TOKEN_STORAGE_KEY);
  } catch {
    /* Cookie auth does not require Web Storage. */
  }
}

export function getStoredAccessToken() {
  getStoredAuthTokens();
  return undefined;
}

function getAuthRefreshBaseUrl() {
  return resolveMainApiBaseUrl();
}

const pendingRefreshes = new Map<string, Promise<boolean>>();
const refreshControllers = new Set<AbortController>();
let refreshEnabled = true;
let sessionGeneration = 0;

/** Login/logout invalidate old refresh results before changing the cookie session. */
export function setSessionRefreshEnabled(enabled: boolean) {
  if (typeof window === "undefined") return;
  sessionGeneration++;
  refreshEnabled = enabled;
  for (const controller of refreshControllers) controller.abort();
  refreshControllers.clear();
  pendingRefreshes.clear();
}

export function refreshStoredAccessToken(
  baseUrl = getAuthRefreshBaseUrl(),
): Promise<boolean> {
  if (typeof window === "undefined" || !refreshEnabled)
    return Promise.resolve(false);
  const key = baseUrl.replace(/\/$/, "");
  const pending = pendingRefreshes.get(key);
  if (pending) return pending;
  const refresh = performRefresh(key, sessionGeneration).finally(() => {
    if (pendingRefreshes.get(key) === refresh) pendingRefreshes.delete(key);
  });
  pendingRefreshes.set(key, refresh);
  return refresh;
}

async function performRefresh(
  baseUrl: string,
  generation: number,
): Promise<boolean> {
  const controller = new AbortController();
  refreshControllers.add(controller);
  const timeout = globalThis.setTimeout(() => controller.abort(), 15000);
  try {
    const response = await fetch(`${baseUrl}/api/v1/auth/refresh`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token_transport: "cookie" }),
      signal: controller.signal,
      cache: "no-store",
    });
    await response.body?.cancel();
    if (generation !== sessionGeneration) return false;
    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        clearStoredAuthTokens();
        window.dispatchEvent(new CustomEvent("ksu:session-expired"));
        return false;
      }
      throw new ApiClientError(
        "Unable to refresh the session",
        response.status,
        undefined,
        "REFRESH_FAILED",
      );
    }
    return true;
  } catch (error) {
    if (generation !== sessionGeneration) return false;
    if (error instanceof ApiClientError) throw error;
    throw new ApiClientError(
      controller.signal.aborted
        ? "Session refresh timed out"
        : "Unable to reach the server",
      0,
      undefined,
      controller.signal.aborted ? "TIMEOUT" : "NETWORK_ERROR",
    );
  } finally {
    globalThis.clearTimeout(timeout);
    refreshControllers.delete(controller);
  }
}
