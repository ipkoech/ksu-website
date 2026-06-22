"use client";

import { usePermissions } from "@/hooks/use-permissions";
import { useDeleteConfirm } from "@/hooks/use-delete-confirm";
import { DataTable } from "@/components/data-table/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { PageTransition } from "@/lib/animations";
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Calendar, MapPin } from "lucide-react";
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
import { useAdminEvents, useDeleteEvent } from "@ksu/api-client";
import { toast } from "@ksu/ui";
import { useState } from "react";
import { TableSearch } from "@/components/shared/table-search";

const getEventColumns = ({
    canDelete,
    onDelete,
}: {
    canDelete: boolean;
    onDelete: (id: string) => void;
}): ColumnDef<any>[] => [
    {
        accessorKey: "title",
        header: "Event Title",
        cell: ({ row }) => (
            <div className="flex flex-col">
                <span className="font-medium">{row.original.title}</span>
                <span className="text-xs text-muted-foreground">{row.original.slug}</span>
            </div>
        ),
    },
    {
        accessorKey: "start_date",
        header: "Date",
        cell: ({ row }) => {
            const date = row.original.start_date ? new Date(row.original.start_date) : null;
            return (
                <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{date ? date.toLocaleDateString() : "-"}</span>
                </div>
            );
        },
    },
    {
        accessorKey: "location",
        header: "Location",
        cell: ({ row }) => (
            <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="truncate max-w-[150px]">{row.original.location || "-"}</span>
            </div>
        ),
    },
    {
        accessorKey: "is_published",
        header: "Status",
        cell: ({ row }) => {
            const isPublished = row.original.is_published;
            return (
                <div className="flex gap-1">
                    <Badge variant={isPublished ? "default" : "secondary"}>
                        {isPublished ? "Published" : "Draft"}
                    </Badge>
                    {row.original.is_featured && (
                        <Badge variant="outline">Featured</Badge>
                    )}
                </div>
            );
        },
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const event = row.original;
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
                            <DropdownMenuItem onClick={() => window.location.href = `/content/events/${event.id}`}>
                                Edit
                            </DropdownMenuItem>
                        </DropdownMenuGroup>
                        {canDelete && (
                            <>
                                <DropdownMenuSeparator />
                                <DropdownMenuGroup>
                                    <DropdownMenuItem
                                        className="text-destructive"
                                        onClick={() => onDelete(event.id)}
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

export default function EventsPage() {
    const { canCreate, canDelete } = usePermissions();
    const { confirmDelete, dialog } = useDeleteConfirm();
    const [search, setSearch] = useState("");
    const { data: eventsResponse, isLoading } = useAdminEvents({ search: search || undefined });
    const events = eventsResponse?.data || [];
    const deleteEvent = useDeleteEvent();

    const handleDelete = (id: string) => {
        confirmDelete("event", async () => {
            await deleteEvent.mutateAsync(id);
            toast.success("Event deleted successfully");
        });
    };

    const columns = getEventColumns({ canDelete: canDelete("content"), onDelete: handleDelete });

    return (
        <PageTransition>
            <PageHeader
                title="Events"
                description="Manage university events and calendar"
                createHref={canCreate("content") ? "/content/events/new" : undefined}
                createLabel="Add Event"
            />
            <DataTable
                data={events || []}
                columns={columns}
                isLoading={isLoading}
                toolbar={<TableSearch value={search} onChange={setSearch} placeholder="Search events by title, slug, summary, or location" />}
                emptyMessage={search ? "No events match this search." : "No events found. Create your first event."}
            />
            {dialog}
        </PageTransition>
    );
}
