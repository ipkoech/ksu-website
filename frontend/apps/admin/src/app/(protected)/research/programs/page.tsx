"use client";

import { ResearchResourcePage, researchServiceApi } from "../_components/research-resource-page";

export default function ResearchProgramsPage() {
  return (
    <ResearchResourcePage
      title="Research Programs"
      description="Manage research programs linked to centers and coordinators."
      queryKey={["research", "programs"]}
      resource={researchServiceApi.programs}
      manageScopes={["research.manage_projects", "research:write"]}
      fields={[
        { name: "name", label: "Name", required: true },
        { name: "slug", label: "Slug" },
        { name: "code", label: "Code" },
        { name: "program_type", label: "Program Type", placeholder: "research" },
        { name: "center_id", label: "Research Center", type: "entity", relation: { adapter: "researchCenter", filters: { is_active: true } } },
        { name: "coordinator_id", label: "Coordinator", type: "entity", relation: { adapter: "person", filters: { status: "active" } } },
        { name: "summary", label: "Summary", type: "textarea" },
        { name: "description", label: "Description", type: "textarea" },
        { name: "status", label: "Status", placeholder: "active" },
        { name: "is_active", label: "Active", type: "boolean" },
        { name: "is_featured", label: "Featured", type: "boolean" },
      ]}
      defaults={{ program_type: "research", status: "active" }}
      emptyMessage="No research programs were returned by the research service."
      metaFields={["code", "program_type", "status"]}
    />
  );
}
