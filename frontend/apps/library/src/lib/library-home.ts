export function buildLibrarySearchHref(query: string, type = "everything") {
  const trimmedQuery = query.trim();
  if (!trimmedQuery) return "/search";

  const params = new URLSearchParams({ q: trimmedQuery });
  if (type && type !== "everything") params.set("type", type);
  return `/search?${params.toString()}`;
}
