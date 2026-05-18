"use client";

import * as React from "react";
import { Search, X } from "lucide-react";
import { Badge, Button, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui";

export interface SearchFilterProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  filters?: {
    key: string;
    label: string;
    options: { value: string; label: string }[];
    value?: string;
  }[];
  onFilterChange?: (key: string, value: string | null) => void;
  onClearAll?: () => void;
}

export function SearchFilter({
  searchValue,
  onSearchChange,
  searchPlaceholder = "Search...",
  filters = [],
  onFilterChange,
  onClearAll,
}: SearchFilterProps) {
  const [localSearch, setLocalSearch] = React.useState(searchValue);

  React.useEffect(() => {
    setLocalSearch(searchValue);
  }, [searchValue]);

  React.useEffect(() => {
    const timeout = window.setTimeout(() => onSearchChange(localSearch), 300);
    return () => window.clearTimeout(timeout);
  }, [localSearch, onSearchChange]);

  const activeFilters = filters.filter((filter) => filter.value);

  return (
    <div className="space-y-3 rounded-lg border bg-card p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={localSearch} onChange={(event) => setLocalSearch(event.target.value)} placeholder={searchPlaceholder} className="pl-9" />
        </div>
        <div className="flex flex-wrap gap-2">
          {filters.map((filter) => (
            <Select
              key={filter.key}
              value={filter.value ?? "__all__"}
              onValueChange={(value) => onFilterChange?.(filter.key, value === "__all__" ? null : value)}
            >
              <SelectTrigger className="min-w-[180px]">
                <SelectValue placeholder={filter.label} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">All {filter.label}</SelectItem>
                {filter.options.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ))}
        </div>
      </div>
      {activeFilters.length > 0 ? (
        <div className="flex flex-wrap items-center gap-2">
          {activeFilters.map((filter) => {
            const label = filter.options.find((option) => option.value === filter.value)?.label ?? filter.value;
            return (
              <Badge key={filter.key} variant="secondary" className="gap-2">
                {filter.label}: {label}
                <button type="button" onClick={() => onFilterChange?.(filter.key, null)} aria-label={`Clear ${filter.label}`}>
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            );
          })}
          {onClearAll ? (
            <Button type="button" variant="ghost" size="sm" onClick={onClearAll}>
              Clear all
            </Button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
