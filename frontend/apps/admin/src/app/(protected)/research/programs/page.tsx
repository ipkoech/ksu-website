"use client";

import { ResearchResourcePage, researchServiceApi } from "../_components/research-resource-page";

export default function ResearchProgramsPage() {
  return (
    <ResearchResourcePage
      title="Research Programs"
      description="Manage research programs linked to centers and research leads."
      queryKey={["research", "programs"]}
      resource={researchServiceApi.programs}
      manageScopes={["research.manage_projects", "research:write"]}
      fields={[
        { name: "name", label: "Name", required: true },
        { name: "slug", label: "Slug" },
        { name: "code", label: "Code" },
        { name: "center_id", label: "Research Center", type: "entity", relation: { adapter: "researchCenter", filters: { is_active: true } } },
        { name: "lead_id", label: "Lead", type: "entity", relation: { adapter: "person", filters: { status: "active" } } },
        { name: "start_date", label: "Start Date", type: "date" },
        { name: "end_date", label: "End Date", type: "date" },
        { name: "summary", label: "Summary", type: "textarea" },
        { name: "description", label: "Description", type: "textarea" },
        { name: "objectives", label: "Objectives", type: "textarea" },
        { name: "expected_outcomes", label: "Expected Outcomes", type: "textarea" },
        { name: "methodology", label: "Methodology", type: "textarea" },
        { name: "budget", label: "Budget", type: "number" },
        { name: "currency", label: "Currency", placeholder: "KES" },
        { name: "cover_image_url", label: "Cover Image URL", type: "url" },
        { name: "status", label: "Status", placeholder: "active" },
        { name: "is_active", label: "Active", type: "boolean" },
        { name: "is_featured", label: "Featured", type: "boolean" },
      ]}
      defaults={{ currency: "KES", status: "active" }}
      emptyMessage="No research programs were returned by the research service."
      metaFields={["code", "status", "start_date"]}
      importResource="research-programs"
    />
  );
}
