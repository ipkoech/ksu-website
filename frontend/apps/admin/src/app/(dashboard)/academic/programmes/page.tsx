"use client";

import { usePermissions } from "@/hooks/use-permissions";
import { useDeleteConfirm } from "@/hooks/use-delete-confirm";
import { DataTable } from "@/components/data-table/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { PageTransition } from "@/lib/animations";
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, GraduationCap, DoorOpen, Upload } from "lucide-react";
import { Button, Badge } from "@ksu/ui/components";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@ksu/ui/components";
import { useProgrammes, useDeleteProgramme } from "@ksu/api-client";
import { toast } from "@ksu/ui";
import Link from "next/link";
import { useState } from "react";
import { TableSearch } from "@/components/shared/table-search";

const getProgrammeColumns = ({
    canDelete,
    onDelete,
}: {
    canDelete: boolean;
    onDelete: (id: string) => void;
}): ColumnDef<any>[] => [
    {
        accessorKey: "name",
        header: "Programme Name",
        cell: ({ row }) => (
            <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <GraduationCap className="h-5 w-5 text-primary" />
                </div>
                <div className="flex flex-col">
                    <span className="font-medium">{row.original.name}</span>
                    <span className="text-xs text-muted-foreground">{row.original.code}</span>
                </div>
            </div>
        ),
    },
    {
        accessorKey: "department_name",
        header: "Department",
        cell: ({ row }) => (
            <div className="flex items-center gap-2">
                <DoorOpen className="h-4 w-4 text-muted-foreground" />
                <span>{row.original.department_name || "-"}</span>
            </div>
        ),
    },
    {
        accessorKey: "level",
        header: "Level",
        cell: ({ row }) => <Badge variant="outline">{row.original.level || "-"}</Badge>,
    },
    {
        accessorKey: "mode_of_study",
        header: "Mode",
        cell: ({ row }) => row.original.mode_of_study || "-",
    },
    {
        accessorKey: "duration",
        header: "Duration",
        cell: ({ row }) => row.original.duration || "-",
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
            const prog = row.original;
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
                        <DropdownMenuItem onClick={() => window.location.href = `/academic/programmes/_static?id=${encodeURIComponent(prog.id)}`}>
                            Edit
                        </DropdownMenuItem>
                        {canDelete && (
                            <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                    className="text-destructive" 
                                    onClick={() => onDelete(prog.id)}
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

export default function ProgrammesPage() {
    const { canCreate, canDelete } = usePermissions();
    const { confirmDelete, dialog } = useDeleteConfirm();
    const [search, setSearch] = useState("");
    const { data: programmesResponse, isLoading } = useProgrammes({ q: search || undefined });
    const programmes = programmesResponse?.data || [];
    const deleteProgramme = useDeleteProgramme();

    const handleDelete = (id: string) => {
        confirmDelete("programme", async () => {
            await deleteProgramme.mutateAsync(id);
            toast.success("Programme deleted successfully");
        });
    };

    const columns = getProgrammeColumns({ canDelete: canDelete("academic"), onDelete: handleDelete });

    return (
        <PageTransition>
            <PageHeader
                title="Programmes"
                description="Manage university programmes and courses"
                actions={canCreate("academic") ? (
                    <Button variant="outline" asChild>
                        <Link href="/imports/programmes">
                            <Upload className="h-4 w-4 mr-2" />
                            Import
                        </Link>
                    </Button>
                ) : undefined}
                createHref={canCreate("academic") ? "/academic/programmes/new" : undefined}
                createLabel="Add Programme"
            />
            <DataTable
                data={programmes || []}
                columns={columns}
                isLoading={isLoading}
                toolbar={<TableSearch value={search} onChange={setSearch} placeholder="Search programmes by name or code" />}
                emptyMessage={search ? "No programmes match this search." : "No programmes found. Create your first programme."}
            />
            {dialog}
        </PageTransition>
    );
}
