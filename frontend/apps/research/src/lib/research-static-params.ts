import { normalizeResearchListResponse } from "./research-response-shapes";

export type ResearchSlugList = (
  params?: Record<string, string | number | boolean | undefined>,
) => Promise<{ data?: Array<{ slug?: string }> }>;

export async function generateSlugParams(
  listFn: ResearchSlugList,
  filterExtra: Record<string, string | number | boolean | undefined> = {},
): Promise<{ slug: string }[]> {
  let response: Awaited<ReturnType<ResearchSlugList>>;
  try {
    response = await listFn({
      per_page: 50,
      fields: "slug",
      is_public: true,
      is_active: true,
      ...filterExtra,
    });
  } catch (error) {
    // Dynamic detail routes still fetch on the server at request time. A transient
    // upstream failure during `next build` should therefore leave the route
    // available for runtime rendering instead of failing the entire application.
    // Malformed successful responses remain fatal below because they indicate a
    // contract violation rather than an unavailable build dependency.
    const status = typeof error === "object" && error !== null && "status" in error
      ? (error as { status?: unknown }).status
      : undefined;
    if (status === 0 || (typeof status === "number" && status >= 500)) {
      console.warn("Research slug pre-rendering skipped because the upstream service is unavailable.");
      return [];
    }
    throw error;
  }
  const normalized = normalizeResearchListResponse<{ slug?: string }>(response);
  if (!normalized) throw new Error("Malformed Research slug response");
  return normalized.data
    .filter((item) => item.slug)
    .map((item) => ({ slug: item.slug! }));
}
