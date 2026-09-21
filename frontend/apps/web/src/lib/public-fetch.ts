import "server-only";
import { ApiClientError } from "@ksu/api-client/server";
import { unstable_noStore as noStore } from "next/cache";
import { unstable_rethrow } from "next/navigation";

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

/** Optional content may degrade, but an outage must not become cached empty HTML. */
export function publicFallback<T>(error: unknown, fallback: T): T {
  unstable_rethrow(error);
  if (!isNotFoundError(error)) noStore();
  return fallback;
}

/**
 * Use for collection/aggregate fallbacks. A failed listing is not a valid
 * empty result, so it must never become the cached representation of a
 * public page, even when the upstream happened to answer with 404.
 */
export function uncachedPublicFallback<T>(fallback: T): T {
  noStore();
  return fallback;
}

/**
 * Aggregate loaders may still render the fulfilled portions of a response,
 * but a rejected source means the aggregate must stay request-scoped.
 */
export function markUncacheableIfFailed(
  results: readonly PromiseSettledResult<unknown>[],
): void {
  if (results.some((result) => result.status === "rejected")) noStore();
}
