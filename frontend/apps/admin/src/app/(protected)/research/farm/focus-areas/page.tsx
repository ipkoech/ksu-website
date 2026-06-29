"use client";

import { ResearchResourcePage, researchServiceApi } from "../../_components/research-resource-page";
import { FarmWorkspaceHeader } from "../_components/farm-workspace";

export default function FarmFocusAreasPage() {
  return (
    <ResearchResourcePage
      title="Farm Focus Areas"
      description="Manage farm focus areas and thematic priorities."
      queryKey={["research", "farm-focus-areas"]}
      resource={researchServiceApi.focusAreas}
      manageScopes={["research_theme.manage", "research.manage_projects", "research:write"]}
      summarySlot={<FarmWorkspaceHeader />}
      fields={[
        { name: "name", label: "Name", required: true },
        { name: "slug", label: "Slug" },
        { name: "code", label: "Code" },
        { name: "description", label: "Description", type: "textarea" },
        { name: "is_active", label: "Active", type: "boolean" },
        { name: "is_featured", label: "Featured", type: "boolean" },
      ]}
      emptyMessage="No farm focus areas were returned by the research service."
    />
  );
}
