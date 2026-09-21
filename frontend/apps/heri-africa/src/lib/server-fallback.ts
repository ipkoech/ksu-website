import "server-only";
import { unstable_noStore as noStore } from "next/cache";

/**
 * Keep a transient backend fallback request-scoped instead of allowing an ISR
 * page to cache the outage result as healthy public content.
 */
export function uncachedFallback<T>(fallback: T): T {
  noStore();
  return fallback;
}

export function markUncacheableIfFailed(
  results: readonly PromiseSettledResult<unknown>[],
): void {
  if (results.some((result) => result.status === "rejected")) noStore();
}
