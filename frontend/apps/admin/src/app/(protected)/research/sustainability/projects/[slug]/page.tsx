"use client";

import { researchServiceApi } from "@ksu/api-client";
import { ResearchAdminDetailPage } from "../../../_components/research-admin-detail-page";

export default function SustainabilityInitiativeDetailPage() {
  return (
    <ResearchAdminDetailPage
      title="Sustainability Initiative"
      description="View sustainability objectives, approach, activities, impact, and public contact fields."
      resource={researchServiceApi.sustainability}
      backHref="/research/sustainability/projects"
      publicHrefBase="/sustainability"
      labelFields={["initiative_type", "status"]}
      factFields={[
        { label: "Code", field: "code" },
        { label: "Start", field: "start_date", format: "date" },
        { label: "End", field: "end_date", format: "date" },
        { label: "Contact", field: "contact_email" },
        { label: "Featured", field: "is_featured", format: "boolean" },
      ]}
      sections={[
        { title: "Overview", fields: ["summary", "description"] },
        { title: "Approach", fields: ["objectives", "approach", "activities"] },
        { title: "Impact", fields: ["impact", "sdg_goals", "website", "video_url", "cover_image_url"] },
      ]}
    />
  );
}
