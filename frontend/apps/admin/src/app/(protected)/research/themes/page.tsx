"use client";

import { ResearchResourcePage, researchServiceApi } from "../_components/research-resource-page";

export default function ResearchThemesPage() {
  return (
    <ResearchResourcePage
      title="Research Themes"
      description="Manage cross-cutting research themes used to classify projects and outputs."
      queryKey={["research", "themes"]}
      resource={researchServiceApi.themes}
      manageScopes={["research.manage_projects", "research:write"]}
      fields={[
        { name: "name", label: "Name", required: true },
        { name: "slug", label: "Slug" },
        { name: "code", label: "Code" },
        { name: "description", label: "Description", type: "textarea" },
        { name: "color", label: "Color" },
        { name: "status", label: "Status", placeholder: "active" },
        { name: "is_active", label: "Active", type: "boolean" },
        { name: "is_featured", label: "Featured", type: "boolean" },
      ]}
      defaults={{ status: "active" }}
      emptyMessage="No research themes were returned by the research service."
    />
  );
}
