"use client";

import { usePermissions } from "@/hooks/use-permissions";
import { DataTable } from "@/components/data-table/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { PageTransition } from "@/lib/animations";
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Users, Gavel } from "lucide-react";
import { Button, Badge } from "@ksu/ui/components";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@ksu/ui/components";
import { governanceApi, queryKeys } from "@ksu/api-client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@ksu/ui";

const getBoardColumns = ({
    onDelete,
}: {
    onDelete: (id: string) => void;
}): ColumnDef<any>[] => [
    {
        accessorKey: "name",
        header: "Board Name",
        cell: ({ row }) => (
            <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Gavel className="h-5 w-5 text-primary" />
                </div>
                <span className="font-medium">{row.original.name}</span>
            </div>
        ),
    },
    {
        accessorKey: "board_type",
        header: "Type",
        cell: ({ row }) => {
            const types: Record<string, string> = {
                council: "Council",
                senate: "Senate",
                management_board: "Management Board",
                school_board: "School Board",
                department_board: "Department Board",
                committee: "Committee",
                taskforce: "Taskforce",
            };
            return <Badge variant="outline">{types[row.original.board_type] || row.original.board_type}</Badge>;
        },
    },
    {
        accessorKey: "parent_entity",
        header: "Parent",
        cell: ({ row }) => row.original.parent_entity?.name || "-",
    },
    {
        accessorKey: "current_members",
        header: "Members",
        cell: ({ row }) => (
            <div className="flex items-center gap-1">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span>{row.original.current_members || 0}/{row.original.member_count || "-"}</span>
            </div>
        ),
    },
    {
        accessorKey: "meeting_schedule",
        header: "Schedule",
        cell: ({ row }) => row.original.meeting_schedule || "-",
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
            const board = row.original;
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
                        <DropdownMenuItem onClick={() => window.location.href = `/organization/governance/${board.slug}`}>
                            View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => window.location.href = `/organization/governance/${board.slug}/members`}>
                            Manage Members
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                            className="text-destructive" 
                            onClick={() => onDelete(board.id)}
                        >
                            Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
    },
];

export default function GovernancePage() {
    const { canCreate, canDelete } = usePermissions();
    const queryClient = useQueryClient();

    const { data: boardsResponse, isLoading } = useQuery({
        queryKey: queryKeys.governance.boards(),
        queryFn: () => governanceApi.listBoards(),
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => governanceApi.deleteBoard(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.governance.boards() });
            toast.success("Board deleted successfully");
        },
        onError: () => {
            toast.error("Failed to delete board");
        },
    });

    const handleDelete = (id: string) => {
        if (confirm("Are you sure you want to delete this board?")) {
            deleteMutation.mutate(id);
        }
    };

    const columns = getBoardColumns({ onDelete: handleDelete });

    return (
        <PageTransition>
            <PageHeader
                title="Governance"
                description="Manage university boards and committees"
                createHref={canCreate("governance") ? "/organization/governance/new" : undefined}
                createLabel="Add Board"
            />
            <DataTable
                data={boardsResponse?.data || []}
                columns={columns}
                isLoading={isLoading}
                emptyMessage="No boards found. Create your first board."
            />
        </PageTransition>
    );
}