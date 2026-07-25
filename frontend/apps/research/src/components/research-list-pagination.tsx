import { ListPagination } from "@ksu/ui/components";

type ListingSearchParams = Record<string, string | string[] | undefined>;

type ListingOverrides = Record<string, string | number | null | undefined>;

export function ResearchListPagination({
  page,
  totalPages,
  total,
  perPage,
  path,
  params,
  className,
}: {
  page: number;
  totalPages: number;
  total: number;
  perPage: number;
  path: string;
  params: ListingSearchParams;
  className?: string;
}) {
  return (
    <ListPagination
      page={page}
      totalPages={totalPages}
      total={total}
      perPage={perPage}
      baseHref={getListingHref(path, params, { page: undefined })}
      className={className}
    />
  );
}

export function getListingHref(
  path: string,
  params: ListingSearchParams,
  overrides: ListingOverrides = {},
) {
  const query = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (!value) continue;
    if (Array.isArray(value)) {
      value.filter(Boolean).forEach((item) => query.append(key, item));
    } else {
      query.set(key, value);
    }
  }

  for (const [key, value] of Object.entries(overrides)) {
    query.delete(key);
    if (value === undefined || value === null || value === "") continue;
    query.set(key, String(value));
  }

  const search = query.toString();
  return search ? `${path}?${search}` : path;
}
