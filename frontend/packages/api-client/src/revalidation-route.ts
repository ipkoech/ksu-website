import "server-only";

import { revalidatePath, revalidateTag } from "next/cache";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { createServerApiClient } from "./server";
import {
  canRevalidatePublicContent,
  PUBLIC_CONTENT_CACHE_TAG,
} from "./revalidation";

type AuthUser = { permissions?: unknown };
type AuthResponse = AuthUser | { data?: AuthUser };

function responseHeaders(request: NextRequest): Record<string, string> {
  const origin = request.headers.get("origin");
  const allowedOrigin =
    process.env.ADMIN_FRONTEND_ORIGIN?.trim() || "http://localhost:3001";
  const output: Record<string, string> = {
    "Cache-Control": "no-store",
    Vary: "Origin",
  };
  if (origin && origin === allowedOrigin) {
    output["Access-Control-Allow-Origin"] = origin;
    output["Access-Control-Allow-Credentials"] = "true";
  }
  return output;
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
    return canRevalidatePublicContent(user?.permissions);
  } catch {
    return false;
  }
}

export function OPTIONS(request: NextRequest) {
  const base = responseHeaders(request);
  if (request.headers.get("origin") && !base["Access-Control-Allow-Origin"]) {
    return new NextResponse(null, { status: 403, headers: base });
  }
  return new NextResponse(null, {
    status: 204,
    headers: {
      ...base,
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

export async function POST(request: NextRequest) {
  const responseHeaderValues = responseHeaders(request);
  if (request.headers.get("origin") && !responseHeaderValues["Access-Control-Allow-Origin"]) {
    return NextResponse.json(
      { revalidated: false, error: "Origin is not allowed" },
      { status: 403, headers: responseHeaderValues },
    );
  }
  if (!(await hasAuthorizedSession())) {
    return NextResponse.json(
      { revalidated: false, error: "Revalidation authorization required" },
      { status: 401, headers: responseHeaderValues },
    );
  }

  const body = await request.json().catch(() => null);
  const resource =
    body && typeof body.resource === "string" ? body.resource.trim() : undefined;
  revalidateTag(PUBLIC_CONTENT_CACHE_TAG);
  revalidatePath("/", "layout");
  return NextResponse.json(
    { revalidated: true, resource: resource || null, tag: PUBLIC_CONTENT_CACHE_TAG },
    { headers: responseHeaderValues },
  );
}
