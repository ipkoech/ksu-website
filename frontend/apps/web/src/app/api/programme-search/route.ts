import { NextResponse } from "next/server";
import { programmesApi } from "@ksu/api-client";

export const dynamic = "force-dynamic";

/**
 * Live programme search for the landing finder.
 *
 * Proxies the gateway's programme listing with a text query and the three
 * catalogue filters, returning a slim result set. Responses are cached: the
 * catalogue changes rarely, and a finder that re-queries the gateway on every
 * keystroke makes the university's own search its heaviest traffic source.
 */

type CacheEntry = { body: unknown; at: number };

const CACHE_TTL_MS = 5 * 60 * 1000;
const CACHE_MAX = 200;
/** Module-scoped, so it survives between requests on a warm server. */
const cache = new Map<string, CacheEntry>();

function readCache(key: string) {
  const hit = cache.get(key);
  if (!hit) return null;
  if (Date.now() - hit.at > CACHE_TTL_MS) {
    cache.delete(key);
    return null;
  }
  // Refresh recency so the map evicts genuinely cold entries.
  cache.delete(key);
  cache.set(key, hit);
  return hit.body;
}

function writeCache(key: string, body: unknown) {
  cache.set(key, { body, at: Date.now() });
  while (cache.size > CACHE_MAX) {
    const oldest = cache.keys().next().value;
    if (oldest === undefined) break;
    cache.delete(oldest);
  }
}


/**
 * Order results by how closely they answer what was typed.
 *
 * The gateway returns catalogue order, so a search for "law" could put
 * "Bachelor of Arts in Criminology and Law" above "Bachelor of Laws". Ranking
 * here keeps exact and leading matches at the top, where a reader looks
 * first, and leaves everything else in catalogue order behind them.
 */
function relevance(name: string, query: string): number {
  if (!query) return 0;
  const n = name.toLowerCase();
  const q = query.toLowerCase();
  if (n === q) return 0; // exact title
  if (n.startsWith(q)) return 1; // "law" -> "Law..."
  // A whole-word hit ("Bachelor of Laws" for "laws") beats a mid-word one
  // ("Flawless"), which is the usual failure of a bare substring match.
  if (new RegExp(`\\b${q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`, "i").test(name)) return 2;
  if (n.includes(q)) return 3;
  return 4;
}

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const query = params.get("q")?.trim() ?? "";
  const level = params.get("level")?.trim() || undefined;
  const mode = params.get("mode_of_study")?.trim() || undefined;
  const schoolId = params.get("school_id")?.trim() || undefined;

  const hasFilter = Boolean(level || mode || schoolId);
  // A bare one-character query is not a search, but a filter on its own is:
  // "show me every postgraduate programme" is a legitimate ask.
  if (query.length < 2 && !hasFilter) {
    return NextResponse.json({ results: [], total: 0 });
  }

  const key = JSON.stringify([query.toLowerCase(), level, mode, schoolId]);
  const cached = readCache(key);
  if (cached) {
    return NextResponse.json(cached, {
      headers: { "X-Cache": "HIT", "Cache-Control": "public, max-age=60" },
    });
  }

  try {
    const response = await programmesApi.list({
      q: query || undefined,
      level,
      mode_of_study: mode,
      school_id: schoolId,
      per_page: 8,
      fields:
        "id,name,slug,level,mode_of_study,duration,department_name",
    });

    const mapped = (response.data ?? []).map((programme) => {
      const record = programme as typeof programme & {
        department_name?: string | null;
      };
      return {
        id: programme.id,
        name: programme.name,
        level: programme.level ?? null,
        mode: programme.mode_of_study ?? null,
        duration: programme.duration ?? null,
        department: record.department_name ?? null,
        href: `/academics/programmes/${programme.slug}`,
      };
    });

    // Stable sort: equal-rank rows keep the catalogue's own ordering.
    const results = mapped
      .map((item, index) => ({ item, index, rank: relevance(item.name, query) }))
      .sort((a, b) => a.rank - b.rank || a.index - b.index)
      .map((entry) => entry.item);

    const body = { results, total: response.meta?.total ?? results.length };
    writeCache(key, body);

    return NextResponse.json(body, {
      headers: { "X-Cache": "MISS", "Cache-Control": "public, max-age=60" },
    });
  } catch (error) {
    console.error("Programme search failed:", error);
    // 200 with an explicit flag: the finder degrades to "search unavailable,
    // browse the catalogue" rather than surfacing a fetch error to the reader.
    return NextResponse.json({ results: [], total: 0, error: true });
  }
}
