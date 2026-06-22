"use client";

import { usePermissions } from "@/hooks/use-permissions";
import { DataTable } from "@/components/data-table/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { PageTransition } from "@/lib/animations";
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, HelpCircle, Upload } from "lucide-react";
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
import { useDeleteFAQ, useFAQs } from "@ksu/api-client";
import { toast } from "@ksu/ui";
import Link from "next/link";
import { useDeleteConfirm } from "@/hooks/use-delete-confirm";
import { useState } from "react";
import { TableSearch } from "@/components/shared/table-search";

const getFAQColumns = ({
    canDelete,
    onDelete,
}: {
    canDelete: boolean;
    onDelete: (id: string) => void;
}): ColumnDef<any>[] => [
    {
        accessorKey: "question",
        header: "Question",
        cell: ({ row }) => (
            <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <HelpCircle className="h-5 w-5 text-primary" />
                </div>
                <span className="font-medium line-clamp-1 max-w-[300px]">{row.original.question}</span>
            </div>
        ),
    },
    {
        accessorKey: "category",
        header: "Category",
        cell: ({ row }) => row.original.category || "-",
    },
    {
        accessorKey: "answer",
        header: "Answer",
        cell: ({ row }) => (
            <span className="line-clamp-1 max-w-[300px]">
                {row.original.answer_plain_text || row.original.answer_rich_text || row.original.answer ? "Has answer" : "No answer"}
            </span>
        ),
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
            <Badge variant={row.original.status === "published" ? "default" : "secondary"}>
                {row.original.status || "draft"}
            </Badge>
        ),
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const faq = row.original;
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
                            <DropdownMenuItem onClick={() => window.location.href = `/support/faqs/${faq.id}`}>
                                Edit
                            </DropdownMenuItem>
                        </DropdownMenuGroup>
                        {canDelete && (
                            <>
                                <DropdownMenuSeparator />
                                <DropdownMenuGroup>
                                    <DropdownMenuItem className="text-destructive" onClick={() => onDelete(faq.id)}>
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

export default function FAQsPage() {
    const { canCreate, canDelete } = usePermissions();
    const deleteFAQ = useDeleteFAQ();
    const { confirmDelete, dialog } = useDeleteConfirm();
    const [search, setSearch] = useState("");

    const { data: faqsResponse, isLoading } = useFAQs();
    const normalizedSearch = search.trim().toLowerCase();
    const rows = (faqsResponse?.data || []).filter((faq) => {
        if (!normalizedSearch) return true;
        return [faq.question, faq.category, faq.answer_plain_text, faq.answer_rich_text, faq.answer]
            .filter(Boolean)
            .some((value) => String(value).toLowerCase().includes(normalizedSearch));
    });

    const handleDelete = (id: string) => {
        confirmDelete("FAQ", async () => {
            try {
                await deleteFAQ.mutateAsync(id);
                toast.success("FAQ deleted successfully");
            } catch {
                toast.error("Failed to delete FAQ");
            }
        });
    };

    const columns = getFAQColumns({ canDelete: canDelete("support"), onDelete: handleDelete });

    return (
        <PageTransition>
            <PageHeader
                title="FAQs"
                description="Manage frequently asked questions"
                actions={canCreate("support") ? (
                    <Button variant="outline" asChild>
                        <Link href="/imports/faqs">
                            <Upload data-icon="inline-start" />
                            Import
                        </Link>
                    </Button>
                ) : undefined}
                createHref={canCreate("support") ? "/support/faqs/new" : undefined}
                createLabel="Add FAQ"
            />
            <DataTable
                data={rows}
                columns={columns}
                isLoading={isLoading}
                toolbar={<TableSearch value={search} onChange={setSearch} placeholder="Search FAQs" />}
                emptyMessage={search ? "No FAQs match this search." : "No FAQs found. Create your first FAQ."}
            />
            {dialog}
        </PageTransition>
    );
}
