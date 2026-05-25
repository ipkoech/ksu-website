import { getStoredAccessToken, refreshStoredAccessToken } from "./auth-tokens";

export interface ApiConfig {
  baseUrl: string;
  credentials?: RequestCredentials;
  headers?: Record<string, string>;
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
  detail: string;
  code?: string;
  errors?: Record<string, string[]>;
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

export class ApiClient {
  private baseUrl: string;
  private credentials: RequestCredentials;
  private headers: Record<string, string>;
  private refreshPromise: Promise<void> | null = null;

  constructor(config: ApiConfig) {
    this.baseUrl = config.baseUrl;
    this.credentials = config.credentials || "include";
    this.headers = {
      "Content-Type": "application/json",
      ...config.headers,
    };
  }

  async request<T>(
    method: string,
    path: string,
    options: {
      body?: unknown;
      params?: Record<string, string | number | boolean | undefined>;
      headers?: Record<string, string>;
    } = {}
  ): Promise<T> {
    const url = new URL(`${this.baseUrl}${path}`);

    if (options.params) {
      Object.entries(options.params).forEach(([key, value]) => {
        if (value !== undefined) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    const response = await fetch(url.toString(), {
      method,
      credentials: this.credentials,
      headers: {
        ...this.headers,
        ...(getStoredAccessToken() && !options.headers?.Authorization
          ? { Authorization: `Bearer ${getStoredAccessToken()}` }
          : {}),
        ...options.headers,
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
    });

    if (response.status === 401) {
      const refreshed = await this.tryRefresh();
      if (refreshed) {
        return this.request(method, path, options);
      }
      throw new ApiClientError("Session expired", 401);
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new ApiClientError(
        error.detail || "Request failed",
        response.status,
        error.errors
      );
    }

    if (response.status === 204) {
      return undefined as T;
    }

    return response.json();
  }

  private async tryRefresh(): Promise<boolean> {
    if (this.refreshPromise) {
      await this.refreshPromise;
      return true;
    }

    this.refreshPromise = (async () => {
      const refreshed = await refreshStoredAccessToken(this.baseUrl);
      if (!refreshed) {
        throw new Error("Refresh failed");
      }
    })();

    try {
      await this.refreshPromise;
      return true;
    } catch {
      return false;
    } finally {
      this.refreshPromise = null;
    }
  }

  get<T>(path: string, params?: Record<string, string | number | boolean | undefined>) {
    return this.request<T>("GET", path, { params });
  }

  post<T>(path: string, body?: unknown) {
    return this.request<T>("POST", path, { body });
  }

  put<T>(path: string, body?: unknown) {
    return this.request<T>("PUT", path, { body });
  }

  patch<T>(path: string, body?: unknown) {
    return this.request<T>("PATCH", path, { body });
  }

  delete<T>(path: string) {
    return this.request<T>("DELETE", path);
  }
}

export class ApiClientError extends Error {
  constructor(
    message: string,
    public status: number,
    public errors?: Record<string, string[]>
  ) {
    super(message);
    this.name = "ApiClientError";
  }
}

// Service-specific clients
export const mainApi = new ApiClient({
  baseUrl: process.env.NEXT_PUBLIC_MAIN_API_URL || "http://localhost:8000",
});

export const researchApi = new ApiClient({
  baseUrl: process.env.NEXT_PUBLIC_RESEARCH_API_URL || "http://localhost:8001",
});

export const libraryApi = new ApiClient({
  baseUrl: process.env.NEXT_PUBLIC_LIBRARY_API_URL || "http://localhost:8002",
});
