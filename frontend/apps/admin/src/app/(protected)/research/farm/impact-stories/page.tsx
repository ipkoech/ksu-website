"use client";

import { ResearchResourcePage, researchServiceApi } from "../../_components/research-resource-page";

export default function FarmImpactStoriesPage() {
  return (
    <ResearchResourcePage
      title="Farm Impact Stories"
      description="Manage impact stories linked to university farm activities."
      queryKey={["research", "farm-impact-stories"]}
      resource={researchServiceApi.stories}
      manageScopes={["research.manage_impact", "sustainability.manage", "research:write"]}
      fields={[
        { name: "title", label: "Title", required: true },
        { name: "slug", label: "Slug" },
        { name: "story_type", label: "Story Type", placeholder: "community" },
        { name: "summary", label: "Summary", type: "textarea" },
        { name: "impact", label: "Impact", type: "textarea" },
        { name: "location", label: "Location" },
        { name: "story_date", label: "Story Date", type: "date" },
        { name: "status", label: "Status", placeholder: "published" },
        { name: "is_active", label: "Active", type: "boolean" },
        { name: "is_featured", label: "Featured", type: "boolean" },
      ]}
      defaults={{ story_type: "community", status: "published" }}
      emptyMessage="No farm impact stories were returned by the research service."
    />
  );
}
