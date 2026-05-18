"use client";

import { usePermissions } from "@/hooks/use-permissions";
import { DataTable } from "@/components/data-table/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { PageTransition } from "@/lib/animations";
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Calendar, Clock } from "lucide-react";
import { Button, Badge } from "@ksu/ui/components";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@ksu/ui/components";
import { intakesApi, queryKeys } from "@ksu/api-client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@ksu/ui";

const getIntakeColumns = ({
    onDelete,
}: {
    onDelete: (id: string) => void;
}): ColumnDef<any>[] => [
    {
        accessorKey: "name",
        header: "Intake Name",
        cell: ({ row }) => (
            <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Calendar className="h-5 w-5 text-primary" />
                </div>
                <span className="font-medium">{row.original.name}</span>
            </div>
        ),
    },
    {
        accessorKey: "start_date",
        header: "Start Date",
        cell: ({ row }) => {
            if (!row.original.start_date) return "-";
            const date = new Date(row.original.start_date);
            return date.toLocaleDateString();
        },
    },
    {
        accessorKey: "end_date",
        header: "End Date",
        cell: ({ row }) => {
            if (!row.original.end_date) return "-";
            const date = new Date(row.original.end_date);
            return date.toLocaleDateString();
        },
    },
    {
        accessorKey: "application_deadline",
        header: "Deadline",
        cell: ({ row }) => {
            if (!row.original.application_deadline) return "-";
            const date = new Date(row.original.application_deadline);
            return (
                <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{date.toLocaleDateString()}</span>
                </div>
            );
        },
    },
    {
        accessorKey: "is_open",
        header: "Status",
        cell: ({ row }) => (
            <Badge variant={row.original.is_open ? "default" : "secondary"}>
                {row.original.is_open ? "Open" : "Closed"}
            </Badge>
        ),
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const intake = row.original;
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
                        <DropdownMenuItem onClick={() => window.location.href = `/admissions/intakes/${intake.id}`}>
                            Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                            className="text-destructive" 
                            onClick={() => onDelete(intake.id)}
                        >
                            Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
    },
];

export default function IntakesPage() {
    const { canCreate, canDelete } = usePermissions();
    const queryClient = useQueryClient();

    const { data: intakesResponse, isLoading } = useQuery({
        queryKey: queryKeys.intakes.list(),
        queryFn: () => intakesApi.list(),
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => intakesApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.intakes.all });
            toast.success("Intake deleted successfully");
        },
        onError: () => {
            toast.error("Failed to delete intake");
        },
    });

    const handleDelete = (id: string) => {
        if (confirm("Are you sure you want to delete this intake?")) {
            deleteMutation.mutate(id);
        }
    };

    const columns = getIntakeColumns({ onDelete: handleDelete });

    return (
        <PageTransition>
            <PageHeader
                title="Intakes"
                description="Manage admission intakes"
                createHref={canCreate("admissions") ? "/admissions/intakes/new" : undefined}
                createLabel="Add Intake"
            />
            <DataTable
                data={intakesResponse?.data || []}
                columns={columns}
                isLoading={isLoading}
                emptyMessage="No intakes found. Create your first intake."
            />
        </PageTransition>
    );
}