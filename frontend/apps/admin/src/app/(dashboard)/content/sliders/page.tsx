"use client";

import { usePermissions } from "@/hooks/use-permissions";
import { DataTable } from "@/components/data-table/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { PageTransition } from "@/lib/animations";
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Layers, Image as ImageIcon } from "lucide-react";
import { Button, Badge } from "@ksu/ui/components";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@ksu/ui/components";
import { slidersApi, queryKeys } from "@ksu/api-client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@ksu/ui";
import Image from "next/image";

const getSliderGroupColumns = ({
    onDelete,
}: {
    onDelete: (id: string) => void;
}): ColumnDef<any>[] => [
    {
        accessorKey: "name",
        header: "Group Name",
        cell: ({ row }) => (
            <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Layers className="h-5 w-5 text-primary" />
                </div>
                <span className="font-medium">{row.original.name}</span>
            </div>
        ),
    },
    {
        accessorKey: "slug",
        header: "Slug",
        cell: ({ row }) => row.original.slug || "-",
    },
    {
        accessorKey: "description",
        header: "Description",
        cell: ({ row }) => row.original.description || "-",
    },
    {
        accessorKey: "sliders_count",
        header: "Sliders",
        cell: ({ row }) => (
            <div className="flex items-center gap-1">
                <ImageIcon className="h-4 w-4 text-muted-foreground" />
                <span>{row.original.sliders_count || 0}</span>
            </div>
        ),
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
            const group = row.original;
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
                        <DropdownMenuItem onClick={() => window.location.href = `/content/sliders/${group.id}`}>
                            Manage Sliders
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => window.location.href = `/content/slider-groups/${group.id}`}>
                            Edit Group
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                            className="text-destructive" 
                            onClick={() => onDelete(group.id)}
                        >
                            Delete Group
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
    },
];

export default function SlidersPage() {
    const { canCreate, canDelete } = usePermissions();
    const queryClient = useQueryClient();

    const { data: groupsResponse, isLoading } = useQuery({
        queryKey: queryKeys.sliders.groupList(),
        queryFn: () => slidersApi.listGroups(),
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => slidersApi.deleteGroup(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.sliders.groups });
            toast.success("Slider group deleted successfully");
        },
        onError: () => {
            toast.error("Failed to delete slider group");
        },
    });

    const handleDelete = (id: string) => {
        if (confirm("Are you sure you want to delete this slider group?")) {
            deleteMutation.mutate(id);
        }
    };

    const columns = getSliderGroupColumns({ onDelete: handleDelete });

    return (
        <PageTransition>
            <PageHeader
                title="Sliders"
                description="Manage homepage sliders and banners"
                createHref={canCreate("marketing") ? "/content/slider-groups/new" : undefined}
                createLabel="Add Slider Group"
            />
            <DataTable
                data={groupsResponse?.data || []}
                columns={columns}
                isLoading={isLoading}
                emptyMessage="No slider groups found. Create your first slider group."
            />
        </PageTransition>
    );
}