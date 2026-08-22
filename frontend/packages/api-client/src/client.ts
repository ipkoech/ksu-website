import { refreshStoredAccessToken } from "./auth-tokens";
import {
  getLibraryApiBaseUrl,
  getMainApiBaseUrl,
  getResearchApiBaseUrl,
} from "./service-urls";

export interface ApiConfig {
  baseUrl: string;
  credentials?: RequestCredentials;
  headers?: Record<string, string>;
  timeoutMs?: number;
}

export interface ApiResponse<T> {
  data: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

export interface ApiError {
  detail?: string | ValidationIssue[] | Record<string, unknown>;
  message?: string;
  code?: string;
  error?: {
    detail?: string;
    message?: string;
  };
  errors?: Record<string, string[] | string>;
}

interface ValidationIssue {
  loc?: Array<string | number>;
  msg?: string;
  message?: string;
  type?: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: "asc" | "desc";
  [key: string]: string | number | boolean | undefined;
}

export interface FieldSelectionParams {
  fields?: string;
  include?: string;
  [key: string]: string | number | boolean | undefined;
}

export type QueryParams = PaginationParams & FieldSelectionParams;

export interface FetchCacheOptions {
  cache?: RequestCache;
  next?: { revalidate?: number | false; tags?: string[] };
}

const DEFAULT_PUBLIC_REVALIDATE_SECONDS = 300;

function resolvePublicRevalidateSeconds() {
  const configured = Number(process.env.NEXT_PUBLIC_API_CACHE_SECONDS);
  return Number.isFinite(configured) && configured >= 0
    ? configured
    : DEFAULT_PUBLIC_REVALIDATE_SECONDS;
}

export class ApiClient {
  private baseUrl: string;
  private credentials: RequestCredentials;
  private headers: Record<string, string>;
  private timeoutMs: number;
  private refreshPromise: Promise<void> | null = null;
  private refreshFailed = false;

  constructor(config: ApiConfig) {
    this.baseUrl = config.baseUrl;
    this.credentials = config.credentials || "include";
    this.headers = {
      "Content-Type": "application/json",
      ...config.headers,
    };
    this.timeoutMs = config.timeoutMs ?? resolveApiTimeoutMs();
  }

