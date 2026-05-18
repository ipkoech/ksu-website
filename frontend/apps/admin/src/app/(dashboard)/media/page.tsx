"use client";

import { usePermissions } from "@/hooks/use-permissions";
import { DataTable } from "@/components/data-table/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { PageTransition } from "@/lib/animations";
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Image as ImageIcon, FileText, File } from "lucide-react";
import { Button, Badge } from "@ksu/ui/components";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@ksu/ui/components";
import { mediaApi, queryKeys } from "@ksu/api-client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@ksu/ui";
import Image from "next/image";

const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith("image/")) return ImageIcon;
    if (mimeType.startsWith("text/")) return FileText;
    return File;
};

const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

const getMediaColumns = ({
    onDelete,
}: {
    onDelete: (id: string) => void;
}): ColumnDef<any>[] => [
    {
        accessorKey: "filename",
        header: "File",
        cell: ({ row }) => {
            const Icon = getFileIcon(row.original.mime_type);
            return (
                <div className="flex items-center gap-3">
                    <div className="relative h-10 w-10 overflow-hidden rounded bg-muted">
                        {row.original.mime_type.startsWith("image/") && row.original.thumbnail_url ? (
                            <Image
                                src={row.original.thumbnail_url}
                                alt={row.original.filename}
                                fill
                                className="object-cover"
                            />
                        ) : (
                            <div className="flex h-full w-full items-center justify-center">
                                <Icon className="h-5 w-5 text-muted-foreground" />
                            </div>
                        )}
                    </div>
                    <div className="flex flex-col">
                        <span className="font-medium max-w-[200px] truncate">{row.original.filename}</span>
                        <span className="text-xs text-muted-foreground">{row.original.original_filename}</span>
                    </div>
                </div>
            );
        },
    },
    {
        accessorKey: "mime_type",
        header: "Type",
        cell: ({ row }) => <Badge variant="outline">{row.original.mime_type.split("/")[1]}</Badge>,
    },
    {
        accessorKey: "size",
        header: "Size",
        cell: ({ row }) => formatFileSize(row.original.size),
    },
    {
        accessorKey: "alt_text",
        header: "Alt Text",
        cell: ({ row }) => row.original.alt_text || "-",
    },
    {
        accessorKey: "created_at",
        header: "Uploaded",
        cell: ({ row }) => {
            const date = new Date(row.original.created_at);
            return <p>{date.toLocaleDateString()}</p>;
        },
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const media = row.original;
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
                        <DropdownMenuItem onClick={() => window.open(media.url, "_blank")}>
                            View
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigator.clipboard.writeText(media.url)}>
                            Copy URL
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                            className="text-destructive" 
                            onClick={() => onDelete(media.id)}
                        >
                            Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
    },
];

export default function MediaPage() {
    const { canDelete } = usePermissions();
    const queryClient = useQueryClient();

    const { data: mediaResponse, isLoading } = useQuery({
        queryKey: queryKeys.media.list(),
        queryFn: () => mediaApi.list(),
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => mediaApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.media.all });
            toast.success("Media deleted successfully");
        },
        onError: () => {
            toast.error("Failed to delete media");
        },
    });

    const handleDelete = (id: string) => {
        if (confirm("Are you sure you want to delete this file?")) {
            deleteMutation.mutate(id);
        }
    };

    const columns = getMediaColumns({ onDelete: handleDelete });

    return (
        <PageTransition>
            <PageHeader
                title="Media"
                description="Manage uploaded files and images"
            />
            <DataTable
                data={mediaResponse?.data || []}
                columns={columns}
                isLoading={isLoading}
                emptyMessage="No media files found. Upload your first file."
            />
        </PageTransition>
    );
}