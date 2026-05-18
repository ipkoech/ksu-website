"use client";

import { usePermissions } from "@/hooks/use-permissions";
import { DataTable } from "@/components/data-table/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { PageTransition } from "@/lib/animations";
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Building2 } from "lucide-react";
import { Button, Badge } from "@ksu/ui/components";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@ksu/ui/components";
import { divisionsApi, queryKeys } from "@ksu/api-client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@ksu/ui";

const getDivisionColumns = ({
    onDelete,
}: {
    onDelete: (id: string) => void;
}): ColumnDef<any>[] => [
    {
        accessorKey: "name",
        header: "Division Name",
        cell: ({ row }) => (
            <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Building2 className="h-5 w-5 text-primary" />
                </div>
                <div className="flex flex-col">
                    <span className="font-medium">{row.original.name}</span>
                    <span className="text-xs text-muted-foreground">{row.original.code}</span>
                </div>
            </div>
        ),
    },
    {
        accessorKey: "description",
        header: "Description",
        cell: ({ row }) => (
            <span className="line-clamp-1 max-w-[300px]">
                {row.original.description || "-"}
            </span>
        ),
    },
    {
        accessorKey: "head_name",
        header: "Division Head",
        cell: ({ row }) => row.original.head_name || "-",
    },
    {
        accessorKey: "is_active",
        header: "Status",
        cell: ({ row }) => (
            <Badge variant={row.original.is_active ? "default" : "secondary"}>
                {row.original.is_active ? "Active" : "Inactive"}
            </Badge>
        ),
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const division = row.original;
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
                        <DropdownMenuItem onClick={() => window.location.href = `/organization/divisions/${division.id}`}>
                            Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                            className="text-destructive" 
                            onClick={() => onDelete(division.id)}
                        >
                            Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
    },
];

export default function DivisionsPage() {
    const { canCreate, canDelete } = usePermissions();
    const queryClient = useQueryClient();

    const { data: divisionsResponse, isLoading } = useQuery({
        queryKey: queryKeys.divisions.list(),
        queryFn: () => divisionsApi.list(),
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => divisionsApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.divisions.all });
            toast.success("Division deleted successfully");
        },
        onError: () => {
            toast.error("Failed to delete division");
        },
    });

    const handleDelete = (id: string) => {
        if (confirm("Are you sure you want to delete this division?")) {
            deleteMutation.mutate(id);
        }
    };

    const columns = getDivisionColumns({ onDelete: handleDelete });

    return (
        <PageTransition>
            <PageHeader
                title="Divisions"
                description="Manage university organizational divisions"
                createHref={canCreate("organization") ? "/organization/divisions/new" : undefined}
                createLabel="Add Division"
            />
            <DataTable
                data={divisionsResponse?.data || []}
                columns={columns}
                isLoading={isLoading}
                emptyMessage="No divisions found. Create your first division."
            />
        </PageTransition>
    );
}