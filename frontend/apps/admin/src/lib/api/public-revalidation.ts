export type PublicFrontendService = "main" | "research" | "library" | "heri";

const frontendUrls: Record<PublicFrontendService, string | undefined> = {
  main: process.env.NEXT_PUBLIC_PUBLIC_FRONTEND_URL,
  research: process.env.NEXT_PUBLIC_RESEARCH_FRONTEND_URL,
  library: process.env.NEXT_PUBLIC_LIBRARY_FRONTEND_URL,
  heri:
    process.env.NEXT_PUBLIC_HERI_AFRICA_FRONTEND_URL ||
    process.env.NEXT_PUBLIC_HERI_FRONTEND_URL,
};

const frontendBasePaths: Record<PublicFrontendService, string | undefined> = {
  main: process.env.NEXT_PUBLIC_PUBLIC_FRONTEND_BASE_PATH,
  research: process.env.NEXT_PUBLIC_RESEARCH_FRONTEND_BASE_PATH,
  library: process.env.NEXT_PUBLIC_LIBRARY_FRONTEND_BASE_PATH,
  heri:
    process.env.NEXT_PUBLIC_HERI_AFRICA_FRONTEND_BASE_PATH ||
    process.env.NEXT_PUBLIC_HERI_FRONTEND_BASE_PATH,
};

function normalizeBasePath(value: string | undefined) {
  const trimmed = value?.trim();
  if (!trimmed || trimmed === "/") return "";
  const withoutSlashes = trimmed.replace(/^\/+|\/+$/g, "");
  return withoutSlashes ? `/${withoutSlashes}` : "";
}

function appendBasePath(frontend: string, basePath: string | undefined) {
  const normalizedBasePath = normalizeBasePath(basePath);
  if (!normalizedBasePath || frontend === normalizedBasePath) return frontend;
  return frontend.endsWith(normalizedBasePath)
    ? frontend
    : `${frontend}${normalizedBasePath}`;
}

export function getPublicFrontendUrl(service: PublicFrontendService) {
  const value = frontendUrls[service]?.trim();
  if (!value) return undefined;
  return appendBasePath(value.replace(/\/+$/, ""), frontendBasePaths[service]);
}

export async function revalidatePublicContent(
  service: PublicFrontendService,
  resource?: string,
) {
  const frontend = getPublicFrontendUrl(service);
  if (!frontend) return;

  const controller = new AbortController();
  const timeout = globalThis.setTimeout(() => controller.abort(), 3000);
  try {
    const response = await fetch(`${frontend}/api/revalidate`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resource }),
      signal: controller.signal,
    });
    // Revalidation is fire-and-forget; release any response stream before
    // returning so repeated Admin mutations do not retain idle connections.
    await response.body?.cancel();
    if (!response.ok) {
      console.warn(`${service} public cache revalidation returned HTTP ${response.status}.`);
    }
  } catch (error) {
    if (!(error instanceof DOMException && error.name === "AbortError")) {
      console.warn(`${service} public cache revalidation was unavailable.`, error);
    }
  } finally {
    globalThis.clearTimeout(timeout);
  }
}
