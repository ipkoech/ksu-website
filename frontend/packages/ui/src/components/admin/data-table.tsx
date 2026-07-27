"use client";

import * as React from "react";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Search,
  ArrowUpDown,
} from "lucide-react";
import {
  Button,
  Checkbox,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Input,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui";
import { cn } from "../../lib";
import { EmptyState } from "./empty-state";

export interface ColumnDef<T> {
  key: string;
  header: React.ReactNode | ((direction: "asc" | "desc" | null) => React.ReactNode);
  accessor?: keyof T;
  cell?: (row: T) => React.ReactNode;
  sortable?: boolean;
  className?: string;
  cellClassName?: string;
  mobileLabel?: string;
}

export interface DataTableProps<T extends { id?: string }> {
  columns: ColumnDef<T>[];
  data: T[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
  onPaginationChange: (page: number, limit: number) => void;
  onSort?: (column: string, direction: "asc" | "desc") => void;
  onRowClick?: (row: T) => void;
  onSelectionChange?: (selectedIds: string[]) => void;
  bulkActions?: {
    label: string;
    icon?: React.ReactNode;
    onClick: (ids: string[]) => void;
    variant?: "default" | "destructive";
  }[];
  isLoading?: boolean;
  emptyMessage?: string;
  searchPlaceholder?: string;
  onSearch?: (query: string) => void;
  getRowLabel?: (row: T, index: number) => string;
}

function getRowId<T extends { id?: string }>(row: T, index: number) {
  return String(row.id ?? index);
}

export function DataTable<T extends { id?: string }>({
  columns,
  data,
  pagination,
  onPaginationChange,
  onSort,
  onRowClick,
  onSelectionChange,
  bulkActions = [],
  isLoading = false,
  emptyMessage = "No results found.",
  searchPlaceholder = "Search records…",
  onSearch,
  getRowLabel,
}: DataTableProps<T>) {
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);
  const [search, setSearch] = React.useState("");
  const [sortState, setSortState] = React.useState<{ column: string; direction: "asc" | "desc" } | null>(null);

  React.useEffect(() => {
    onSelectionChange?.(selectedIds);
  }, [onSelectionChange, selectedIds]);

  React.useEffect(() => {
    setSelectedIds((current) => current.filter((id) => data.some((row, index) => getRowId(row, index) === id)));
  }, [data]);

  React.useEffect(() => {
    if (!onSearch) return;
    const timeout = window.setTimeout(() => onSearch(search), 300);
    return () => window.clearTimeout(timeout);
  }, [onSearch, search]);

  const allSelected = data.length > 0 && selectedIds.length === data.length;
  const someSelected = selectedIds.length > 0 && !allSelected;

  const toggleAll = (checked: boolean) => {
    setSelectedIds(checked ? data.map(getRowId) : []);
  };

  const toggleRow = (row: T, index: number, checked: boolean) => {
    const rowId = getRowId(row, index);
    setSelectedIds((current) =>
      checked ? Array.from(new Set([...current, rowId])) : current.filter((id) => id !== rowId)
    );
  };

  const handleSort = (column: ColumnDef<T>) => {
    if (!column.sortable || !onSort) return;
    const direction = sortState?.column === column.key && sortState.direction === "asc" ? "desc" : "asc";
    setSortState({ column: column.key, direction });
    onSort(column.key, direction);
  };

  return (
    <div className="space-y-4" aria-busy={isLoading}>
      <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {isLoading
          ? "Loading records…"
          : `${pagination.total} ${pagination.total === 1 ? "record" : "records"} available.`}
      </p>
      <div className="flex flex-col gap-3 rounded-lg border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full max-w-sm">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            name="table-search"
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={searchPlaceholder}
            aria-label={searchPlaceholder}
            autoComplete="off"
            spellCheck={false}
            className="pl-9"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {bulkActions.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" disabled={selectedIds.length === 0}>
                  Bulk actions
                  <ChevronDown aria-hidden="true" className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {bulkActions.map((action) => (
                  <DropdownMenuItem
                    key={action.label}
                    className={cn(action.variant === "destructive" && "text-destructive focus:text-destructive")}
                    onClick={() => action.onClick(selectedIds)}
                  >
                    {action.icon}
                    {action.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          <div className="text-sm text-muted-foreground" aria-hidden="true">
            {pagination.total} total
          </div>
        </div>
      </div>

      <div
        className="hidden overflow-x-auto rounded-lg border md:block"
        role="region"
        aria-label="Records table"
        tabIndex={0}
      >
        <Table className="min-w-[720px]">
          <TableHeader>
            <TableRow>
              <TableHead className={onRowClick ? "w-24" : "w-12"}>
                <Checkbox
                  checked={allSelected ? true : someSelected ? "indeterminate" : false}
                  onCheckedChange={(checked) => toggleAll(Boolean(checked))}
                  aria-label="Select all rows"
                />
              </TableHead>
              {columns.map((column) => {
                const direction = sortState?.column === column.key ? sortState.direction : null;
                return (
                  <TableHead
                    key={column.key}
                    className={column.className}
                    aria-sort={
                      column.sortable && direction
                        ? direction === "asc"
                          ? "ascending"
                          : "descending"
                        : column.sortable
                          ? "none"
                          : undefined
                    }
                  >
                    {column.sortable ? (
                      <button
                        type="button"
                        className="inline-flex min-h-11 items-center gap-2 text-left font-medium"
                        onClick={() => handleSort(column)}
                        aria-label={`Sort by ${typeof column.header === "string" ? column.header : column.key}`}
                      >
                        {typeof column.header === "function" ? column.header(direction) : column.header}
                        <ArrowUpDown
                          aria-hidden="true"
                          className="h-4 w-4 text-muted-foreground"
                        />
                      </button>
                    ) : (
                      typeof column.header === "function" ? column.header(direction) : column.header
                    )}
                  </TableHead>
                );
              })}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: Math.max(3, pagination.limit || 5) }).map((_, rowIndex) => (
                <TableRow key={`skeleton-${rowIndex}`}>
                  <TableCell><Skeleton className="h-4 w-4" /></TableCell>
                  {columns.map((column) => (
                    <TableCell key={`${column.key}-${rowIndex}`}>
                      <Skeleton className="h-4 w-full max-w-[180px]" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length + 1} className="py-12">
                  <EmptyState title="Nothing here yet" description={emptyMessage} />
                </TableCell>
              </TableRow>
            ) : (
              data.map((row, index) => {
                const rowId = getRowId(row, index);
                const selected = selectedIds.includes(rowId);
                const label =
                  getRowLabel?.(row, index) ?? `Record ${index + 1}`;
                return (
                  <TableRow
                    key={rowId}
                    data-state={selected ? "selected" : undefined}
                    className={cn(onRowClick && "cursor-pointer")}
                    onClick={() => onRowClick?.(row)}
                  >
                    <TableCell onClick={(event) => event.stopPropagation()}>
                      <div className="flex items-center gap-1">
                        <Checkbox
                          checked={selected}
                          onCheckedChange={(checked) =>
                            toggleRow(row, index, Boolean(checked))
                          }
                          aria-label={`Select ${label}`}
                        />
                        {onRowClick ? (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => onRowClick(row)}
                            aria-label={`Open ${label}`}
                          >
                            <ChevronRight
                              aria-hidden="true"
                              className="h-4 w-4"
                            />
                          </Button>
                        ) : null}
                      </div>
                    </TableCell>
                    {columns.map((column) => (
                      <TableCell key={`${rowId}-${column.key}`} className={column.cellClassName}>
                        {column.cell
                          ? column.cell(row)
                          : column.accessor
                            ? String(row[column.accessor] ?? "")
                            : null}
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <div className="grid gap-3 md:hidden">
        {isLoading ? (
          Array.from({ length: Math.max(3, Math.min(pagination.limit || 5, 6)) }).map((_, index) => (
            <div key={`mobile-skeleton-${index}`} className="rounded-lg border bg-card p-4">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="mt-3 h-4 w-full" />
              <Skeleton className="mt-2 h-4 w-1/2" />
            </div>
          ))
        ) : data.length === 0 ? (
          <div className="rounded-lg border bg-card px-4 py-10">
            <EmptyState title="Nothing here yet" description={emptyMessage} />
          </div>
        ) : (
          data.map((row, index) => {
            const rowId = getRowId(row, index);
            const selected = selectedIds.includes(rowId);
            const label = getRowLabel?.(row, index) ?? `Record ${index + 1}`;

            return (
              <article key={rowId} className="rounded-lg border bg-card p-4">
                <div className="flex items-start justify-between gap-3">
                  {onRowClick ? (
                    <button
                      type="button"
                      className="min-h-11 min-w-0 flex-1 rounded-sm text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      onClick={() => onRowClick(row)}
                      aria-label={`Open ${label}`}
                    >
                      <span className="block truncate text-sm font-semibold">
                        {label}
                      </span>
                    </button>
                  ) : (
                    <h3 className="min-w-0 flex-1 truncate text-sm font-semibold">
                      {label}
                    </h3>
                  )}
                  <Checkbox
                    checked={selected}
                    onCheckedChange={(checked) => toggleRow(row, index, Boolean(checked))}
                    aria-label={`Select ${label}`}
                  />
                </div>
                <dl className="mt-3 grid gap-2 text-sm">
                  {columns.slice(0, 4).map((column) => (
                    <div key={`${rowId}-${column.key}`} className="grid grid-cols-[7rem_1fr] gap-3">
                      <dt className="text-muted-foreground">{column.mobileLabel ?? (typeof column.header === "string" ? column.header : column.key)}</dt>
                      <dd className="min-w-0 break-words font-medium">
                        {column.cell
                          ? column.cell(row)
                          : column.accessor
                            ? String(row[column.accessor] ?? "")
                            : null}
                      </dd>
                    </div>
                  ))}
                </dl>
              </article>
            );
          })
        )}
      </div>

      <div className="flex flex-col gap-3 rounded-lg border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-muted-foreground">
          Page {pagination.page} of {Math.max(pagination.totalPages, 1)}
        </div>
        <div className="flex items-center gap-2">
          <select
            className="h-11 rounded-md border border-input bg-background px-3 text-sm"
            value={pagination.limit}
            aria-label="Rows per page"
            onChange={(event) => onPaginationChange(1, Number(event.target.value))}
          >
            {[10, 20, 50, 100].map((limit) => (
              <option key={limit} value={limit}>
                {limit} / page
              </option>
            ))}
          </select>
          <Button variant="outline" size="icon-sm" onClick={() => onPaginationChange(1, pagination.limit)} disabled={pagination.page <= 1} aria-label="First page">
            <ChevronsLeft aria-hidden="true" className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon-sm" onClick={() => onPaginationChange(pagination.page - 1, pagination.limit)} disabled={pagination.page <= 1} aria-label="Previous page">
            <ChevronLeft aria-hidden="true" className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon-sm" onClick={() => onPaginationChange(pagination.page + 1, pagination.limit)} disabled={pagination.page >= pagination.totalPages} aria-label="Next page">
            <ChevronRight aria-hidden="true" className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon-sm" onClick={() => onPaginationChange(pagination.totalPages, pagination.limit)} disabled={pagination.page >= pagination.totalPages} aria-label="Last page">
            <ChevronsRight aria-hidden="true" className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
