"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { Check, ChevronDown, Search, X } from "lucide-react";
import {
  Alert,
  AlertDescription,
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  EmptyState,
  Input,
  Skeleton,
} from "@ksu/ui/components";
import { cn } from "@ksu/ui";
import {
  pageCmsApi,
  PAGE_CMS_CATALOG_SOURCE_TYPES,
  type PageCmsSourceSummary,
  type PageCmsSourceType,
  type PageScopeType,
  type PageSectionLayoutVariant,
} from "@/lib/api/page-cms";
import {
  isCatalogSearchableSourceType,
  nextSelectableIndex,
  selectionMatchesContext,
  selectionInvalidationKey,
  shouldNotifySelectionInvalidation,
  type SourceSelectionContext,
} from "./source-record-picker-state";

export type SourceRecordPickerValue = {
  sourceType: PageCmsSourceType;
  sourceId: string;
  summary: PageCmsSourceSummary;
  selectionContext: SourceSelectionContext;
};

export type SourceRecordPickerProps = {
  sourceType: PageCmsSourceType;
  layoutVariant: PageSectionLayoutVariant;
  scopeType: PageScopeType;
  scopeId?: string | null;
  value?: SourceRecordPickerValue | null;
  onChange: (value: SourceRecordPickerValue | null) => void;
  disabled?: boolean;
  label?: string;
};

export function useDebouncedSearch(value: string, delay = 250) {
  const [debouncedValue, setDebouncedValue] = React.useState(value);

  React.useEffect(() => {
    const timeout = window.setTimeout(() => setDebouncedValue(value), delay);
    return () => window.clearTimeout(timeout);
  }, [delay, value]);

  return debouncedValue;
}

export function canSelectPageCmsSource(source: PageCmsSourceSummary) {
  return source.selectable;
}

