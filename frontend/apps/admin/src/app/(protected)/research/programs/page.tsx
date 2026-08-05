"use client";

import type { EditableListFilter, EditableRecordColumn } from "@/components/dashboard/editable-service-resource-page";
import type { ResearchGenericRecord } from "@ksu/api-client";
import { ResearchResourcePage, researchServiceApi } from "../_components/research-resource-page";
import { labelize, StatusBadge } from "../publications/_components/publication-workspace";

const PROGRAM_LIST_FIELDS = "id,name,slug,code,status,is_active,is_featured";

const programFilters: EditableListFilter[] = [
  { name: "search", label: "Search", type: "text", placeholder: "Search programs, codes, or outcomes" },
  { name: "center_id", label: "Research Center", type: "entity", relation: { adapter: "researchCenter", filters: { is_active: true } } },
  { name: "lead_id", label: "Lead", type: "entity", relation: { adapter: "person", filters: { status: "active" } } },
  { name: "status", label: "Status", type: "text", placeholder: "active, draft, completed" },
  { name: "is_active", label: "Active", type: "boolean" },
  { name: "is_featured", label: "Featured", type: "boolean" },
];

const programColumns: EditableRecordColumn<ResearchGenericRecord>[] = [
  {
    key: "program",
    label: "Program",
    className: "min-w-[260px]",
    render: (record) => (
      <div className="space-y-1">
        <p className="font-medium">{record.name}</p>
        <p className="text-xs text-muted-foreground">{[record.code, labelize(record.status)].filter(Boolean).join(" · ")}</p>
      </div>
    ),
  },
  {
    key: "status",
    label: "Status",
    className: "w-[120px]",
    render: (record) => <StatusBadge value={record.status ?? (record.is_active ? "active" : "inactive")} />,
  },
];

export default function ResearchProgramsPage() {
  return (
    <ResearchResourcePage
      title="Research Programs"
      description="Manage research programs linked to centers and research leads."
      queryKey={["research", "programs"]}
      resource={researchServiceApi.programs}
      manageScopes={["research.manage_projects", "research:write"]}
      hideHeader
      fields={[
        { name: "name", label: "Name", required: true },
        { name: "slug", label: "Slug" },
        { name: "code", label: "Code" },
        { name: "center_id", label: "Research Center", type: "entity", relation: { adapter: "researchCenter", filters: { is_active: true } } },
        { name: "lead_id", label: "Lead", type: "entity", relation: { adapter: "person", filters: { status: "active" } } },
        { name: "start_date", label: "Start Date", type: "date" },
        { name: "end_date", label: "End Date", type: "date" },
        { name: "summary", label: "Summary", type: "textarea" },
        { name: "description", label: "Description", type: "textarea" },
        { name: "objectives", label: "Objectives", type: "textarea" },
        { name: "expected_outcomes", label: "Expected Outcomes", type: "textarea" },
        { name: "methodology", label: "Methodology", type: "textarea" },
        { name: "budget", label: "Budget", type: "number" },
        { name: "currency", label: "Currency", placeholder: "KES" },
        { name: "cover_image_url", label: "Cover Image URL", type: "url" },
        { name: "status", label: "Status", placeholder: "active" },
        { name: "is_active", label: "Active", type: "boolean" },
        { name: "is_featured", label: "Featured", type: "boolean" },
      ]}
      defaults={{ currency: "KES", status: "active" }}
      listParams={{ fields: PROGRAM_LIST_FIELDS }}
      listFilters={programFilters}
      recordColumns={programColumns}
      emptyMessage="No research programs were returned by the research service."
      metaFields={["code", "status", "start_date"]}
      importResource="research-programs"
      detailHref={(record) => `/research/programs/${record.id}`}
      editorMode="sheet"
    />
  );
}
