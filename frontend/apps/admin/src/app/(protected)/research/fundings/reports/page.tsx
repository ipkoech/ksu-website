"use client";

import { ResearchResourcePage, researchServiceApi } from "../../_components/research-resource-page";

export default function GrantReportsPage() {
  return (
    <ResearchResourcePage
      title="Grant Reports"
      description="Manage grant progress, financial, and final reports."
      queryKey={["research", "grant-reports"]}
      resource={researchServiceApi.grantReports}
      manageScopes={["funding.manage", "research.manage_reports", "research:write"]}
      fields={[
        { name: "grant_id", label: "Grant", type: "entity", required: true, relation: { adapter: "researchGrant", filters: { is_active: true }, allowClear: false } },
        { name: "application_id", label: "Application", type: "entity", relation: { adapter: "researchGrantApplication" } },
        { name: "project_id", label: "Project", type: "entity", relation: { adapter: "researchProject", filters: { is_active: true } } },
        { name: "submitter_id", label: "Submitter", type: "entity", required: true, relation: { adapter: "person", filters: { status: "active" }, allowClear: false } },
        { name: "report_type", label: "Report Type", placeholder: "progress" },
        { name: "title", label: "Title", required: true },
        { name: "reporting_period_start", label: "Period Start", type: "date" },
        { name: "reporting_period_end", label: "Period End", type: "date" },
        { name: "summary", label: "Summary", type: "textarea" },
        { name: "amount_spent", label: "Amount Spent", type: "number" },
        { name: "balance", label: "Balance", type: "number" },
        { name: "status", label: "Status", placeholder: "draft" },
      ]}
      defaults={{ report_type: "progress", status: "draft" }}
      emptyMessage="No grant reports were returned by the research service."
      metaFields={["report_type", "status", "submitted_at"]}
    />
  );
}
