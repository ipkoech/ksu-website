"use client";

import { ResearchResourcePage, researchServiceApi } from "../../_components/research-resource-page";
import { FarmWorkspaceHeader, farmColumns, farmFilters } from "../_components/farm-workspace";

export default function ResearchFarmsPage() {
  return (
    <ResearchResourcePage
      title="Farm Profiles"
      description="Manage university farm profile records and operational metadata."
      queryKey={["research", "farms"]}
      resource={researchServiceApi.farms}
      manageScopes={["farm.manage", "research:write"]}
      summarySlot={<FarmWorkspaceHeader />}
      listFilters={farmFilters}
      recordColumns={farmColumns}
      fields={[
        { name: "name", label: "Name", required: true },
        { name: "slug", label: "Slug" },
        { name: "code", label: "Code" },
        { name: "center_id", label: "Research Center", type: "entity", relation: { adapter: "researchCenter", filters: { is_active: true } } },
        { name: "farm_type", label: "Farm Type", type: "select", placeholder: "Select farm type", options: [
          { label: "Crop", value: "crop" },
          { label: "Livestock", value: "livestock" },
          { label: "Aquaculture", value: "aquaculture" },
          { label: "Mixed", value: "mixed" },
          { label: "Demonstration", value: "demonstration" },
          { label: "Experimental", value: "experimental" },
        ] },
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
        { name: "gps_latitude", label: "GPS Latitude", type: "number" },
        { name: "gps_longitude", label: "GPS Longitude", type: "number" },
        { name: "manager_name", label: "Manager Name" },
        { name: "email", label: "Email", type: "email" },
        { name: "phone", label: "Phone" },
        { name: "cover_image_url", label: "Cover Image URL", type: "url" },
        { name: "is_active", label: "Active", type: "boolean" },
        { name: "is_public", label: "Public", type: "boolean" },
        { name: "is_featured", label: "Featured", type: "boolean" },
      ]}
      defaults={{ farm_type: "mixed", is_public: true, is_active: true }}
      emptyMessage="No farm profile records were returned by the research service."
      metaFields={["code", "farm_type", "status"]}
      detailBaseHref="/research/farm/farms"
      importResource="research-farms"
    />
  );
}
