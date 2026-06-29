"use client";

import { ResearchResourcePage, researchServiceApi } from "../../_components/research-resource-page";
import { SustainabilityWorkspaceHeader, sustainabilityColumns, sustainabilityFilters } from "../_components/sustainability-workspace";

export default function SustainabilityProjectsPage() {
  return (
    <ResearchResourcePage
      title="Sustainability Projects"
      description="Manage sustainability and climate change initiatives."
      queryKey={["research", "sustainability"]}
      resource={researchServiceApi.sustainability}
      manageScopes={["sustainability.manage", "research:write"]}
      summarySlot={<SustainabilityWorkspaceHeader />}
      listFilters={sustainabilityFilters}
      recordColumns={sustainabilityColumns}
      fields={[
        { name: "name", label: "Name", required: true },
        { name: "slug", label: "Slug" },
        { name: "code", label: "Code" },
        { name: "initiative_type", label: "Initiative Type", type: "select", placeholder: "Select type", options: [
          { label: "Climate", value: "climate" },
          { label: "Biodiversity", value: "biodiversity" },
          { label: "Conservation", value: "conservation" },
          { label: "Renewable Energy", value: "renewable_energy" },
          { label: "Circular Economy", value: "circular_economy" },
          { label: "Water", value: "water" },
          { label: "Food Security", value: "food_security" },
        ] },
        { name: "center_id", label: "Research Center", type: "entity", relation: { adapter: "researchCenter", filters: { is_active: true } } },
        { name: "lead_id", label: "Lead", type: "entity", relation: { adapter: "person", filters: { status: "active" } } },
        { name: "summary", label: "Summary", type: "textarea" },
        { name: "description", label: "Description", type: "textarea" },
        { name: "objectives", label: "Objectives", type: "textarea" },
        { name: "approach", label: "Approach", type: "textarea" },
        { name: "activities", label: "Activities", type: "textarea" },
        { name: "impact", label: "Impact", type: "textarea" },
        { name: "start_date", label: "Start Date", type: "date" },
        { name: "end_date", label: "End Date", type: "date" },
        { name: "contact_email", label: "Contact Email", type: "email" },
        { name: "website", label: "Website", type: "url" },
        { name: "video_url", label: "Video URL", type: "url" },
        { name: "cover_image_url", label: "Cover Image URL", type: "url" },
        { name: "status", label: "Status", type: "select", placeholder: "Select status", options: [
          { label: "Planning", value: "planning" },
          { label: "Active", value: "active" },
          { label: "Completed", value: "completed" },
          { label: "Suspended", value: "suspended" },
        ] },
        { name: "is_active", label: "Active", type: "boolean" },
        { name: "is_featured", label: "Featured", type: "boolean" },
      ]}
      defaults={{ initiative_type: "climate", status: "active" }}
      emptyMessage="No sustainability projects were returned by the research service."
      detailBaseHref="/research/sustainability/projects"
      importResource="research-sustainability"
    />
  );
}
