"use client";

import { useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { Briefcase, Building2, Calendar, Clock, FileText, RefreshCw, User } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { StaffAssignmentEditor } from "@/components/staff/staff-assignment-editor";
import { usePermissions } from "@/hooks/use-permissions";
import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from "@ksu/ui/components";
import { useStaffAssignment } from "@ksu/api-client";
import type { StaffAssignment } from "@ksu/api-client";

function formatDate(value?: string | null) {
  return value ? new Date(value).toLocaleDateString() : "Not set";
}

function formatAssignmentEntity(assignment: StaffAssignment) {
  return assignment.entity?.name || assignment.entity_type.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default function StaffAssignmentDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const routeId = params.id as string;
  const assignmentId = routeId === "_static" ? searchParams.get("id") || "" : routeId;
  const { data, isLoading, refetch } = useStaffAssignment(assignmentId, { enabled: Boolean(assignmentId) });
  const { canEdit } = usePermissions();
  const canWriteStaff = canEdit("staff");
  const [editorOpen, setEditorOpen] = useState(false);
  const [editorMode, setEditorMode] = useState<"edit" | "reassign">("edit");

  const assignment = data?.data;

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

  const personName = assignment.person?.full_name || [assignment.person?.title, assignment.person?.first_name, assignment.person?.last_name].filter(Boolean).join(" ");

  return (
    <div className="space-y-6">
      <PageHeader
        title={personName || "Staff Assignment"}
        description={assignment.role_display || assignment.title || assignment.role}
        backHref="/people/staff"
        actions={canWriteStaff ? (
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => { setEditorMode("edit"); setEditorOpen(true); }}>Edit</Button>
            <Button variant="outline" onClick={() => { setEditorMode("reassign"); setEditorOpen(true); }}>
              <RefreshCw data-icon="inline-start" />
              Reassign
            </Button>
          </div>
        ) : undefined}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Assignment Summary</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="flex items-center gap-3">
              <User className="h-4 w-4 text-muted-foreground" />
              <span>{personName || "Unknown staff member"}</span>
            </div>
            <div className="flex items-center gap-3">
              <Briefcase className="h-4 w-4 text-muted-foreground" />
              <span>{assignment.title || assignment.role_display || assignment.role}</span>
            </div>
            <div className="flex items-center gap-3">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <span>{formatAssignmentEntity(assignment)}</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={assignment.status === "active" ? "default" : "secondary"}>{assignment.status}</Badge>
              {assignment.is_primary ? <Badge variant="outline">Primary</Badge> : null}
              {assignment.is_acting ? <Badge variant="warning">Acting</Badge> : null}
              {assignment.is_public ? <Badge variant="outline">Public</Badge> : null}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Term</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>Start: {formatDate(assignment.start_date)}</span>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>End: {formatDate(assignment.end_date)}</span>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>{assignment.term_years ? `${assignment.term_years} year term` : "No fixed term"}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="text-base">Notes</CardTitle>
          </CardHeader>
          <CardContent>
            {assignment.notes ? (
              <div className="flex items-start gap-3">
                <FileText className="mt-1 h-4 w-4 text-muted-foreground" />
                <p className="whitespace-pre-wrap text-sm">{assignment.notes}</p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No assignment notes.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <StaffAssignmentEditor
        open={editorOpen}
        onOpenChange={setEditorOpen}
        mode={editorMode}
        assignment={assignment}
        onSuccess={() => refetch()}
      />
    </div>
  );
}
