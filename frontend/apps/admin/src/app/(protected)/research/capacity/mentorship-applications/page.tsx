"use client";

import { ResearchResourcePage, researchServiceApi } from "../../_components/research-resource-page";
import { CapacityWorkspaceHeader, applicationColumns, statusFilter } from "../_components/capacity-workspace";

export default function MentorshipApplicationsPage() {
  return (
    <ResearchResourcePage
      title="Mentorship Applications"
      description="Manage mentor and mentee applications for research mentorship programs."
      queryKey={["research", "mentorship-applications"]}
      resource={researchServiceApi.mentorshipApplications}
      manageScopes={["training_program.manage", "mentorship.manage_applications", "research:write"]}
      summarySlot={<CapacityWorkspaceHeader />}
      listFilters={[{ name: "search", label: "Search", type: "text", placeholder: "Search mentorship applications" }, statusFilter]}
      recordColumns={applicationColumns}
      editorMode="sheet"
      fields={[
        { name: "program_id", label: "Mentorship Program", type: "entity", required: true, relation: { adapter: "researchMentorship", filters: { is_active: true }, allowClear: false } },
        { name: "applicant_id", label: "Applicant", type: "entity", required: true, relation: { adapter: "person", filters: { status: "active" }, allowClear: false } },
        { name: "application_type", label: "Application Type", required: true, placeholder: "mentee" },
        { name: "motivation", label: "Motivation", type: "textarea" },
        { name: "experience", label: "Experience", type: "textarea" },
        { name: "goals", label: "Goals", type: "textarea" },
        { name: "availability", label: "Availability", type: "textarea" },
        { name: "preferred_communication", label: "Preferred Communication" },
        { name: "looking_for", label: "Looking For", type: "textarea" },
        { name: "cv_url", label: "CV URL", type: "url" },
        { name: "status", label: "Status", type: "select", placeholder: "Select status", options: [
          { label: "Draft", value: "draft" },
          { label: "Submitted", value: "submitted" },
          { label: "Under Review", value: "under_review" },
          { label: "Approved", value: "approved" },
          { label: "Rejected", value: "rejected" },
          { label: "Matched", value: "matched" },
        ] },
      ]}
      defaults={{ status: "draft" }}
      emptyMessage="No mentorship applications were returned by the research service."
      metaFields={["application_type", "status", "submitted_at"]}
      detailHref={(record) => `/research/capacity/mentorship-applications/${record.id}`}
      getRecordWorkflowActions={(record) => {
        const status = String(record.status ?? "").toLowerCase();
        if (status === "approved" || status === "matched") return [];
        const reviewFields = [
          { name: "review_notes", label: "Review Notes", type: "textarea" as const, required: true },
          { name: "reviewed_by_id", label: "Reviewer", type: "entity" as const, relation: { adapter: "person" as const, filters: { status: "active" }, allowClear: false }, required: true },
        ];
        return [
          {
            label: "Review",
            mode: "sheet",
            fields: reviewFields,
            payload: { status: "under_review" },
            buildPayload: (values) => ({ ...values, reviewed_at: new Date().toISOString() }),
            successMessage: "Application moved to review",
          },
          {
            label: "Approve",
            mode: "sheet",
            fields: reviewFields,
            payload: { status: "approved" },
            buildPayload: (values) => ({ ...values, reviewed_at: new Date().toISOString() }),
            successMessage: "Application approved",
          },
          {
            label: "Match Mentor",
            mode: "sheet",
            fields: [
              { name: "mentor_id", label: "Mentor", type: "entity" as const, relation: { adapter: "person" as const, filters: { status: "active" }, allowClear: false }, required: true },
              { name: "match_date", label: "Match Date", type: "date" as const, required: true },
              { name: "goals", label: "Match Goals", type: "textarea" as const },
              { name: "meeting_schedule", label: "Meeting Schedule", type: "textarea" as const },
            ],
            defaults: { match_date: new Date().toISOString().slice(0, 10) },
            payload: { status: "matched" },
            run: async (application, values) => {
              await researchServiceApi.mentorshipMatches.create({
                program_id: application.program_id,
                mentor_id: values?.mentor_id,
                mentee_id: application.applicant_id,
                match_date: values?.match_date,
                goals: values?.goals,
                meeting_schedule: values?.meeting_schedule,
                status: "active",
              });
              await researchServiceApi.mentorshipApplications.update(application.id, { status: "matched" });
            },
            successMessage: "Mentor matched to application",
          },
          {
            label: "Reject",
            mode: "sheet",
            variant: "outline",
            className: "text-destructive",
            fields: reviewFields,
            payload: { status: "rejected" },
            buildPayload: (values) => ({ ...values, reviewed_at: new Date().toISOString() }),
            successMessage: "Application rejected",
          },
        ];
      }}
    />
  );
}
