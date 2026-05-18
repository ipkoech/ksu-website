"use client";

import { usePermissions } from "@/hooks/use-permissions";
import { DataTable } from "@/components/data-table/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { PageTransition } from "@/lib/animations";
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, DoorOpen, Building } from "lucide-react";
import { Button, Badge } from "@ksu/ui/components";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@ksu/ui/components";
import { useDepartments, useDeleteDepartment } from "@ksu/api-client";
import { toast } from "@ksu/ui";

const getDepartmentColumns = ({
    canDelete,
    onDelete,
}: {
    canDelete: boolean;
    onDelete: (id: string) => void;
}): ColumnDef<any>[] => [
    {
        accessorKey: "name",
        header: "Department Name",
        cell: ({ row }) => (
            <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <DoorOpen className="h-5 w-5 text-primary" />
                </div>
                <div className="flex flex-col">
                    <span className="font-medium">{row.original.name}</span>
                    <span className="text-xs text-muted-foreground">{row.original.code}</span>
                </div>
            </div>
        ),
    },
    {
        accessorKey: "school_name",
        header: "School",
        cell: ({ row }) => (
            <div className="flex items-center gap-2">
                <Building className="h-4 w-4 text-muted-foreground" />
                <span>{row.original.school_name || "-"}</span>
            </div>
        ),
    },
    {
        accessorKey: "about",
        header: "Description",
        cell: ({ row }) => (
            <span className="line-clamp-1 max-w-[300px]">
                {row.original.about || "-"}
            </span>
        ),
    },
    {
        accessorKey: "hod_name",
        header: "HOD",
        cell: ({ row }) => row.original.hod_name || "-",
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
            const dept = row.original;
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
                        <DropdownMenuItem onClick={() => window.location.href = `/academic/departments/${dept.id}`}>
                            Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigator.clipboard.writeText(dept.id)}>
                            Copy ID
                        </DropdownMenuItem>
                        {canDelete && (
                            <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                    className="text-destructive" 
                                    onClick={() => onDelete(dept.id)}
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

export default function DepartmentsPage() {
    const { canCreate, canDelete } = usePermissions();
    const { data: departmentsResponse, isLoading } = useDepartments();
    const departments = departmentsResponse?.data || [];
    const { mutate: deleteDepartment } = useDeleteDepartment();

    const handleDelete = (id: string) => {
        if (confirm("Are you sure you want to delete this department?")) {
            deleteDepartment(id, {
                onSuccess: () => {
                    toast.success("Department deleted successfully");
                },
                onError: () => {
                    toast.error("Failed to delete department");
                },
            });
        }
    };

    const columns = getDepartmentColumns({ canDelete: canDelete("academic"), onDelete: handleDelete });

    return (
        <PageTransition>
            <PageHeader
                title="Departments"
                description="Manage university departments"
                createHref={canCreate("academic") ? "/academic/departments/new" : undefined}
                createLabel="Add Department"
            />
            <DataTable
                data={departments || []}
                columns={columns}
                isLoading={isLoading}
                emptyMessage="No departments found. Create your first department."
            />
        </PageTransition>
    );
}