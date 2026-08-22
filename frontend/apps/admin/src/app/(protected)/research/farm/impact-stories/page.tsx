"use client";

import { ResearchResourcePage, researchServiceApi } from "../../_components/research-resource-page";
import { FarmWorkspaceHeader } from "../_components/farm-workspace";

export default function FarmImpactStoriesPage() {
  return (
    <ResearchResourcePage
      title="Farm Impact Stories"
      description="Manage impact stories linked to university farm activities."
      queryKey={["research", "farm-impact-stories"]}
      resource={researchServiceApi.stories}
      manageScopes={["farm.manage", "research:write"]}
      importResource="research-stories"
      summarySlot={<FarmWorkspaceHeader />}
      detailBaseHref="/research/farm/impact-stories"
      fields={[
        { name: "title", label: "Title", required: true },
        { name: "slug", label: "Slug" },
        { name: "story_type", label: "Story Type", type: "select", placeholder: "Select type", options: [
          { label: "Impact", value: "impact" },
          { label: "Community", value: "community" },
          { label: "Collaboration", value: "collaboration" },
          { label: "Innovation", value: "innovation" },
          { label: "Policy", value: "policy" },
        ] },
        { name: "summary", label: "Summary", type: "textarea" },
        { name: "impact", label: "Impact", type: "textarea" },
        { name: "location", label: "Location" },
        { name: "story_date", label: "Story Date", type: "date" },
        { name: "status", label: "Status", type: "select", placeholder: "Select status", options: [
          { label: "Draft", value: "draft" },
          { label: "Published", value: "published" },
          { label: "Archived", value: "archived" },
        ] },
        { name: "is_active", label: "Active", type: "boolean" },
        { name: "is_featured", label: "Featured", type: "boolean" },
      ]}
      defaults={{ story_type: "community", status: "published" }}
      emptyMessage="No farm impact stories were returned by the research service."
    />
  );
}
