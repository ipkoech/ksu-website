import { ApiClientError } from "../../client";

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

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
  const response = await fetch(withQuery(path, options?.params), {
    method,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: options?.body ? JSON.stringify(options.body) : undefined,
  });

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
