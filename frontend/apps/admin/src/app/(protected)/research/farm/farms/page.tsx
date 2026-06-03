"use client";

import { ResearchResourcePage, researchServiceApi } from "../../_components/research-resource-page";

export default function ResearchFarmsPage() {
  return (
    <ResearchResourcePage
      title="Farm Profiles"
      description="Manage university farm profile records and operational metadata."
      queryKey={["research", "farms"]}
      resource={researchServiceApi.farms}
      manageScopes={["research.manage_projects", "research:write"]}
      fields={[
        { name: "name", label: "Name", required: true },
        { name: "slug", label: "Slug" },
        { name: "code", label: "Code" },
        { name: "farm_type", label: "Farm Type", placeholder: "university" },
        { name: "manager_id", label: "Manager", type: "entity", relation: { adapter: "person", filters: { status: "active" } } },
        { name: "summary", label: "Summary", type: "textarea" },
        { name: "description", label: "Description", type: "textarea" },
        { name: "location", label: "Location" },
        { name: "email", label: "Email", type: "email" },
        { name: "status", label: "Status", placeholder: "active" },
        { name: "is_active", label: "Active", type: "boolean" },
        { name: "is_featured", label: "Featured", type: "boolean" },
      ]}
      defaults={{ farm_type: "university", status: "active" }}
      emptyMessage="No farm profile records were returned by the research service."
      metaFields={["code", "farm_type", "status"]}
    />
  );
}
