"use client";

import { ArrowUpDown, Search } from "lucide-react";
import { ActiveFilterChips, FilterDrawerSheet } from "@ksu/ui/components";
import { formatLabel } from "../../lib/research-public-data";
import type { ResearchGenericRecord } from "@ksu/api-client";

type SelectChoice = string | { value: string; label: string };

type ControlSelect = {
  name: string;
  label: string;
  value?: string;
  options: SelectChoice[];
  allLabel?: string;
  includeAllOption?: boolean;
};

type ProgramTableControlsProps = {
  action: string;
  resetHref: string;
  searchValue?: string;
  searchPlaceholder?: string;
  filterTitle?: string;
  sortTitle?: string;
  centers?: ResearchGenericRecord[];
  centerValue?: string;
  filterSelects: ControlSelect[];
  sortValue?: string;
  sortOptions: SelectChoice[];
};

export function ProgramTableControls({
  action,
  resetHref,
  searchValue,
  searchPlaceholder = "Search programs by title, code or focus area...",
  filterTitle = "Filter programs",
  sortTitle = "Sort programs",
  centers,
  centerValue,
  filterSelects,
  sortValue,
  sortOptions,
}: ProgramTableControlsProps) {
  const centerOptions = centers ?? [];
  const filterItems = [
    searchValue ? { key: "q", label: "Search", value: searchValue } : null,
    ...filterSelects.map((select) =>
      select.value ? { key: select.name, label: select.label, value: select.value } : null,
    ),
    centerValue ? { key: "center", label: "Center", value: centerValue } : null,
  ].filter((item): item is { key: string; label: string; value: string } => Boolean(item));
  const sortItems = sortValue ? [{ key: "sort", label: "Sort", value: sortValue }] : [];
  const activeItems = [...filterItems, ...sortItems];

  const reset = () => {
    window.location.href = resetHref;
  };

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
      <form id="filter-drawer-form" action={action} className="flex flex-col gap-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
          <label className="block min-w-0 flex-1">
            <span className="text-xs font-semibold uppercase text-slate-500">Search</span>
            <span className="relative mt-2 block">
              <Search
                aria-hidden
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
              />
              <input
                type="search"
                name="q"
                defaultValue={searchValue ?? ""}
                placeholder={searchPlaceholder}
                autoComplete="off"
                className="h-11 w-full rounded-md border border-slate-200 bg-white px-3 pl-9 text-sm font-medium text-slate-950 outline-none ring-primary/20 transition placeholder:text-slate-400 focus:border-primary focus:ring-4"
              />
            </span>
          </label>
          <div className="grid grid-cols-3 gap-2 sm:flex">
            <button
              type="submit"
              className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20"
            >
              Search
            </button>
            <FilterDrawerSheet
              filterLabel="Filter"
              title={filterTitle}
              filterCount={filterItems.length}
              activeFilters={filterItems}
              showReset={activeItems.length > 0}
              onReset={reset}
              onRemoveFilter={reset}
            >
              <div className="grid gap-4">
                {filterSelects.map((select) => (
                  <ProgramSelectField key={select.name} {...select} />
                ))}
                {centerOptions.length > 0 ? (
                  <ProgramSelectField
                    name="center"
                    label="Center"
                    value={centerValue}
                    allLabel="All centers"
                    options={centerOptions.map((center) => ({
                      value: center.id ?? center.code ?? center.name ?? center.title ?? "",
                      label: center.name ?? center.title ?? center.code ?? center.id ?? "Unnamed center",
                    }))}
                  />
                ) : null}
              </div>
            </FilterDrawerSheet>
            <FilterDrawerSheet
              filterLabel="Sort"
              title={sortTitle}
              triggerIcon={<ArrowUpDown aria-hidden className="h-4 w-4" />}
              filterCount={sortItems.length}
              activeFilters={sortItems}
              showReset={activeItems.length > 0}
              onReset={reset}
              onRemoveFilter={reset}
            >
              <ProgramSelectField
                name="sort"
                label="Sort"
                value={sortValue ?? "created_at"}
                options={sortOptions}
                includeAllOption={false}
              />
            </FilterDrawerSheet>
          </div>
        </div>
        <ActiveFilterChips filters={activeItems} onRemove={reset} />
      </form>
    </div>
  );
}

function ProgramSelectField({
  name,
  label,
  value,
  options,
  allLabel,
  includeAllOption = true,
}: ControlSelect) {
  return (
    <label className="block min-w-0">
      <span className="text-xs font-semibold uppercase text-slate-500">{label}</span>
      <select
        name={name}
        defaultValue={value ?? ""}
        className="mt-2 h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-slate-950 outline-none ring-primary/20 transition focus:border-primary focus:ring-4"
      >
        {includeAllOption ? <option value="">{allLabel ?? `All ${label.toLowerCase()}`}</option> : null}
        {normalizeOptions(options).map((option) => (
          <option key={`${name}-${option.value}-${option.label}`} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function normalizeOptions(options: SelectChoice[]) {
  const seen = new Set<string>();

  return options
    .map((option) =>
      typeof option === "string"
        ? { value: option, label: formatLabel(option) }
        : option,
    )
    .filter((option) => {
      const key = `${option.value}-${option.label}`;
      if (!option.value || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}
