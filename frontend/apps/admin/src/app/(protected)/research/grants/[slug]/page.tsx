"use client";

import { researchServiceApi } from "@ksu/api-client";
import { ResearchAdminDetailPage } from "../../_components/research-admin-detail-page";

export default function ResearchGrantDetailPage() {
  return (
    <ResearchAdminDetailPage
      title="Grant"
      description="View grant call details, funder metadata, deadline, and status."
      resource={researchServiceApi.grants}
      backHref="/research/grants"
      publicHrefBase="/funding"
      labelFields={["grant_type", "category", "status"]}
      factFields={[
        { label: "Code", field: "code" },
        { label: "Funder", field: "funder_name" },
        { label: "Deadline", field: "deadline", format: "datetime" },
        { label: "Featured", field: "is_featured", format: "boolean" },
      ]}
      sections={[
        { title: "Summary", fields: ["summary", "description"] },
        { title: "Application", fields: ["eligibility", "requirements", "application_process"] },
      ]}
    />
  );
}
