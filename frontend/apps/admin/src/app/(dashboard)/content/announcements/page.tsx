"use client";

import { usePermissions } from "@/hooks/use-permissions";
import { DataTable } from "@/components/data-table/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { PageTransition } from "@/lib/animations";
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Megaphone } from "lucide-react";
import { Button, Badge } from "@ksu/ui/components";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@ksu/ui/components";
import { announcementsApi, queryKeys } from "@ksu/api-client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@ksu/ui";

const getAnnouncementColumns = ({
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
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => window.location.href = `/content/announcements/${announcement.id}`}>
                            Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                            className="text-destructive" 
                            onClick={() => onDelete(announcement.id)}
                        >
                            Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
    },
];

export default function AnnouncementsPage() {
    const { canCreate, canDelete } = usePermissions();
    const queryClient = useQueryClient();

    const { data: announcementsResponse, isLoading } = useQuery({
        queryKey: queryKeys.announcements.list(),
        queryFn: () => announcementsApi.list(),
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
        if (confirm("Are you sure you want to delete this announcement?")) {
            deleteMutation.mutate(id);
        }
    };

    const columns = getAnnouncementColumns({ onDelete: handleDelete });

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
                emptyMessage="No announcements found. Create your first announcement."
            />
        </PageTransition>
    );
}