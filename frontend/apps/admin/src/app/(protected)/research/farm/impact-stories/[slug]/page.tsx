"use client";

import { researchServiceApi } from "@ksu/api-client";
import { ResearchAdminDetailPage } from "../../../_components/research-admin-detail-page";

export default function FarmImpactStoryDetailPage() {
  return (
    <ResearchAdminDetailPage
      title="Farm Impact Story"
      description="View farm impact story narrative, location, status, publication metadata, and audit history."
      resource={researchServiceApi.stories}
      backHref="/research/farm/impact-stories"
      publicHrefBase="/impact-stories"
      labelFields={["story_type", "status"]}
      factFields={[
        { label: "Location", field: "location" },
        { label: "Story Date", field: "story_date", format: "date" },
        { label: "Active", field: "is_active", format: "boolean" },
        { label: "Featured", field: "is_featured", format: "boolean" },
      ]}
      sections={[
        { title: "Story", fields: ["summary", "impact", "body", "description"] },
      ]}
      auditResourceTypes={["research_story", "stories", "story"]}
    />
  );
}
