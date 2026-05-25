"use client";

import { useState } from "react";
import { usePermissions } from "@/hooks/use-permissions";
import { DataTable } from "@/components/data-table/data-table";
import { DepartmentPicker, SchoolPicker } from "@/components/relationships";
import { PageHeader } from "@/components/shared/page-header";
import { PageTransition } from "@/lib/animations";
import { ColumnDef } from "@tanstack/react-table";
import { FilterX, MoreHorizontal, User, GraduationCap, Upload, UserPlus } from "lucide-react";
import { Button, Badge, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@ksu/ui/components";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@ksu/ui/components";
import { resolveMainMediaUrl, usePersons, type Person } from "@ksu/api-client";
import Image from "next/image";
import Link from "next/link";

const getStaffColumns = (): ColumnDef<Person>[] => [
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
                        <DropdownMenuItem onClick={() => window.location.href = `/people/persons/_static?id=${encodeURIComponent(person.id)}`}>
                            View Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => window.location.href = `/people/persons/_static/assignments?id=${encodeURIComponent(person.id)}`}>
                            Manage Assignments
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
    const [status, setStatus] = useState<"active" | "inactive" | "deleted" | "all">("active");
    const [schoolId, setSchoolId] = useState("");
    const [departmentId, setDepartmentId] = useState("");
    
    const { data: personsResponse, isLoading } = usePersons({
        search: search || undefined,
        status,
        school_id: schoolId || undefined,
        department_id: departmentId || undefined,
    });

    const columns = getStaffColumns();
    const hasFilters = Boolean(search || schoolId || departmentId || status !== "active");

    return (
        <PageTransition>
            <PageHeader
                title="Staff Directory"
                description="Manage university staff and their positions"
                actions={canCreate("staff") ? (
                    <>
                        <Button variant="outline" asChild>
                            <Link href="/people/persons/new">
                                <UserPlus className="h-4 w-4 mr-2" />
                                Add Staff
                            </Link>
                        </Button>
                        <Button variant="outline" asChild>
                            <Link href="/imports/staff-assignments">
                                <Upload className="h-4 w-4 mr-2" />
                                Import Assignments
                            </Link>
                        </Button>
                    </>
                ) : undefined}
                createHref={canCreate("staff") ? "/people/staff/new" : undefined}
                createLabel="New Assignment"
            />
            
            <DataTable
                data={personsResponse?.data || []}
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
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="inactive">Inactive</SelectItem>
                                    <SelectItem value="deleted">Deleted</SelectItem>
                                    <SelectItem value="all">All</SelectItem>
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
                emptyMessage="No staff members found."
            />
        </PageTransition>
    );
}
