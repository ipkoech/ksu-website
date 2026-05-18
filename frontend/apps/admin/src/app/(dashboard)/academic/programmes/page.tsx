"use client";

import { usePermissions } from "@/hooks/use-permissions";
import { DataTable } from "@/components/data-table/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { PageTransition } from "@/lib/animations";
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, GraduationCap, DoorOpen } from "lucide-react";
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
                        <DropdownMenuItem onClick={() => window.location.href = `/academic/programmes/${prog.id}`}>
                            Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigator.clipboard.writeText(prog.id)}>
                            Copy ID
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
    const { data: programmesResponse, isLoading } = useProgrammes();
    const programmes = programmesResponse?.data || [];
    const { mutate: deleteProgramme } = useDeleteProgramme();

    const handleDelete = (id: string) => {
        if (confirm("Are you sure you want to delete this programme?")) {
            deleteProgramme(id, {
                onSuccess: () => {
                    toast.success("Programme deleted successfully");
                },
                onError: () => {
                    toast.error("Failed to delete programme");
                },
            });
        }
    };

    const columns = getProgrammeColumns({ canDelete: canDelete("academic"), onDelete: handleDelete });

    return (
        <PageTransition>
            <PageHeader
                title="Programmes"
                description="Manage university programmes and courses"
                createHref={canCreate("academic") ? "/academic/programmes/new" : undefined}
                createLabel="Add Programme"
            />
            <DataTable
                data={programmes || []}
                columns={columns}
                isLoading={isLoading}
                emptyMessage="No programmes found. Create your first programme."
            />
        </PageTransition>
    );
}