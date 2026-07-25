"use client";

import type { EditableListFilter, EditableRecordColumn } from "@/components/dashboard/editable-service-resource-page";
import type { ResearchGenericRecord } from "@ksu/api-client";
import { ResearchResourcePage, researchServiceApi } from "../../_components/research-resource-page";
import { FundingPageChrome, labelize, MoneyValue, StatusBadge } from "../_components/funding-workspace";

const endowmentFilters: EditableListFilter[] = [
  { name: "search", label: "Search", type: "text", placeholder: "Search endowments" },
  { name: "fund_type", label: "Fund Type", type: "select", options: [
    { label: "General", value: "general" },
    { label: "Named", value: "named" },
    { label: "Restricted", value: "restricted" },
    { label: "Scholarship", value: "scholarship" },
    { label: "Chair", value: "chair" },
  ] },
  { name: "status", label: "Status", type: "select", options: [
    { label: "Active", value: "active" },
    { label: "Paused", value: "paused" },
    { label: "Closed", value: "closed" },
  ] },
  { name: "is_accepting_contributions", label: "Accepting Contributions", type: "boolean" },
  { name: "is_active", label: "Active", type: "boolean" },
];

const endowmentColumns: EditableRecordColumn<ResearchGenericRecord>[] = [
  {
    key: "name",
    label: "Endowment",
    className: "min-w-[260px]",
    render: (record) => (
      <div className="space-y-1">
        <p className="font-medium">{record.name ?? "Unnamed endowment"}</p>
        <p className="text-xs text-muted-foreground">{[record.code, labelize(record.fund_type)].filter(Boolean).join(" · ")}</p>
      </div>
    ),
  },
  {
    key: "value",
    label: "Current Value",
    render: (record) => <MoneyValue amount={record.current_value ?? record.principal_amount} currency={record.currency} />,
  },
  {
    key: "donor",
    label: "Donor",
    render: (record) => <span className="text-sm text-muted-foreground">{record.donor_name ?? "No donor named"}</span>,
  },
  {
    key: "status",
    label: "Status",
    render: (record) => <StatusBadge value={record.status} />,
  },
  {
    key: "contributions",
    label: "Contributions",
    render: (record) => <span className="text-sm">{record.is_accepting_contributions ? "Open" : "Closed"}</span>,
  },
];

export default function EndowmentsPage() {
  return (
    <ResearchResourcePage
      title="Endowment Funds"
      description="Manage research endowment funds, values, donors, and contribution status."
      queryKey={["research", "endowments"]}
      resource={researchServiceApi.endowments}
      manageScopes={["research.manage_endowments", "funding.manage", "research:write"]}
      {...FundingPageChrome({ guideTitle: "Endowment Funds", resourceKey: "research-endowments", importResource: "research-endowments" })}
      listFilters={endowmentFilters}
      recordColumns={endowmentColumns}
      fields={[
        { name: "name", label: "Name", required: true },
        { name: "slug", label: "Slug" },
        { name: "code", label: "Code" },
        { name: "fund_type", label: "Fund Type", type: "select", options: [
          { label: "General", value: "general" },
          { label: "Named", value: "named" },
          { label: "Restricted", value: "restricted" },
          { label: "Scholarship", value: "scholarship" },
          { label: "Chair", value: "chair" },
        ] },
        { name: "purpose", label: "Purpose", type: "richtext" },
        { name: "description", label: "Description", type: "richtext" },
        { name: "principal_amount", label: "Principal Amount", type: "number" },
        { name: "current_value", label: "Current Value", type: "number" },
        { name: "currency", label: "Currency", placeholder: "KES" },
        { name: "donor_name", label: "Donor Name" },
        { name: "donor_message", label: "Donor Message", type: "richtext" },
        {
          name: "cover_image_id",
          label: "Cover Image",
          type: "media",
          media: { mediaType: "image", accept: "image/*", uploadEntityType: "research_endowment", uploadRole: "endowment-cover" },
        },
        {
          name: "attachment_media_ids",
          label: "File Attachments",
          type: "entity-multi",
          relation: { adapter: "media", description: "Attach deeds, donor agreements, reports, and supporting files." },
          placeholder: "Add attachment",
        },
        {
          name: "document_media_ids",
          label: "Supporting Documents",
          type: "entity-multi",
          relation: { adapter: "media", description: "Select existing media documents linked to this endowment." },
          placeholder: "Add document",
        },
        { name: "status", label: "Status", type: "select", options: [
          { label: "Active", value: "active" },
          { label: "Paused", value: "paused" },
          { label: "Closed", value: "closed" },
        ] },
        { name: "is_accepting_contributions", label: "Accepting Contributions", type: "boolean" },
        { name: "is_active", label: "Active", type: "boolean" },
        { name: "is_featured", label: "Featured", type: "boolean" },
      ]}
      defaults={{ fund_type: "general", currency: "KES", status: "active" }}
      emptyMessage="No endowment funds were returned by the research service."
      importResource="research-endowments"
      detailHref={(record) => `/research/fundings/endowments/${record.id}`}
    />
  );
}
