import { ApiClientError } from "../../client";
import { getStoredAccessToken, refreshStoredAccessToken } from "../../auth-tokens";
import { getMainApiBaseUrl } from "../../service-urls";

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

const MAIN_API_BASE_URL = getMainApiBaseUrl();

function toBackendPath(path: string) {
  if (path.startsWith("/api/admin")) {
    return `/api/v1/admin${path.slice("/api/admin".length)}`;
  }
  return path;
}

function withQuery(path: string, params?: Record<string, unknown>) {
  if (!params) return path;
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.set(key, String(value));
    }
  });
  const query = searchParams.toString();
  return query ? `${path}?${query}` : path;
}

export async function adminRequest<T>(
  method: HttpMethod,
  path: string,
  options?: {
    params?: Record<string, unknown>;
    body?: unknown;
  }
): Promise<T> {
  const request = () =>
    fetch(`${MAIN_API_BASE_URL}${withQuery(toBackendPath(path), options?.params)}`, {
      method,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(getStoredAccessToken() ? { Authorization: `Bearer ${getStoredAccessToken()}` } : {}),
      },
      body: options?.body ? JSON.stringify(options.body) : undefined,
    });

  let response = await request();

  if (response.status === 401 && (await refreshStoredAccessToken(MAIN_API_BASE_URL))) {
    response = await request();
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Request failed" }));
    throw new ApiClientError(error.detail || error.message || "Request failed", response.status, error.errors);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

export const unwrapAdminData = <T>(payload: T | { data?: T }) =>
  payload && typeof payload === "object" && "data" in (payload as Record<string, unknown>)
    ? ((payload as { data?: T }).data as T)
    : (payload as T);
