/**
 * Shared tag used by server-runtime public loaders. Admin mutations can ask
 * each owning frontend to invalidate this tag after the backend confirms a
 * write, keeping ISR content aligned without exposing backend credentials.
 */
export const PUBLIC_CONTENT_CACHE_TAG = "ksu-public-content";

const CONTENT_REVALIDATION_PERMISSIONS = new Set([
  "admin:*",
  "content:write",
  "content.manage",
  "research:manage",
  "research:write",
]);

export function canRevalidatePublicContent(permissions: unknown): boolean {
  return (
    Array.isArray(permissions) &&
    permissions.some(
      (permission) =>
        typeof permission === "string" &&
        CONTENT_REVALIDATION_PERMISSIONS.has(permission),
    )
  );
}
