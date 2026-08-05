import { NextResponse } from "next/server";
import { programmesApi } from "@ksu/api-client";

export const dynamic = "force-dynamic";

/**
 * Live programme search for the landing finder: proxies the gateway's
 * programme listing with a text query and returns a slim result set.
 */
export async function GET(request: Request) {
  const query = new URL(request.url).searchParams.get("q")?.trim() ?? "";
  if (query.length < 2) {
    return NextResponse.json({ results: [] });
  }

  try {
    const response = await programmesApi.list({
      q: query,
      per_page: 6,
      fields: "id,name,slug,level,department_name",
    });

    const results = (response.data ?? []).map((programme) => {
      const record = programme as typeof programme & {
        department_name?: string | null;
      };
      return {
        id: programme.id,
        name: programme.name,
        level: programme.level ?? null,
        department: record.department_name ?? null,
        href: `/academics/programmes/${programme.slug}`,
      };
    });

    return NextResponse.json(
      { results },
      { headers: { "Cache-Control": "public, max-age=30" } },
    );
  } catch (error) {
    console.error("Programme search failed:", error);
    return NextResponse.json({ results: [] });
  }
}
