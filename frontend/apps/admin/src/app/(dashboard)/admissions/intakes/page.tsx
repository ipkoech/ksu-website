"use client";

import { useState } from "react";
import { usePermissions } from "@/hooks/use-permissions";
import { useDeleteConfirm } from "@/hooks/use-delete-confirm";
import { DataTable } from "@/components/data-table/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { TableSearch } from "@/components/shared/table-search";
import { PageTransition } from "@/lib/animations";
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Calendar, Clock, FilterX, Upload } from "lucide-react";
import { AcademicCalendarPicker } from "@/components/relationships";
import { Button, Badge, Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@ksu/ui/components";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@ksu/ui/components";
import { useDeleteIntake, useIntakes, type Intake } from "@ksu/api-client";
import { toast } from "@ksu/ui";
import Link from "next/link";

const getIntakeColumns = ({
    canDelete,
    onDelete,
}: {
    canDelete: boolean;
    onDelete: (intake: Intake) => void;
}): ColumnDef<Intake>[] => [
    {
        accessorKey: "name",
        header: "Intake Name",
        cell: ({ row }) => (
            <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Calendar className="h-5 w-5 text-primary" />
                </div>
                <span className="font-medium">{row.original.name}</span>
            </div>
        ),
    },
    {
        accessorKey: "application_start",
        header: "Applications Open",
        cell: ({ row }) => {
            if (!row.original.application_start) return "-";
            const date = new Date(row.original.application_start);
            return date.toLocaleDateString();
        },
    },
    {
        accessorKey: "application_end",
        header: "Applications Close",
        cell: ({ row }) => {
            if (!row.original.application_end) return "-";
            const date = new Date(row.original.application_end);
            return date.toLocaleDateString();
        },
    },
    {
        accessorKey: "late_application_end",
        header: "Late Deadline",
        cell: ({ row }) => {
            if (!row.original.late_application_end) return "-";
            const date = new Date(row.original.late_application_end);
            return (
                <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{date.toLocaleDateString()}</span>
                </div>
            );
        },
    },
    {
        accessorKey: "is_open",
        header: "Status",
        cell: ({ row }) => (
            <Badge variant={row.original.is_open ? "default" : "secondary"}>
                {row.original.is_open ? "Open" : "Closed"}
            </Badge>
        ),
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const intake = row.original;
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
                        <DropdownMenuItem onClick={() => window.location.href = `/admissions/intakes/_static?id=${encodeURIComponent(intake.id)}`}>
                            Edit
                        </DropdownMenuItem>
                        {canDelete && (
                            <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    className="text-destructive"
                                    onClick={() => onDelete(intake)}
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

export default function IntakesPage() {
    const { canCreate, canDelete } = usePermissions();
    const { confirmDelete, dialog } = useDeleteConfirm();
    const [academicCalendarId, setAcademicCalendarId] = useState("");
    const [openStatus, setOpenStatus] = useState("all");
    const [search, setSearch] = useState("");
    const intakesQuery = useIntakes({
        academic_calendar_id: academicCalendarId || undefined,
        is_open: openStatus === "all" ? undefined : openStatus === "open",
        fields: "id,name,code,slug,academic_calendar_id,application_start,application_end,late_application_end,is_open,is_active",
    });
    const deleteIntake = useDeleteIntake();

    const handleDelete = (intake: Intake) => {
        confirmDelete(intake.name, async () => {
            await deleteIntake.mutateAsync(intake.id);
            toast.success("Intake deleted successfully");
        });
    };

    const normalizedSearch = search.trim().toLowerCase();
    const rows = (intakesQuery.data?.data || []).filter((item) => {
        if (!normalizedSearch) return true;
        return [item.name, item.code, item.slug].filter(Boolean).some((value) => String(value).toLowerCase().includes(normalizedSearch));
    });
    const columns = getIntakeColumns({ canDelete: canDelete("admissions") || canDelete("academic"), onDelete: handleDelete });
    const hasFilters = Boolean(academicCalendarId) || openStatus !== "all" || Boolean(search);

    return (
        <PageTransition>
            <PageHeader
                title="Intakes"
                description="Manage admission intakes"
                actions={canCreate("admissions") || canCreate("academic") ? (
                    <Button variant="outline" asChild>
                        <Link href="/imports/intakes">
                            <Upload data-icon="inline-start" />
                            Import
                        </Link>
                    </Button>
                ) : undefined}
                createHref={canCreate("admissions") || canCreate("academic") ? "/admissions/intakes/new" : undefined}
                createLabel="Add Intake"
            />
            <DataTable
                data={rows}
                columns={columns}
                isLoading={intakesQuery.isLoading}
                toolbar={(
                    <div className="grid gap-3 rounded-lg border bg-card p-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_180px_auto] md:items-end">
                        <div className="space-y-2">
                            <p className="text-sm font-medium">Search</p>
                            <TableSearch value={search} onChange={setSearch} placeholder="Search intakes" />
                        </div>
                        <AcademicCalendarPicker
                            value={academicCalendarId}
                            onChange={(value) => setAcademicCalendarId(value)}
                            label="Academic Calendar"
                            placeholder="All calendars"
                        />
                        <div className="space-y-2">
                            <p className="text-sm font-medium">Status</p>
                            <Select value={openStatus} onValueChange={setOpenStatus}>
                                <SelectTrigger>
                                    <SelectValue placeholder="All statuses" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectItem value="all">All statuses</SelectItem>
                                        <SelectItem value="open">Open</SelectItem>
                                        <SelectItem value="closed">Closed</SelectItem>
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>
                        <Button
                            type="button"
                            variant="outline"
                            disabled={!hasFilters}
                            onClick={() => {
                                setAcademicCalendarId("");
                                setOpenStatus("all");
                                setSearch("");
                            }}
                        >
                            <FilterX data-icon="inline-start" />
                            Clear
                        </Button>
                    </div>
                )}
                emptyMessage={search ? "No intakes match this search." : "No intakes found. Create your first intake."}
            />
            {dialog}
        </PageTransition>
    );
}
