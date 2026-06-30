"use client";

import { staffApi, type ResearchGenericRecord } from "@ksu/api-client";
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
      ]}
    />
  );
}
