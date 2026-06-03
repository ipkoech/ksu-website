"use client";

import { ResearchResourcePage, researchServiceApi } from "../../_components/research-resource-page";

export default function SustainabilityProjectsPage() {
  return (
    <ResearchResourcePage
      title="Sustainability Projects"
      description="Manage sustainability and climate change initiatives."
      queryKey={["research", "sustainability"]}
      resource={researchServiceApi.sustainability}
      manageScopes={["sustainability.manage", "research:write"]}
      fields={[
        { name: "name", label: "Name", required: true },
        { name: "slug", label: "Slug" },
        { name: "code", label: "Code" },
        { name: "initiative_type", label: "Initiative Type", placeholder: "climate" },
        { name: "summary", label: "Summary", type: "textarea" },
        { name: "activities", label: "Activities", type: "textarea" },
        { name: "impact", label: "Impact", type: "textarea" },
        { name: "status", label: "Status", placeholder: "active" },
        { name: "is_active", label: "Active", type: "boolean" },
        { name: "is_featured", label: "Featured", type: "boolean" },
      ]}
      defaults={{ initiative_type: "climate", status: "active" }}
      emptyMessage="No sustainability projects were returned by the research service."
    />
  );
}
