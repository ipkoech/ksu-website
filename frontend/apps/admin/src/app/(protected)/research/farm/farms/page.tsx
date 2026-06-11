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
        { name: "center_id", label: "Research Center", type: "entity", relation: { adapter: "researchCenter", filters: { is_active: true } } },
        { name: "farm_type", label: "Farm Type", placeholder: "university" },
        { name: "manager_id", label: "Manager", type: "entity", relation: { adapter: "person", filters: { status: "active" } } },
        { name: "summary", label: "Summary", type: "textarea" },
        { name: "about", label: "About", type: "textarea" },
        { name: "description", label: "Description", type: "textarea" },
        { name: "activities", label: "Activities", type: "textarea" },
        { name: "products", label: "Products", type: "textarea" },
        { name: "facilities", label: "Facilities", type: "textarea" },
        { name: "size_hectares", label: "Size Hectares", type: "number" },
        { name: "capacity_info", label: "Capacity Info", type: "textarea" },
        { name: "location", label: "Location" },
        { name: "county", label: "County" },
        { name: "address", label: "Address", type: "textarea" },
        { name: "manager_name", label: "Manager Name" },
        { name: "email", label: "Email", type: "email" },
        { name: "phone", label: "Phone" },
        { name: "cover_image_url", label: "Cover Image URL", type: "url" },
        { name: "status", label: "Status", placeholder: "active" },
        { name: "is_active", label: "Active", type: "boolean" },
        { name: "is_public", label: "Public", type: "boolean" },
        { name: "is_featured", label: "Featured", type: "boolean" },
      ]}
      defaults={{ farm_type: "university", status: "active", is_public: true }}
      emptyMessage="No farm profile records were returned by the research service."
      metaFields={["code", "farm_type", "status"]}
    />
  );
}
