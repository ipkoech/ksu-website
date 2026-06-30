"use client";

import { researchServiceApi } from "@ksu/api-client";
import { ResearchAdminDetailPage } from "../../_components/research-admin-detail-page";

export default function ExpertiseTagDetailPage() {
  return (
    <ResearchAdminDetailPage
      title="Expertise Tag"
      description="View expertise taxonomy metadata and audit history."
      resource={researchServiceApi.expertiseTags}
      backHref="/research/expertise-tags"
      slugParam="id"
      lookup="id"
      labelFields={["category", "is_active"]}
      factFields={[
        { label: "Category", field: "category", format: "label" },
        { label: "Active", field: "is_active", format: "boolean" },
      ]}
      sections={[
        { title: "Tag", fields: ["name", "description"] },
      ]}
      auditResourceTypes={["expertise_tag", "expertise-tags", "research_expertise_tag"]}
    />
  );
}
