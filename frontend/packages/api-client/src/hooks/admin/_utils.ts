import { mainApi } from "../../client";

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

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
    signal?: AbortSignal;
  },
): Promise<T> {
  return mainApi.request<T>(
    method,
    withQuery(toBackendPath(path), options?.params),
    {
      body: options?.body,
      signal: options?.signal,
      auth: "session",
    },
  );
}

export const unwrapAdminData = <T>(payload: T | { data?: T }) =>
  payload &&
  typeof payload === "object" &&
  "data" in (payload as Record<string, unknown>)
    ? ((payload as { data?: T }).data as T)
    : (payload as T);
