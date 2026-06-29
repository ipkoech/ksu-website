"use client";

import type { EditableListFilter, EditableRecordColumn } from "@/components/dashboard/editable-service-resource-page";
import type { ResearchGenericRecord } from "@ksu/api-client";
import { ResearchResourcePage, researchServiceApi } from "../../_components/research-resource-page";
import { FundingWorkspaceHeader, labelize } from "../_components/funding-workspace";

const funderFilters: EditableListFilter[] = [
  { name: "search", label: "Search", type: "text", placeholder: "Search funders" },
  { name: "funder_type", label: "Funder Type", type: "select", options: [
    { label: "Government", value: "government" },
    { label: "Foundation", value: "foundation" },
    { label: "Corporate", value: "corporate" },
    { label: "NGO", value: "ngo" },
    { label: "International", value: "international" },
    { label: "University", value: "university" },
  ] },
  { name: "is_active", label: "Active", type: "boolean" },
];

const funderColumns: EditableRecordColumn<ResearchGenericRecord>[] = [
  {
    key: "name",
    label: "Funder",
    className: "min-w-[260px]",
    render: (record) => (
      <div className="space-y-1">
        <p className="font-medium">{record.name ?? "Unnamed funder"}</p>
        <p className="text-xs text-muted-foreground">{record.acronym ?? labelize(record.funder_type)}</p>
      </div>
    ),
  },
  {
    key: "type",
    label: "Type",
    render: (record) => <span className="text-sm">{labelize(record.funder_type)}</span>,
  },
  {
    key: "contact",
    label: "Contact",
    render: (record) => <span className="text-sm text-muted-foreground">{record.email ?? record.website ?? "No contact"}</span>,
  },
  {
    key: "status",
    label: "Status",
    render: (record) => <span className="text-sm">{record.is_active === false ? "Inactive" : "Active"}</span>,
  },
];

export default function ResearchFundersPage() {
  return (
    <ResearchResourcePage
      title="Funders"
      description="Manage research funding sources and funder records."
      queryKey={["research", "funders"]}
      resource={researchServiceApi.funders}
      manageScopes={["funding.manage", "research.manage_grants", "research:write"]}
      summarySlot={<FundingWorkspaceHeader />}
      listFilters={funderFilters}
      recordColumns={funderColumns}
      fields={[
        { name: "name", label: "Name", required: true },
        { name: "slug", label: "Slug" },
        { name: "acronym", label: "Acronym" },
        { name: "funder_type", label: "Funder Type", type: "select", options: [
          { label: "Government", value: "government" },
          { label: "Foundation", value: "foundation" },
          { label: "Corporate", value: "corporate" },
          { label: "NGO", value: "ngo" },
          { label: "International", value: "international" },
          { label: "University", value: "university" },
        ] },
        { name: "website", label: "Website", type: "url" },
        { name: "email", label: "Email", type: "email" },
        { name: "about", label: "About", type: "textarea" },
        { name: "is_active", label: "Active", type: "boolean" },
        { name: "is_featured", label: "Featured", type: "boolean" },
      ]}
      defaults={{ funder_type: "government" }}
      emptyMessage="No funder records were returned by the research service."
      importResource="research-funders"
    />
  );
}
