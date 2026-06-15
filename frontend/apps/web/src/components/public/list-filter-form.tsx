import { SlidersHorizontal } from "lucide-react";
import {
  PublicFilterButton,
  PublicFilterClearLink,
  PublicFilterSelect,
  PublicFilterTextInput,
} from "@/components/public/public-primitives";

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
}) {
  const hasFilters =
    Boolean(listFilterValue(searchValue)) ||
    selects.some((select) => Boolean(listFilterValue(select.value)));

  return (
    <form className={className}>
      <div className={gridClassName}>
        <PublicFilterTextInput
          name={searchName}
          value={searchValue}
          placeholder={searchPlaceholder}
          label={searchLabel}
          visibleLabel
        />
        {selects.map((select) => (
          <PublicFilterSelect
            key={select.name}
            name={select.name}
            label={select.label}
            value={select.value}
            options={select.options}
            allLabel={select.allLabel}
            visibleLabel
          />
        ))}
        <div className="flex flex-wrap items-center gap-2">
          <PublicFilterButton>
            <SlidersHorizontal aria-hidden className="h-4 w-4" />
            Apply
          </PublicFilterButton>
          {hasFilters && clearHref ? (
            <PublicFilterClearLink href={clearHref} />
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
