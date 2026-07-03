"use client";

import type { EditableListFilter, EditableRecordColumn } from "@/components/dashboard/editable-service-resource-page";
import type { ResearchGenericRecord } from "@ksu/api-client";
import { ResearchResourcePage, researchServiceApi } from "../../_components/research-resource-page";
import { formatPublicationDate, labelize, StatusBadge } from "../../publications/_components/publication-workspace";
import { ResearchSettingsWorkspaceHeader } from "../_components/settings-workspace";

const guidelineFilters: EditableListFilter[] = [
  { name: "search", label: "Search", type: "text", placeholder: "Search titles, codes, document names" },
  { name: "guideline_type", label: "Guideline Type", type: "text", placeholder: "guideline, policy, form" },
  { name: "category", label: "Category", type: "text", placeholder: "general, grants, ethics" },
  { name: "status", label: "Status", type: "text", placeholder: "active, draft, retired" },
  { name: "is_mandatory", label: "Mandatory", type: "boolean" },
  { name: "is_active", label: "Active", type: "boolean" },
];

const guidelineColumns: EditableRecordColumn<ResearchGenericRecord>[] = [
  {
    key: "guideline",
    label: "Guideline",
    className: "min-w-[280px]",
    render: (record) => (
      <div className="space-y-1">
        <p className="font-medium">{record.title}</p>
        <p className="text-xs text-muted-foreground">{[record.code, labelize(record.guideline_type), record.version].filter(Boolean).join(" · ")}</p>
      </div>
    ),
  },
  {
    key: "document",
    label: "Document",
    className: "hidden min-w-[220px] lg:table-cell",
    render: (record) => <span>{record.document_name || record.document_url || "No document"}</span>,
  },
  {
    key: "dates",
    label: "Effective / Review",
    className: "hidden min-w-[180px] xl:table-cell",
    render: (record) => <span>{[formatPublicationDate(record.effective_date), formatPublicationDate(record.review_date)].filter(Boolean).join(" - ") || "No dates"}</span>,
  },
  {
    key: "required",
    label: "Required",
    className: "hidden w-[120px] xl:table-cell",
    render: (record) => <span>{record.is_mandatory ? "Mandatory" : "Optional"}</span>,
  },
  {
    key: "status",
    label: "Status",
    className: "w-[120px]",
    render: (record) => <StatusBadge value={record.status ?? (record.is_active ? "active" : "inactive")} />,
  },
];

export default function ResearchGuidelinesPage() {
  return (
    <ResearchResourcePage
      title="Research Policies"
      description="Manage research policies, procedures, forms, and operational guidelines."
      queryKey={["research", "guidelines"]}
      resource={researchServiceApi.guidelines}
      manageScopes={["research.manage_guidelines", "research:write"]}
      summarySlot={<ResearchSettingsWorkspaceHeader />}
      fields={[
        { name: "title", label: "Title", required: true },
        { name: "slug", label: "Slug" },
        { name: "code", label: "Code" },
        { name: "guideline_type", label: "Guideline Type", placeholder: "guideline" },
        { name: "category", label: "Category", placeholder: "general" },
        { name: "summary", label: "Summary", type: "textarea" },
        { name: "content", label: "Content", type: "textarea" },
        { name: "scope", label: "Scope", type: "textarea" },
        { name: "applicability", label: "Applicability", type: "textarea" },
        { name: "document_name", label: "Document Name" },
        { name: "document_url", label: "Document URL", type: "url" },
        { name: "version", label: "Version" },
        { name: "approved_by", label: "Approved By" },
        { name: "approval_date", label: "Approval Date", type: "date" },
        { name: "effective_date", label: "Effective Date", type: "date" },
        { name: "review_date", label: "Review Date", type: "date" },
        { name: "contact_email", label: "Contact Email", type: "email" },
        { name: "status", label: "Status", placeholder: "active" },
        { name: "is_mandatory", label: "Mandatory", type: "boolean" },
        { name: "is_active", label: "Active", type: "boolean" },
      ]}
      defaults={{ guideline_type: "guideline", category: "general", status: "active" }}
      listFilters={guidelineFilters}
      recordColumns={guidelineColumns}
      emptyMessage="No research guidelines were returned by the research service."
      metaFields={["guideline_type", "category", "status"]}
      detailHref={(record) => `/research/guidelines/${record.id}`}
      editorMode="sheet"
    />
  );
}
