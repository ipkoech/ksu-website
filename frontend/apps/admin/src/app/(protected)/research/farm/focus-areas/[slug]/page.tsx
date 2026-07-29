"use client";

import { researchServiceApi } from "@ksu/api-client";
import { ResearchAdminDetailPage } from "../../../_components/research-admin-detail-page";

export default function FarmFocusAreaDetailPage() {
  return (
    <ResearchAdminDetailPage
      title="Farm Focus Area"
      description="View farm focus area metadata, public status, and audit history."
      resource={researchServiceApi.focusAreas}
      backHref="/research/farm/focus-areas"
      publicHrefBase="/focus-areas"
      labelFields={["code", "is_active", "is_featured"]}
      factFields={[
        { label: "Code", field: "code" },
        { label: "Active", field: "is_active", format: "boolean" },
        { label: "Featured", field: "is_featured", format: "boolean" },
      ]}
      sections={[
        { title: "Focus Area", fields: ["description", "summary", "display_order"] },
      ]}
      auditResourceTypes={["research_focus_area", "focus_areas", "focus-area"]}
    />
  );
}
