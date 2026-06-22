"use client";

import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Gavel, MoreHorizontal, Users } from "lucide-react";
import { toast } from "@ksu/ui";
import {
  Badge,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@ksu/ui/components";
import { useBoards, useDeleteBoard, type Board } from "@ksu/api-client";
import { DataTable } from "@/components/data-table/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { TableSearch } from "@/components/shared/table-search";
import { PageTransition } from "@/lib/animations";
import { useDeleteConfirm } from "@/hooks/use-delete-confirm";
import { usePermissions } from "@/hooks/use-permissions";

const boardListFields = [
  "id",
  "name",
  "slug",
  "board_type",
  "parent_entity_type",
  "parent_entity_id",
  "member_count",
  "current_members",
  "meeting_schedule",
  "is_public",
  "is_active",
  "status",
  "display_order",
].join(",");

const boardTypeLabels: Record<string, string> = {
  council: "Council",
  senate: "Senate",
  management_board: "Management Board",
  school_board: "School Board",
  department_board: "Department Board",
  board: "Board",
  committee: "Committee",
  taskforce: "Taskforce",
};

function editHref(id: string) {
  return `/organization/governance/_static?id=${encodeURIComponent(id)}`;
}

function formatBoardType(value?: string | null) {
  if (!value) return "Board";
  return boardTypeLabels[value] ?? value.replace(/_/g, " ");
}

function formatParent(board: Board) {
  if (board.parent_entity?.name) return board.parent_entity.name;
  if (!board.parent_entity_type) return "University";
  return board.parent_entity_type.replace(/_/g, " ");
}

function getBoardColumns({
  canDelete,
  onDelete,
}: {
  canDelete: boolean;
  onDelete: (board: Board) => void;
}): ColumnDef<Board>[] {
  return [
    {
      accessorKey: "name",
      header: "Board",
      cell: ({ row }) => (
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <Gavel className="h-5 w-5 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="truncate font-medium">{row.original.name}</p>
            <p className="text-xs text-muted-foreground">{row.original.slug}</p>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "board_type",
      header: "Type",
      cell: ({ row }) => <Badge variant="outline">{formatBoardType(row.original.board_type)}</Badge>,
    },
    {
      accessorKey: "parent_entity",
      header: "Parent",
      cell: ({ row }) => <span className="capitalize">{formatParent(row.original)}</span>,
    },
    {
      accessorKey: "current_members",
      header: "Members",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-muted-foreground" />
          <span>{row.original.current_members ?? 0}{row.original.member_count ? `/${row.original.member_count}` : ""}</span>
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
        <div className="flex flex-wrap gap-2">
          <Badge variant={row.original.is_active ? "default" : "secondary"}>
            {row.original.is_active ? "Active" : "Inactive"}
          </Badge>
          <Badge variant="outline">{row.original.status}</Badge>
          {row.original.is_public ? <Badge variant="outline">Public</Badge> : null}
        </div>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const board = row.original;
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
                <DropdownMenuItem onClick={() => { window.location.href = editHref(board.id); }}>
                  Open
                </DropdownMenuItem>
              </DropdownMenuGroup>
              {canDelete ? (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem className="text-destructive" onClick={() => onDelete(board)}>
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </>
              ) : null}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
}

export default function GovernancePage() {
  const { canCreate, canDelete } = usePermissions();
  const { confirmDelete, dialog } = useDeleteConfirm();
  const [boardType, setBoardType] = React.useState("all");
  const [search, setSearch] = React.useState("");
  const params = React.useMemo(
    () => ({
      board_type: boardType === "all" ? undefined : boardType,
      fields: boardListFields,
    }),
    [boardType],
  );
  const boardsQuery = useBoards(params);
  const deleteBoard = useDeleteBoard();
  const normalizedSearch = search.trim().toLowerCase();
  const rows = (boardsQuery.data?.data ?? []).filter((board) => {
    if (!normalizedSearch) return true;
    return [board.name, board.slug, board.board_type, board.status, board.meeting_schedule, formatParent(board)]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(normalizedSearch));
  });

  const handleDelete = React.useCallback(
    (board: Board) => {
      confirmDelete(board.name, async () => {
        await deleteBoard.mutateAsync(board.id);
        toast.success("Board deleted");
      });
    },
    [confirmDelete, deleteBoard],
  );

  const columns = React.useMemo(
    () => getBoardColumns({ canDelete: canDelete("governance"), onDelete: handleDelete }),
    [canDelete, handleDelete],
  );

  return (
    <PageTransition>
      <PageHeader
        title="Governance"
        description="Manage governance boards, committees, parent relationships, and member assignments."
        actions={
          <Select value={boardType} onValueChange={setBoardType}>
            <SelectTrigger className="w-[190px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="all">All boards</SelectItem>
                <SelectItem value="council">Council</SelectItem>
                <SelectItem value="senate">Senate</SelectItem>
                <SelectItem value="management_board">Management Board</SelectItem>
                <SelectItem value="school_board">School Board</SelectItem>
                <SelectItem value="department_board">Department Board</SelectItem>
                <SelectItem value="committee">Committee</SelectItem>
                <SelectItem value="taskforce">Taskforce</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        }
        createHref={canCreate("governance") ? "/organization/governance/new" : undefined}
        createLabel="Add Board"
      />
      <DataTable
        data={rows}
        columns={columns}
        isLoading={boardsQuery.isLoading}
        toolbar={<TableSearch value={search} onChange={setSearch} placeholder="Search governance boards" />}
        emptyMessage={search ? "No boards match this search." : "No boards found."}
      />
      {dialog}
    </PageTransition>
  );
}
