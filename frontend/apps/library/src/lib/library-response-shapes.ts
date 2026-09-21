export type LibraryListMeta = {
  total: number;
  page: number;
  per_page: number;
  pages: number;
};

export type LibraryListResponseShape<T> = {
  data: T[];
  meta: LibraryListMeta | null;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** Validate public Library list envelopes before they reach display DTOs. */
export function normalizeLibraryListResponse<T>(
  response: unknown,
): LibraryListResponseShape<T> | null {
  if (!isRecord(response) || !Array.isArray(response.data)) return null;
  if (!response.data.every(isRecord)) return null;

  const meta = isRecord(response.meta) ? response.meta : null;
  if (!meta) return { data: response.data as T[], meta: null };

  const numbers = [meta.total, meta.page, meta.per_page, meta.pages];
  if (!numbers.every((value) => typeof value === "number")) {
    return { data: response.data as T[], meta: null };
  }

  return {
    data: response.data as T[],
    meta: {
      total: meta.total as number,
      page: meta.page as number,
      per_page: meta.per_page as number,
      pages: meta.pages as number,
    },
  };
}

/** Preserve a valid missing object and reject scalar statistics payloads. */
export function normalizeLibraryRecordResponse<T>(
  response: unknown,
): T | null | undefined {
  if (!isRecord(response) || !("data" in response)) return undefined;
  if (response.data === null) return null;
  return isRecord(response.data) ? (response.data as T) : undefined;
}
