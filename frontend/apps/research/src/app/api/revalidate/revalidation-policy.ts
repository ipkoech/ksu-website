import { timingSafeEqual } from "node:crypto";

const allowedPermissions = new Set([
  "admin:*",
  "research:write",
  "research:manage",
  "content:write",
  "content.manage",
]);

export function canRevalidateResearch(permissions: unknown): boolean {
  return (
    Array.isArray(permissions) &&
    permissions.some(
      (permission) =>
        typeof permission === "string" && allowedPermissions.has(permission),
    )
  );
}

export function matchesRevalidationSecret(
  provided: string | null,
  expected: string | undefined,
): boolean {
  if (!provided || !expected) return false;
  const providedBytes = Buffer.from(provided);
  const expectedBytes = Buffer.from(expected);
  if (providedBytes.length !== expectedBytes.length) return false;
  return timingSafeEqual(providedBytes, expectedBytes);
}
