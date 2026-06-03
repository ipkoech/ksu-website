"use client";

import { ResearchResourcePage, researchServiceApi } from "../../_components/research-resource-page";

export default function ScholarshipApplicationsPage() {
  return (
    <ResearchResourcePage
      title="Scholarship Applications"
      description="Manage applications for research scholarship opportunities."
      queryKey={["research", "scholarship-applications"]}
      resource={researchServiceApi.scholarshipApplications}
      manageScopes={["scholarship_application.manage", "scholarship.manage", "research:write"]}
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
        { name: "status", label: "Status", placeholder: "draft" },
      ]}
      defaults={{ status: "draft" }}
      emptyMessage="No scholarship applications were returned by the research service."
      metaFields={["application_number", "status", "submitted_at"]}
    />
  );
}
