"use client";

import { ResearchResourcePage, researchServiceApi } from "../../_components/research-resource-page";

export default function MentorshipProgramsPage() {
  return (
    <ResearchResourcePage
      title="Mentorship Programs"
      description="Manage research mentorship programs."
      queryKey={["research", "mentorship"]}
      resource={researchServiceApi.mentorship}
      manageScopes={["training_program.manage", "research:write"]}
      fields={[
        { name: "name", label: "Name", required: true },
        { name: "slug", label: "Slug" },
        { name: "code", label: "Code" },
        { name: "program_type", label: "Program Type", placeholder: "research" },
        { name: "summary", label: "Summary", type: "textarea" },
        { name: "duration_months", label: "Duration Months", type: "number" },
        { name: "application_open", label: "Application Open", type: "date" },
        { name: "application_deadline", label: "Application Deadline", type: "datetime-local" },
        { name: "status", label: "Status", placeholder: "active" },
        { name: "is_active", label: "Active", type: "boolean" },
        { name: "is_featured", label: "Featured", type: "boolean" },
      ]}
      defaults={{ program_type: "research", status: "active" }}
      emptyMessage="No mentorship programs were returned by the research service."
    />
  );
}
