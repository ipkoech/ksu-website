"use client";

import { ApiClient } from "@ksu/api-client/browser";
import { getMainPublicApiBaseUrl } from "@ksu/api-client/service-urls";

/** Anonymous public interactions retain the original credential-free contract. */
export const publicBackendApi = new ApiClient({
  baseUrl: getMainPublicApiBaseUrl(),
  credentials: "omit",
  runtime: "browser",
});

/** Resolve same-origin routes at interaction time, never from a server hostname. */
export function getSiteApi() {
  return new ApiClient({
    baseUrl: window.location.origin,
    credentials: "omit",
    runtime: "browser",
  });
}
