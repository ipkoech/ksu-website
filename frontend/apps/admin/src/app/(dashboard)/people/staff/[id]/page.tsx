"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle, Badge, Button, Separator } from "@ksu/ui/components";
import { toast } from "@ksu/ui";
import { useStaffAssignment, useUpdateStaffAssignment, useEndStaffAssignment } from "@ksu/api-client";
import { ConfirmDialog } from "@ksu/ui";
import { EditAssignmentDialog } from "@/components/staff/edit-assignment-dialog";
import { Calendar, Building2, User, Briefcase, FileText, Clock } from "lucide-react";

export default function StaffAssignmentDetailPage() {
    const params = useParams();
    const router = useRouter();
    const assignmentId = params.id as string;
    
    const { data, isLoading, refetch } = useStaffAssignment(assignmentId);
    const updateMutation = useUpdateStaffAssignment();
    const endMutation = useEndStaffAssignment();
    
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isEndOpen, setIsEndOpen] = useState(false);

    const assignment = data?.data;

    const handleEnd = async () => {
        try {
            await endMutation.mutateAsync({ id: assignmentId });
            toast.success("Assignment ended successfully");
            refetch();
            setIsEndOpen(false);
        } catch (error) {
            toast.error("Failed to end assignment");
        }
    };

    if (isLoading) {
        return (
            <div className="space-y-6">
                <PageHeader title="Loading..." backHref="/people/staff" />
                <Card><CardContent className="p-6">Loading assignment details...</CardContent></Card>
            </div>
        );
    }

    if (!assignment) {
        return (
            <div className="space-y-6">
                <PageHeader title="Not Found" backHref="/people/staff" />
                <Card><CardContent className="p-6">Assignment not found</CardContent></Card>
            </div>
        );
    }

    const status = assignment.is_acting ? "Acting" : assignment.is_primary ? "Primary" : "Secondary";
    const statusVariant = assignment.is_acting ? "warning" : assignment.is_primary ? "default" : "secondary";

    return (
        <div className="space-y-6">
            <PageHeader 
                title={`${assignment.person?.first_name} ${assignment.person?.last_name}`}
                description={assignment.role_display || assignment.role}
                backHref="/people/staff"
                actions={
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => setIsEditOpen(true)}>Edit</Button>
                        <Button variant="destructive" onClick={() => setIsEndOpen(true)}>End Assignment</Button>
            <ConfirmDialog
                open={isEndOpen}
                onOpenChange={setIsEndOpen}
                title="End Assignment"
                description={`Are you sure you want to end this assignment for ${assignment.person?.first_name} ${assignment.person?.last_name}? This action cannot be undone.`}
                onConfirm={handleEnd}
                isLoading={endMutation.isPending}
            />
                    </div>
                }
            />

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Person Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-3">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">
                                {assignment.person?.title} {assignment.person?.first_name} {assignment.person?.last_name}
                            </span>
                        </div>
                        {assignment.person?.email && (
                            <div className="flex items-center gap-3">
                                <Briefcase className="h-4 w-4 text-muted-foreground" />
                                <span>{assignment.person.email}</span>
                            </div>
                        )}
                        <div className="flex items-center gap-3">
                            <Badge variant={statusVariant}>{status}</Badge>
                            {assignment.is_public && <Badge variant="outline">Public</Badge>}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Position Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-3">
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium capitalize">{assignment.entity_type}</span>
                        </div>
                        {assignment.entity && (
                            <div className="flex items-center gap-3">
                                <Building2 className="h-4 w-4 text-muted-foreground" />
                                <span>{assignment.entity.name}</span>
                            </div>
                        )}
                        <div className="flex items-center gap-3">
                            <Briefcase className="h-4 w-4 text-muted-foreground" />
                            <span>{assignment.role_display || assignment.role}</span>
                        </div>
                        {assignment.title && (
                            <div className="flex items-center gap-3">
                                <Badge variant="outline">{assignment.title}</Badge>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Term Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-3">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>Start: {assignment.start_date ? new Date(assignment.start_date).toLocaleDateString() : "N/A"}</span>
                        </div>
                        {assignment.end_date && (
                            <div className="flex items-center gap-3">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <span>End: {new Date(assignment.end_date).toLocaleDateString()}</span>
                            </div>
                        )}
                        {assignment.term_years && (
                            <div className="flex items-center gap-3">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                <span>{assignment.term_years} year term {assignment.term_renewable ? "(renewable)" : ""}</span>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {assignment.notes && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Notes</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-start gap-3">
                                <FileText className="h-4 w-4 text-muted-foreground mt-1" />
                                <p className="text-sm whitespace-pre-wrap">{assignment.notes}</p>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>

            

            <EditAssignmentDialog
                assignment={assignment}
                open={isEditOpen}
                onOpenChange={setIsEditOpen}
                onSuccess={() => {
                    refetch();
                    setIsEditOpen(false);
                }}
            />
        </div>
    );
}