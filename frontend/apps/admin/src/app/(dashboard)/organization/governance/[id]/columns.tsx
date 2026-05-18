"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge, Button } from "@ksu/ui";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";

export const columns: ColumnDef<any>[] = [
    {
        accessorKey: "person",
        header: "Person",
        cell: ({ row }) => {
            const person = row.original.person;
            return person ? `${person.first_name} ${person.last_name}` : "N/A";
        },
    },
    {
        accessorKey: "role",
        header: "Role",
        cell: ({ row }) => {
            const roleLabels: Record<string, string> = {
                chairperson: "Chairperson",
                vice_chairperson: "Vice Chairperson",
                secretary: "Secretary",
                treasurer: "Treasurer",
                member: "Member",
                observer: "Observer",
            };
            return <Badge variant="outline">{roleLabels[row.original.role] || row.original.role}</Badge>;
        },
    },
    {
        accessorKey: "title",
        header: "Title",
        cell: ({ row }) => row.original.title || "-",
    },
    {
        accessorKey: "start_date",
        header: "Start Date",
        cell: ({ row }) => row.original.start_date 
            ? new Date(row.original.start_date).toLocaleDateString() 
            : "-",
    },
    {
        accessorKey: "term_end_date",
        header: "Term End",
        cell: ({ row }) => row.original.term_end_date 
            ? new Date(row.original.term_end_date).toLocaleDateString() 
            : "-",
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const statuses = [];
            if (row.original.is_acting) statuses.push("Acting");
            if (row.original.is_ex_officio) statuses.push("Ex-Officio");
            if (row.original.is_active === false) return <Badge variant="secondary">Inactive</Badge>;
            return statuses.length > 0 
                ? statuses.map(s => <Badge key={s} variant="outline" className="mr-1">{s}</Badge>)
                : <Badge>Active</Badge>;
        },
    },
];