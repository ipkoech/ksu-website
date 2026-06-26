"use client";

import { ResearchResourcePage, researchServiceApi } from "../../_components/research-resource-page";

export default function ResearchFundersPage() {
  return (
    <ResearchResourcePage
      title="Funders"
      description="Manage research funding sources and funder records."
      queryKey={["research", "funders"]}
      resource={researchServiceApi.funders}
      manageScopes={["funding.manage", "research.manage_grants", "research:write"]}
      fields={[
        { name: "name", label: "Name", required: true },
        { name: "slug", label: "Slug" },
        { name: "acronym", label: "Acronym" },
        { name: "funder_type", label: "Funder Type", placeholder: "government" },
        { name: "website", label: "Website", type: "url" },
        { name: "email", label: "Email", type: "email" },
        { name: "about", label: "About", type: "textarea" },
        { name: "is_active", label: "Active", type: "boolean" },
        { name: "is_featured", label: "Featured", type: "boolean" },
      ]}
      defaults={{ funder_type: "government" }}
      emptyMessage="No funder records were returned by the research service."
      importResource="research-funders"
    />
  );
}
