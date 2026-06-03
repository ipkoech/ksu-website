"use client";

import { ResearchResourcePage, researchServiceApi } from "../../_components/research-resource-page";

export default function MentorshipApplicationsPage() {
  return (
    <ResearchResourcePage
      title="Mentorship Applications"
      description="Manage mentor and mentee applications for research mentorship programs."
      queryKey={["research", "mentorship-applications"]}
      resource={researchServiceApi.mentorshipApplications}
      manageScopes={["training_program.manage", "mentorship.manage_applications", "research:write"]}
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
        { name: "status", label: "Status", placeholder: "draft" },
      ]}
      defaults={{ status: "draft" }}
      emptyMessage="No mentorship applications were returned by the research service."
      metaFields={["application_type", "status", "submitted_at"]}
    />
  );
}
