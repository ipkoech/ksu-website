"use client";

import { usePermissions } from "@/hooks/use-permissions";
import { useDeleteConfirm } from "@/hooks/use-delete-confirm";
import { DataTable } from "@/components/data-table/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { PageTransition } from "@/lib/animations";
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, FileText } from "lucide-react";
import { Button, Badge } from "@ksu/ui/components";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@ksu/ui/components";
import { blogsApi, queryKeys, useAdminBlogs } from "@ksu/api-client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@ksu/ui";
import { useState } from "react";
import { TableSearch } from "@/components/shared/table-search";

const getBlogColumns = ({
  canDelete,
  onDelete,
}: {
  canDelete: boolean;
  onDelete: (id: string) => void;
}): ColumnDef<any>[] => [
  {
    accessorKey: "title",
    header: "Title",
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <FileText className="h-5 w-5 text-primary" />
        </div>
        <span className="font-medium">{row.original.title}</span>
      </div>
    ),
  },
  {
    accessorKey: "author_name",
    header: "Author",
    cell: ({ row }) => row.original.author_name || "-",
  },
  {
    accessorKey: "category",
    header: "Category",
    cell: ({ row }) => row.original.category || "-",
  },
  {
    accessorKey: "is_published",
    header: "Status",
    cell: ({ row }) => (
      <Badge variant={row.original.is_published ? "default" : "secondary"}>
        {row.original.is_published ? "Published" : "Draft"}
      </Badge>
    ),
  },
  {
    accessorKey: "view_count",
    header: "Views",
    cell: ({ row }) => row.original.view_count || 0,
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const blog = row.original;
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
              <DropdownMenuItem
                onClick={() =>
                  (window.location.href = `/content/blogs/${blog.id}`)
                }
              >
                Edit
              </DropdownMenuItem>
            </DropdownMenuGroup>
            {canDelete && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={() => onDelete(blog.id)}
                  >
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

export default function BlogsPage() {
  const { canCreate, canDelete } = usePermissions();
  const { confirmDelete, dialog } = useDeleteConfirm();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");

  const { data: blogsResponse, isLoading } = useAdminBlogs({
    search: search || undefined,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => blogsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.blogs.all });
      toast.success("Story deleted successfully");
    },
    onError: () => {
      toast.error("Failed to delete blog");
    },
  });

  const handleDelete = (id: string) => {
    confirmDelete("blog", () => deleteMutation.mutateAsync(id));
  };

  const columns = getBlogColumns({
    canDelete: canDelete("content"),
    onDelete: handleDelete,
  });

  return (
    <PageTransition>
      <PageHeader
        title="Stories"
        description="Manage university stories"
        createHref={canCreate("content") ? "/content/blogs/new" : undefined}
        createLabel="Add Story"
      />
      <DataTable
        data={blogsResponse?.data || []}
        columns={columns}
        isLoading={isLoading}
        toolbar={
          <TableSearch
            value={search}
            onChange={setSearch}
            placeholder="Search blogs by title, slug, or summary"
          />
        }
        emptyMessage={
          search
            ? "No blogs match this search."
            : "No blogs found. Create your first blog."
        }
      />
      {dialog}
    </PageTransition>
  );
}
