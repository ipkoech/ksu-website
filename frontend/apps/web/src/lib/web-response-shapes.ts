export type PublicListResponseShape<T> = {
  data: T[];
  meta?: { total?: number; count?: number };
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** Keep malformed public list envelopes out of Server Component DTOs. */
export function normalizePublicListResponse<T>(
  response: unknown,
): PublicListResponseShape<T> | null {
  if (!isRecord(response) || !Array.isArray(response.data)) return null;
  if (!response.data.every(isRecord)) return null;

  const meta = isRecord(response.meta) ? response.meta : undefined;
  return {
    data: response.data as T[],
    ...(meta
      ? {
          meta: {
            ...(typeof meta.total === "number" ? { total: meta.total } : {}),
            ...(typeof meta.count === "number" ? { count: meta.count } : {}),
          },
        }
      : {}),
  };
}

/** Preserve `null` for a valid missing record and reject scalar payloads. */
export function normalizePublicRecordResponse<T>(
  response: unknown,
): T | null | undefined {
  if (!isRecord(response) || !("data" in response)) return undefined;
  if (response.data === null) return null;
  return isRecord(response.data) ? (response.data as T) : undefined;
}
