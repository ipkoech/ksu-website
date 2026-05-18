"use client";

import { usePermissions } from "@/hooks/use-permissions";
import { DataTable } from "@/components/data-table/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { PageTransition } from "@/lib/animations";
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Building, Users } from "lucide-react";
import { Button, Badge } from "@ksu/ui/components";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@ksu/ui/components";
import { useSchools, useDeleteSchool } from "@ksu/api-client";
import { toast } from "@ksu/ui";

const getSchoolColumns = ({
    canDelete,
    onDelete,
}: {
    canDelete: boolean;
    onDelete: (id: string) => void;
}): ColumnDef<any>[] => [
    {
        accessorKey: "name",
        header: "School Name",
        cell: ({ row }) => (
            <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Building className="h-5 w-5 text-primary" />
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
        accessorKey: "dean",
        header: "Dean",
        cell: ({ row }) => row.original.dean_name || "-",
    },
    {
        accessorKey: "departments_count",
        header: "Departments",
        cell: ({ row }) => (
            <div className="flex items-center gap-1">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span>{row.original.departments_count || 0}</span>
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
            const school = row.original;
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
                        <DropdownMenuItem onClick={() => window.location.href = `/academic/schools/${school.id}`}>
                            Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigator.clipboard.writeText(school.id)}>
                            Copy ID
                        </DropdownMenuItem>
                        {canDelete && (
                            <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                    className="text-destructive" 
                                    onClick={() => onDelete(school.id)}
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

export default function SchoolsPage() {
    const { canCreate, canDelete } = usePermissions();
    const { data: schoolsResponse, isLoading } = useSchools();
    const schools = schoolsResponse?.data || [];
    const { mutate: deleteSchool } = useDeleteSchool();

    const handleDelete = (id: string) => {
        if (confirm("Are you sure you want to delete this school?")) {
            deleteSchool(id, {
                onSuccess: () => {
                    toast.success("School deleted successfully");
                },
                onError: () => {
                    toast.error("Failed to delete school");
                },
            });
        }
    };

    const columns = getSchoolColumns({ canDelete: canDelete("academic"), onDelete: handleDelete });

    return (
        <PageTransition>
            <PageHeader
                title="Schools"
                description="Manage university schools and faculties"
                createHref={canCreate("academic") ? "/academic/schools/new" : undefined}
                createLabel="Add School"
            />
            <DataTable
                data={schools || []}
                columns={columns}
                isLoading={isLoading}
                emptyMessage="No schools found. Create your first school."
            />
        </PageTransition>
    );
}