export function SourceRecordPicker({
  sourceType,
  layoutVariant,
  scopeType,
  scopeId,
  value,
  onChange,
  disabled,
  label = "Source record",
}: SourceRecordPickerProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [activeIndex, setActiveIndex] = React.useState(-1);
  const invalidatedSelectionRef = React.useRef<string | null>(null);
  const debouncedSearch = useDebouncedSearch(search);
  const inputId = React.useId();
  const listboxId = React.useId();
  const selectionContext = React.useMemo<SourceSelectionContext>(() => ({
    sourceType,
    layoutVariant,
    scopeType,
    scopeId: scopeId ?? null,
  }), [layoutVariant, scopeId, scopeType, sourceType]);
  const supportsCatalogSearch = isCatalogSearchableSourceType(sourceType, PAGE_CMS_CATALOG_SOURCE_TYPES);
  const requiresScope = scopeType !== "university" && !scopeId;
  const hasCurrentSelection = value ? selectionMatchesContext(value, selectionContext) : false;
  const displayedValue = hasCurrentSelection ? value : null;

  const sourceQuery = useQuery({
    queryKey: ["page-cms", "sources", sourceType, layoutVariant, scopeType, scopeId ?? null, debouncedSearch],
    queryFn: ({ signal }) => {
      if (!isCatalogSearchableSourceType(sourceType, PAGE_CMS_CATALOG_SOURCE_TYPES)) {
        throw new Error("This Page CMS source type is not catalog searchable.");
      }
      return pageCmsApi.searchSources(sourceType, {
        q: debouncedSearch.trim() || undefined,
        scope_type: scopeType,
        scope_id: scopeId ?? null,
        layout_variant: layoutVariant,
        page: 1,
        per_page: 20,
      }, { signal });
    },
    enabled: open && supportsCatalogSearch && !requiresScope,
  });

  const sources = React.useMemo(() => sourceQuery.data?.data ?? [], [sourceQuery.data]);
  const selectableSources = React.useMemo(() => sources.filter(canSelectPageCmsSource), [sources]);

  React.useEffect(() => {
    setActiveIndex(nextSelectableIndex(sources, -1, 1));
  }, [sources]);

  React.useEffect(() => {
    if (!value || hasCurrentSelection) {
      invalidatedSelectionRef.current = null;
      return;
    }

    if (!shouldNotifySelectionInvalidation(value, selectionContext, invalidatedSelectionRef.current)) return;

    invalidatedSelectionRef.current = selectionInvalidationKey(value, selectionContext);
    onChange(null);
  }, [hasCurrentSelection, onChange, selectionContext, value]);

  const selectSource = (source: PageCmsSourceSummary) => {
    if (!canSelectPageCmsSource(source)) return;
    onChange({ sourceType, sourceId: source.id, summary: source, selectionContext });
    setOpen(false);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((current) => nextSelectableIndex(sources, current, 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((current) => nextSelectableIndex(sources, current, -1));
    } else if (event.key === "Enter") {
      const source = sources[activeIndex];
      if (source && canSelectPageCmsSource(source)) {
        event.preventDefault();
        selectSource(source);
      }
    } else if (event.key === "Escape") {
      setOpen(false);
    }
  };

  const activeSource = sources[activeIndex] && canSelectPageCmsSource(sources[activeIndex])
    ? sources[activeIndex]
    : null;
  const selectionLabel = displayedValue?.summary.label ?? `Select ${sourceType.replace(/_/g, " ")}`;

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium" htmlFor={inputId}>{label}</label>
      <div className="flex gap-2">
        <Button type="button" variant="outline" disabled={disabled} onClick={() => setOpen(true)} className="min-h-10 flex-1 justify-between overflow-hidden px-3">
          <span className={cn("truncate text-left", !value && "text-muted-foreground")}>{selectionLabel}</span>
          <ChevronDown className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
        </Button>
        {displayedValue ? (
          <Button type="button" variant="outline" size="icon" disabled={disabled} onClick={() => onChange(null)} aria-label="Clear selected source">
            <X className="size-4" aria-hidden="true" />
          </Button>
        ) : null}
      </div>
      {displayedValue?.summary.secondary_label ? <p className="text-xs text-muted-foreground">{displayedValue.summary.secondary_label}</p> : null}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Select {sourceType.replace(/_/g, " ")}</DialogTitle>
            <DialogDescription>Search records available to the selected page scope.</DialogDescription>
          </DialogHeader>
          {!supportsCatalogSearch ? (
            <Alert><AlertDescription>This source type is not yet available in the searchable catalog.</AlertDescription></Alert>
          ) : requiresScope ? (
            <Alert><AlertDescription>Select a page scope before searching source records.</AlertDescription></Alert>
          ) : (
            <div className="space-y-3">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                <Input
                  id={inputId}
                  role="combobox"
                  aria-autocomplete="list"
                  aria-controls={listboxId}
                  aria-expanded={open}
                  aria-activedescendant={activeSource ? `${listboxId}-${activeSource.id}` : undefined}
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Search available records"
                  className="pl-9"
                  autoFocus
                />
              </div>

              <div id={listboxId} role="listbox" aria-label={`${label} results`} className="max-h-[420px] overflow-y-auto rounded-md border">
                {sourceQuery.isLoading ? (
                  <div className="space-y-2 p-3">{[1, 2, 3].map((item) => <Skeleton key={item} className="h-14 rounded-md" />)}</div>
                ) : sourceQuery.isError ? (
                  <div className="p-4"><Alert variant="destructive"><AlertDescription>Source records could not be loaded. Try again.</AlertDescription></Alert></div>
                ) : sources.length ? (
                  <div className="divide-y">
                    {sources.map((source, index) => {
                      const selected = source.id === displayedValue?.sourceId;
                      return (
                        <button
                          key={source.id}
                          id={`${listboxId}-${source.id}`}
                          type="button"
                          role="option"
                          aria-selected={selected}
                          disabled={!source.selectable}
                          className={cn("flex w-full items-center gap-3 p-3 text-left hover:bg-muted/60 disabled:cursor-not-allowed disabled:opacity-60", selected && "bg-primary/5", index === activeIndex && "outline-none ring-2 ring-inset ring-ring")}
                          onMouseMove={() => {
                            if (canSelectPageCmsSource(source)) setActiveIndex(index);
                          }}
                          onClick={() => selectSource(source)}
                        >
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-medium">{source.label}</span>
                            {source.secondary_label ? <span className="block truncate text-xs text-muted-foreground">{source.secondary_label}</span> : null}
                            {!source.selectable ? <span className="block text-xs text-muted-foreground">Unavailable for selection</span> : null}
                          </span>
                          {selected ? <Check className="size-4 shrink-0 text-primary" aria-hidden="true" /> : null}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-8 text-center"><EmptyState title="No source records found" description="Try a different search term." /></div>
                )}
              </div>
              {selectableSources.length === 0 && sources.length > 0 ? <p className="text-sm text-muted-foreground">No available records can be selected.</p> : null}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
