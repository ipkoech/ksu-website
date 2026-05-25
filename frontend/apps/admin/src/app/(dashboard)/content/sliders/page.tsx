"use client";

import { useState } from "react";
import { usePermissions } from "@/hooks/use-permissions";
import { DataTable } from "@/components/data-table/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { PageTransition } from "@/lib/animations";
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Layers, MapPin } from "lucide-react";
import { Button, Badge, ConfirmDialog } from "@ksu/ui/components";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@ksu/ui/components";
import { useDeleteSliderGroup, useSliderGroups } from "@ksu/api-client";
import type { SliderGroup } from "@ksu/api-client";
import { toast } from "@ksu/ui";
import { TableSearch } from "@/components/shared/table-search";

const getSliderGroupColumns = ({
    canDelete,
    onDelete,
}: {
    canDelete: boolean;
    onDelete: (group: SliderGroup) => void;
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
        accessorKey: "location",
        header: "Location",
        cell: ({ row }) => (
            <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{row.original.location || "-"}</span>
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
                        {canDelete && (
                            <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-destructive" onClick={() => onDelete(group)}>
                                    Delete Group
                                </DropdownMenuItem>
                            </>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
    },
];

export default function SlidersPage() {
    const { canCreate, canDelete } = usePermissions();
    const deleteSliderGroup = useDeleteSliderGroup();
    const [deleteTarget, setDeleteTarget] = useState<SliderGroup | null>(null);
    const [search, setSearch] = useState("");

    const { data: groupsResponse, isLoading } = useSliderGroups();
    const normalizedSearch = search.trim().toLowerCase();
    const rows = (groupsResponse?.data || []).filter((group) => {
        if (!normalizedSearch) return true;
        return [group.name, group.slug, group.description, group.location]
            .filter(Boolean)
            .some((value) => String(value).toLowerCase().includes(normalizedSearch));
    });

    const handleDelete = async () => {
        if (!deleteTarget) return;
        try {
            await deleteSliderGroup.mutateAsync(deleteTarget.id);
            toast.success("Slider group deleted successfully");
            setDeleteTarget(null);
        } catch {
            toast.error("Failed to delete slider group");
        }
    };

    const columns = getSliderGroupColumns({ canDelete: canDelete("marketing"), onDelete: setDeleteTarget });

    return (
        <PageTransition>
            <PageHeader
                title="Sliders"
                description="Manage homepage sliders and banners"
                createHref={canCreate("marketing") ? "/content/slider-groups/new" : undefined}
                createLabel="Add Slider Group"
            />
            <DataTable
                data={rows}
                columns={columns}
                isLoading={isLoading}
                toolbar={<TableSearch value={search} onChange={setSearch} placeholder="Search slider groups" />}
                emptyMessage={search ? "No slider groups match this search." : "No slider groups found. Create your first slider group."}
            />
            <ConfirmDialog
                open={!!deleteTarget}
                onOpenChange={(open) => {
                    if (!open) setDeleteTarget(null);
                }}
                title="Delete slider group?"
                description={`This will remove "${deleteTarget?.name ?? "this slider group"}" and its slides from the back office.`}
                variant="destructive"
                confirmLabel="Delete"
                onConfirm={handleDelete}
                isLoading={deleteSliderGroup.isPending}
            />
        </PageTransition>
    );
}
