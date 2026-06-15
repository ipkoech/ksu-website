import Link from "next/link";
import { Search, SlidersHorizontal } from "lucide-react";

export type ListFilterOption = {
  value: string;
  label: string;
};

export type ListFilterSelect = {
  name: string;
  label: string;
  value?: string;
  allLabel: string;
  options: ListFilterOption[];
};

export function listFilterValue(value?: string | null) {
  return value?.trim() || "";
}

export function PublicListFilterForm({
  className = "mb-6 border border-slate-200 bg-white p-4 shadow-sm",
  gridClassName = "grid gap-3 md:grid-cols-2 2xl:grid-cols-[minmax(220px,1fr)_12rem_12rem_auto] 2xl:items-end",
  searchLabel = "Search",
  searchName = "q",
  searchValue,
  searchPlaceholder = "Search records",
  selects = [],
  clearHref,
  total,
  visible,
  buttonHeightClassName = "h-11",
}: {
  className?: string;
  gridClassName?: string;
  searchLabel?: string;
  searchName?: string;
  searchValue?: string;
  searchPlaceholder?: string;
  selects?: ListFilterSelect[];
  clearHref?: string;
  total: number;
  visible: number;
  buttonHeightClassName?: string;
}) {
  const hasFilters =
    Boolean(listFilterValue(searchValue)) ||
    selects.some((select) => Boolean(listFilterValue(select.value)));

  return (
    <form className={className}>
      <div className={gridClassName}>
        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
            {searchLabel}
          </span>
          <span className="relative mt-2 block">
            <Search
              aria-hidden
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            />
            <input
              name={searchName}
              defaultValue={listFilterValue(searchValue)}
              placeholder={searchPlaceholder}
              className={`${buttonHeightClassName} w-full rounded-md border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none ring-primary/20 transition placeholder:text-slate-400 focus:border-primary focus:ring-4`}
            />
          </span>
        </label>
        {selects.map((select) => (
          <label key={select.name} className="block">
            <span className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
              {select.label}
            </span>
            <select
              name={select.name}
              defaultValue={listFilterValue(select.value)}
              className={`${buttonHeightClassName} mt-2 w-full rounded-md border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none ring-primary/20 transition focus:border-primary focus:ring-4`}
            >
              <option value="">{select.allLabel}</option>
              {select.options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        ))}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="submit"
            className={`${buttonHeightClassName} inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-white transition hover:bg-primary/90`}
          >
            <SlidersHorizontal aria-hidden className="h-4 w-4" />
            Apply
          </button>
          {hasFilters && clearHref ? (
            <Link
              href={clearHref}
              className={`${buttonHeightClassName} inline-flex items-center justify-center rounded-md border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:border-primary hover:text-primary`}
            >
              Clear
            </Link>
          ) : null}
        </div>
      </div>
      <p className="mt-3 text-sm font-medium text-slate-600">
        Showing {visible} of {total} published record
        {total === 1 ? "" : "s"}.
      </p>
    </form>
  );
}
