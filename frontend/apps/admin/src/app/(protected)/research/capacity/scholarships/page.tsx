"use client";

import { ResearchResourcePage, researchServiceApi } from "../../_components/research-resource-page";

export default function ScholarshipsPage() {
  return (
    <ResearchResourcePage
      title="Scholarships"
      description="Manage research scholarship opportunities."
      queryKey={["research", "scholarships"]}
      resource={researchServiceApi.scholarships}
      manageScopes={["scholarship.manage", "research:write"]}
      fields={[
        { name: "name", label: "Name", required: true },
        { name: "slug", label: "Slug" },
        { name: "code", label: "Code" },
        { name: "scholarship_type", label: "Scholarship Type", placeholder: "research" },
        { name: "funder_name", label: "Funder" },
        { name: "summary", label: "Summary", type: "textarea" },
        { name: "value", label: "Value", type: "number" },
        { name: "currency", label: "Currency", placeholder: "KES" },
        { name: "application_open", label: "Application Open", type: "date" },
        { name: "application_deadline", label: "Application Deadline", type: "datetime-local" },
        { name: "status", label: "Status", placeholder: "open" },
        { name: "is_active", label: "Active", type: "boolean" },
        { name: "is_featured", label: "Featured", type: "boolean" },
      ]}
      defaults={{ scholarship_type: "research", currency: "KES", status: "open" }}
      emptyMessage="No scholarships were returned by the research service."
    />
  );
}
