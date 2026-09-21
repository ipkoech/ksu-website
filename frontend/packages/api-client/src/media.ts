import { getMainPublicApiBaseUrl } from "./service-urls";

export function resolveMainMediaUrl(value?: string | null): string | undefined {
  const rawValue = value?.trim();
  if (!rawValue) return undefined;
  if (/^(https?:|data:|blob:)/i.test(rawValue)) return rawValue;

  let path = rawValue;
  while (/^\/?uploads\/uploads\//.test(path)) {
    path = path.replace(/^\/?uploads\/uploads\//, "/uploads/");
  }
  if (!path.startsWith("/")) {
    path = path.startsWith("uploads/") ? `/${path}` : `/uploads/${path}`;
  }
  while (/^\/uploads\/uploads\//.test(path)) {
    path = path.replace(/^\/uploads\/uploads\//, "/uploads/");
  }

  // Server-side API calls use the Docker-internal hostname, but media URLs
  // are rendered into the browser and must use the public API/gateway host.
  const publicMediaBaseUrl = getMainPublicApiBaseUrl();
  return new URL(path, publicMediaBaseUrl).toString();
}
