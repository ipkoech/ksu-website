"use client";

import { ResearchResourcePage, researchServiceApi } from "../../_components/research-resource-page";

export default function SustainabilityPartnersPage() {
  return (
    <ResearchResourcePage
      title="Sustainability Partners"
      description="Manage partners supporting sustainability and climate change work."
      queryKey={["research", "sustainability-partners"]}
      resource={researchServiceApi.partners}
      manageScopes={["sustainability.manage", "partnerships.manage", "research:write"]}
      fields={[
        { name: "name", label: "Name", required: true },
        { name: "slug", label: "Slug" },
        { name: "partner_type", label: "Partner Type", placeholder: "community" },
        { name: "partnership_level", label: "Partnership Level", placeholder: "implementing" },
        { name: "collaboration_areas", label: "Collaboration Areas", type: "textarea" },
        { name: "website", label: "Website", type: "url" },
        { name: "status", label: "Status", placeholder: "active" },
        { name: "is_active", label: "Active", type: "boolean" },
      ]}
      defaults={{ partner_type: "community", partnership_level: "implementing", status: "active" }}
      emptyMessage="No sustainability partners were returned by the research service."
    />
  );
}
