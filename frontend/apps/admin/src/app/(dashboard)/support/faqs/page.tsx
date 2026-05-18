"use client";

import { usePermissions } from "@/hooks/use-permissions";
import { DataTable } from "@/components/data-table/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { PageTransition } from "@/lib/animations";
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, HelpCircle } from "lucide-react";
import { Button, Badge } from "@ksu/ui/components";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@ksu/ui/components";
import { faqsApi, queryKeys } from "@ksu/api-client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@ksu/ui";

const getFAQColumns = ({
    onDelete,
}: {
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
                {row.original.answer ? "Has answer" : "No answer"}
            </span>
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
            const faq = row.original;
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
                        <DropdownMenuItem onClick={() => window.location.href = `/support/faqs/${faq.id}`}>
                            Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                            className="text-destructive" 
                            onClick={() => onDelete(faq.id)}
                        >
                            Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
    },
];

export default function FAQsPage() {
    const { canCreate, canDelete } = usePermissions();
    const queryClient = useQueryClient();

    const { data: faqsResponse, isLoading } = useQuery({
        queryKey: queryKeys.faqs.list(),
        queryFn: () => faqsApi.list(),
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => faqsApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.faqs.all });
            toast.success("FAQ deleted successfully");
        },
        onError: () => {
            toast.error("Failed to delete FAQ");
        },
    });

    const handleDelete = (id: string) => {
        if (confirm("Are you sure you want to delete this FAQ?")) {
            deleteMutation.mutate(id);
        }
    };

    const columns = getFAQColumns({ onDelete: handleDelete });

    return (
        <PageTransition>
            <PageHeader
                title="FAQs"
                description="Manage frequently asked questions"
                createHref={canCreate("support") ? "/support/faqs/new" : undefined}
                createLabel="Add FAQ"
            />
            <DataTable
                data={faqsResponse?.data || []}
                columns={columns}
                isLoading={isLoading}
                emptyMessage="No FAQs found. Create your first FAQ."
            />
        </PageTransition>
    );
}