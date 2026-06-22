"use client";

import { usePermissions } from "@/hooks/use-permissions";
import { useDeleteConfirm } from "@/hooks/use-delete-confirm";
import { DataTable } from "@/components/data-table/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { PageTransition } from "@/lib/animations";
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Building, Users, Upload } from "lucide-react";
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
import { useSchools, useDeleteSchool } from "@ksu/api-client";
import { toast } from "@ksu/ui";
import Link from "next/link";
import { useState } from "react";
import { TableSearch } from "@/components/shared/table-search";

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
                        <Button variant="ghost" size="icon-sm">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal data-icon />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuGroup>
                            <DropdownMenuItem onClick={() => window.location.href = `/academic/schools/_static?id=${encodeURIComponent(school.id)}`}>
                                Edit
                            </DropdownMenuItem>
                        </DropdownMenuGroup>
                        {canDelete && (
                            <>
                                <DropdownMenuSeparator />
                                <DropdownMenuGroup>
                                    <DropdownMenuItem
                                        className="text-destructive"
                                        onClick={() => onDelete(school.id)}
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

export default function SchoolsPage() {
    const { canCreate, canDelete } = usePermissions();
    const { confirmDelete, dialog } = useDeleteConfirm();
    const [search, setSearch] = useState("");
    const { data: schoolsResponse, isLoading } = useSchools({ search: search || undefined });
    const schools = schoolsResponse?.data || [];
    const deleteSchool = useDeleteSchool();

    const handleDelete = (id: string) => {
        confirmDelete("school", async () => {
            await deleteSchool.mutateAsync(id);
            toast.success("School deleted successfully");
        });
    };

    const columns = getSchoolColumns({ canDelete: canDelete("academic"), onDelete: handleDelete });

    return (
        <PageTransition>
            <PageHeader
                title="Schools"
                description="Manage university schools and faculties"
                actions={canCreate("academic") ? (
                    <Button variant="outline" asChild>
                        <Link href="/imports/schools">
                            <Upload data-icon="inline-start" />
                            Import
                        </Link>
                    </Button>
                ) : undefined}
                createHref={canCreate("academic") ? "/academic/schools/new" : undefined}
                createLabel="Add School"
            />
            <DataTable
                data={schools || []}
                columns={columns}
                isLoading={isLoading}
                toolbar={<TableSearch value={search} onChange={setSearch} placeholder="Search schools by name or code" />}
                emptyMessage={search ? "No schools match this search." : "No schools found. Create your first school."}
            />
            {dialog}
        </PageTransition>
    );
}
