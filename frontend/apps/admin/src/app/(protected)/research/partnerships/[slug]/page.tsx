"use client";

import { researchServiceApi } from "@ksu/api-client";
import { ResearchAdminDetailPage } from "../../_components/research-admin-detail-page";

export default function ResearchPartnerDetailPage() {
  return (
    <ResearchAdminDetailPage
      title="Research Partner"
      description="View partner profile, collaboration areas, contact details, and public status."
      resource={researchServiceApi.partners}
      backHref="/research/partnerships"
      publicHrefBase="/partners"
      auditResourceTypes={["partner", "partners", "research_partner"]}
      labelFields={["partner_type", "partnership_level", "status"]}
      factFields={[
        { label: "Acronym", field: "acronym" },
        { label: "Country", field: "country" },
        { label: "Email", field: "email" },
        { label: "Website", field: "website" },
        { label: "Public", field: "is_public", format: "boolean" },
      ]}
      sections={[
        { title: "Profile", fields: ["about", "summary", "description"] },
        { title: "Collaboration", fields: ["collaboration_areas", "key_achievements"] },
      ]}
    />
  );
}
