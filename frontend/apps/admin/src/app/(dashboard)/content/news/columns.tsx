import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@ksu/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@ksu/ui/dropdown-menu";
import type { News } from "@ksu/api-client/main";

interface GetNewsColumnsProps {
    canEdit: boolean;
    canDelete: boolean;
    onDelete: (id: string) => void;
}

export const getNewsColumns = ({ canEdit, canDelete, onDelete }: GetNewsColumnsProps): ColumnDef<News>[] => [
    {
        accessorKey: "title",
        header: "Title",
    },
    {
        accessorKey: "status",
        header: "Status",
    },
    {
        accessorKey: "created_at",
        header: "Created At",
        cell: ({ row }) => {
            const date = new Date(row.original.created_at);
            return <p>{date.toLocaleDateString()}</p>;
        },
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const news = row.original;

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
                        {canEdit && (
                            <DropdownMenuGroup>
                                <DropdownMenuItem onClick={() => window.location.href = `/content/news/${news.id}`}>
                                    Edit
                                </DropdownMenuItem>
                            </DropdownMenuGroup>
                        )}
                        {canEdit && canDelete ? <DropdownMenuSeparator /> : null}
                        {canDelete ? (
                            <DropdownMenuGroup>
                                <DropdownMenuItem className="text-destructive" onClick={() => onDelete(news.id)}>Delete</DropdownMenuItem>
                            </DropdownMenuGroup>
                        ) : null}
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
    },
];
