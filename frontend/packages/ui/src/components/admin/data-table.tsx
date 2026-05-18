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
  searchPlaceholder = "Search records...",
  onSearch,
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
    <div className="space-y-4">
      <div className="flex flex-col gap-3 rounded-lg border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={searchPlaceholder}
            className="pl-9"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {bulkActions.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" disabled={selectedIds.length === 0}>
                  Bulk actions
                  <ChevronDown className="h-4 w-4" />
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
          <div className="text-sm text-muted-foreground">
            {pagination.total} total
          </div>
        </div>
      </div>

      <div className="rounded-lg border">
        <Table className="min-w-[720px]">
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={allSelected ? true : someSelected ? "indeterminate" : false}
                  onCheckedChange={(checked) => toggleAll(Boolean(checked))}
                  aria-label="Select all rows"
                />
              </TableHead>
              {columns.map((column) => {
                const direction = sortState?.column === column.key ? sortState.direction : null;
                return (
                  <TableHead key={column.key} className={column.className}>
                    {column.sortable ? (
                      <button
                        type="button"
                        className="inline-flex items-center gap-2 text-left font-medium"
                        onClick={() => handleSort(column)}
                      >
                        {typeof column.header === "function" ? column.header(direction) : column.header}
                        <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
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
                return (
                  <TableRow
                    key={rowId}
                    data-state={selected ? "selected" : undefined}
                    className={cn(onRowClick && "cursor-pointer")}
                    onClick={() => onRowClick?.(row)}
                  >
                    <TableCell onClick={(event) => event.stopPropagation()}>
                      <Checkbox
                        checked={selected}
                        onCheckedChange={(checked) => toggleRow(row, index, Boolean(checked))}
                        aria-label={`Select row ${index + 1}`}
                      />
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

      <div className="flex flex-col gap-3 rounded-lg border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-muted-foreground">
          Page {pagination.page} of {Math.max(pagination.totalPages, 1)}
        </div>
        <div className="flex items-center gap-2">
          <select
            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
            value={pagination.limit}
            onChange={(event) => onPaginationChange(1, Number(event.target.value))}
          >
            {[10, 20, 50, 100].map((limit) => (
              <option key={limit} value={limit}>
                {limit} / page
              </option>
            ))}
          </select>
          <Button variant="outline" size="icon-sm" onClick={() => onPaginationChange(1, pagination.limit)} disabled={pagination.page <= 1}>
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon-sm" onClick={() => onPaginationChange(pagination.page - 1, pagination.limit)} disabled={pagination.page <= 1}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon-sm" onClick={() => onPaginationChange(pagination.page + 1, pagination.limit)} disabled={pagination.page >= pagination.totalPages}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon-sm" onClick={() => onPaginationChange(pagination.totalPages, pagination.limit)} disabled={pagination.page >= pagination.totalPages}>
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
