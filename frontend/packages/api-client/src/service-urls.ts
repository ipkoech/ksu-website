function normalizeUrl(value: string) {
  return value.replace(/\/$/, "");
}

function isServerRuntime() {
  return typeof window === "undefined";
}

export function getMainApiBaseUrl() {
  const publicApiUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/v1\/?$/, "");
  const baseUrl =
    (isServerRuntime() ? process.env.KSU_MAIN_API_URL : undefined) ||
    process.env.NEXT_PUBLIC_MAIN_API_URL ||
    publicApiUrl ||
    "http://localhost:8000";
  return normalizeUrl(baseUrl);
}

export function getResearchApiBaseUrl() {
  const baseUrl =
    (isServerRuntime() ? process.env.KSU_RESEARCH_API_URL : undefined) ||
    process.env.NEXT_PUBLIC_RESEARCH_API_URL ||
    "http://localhost:8001";
  return normalizeUrl(baseUrl);
}

export function getLibraryApiBaseUrl() {
  const baseUrl =
    (isServerRuntime() ? process.env.KSU_LIBRARY_API_URL : undefined) ||
    process.env.NEXT_PUBLIC_LIBRARY_API_URL ||
    "http://localhost:8002";
  return normalizeUrl(baseUrl);
}
