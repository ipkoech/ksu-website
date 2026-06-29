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
      getRecordWorkflowActions={(record) => {
        const status = String(record.status ?? "").toLowerCase();
        if (status === "approved" || status === "matched") return [];
        return [
          { label: "Review", payload: { status: "under_review" }, successMessage: "Application moved to review" },
          { label: "Approve", payload: { status: "approved" }, successMessage: "Application approved" },
          { label: "Reject", variant: "outline", className: "text-destructive", payload: { status: "rejected" }, successMessage: "Application rejected" },
        ];
      }}
    />
  );
}
