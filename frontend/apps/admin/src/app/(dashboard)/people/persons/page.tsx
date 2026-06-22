"use client";

import { usePermissions } from "@/hooks/use-permissions";
import { DataTable } from "@/components/data-table/data-table";
import { DepartmentPicker, SchoolPicker } from "@/components/relationships";
import { PageHeader } from "@/components/shared/page-header";
import { PageTransition } from "@/lib/animations";
import { ColumnDef } from "@tanstack/react-table";
import { FilterX, MoreHorizontal, User, GraduationCap, Upload } from "lucide-react";
import { Button, Badge, ConfirmDialog, Input, Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@ksu/ui/components";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@ksu/ui/components";
import { resolveMainMediaUrl, useActivatePerson, useDeactivatePerson, useDeletePerson, usePersons, type Person } from "@ksu/api-client";
import { toast } from "@ksu/ui";
import Image from "next/image";
import { useState } from "react";
import Link from "next/link";

interface ConfirmState {
    title: string;
    description: string;
    confirmLabel: string;
    variant?: "default" | "destructive";
    onConfirm: () => Promise<void>;
}

const getPersonColumns = ({
    canWrite,
    canDelete,
    onDelete,
    onActivate,
    onDeactivate,
}: {
    canWrite: boolean;
    canDelete: boolean;
    onDelete: (person: Person) => void;
    onActivate: (person: Person) => void;
    onDeactivate: (person: Person) => void;
}): ColumnDef<Person>[] => [
    {
        accessorKey: "name",
        header: "Name",
        cell: ({ row }) => {
            const firstName = row.original.first_name || "";
            const lastName = row.original.last_name || "";
            const title = row.original.title || "";
            const fullName = [title, firstName, lastName].filter(Boolean).join(" ");
            const photoUrl = resolveMainMediaUrl(row.original.photo_url);
            
            return (
                <div className="flex items-center gap-3">
                    <div className="relative h-10 w-10 overflow-hidden rounded-full bg-muted">
                        {photoUrl ? (
                            <Image
                                src={photoUrl}
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
        accessorKey: "employment_type",
        header: "Employment",
        cell: ({ row }) => <Badge variant="outline">{row.original.employment_type?.replace(/_/g, " ") || "-"}</Badge>,
    },
    {
        accessorKey: "academic_rank",
        header: "Rank",
        cell: ({ row }) => row.original.academic_rank || "-",
    },
    {
        accessorKey: "department_name",
        header: "Department",
        cell: ({ row }) => {
            const departmentName = row.original.department?.name || row.original.department_name || "-";
            return (
                <div className="flex items-center gap-2">
                    <GraduationCap className="h-4 w-4 text-muted-foreground" />
                    <span>{departmentName}</span>
                </div>
            );
        },
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
                            <DropdownMenuItem onClick={() => window.location.href = `/people/persons/_static?id=${encodeURIComponent(person.id)}`}>
                                {canWrite ? "Edit" : "View Profile"}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => window.location.href = `/people/persons/_static/assignments?id=${encodeURIComponent(person.id)}`}>
                                Manage Assignments
                            </DropdownMenuItem>
                            {canWrite ? (
                                <DropdownMenuItem onClick={() => person.is_active ? onDeactivate(person) : onActivate(person)}>
                                    {person.is_active ? "Deactivate" : "Activate"}
                                </DropdownMenuItem>
                            ) : null}
                        </DropdownMenuGroup>
                        {canDelete && (
                            <>
                                <DropdownMenuSeparator />
                                <DropdownMenuGroup>
                                    <DropdownMenuItem className="text-destructive" onClick={() => onDelete(person)}>
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

export default function PersonsPage() {
    const { canCreate, canDelete, canEdit } = usePermissions();
    const [status, setStatus] = useState<"active" | "inactive" | "deleted" | "all">("active");
    const [search, setSearch] = useState("");
    const [schoolId, setSchoolId] = useState("");
    const [departmentId, setDepartmentId] = useState("");
    const { data: personsResponse, isLoading } = usePersons({
        status,
        search: search || undefined,
        school_id: schoolId || undefined,
        department_id: departmentId || undefined,
    });
    const deletePerson = useDeletePerson();
    const activatePerson = useActivatePerson();
    const deactivatePerson = useDeactivatePerson();
    const [confirmState, setConfirmState] = useState<ConfirmState | null>(null);
    const [confirmLoading, setConfirmLoading] = useState(false);
    const persons = personsResponse?.data || [];

    const handleDelete = (person: Person) => {
        const name = person.full_name || [person.first_name, person.last_name].filter(Boolean).join(" ") || "this person";
        setConfirmState({
            title: "Delete person?",
            description: `This will soft delete ${name} and remove them from active staff workflows where deletion is allowed.`,
            confirmLabel: "Delete person",
            variant: "destructive",
            onConfirm: async () => {
                await deletePerson.mutateAsync(person.id);
                toast.success("Person deleted successfully");
            },
        });
    };

    const handleActivate = (person: Person) => {
        const name = person.full_name || [person.first_name, person.last_name].filter(Boolean).join(" ") || "this person";
        setConfirmState({
            title: "Activate person?",
            description: `This will mark ${name} as active again.`,
            confirmLabel: "Activate",
            onConfirm: async () => {
                await activatePerson.mutateAsync(person.id);
                toast.success("Person activated");
            },
        });
    };

    const handleDeactivate = (person: Person) => {
        const name = person.full_name || [person.first_name, person.last_name].filter(Boolean).join(" ") || "this person";
        setConfirmState({
            title: "Deactivate person?",
            description: `This will mark ${name} inactive and end active assignments according to the backend lifecycle rules.`,
            confirmLabel: "Deactivate",
            variant: "destructive",
            onConfirm: async () => {
                await deactivatePerson.mutateAsync(person.id);
                toast.success("Person deactivated");
            },
        });
    };

    const columns = getPersonColumns({
        canWrite: canEdit("staff") || canEdit("persons"),
        canDelete: canDelete("staff") || canDelete("persons"),
        onDelete: handleDelete,
        onActivate: handleActivate,
        onDeactivate: handleDeactivate,
    });
    const hasFilters = Boolean(search || schoolId || departmentId || status !== "active");

    return (
        <PageTransition>
            <PageHeader
                title="Persons"
                description="Manage faculty, staff, and other persons"
                actions={canCreate("staff") ? (
                    <Button variant="outline" asChild>
                        <Link href="/imports/persons">
                            <Upload data-icon="inline-start" />
                            Import
                        </Link>
                    </Button>
                ) : undefined}
                createHref={canCreate("staff") || canCreate("persons") ? "/people/persons/new" : undefined}
                createLabel="Add Person"
            />
            <DataTable
                data={persons || []}
                columns={columns}
                isLoading={isLoading}
                toolbar={(
                    <div className="grid gap-3 rounded-lg border bg-card p-3 md:grid-cols-[minmax(220px,1fr)_minmax(220px,1fr)_minmax(220px,1fr)_160px_auto] md:items-end">
                        <div className="space-y-2">
                            <p className="text-sm font-medium">Search</p>
                            <Input
                                placeholder="Name, email, employee #, department, or school"
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                            />
                        </div>
                        <SchoolPicker
                            value={schoolId}
                            onChange={(value) => {
                                setSchoolId(value);
                                setDepartmentId("");
                            }}
                            label="School"
                            placeholder="All schools"
                        />
                        <DepartmentPicker
                            value={departmentId}
                            onChange={(value) => setDepartmentId(value)}
                            filters={schoolId ? { school_id: schoolId } : undefined}
                            label="Department"
                            placeholder={schoolId ? "All departments" : "Any department"}
                        />
                        <div className="space-y-2">
                            <p className="text-sm font-medium">Status</p>
                            <Select value={status} onValueChange={(value) => setStatus(value as typeof status)}>
                                <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="inactive">Inactive</SelectItem>
                                        <SelectItem value="deleted">Deleted</SelectItem>
                                        <SelectItem value="all">All</SelectItem>
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>
                        <Button
                            type="button"
                            variant="outline"
                            disabled={!hasFilters}
                            onClick={() => {
                                setSearch("");
                                setStatus("active");
                                setSchoolId("");
                                setDepartmentId("");
                            }}
                        >
                            <FilterX className="h-4 w-4" />
                            Clear
                        </Button>
                    </div>
                )}
                emptyMessage="No persons found. Add your first person."
            />
            <ConfirmDialog
                open={!!confirmState}
                onOpenChange={(open) => !open && setConfirmState(null)}
                title={confirmState?.title}
                description={confirmState?.description}
                confirmLabel={confirmState?.confirmLabel}
                variant={confirmState?.variant}
                isLoading={confirmLoading}
                onConfirm={async () => {
                    if (!confirmState) return;
                    setConfirmLoading(true);
                    try {
                        await confirmState.onConfirm();
                        setConfirmState(null);
                    } catch (error) {
                        toast.error(error instanceof Error ? error.message : "Action failed");
                    } finally {
                        setConfirmLoading(false);
                    }
                }}
            />
        </PageTransition>
    );
}
