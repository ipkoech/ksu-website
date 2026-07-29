"use client";

import { researchServiceApi, type ResearchGenericRecord } from "@ksu/api-client";
import { ResearchAdminDetailPage, ResearchDetailRelationshipTabs } from "../../../_components/research-admin-detail-page";
import { RelatedRecordsCard, RelatedRecordsGrid } from "../../../_components/research-detail-relationships";

export default function MentorshipProgramDetailPage() {
  return (
    <ResearchAdminDetailPage
      title="Mentorship Program"
      description="View mentorship program setup, application window, capacity, applications, matches, and audit history."
      resource={researchServiceApi.mentorship}
      backHref="/research/capacity/mentorship"
      slugParam="id"
      lookup="id"
      labelFields={["program_type", "status", "is_featured"]}
      factFields={[
        { label: "Code", field: "code" },
        { label: "Center", field: "center_id", relation: { adapter: "researchCenter" } },
        { label: "Coordinator", field: "coordinator_id", relation: { adapter: "person" } },
        { label: "Deadline", field: "application_deadline", format: "datetime" },
        { label: "Max Mentors", field: "max_mentors" },
        { label: "Max Mentees", field: "max_mentees" },
      ]}
      sections={[
        { title: "Program", fields: ["summary", "description", "objectives", "benefits"] },
        { title: "Requirements", fields: ["mentor_requirements", "mentee_requirements", "expectations", "guidelines"] },
        { title: "Cohort", fields: ["application_open", "application_deadline", "cohort_start_date", "cohort_end_date", "duration_months", "commitment_hours_weekly"] },
      ]}
      auditResourceTypes={["mentorship_program", "mentorship", "capacity_mentorship"]}
      renderAfter={(record) => <MentorshipRelations program={record} />}
    />
  );
}

function MentorshipRelations({ program }: { program: ResearchGenericRecord }) {
  const programId = String(program.id);

  return (
    <ResearchDetailRelationshipTabs
      defaultValue="applications"
      tabs={[
        {
          value: "applications",
          label: "Applications",
          content: (
            <RelatedRecordsGrid>
              <RelatedRecordsCard
                title="Submitted Applications"
                queryKey={["research", "capacity", "mentorship", programId, "submitted-applications"]}
                queryFn={() => researchServiceApi.mentorshipApplications.list({ page: 1, per_page: 8, program_id: programId, status: "submitted" })}
                emptyLabel="No submitted applications were returned for this program."
                metaFields={["application_type", "status", "submitted_at"]}
              />
              <RelatedRecordsCard
                title="Approved Applications"
                queryKey={["research", "capacity", "mentorship", programId, "approved-applications"]}
                queryFn={() => researchServiceApi.mentorshipApplications.list({ page: 1, per_page: 8, program_id: programId, status: "approved" })}
                emptyLabel="No approved applications were returned for this program."
                metaFields={["application_type", "status", "reviewed_at"]}
              />
            </RelatedRecordsGrid>
          ),
        },
        {
          value: "matches",
          label: "Matches",
          content: (
            <RelatedRecordsCard
              title="Mentorship Matches"
              queryKey={["research", "capacity", "mentorship", programId, "matches"]}
              queryFn={() => researchServiceApi.mentorshipMatches.list({ page: 1, per_page: 12, program_id: programId })}
              emptyLabel="No matches were returned for this mentorship program."
              metaFields={["status", "match_date", "meeting_schedule"]}
            />
          ),
        },
      ]}
    />
  );
}
