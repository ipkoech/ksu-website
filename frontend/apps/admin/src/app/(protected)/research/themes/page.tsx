"use client";

import type { EditableListFilter, EditableRecordColumn } from "@/components/dashboard/editable-service-resource-page";
import type { ResearchGenericRecord } from "@ksu/api-client";
import { ResearchResourcePage, researchServiceApi } from "../_components/research-resource-page";
import { StatusBadge } from "../publications/_components/publication-workspace";

const themeFilters: EditableListFilter[] = [
  { name: "search", label: "Search", type: "text", placeholder: "Search themes or codes" },
  { name: "status", label: "Status", type: "text", placeholder: "active, draft, archived" },
  { name: "is_active", label: "Active", type: "boolean" },
  { name: "is_featured", label: "Featured", type: "boolean" },
];

const themeColumns: EditableRecordColumn<ResearchGenericRecord>[] = [
  {
    key: "theme",
    label: "Theme",
    className: "min-w-[260px]",
    render: (record) => (
      <div className="space-y-1">
        <p className="font-medium">{record.name}</p>
        <p className="text-xs text-muted-foreground">{[record.code, record.slug].filter(Boolean).join(" · ")}</p>
      </div>
    ),
  },
  {
    key: "color",
    label: "Color",
    className: "hidden w-[120px] md:table-cell",
    render: (record) => (
      <span className="inline-flex items-center gap-2 text-sm">
        {record.color ? <span className="h-3 w-3 rounded-full border" style={{ backgroundColor: String(record.color) }} /> : null}
        {record.color || "None"}
      </span>
    ),
  },
  {
    key: "featured",
    label: "Featured",
    className: "hidden w-[120px] lg:table-cell",
    render: (record) => <span>{record.is_featured ? "Yes" : "No"}</span>,
  },
  {
    key: "status",
    label: "Status",
    className: "w-[120px]",
    render: (record) => <StatusBadge value={record.status ?? (record.is_active ? "active" : "inactive")} />,
  },
];

export default function ResearchThemesPage() {
  return (
    <ResearchResourcePage
      title="Research Themes"
      description="Manage cross-cutting research themes used to classify projects and outputs."
      queryKey={["research", "themes"]}
      resource={researchServiceApi.themes}
      manageScopes={["research.manage_projects", "research:write"]}
      fields={[
        { name: "name", label: "Name", required: true },
        { name: "slug", label: "Slug" },
        { name: "code", label: "Code" },
        { name: "description", label: "Description", type: "textarea" },
        { name: "color", label: "Color" },
        { name: "status", label: "Status", placeholder: "active" },
        { name: "is_active", label: "Active", type: "boolean" },
        { name: "is_featured", label: "Featured", type: "boolean" },
      ]}
      defaults={{ status: "active" }}
      listFilters={themeFilters}
      recordColumns={themeColumns}
      emptyMessage="No research themes were returned by the research service."
      metaFields={["code", "status", "is_featured"]}
      importResource="research-themes"
      detailHref={(record) => `/research/themes/${record.id}`}
    />
  );
}
