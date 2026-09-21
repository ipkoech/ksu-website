import { revalidatePath, revalidateTag } from "next/cache";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { createServerApiClient } from "@ksu/api-client/server";
import { PUBLIC_CONTENT_CACHE_TAG } from "@ksu/api-client/revalidation";
import {
  canRevalidateResearch,
  matchesRevalidationSecret,
} from "./revalidation-policy";

type AuthUser = { permissions?: unknown };
type AuthResponse = AuthUser | { data?: AuthUser };

function responseHeaders(request: NextRequest): Record<string, string> {
  const origin = request.headers.get("origin");
  const allowedOrigin =
    process.env.ADMIN_FRONTEND_ORIGIN?.trim() || "http://localhost:3001";
  const headers: Record<string, string> = {
    "Cache-Control": "no-store",
    Vary: "Origin",
  };
  if (origin && allowedOrigin && origin === allowedOrigin) {
    headers["Access-Control-Allow-Origin"] = origin;
    headers["Access-Control-Allow-Credentials"] = "true";
  }
  return headers;
}

export function OPTIONS(request: NextRequest) {
  const headers = responseHeaders(request);
  if (request.headers.get("origin") && !headers["Access-Control-Allow-Origin"]) {
    return new NextResponse(null, { status: 403, headers });
  }
  return new NextResponse(null, {
    status: 204,
    headers: {
      ...headers,
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, X-Revalidation-Secret",
    },
  });
}

async function hasAuthorizedSession() {
  try {
    const client = createServerApiClient("main", {
      headers: await headers(),
      timeoutMs: 3000,
    });
    const response = await client.get<AuthResponse>(
      "/api/v1/auth/me",
      { fields: "permissions" },
      { auth: "session", cache: "no-store" },
    );
    const user: AuthUser | undefined =
      response && typeof response === "object" && "data" in response
        ? response.data
        : (response as AuthUser);
    return canRevalidateResearch(user?.permissions);
  } catch {
    return false;
  }
}

// Maps admin resource keys to public research paths
const pathMap: Record<string, string[]> = {
  projects: ["/projects", "/projects/[slug]", "/", "/search"],
  publications: ["/publications", "/publications/[slug]", "/", "/search"],
  grants: ["/funding", "/funding/[slug]", "/", "/search"],
  innovations: ["/innovations", "/innovations/[slug]", "/", "/search"],
  partners: ["/partners", "/partners/[slug]", "/", "/search"],
  centers: ["/centers", "/centers/[slug]", "/"],
  programs: ["/programs", "/programs/[slug]", "/"],
  outputs: ["/outputs", "/outputs/[slug]", "/"],
  training: ["/training", "/training/[slug]", "/"],
  mentorship: ["/mentorship", "/mentorship/[slug]", "/"],
  scholarships: ["/scholarships", "/scholarships/[slug]", "/"],
  consultancies: ["/consultancies", "/consultancies/[slug]", "/"],
  endowments: ["/endowments", "/endowments/[slug]", "/"],
  events: ["/events", "/events/[slug]", "/"],
  news: ["/news", "/news/[slug]", "/"],
  blogs: ["/news", "/news/[slug]", "/"],
  announcements: ["/news", "/news/[slug]", "/"],
  sliders: ["/", "/news"],
  staff: ["/team", "/about", "/"],
  activities: ["/events", "/events/[slug]", "/"],
  "sustainability-activities": ["/events", "/events/[slug]", "/"],
  sustainability: ["/sustainability", "/sustainability/[slug]", "/"],
  farms: ["/farm", "/farm/[slug]", "/"],
  guidelines: ["/guidelines", "/guidelines/[slug]", "/"],
  services: ["/services", "/services/[slug]", "/"],
  resources: ["/resources-tools", "/resources-tools/[slug]", "/"],
  profile: ["/about", "/team", "/", "/search"],
  content: ["/news", "/news/[slug]", "/events", "/events/[slug]", "/projects", "/publications", "/"],
  "impact-metrics": ["/impact-metrics", "/"],
  facilities: ["/facilities", "/centers", "/"],
  startups: ["/startups", "/partners", "/"],
  incubation: ["/incubation", "/partners", "/"],
  competitions: ["/competitions", "/partners", "/"],
  "technology-transfer": ["/technology-transfer", "/partners", "/"],
  "technology-transfer-cases": ["/technology-transfer", "/partners", "/"],
  "incubation-records": ["/incubation", "/partners", "/"],
  "competition-entries": ["/competitions", "/partners", "/"],
  stories: ["/community-impact", "/connect", "/"],
  "donation-stories": ["/connect", "/community-impact", "/"],
  "focus-areas": ["/farm", "/"],
  donations: ["/donate", "/connect", "/community-impact", "/"],
  "donation-settings": ["/donate", "/"],
  "research-stories": ["/connect", "/community-impact", "/"],
  "expertise-tags": ["/search", "/"],
  themes: ["/projects", "/programs", "/"],
  journals: ["/publications", "/"],
  "grant-reviews": ["/funding", "/"],
  "grant-reports": ["/funding", "/"],
  "grant-applications": ["/funding", "/"],
  funders: ["/funding", "/"],
  "scholarship-applications": ["/scholarships", "/"],
  "mentorship-applications": ["/mentorship", "/"],
  "mentorship-matches": ["/mentorship", "/"],
  "farm-focus-areas": ["/farm", "/"],
  "farm-impact-stories": ["/farm", "/community-impact", "/"],
  "farm-projects": ["/farm", "/projects", "/"],
  "farm-partnerships": ["/farm", "/partners", "/"],
};

function canonicalResourceKey(resource: string) {
  return resource.startsWith("research-")
    ? resource.slice("research-".length)
    : resource;
}

// Path invalidation refreshes the rendered route, while these tags clear the
// unstable_cache entries used by the research overview, site context, and
// layout announcements. Keep the list centralized so every authorized admin
// mutation gets the same freshness guarantee.
const researchCacheTags = [
  "research-content",
  "research-overview",
  "research-site-context",
  "research-announcements",
] as const;

export async function POST(request: NextRequest) {
  const configuredSecret = process.env.REVALIDATION_SECRET?.trim();
  const deploymentAuthorized = matchesRevalidationSecret(
    request.headers.get("x-revalidation-secret"),
    configuredSecret,
  );
  const sessionAuthorized = deploymentAuthorized
    ? true
    : await hasAuthorizedSession();
  if (!sessionAuthorized) {
    return NextResponse.json(
      { error: "Revalidation authorization required" },
      { status: 401, headers: responseHeaders(request) },
    );
  }

  const body = await request.json().catch(() => null);
  const resource = typeof body?.resource === "string" ? body.resource.trim() : "";
  const paths = resource
    ? pathMap[resource] ?? pathMap[canonicalResourceKey(resource)]
    : undefined;

  if (!paths) {
    return NextResponse.json(
      { revalidated: false, error: `Unknown resource: ${resource}` },
      { status: 400, headers: responseHeaders(request) },
    );
  }

  for (const path of paths) {
    revalidatePath(path);
  }
  for (const tag of researchCacheTags) {
    revalidateTag(tag);
  }
  revalidateTag(PUBLIC_CONTENT_CACHE_TAG);

  return NextResponse.json(
    { revalidated: true, paths },
    { headers: responseHeaders(request) },
  );
}
