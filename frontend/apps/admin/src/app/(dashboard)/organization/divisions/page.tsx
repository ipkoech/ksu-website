"use client";

import * as React from "react";
import Link from "next/link";
import { ColumnDef } from "@tanstack/react-table";
import { Building2, MoreHorizontal, Upload } from "lucide-react";
import { toast } from "@ksu/ui";
import {
  Badge,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@ksu/ui/components";
import { useDeleteDivision, useDivisions, type Division } from "@ksu/api-client";
import { DataTable } from "@/components/data-table/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { TableSearch } from "@/components/shared/table-search";
import { PageTransition } from "@/lib/animations";
import { useDeleteConfirm } from "@/hooks/use-delete-confirm";
import { usePermissions } from "@/hooks/use-permissions";

const listFields = [
  "id",
  "name",
  "code",
  "slug",
  "division_type",
  "description",
  "head_id",
  "head_name",
  "is_public",
  "is_active",
  "display_order",
].join(",");

const divisionTypeLabels: Record<string, string> = {
  division: "Division",
  directorate: "Directorate",
  office: "Office",
  unit: "Unit",
};

function editHref(id: string) {
  return `/organization/divisions/_static?id=${encodeURIComponent(id)}`;
}

function getDivisionColumns({
  canDelete,
  onDelete,
}: {
  canDelete: boolean;
  onDelete: (division: Division) => void;
}): ColumnDef<Division>[] {
  return [
    {
      accessorKey: "name",
      header: "Division",
      cell: ({ row }) => (
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <Building2 className="h-5 w-5 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="truncate font-medium">{row.original.name}</p>
            <p className="text-xs text-muted-foreground">{row.original.code}</p>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "division_type",
      header: "Type",
      cell: ({ row }) => {
        const type = row.original.division_type || "division";
        return <Badge variant="outline">{divisionTypeLabels[type] ?? type.replace(/_/g, " ")}</Badge>;
      },
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => (
        <span className="line-clamp-1 max-w-[340px] text-sm text-muted-foreground">
          {row.original.description || "-"}
        </span>
      ),
    },
    {
      accessorKey: "head_id",
      header: "Head",
      cell: ({ row }) => row.original.head_name || (row.original.head_id ? "Assigned" : "Not assigned"),
    },
    {
      accessorKey: "is_active",
      header: "Status",
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-2">
          <Badge variant={row.original.is_active ? "default" : "secondary"}>
            {row.original.is_active ? "Active" : "Inactive"}
          </Badge>
          {row.original.is_public ? <Badge variant="outline">Public</Badge> : null}
        </div>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const division = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal data-icon />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={() => { window.location.href = editHref(division.id); }}>
                  Edit
                </DropdownMenuItem>
              </DropdownMenuGroup>
              {canDelete ? (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem className="text-destructive" onClick={() => onDelete(division)}>
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </>
              ) : null}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
}

export default function DivisionsPage() {
  const { canCreate, canDelete } = usePermissions();
  const { confirmDelete, dialog } = useDeleteConfirm();
  const [status, setStatus] = React.useState<"active" | "inactive" | "all">("active");
  const [search, setSearch] = React.useState("");
  const params = React.useMemo(
    () => ({
      is_active: status === "all" ? undefined : status === "active",
      per_page: 100,
      fields: listFields,
    }),
    [status],
  );

  const divisionsQuery = useDivisions(params);
  const deleteDivision = useDeleteDivision();
  const normalizedSearch = search.trim().toLowerCase();
  const rows = (divisionsQuery.data?.data ?? []).filter((division) => {
    if (!normalizedSearch) return true;
    return [division.name, division.code, division.slug, division.division_type, division.description, division.head_name]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(normalizedSearch));
  });

  const handleDelete = React.useCallback(
    (division: Division) => {
      confirmDelete(division.name, async () => {
        await deleteDivision.mutateAsync(division.id);
        toast.success("Division deleted");
      });
    },
    [confirmDelete, deleteDivision],
  );

  const columns = React.useMemo(
    () => getDivisionColumns({ canDelete: canDelete("organization"), onDelete: handleDelete }),
    [canDelete, handleDelete],
  );

  return (
    <PageTransition>
      <PageHeader
        title="Divisions"
        description="Manage university organizational divisions, heads, public content, and visibility."
        actions={
          <div className="flex flex-wrap gap-2">
            <Select value={status} onValueChange={(value) => setStatus(value as typeof status)}>
              <SelectTrigger className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="all">All</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            {canCreate("organization") || canCreate("governance") ? (
              <Button variant="outline" asChild>
                <Link href="/imports/divisions">
                  <Upload data-icon="inline-start" />
                  Import
                </Link>
              </Button>
            ) : null}
          </div>
        }
        createHref={canCreate("organization") ? "/organization/divisions/new" : undefined}
        createLabel="Add Division"
      />
      <DataTable
        data={rows}
        columns={columns}
        isLoading={divisionsQuery.isLoading}
        toolbar={<TableSearch value={search} onChange={setSearch} placeholder="Search divisions" />}
        emptyMessage={search ? "No divisions match this search." : "No divisions found."}
      />
      {dialog}
    </PageTransition>
  );
}
