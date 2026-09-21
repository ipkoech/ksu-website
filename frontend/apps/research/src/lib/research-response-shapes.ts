export type ResearchListResponseShape<T> = {
  data: T[];
  total: number;
  perPage: number;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Validate the small response shape that public Research list loaders pass
 * into route DTOs. A JSON response with the wrong shape is an upstream
 * failure, not an empty collection that may safely be cached.
 */
export function normalizeResearchListResponse<T>(
  response: unknown,
): ResearchListResponseShape<T> | null {
  if (!isRecord(response) || !Array.isArray(response.data)) return null;
  if (!response.data.every(isRecord)) return null;

  const meta = isRecord(response.meta) ? response.meta : undefined;
  const total = typeof meta?.total === "number" ? meta.total : response.data.length;
  const perPage = typeof meta?.per_page === "number" ? meta.per_page : 100;

  return {
    data: response.data as T[],
    total,
    perPage,
  };
}

/** Return `undefined` when malformed, preserving `null` for a valid missing record. */
export function normalizeResearchRecordResponse<T>(
  response: unknown,
): T | null | undefined {
  if (!isRecord(response) || !("data" in response)) return undefined;
  if (response.data === null) return null;
  return isRecord(response.data) ? (response.data as T) : undefined;
}
