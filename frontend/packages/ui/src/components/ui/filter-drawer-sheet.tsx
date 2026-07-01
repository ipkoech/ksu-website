"use client";

import * as React from "react";
import { X, SlidersHorizontal, RotateCcw } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "./sheet";
import { Button } from "./button";
import { Badge } from "./badge";
import { cn } from "../../lib/utils";

function useNarrowViewport() {
  const [isNarrow, setIsNarrow] = React.useState(false);

  React.useEffect(() => {
    const mql = window.matchMedia("(max-width: 639px)");
    setIsNarrow(mql.matches);
    const handler = (e: MediaQueryListEvent) => setIsNarrow(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);

  return isNarrow;
}

type ActiveFilter = {
  key: string;
  label: string;
  value: string;
};

export type FilterDrawerSheetProps = {
  filterLabel: string;
  filterCount?: number;
  title?: string;
  formId?: string;
  triggerIcon?: React.ReactNode;
  children: React.ReactNode;
  activeFilters?: ActiveFilter[];
  onRemoveFilter?: (key: string) => void;
  showReset?: boolean;
  onReset?: () => void;
  className?: string;
};

export function FilterDrawerSheet({
  filterLabel,
  filterCount,
  title = "Filters",
  formId = "filter-drawer-form",
  triggerIcon,
  children,
  activeFilters = [],
  onRemoveFilter,
  showReset = false,
  onReset,
  className,
}: FilterDrawerSheetProps) {
  const [open, setOpen] = React.useState(false);
  const isNarrow = useNarrowViewport();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "inline-flex h-11 items-center gap-2 rounded-md border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:border-primary/40 hover:bg-primary/5 hover:text-primary",
            filterCount ? "border-primary/50 bg-primary/5 text-primary" : "",
            className,
          )}
        >
          {triggerIcon ?? <SlidersHorizontal aria-hidden className="h-4 w-4" />}
          {filterLabel}
          {filterCount ? (
            <Badge variant="default" className="ml-1 h-5 min-w-5 px-1 text-[11px]">
              {filterCount}
            </Badge>
          ) : null}
        </Button>
      </SheetTrigger>
      <SheetContent
        side={isNarrow ? "bottom" : "right"}
        className={cn(
          "flex w-full flex-col gap-0 p-0 sm:max-w-md",
          isNarrow && "max-h-[85dvh] rounded-t-xl sm:max-w-none",
          !isNarrow && "top-[92px] h-[calc(100dvh-92px)] sm:max-w-md xl:top-[128px] xl:h-[calc(100dvh-128px)]",
        )}
      >
        <SheetHeader className="flex-row items-center justify-between border-b border-slate-200 px-6 py-4">
          <SheetTitle className="text-base font-semibold">{title}</SheetTitle>
          <div className="flex items-center gap-2">
            {showReset && onReset ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.preventDefault();
                  onReset();
                  setOpen(false);
                }}
                className="h-8 gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-700"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Reset
              </Button>
            ) : null}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setOpen(false)}
              className="h-8 w-8 p-0"
              aria-label="Close filters"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
        {activeFilters.length > 0 ? (
          <div className="border-t border-slate-200 px-6 py-3">
            <p className="mb-2 text-xs font-semibold uppercase text-slate-500">
              Active filters
            </p>
            <div className="flex flex-wrap gap-1.5">
              {activeFilters.map((filter) => (
                <button
                  key={filter.key}
                  type="button"
                  onClick={() => onRemoveFilter?.(filter.key)}
                  className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700 transition hover:border-red-200 hover:bg-red-50 hover:text-red-700"
                >
                  {filter.label}: {filter.value}
                  <X className="h-3 w-3" />
                </button>
              ))}
            </div>
          </div>
        ) : null}
        <div className="border-t border-slate-200 px-6 py-4">
          <Button
            type="submit"
            form={formId}
            className="w-full h-11 rounded-md bg-primary text-sm font-semibold text-white hover:bg-primary/90"
            onClick={() => setOpen(false)}
          >
            Apply Filters
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export function ActiveFilterChips({
  filters,
  onRemove,
  className,
}: {
  filters: ActiveFilter[];
  onRemove?: (key: string) => void;
  className?: string;
}) {
  if (filters.length === 0) return null;

  return (
    <div className={cn("flex flex-wrap gap-1.5", className)}>
      {filters.map((filter) => (
        <button
          key={filter.key}
          type="button"
          onClick={() => onRemove?.(filter.key)}
          className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700 transition hover:border-red-200 hover:bg-red-50 hover:text-red-700"
        >
          {filter.label}: {filter.value}
          <X className="h-3 w-3" />
        </button>
      ))}
    </div>
  );
}
