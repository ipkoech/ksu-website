"use client";

import { researchServiceApi } from "@ksu/api-client";
import { ResearchAdminDetailPage } from "../../_components/research-admin-detail-page";

export default function ResearchCenterDetailPage() {
  return (
    <ResearchAdminDetailPage
      title="Research Center"
      description="View center profile, mandate, contact information, and public content fields."
      resource={researchServiceApi.centers}
      backHref="/research/centers"
      publicHrefBase="/centers"
      labelFields={["center_type", "status"]}
      factFields={[
        { label: "Code", field: "code" },
        { label: "Acronym", field: "acronym" },
        { label: "Established", field: "established_date", format: "date" },
        { label: "Email", field: "email" },
        { label: "Phone", field: "phone" },
        { label: "Featured", field: "is_featured", format: "boolean" },
      ]}
      sections={[
        { title: "Profile", fields: ["summary", "about", "description"] },
        { title: "Mandate", fields: ["mandate", "mission", "vision", "objectives", "research_areas"] },
        { title: "Location and Media", fields: ["location", "address", "website", "logo_image_url", "cover_image_url"] },
      ]}
    />
  );
}
