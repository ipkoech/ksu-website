import { ApiClientError } from "@ksu/api-client";

export function isNotFoundError(error: unknown) {
  return error instanceof ApiClientError && error.status === 404;
}

/**
 * Standard outage policy for page-level fetchers whose callers map `null` to
 * `notFound()`: a backend 404 means the resource genuinely doesn't exist, so
 * return null; any other failure (network, 5xx, timeout) is rethrown so the
 * route error boundary reports an outage instead of a misleading 404.
 */
export function nullIfNotFound(error: unknown): null {
  if (isNotFoundError(error)) return null;
  throw error;
}
