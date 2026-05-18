import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@ksu/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
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
        accessorKey: "createdAt",
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
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem
                            onClick={() => navigator.clipboard.writeText(news.id)}
                        >
                            Copy news ID
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {canEdit && <DropdownMenuItem>Edit</DropdownMenuItem>}
                        {canDelete && <DropdownMenuItem className="text-destructive" onClick={() => onDelete(news.id)}>Delete</DropdownMenuItem>}
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
    },
];
