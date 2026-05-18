import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.MAIN_API_URL || "http://localhost:8000";

function buildTargetUrl(path: string, request: NextRequest) {
  const url = new URL(`${API_URL}${path}`);
  request.nextUrl.searchParams.forEach((value, key) => {
    url.searchParams.set(key, value);
  });
  return url;
}

export async function proxyAdminRequest(
  request: NextRequest,
  path: string,
  init?: { method?: string; includeBody?: boolean }
) {
  try {
    const accessToken = request.cookies.get("ksu_access")?.value;

    if (!accessToken) {
      return NextResponse.json({ detail: "Not authenticated" }, { status: 401 });
    }

    const body = init?.includeBody === false ? undefined : await request.text().catch(() => "");

    const response = await fetch(buildTargetUrl(path, request), {
      method: init?.method ?? request.method,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        ...(body ? { "Content-Type": request.headers.get("content-type") || "application/json" } : {}),
      },
      body: body || undefined,
    });

    if (response.status === 204) {
      return new NextResponse(null, { status: 204 });
    }

    const raw = await response.json().catch(() => ({}));

    if (!response.ok) {
      return NextResponse.json(
        {
          detail: raw.detail || raw.message || "Request failed",
          code: raw.code || "error",
          errors: raw.errors,
        },
        { status: response.status }
      );
    }

    return NextResponse.json(raw, { status: response.status });
  } catch (error) {
    console.error(`Admin proxy error for ${path}:`, error);
    return NextResponse.json({ detail: "Admin service unavailable" }, { status: 503 });
  }
}
