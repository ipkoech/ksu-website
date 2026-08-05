"use client";

import type { EditableListFilter, EditableRecordColumn } from "@/components/dashboard/editable-service-resource-page";
import type { ResearchGenericRecord } from "@ksu/api-client";
import { ResearchResourcePage, researchServiceApi } from "../_components/research-resource-page";
import { labelize, StatusBadge } from "../publications/_components/publication-workspace";

const expertiseFilters: EditableListFilter[] = [
  { name: "search", label: "Search", type: "text", placeholder: "Search expertise tags" },
  { name: "category", label: "Category", type: "text", placeholder: "Category" },
  { name: "is_active", label: "Active", type: "boolean" },
];

const expertiseColumns: EditableRecordColumn<ResearchGenericRecord>[] = [
  {
    key: "tag",
    label: "Expertise",
    className: "min-w-[260px]",
    render: (record) => (
      <div className="space-y-1">
        <p className="font-medium">{record.name}</p>
        <p className="text-xs text-muted-foreground">{record.slug || "No slug"}</p>
      </div>
    ),
  },
  {
    key: "category",
    label: "Category",
    className: "min-w-[160px]",
    render: (record) => <span>{labelize(record.category) || "Uncategorized"}</span>,
  },
  {
    key: "status",
    label: "Status",
    className: "w-[120px]",
    render: (record) => <StatusBadge value={record.is_active ? "active" : "inactive"} />,
  },
];

export default function ResearchExpertiseTagsPage() {
  return (
    <ResearchResourcePage
      title="Expertise Tags"
      description="Manage research expertise tags for discovery and staff/project classification."
      queryKey={["research", "expertise-tags"]}
      resource={researchServiceApi.expertiseTags}
      manageScopes={["research.manage_projects", "research:write"]}
      fields={[
        { name: "name", label: "Name", required: true },
        { name: "slug", label: "Slug" },
        { name: "category", label: "Category" },
        { name: "description", label: "Description", type: "textarea" },
        { name: "is_active", label: "Active", type: "boolean" },
      ]}
      listFilters={expertiseFilters}
      recordColumns={expertiseColumns}
      emptyMessage="No expertise tags were returned by the research service."
      metaFields={["category", "is_active"]}
      importResource="research-expertise-tags"
      detailHref={(record) => `/research/expertise-tags/${record.id}`}
    />
  );
}
