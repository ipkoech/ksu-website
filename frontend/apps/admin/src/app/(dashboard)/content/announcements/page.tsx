"use client";

import { usePermissions } from "@/hooks/use-permissions";
import { useDeleteConfirm } from "@/hooks/use-delete-confirm";
import { DataTable } from "@/components/data-table/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { PageTransition } from "@/lib/animations";
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Megaphone } from "lucide-react";
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
import { announcementsApi, queryKeys } from "@ksu/api-client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@ksu/ui";
import { useState } from "react";
import { TableSearch } from "@/components/shared/table-search";

const getAnnouncementColumns = ({
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
                    <Megaphone className="h-5 w-5 text-primary" />
                </div>
                <span className="font-medium">{row.original.title}</span>
            </div>
        ),
    },
    {
        accessorKey: "priority",
        header: "Priority",
        cell: ({ row }) => {
            const priority = row.original.priority || "low";
            const colors = {
                high: "bg-red-100 text-red-800",
                medium: "bg-yellow-100 text-yellow-800",
                low: "bg-green-100 text-green-800",
            };
            return (
                <span className={`text-xs font-medium px-2 py-1 rounded ${colors[priority as keyof typeof colors] || colors.low}`}>
                    {priority}
                </span>
            );
        },
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
            <Badge variant={row.original.status === "published" ? "default" : "secondary"}>
                {row.original.status || "draft"}
            </Badge>
        ),
    },
    {
        accessorKey: "created_at",
        header: "Created At",
        cell: ({ row }) => {
            const date = new Date(row.original.created_at);
            return <p>{date.toLocaleDateString()}</p>;
        },
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const announcement = row.original;
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
                            <DropdownMenuItem onClick={() => window.location.href = `/content/announcements/${announcement.id}`}>
                                Edit
                            </DropdownMenuItem>
                        </DropdownMenuGroup>
                        {canDelete && (
                            <>
                                <DropdownMenuSeparator />
                                <DropdownMenuGroup>
                                    <DropdownMenuItem
                                        className="text-destructive"
                                        onClick={() => onDelete(announcement.id)}
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

export default function AnnouncementsPage() {
    const { canCreate, canDelete } = usePermissions();
    const { confirmDelete, dialog } = useDeleteConfirm();
    const queryClient = useQueryClient();
    const [search, setSearch] = useState("");

    const { data: announcementsResponse, isLoading } = useQuery({
        queryKey: queryKeys.announcements.list({ search: search || undefined }),
        queryFn: () => announcementsApi.list({ search: search || undefined }),
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => announcementsApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.announcements.all });
            toast.success("Announcement deleted successfully");
        },
        onError: () => {
            toast.error("Failed to delete announcement");
        },
    });

    const handleDelete = (id: string) => {
        confirmDelete("announcement", () => deleteMutation.mutateAsync(id));
    };

    const columns = getAnnouncementColumns({ canDelete: canDelete("content"), onDelete: handleDelete });

    return (
        <PageTransition>
            <PageHeader
                title="Announcements"
                description="Manage university announcements"
                createHref={canCreate("content") ? "/content/announcements/new" : undefined}
                createLabel="Add Announcement"
            />
            <DataTable
                data={announcementsResponse?.data || []}
                columns={columns}
                isLoading={isLoading}
                toolbar={<TableSearch value={search} onChange={setSearch} placeholder="Search announcements by title, slug, or summary" />}
                emptyMessage={search ? "No announcements match this search." : "No announcements found. Create your first announcement."}
            />
            {dialog}
        </PageTransition>
    );
}
