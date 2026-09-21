import { NextResponse, type NextRequest } from "next/server";
import { createServerApiClient } from "@ksu/api-client/server";
import { resolveMainMediaUrl } from "@ksu/api-client/media";

type PublicMediaResponse = {
  data?: {
    url?: string | null;
    cdn_url?: string | null;
    public_url?: string | null;
    thumbnail_url?: string | null;
  };
};

function resolveMediaTarget(media: PublicMediaResponse["data"]) {
  return (
    resolveMainMediaUrl(media?.cdn_url) ??
    resolveMainMediaUrl(media?.public_url) ??
    resolveMainMediaUrl(media?.url) ??
    resolveMainMediaUrl(media?.thumbnail_url)
  );
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const response = await createServerApiClient("main").request<Response>(
    "GET",
    `/api/v1/public/media/${encodeURIComponent(id)}`,
    {
      auth: "none",
      next: { revalidate: 300 },
      consume: async (upstream) => upstream,
    },
  );

  if (!response.ok) {
    return new NextResponse("Media not found", {
      status: response.status === 404 ? 404 : 502,
    });
  }

  const payload = (await response.json().catch(() => null)) as
    | PublicMediaResponse
    | null;
  if (!payload || typeof payload !== "object") {
    return new NextResponse("Media metadata was malformed", {
      status: 502,
      headers: { "cache-control": "no-store" },
    });
  }
  const target = resolveMediaTarget(payload.data);
  if (!target) {
    return new NextResponse("Media URL unavailable", { status: 404 });
  }

  const mediaResponse = await fetch(target, {
    cache: "force-cache",
    next: { revalidate: 300 },
    signal: AbortSignal.timeout(15_000),
  });
  if (!mediaResponse.ok) {
    return new NextResponse("Media not available", { status: 502 });
  }

  const headers = new Headers();
  const contentType = mediaResponse.headers.get("content-type");
  const contentLength = mediaResponse.headers.get("content-length");
  if (contentType) headers.set("content-type", contentType);
  if (contentLength) headers.set("content-length", contentLength);
  headers.set(
    "cache-control",
    "public, max-age=300, stale-while-revalidate=3600",
  );

  return new NextResponse(mediaResponse.body, { headers });
}
