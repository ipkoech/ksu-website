"use client";

import type { EditableListFilter, EditableRecordColumn } from "@/components/dashboard/editable-service-resource-page";
import type { ResearchGenericRecord } from "@ksu/api-client";
import { ResearchResourcePage, researchServiceApi } from "../../_components/research-resource-page";
import {
  formatFundingDate,
  FundingRelationCell,
  FundingWorkspaceHeader,
  MoneyValue,
  StatusBadge,
} from "../_components/funding-workspace";

const reportFilters: EditableListFilter[] = [
  { name: "grant_id", label: "Grant", type: "entity", relation: { adapter: "researchGrant", filters: { is_active: true } } },
  { name: "project_id", label: "Project", type: "entity", relation: { adapter: "researchProject", filters: { is_active: true } } },
  { name: "submitter_id", label: "Submitter", type: "entity", relation: { adapter: "person", filters: { status: "active" } } },
  { name: "report_type", label: "Report Type", type: "select", options: [
    { label: "Progress", value: "progress" },
    { label: "Interim", value: "interim" },
    { label: "Final", value: "final" },
    { label: "Financial", value: "financial" },
  ] },
  { name: "status", label: "Status", type: "select", options: [
    { label: "Draft", value: "draft" },
    { label: "Submitted", value: "submitted" },
    { label: "Under Review", value: "under_review" },
    { label: "Approved", value: "approved" },
    { label: "Revision Requested", value: "revision_requested" },
  ] },
];

const reportColumns: EditableRecordColumn<ResearchGenericRecord>[] = [
  {
    key: "title",
    label: "Report",
    className: "min-w-[240px]",
    render: (record) => (
      <div className="space-y-1">
        <p className="font-medium">{record.title ?? "Untitled report"}</p>
        <p className="text-xs text-muted-foreground">{record.report_type ?? "progress"}</p>
      </div>
    ),
  },
  {
    key: "grant",
    label: "Grant",
    render: (record) => <FundingRelationCell id={record.grant_id} adapterKey="researchGrant" emptyLabel="No grant" />,
  },
  {
    key: "project",
    label: "Project",
    render: (record) => <FundingRelationCell id={record.project_id} adapterKey="researchProject" emptyLabel="No linked project" />,
  },
  {
    key: "period",
    label: "Period",
    render: (record) => <span className="text-sm text-muted-foreground">{[formatFundingDate(record.reporting_period_start), formatFundingDate(record.reporting_period_end)].filter(Boolean).join(" - ") || "No period"}</span>,
  },
  {
    key: "spend",
    label: "Spent",
    render: (record) => <MoneyValue amount={record.amount_spent} currency="KES" />,
  },
  {
    key: "status",
    label: "Status",
    render: (record) => <StatusBadge value={record.status} />,
  },
];

export default function GrantReportsPage() {
  return (
    <ResearchResourcePage
      title="Grant Reports"
      description="Manage grant progress, financial, and final reports."
      queryKey={["research", "grant-reports"]}
      resource={researchServiceApi.grantReports}
      manageScopes={["funding.manage", "research.manage_reports", "research:write"]}
      summarySlot={<FundingWorkspaceHeader />}
      listFilters={reportFilters}
      recordColumns={reportColumns}
      fields={[
        { name: "grant_id", label: "Grant", type: "entity", required: true, relation: { adapter: "researchGrant", filters: { is_active: true }, allowClear: false } },
        { name: "application_id", label: "Application", type: "entity", relation: { adapter: "researchGrantApplication" } },
        { name: "project_id", label: "Project", type: "entity", relation: { adapter: "researchProject", filters: { is_active: true } } },
        { name: "submitter_id", label: "Submitter", type: "entity", required: true, relation: { adapter: "person", filters: { status: "active" }, allowClear: false } },
        { name: "report_type", label: "Report Type", type: "select", options: [
          { label: "Progress", value: "progress" },
          { label: "Interim", value: "interim" },
          { label: "Final", value: "final" },
          { label: "Financial", value: "financial" },
        ] },
        { name: "title", label: "Title", required: true },
        { name: "reporting_period_start", label: "Period Start", type: "date" },
        { name: "reporting_period_end", label: "Period End", type: "date" },
        { name: "summary", label: "Summary", type: "textarea" },
        { name: "amount_spent", label: "Amount Spent", type: "number" },
        { name: "balance", label: "Balance", type: "number" },
        { name: "status", label: "Status", type: "select", options: [
          { label: "Draft", value: "draft" },
          { label: "Submitted", value: "submitted" },
          { label: "Under Review", value: "under_review" },
          { label: "Approved", value: "approved" },
          { label: "Revision Requested", value: "revision_requested" },
        ] },
      ]}
      defaults={{ report_type: "progress", status: "draft" }}
      emptyMessage="No grant reports were returned by the research service."
      metaFields={["report_type", "status", "submitted_at"]}
    />
  );
}
