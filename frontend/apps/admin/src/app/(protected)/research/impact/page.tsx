"use client";

import type { EditableListFilter, EditableRecordColumn } from "@/components/dashboard/editable-service-resource-page";
import type { ResearchGenericRecord } from "@ksu/api-client";
import { ResearchResourcePage, researchServiceApi } from "../_components/research-resource-page";
import { labelize, StatusBadge } from "../publications/_components/publication-workspace";

const impactFilters: EditableListFilter[] = [
  { name: "search", label: "Search", type: "text", placeholder: "Search metric name, code, unit, or category" },
  { name: "metric_type", label: "Metric Type", type: "text", placeholder: "output, outcome, impact" },
  { name: "category", label: "Category", type: "text", placeholder: "research, sustainability, community" },
  { name: "reporting_year", label: "Reporting Year", type: "text", placeholder: "2026" },
  { name: "is_active", label: "Active", type: "boolean" },
  { name: "is_featured", label: "Featured", type: "boolean" },
];

const impactColumns: EditableRecordColumn<ResearchGenericRecord>[] = [
  {
    key: "metric",
    label: "Metric",
    className: "min-w-[260px]",
    render: (record) => (
      <div className="space-y-1">
        <p className="font-medium">{record.name}</p>
        <p className="text-xs text-muted-foreground">{[record.code, labelize(record.metric_type), labelize(record.category)].filter(Boolean).join(" · ")}</p>
      </div>
    ),
  },
  {
    key: "value",
    label: "Value",
    className: "w-[150px]",
    render: (record) => <span className="font-medium">{[record.value, record.unit].filter((part) => part !== null && part !== undefined && part !== "").join(" ") || "No value"}</span>,
  },
  {
    key: "year",
    label: "Year",
    className: "hidden w-[110px] md:table-cell",
    render: (record) => <span>{record.reporting_year || "No year"}</span>,
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
    render: (record) => <StatusBadge value={record.is_active ? "active" : "inactive"} />,
  },
];

export default function ResearchImpactPage() {
  return (
    <ResearchResourcePage
      title="Impact"
      description="Maintain research impact metrics for outputs, outcomes, and institutional reporting."
      queryKey={["research", "impact-metrics"]}
      resource={researchServiceApi.impactMetrics}
      manageScopes={["research.manage_impact", "sustainability.manage", "research:write"]}
      fields={[
        { name: "name", label: "Name", required: true },
        { name: "slug", label: "Slug" },
        { name: "code", label: "Code" },
        { name: "metric_type", label: "Metric Type", placeholder: "output" },
        { name: "category", label: "Category", placeholder: "research" },
        { name: "value", label: "Value", type: "number" },
        { name: "unit", label: "Unit" },
        { name: "reporting_year", label: "Reporting Year", type: "number" },
        { name: "description", label: "Description", type: "textarea" },
        { name: "is_active", label: "Active", type: "boolean" },
        { name: "is_featured", label: "Featured", type: "boolean" },
      ]}
      defaults={{ metric_type: "output", category: "research", value: 0 }}
      listFilters={impactFilters}
      recordColumns={impactColumns}
      emptyMessage="No impact metrics were returned by the research service."
      metaFields={["metric_type", "category", "reporting_year", "value"]}
      importResource="research-impact-metrics"
      detailHref={(record) => `/research/impact/${record.id}`}
    />
  );
}
