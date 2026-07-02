"use client";

import type { EditableListFilter, EditableRecordColumn } from "@/components/dashboard/editable-service-resource-page";
import type { ResearchGenericRecord } from "@ksu/api-client";
import { ResearchResourcePage, researchServiceApi } from "../../_components/research-resource-page";
import { FundingPageChrome, FundingRelationCell } from "../_components/funding-workspace";

const guidelineFilters: EditableListFilter[] = [
  { name: "grant_id", label: "Grant", type: "entity", relation: { adapter: "researchGrant", filters: { is_active: true } } },
  { name: "guideline_type", label: "Guideline Type", type: "select", options: [
    { label: "Procedure", value: "procedure" },
    { label: "Template", value: "template" },
    { label: "FAQ", value: "faq" },
    { label: "Criterion", value: "criterion" },
    { label: "Checklist", value: "checklist" },
  ] },
  { name: "is_required", label: "Required", type: "boolean" },
  { name: "is_active", label: "Active", type: "boolean" },
];

const guidelineColumns: EditableRecordColumn<ResearchGenericRecord>[] = [
  {
    key: "title",
    label: "Guideline",
    className: "min-w-[260px]",
    render: (record) => (
      <div className="space-y-1">
        <p className="font-medium">{record.title ?? "Untitled guideline"}</p>
        <p className="text-xs text-muted-foreground">{record.guideline_type ?? "procedure"}</p>
      </div>
    ),
  },
  {
    key: "grant",
    label: "Grant",
    render: (record) => <FundingRelationCell id={record.grant_id} adapterKey="researchGrant" emptyLabel="No grant" />,
  },
  {
    key: "document",
    label: "Document",
    render: (record) => <span className="text-sm text-muted-foreground">{record.document_name ?? record.document_url ?? "No document"}</span>,
  },
  {
    key: "required",
    label: "Required",
    render: (record) => <span className="text-sm">{record.is_required ? "Yes" : "No"}</span>,
  },
];

export default function GrantGuidelinesPage() {
  return (
    <ResearchResourcePage
      title="Grant Guidelines"
      description="Manage grant procedures, requirements, and supporting documents."
      queryKey={["research", "grant-guidelines"]}
      resource={researchServiceApi.grantGuidelines}
      manageScopes={["funding.manage", "research.manage_grant_guidelines", "research:write"]}
      {...FundingPageChrome({ guideTitle: "Grant Guidelines", resourceKey: "research-grant-guidelines", importResource: "research-grant-guidelines" })}
      listFilters={guidelineFilters}
      recordColumns={guidelineColumns}
      fields={[
        { name: "grant_id", label: "Grant", type: "entity", required: true, relation: { adapter: "researchGrant", allowClear: false } },
        { name: "title", label: "Title", required: true },
        { name: "slug", label: "Slug" },
        { name: "guideline_type", label: "Guideline Type", type: "select", options: [
          { label: "Procedure", value: "procedure" },
          { label: "Template", value: "template" },
          { label: "FAQ", value: "faq" },
          { label: "Criterion", value: "criterion" },
          { label: "Checklist", value: "checklist" },
        ] },
        { name: "content", label: "Content", type: "richtext" },
        {
          name: "document_id",
          label: "Guideline Document",
          type: "media",
          media: {
            uploadEntityType: "research_grant_guideline",
            uploadRole: "grant-guideline-document",
            accept: ".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,image/*",
            helperText: "Upload or choose the official guideline file.",
          },
        },
        { name: "document_url", label: "Document URL", type: "url" },
        { name: "document_name", label: "Document Name" },
        { name: "is_required", label: "Required", type: "boolean" },
        { name: "is_active", label: "Active", type: "boolean" },
      ]}
      defaults={{ guideline_type: "procedure" }}
      emptyMessage="No grant guidelines were returned by the research service."
      metaFields={["guideline_type", "document_name"]}
      importResource="research-grant-guidelines"
      detailHref={(record) => `/research/fundings/guidelines/${record.id}`}
    />
  );
}
