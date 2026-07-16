"use client";

import { useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import { FilterDrawerSheet, ActiveFilterChips } from "@ksu/ui/components";
import {
  PublicFilterSelect,
  PublicFilterTextInput,
} from "@/components/public/public-primitives";

type ActiveFilter = {
  key: string;
  label: string;
  value: string;
};

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
  className = "mb-6 border border-border bg-white p-4 shadow-sm",
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
  searchLabel?: string;
  searchName?: string;
  searchValue?: string;
  searchPlaceholder?: string;
  selects?: ListFilterSelect[];
  clearHref?: string;
  total: number;
  visible: number;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const activeFilters = useMemo(() => {
    const filters: ActiveFilter[] = [];
    const searchVal = listFilterValue(searchValue);
    if (searchVal) {
      filters.push({
        key: searchName,
        label: searchLabel,
        value: searchVal,
      });
    }
    for (const select of selects) {
      const val = listFilterValue(select.value);
      if (val) {
        const option = select.options.find((o) => o.value === val);
        filters.push({
          key: select.name,
          label: select.label,
          value: option?.label ?? val,
        });
      }
    }
    return filters;
  }, [searchValue, searchName, searchLabel, selects]);

  const handleRemoveFilter = (key: string) => {
    const params = new URLSearchParams(window.location.search);
    params.delete(key);
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  const handleReset = () => {
    if (clearHref) {
      router.push(clearHref, { scroll: false });
    }
  };

  const hasActiveFilters = activeFilters.length > 0;

  return (
    <form id="filter-drawer-form" action="?" method="GET">
      <div className={className}>
        <div className="flex flex-col gap-3">
          <div className="flex gap-2 md:gap-3">
            <PublicFilterTextInput
              name={searchName}
              value={searchValue}
              placeholder={searchPlaceholder}
              label={searchLabel}
              visibleLabel
              className="flex-1"
            />
            <FilterDrawerSheet
              filterLabel="Filter"
              filterCount={activeFilters.length}
              activeFilters={activeFilters}
              onRemoveFilter={handleRemoveFilter}
              showReset={hasActiveFilters && Boolean(clearHref)}
              onReset={handleReset}
            >
              <div className="flex flex-col gap-4">
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
              </div>
            </FilterDrawerSheet>
          </div>
          <ActiveFilterChips
            filters={activeFilters}
            onRemove={handleRemoveFilter}
          />
        </div>
        <p className="mt-3 text-sm font-medium text-muted-foreground">
          Showing {visible} of {total} published record
          {total === 1 ? "" : "s"}.
        </p>
      </div>
    </form>
  );
}
