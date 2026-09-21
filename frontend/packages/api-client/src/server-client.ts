import { ApiTransport, type ApiConfig } from "./transport";
import { acquireServerRequest } from "./server-request-limit";
import {
  getMainApiBaseUrl,
  getResearchApiBaseUrl,
  getLibraryApiBaseUrl,
  getHeriApiBaseUrl,
} from "./service-urls";

export type BackendService = "main" | "research" | "library" | "heri";

export interface ServerApiContext {
  /** Only supply credentials for a private loader; public loaders omit context. */
  headers?: HeadersInit;
  timeoutMs?: number;
}

/** Create inside the loader: never share a credential-bearing instance across requests. */
export function createServerApiClient(
  service: BackendService,
  context: ServerApiContext = {},
  rethrowError?: ApiConfig["rethrowError"],
) {
  if (typeof window !== "undefined")
    throw new Error("Server API clients cannot run in the browser");
  const baseUrl = {
    main: getMainApiBaseUrl,
    research: getResearchApiBaseUrl,
    library: getLibraryApiBaseUrl,
    heri: getHeriApiBaseUrl,
  }[service]();
  const incoming = new Headers(context.headers);
  const headers: Record<string, string> = {};
  const authorization = incoming.get("authorization");
  if (authorization) headers.Authorization = authorization;
  // The backend's request dependency consumes ksu_access. Do not forward the
  // refresh cookie, unrelated site cookies or arbitrary incoming headers.
  const accessCookie = incoming
    .get("cookie")
    ?.split(";")
    .map((cookie) => cookie.trim())
    .find((cookie) => cookie.startsWith("ksu_access="));
  if (accessCookie) headers.Cookie = accessCookie;
  return new ApiTransport({
    baseUrl,
    headers,
    timeoutMs: context.timeoutMs,
    runtime: "server",
    rethrowError,
    credentials: "omit",
    acquireRequest: (signal) =>
      acquireServerRequest(new URL(baseUrl).origin, signal),
  });
}
