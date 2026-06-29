"use client";

import { Activity, BadgeCheck, Handshake, Leaf, NotebookText } from "lucide-react";
import type { EditableListFilter, EditableRecordColumn } from "@/components/dashboard/editable-service-resource-page";
import type { ResearchGenericRecord } from "@ksu/api-client";
import {
  DateValue,
  labelize,
  RelationCell,
  researchCount,
  ResearchWorkspaceHeader,
  StatusBadge,
  titleOf,
} from "../../_components/research-workspace";

export const sustainabilityTabs = [
  { label: "Dashboard", href: "/research/sustainability" },
  { label: "Projects", href: "/research/sustainability/projects" },
  { label: "Partners", href: "/research/sustainability/partners" },
  { label: "Activities", href: "/research/sustainability/activities" },
  { label: "Impact", href: "/research/impact" },
];

export function SustainabilityWorkspaceHeader() {
  return (
    <ResearchWorkspaceHeader
      tabs={sustainabilityTabs}
      metrics={[
        { title: "Active Projects", queryKey: ["research", "sustainability", "metrics", "projects"], queryFn: () => researchCount("sustainability", { status: "active" }), icon: <Leaf className="h-4 w-4" /> },
        { title: "Partners", queryKey: ["research", "sustainability", "metrics", "partners"], queryFn: () => researchCount("partners", { is_active: true }), icon: <Handshake className="h-4 w-4" /> },
        { title: "Activities", queryKey: ["research", "sustainability", "metrics", "activities"], queryFn: () => researchCount("events" as any, { status: "upcoming" }), icon: <Activity className="h-4 w-4" /> },
        { title: "Impact Records", queryKey: ["research", "sustainability", "metrics", "impact"], queryFn: () => researchCount("impactMetrics", { category: "sustainability" }), icon: <BadgeCheck className="h-4 w-4" /> },
        { title: "Impact Stories", queryKey: ["research", "sustainability", "metrics", "stories"], queryFn: () => researchCount("stories", { status: "published" }), icon: <NotebookText className="h-4 w-4" /> },
      ]}
    />
  );
}

export const sustainabilityFilters: EditableListFilter[] = [
  { name: "search", label: "Search", type: "text", placeholder: "Search project name, code, or summary" },
  { name: "initiative_type", label: "Theme", type: "select", options: [
    { label: "Climate", value: "climate" },
    { label: "Biodiversity", value: "biodiversity" },
    { label: "Conservation", value: "conservation" },
    { label: "Renewable Energy", value: "renewable_energy" },
    { label: "Circular Economy", value: "circular_economy" },
    { label: "Water", value: "water" },
    { label: "Food Security", value: "food_security" },
  ] },
  { name: "center_id", label: "Research Center", type: "entity", relation: { adapter: "researchCenter", filters: { is_active: true } } },
  { name: "status", label: "Status", type: "select", options: [
    { label: "Planning", value: "planning" },
    { label: "Active", value: "active" },
    { label: "Completed", value: "completed" },
    { label: "Suspended", value: "suspended" },
  ] },
];

export const sustainabilityColumns: Array<EditableRecordColumn<ResearchGenericRecord>> = [
  { key: "project", label: "Project Title", className: "min-w-[260px]", render: (record) => <span className="font-medium">{titleOf(record)}</span> },
  {
    key: "theme",
    label: "Theme / SDG",
    className: "min-w-[180px]",
    render: (record) => (
      <div className="space-y-1">
        <span>{labelize(record.initiative_type)}</span>
        {Array.isArray(record.sdg_goals) && record.sdg_goals.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {record.sdg_goals.slice(0, 4).map((goal: number) => (
              <span key={goal} className="rounded border px-1.5 py-0.5 text-[11px] text-muted-foreground">SDG {goal}</span>
            ))}
          </div>
        ) : null}
      </div>
    ),
  },
  { key: "lead", label: "Lead", className: "hidden min-w-[190px] lg:table-cell", render: (record) => <RelationCell id={record.lead_id} adapterKey="person" emptyLabel="No lead" /> },
  { key: "center", label: "Center", className: "hidden min-w-[190px] xl:table-cell", render: (record) => <RelationCell id={record.center_id} adapterKey="researchCenter" emptyLabel="No center" /> },
  { key: "status", label: "Status", className: "w-[130px]", render: (record) => <StatusBadge value={record.status} /> },
  { key: "dates", label: "Dates", className: "hidden w-[180px] xl:table-cell", render: (record) => <span>{record.start_date ? <DateValue value={record.start_date} /> : "No dates"}</span> },
];

export const partnerColumns: Array<EditableRecordColumn<ResearchGenericRecord>> = [
  { key: "partner", label: "Partner Name", className: "min-w-[240px]", render: (record) => <span className="font-medium">{titleOf(record)}</span> },
  { key: "type", label: "Type", className: "w-[150px]", render: (record) => <span>{labelize(record.partner_type)}</span> },
  { key: "contact", label: "Contact", className: "hidden min-w-[220px] lg:table-cell", render: (record) => <span>{[record.email, record.website, record.country].filter(Boolean).join(" · ") || "No contact"}</span> },
  { key: "status", label: "Status", className: "w-[130px]", render: (record) => <StatusBadge value={record.status} /> },
];

