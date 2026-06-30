"use client";

import type { EditableListFilter, EditableRecordColumn } from "@/components/dashboard/editable-service-resource-page";
import type { ResearchGenericRecord } from "@ksu/api-client";
import { ResearchResourcePage, researchServiceApi } from "../../_components/research-resource-page";
import {
  FundingRelationCell,
  FundingWorkspaceHeader,
  StatusBadge,
} from "../_components/funding-workspace";

const reviewFilters: EditableListFilter[] = [
  { name: "application_id", label: "Application", type: "entity", relation: { adapter: "researchGrantApplication" } },
  { name: "reviewer_id", label: "Reviewer", type: "entity", relation: { adapter: "person", filters: { status: "active" } } },
  { name: "status", label: "Status", type: "select", options: [
    { label: "Pending", value: "pending" },
    { label: "In Progress", value: "in_progress" },
    { label: "Completed", value: "completed" },
  ] },
];

const reviewColumns: EditableRecordColumn<ResearchGenericRecord>[] = [
  {
    key: "application",
    label: "Application",
    className: "min-w-[240px]",
    render: (record) => <FundingRelationCell id={record.application_id} adapterKey="researchGrantApplication" emptyLabel="No application" />,
  },
  {
    key: "reviewer",
    label: "Reviewer",
    className: "min-w-[220px]",
    render: (record) => <FundingRelationCell id={record.reviewer_id} adapterKey="person" emptyLabel="No reviewer" />,
  },
  {
    key: "score",
    label: "Score",
    render: (record) => <span className="font-medium">{record.overall_score ?? "Not scored"}</span>,
  },
  {
    key: "recommendation",
    label: "Recommendation",
    render: (record) => <StatusBadge value={record.recommendation} />,
  },
  {
    key: "status",
    label: "Status",
    render: (record) => <StatusBadge value={record.status} />,
  },
];

export default function GrantReviewsPage() {
  return (
    <ResearchResourcePage
      title="Grant Reviews"
      description="Manage reviewer scores, comments, recommendations, and review status."
      queryKey={["research", "grant-reviews"]}
      resource={researchServiceApi.grantReviews}
      manageScopes={["funding.manage", "research.review_grants", "research:write"]}
      summarySlot={<FundingWorkspaceHeader />}
      listFilters={reviewFilters}
      recordColumns={reviewColumns}
      fields={[
        { name: "application_id", label: "Application", type: "entity", required: true, relation: { adapter: "researchGrantApplication", allowClear: false } },
        { name: "reviewer_id", label: "Reviewer", type: "entity", required: true, relation: { adapter: "person", filters: { status: "active" }, allowClear: false } },
        { name: "overall_score", label: "Overall Score", type: "number" },
        { name: "strengths", label: "Strengths", type: "textarea" },
        { name: "weaknesses", label: "Weaknesses", type: "textarea" },
        { name: "comments", label: "Comments", type: "textarea" },
        { name: "recommendation", label: "Recommendation", type: "select", options: [
          { label: "Approve", value: "approve" },
          { label: "Reject", value: "reject" },
          { label: "Revise", value: "revise" },
          { label: "Defer", value: "defer" },
        ] },
        { name: "status", label: "Decision Status", type: "select", options: [
          { label: "Pending", value: "pending" },
          { label: "In Progress", value: "in_progress" },
          { label: "Completed", value: "completed" },
        ] },
      ]}
      defaults={{ status: "pending" }}
      emptyMessage="No grant reviews were returned by the research service."
      metaFields={["overall_score", "recommendation", "status"]}
      detailHref={(record) => `/research/fundings/reviews/${record.id}`}
    />
  );
}
