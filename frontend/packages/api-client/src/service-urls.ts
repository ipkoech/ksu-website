function normalizeUrl(value: string) {
  return value.replace(/\/$/, "");
}

function isServerRuntime() {
  return typeof window === "undefined";
}

/** Browser-visible URLs must never fall back to an internal server origin. */
export function getMainPublicApiBaseUrl() {
  return normalizeUrl(
    process.env.NEXT_PUBLIC_MAIN_API_URL ||
      process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/v1\/?$/, "") ||
      "http://localhost:8080",
  );
}

/** Resolve the HERI URL that may be embedded in a browser bundle. */
export function getHeriPublicApiUrl() {
  const configured = process.env.NEXT_PUBLIC_HERI_API_URL?.trim();
  if (configured) return normalizeUrl(configured);
  const mainPublicApi = getMainPublicApiBaseUrl().replace(/\/api\/v1\/?$/, "");
  return `${mainPublicApi}/api/v1/heri`;
}

export function getMainApiBaseUrl() {
  return normalizeUrl(
    (isServerRuntime() ? process.env.KSU_MAIN_API_URL : undefined) ||
      getMainPublicApiBaseUrl(),
  );
}

export function getResearchApiBaseUrl() {
  const baseUrl =
    (isServerRuntime() ? process.env.KSU_RESEARCH_API_URL : undefined) ||
    process.env.NEXT_PUBLIC_RESEARCH_API_URL ||
    "http://localhost:8080";
  return normalizeUrl(baseUrl);
}

export function getLibraryApiBaseUrl() {
  const baseUrl =
    (isServerRuntime() ? process.env.KSU_LIBRARY_API_URL : undefined) ||
    process.env.NEXT_PUBLIC_LIBRARY_API_URL ||
    "http://localhost:8080";
  return normalizeUrl(baseUrl);
}

export function getHeriApiBaseUrl() {
  const baseUrl =
    (isServerRuntime() ? process.env.KSU_HERI_API_URL : undefined) ||
    process.env.NEXT_PUBLIC_HERI_API_URL ||
    "http://localhost:8080";
  return normalizeUrl(baseUrl).replace(/\/api\/v1\/heri$/, "");
}
