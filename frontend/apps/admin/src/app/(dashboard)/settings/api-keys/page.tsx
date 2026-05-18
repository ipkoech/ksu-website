"use client";

import { usePermissions } from "@/hooks/use-permissions";
import { DataTable } from "@/components/data-table/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { PageTransition } from "@/lib/animations";
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, KeyRound } from "lucide-react";
import { Button, Badge } from "@ksu/ui/components";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@ksu/ui/components";
import { apiKeysApi, queryKeys } from "@ksu/api-client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@ksu/ui";

const getApiKeyColumns = ({
    onDelete,
}: {
    onDelete: (id: string) => void;
}): ColumnDef<any>[] => [
    {
        accessorKey: "name",
        header: "Name",
        cell: ({ row }) => (
            <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <KeyRound className="h-5 w-5 text-primary" />
                </div>
                <span className="font-medium">{row.original.name}</span>
            </div>
        ),
    },
    {
        accessorKey: "key_prefix",
        header: "Key Prefix",
        cell: ({ row }) => (
            <code className="text-xs bg-muted px-2 py-1 rounded">
                {row.original.key_prefix}...
            </code>
        ),
    },
    {
        accessorKey: "permissions",
        header: "Permissions",
        cell: ({ row }) => (
            <div className="flex flex-wrap gap-1">
                {(row.original.permissions || []).slice(0, 2).map((p: string) => (
                    <Badge key={p} variant="outline" className="text-xs">{p}</Badge>
                ))}
                {(row.original.permissions || []).length > 2 && (
                    <Badge variant="outline" className="text-xs">+{(row.original.permissions || []).length - 2}</Badge>
                )}
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
        accessorKey: "last_used_at",
        header: "Last Used",
        cell: ({ row }) => {
            if (!row.original.last_used_at) return "Never";
            const date = new Date(row.original.last_used_at);
            return date.toLocaleDateString();
        },
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const apiKey = row.original;
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
                        <DropdownMenuItem onClick={() => window.location.href = `/system/settings/api-keys/${apiKey.id}`}>
                            Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleRegenerate(apiKey.id)}>
                            Regenerate
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                            className="text-destructive" 
                            onClick={() => onDelete(apiKey.id)}
                        >
                            Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
    },
];

function handleRegenerate(id: string) {
    if (confirm("Are you sure you want to regenerate this API key? The old key will be invalidated.")) {
        // Handle regenerate
    }
}

export default function ApiKeysPage() {
    const { canCreate, canDelete } = usePermissions();
    const queryClient = useQueryClient();

    const { data: apiKeysResponse, isLoading } = useQuery({
        queryKey: queryKeys.apiKeys.list(),
        queryFn: () => apiKeysApi.list(),
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => apiKeysApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.apiKeys.all });
            toast.success("API key deleted successfully");
        },
        onError: () => {
            toast.error("Failed to delete API key");
        },
    });

    const regenerateMutation = useMutation({
        mutationFn: (id: string) => apiKeysApi.regenerate(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.apiKeys.all });
            toast.success("API key regenerated successfully");
        },
        onError: () => {
            toast.error("Failed to regenerate API key");
        },
    });

    const handleDelete = (id: string) => {
        if (confirm("Are you sure you want to delete this API key?")) {
            deleteMutation.mutate(id);
        }
    };

    const columns = getApiKeyColumns({ onDelete: handleDelete });

    return (
        <PageTransition>
            <PageHeader
                title="API Keys"
                description="Manage API access keys"
                createHref={canCreate("system") ? "/system/settings/api-keys/new" : undefined}
                createLabel="Create API Key"
            />
            <DataTable
                data={apiKeysResponse?.data || []}
                columns={columns}
                isLoading={isLoading}
                emptyMessage="No API keys found. Create your first API key."
            />
        </PageTransition>
    );
}