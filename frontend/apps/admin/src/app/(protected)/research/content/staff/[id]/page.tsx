"use client";

import { staffApi, type ResearchGenericRecord } from "@ksu/api-client";
import { Badge, Card, CardContent, CardHeader, CardTitle } from "@ksu/ui/components";
import { ResearchAdminDetailPage, ResearchDetailRelationshipTabs } from "../../../_components/research-admin-detail-page";
import { RelatedRecordsCard, RelatedRecordsGrid } from "../../../_components/research-detail-relationships";

export default function ResearchStaffDetailPage() {
  return (
    <ResearchAdminDetailPage
      title="Research Staff Assignment"
      description="View research staff assignment, reporting relationships, term metadata, and audit history."
      resource={{
        list: (params) => staffApi.listAssignments({ page: 1, per_page: 100, status: "all", entity_type: "research", ...params }),
      }}
      backHref="/research/content/staff"
      slugParam="id"
      lookup="id"
      labelFields={["role", "status", "is_public"]}
      factFields={[
        { label: "Person", field: "person_id", relation: { adapter: "person" } },
        { label: "Reports To", field: "reports_to_id", relation: { adapter: "staffAssignment" } },
        { label: "Role", field: "role", format: "label" },
        { label: "Start Date", field: "start_date", format: "date" },
        { label: "End Date", field: "end_date", format: "date" },
        { label: "Primary", field: "is_primary", format: "boolean" },
      ]}
      sections={[
        { title: "Assignment", fields: ["title", "role_display", "term_display", "notes"] },
        { title: "Term", fields: ["term_years", "term_renewable", "show_term_dates", "display_order"] },
      ]}
      auditServiceName="main"
      auditResourceTypes={["staff_assignment", "staff", "assignment"]}
      renderAfter={(record) => <StaffRelations assignment={record} />}
    />
  );
}

function StaffRelations({ assignment }: { assignment: ResearchGenericRecord }) {
  const assignmentId = String(assignment.id);

  return (
    <ResearchDetailRelationshipTabs
      defaultValue="reporting"
      tabs={[
        {
          value: "reporting",
          label: "Reporting",
          content: (
            <RelatedRecordsGrid>
              <RelatedRecordsCard
                title="Reporting Chain"
                queryKey={["research", "content", "staff", assignmentId, "reporting-chain"]}
                queryFn={async () => {
                  const response = await staffApi.getReportingChain(assignmentId, {
                    fields: "id,person_id,role,title,status,start_date,end_date,person",
                  });
                  return { data: (response.data ?? []) as ResearchGenericRecord[] };
                }}
                emptyLabel="No reporting chain was returned for this assignment."
                metaFields={["role", "title", "status"]}
              />
              <RelatedRecordsCard
                title="Direct Reports"
                queryKey={["research", "content", "staff", assignmentId, "direct-reports"]}
                queryFn={async () => {
                  const response = await staffApi.getDirectReports(assignmentId, {
                    fields: "id,person_id,role,title,status,start_date,end_date,person",
                  });
                  return { data: (response.data ?? []) as ResearchGenericRecord[] };
                }}
                emptyLabel="No direct reports were returned for this assignment."
                metaFields={["role", "title", "status"]}
              />
            </RelatedRecordsGrid>
          ),
        },
        {
          value: "term",
          label: "Term",
          content: <StaffTermPanel assignment={assignment} />,
        },
      ]}
    />
  );
}

function StaffTermPanel({ assignment }: { assignment: ResearchGenericRecord }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Assignment Term</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3 rounded-lg border p-4">
          <div>
            <p className="font-medium">{assignment.title ?? assignment.role_display ?? "Research staff assignment"}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {[formatLabel(assignment.role), assignment.term_display].filter(Boolean).join(" - ") || "Assignment metadata"}
            </p>
          </div>
          {assignment.status ? <Badge variant="outline">{formatLabel(assignment.status)}</Badge> : null}
        </div>
        <dl className="grid gap-3 text-sm sm:grid-cols-2 xl:grid-cols-4">
          <TermFact label="Start" value={formatDate(assignment.start_date)} />
          <TermFact label="End" value={formatDate(assignment.end_date) || "Current"} />
          <TermFact label="Term Length" value={termLength(assignment)} />
          <TermFact label="Renewable" value={renewableLabel(assignment.term_renewable)} />
        </dl>
        {assignment.notes ? (
          <div className="rounded-lg border p-4">
            <p className="text-xs font-medium uppercase text-muted-foreground">Notes</p>
            <p className="mt-2 text-sm leading-6">{String(assignment.notes)}</p>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

function TermFact({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="rounded-md bg-muted/40 p-3">
      <dt className="text-xs font-medium uppercase text-muted-foreground">{label}</dt>
      <dd className="mt-1 font-medium">{value || "Not set"}</dd>
    </div>
  );
}

function termLength(record: ResearchGenericRecord) {
  if (!record.term_years) return record.term_display ? String(record.term_display) : "Not set";
  return `${record.term_years} year${Number(record.term_years) === 1 ? "" : "s"}`;
}

function renewableLabel(value: unknown) {
  if (typeof value !== "boolean") return "Not set";
  return value ? "Renewable" : "Not renewable";
}

function formatDate(value: unknown) {
  if (!value || typeof value !== "string") return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString();
}

function formatLabel(value: unknown) {
  if (value === null || value === undefined || value === "") return "";
  return String(value).replace(/[_-]+/g, " ").replace(/\b\w/g, (match) => match.toUpperCase());
}