  async request<T>(
    method: string,
    path: string,
    options: {
      body?: unknown;
      params?: Record<string, string | number | boolean | undefined>;
      headers?: Record<string, string>;
    } & FetchCacheOptions = {}
  ): Promise<T> {
    const url = new URL(`${this.baseUrl}${path}`);

    if (options.params) {
      Object.entries(options.params).forEach(([key, value]) => {
        if (value !== undefined) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    const controller = new AbortController();
    const timeout = globalThis.setTimeout(
      () => controller.abort(),
      this.timeoutMs
    );
    let response: Response;

    const headers: Record<string, string> = {
      ...this.headers,
      ...options.headers,
    };

    // Server-side anonymous GETs opt into Next's data cache so public pages
    // don't refetch on every request. Authenticated or cookie-bearing
    // requests, and any request with explicit cache/next options, are left
    // alone. The `next` property is ignored outside the Next.js runtime.
    const isAnonymous = !headers.Authorization && !headers.Cookie && !headers.cookie;
    const cacheOptions: FetchCacheOptions =
      options.cache !== undefined || options.next !== undefined
        ? { cache: options.cache, next: options.next }
        : method === "GET" && typeof window === "undefined" && isAnonymous
          ? { next: { revalidate: resolvePublicRevalidateSeconds() } }
          : {};

    try {
      response = await fetch(url.toString(), {
        method,
        credentials: this.credentials,
        headers,
        body: options.body ? JSON.stringify(options.body) : undefined,
        signal: controller.signal,
        ...cacheOptions,
      });
    } finally {
      globalThis.clearTimeout(timeout);
    }

    if (response.status === 401) {
      if (!this.refreshFailed) {
        const refreshed = await this.tryRefresh();
        if (refreshed) {
          return this.request(method, path, options);
        }
      }
      throw new ApiClientError("Session expired", 401);
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      const normalized = normalizeApiError(error);
      throw new ApiClientError(
        normalized.message,
        response.status,
        normalized.errors,
        normalized.code
      );
    }

    if (response.status === 204) {
      return undefined as T;
    }

    return response.json();
  }

  private async tryRefresh(): Promise<boolean> {
    if (this.refreshFailed) {
      return false;
    }
    if (this.refreshPromise) {
      await this.refreshPromise;
      return !this.refreshFailed;
    }

    this.refreshPromise = (async () => {
      const refreshed = await refreshStoredAccessToken();
      if (!refreshed) {
        throw new Error("Refresh failed");
      }
    })();

    try {
      await this.refreshPromise;
      return true;
    } catch {
      this.refreshFailed = true;
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("ksu:session-expired"));
      }
      return false;
    } finally {
      this.refreshPromise = null;
    }
  }

  get<T>(
    path: string,
    params?: Record<string, string | number | boolean | undefined>,
    cacheOptions?: FetchCacheOptions
  ) {
    return this.request<T>("GET", path, { params, ...cacheOptions });
  }

  post<T>(path: string, body?: unknown) {
    return this.request<T>("POST", path, { body });
  }

  put<T>(path: string, body?: unknown) {
    return this.request<T>("PUT", path, { body });
  }

  patch<T>(path: string, body?: unknown, params?: Record<string, string | number | boolean | undefined>) {
    return this.request<T>("PATCH", path, { body, params });
  }

  delete<T>(path: string) {
    return this.request<T>("DELETE", path);
  }
}

export class ApiClientError extends Error {
  constructor(
    message: string,
    public status: number,
    public errors?: Record<string, string[]>,
    public code?: string
  ) {
    super(message);
    this.name = "ApiClientError";
  }
}

function normalizeApiError(error: ApiError): {
  message: string;
  errors?: Record<string, string[]>;
  code?: string;
} {
  const errors = normalizeErrorMap(error.errors) ?? validationIssuesToErrors(error.detail);
  const validationMessage = validationIssuesToMessage(error.detail);
  const message =
    stringValue(error.detail) ||
    stringValue(error.message) ||
    stringValue(error.error?.detail) ||
    stringValue(error.error?.message) ||
    validationMessage ||
    "Request failed";

  return {
    message,
    errors,
    code: error.code,
  };
}

function normalizeErrorMap(
  errors?: Record<string, string[] | string>
): Record<string, string[]> | undefined {
  if (!errors) return undefined;

  return Object.fromEntries(
    Object.entries(errors).map(([key, value]) => [
      key,
      Array.isArray(value) ? value.map(String) : [String(value)],
    ])
  );
}

function validationIssuesToErrors(
  detail?: ApiError["detail"]
): Record<string, string[]> | undefined {
  if (!Array.isArray(detail)) return undefined;

  return detail.reduce<Record<string, string[]>>((acc, issue) => {
    const key = issue.loc?.length ? issue.loc.map(String).join(".") : "detail";
    const message = issue.msg || issue.message || issue.type || "Invalid value";
    acc[key] = [...(acc[key] ?? []), message];
    return acc;
  }, {});
}

function validationIssuesToMessage(detail?: ApiError["detail"]) {
  if (!Array.isArray(detail) || detail.length === 0) return undefined;
  const first = detail[0];
  const field = first.loc?.length ? first.loc.map(String).join(".") : "request";
  const message = first.msg || first.message || first.type || "Invalid value";
  return `Validation failed: ${field} ${message}`;
}

function stringValue(value: unknown) {
  return typeof value === "string" && value.trim() ? value : undefined;
}

function resolveApiTimeoutMs() {
  const configured = Number(process.env.NEXT_PUBLIC_API_TIMEOUT_MS);
  return Number.isFinite(configured) && configured > 0 ? configured : 15000;
}

// Service-specific clients
export const mainApi = new ApiClient({
  baseUrl: getMainApiBaseUrl(),
});

export const researchApi = new ApiClient({
  baseUrl: getResearchApiBaseUrl(),
});

export const libraryApi = new ApiClient({
  baseUrl: getLibraryApiBaseUrl(),
});
