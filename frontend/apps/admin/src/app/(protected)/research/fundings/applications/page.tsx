"use client";

import type { EditableListFilter, EditableRecordColumn } from "@/components/dashboard/editable-service-resource-page";
import type { ResearchGenericRecord } from "@ksu/api-client";
import { ResearchResourcePage, researchServiceApi } from "../../_components/research-resource-page";
import {
  formatFundingDate,
  FundingRelationCell,
  FundingWorkspaceHeader,
  StatusBadge,
} from "../_components/funding-workspace";

const applicationFilters: EditableListFilter[] = [
  { name: "search", label: "Search", type: "text", placeholder: "Search applications" },
  { name: "grant_id", label: "Grant", type: "entity", relation: { adapter: "researchGrant", filters: { is_active: true } } },
  { name: "applicant_id", label: "Applicant", type: "entity", relation: { adapter: "person", filters: { status: "active" } } },
  { name: "status", label: "Status", type: "select", options: [
    { label: "Draft", value: "draft" },
    { label: "Submitted", value: "submitted" },
    { label: "Under Review", value: "under_review" },
    { label: "Shortlisted", value: "shortlisted" },
    { label: "Approved", value: "approved" },
    { label: "Rejected", value: "rejected" },
    { label: "Withdrawn", value: "withdrawn" },
  ] },
];

const applicationColumns: EditableRecordColumn<ResearchGenericRecord>[] = [
  {
    key: "applicant",
    label: "Applicant / Project",
    className: "min-w-[260px]",
    render: (record) => (
      <div className="space-y-2">
        <FundingRelationCell id={record.applicant_id} adapterKey="person" emptyLabel="No applicant" />
        <p className="text-sm text-muted-foreground">{record.project_title ?? "No project title"}</p>
      </div>
    ),
  },
  {
    key: "grant",
    label: "Grant / Call",
    className: "min-w-[220px]",
    render: (record) => <FundingRelationCell id={record.grant_id} adapterKey="researchGrant" emptyLabel="No grant" />,
  },
  {
    key: "submitted",
    label: "Submitted",
    render: (record) => <span className="text-sm text-muted-foreground">{formatFundingDate(record.submitted_at) || "Not submitted"}</span>,
  },
  {
    key: "status",
    label: "Status",
    render: (record) => <StatusBadge value={record.status} />,
  },
  {
    key: "reviewer",
    label: "Reviewer",
    render: () => <span className="text-sm text-muted-foreground">Assigned in reviews</span>,
  },
  {
    key: "decision",
    label: "Decision",
    render: (record) => (
      <div className="space-y-1">
        <StatusBadge value={record.status} />
        <p className="text-xs text-muted-foreground">{formatFundingDate(record.decision_date) || "No decision date"}</p>
      </div>
    ),
  },
];

export default function GrantApplicationsPage() {
  return (
    <ResearchResourcePage
      title="Grant Applications"
      description="Manage submitted grant applications and review status."
      queryKey={["research", "grant-applications"]}
      resource={researchServiceApi.grantApplications}
      manageScopes={["funding.manage", "research.review_grants", "research:write"]}
      summarySlot={<FundingWorkspaceHeader />}
      listFilters={applicationFilters}
      recordColumns={applicationColumns}
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
        { name: "status", label: "Status", type: "select", options: [
          { label: "Draft", value: "draft" },
          { label: "Submitted", value: "submitted" },
          { label: "Under Review", value: "under_review" },
          { label: "Shortlisted", value: "shortlisted" },
          { label: "Approved", value: "approved" },
          { label: "Rejected", value: "rejected" },
          { label: "Withdrawn", value: "withdrawn" },
        ] },
      ]}
      defaults={{ currency: "KES", status: "draft" }}
      emptyMessage="No grant applications were returned by the research service."
      metaFields={["application_number", "requested_amount", "status"]}
    />
  );
}
