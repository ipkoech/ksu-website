"use client";

import { ResearchResourcePage, researchServiceApi } from "../_components/research-resource-page";

export default function ResearchPartnershipsPage() {
  return (
    <ResearchResourcePage
      title="Partnerships"
      description="Manage research partner organizations and collaboration records."
      queryKey={["research", "partners"]}
      resource={researchServiceApi.partners}
      manageScopes={["partnerships.manage", "partnerships.manage_partners", "research:write"]}
      fields={[
        { name: "name", label: "Name", required: true },
        { name: "slug", label: "Slug" },
        { name: "acronym", label: "Acronym" },
        { name: "partner_type", label: "Partner Type", placeholder: "academic" },
        { name: "partnership_level", label: "Partnership Level", placeholder: "strategic" },
        { name: "website", label: "Website", type: "url" },
        { name: "email", label: "Email", type: "email" },
        { name: "about", label: "About", type: "textarea" },
        { name: "status", label: "Status", placeholder: "active" },
        { name: "is_active", label: "Active", type: "boolean" },
        { name: "is_featured", label: "Featured", type: "boolean" },
      ]}
      defaults={{ partner_type: "academic", status: "active" }}
      emptyMessage="No partnerships were returned by the research service."
      detailBaseHref="/research/partnerships"
      importResource="research-partners"
    />
  );
}
