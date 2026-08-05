"use client";

import { researchServiceApi, type ResearchGenericRecord } from "@ksu/api-client";
import { ResearchAdminDetailPage, ResearchDetailRelationshipTabs } from "../../../_components/research-admin-detail-page";
import { RelatedRecordsCard, RelatedRecordsGrid } from "../../../_components/research-detail-relationships";

export default function MentorshipMatchDetailPage() {
  return (
    <ResearchAdminDetailPage
      title="Mentorship Match"
      description="View mentor/mentee pair, goals, meeting cadence, feedback, and audit history."
      resource={researchServiceApi.mentorshipMatches}
      backHref="/research/capacity/mentorship-matches"
      slugParam="id"
      lookup="id"
      labelFields={["status"]}
      factFields={[
        { label: "Program", field: "program_id", relation: { adapter: "researchMentorship" } },
        { label: "Mentor", field: "mentor_id", relation: { adapter: "person" } },
        { label: "Mentee", field: "mentee_id", relation: { adapter: "person" } },
        { label: "Match Date", field: "match_date", format: "date" },
        { label: "Start", field: "start_date", format: "date" },
        { label: "End", field: "end_date", format: "date" },
      ]}
      sections={[
        { title: "Match", fields: ["goals", "meeting_schedule", "milestones"] },
        { title: "Feedback", fields: ["meeting_log", "mentor_feedback", "mentee_feedback", "rating"] },
      ]}
      auditResourceTypes={["mentorship_match", "mentorship-matches", "capacity_match"]}
      renderAfter={(record) => <MentorshipMatchRelations match={record} />}
    />
  );
}

function MentorshipMatchRelations({ match }: { match: ResearchGenericRecord }) {
  const programId = String(match.program_id ?? "");
  const mentorId = String(match.mentor_id ?? "");
  const menteeId = String(match.mentee_id ?? "");

  return (
    <ResearchDetailRelationshipTabs
      defaultValue="program"
      tabs={[
        {
          value: "program",
          label: "Program",
          content: (
            <RelatedRecordsCard
              title="Other Program Matches"
              queryKey={["research", "capacity", "mentorship-matches", match.id, "program", programId]}
              queryFn={() => researchServiceApi.mentorshipMatches.list({ page: 1, per_page: 8, program_id: programId })}
              emptyLabel="No other matches were returned for this program."
              metaFields={["status", "match_date", "meeting_schedule"]}
            />
          ),
        },
        {
          value: "people",
          label: "People",
          content: (
            <RelatedRecordsGrid>
              <RelatedRecordsCard
                title="Mentor Applications"
                queryKey={["research", "capacity", "mentorship-matches", match.id, "mentor-applications", mentorId]}
                queryFn={() => researchServiceApi.mentorshipApplications.list({ page: 1, per_page: 8, applicant_id: mentorId })}
                emptyLabel="No mentorship applications were returned for this mentor."
                metaFields={["application_type", "status", "submitted_at"]}
              />
              <RelatedRecordsCard
                title="Mentee Applications"
                queryKey={["research", "capacity", "mentorship-matches", match.id, "mentee-applications", menteeId]}
                queryFn={() => researchServiceApi.mentorshipApplications.list({ page: 1, per_page: 8, applicant_id: menteeId })}
                emptyLabel="No mentorship applications were returned for this mentee."
                metaFields={["application_type", "status", "submitted_at"]}
              />
            </RelatedRecordsGrid>
          ),
        },
      ]}
    />
  );
}
