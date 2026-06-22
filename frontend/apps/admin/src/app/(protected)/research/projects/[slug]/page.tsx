"use client";

import { researchServiceApi } from "@ksu/api-client";
import { ResearchAdminDetailPage } from "../../_components/research-admin-detail-page";

export default function ResearchProjectDetailPage() {
  return (
    <ResearchAdminDetailPage
      title="Research Project"
      description="View public profile fields, project dates, progress, and publication-ready details."
      resource={researchServiceApi.projects}
      backHref="/research/projects"
      publicHrefBase="/projects"
      labelFields={["project_type", "status"]}
      factFields={[
        { label: "Code", field: "code" },
        { label: "Progress", field: "progress_percentage" },
        { label: "Start", field: "start_date", format: "date" },
        { label: "End", field: "end_date", format: "date" },
        { label: "Grant", field: "grant_id", relation: { adapter: "researchGrant" } },
        { label: "Public", field: "is_public", format: "boolean" },
        { label: "Featured", field: "is_featured", format: "boolean" },
      ]}
      sections={[
        { title: "Overview", fields: ["summary", "abstract", "background"] },
        { title: "Research Design", fields: ["objectives", "methodology", "expected_outcomes", "deliverables"] },
        { title: "Impact and Funding", fields: ["impact", "budget", "currency"] },
      ]}
    />
  );
}
