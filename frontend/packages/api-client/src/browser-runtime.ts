"use client";

import { ApiTransport, type ApiConfig } from "./transport";
import { refreshStoredAccessToken } from "./auth-tokens";
import {
  getMainApiBaseUrl,
  getResearchApiBaseUrl,
  getLibraryApiBaseUrl,
  getHeriPublicApiUrl,
} from "./service-urls";

export * from "./transport";

/** Browser transport, including cookie-session recovery. */
export class ApiClient extends ApiTransport {
  constructor(config: ApiConfig) {
    super({
      ...config,
      runtime:
        config.runtime ??
        (typeof window === "undefined" ? "server" : "browser"),
      refreshSession: config.refreshSession ?? refreshStoredAccessToken,
    });
  }
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

/** Browser-safe HERI client, including the public gateway path prefix. */
export const heriApi = new ApiClient({
  baseUrl: getHeriPublicApiUrl(),
});
