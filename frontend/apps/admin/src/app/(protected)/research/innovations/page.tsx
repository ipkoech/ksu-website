"use client";

import type { EditableListFilter, EditableRecordColumn } from "@/components/dashboard/editable-service-resource-page";
import type { ResearchGenericRecord } from "@ksu/api-client";
import { ResearchResourcePage, researchServiceApi } from "../_components/research-resource-page";
import { formatPublicationDate, labelize, PublicationRelationCell, StatusBadge } from "../publications/_components/publication-workspace";

const innovationFilters: EditableListFilter[] = [
  { name: "search", label: "Search", type: "text", placeholder: "Search innovations, patent numbers, or inventors" },
  { name: "innovation_type", label: "Innovation Type", type: "text", placeholder: "invention, prototype, startup" },
  { name: "project_id", label: "Source Project", type: "entity", relation: { adapter: "researchProject", filters: { is_active: true } } },
  { name: "center_id", label: "Research Center", type: "entity", relation: { adapter: "researchCenter", filters: { is_active: true } } },
  { name: "lead_inventor_id", label: "Lead Inventor", type: "entity", relation: { adapter: "person", filters: { status: "active" } } },
  { name: "status", label: "Status", type: "text", placeholder: "draft, disclosed, licensed" },
  { name: "is_public", label: "Public", type: "boolean" },
  { name: "is_featured", label: "Featured", type: "boolean" },
];

const innovationColumns: EditableRecordColumn<ResearchGenericRecord>[] = [
  {
    key: "innovation",
    label: "Innovation",
    className: "min-w-[280px]",
    render: (record) => (
      <div className="space-y-1">
        <p className="font-medium">{record.title}</p>
        <p className="text-xs text-muted-foreground">{[record.code, labelize(record.innovation_type), labelize(record.development_stage)].filter(Boolean).join(" · ")}</p>
      </div>
    ),
  },
  {
    key: "project",
    label: "Source Project",
    className: "hidden min-w-[220px] lg:table-cell",
    render: (record) => <PublicationRelationCell id={record.project_id} adapterKey="researchProject" emptyLabel="No source project" />,
  },
  {
    key: "inventor",
    label: "Lead",
    className: "hidden min-w-[180px] xl:table-cell",
    render: (record) => <PublicationRelationCell id={record.lead_inventor_id} adapterKey="person" emptyLabel="No lead inventor" />,
  },
  {
    key: "ip",
    label: "IP / Commercial",
    className: "hidden min-w-[180px] xl:table-cell",
    render: (record) => <span>{[labelize(record.ip_status), labelize(record.commercialization_status)].filter(Boolean).join(" · ") || "Not recorded"}</span>,
  },
  {
    key: "date",
    label: "Invented",
    className: "hidden w-[130px] 2xl:table-cell",
    render: (record) => <span>{formatPublicationDate(record.invention_date) || "No date"}</span>,
  },
  {
    key: "status",
    label: "Status",
    className: "w-[120px]",
    render: (record) => <StatusBadge value={record.status} />,
  },
];

export default function ResearchInnovationsPage() {
  return (
    <ResearchResourcePage
      title="Innovation"
      description="Manage inventions, disclosures, prototypes, startups, and technology-transfer records."
      queryKey={["research", "innovations"]}
      resource={researchServiceApi.innovations}
      manageScopes={["innovation.review_disclosure", "innovation.manage_ecosystem", "research:write"]}
      fields={[
        { name: "title", label: "Title", required: true },
        { name: "slug", label: "Slug" },
        { name: "code", label: "Code" },
        { name: "innovation_type", label: "Innovation Type", placeholder: "invention" },
        { name: "category", label: "Category" },
        { name: "project_id", label: "Source Project", type: "entity", relation: { adapter: "researchProject", filters: { is_active: true } } },
        { name: "center_id", label: "Research Center", type: "entity", relation: { adapter: "researchCenter", filters: { is_active: true } } },
        { name: "lead_inventor_id", label: "Lead Inventor", type: "entity", relation: { adapter: "person", filters: { status: "active" } } },
        { name: "summary", label: "Summary", type: "textarea" },
        { name: "description", label: "Description", type: "textarea" },
        { name: "problem_addressed", label: "Problem Addressed", type: "textarea" },
        { name: "solution", label: "Solution", type: "textarea" },
        { name: "benefits", label: "Benefits", type: "textarea" },
        { name: "applications", label: "Applications", type: "textarea" },
        { name: "target_users", label: "Target Users", type: "textarea" },
        { name: "ip_status", label: "IP Status" },
        { name: "patent_number", label: "Patent Number" },
        { name: "patent_filing_date", label: "Patent Filing Date", type: "date" },
        { name: "patent_grant_date", label: "Patent Grant Date", type: "date" },
        { name: "license_type", label: "License Type" },
        { name: "commercialization_status", label: "Commercialization Status" },
        { name: "commercial_value", label: "Commercial Value", type: "number" },
        { name: "revenue_generated", label: "Revenue Generated", type: "number" },
        { name: "currency", label: "Currency", placeholder: "KES" },
        { name: "development_stage", label: "Development Stage", placeholder: "research" },
        { name: "trl_level", label: "TRL Level", type: "number" },
        { name: "invention_date", label: "Invention Date", type: "date" },
        { name: "cover_image_url", label: "Cover Image URL", type: "url" },
        { name: "video_url", label: "Video URL", type: "url" },
        { name: "status", label: "Status", placeholder: "draft" },
        { name: "is_active", label: "Active", type: "boolean" },
        { name: "is_featured", label: "Featured", type: "boolean" },
        { name: "is_public", label: "Public", type: "boolean" },
      ]}
      defaults={{ innovation_type: "invention", currency: "KES", development_stage: "research", status: "draft", is_public: true }}
      listFilters={innovationFilters}
      recordColumns={innovationColumns}
      emptyMessage="No innovations were returned by the research service."
      metaFields={["innovation_type", "development_stage", "ip_status", "status"]}
      importResource="research-innovations"
      detailHref={(record) => `/research/innovations/${record.id}`}
      editorMode="sheet"
    />
  );
}
