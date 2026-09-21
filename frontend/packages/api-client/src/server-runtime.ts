import "server-only";
import { unstable_rethrow } from "next/navigation";
import { ApiTransport, type ApiConfig } from "./transport";
import { acquireServerRequest } from "./server-request-limit";
import {
  getMainApiBaseUrl,
  getResearchApiBaseUrl,
  getLibraryApiBaseUrl,
  getHeriApiBaseUrl,
} from "./service-urls";

/** Anonymous domain adapters. Private requests use createServerApiClient(context). */
export class ApiClient extends ApiTransport {
  constructor(config: ApiConfig) {
    super({
      ...config,
      runtime: "server",
      credentials: "omit",
      refreshSession: undefined,
      rethrowError: unstable_rethrow,
      acquireRequest: (signal) =>
        acquireServerRequest(new URL(config.baseUrl).origin, signal),
    });
  }
}

export const mainApi = new ApiClient({ baseUrl: getMainApiBaseUrl() });
// Public Research loaders already expose a three-second degraded-state
// boundary. Keep the transport deadline aligned with it so a timed-out
// loader also aborts the underlying fetch instead of leaving work running
// after the page has moved on to its fallback.
export const researchApi = new ApiClient({
  baseUrl: getResearchApiBaseUrl(),
  timeoutMs: 3000,
});
// Library public loaders use the same three-second degraded-state boundary as
// their page-level fallbacks. Aligning the transport deadline prevents a
// timed-out page from leaving its backend request running in the background.
export const libraryApi = new ApiClient({
  baseUrl: getLibraryApiBaseUrl(),
  timeoutMs: 3000,
});

export const heriApi = new ApiClient({
  baseUrl: `${getHeriApiBaseUrl()}/api/v1/heri`,
  timeoutMs: 3000,
});
