"use client";

import { ResearchResourcePage, researchServiceApi } from "../_components/research-resource-page";

export default function ResearchExpertiseTagsPage() {
  return (
    <ResearchResourcePage
      title="Expertise Tags"
      description="Manage research expertise tags for discovery and staff/project classification."
      queryKey={["research", "expertise-tags"]}
      resource={researchServiceApi.expertiseTags}
      manageScopes={["research.manage_projects", "research:write"]}
      fields={[
        { name: "name", label: "Name", required: true },
        { name: "slug", label: "Slug" },
        { name: "category", label: "Category" },
        { name: "description", label: "Description", type: "textarea" },
        { name: "is_active", label: "Active", type: "boolean" },
      ]}
      emptyMessage="No expertise tags were returned by the research service."
      importResource="research-expertise-tags"
      detailHref={(record) => `/research/expertise-tags/${record.id}`}
    />
  );
}
