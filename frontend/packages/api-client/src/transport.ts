import { PUBLIC_CONTENT_CACHE_TAG } from "./revalidation";

export interface ApiConfig {
  baseUrl: string;
  credentials?: RequestCredentials;
  headers?: Record<string, string>;
  timeoutMs?: number;
  /** Server transports never attempt cookie refresh. */
  runtime?: "server" | "browser";
  refreshSession?: () => Promise<boolean>;
  /** Additional attempts for GET/HEAD only; capped at two. */
  maxGetRetries?: number;
  /** Optional server scheduling; the request deadline includes queue time. */
  acquireRequest?: (signal: AbortSignal) => Promise<() => void>;
  /** Preserve framework control flow before retrying or normalizing errors. */
  rethrowError?: (error: unknown) => void;
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
  /** Explicit command keys and other request-scoped headers. */
  headers?: Record<string, string>;
  cache?: RequestCache;
  next?: { revalidate?: number | false; tags?: string[] };
  signal?: AbortSignal;
  /** Public requests must not initiate a session refresh. */
  auth?: "none" | "session";
  timeoutMs?: number;
}

const DEFAULT_PUBLIC_REVALIDATE_SECONDS = 300;

function newCommandKey(): string {
  const cryptoApi = globalThis.crypto;
  try {
    if (cryptoApi?.randomUUID) return cryptoApi.randomUUID();
  } catch {
    // Some test/runtime crypto shims expose randomUUID without a compatible
    // receiver; the fallback still produces a valid command key.
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}-${Math.random()
    .toString(36)
    .slice(2)}`;
}

function resolvePublicRevalidateSeconds() {
  const configured = Number(process.env.NEXT_PUBLIC_API_CACHE_SECONDS);
  return Number.isFinite(configured) && configured >= 0
    ? configured
    : DEFAULT_PUBLIC_REVALIDATE_SECONDS;
}

function withPublicCacheTag(
  next: FetchCacheOptions["next"] | undefined,
): FetchCacheOptions["next"] {
  const tags = new Set([PUBLIC_CONTENT_CACHE_TAG, ...(next?.tags ?? [])]);
  return { ...next, tags: [...tags] };
}

export class ApiTransport {
  private baseUrl: string;
  private credentials: RequestCredentials;
  private headers: Record<string, string>;
  private timeoutMs: number;
  private runtime: "server" | "browser";
  private refreshSession?: () => Promise<boolean>;
  private maxGetRetries: number;
  private acquireRequest?: ApiConfig["acquireRequest"];
  private rethrowError?: ApiConfig["rethrowError"];

  constructor(config: ApiConfig) {
    this.baseUrl = config.baseUrl;
    this.credentials = config.credentials || "include";
    this.headers = {
      "Content-Type": "application/json",
      ...config.headers,
    };
    this.timeoutMs =
      config.timeoutMs &&
      Number.isFinite(config.timeoutMs) &&
      config.timeoutMs > 0
        ? config.timeoutMs
        : resolveApiTimeoutMs();
    this.runtime = config.runtime ?? "server";
    this.refreshSession = config.refreshSession;
    this.acquireRequest = config.acquireRequest;
    this.rethrowError = config.rethrowError;
    this.maxGetRetries = Number.isFinite(config.maxGetRetries)
      ? Math.max(0, Math.min(2, Math.floor(config.maxGetRetries!)))
      : 1;
  }

  async request<T>(
    method: string,
    path: string,
    options: {
      body?: unknown;
      params?: Record<string, string | number | boolean | undefined>;
      headers?: Record<string, string>;
      /** Consume downloads/streams inside the same deadline and error boundary. */
      consume?: (response: Response) => Promise<T>;
    } & FetchCacheOptions = {},
  ): Promise<T> {
    method = method.toUpperCase();
    const url = new URL(`${this.baseUrl}${path}`);

    if (options.params) {
      Object.entries(options.params).forEach(([key, value]) => {
        if (value !== undefined) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    const headers = new Headers(this.headers);
    new Headers(options.headers).forEach((value, key) =>
      headers.set(key, value),
    );
    // Main's replayable mutation boundary requires a command key. Preserve
    // caller-supplied keys (forms use a stable key across uncertain retries)
    // and fill one in for ordinary API-client mutations.
    if (
      ["POST", "PUT", "PATCH", "DELETE"].includes(method) &&
      !headers.has("Idempotency-Key")
    ) {
      headers.set("Idempotency-Key", newCommandKey());
    }
    const multipart =
      typeof FormData !== "undefined" && options.body instanceof FormData;
    const rawBody = isRawRequestBody(options.body) ? options.body : undefined;
    if (multipart) headers.delete("Content-Type");
    const isPrivate =
      headers.has("authorization") ||
      headers.has("cookie") ||
      options.auth === "session" ||
      (this.runtime === "browser" && this.credentials !== "omit");
    const isPublicServerGet =
      this.runtime === "server" &&
      method === "GET" &&
      !isPrivate &&
      options.cache !== "no-store";
    const publicNext = isPublicServerGet
      ? withPublicCacheTag(
          options.next ??
            (options.cache === undefined
              ? { revalidate: resolvePublicRevalidateSeconds() }
              : undefined),
        )
      : options.next;
    const cacheOptions: FetchCacheOptions =
      isPrivate || method !== "GET" || options.cache === "no-store"
        ? { cache: "no-store" }
        : options.cache !== undefined || publicNext !== undefined
          ? { cache: options.cache, next: publicNext }
          : this.runtime === "server"
            ? {
                next: withPublicCacheTag({
                  revalidate: resolvePublicRevalidateSeconds(),
                }),
              }
            : { cache: "no-store" };
    const controller = new AbortController();
    let timedOut = false;
    const timeout = globalThis.setTimeout(
      () => {
        timedOut = true;
        controller.abort();
      },
      options.timeoutMs &&
        Number.isFinite(options.timeoutMs) &&
        options.timeoutMs > 0
        ? options.timeoutMs
        : this.timeoutMs,
    );
    const abort = () => controller.abort();
    options.signal?.addEventListener("abort", abort, { once: true });
    if (options.signal?.aborted) abort();
    let releaseRequest: (() => void) | undefined;
    try {
      if (this.runtime === "server" && this.acquireRequest)
        releaseRequest = await this.acquireRequest(controller.signal);
      let refreshed = false;
      let retries = 0;
      const canRetry = () =>
        (method === "GET" || method === "HEAD") && retries < this.maxGetRetries;
      for (;;) {
        controller.signal.throwIfAborted();
        let response: Response;
        try {
          response = await fetch(url.toString(), {
            method,
            credentials: this.credentials,
            headers,
            body: multipart
              ? (options.body as FormData)
              : rawBody !== undefined
                ? rawBody
              : options.body !== undefined
                ? JSON.stringify(options.body)
                : undefined,
            signal: controller.signal,
            ...cacheOptions,
          });
        } catch (error) {
          this.rethrowError?.(error);
          if (controller.signal.aborted || !canRetry()) throw error;
          await retryDelay(100 * ++retries, controller.signal);
          continue;
        }
        if ([408, 429, 502, 503, 504].includes(response.status) && canRetry()) {
          const retryAfter = response.headers.get("retry-after");
          const seconds = retryAfter === null ? NaN : Number(retryAfter);
          const wait = Number.isFinite(seconds)
            ? seconds * 1000
            : retryAfter
              ? Date.parse(retryAfter) - Date.now()
              : 100;
          // Do not retry earlier than a long server-requested cooldown.
          if (!Number.isFinite(wait) || wait <= 2000) {
            retries++;
            await response.body?.cancel();
            await retryDelay(
              Math.max(0, Number.isFinite(wait) ? wait : 100),
              controller.signal,
            );
            continue;
          }
        }
        if (
          response.status === 401 &&
          !refreshed &&
          this.runtime === "browser" &&
          this.credentials !== "omit" &&
          options.auth !== "none" &&
          !/\/auth\/(?:login|refresh|logout)(?:\/|$)/.test(url.pathname)
        ) {
          refreshed = true;
          await response.body?.cancel();
          const success = await waitForSession(
            this.refreshSession ?? (() => Promise.resolve(false)),
            controller.signal,
          );
          if (success && (method === "GET" || method === "HEAD")) continue;
          if (success)
            throw new ApiClientError(
              "Session refreshed. Please submit again.",
              401,
              undefined,
              "AUTH_RETRY_REQUIRED",
            );
          throw new ApiClientError("Session expired", 401);
        }
        if (response.ok && (response.status === 204 || method === "HEAD"))
          return undefined as T;
        if (response.ok && options.consume)
          return await options.consume(response);
        const raw = await response.text();
        let payload: unknown;
        try {
          payload = JSON.parse(raw);
        } catch {
          if (response.ok)
            throw new ApiClientError(
              "Invalid response from server",
              response.status,
              undefined,
              "INVALID_RESPONSE",
            );
        }
        if (!response.ok) {
          const normalized = normalizeApiError(payload);
          throw new ApiClientError(
            normalized.message,
            response.status,
            normalized.errors,
            normalized.code,
          );
        }
        return payload as T;
      }
    } catch (error) {
      this.rethrowError?.(error);
      if (controller.signal.aborted)
        throw new ApiClientError(
          timedOut ? "Request timed out" : "Request cancelled",
          0,
          undefined,
          timedOut ? "TIMEOUT" : "CANCELLED",
        );
      if (error instanceof ApiClientError) throw error;
      throw new ApiClientError(
        "Unable to reach the server",
        0,
        undefined,
        "NETWORK_ERROR",
      );
    } finally {
      releaseRequest?.();
      globalThis.clearTimeout(timeout);
      options.signal?.removeEventListener("abort", abort);
    }
  }

  get<T>(
    path: string,
    params?: Record<string, string | number | boolean | undefined>,
    cacheOptions?: FetchCacheOptions,
  ) {
    return this.request<T>("GET", path, { params, ...cacheOptions });
  }

  post<T>(path: string, body?: unknown, options?: FetchCacheOptions) {
    return this.request<T>("POST", path, { body, ...options });
  }

  put<T>(path: string, body?: unknown, options?: FetchCacheOptions) {
    return this.request<T>("PUT", path, { body, ...options });
  }

  patch<T>(
    path: string,
    body?: unknown,
    params?: Record<string, string | number | boolean | undefined>,
    options?: FetchCacheOptions,
  ) {
    return this.request<T>("PATCH", path, { body, params, ...options });
  }

  delete<T>(path: string, options?: FetchCacheOptions) {
    return this.request<T>("DELETE", path, options);
  }

  download(
    path: string,
    params?: QueryParams,
    options?: FetchCacheOptions,
  ): Promise<Blob> {
    return this.request("GET", path, {
      params,
      ...options,
      consume: (response) => response.blob(),
    });
  }
}

export class ApiClientError extends Error {
  constructor(
    message: string,
    public status: number,
    public errors?: Record<string, string[]>,
    public code?: string,
  ) {
    super(message);
    this.name = "ApiClientError";
  }
}

/** A caller can stop waiting without cancelling refresh for other requests. */
function waitForSession(
  refresh: () => Promise<boolean>,
  signal: AbortSignal,
): Promise<boolean> {
  return new Promise((resolve, reject) => {
    const abort = () => {
      cleanup();
      reject(signal.reason);
    };
    const cleanup = () => signal.removeEventListener("abort", abort);
    signal.addEventListener("abort", abort, { once: true });
    if (signal.aborted) {
      abort();
      return;
    }
    Promise.resolve()
      .then(refresh)
      .then(
        (value) => {
          cleanup();
          resolve(value);
        },
        (error) => {
          cleanup();
          reject(error);
        },
      );
  });
}

function retryDelay(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    const cleanup = () => signal.removeEventListener("abort", abort);
    const timer = globalThis.setTimeout(() => {
      cleanup();
      resolve();
    }, ms);
    const abort = () => {
      globalThis.clearTimeout(timer);
      cleanup();
      reject(signal.reason);
    };
    signal.addEventListener("abort", abort, { once: true });
    if (signal.aborted) abort();
  });
}

function normalizeApiError(payload: unknown): {
  message: string;
  errors?: Record<string, string[]>;
  code?: string;
} {
  const error: ApiError =
    payload && typeof payload === "object" ? (payload as ApiError) : {};
  const errors =
    normalizeErrorMap(error.errors) ?? validationIssuesToErrors(error.detail);
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
    code: stringValue(error.code),
  };
}

function normalizeErrorMap(
  errors?: Record<string, string[] | string>,
): Record<string, string[]> | undefined {
  if (!errors || typeof errors !== "object" || Array.isArray(errors))
    return undefined;

  return Object.fromEntries(
    Object.entries(errors).map(([key, value]) => [
      key,
      Array.isArray(value) ? value.map(String) : [String(value)],
    ]),
  );
}

function validationIssuesToErrors(
  detail?: ApiError["detail"],
): Record<string, string[]> | undefined {
  if (!Array.isArray(detail)) return undefined;

  return detail.reduce<Record<string, string[]>>((acc, issue) => {
    if (!issue || typeof issue !== "object") return acc;
    const key =
      Array.isArray(issue.loc) && issue.loc.length
        ? issue.loc.map(String).join(".")
        : "detail";
    const message =
      stringValue(issue.msg) ||
      stringValue(issue.message) ||
      stringValue(issue.type) ||
      "Invalid value";
    acc[key] = [...(acc[key] ?? []), message];
    return acc;
  }, {});
}

function validationIssuesToMessage(detail?: ApiError["detail"]) {
  if (!Array.isArray(detail) || detail.length === 0) return undefined;
  const first = detail[0];
  if (!first || typeof first !== "object") return undefined;
  const field =
    Array.isArray(first.loc) && first.loc.length
      ? first.loc.map(String).join(".")
      : "request";
  const message =
    stringValue(first.msg) ||
    stringValue(first.message) ||
    stringValue(first.type) ||
    "Invalid value";
  return `Validation failed: ${field} ${message}`;
}

function stringValue(value: unknown) {
  return typeof value === "string" && value.trim() ? value : undefined;
}

function isRawRequestBody(value: unknown): value is BodyInit {
  if (typeof Blob !== "undefined" && value instanceof Blob) return true;
  if (
    typeof ArrayBuffer !== "undefined" &&
    (value instanceof ArrayBuffer || ArrayBuffer.isView(value))
  )
    return true;
  if (
    typeof URLSearchParams !== "undefined" &&
    value instanceof URLSearchParams
  )
    return true;
  if (
    typeof ReadableStream !== "undefined" &&
    value instanceof ReadableStream
  )
    return true;
  return false;
}

function resolveApiTimeoutMs() {
  const configured = Number(process.env.NEXT_PUBLIC_API_TIMEOUT_MS);
  return Number.isFinite(configured) && configured > 0 ? configured : 15000;
}
