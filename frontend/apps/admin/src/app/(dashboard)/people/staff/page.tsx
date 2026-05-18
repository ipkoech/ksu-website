"use client";

import { useState } from "react";
import { usePermissions } from "@/hooks/use-permissions";
import { DataTable } from "@/components/data-table/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { PageTransition } from "@/lib/animations";
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, User, GraduationCap, Building2 } from "lucide-react";
import { Button, Badge, Input } from "@ksu/ui/components";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@ksu/ui/components";
import { usePersons } from "@ksu/api-client";
import { toast } from "@ksu/ui";
import Image from "next/image";

const getStaffColumns = (): ColumnDef<any>[] => [
    {
        accessorKey: "name",
        header: "Name",
        cell: ({ row }) => {
            const firstName = row.original.first_name || "";
            const lastName = row.original.last_name || "";
            const title = row.original.title || "";
            const fullName = [title, firstName, lastName].filter(Boolean).join(" ");
            
            return (
                <div className="flex items-center gap-3">
                    <div className="relative h-10 w-10 overflow-hidden rounded-full bg-muted">
                        {row.original.photo_url ? (
                            <Image
                                src={row.original.photo_url}
                                alt={fullName}
                                fill
                                className="object-cover"
                            />
                        ) : (
                            <div className="flex h-full w-full items-center justify-center">
                                <User className="h-5 w-5 text-muted-foreground" />
                            </div>
                        )}
                    </div>
                    <div className="flex flex-col">
                        <span className="font-medium">{fullName}</span>
                        <span className="text-xs text-muted-foreground">{row.original.email}</span>
                    </div>
                </div>
            );
        },
    },
    {
        accessorKey: "employee_number",
        header: "Employee #",
        cell: ({ row }) => row.original.employee_number || "-",
    },
    {
        accessorKey: "academic_rank",
        header: "Rank",
        cell: ({ row }) => row.original.academic_rank ? (
            <Badge variant="outline">{row.original.academic_rank}</Badge>
        ) : "-",
    },
    {
        accessorKey: "department_name",
        header: "Department",
        cell: ({ row }) => (
            <div className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-muted-foreground" />
                <span>{row.original.department_name || "-"}</span>
            </div>
        ),
    },
    {
        accessorKey: "employment_type",
        header: "Type",
        cell: ({ row }) => row.original.employment_type || "-",
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
            const person = row.original;
            const fullName = [person.title, person.first_name, person.last_name].filter(Boolean).join(" ");
            
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
                        <DropdownMenuItem onClick={() => window.location.href = `/people/persons/${person.id}`}>
                            View Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => window.location.href = `/people/persons/${person.id}/assignments`}>
                            Manage Assignments
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => navigator.clipboard.writeText(person.id)}>
                            Copy ID
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
    },
];

export default function StaffDirectoryPage() {
    const { canCreate } = usePermissions();
    const [search, setSearch] = useState("");
    
    const { data: personsResponse, isLoading } = usePersons({
        search: search || undefined,
    });

    const columns = getStaffColumns();

    return (
        <PageTransition>
            <PageHeader
                title="Staff Directory"
                description="Manage university staff and their positions"
                createHref={canCreate("staff") ? "/people/persons/new" : undefined}
                createLabel="Add Staff"
            />
            
            <div className="mb-4">
                <Input
                    placeholder="Search by name, email, employee number..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="max-w-md"
                />
            </div>

            <DataTable
                data={personsResponse?.data || []}
                columns={columns}
                isLoading={isLoading}
                emptyMessage="No staff members found."
            />
        </PageTransition>
    );
}