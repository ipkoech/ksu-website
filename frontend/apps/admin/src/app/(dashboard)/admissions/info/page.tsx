"use client";

import { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { FileText, FilterX, MoreHorizontal, School } from "lucide-react";
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
import { useAdminAdmissionInfoList, useDeleteAdmissionInfo, type AdmissionInfo } from "@ksu/api-client";
import { DataTable } from "@/components/data-table/data-table";
import { SchoolPicker } from "@/components/relationships";
import { PageHeader } from "@/components/shared/page-header";
import { TableSearch } from "@/components/shared/table-search";
import { useDeleteConfirm } from "@/hooks/use-delete-confirm";
import { usePermissions } from "@/hooks/use-permissions";
import { PageTransition } from "@/lib/animations";

const contentTypes = [
  "all",
  "general",
  "how_to_apply",
  "application_procedure",
  "requirements",
  "entry_requirements",
  "application",
  "fees",
  "fee_information",
  "scholarships",
  "financial_aid",
  "international",
  "international_students",
  "undergraduate",
  "postgraduate",
  "bridging_application",
  "graduation",
  "booklet",
  "brochure",
  "transfer",
];

const getColumns = ({
  canDelete,
  onDelete,
}: {
  canDelete: boolean;
  onDelete: (item: AdmissionInfo) => void;
}): ColumnDef<AdmissionInfo>[] => [
  {
    accessorKey: "title",
    header: "Title",
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <FileText className="h-5 w-5 text-primary" />
        </div>
        <div className="min-w-0">
          <p className="truncate font-medium">{row.original.title}</p>
          <p className="truncate text-xs text-muted-foreground">{row.original.slug}</p>
        </div>
      </div>
    ),
  },
  {
    accessorKey: "content_type",
    header: "Type",
    cell: ({ row }) => <Badge variant="outline">{row.original.content_type?.replace(/_/g, " ") || "general"}</Badge>,
  },
  {
    accessorKey: "audience_levels",
    header: "Audience",
    cell: ({ row }) => row.original.audience_levels?.length ? row.original.audience_levels.join(", ") : "All",
  },
  {
    accessorKey: "school_id",
    header: "Scope",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <School className="h-4 w-4 text-muted-foreground" />
        <span>{row.original.school_id ? "School specific" : "Institution-wide"}</span>
      </div>
    ),
  },
  {
    accessorKey: "is_published",
    header: "Status",
    cell: ({ row }) => <Badge variant={row.original.is_published ? "default" : "secondary"}>{row.original.is_published ? "Published" : "Draft"}</Badge>,
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const item = row.original;
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
              <DropdownMenuItem onClick={() => window.location.href = `/admissions/info/_static?id=${encodeURIComponent(item.id)}`}>
                Edit
              </DropdownMenuItem>
            </DropdownMenuGroup>
            {canDelete ? (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem className="text-destructive" onClick={() => onDelete(item)}>
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

export default function AdmissionInfoPage() {
  const { canCreate, canDelete } = usePermissions();
  const { confirmDelete, dialog } = useDeleteConfirm();
  const [contentType, setContentType] = useState("all");
  const [publishStatus, setPublishStatus] = useState("all");
  const [schoolId, setSchoolId] = useState("");
  const [search, setSearch] = useState("");
  const admissionsQuery = useAdminAdmissionInfoList({
    content_type: contentType === "all" ? undefined : contentType,
    is_published: publishStatus === "all" ? undefined : publishStatus === "published",
    school_id: schoolId || undefined,
    fields: "id,title,slug,content_type,audience_levels,school_id,is_published,display_order",
  });
  const deleteAdmissionInfo = useDeleteAdmissionInfo();
  const normalizedSearch = search.trim().toLowerCase();
  const items = (admissionsQuery.data?.data ?? []).filter((item) => {
    if (!normalizedSearch) return true;
    return [item.title, item.slug, item.content_type, item.summary]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(normalizedSearch));
  });

  const handleDelete = (item: AdmissionInfo) => {
    confirmDelete(item.title, async () => {
      await deleteAdmissionInfo.mutateAsync(item.id);
      toast.success("Admission information deleted successfully");
    });
  };

  const columns = getColumns({ canDelete: canDelete("academic") || canDelete("admissions"), onDelete: handleDelete });
  const hasFilters = contentType !== "all" || publishStatus !== "all" || Boolean(schoolId) || Boolean(search);

  return (
    <PageTransition>
      <PageHeader
        title="Admission Information"
        description="Manage admission pages, requirements, fees, and supporting documents"
        createHref={canCreate("academic") || canCreate("admissions") ? "/admissions/info/new" : undefined}
        createLabel="Add Information"
      />
      <DataTable
        data={items}
        columns={columns}
        isLoading={admissionsQuery.isLoading}
        toolbar={(
          <div className="grid gap-3 rounded-lg border bg-card p-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_180px_160px_auto] md:items-end">
            <div className="space-y-2">
              <p className="text-sm font-medium">Search</p>
              <TableSearch value={search} onChange={setSearch} placeholder="Search admissions content" />
            </div>
            <SchoolPicker
              value={schoolId}
              onChange={(value) => setSchoolId(value)}
              label="School"
              placeholder="All schools"
            />
            <div className="space-y-2">
              <p className="text-sm font-medium">Type</p>
              <Select value={contentType} onValueChange={setContentType}>
                <SelectTrigger>
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {contentTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type === "all" ? "All types" : type.replace(/_/g, " ")}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Status</p>
              <Select value={publishStatus} onValueChange={setPublishStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="all">All statuses</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <Button
              type="button"
              variant="outline"
              disabled={!hasFilters}
              onClick={() => {
                setContentType("all");
                setPublishStatus("all");
                setSchoolId("");
                setSearch("");
              }}
            >
              <FilterX data-icon="inline-start" />
              Clear
            </Button>
          </div>
        )}
        emptyMessage={search ? "No admission information matches this search." : "No admission information found. Create the first admissions page."}
      />
      {dialog}
    </PageTransition>
  );
}
