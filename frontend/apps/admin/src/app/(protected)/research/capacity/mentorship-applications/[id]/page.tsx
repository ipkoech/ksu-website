"use client";

import { researchServiceApi, type ResearchGenericRecord } from "@ksu/api-client";
import { ResearchAdminDetailPage, ResearchDetailRelationshipTabs } from "../../../_components/research-admin-detail-page";
import { RelatedRecordsCard, RelatedRecordsGrid } from "../../../_components/research-detail-relationships";

export default function MentorshipApplicationDetailPage() {
  return (
    <ResearchAdminDetailPage
      title="Mentorship Application"
      description="Review applicant motivation, reviewer status, matching context, and audit history."
      resource={researchServiceApi.mentorshipApplications}
      backHref="/research/capacity/mentorship-applications"
      slugParam="id"
      lookup="id"
      labelFields={["application_type", "status"]}
      factFields={[
        { label: "Program", field: "program_id", relation: { adapter: "researchMentorship" } },
        { label: "Applicant", field: "applicant_id", relation: { adapter: "person" } },
        { label: "Submitted", field: "submitted_at", format: "datetime" },
        { label: "Reviewed", field: "reviewed_at", format: "datetime" },
        { label: "Reviewer", field: "reviewed_by_id", relation: { adapter: "person" } },
      ]}
      sections={[
        { title: "Application", fields: ["motivation", "experience", "goals", "availability", "preferred_communication", "looking_for"] },
        { title: "Review", fields: ["review_notes", "reviewed_at", "reviewed_by_id", "cv_url"] },
      ]}
      auditResourceTypes={["mentorship_application", "mentorship-applications", "capacity_application"]}
      renderAfter={(record) => <MentorshipApplicationRelations application={record} />}
    />
  );
}

function MentorshipApplicationRelations({ application }: { application: ResearchGenericRecord }) {
  const programId = String(application.program_id ?? "");
  const applicantId = String(application.applicant_id ?? "");

  return (
    <ResearchDetailRelationshipTabs
      defaultValue="program"
      tabs={[
        {
          value: "program",
          label: "Program Queue",
          content: (
            <RelatedRecordsGrid>
              <RelatedRecordsCard
                title="Program Applications"
                queryKey={["research", "capacity", "mentorship-applications", application.id, "program-applications", programId]}
                queryFn={() => researchServiceApi.mentorshipApplications.list({ page: 1, per_page: 8, program_id: programId })}
                emptyLabel="No other applications were returned for this mentorship program."
                metaFields={["application_type", "status", "submitted_at"]}
              />
              <RelatedRecordsCard
                title="Program Matches"
                queryKey={["research", "capacity", "mentorship-applications", application.id, "program-matches", programId]}
                queryFn={() => researchServiceApi.mentorshipMatches.list({ page: 1, per_page: 8, program_id: programId })}
                emptyLabel="No matches were returned for this mentorship program."
                metaFields={["status", "match_date", "meeting_schedule"]}
              />
            </RelatedRecordsGrid>
          ),
        },
        {
          value: "applicant",
          label: "Applicant",
          content: (
            <RelatedRecordsCard
              title="Applicant Mentorship Applications"
              queryKey={["research", "capacity", "mentorship-applications", application.id, "applicant", applicantId]}
              queryFn={() => researchServiceApi.mentorshipApplications.list({ page: 1, per_page: 8, applicant_id: applicantId })}
              emptyLabel="No other mentorship applications were returned for this applicant."
              metaFields={["application_type", "status", "submitted_at"]}
            />
          ),
        },
      ]}
    />
  );
}
