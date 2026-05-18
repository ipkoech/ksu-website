"use client";

import { usePermissions } from "@/hooks/use-permissions";
import { DataTable } from "@/components/data-table/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { PageTransition } from "@/lib/animations";
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, User, GraduationCap } from "lucide-react";
import { Button, Badge } from "@ksu/ui/components";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@ksu/ui/components";
import { usePersons, useDeletePerson } from "@ksu/api-client";
import { toast } from "@ksu/ui";
import Image from "next/image";

const getPersonColumns = ({
    canDelete,
    onDelete,
}: {
    canDelete: boolean;
    onDelete: (id: string) => void;
}): ColumnDef<any>[] => [
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
        accessorKey: "person_type",
        header: "Type",
        cell: ({ row }) => <Badge variant="outline">{row.original.person_type || "-"}</Badge>,
    },
    {
        accessorKey: "academic_rank",
        header: "Rank",
        cell: ({ row }) => row.original.academic_rank || "-",
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
        accessorKey: "publications_count",
        header: "Publications",
        cell: ({ row }) => row.original.publications_count || 0,
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
                            Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigator.clipboard.writeText(person.id)}>
                            Copy ID
                        </DropdownMenuItem>
                        {canDelete && (
                            <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                    className="text-destructive" 
                                    onClick={() => onDelete(person.id)}
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

export default function PersonsPage() {
    const { canCreate, canDelete } = usePermissions();
    const { data: personsResponse, isLoading } = usePersons();
    const persons = personsResponse?.data || [];
    const { mutate: deletePerson } = useDeletePerson();

    const handleDelete = (id: string) => {
        if (confirm("Are you sure you want to delete this person?")) {
            deletePerson(id, {
                onSuccess: () => {
                    toast.success("Person deleted successfully");
                },
                onError: () => {
                    toast.error("Failed to delete person");
                },
            });
        }
    };

    const columns = getPersonColumns({ canDelete: canDelete("people"), onDelete: handleDelete });

    return (
        <PageTransition>
            <PageHeader
                title="Persons"
                description="Manage faculty, staff, and other persons"
                createHref={canCreate("people") ? "/people/persons/new" : undefined}
                createLabel="Add Person"
            />
            <DataTable
                data={persons || []}
                columns={columns}
                isLoading={isLoading}
                emptyMessage="No persons found. Add your first person."
            />
        </PageTransition>
    );
}