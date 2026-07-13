"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { FilterX, Layers3, MoreHorizontal } from "lucide-react";
import {
  Badge,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@ksu/ui/components";
import { DataTable } from "@/components/data-table/data-table";
import { TableSearch } from "@/components/shared/table-search";
import { PageHeader } from "@/components/shared/page-header";
import { usePermissions } from "@/hooks/use-permissions";
import { PageTransition } from "@/lib/animations";
import {
  PAGE_SCOPE_TYPES,
  PAGE_SECTION_STATUSES,
  pageSectionsApi,
  type PageScopeType,
  type PageSection,
  type PageSectionStatus,
} from "@/lib/api/page-cms";

const pageOptions = ["all", "homepage", "about", "research", "library"] as const;

function getColumns(): ColumnDef<PageSection>[] {
  return [
    {
      accessorKey: "title",
      header: "Section",
      cell: ({ row }) => {
        const section = row.original;
        return (
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Layers3 className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="truncate font-medium">{section.title || section.section_key}</p>
              <p className="truncate text-xs text-muted-foreground">
                {section.section_key} · {section.layout_variant}
              </p>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "page_key",
      header: "Page / Scope",
      cell: ({ row }) => (
        <div className="space-y-1 text-sm">
          <p>{row.original.page_key}</p>
          <p className="text-xs text-muted-foreground">
            {row.original.scope_type}
            {row.original.scope_id ? ` · ${row.original.scope_id}` : ""}
          </p>
        </div>
      ),
    },
    {
      accessorKey: "display_order",
      header: "Order",
      cell: ({ row }) => row.original.display_order,
    },
    {
      accessorKey: "items",
      header: "Items",
      cell: ({ row }) => row.original.items?.length ?? 0,
    },
    {
      accessorKey: "status",
      header: "Workflow",
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-2">
          <Badge variant={row.original.status === "published" ? "default" : "secondary"}>
            {row.original.status.replace(/_/g, " ")}
          </Badge>
          <Badge variant="outline">{row.original.is_enabled ? "Enabled" : "Disabled"}</Badge>
        </div>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => (
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
              <DropdownMenuItem asChild>
                <Link href={`/cocms/page-cms/sections/${row.original.id}`}>Edit section</Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];
}

export default function PageCmsSectionsPage() {
  const { hasPermission } = usePermissions();
  const [search, setSearch] = useState("");
  const [pageKey, setPageKey] = useState<(typeof pageOptions)[number]>("all");
  const [scopeType, setScopeType] = useState<"all" | PageScopeType>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | PageSectionStatus>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sections, setSections] = useState<PageSection[]>([]);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await pageSectionsApi.listAdmin({
          page: 1,
          per_page: 100,
          search: search || undefined,
          page_key: pageKey === "all" ? undefined : pageKey,
          scope_type: scopeType === "all" ? undefined : scopeType,
          status: statusFilter === "all" ? undefined : statusFilter,
        });
        if (!cancelled) {
          setSections(response.data ?? []);
        }
      } catch {
        if (!cancelled) {
          setError("Failed to load page sections.");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [pageKey, scopeType, search, statusFilter]);

  const columns = useMemo(() => getColumns(), []);
  const canCreateSections =
    hasPermission("page_sections.create") ||
    hasPermission("page_sections.manage") ||
    hasPermission("homepage.manage") ||
    hasPermission("school_homepage.manage") ||
    hasPermission("research_homepage.manage") ||
    hasPermission("library_homepage.manage");
  const hasFilters = Boolean(search) || pageKey !== "all" || scopeType !== "all" || statusFilter !== "all";

  return (
    <PageTransition>
      <PageHeader
        title="Page Sections"
        description="Manage scoped page sections, section items, media roles, and workflow transitions."
        createHref={canCreateSections ? "/cocms/page-cms/sections/new" : undefined}
        createLabel="New Section"
        backHref="/cocms/page-cms"
      />

      <DataTable
        data={sections}
        columns={columns}
        isLoading={isLoading}
        toolbar={(
          <div className="grid gap-3 rounded-lg border bg-card p-3 lg:grid-cols-[minmax(0,1.3fr)_180px_180px_180px_auto] lg:items-end">
            <div className="space-y-2">
              <p className="text-sm font-medium">Search</p>
              <TableSearch
                value={search}
                onChange={setSearch}
                placeholder="Search sections by title, key, or page"
              />
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Page</p>
              <Select value={pageKey} onValueChange={(value) => setPageKey(value as (typeof pageOptions)[number])}>
                <SelectTrigger>
                  <SelectValue placeholder="All pages" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {pageOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option === "all" ? "All pages" : option}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Scope</p>
              <Select value={scopeType} onValueChange={(value) => setScopeType(value as "all" | PageScopeType)}>
                <SelectTrigger>
                  <SelectValue placeholder="All scopes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="all">All scopes</SelectItem>
                    {PAGE_SCOPE_TYPES.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Status</p>
              <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as "all" | PageSectionStatus)}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="all">All statuses</SelectItem>
                    {PAGE_SECTION_STATUSES.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option.replace(/_/g, " ")}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <Button
              type="button"
              variant="outline"
              disabled={!hasFilters}
              onClick={() => {
                setSearch("");
                setPageKey("all");
                setScopeType("all");
                setStatusFilter("all");
              }}
            >
              <FilterX data-icon="inline-start" />
              Clear
            </Button>
          </div>
        )}
        emptyMessage={error || (search ? "No sections match this search." : "No page sections found.")}
      />
    </PageTransition>
  );
}
