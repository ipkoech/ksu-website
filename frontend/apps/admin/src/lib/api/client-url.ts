export function resolveAdminApiBaseUrl(
  apiUrl = process.env.NEXT_PUBLIC_API_URL,
  mainApiUrl = process.env.NEXT_PUBLIC_MAIN_API_URL,
): string {
  const configured = apiUrl || mainApiUrl || "http://localhost:8080/api/v1";
  const normalized = configured.replace(/\/$/, "");
  return normalized.endsWith("/api/v1") ? normalized : `${normalized}/api/v1`;
}

export function isAdminRequestTimeout(code: string | undefined): boolean {
  return code === "ECONNABORTED" || code === "ETIMEDOUT";
}
