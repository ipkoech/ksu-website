import { resolveMainMediaUrl } from "@ksu/api-client";

const mediaIdPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function publicFileUrl(id?: string | null) {
  const value = id?.trim();
  return value ? `/api/files/${encodeURIComponent(value)}` : null;
}

export function resolvePublicMediaUrl(value?: string | null) {
  const raw = value?.trim();
  if (!raw) return null;
  if (raw.startsWith("/api/files/")) return raw;
  if (mediaIdPattern.test(raw)) return publicFileUrl(raw);
  return resolveMainMediaUrl(raw) ?? null;
}
