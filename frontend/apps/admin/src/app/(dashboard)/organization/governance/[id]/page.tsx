"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle, Badge, Button } from "@ksu/ui/components";
import { toast } from "@ksu/ui";
import { DataTable } from "@/components/data-table/data-table";
import { useBoard, useBoardMembers, useAddBoardMember, useRemoveBoardMember } from "@ksu/api-client";
import { ConfirmDialog } from "@ksu/ui";
import { AddBoardMemberDialog } from "@/components/governance/add-board-member-dialog";
import { Pencil, Trash2, Users, Calendar, FileText } from "lucide-react";

const memberColumns = [
    {
        accessorKey: "person",
        header: "Person",
        cell: ({ row }: any) => {
            const person = row.original.person;
            return person ? `${person.first_name} ${person.last_name}` : "N/A";
        },
    },
    {
        accessorKey: "role",
        header: "Role",
        cell: ({ row }: any) => {
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
        cell: ({ row }: any) => row.original.title || "-",
    },
    {
        accessorKey: "start_date",
        header: "Start Date",
        cell: ({ row }: any) => row.original.start_date 
            ? new Date(row.original.start_date).toLocaleDateString() 
            : "-",
    },
    {
        accessorKey: "term_end_date",
        header: "Term End",
        cell: ({ row }: any) => row.original.term_end_date 
            ? new Date(row.original.term_end_date).toLocaleDateString() 
            : "-",
    },
    {
        id: "actions",
        cell: ({ row }: any) => (
            <div className="flex gap-2">
                <Button variant="ghost" size="icon">
                    <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => row.original.onRemove?.(row.original.id)}>
                    <Trash2 className="h-4 w-4" />
                </Button>
            </div>
        ),
    },
];

export default function BoardDetailPage() {
    const params = useParams();
    const boardSlug = params.id as string;
    
    const { data: boardData, isLoading: boardLoading, refetch: refetchBoard } = useBoard(boardSlug);
    const { data: membersData, isLoading: membersLoading, refetch: refetchMembers } = useBoardMembers(boardSlug);
    
    const addMemberMutation = useAddBoardMember();
    const removeMemberMutation = useRemoveBoardMember();
    
    const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
    const [removingMember, setRemovingMember] = useState<string | null>(null);

    const board = boardData?.data;
    const members = membersData?.data || [];

    const handleRemoveMember = async () => {
        if (!removingMember) return;
        try {
            await removeMemberMutation.mutateAsync({ slug: boardSlug, personId: removingMember });
            toast.success("Member removed");
            refetchMembers();
            setRemovingMember(null);
        } catch (error) {
            toast.error("Failed to remove member");
        }
    };

    if (boardLoading) {
        return (
            <div className="space-y-6">
                <PageHeader title="Loading..." backHref="/organization/governance" />
                <Card><CardContent className="p-6">Loading board details...</CardContent></Card>
            </div>
        );
    }

    if (!board) {
        return (
            <div className="space-y-6">
                <PageHeader title="Not Found" backHref="/organization/governance" />
                <Card><CardContent className="p-6">Board not found</CardContent></Card>
            </div>
        );
    }

    const membersWithActions = members.map((m: any) => ({ ...m, onRemove: setRemovingMember }));

    return (
        <div className="space-y-6">
            <PageHeader 
                title={board.name}
                description={board.board_type}
                backHref="/organization/governance"
                actions={
                    <Button variant="outline" onClick={() => setIsAddMemberOpen(true)}>
                        <Users className="h-4 w-4 mr-2" /> Add Member
                    </Button>
                }
            />

            <div className="grid gap-6 md:grid-cols-3">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <FileText className="h-4 w-4" /> Board Details
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div>
                            <p className="text-sm text-muted-foreground">Type</p>
                            <p className="font-medium capitalize">{board.board_type}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Established</p>
                            <p className="font-medium">
                                {board.establishment_date ? new Date(board.establishment_date).toLocaleDateString() : "N/A"}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Status</p>
                            <Badge variant={board.is_active ? "default" : "secondary"}>
                                {board.is_active ? "Active" : "Inactive"}
                            </Badge>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <Calendar className="h-4 w-4" /> Term Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div>
                            <p className="text-sm text-muted-foreground">Term Duration</p>
                            <p className="font-medium">{board.standard_term_years || 3} years</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Max Terms</p>
                            <p className="font-medium">{board.max_terms || "Unlimited"}</p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <Users className="h-4 w-4" /> Membership
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div>
                            <p className="text-sm text-muted-foreground">Total Members</p>
                            <p className="font-medium text-2xl">{members.length}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Chairperson</p>
                            <p className="font-medium">
                                {board.chairperson 
                                    ? `${board.chairperson.first_name} ${board.chairperson.last_name}`
                                    : "None"}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {board.description && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Description</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="whitespace-pre-wrap">{board.description}</p>
                    </CardContent>
                </Card>
            )}

            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Members</CardTitle>
                </CardHeader>
                <CardContent>
                    {membersLoading ? (
                        <p>Loading members...</p>
                    ) : members.length === 0 ? (
                        <p className="text-muted-foreground">No members yet. Add members to get started.</p>
                    ) : (
                        <DataTable 
                            columns={memberColumns} 
                            data={membersWithActions}
                        />
                    )}
                </CardContent>
            </Card>

            <ConfirmDialog
                open={!!removingMember}
                onOpenChange={() => setRemovingMember(null)}
                title="Remove Member"
                description="Are you sure you want to remove this member from the board? This action cannot be undone."
                onConfirm={handleRemoveMember}
                isLoading={removeMemberMutation.isPending}
            />

            <AddBoardMemberDialog
                boardSlug={boardSlug}
                open={isAddMemberOpen}
                onOpenChange={setIsAddMemberOpen}
                onSuccess={() => {
                    refetchMembers();
                    setIsAddMemberOpen(false);
                }}
            />
        </div>
    );
}