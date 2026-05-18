"use client";

import { usePermissions } from "@/hooks/use-permissions";
import { DataTable } from "@/components/data-table/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { PageTransition } from "@/lib/animations";
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Calendar, MapPin } from "lucide-react";
import { Button, Badge } from "@ksu/ui/components";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@ksu/ui/components";
import { useEvents, useDeleteEvent } from "@ksu/api-client";
import { toast } from "@ksu/ui";

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
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => window.location.href = `/content/events/${event.slug}`}>
                            Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigator.clipboard.writeText(event.id)}>
                            Copy ID
                        </DropdownMenuItem>
                        {canDelete && (
                            <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                    className="text-destructive" 
                                    onClick={() => onDelete(event.id)}
                                >
                                    Delete
                                </DropdownMenuItem>
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
    const { data: eventsResponse, isLoading } = useEvents();
    const events = eventsResponse?.data || [];
    const { mutate: deleteEvent } = useDeleteEvent();

    const handleDelete = (id: string) => {
        if (confirm("Are you sure you want to delete this event?")) {
            deleteEvent(id, {
                onSuccess: () => {
                    toast.success("Event deleted successfully");
                },
                onError: () => {
                    toast.error("Failed to delete event");
                },
            });
        }
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
                emptyMessage="No events found. Create your first event."
            />
        </PageTransition>
    );
}