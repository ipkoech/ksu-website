"use client";

import { motion } from "framer-motion";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@ksu/ui/table"; // Assuming this path
import { DataTablePagination } from "./pagination"; // Local component
import { cn } from "@ksu/ui/lib/utils";
import React from "react";

interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  toolbar?: React.ReactNode;
  isLoading?: boolean;
  emptyMessage?: string;
  emptyAction?: React.ReactNode;
}

// Placeholder for TableRowSkeleton
function TableRowSkeleton({ columns }: { columns: number }) {
  return (
    <TableRow>
      <TableCell colSpan={columns} className="h-24 text-center">
        <div className="flex items-center justify-center space-x-4 animate-pulse">
          <div className="space-y-2">
            <div className="h-4 w-[250px] rounded-full bg-muted"></div>
            <div className="h-4 w-[200px] rounded-full bg-muted"></div>
          </div>
        </div>
      </TableCell>
    </TableRow>
  );
}

export function DataTable<T>({
  data,
  columns,
  toolbar,
  isLoading,
  emptyMessage,
  emptyAction,
}: DataTableProps<T>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div className="space-y-4">
      {toolbar}
      <div
        className="overflow-x-auto rounded-lg border border-border bg-card"
        aria-busy={isLoading}
      >
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRowSkeleton columns={columns.length} />
            ) : table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row, index) => (
                <motion.tr
                  key={row.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.02 }}
                  className="border-b border-border hover:bg-muted/50 transition-colors"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </motion.tr>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-32 text-center"
                >
                  <div className="flex flex-col items-center justify-center gap-3 text-muted-foreground">
                    <p>{emptyMessage || "No results found."}</p>
                    {emptyAction}
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} />
    </div>
  );
}
