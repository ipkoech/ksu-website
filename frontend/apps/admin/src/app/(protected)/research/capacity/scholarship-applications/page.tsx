"use client";

import { ResearchResourcePage, researchServiceApi } from "../../_components/research-resource-page";
import { CapacityWorkspaceHeader, applicationColumns, statusFilter } from "../_components/capacity-workspace";

export default function ScholarshipApplicationsPage() {
  return (
    <ResearchResourcePage
      title="Scholarship Applications"
      description="Manage applications for research scholarship opportunities."
      queryKey={["research", "scholarship-applications"]}
      resource={researchServiceApi.scholarshipApplications}
      manageScopes={["scholarship_application.manage", "scholarship.manage", "research:write"]}
      summarySlot={<CapacityWorkspaceHeader />}
      listFilters={[{ name: "scholarship_id", label: "Scholarship", type: "entity", relation: { adapter: "researchScholarship", filters: { is_active: true } } }, statusFilter]}
      recordColumns={applicationColumns}
      editorMode="sheet"
      fields={[
        { name: "scholarship_id", label: "Scholarship", type: "entity", required: true, relation: { adapter: "researchScholarship", filters: { is_active: true }, allowClear: false } },
        { name: "applicant_id", label: "Applicant", type: "entity", required: true, relation: { adapter: "person", filters: { status: "active" }, allowClear: false } },
        { name: "research_proposal", label: "Research Proposal", type: "textarea" },
        { name: "personal_statement", label: "Personal Statement", type: "textarea" },
        { name: "research_experience", label: "Research Experience", type: "textarea" },
        { name: "career_goals", label: "Career Goals", type: "textarea" },
        { name: "budget_justification", label: "Budget Justification", type: "textarea" },
        { name: "cv_url", label: "CV URL", type: "url" },
        { name: "transcripts_url", label: "Transcripts URL", type: "url" },
        { name: "status", label: "Status", type: "select", placeholder: "Select status", options: [
          { label: "Draft", value: "draft" },
          { label: "Submitted", value: "submitted" },
          { label: "Under Review", value: "under_review" },
          { label: "Shortlisted", value: "shortlisted" },
          { label: "Awarded", value: "awarded" },
          { label: "Rejected", value: "rejected" },
        ] },
      ]}
      defaults={{ status: "draft" }}
      emptyMessage="No scholarship applications were returned by the research service."
      metaFields={["application_number", "status", "submitted_at"]}
      detailHref={(record) => `/research/capacity/scholarship-applications/${record.id}`}
      getRecordWorkflowActions={(record) => {
        const status = String(record.status ?? "").toLowerCase();
        if (status === "awarded") return [];
        const reviewFields = [
          { name: "review_score", label: "Review Score", type: "number" as const, required: true },
          { name: "decision_date", label: "Decision Date", type: "date" as const, required: true },
        ];
        return [
          {
            label: "Review",
            mode: "sheet",
            fields: reviewFields,
            defaults: { decision_date: new Date().toISOString().slice(0, 10) },
            payload: { status: "under_review" },
            successMessage: "Application moved to review",
          },
          {
            label: "Shortlist",
            mode: "sheet",
            fields: reviewFields,
            defaults: { decision_date: new Date().toISOString().slice(0, 10) },
            payload: { status: "shortlisted" },
            successMessage: "Application shortlisted",
          },
          {
            label: "Award",
            mode: "sheet",
            fields: [
              ...reviewFields,
              { name: "awarded_amount", label: "Awarded Amount", type: "number" as const, required: true },
            ],
            defaults: { decision_date: new Date().toISOString().slice(0, 10) },
            payload: { status: "awarded" },
            successMessage: "Scholarship awarded",
          },
          {
            label: "Reject",
            mode: "sheet",
            variant: "outline",
            className: "text-destructive",
            fields: reviewFields,
            defaults: { decision_date: new Date().toISOString().slice(0, 10) },
            payload: { status: "rejected" },
            successMessage: "Application rejected",
          },
        ];
      }}
    />
  );
}
