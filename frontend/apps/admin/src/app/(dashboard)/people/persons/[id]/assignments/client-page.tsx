"use client";

import { useState } from "react";
import { useParams, usePathname, useSearchParams } from "next/navigation";
import { Edit, RefreshCw, UserPlus } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import { StaffAssignmentEditor } from "@/components/staff/staff-assignment-editor";
import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from "@ksu/ui/components";
import { usePerson, useStaffAssignments } from "@ksu/api-client";
import type { StaffAssignment } from "@ksu/api-client";

function formatAssignmentEntity(assignment: StaffAssignment) {
  return assignment.entity?.name || assignment.entity_type.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default function PersonAssignmentsPage() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const paramsPersonId = useParams().id as string;
  const pathPersonId = pathname.match(/\/people\/persons\/([^/]+)\/assignments\/?$/)?.[1];
  const routePersonId = decodeURIComponent(pathPersonId || paramsPersonId);
  const personId = routePersonId === "_static" ? searchParams.get("id") || "" : routePersonId;
  const personQuery = usePerson(personId);
  const assignmentsQuery = useStaffAssignments({ person_id: personId, status: "all" });
  const [editorOpen, setEditorOpen] = useState(false);
  const [editorMode, setEditorMode] = useState<"create" | "edit" | "reassign">("create");
  const [selectedAssignment, setSelectedAssignment] = useState<StaffAssignment | null>(null);

  if (personQuery.isLoading || assignmentsQuery.isLoading) return <LoadingSkeleton rows={10} />;

  const person = personQuery.data?.data;
  const assignments = assignmentsQuery.data?.data ?? [];
  const activeAssignments = assignments.filter((assignment) => assignment.status === "active");
  const historicalAssignments = assignments.filter((assignment) => assignment.status !== "active");

  const openEditor = (mode: "create" | "edit" | "reassign", assignment?: StaffAssignment) => {
    setEditorMode(mode);
    setSelectedAssignment(assignment ?? null);
    setEditorOpen(true);
  };

  const renderAssignment = (assignment: StaffAssignment) => (
    <div key={assignment.id} className="flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-medium">{assignment.title || assignment.role_display || assignment.role}</p>
          <Badge variant={assignment.status === "active" ? "default" : "secondary"}>{assignment.status}</Badge>
          {assignment.is_primary ? <Badge variant="outline">Primary</Badge> : null}
          {assignment.is_acting ? <Badge variant="warning">Acting</Badge> : null}
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          {formatAssignmentEntity(assignment)}
          {assignment.start_date ? ` - started ${assignment.start_date}` : ""}
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" size="sm" onClick={() => openEditor("edit", assignment)}>
          <Edit className="mr-2 h-4 w-4" />
          Edit
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={() => openEditor("reassign", assignment)}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Reassign
        </Button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Person Assignments"
        description={person ? `Manage assignments for ${person.full_name}` : "Manage staff assignments"}
        backHref={`/people/persons/_static?id=${encodeURIComponent(personId)}`}
        actions={
          <Button type="button" onClick={() => openEditor("create")}>
            <UserPlus className="mr-2 h-4 w-4" />
            Assign staff
          </Button>
        }
      />

      <Card>
        <CardHeader><CardTitle>Active Assignments</CardTitle></CardHeader>
        <CardContent>
          {activeAssignments.length === 0 ? (
            <p className="rounded-md border bg-background p-4 text-sm text-muted-foreground">No active staff assignments exist for this person.</p>
          ) : (
            <div className="divide-y rounded-md border">{activeAssignments.map(renderAssignment)}</div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Assignment History</CardTitle></CardHeader>
        <CardContent>
          {historicalAssignments.length === 0 ? (
            <p className="rounded-md border bg-background p-4 text-sm text-muted-foreground">No ended or inactive assignments.</p>
          ) : (
            <div className="divide-y rounded-md border">{historicalAssignments.map(renderAssignment)}</div>
          )}
        </CardContent>
      </Card>

      <StaffAssignmentEditor
        open={editorOpen}
        onOpenChange={setEditorOpen}
        mode={editorMode}
        assignment={selectedAssignment}
        presetPersonId={personId}
        onSuccess={() => assignmentsQuery.refetch()}
      />
    </div>
  );
}
