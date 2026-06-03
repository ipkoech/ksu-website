"use client";

import { ResearchResourcePage, researchServiceApi } from "../_components/research-resource-page";

export default function ResearchInnovationsPage() {
  return (
    <ResearchResourcePage
      title="Innovation"
      description="Manage inventions, disclosures, prototypes, startups, and technology-transfer records."
      queryKey={["research", "innovations"]}
      resource={researchServiceApi.innovations}
      manageScopes={["innovation.review_disclosure", "innovation.manage_ecosystem", "research:write"]}
      fields={[
        { name: "title", label: "Title", required: true },
        { name: "slug", label: "Slug" },
        { name: "innovation_type", label: "Innovation Type", placeholder: "invention" },
        { name: "category", label: "Category" },
        { name: "summary", label: "Summary", type: "textarea" },
        { name: "status", label: "Status", placeholder: "draft" },
        { name: "is_active", label: "Active", type: "boolean" },
        { name: "is_featured", label: "Featured", type: "boolean" },
      ]}
      defaults={{ innovation_type: "invention", status: "draft" }}
      emptyMessage="No innovations were returned by the research service."
    />
  );
}
