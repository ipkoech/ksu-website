"use client";

import * as React from "react";
import { useQueries, useQuery } from "@tanstack/react-query";
import { Check, ChevronDown, Plus, Search, X } from "lucide-react";
import {
  Badge,
  Button,
  Alert,
  AlertDescription,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  EmptyState,
  ImageRenderer,
  Input,
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Skeleton,
} from "@ksu/ui/components";
import { cn } from "@ksu/ui";
import type { RelationshipAdapter, RelationshipFilters, RelationshipOption } from "./relationship-adapters";

const noneValue = "__none__";

function useDebouncedValue<T>(value: T, delay = 250) {
  const [debounced, setDebounced] = React.useState(value);

  React.useEffect(() => {
    const handle = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(handle);
  }, [delay, value]);

  return debounced;
}

function getRequiredMessage<TFilters extends RelationshipFilters>(
  adapter: RelationshipAdapter<TFilters>,
  filters?: TFilters,
) {
  if (!adapter.requiredFilterMessage) return null;
  if (typeof adapter.requiredFilterMessage === "function") {
    return adapter.requiredFilterMessage(filters);
  }
  return adapter.requiredFilterMessage;
}

function OptionAvatar({ option }: { option: RelationshipOption }) {
  if (!option.imageUrl) {
    return (
      <div className="flex size-10 shrink-0 items-center justify-center rounded-md border bg-muted text-xs font-semibold text-muted-foreground">
        {option.label.slice(0, 2).toUpperCase()}
      </div>
    );
  }

  return (
    <div className="size-10 shrink-0 overflow-hidden rounded-md border bg-muted">
      <ImageRenderer src={option.imageUrl} alt={option.label} className="h-full border-0" imageClassName="h-full w-full" />
    </div>
  );
}

function DefaultOptionRow({
  option,
  selected,
}: {
  option: RelationshipOption;
  selected?: boolean;
}) {
  return (
    <div className="flex min-w-0 flex-1 items-center gap-3">
      <OptionAvatar option={option} />
      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 items-center gap-2">
          <p className="truncate text-sm font-medium">{option.label}</p>
          {option.eyebrow ? <Badge variant="secondary">{option.eyebrow}</Badge> : null}
        </div>
        {option.description ? <p className="truncate text-xs text-muted-foreground">{option.description}</p> : null}
      </div>
      {selected ? <Check className="size-4 shrink-0 text-primary" /> : null}
    </div>
  );
}

export type EntityPickerProps<TFilters extends RelationshipFilters = RelationshipFilters> = {
  adapter: RelationshipAdapter<TFilters>;
  value?: string | null;
  onChange: (value: string, option?: RelationshipOption | null) => void;
  filters?: TFilters;
  label?: string;
  description?: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  allowClear?: boolean;
  limit?: number;
  className?: string;
  dialogTitle?: string;
  dialogDescription?: string;
  createLabel?: string;
  onCreate?: () => void;
  renderOption?: (option: RelationshipOption, state: { selected: boolean }) => React.ReactNode;
};

