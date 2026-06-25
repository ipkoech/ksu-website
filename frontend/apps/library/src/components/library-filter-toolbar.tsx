"use client";

import { useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import { FilterDrawerSheet, ActiveFilterChips } from "@ksu/ui/components";
import {
  LibraryFilterTextInput,
  LibraryFilterSelect,
  LibraryFilterCheckbox,
} from "./library-ui";

type FilterItem = {
  key: string;
  label: string;
  value: string;
};

type SelectOption = {
  value: string;
  label: string;
};

export type LibraryFilterToolbarProps = {
  actionUrl: string;
  resetHref: string;
  searchName?: string;
  searchValue?: string;
  searchPlaceholder?: string;
  searchLabel?: string;
  selects?: {
    name: string;
    label: string;
    value?: string;
    options: SelectOption[];
    allLabel: string;
  }[];
  checkbox?: {
    name: string;
    label: string;
    checked: boolean;
    filterLabel: string;
  };
};

export function LibraryFilterToolbar({
  actionUrl,
  resetHref,
  searchName = "q",
  searchValue,
  searchPlaceholder = "Search",
  searchLabel = "Search",
  selects = [],
  checkbox,
}: LibraryFilterToolbarProps) {
  const router = useRouter();
  const pathname = usePathname();

  const activeFilters = useMemo(() => {
    const filters: FilterItem[] = [];
    if (searchValue) {
      filters.push({ key: searchName, label: searchLabel, value: searchValue });
    }
    for (const select of selects) {
      if (select.value) {
        const option = select.options.find((o) => o.value === select.value);
        filters.push({
          key: select.name,
          label: select.label,
          value: option?.label ?? select.value,
        });
      }
    }
    if (checkbox?.checked) {
      filters.push({ key: checkbox.name, label: checkbox.label, value: checkbox.filterLabel });
    }
    return filters;
  }, [searchValue, searchName, searchLabel, selects, checkbox]);

  const handleRemoveFilter = (key: string) => {
    const params = new URLSearchParams(window.location.search);
    params.delete(key);
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  const handleReset = () => {
    router.push(resetHref, { scroll: false });
  };

  return (
    <form id="filter-drawer-form" action={actionUrl}>
      <div className="flex flex-col gap-3">
        <div className="flex gap-2 md:gap-3">
          <LibraryFilterTextInput
            name={searchName}
            label={searchLabel}
            value={searchValue}
            placeholder={searchPlaceholder}
            className="flex-1"
          />
          <FilterDrawerSheet
            filterLabel="Filter"
            filterCount={activeFilters.length}
            activeFilters={activeFilters}
            onRemoveFilter={handleRemoveFilter}
            showReset={activeFilters.length > 0}
            onReset={handleReset}
          >
            <div className="flex flex-col gap-4">
              {selects.map((select) => (
                <LibraryFilterSelect
                  key={select.name}
                  name={select.name}
                  label={select.label}
                  value={select.value}
                  options={select.options}
                  allLabel={select.allLabel}
                />
              ))}
              {checkbox ? (
                <LibraryFilterCheckbox
                  name={checkbox.name}
                  value="true"
                  checked={checkbox.checked}
                >
                  {checkbox.filterLabel}
                </LibraryFilterCheckbox>
              ) : null}
            </div>
          </FilterDrawerSheet>
        </div>
        <ActiveFilterChips
          filters={activeFilters}
          onRemove={handleRemoveFilter}
        />
      </div>
    </form>
  );
}
