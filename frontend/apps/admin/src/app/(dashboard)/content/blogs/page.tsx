"use client";

import { usePermissions } from "@/hooks/use-permissions";
import { DataTable } from "@/components/data-table/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { PageTransition } from "@/lib/animations";
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, FileText } from "lucide-react";
import { Button, Badge } from "@ksu/ui/components";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@ksu/ui/components";
import { blogsApi, queryKeys } from "@ksu/api-client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@ksu/ui";

const getBlogColumns = ({
    onDelete,
}: {
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
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => window.location.href = `/content/blogs/${blog.id}`}>
                            Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                            className="text-destructive" 
                            onClick={() => onDelete(blog.id)}
                        >
                            Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
    },
];

export default function BlogsPage() {
    const { canCreate, canDelete } = usePermissions();
    const queryClient = useQueryClient();

    const { data: blogsResponse, isLoading } = useQuery({
        queryKey: queryKeys.blogs.list(),
        queryFn: () => blogsApi.list(),
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => blogsApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.blogs.all });
            toast.success("Blog deleted successfully");
        },
        onError: () => {
            toast.error("Failed to delete blog");
        },
    });

    const handleDelete = (id: string) => {
        if (confirm("Are you sure you want to delete this blog?")) {
            deleteMutation.mutate(id);
        }
    };

    const columns = getBlogColumns({ onDelete: handleDelete });

    return (
        <PageTransition>
            <PageHeader
                title="Blogs"
                description="Manage blog posts"
                createHref={canCreate("content") ? "/content/blogs/new" : undefined}
                createLabel="Add Blog"
            />
            <DataTable
                data={blogsResponse?.data || []}
                columns={columns}
                isLoading={isLoading}
                emptyMessage="No blogs found. Create your first blog."
            />
        </PageTransition>
    );
}