export function EntityPicker<TFilters extends RelationshipFilters = RelationshipFilters>({
  adapter,
  value,
  onChange,
  filters,
  label,
  description,
  placeholder,
  disabled,
  required,
  allowClear = true,
  limit = 50,
  className,
  dialogTitle,
  dialogDescription,
  createLabel,
  onCreate,
  renderOption,
}: EntityPickerProps<TFilters>) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const debouncedSearch = useDebouncedValue(search);
  const requiredMessage = getRequiredMessage(adapter, filters);

  const selectedQuery = useQuery({
    queryKey: ["relationship-picker", adapter.key, "selected", value || noneValue, filters],
    queryFn: () => adapter.get(value || "", filters),
    enabled: Boolean(value),
  });

  const optionsQuery = useQuery({
    queryKey: ["relationship-picker", adapter.key, "options", debouncedSearch.trim(), filters, limit],
    queryFn: () => adapter.search({ search: debouncedSearch, filters, limit }),
    enabled: open && !requiredMessage,
  });

  const selectedOption = selectedQuery.data ?? null;
  const options = React.useMemo(() => {
    const base = optionsQuery.data ?? [];
    if (!selectedOption || base.some((option) => option.id === selectedOption.id)) {
      return base;
    }
    return [selectedOption, ...base];
  }, [optionsQuery.data, selectedOption]);

  const selectedLabel = selectedOption?.label ?? "";

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {label ? (
        <div className="flex flex-col gap-1">
          <p className="text-sm font-medium">
            {label}
            {required ? <span className="text-destructive"> *</span> : null}
          </p>
          {description ? <p className="text-xs text-muted-foreground">{description}</p> : null}
        </div>
      ) : null}

      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          onClick={() => setOpen(true)}
          className="min-h-10 flex-1 justify-between overflow-hidden px-3"
        >
          <span className={cn("truncate", !selectedLabel && "text-muted-foreground")}>
            {selectedQuery.isLoading ? `Loading ${adapter.label.toLowerCase()}...` : selectedLabel || placeholder || `Select ${adapter.label.toLowerCase()}`}
          </span>
          <ChevronDown data-icon="inline-end" className="text-muted-foreground" />
        </Button>
        {allowClear && value ? (
          <Button
            type="button"
            variant="outline"
            size="icon"
            disabled={disabled}
            onClick={() => onChange("", null)}
            aria-label={`Clear ${adapter.label.toLowerCase()}`}
          >
            <X data-icon />
          </Button>
        ) : null}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>{dialogTitle ?? `Select ${adapter.label.toLowerCase()}`}</DialogTitle>
            <DialogDescription>{dialogDescription ?? `Search and choose from available ${adapter.pluralLabel.toLowerCase()}.`}</DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4">
            {requiredMessage ? (
              <Alert>
                <AlertDescription>{requiredMessage}</AlertDescription>
              </Alert>
            ) : (
              <>
                <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      placeholder={adapter.searchPlaceholder}
                      className="pl-9"
                    />
                  </div>
                  {onCreate ? (
                    <Button type="button" variant="outline" onClick={onCreate}>
                      <Plus data-icon="inline-start" />
                      {createLabel ?? `Create ${adapter.label.toLowerCase()}`}
                    </Button>
                  ) : null}
                </div>

                <div className="max-h-[420px] overflow-y-auto rounded-md border">
                  {optionsQuery.isLoading ? (
                    <div className="flex flex-col gap-2 p-3">
                      {[1, 2, 3, 4].map((item) => (
                        <Skeleton key={item} className="h-14 rounded-md" />
                      ))}
                    </div>
                  ) : options.length ? (
                    <div className="divide-y">
                      {options.map((option) => {
                        const selected = option.id === value;
                        return (
                          <button
                            key={option.id}
                            type="button"
                            disabled={option.disabled}
                            className={cn(
                              "flex w-full items-center gap-3 p-3 text-left transition hover:bg-muted/60 disabled:cursor-not-allowed disabled:opacity-60",
                              selected && "bg-primary/5",
                            )}
                            onClick={() => {
                              onChange(option.id, option);
                              setOpen(false);
                            }}
                          >
                            {renderOption ? renderOption(option, { selected }) : <DefaultOptionRow option={option} selected={selected} />}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="p-8 text-center">
                      <EmptyState
                        title={adapter.emptyLabel}
                        description="Try a different search term."
                      />
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export type MultiEntityPickerProps<TFilters extends RelationshipFilters = RelationshipFilters> = {
  adapter: RelationshipAdapter<TFilters>;
  value?: string[];
  onChange: (value: string[], options?: RelationshipOption[]) => void;
  filters?: TFilters;
  label?: string;
  description?: string;
  disabled?: boolean;
  placeholder?: string;
  createLabel?: string;
  onCreate?: () => void;
};

export function MultiEntityPicker<TFilters extends RelationshipFilters = RelationshipFilters>({
  adapter,
  value = [],
  onChange,
  filters,
  label,
  description,
  disabled,
  placeholder,
  createLabel,
  onCreate,
}: MultiEntityPickerProps<TFilters>) {
  const selectedQueries = useQueries({
    queries: value.map((id) => ({
      queryKey: ["relationship-picker", adapter.key, "selected", id, filters],
      queryFn: () => adapter.get(id, filters),
      enabled: Boolean(id),
    })),
  });
  const selectedOptions = selectedQueries.map((query) => query.data).filter(Boolean) as RelationshipOption[];

  return (
    <div className="flex flex-col gap-3">
      {label ? (
        <div className="flex flex-col gap-1">
          <p className="text-sm font-medium">{label}</p>
          {description ? <p className="text-xs text-muted-foreground">{description}</p> : null}
        </div>
      ) : null}

      {selectedOptions.length ? (
        <div className="flex flex-wrap gap-2">
          {selectedOptions.map((option) => (
            <Badge key={option.id} variant="secondary" className="gap-1 py-1">
              {option.label}
              <button
                type="button"
                disabled={disabled}
                onClick={() => onChange(value.filter((id) => id !== option.id), selectedOptions.filter((item) => item.id !== option.id))}
                className="rounded-sm text-muted-foreground hover:text-foreground disabled:pointer-events-none"
                aria-label={`Remove ${option.label}`}
              >
                <X className="size-3" />
              </button>
            </Badge>
          ))}
        </div>
      ) : null}

      <EntityPicker
        adapter={adapter}
        value=""
        filters={filters}
        disabled={disabled}
        allowClear={false}
        placeholder={placeholder ?? `Add ${adapter.label.toLowerCase()}`}
        createLabel={createLabel}
        onCreate={onCreate}
        onChange={(nextValue, option) => {
          if (!nextValue || value.includes(nextValue)) return;
          onChange([...value, nextValue], option ? [...selectedOptions, option] : selectedOptions);
        }}
      />
    </div>
  );
}

export type EntityTypeRecordConfig<TFilters extends RelationshipFilters = RelationshipFilters> = {
  value: string;
  label: string;
  adapter: RelationshipAdapter<TFilters>;
  filters?: TFilters;
  recordRequired?: boolean;
};

export type EntityTypeRecordPickerProps = {
  typeValue?: string | null;
  idValue?: string | null;
  onChange: (value: { type: string; id: string }) => void;
  configs: EntityTypeRecordConfig[];
  label?: string;
  description?: string;
  typePlaceholder?: string;
  recordPlaceholder?: string;
  disabled?: boolean;
  allowNone?: boolean;
};

export function EntityTypeRecordPicker({
  typeValue,
  idValue,
  onChange,
  configs,
  label,
  description,
  typePlaceholder = "Select relationship type",
  recordPlaceholder = "Select related record",
  disabled,
  allowNone = true,
}: EntityTypeRecordPickerProps) {
  const selectedConfig = configs.find((config) => config.value === typeValue);

  return (
    <div className="flex flex-col gap-3">
      {label ? (
        <div className="flex flex-col gap-1">
          <p className="text-sm font-medium">{label}</p>
          {description ? <p className="text-xs text-muted-foreground">{description}</p> : null}
        </div>
      ) : null}

      <Select
        value={typeValue || noneValue}
        disabled={disabled}
        onValueChange={(nextValue) => {
          const normalized = nextValue === noneValue ? "" : nextValue;
          onChange({ type: normalized, id: "" });
        }}
      >
        <SelectTrigger>
          <SelectValue placeholder={typePlaceholder} />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {allowNone ? <SelectItem value={noneValue}>No relationship</SelectItem> : null}
            {configs.map((config) => (
              <SelectItem key={config.value} value={config.value}>
                {config.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>

      {selectedConfig?.recordRequired === false ? null : selectedConfig ? (
        <EntityPicker
          adapter={selectedConfig.adapter as RelationshipAdapter}
          value={idValue || ""}
          filters={selectedConfig.filters}
          disabled={disabled}
          placeholder={recordPlaceholder}
          onChange={(id) => onChange({ type: selectedConfig.value, id })}
        />
      ) : null}
    </div>
  );
}
