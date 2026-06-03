"use client";

import { ResearchResourcePage, researchServiceApi } from "../../_components/research-resource-page";

export default function GrantApplicationsPage() {
  return (
    <ResearchResourcePage
      title="Grant Applications"
      description="Manage submitted grant applications and review status."
      queryKey={["research", "grant-applications"]}
      resource={researchServiceApi.grantApplications}
      manageScopes={["funding.manage", "research.review_grants", "research:write"]}
      fields={[
        { name: "grant_id", label: "Grant", type: "entity", required: true, relation: { adapter: "researchGrant", filters: { is_active: true }, allowClear: false } },
        { name: "applicant_id", label: "Applicant", type: "entity", required: true, relation: { adapter: "person", filters: { status: "active" }, allowClear: false } },
        { name: "project_title", label: "Project Title", required: true },
        { name: "summary", label: "Summary", type: "textarea" },
        { name: "objectives", label: "Objectives", type: "textarea" },
        { name: "requested_amount", label: "Requested Amount", type: "number" },
        { name: "currency", label: "Currency", placeholder: "KES" },
        { name: "proposed_start_date", label: "Proposed Start", type: "date" },
        { name: "proposed_end_date", label: "Proposed End", type: "date" },
        { name: "status", label: "Status", placeholder: "draft" },
      ]}
      defaults={{ currency: "KES", status: "draft" }}
      emptyMessage="No grant applications were returned by the research service."
      metaFields={["application_number", "requested_amount", "status"]}
    />
  );
}
