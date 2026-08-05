"use client";

import { CalendarDays, Handshake, Leaf, Sprout, Tractor } from "lucide-react";
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

export const farmTabs = [
  { label: "Overview", href: "/research/farm" },
  { label: "Farm Sites", href: "/research/farm/farms" },
  { label: "Projects", href: "/research/farm/projects" },
  { label: "Partnerships", href: "/research/farm/partnerships" },
  { label: "Activities", href: "/research/farm/activities" },
  { label: "Impact Stories", href: "/research/farm/impact-stories" },
  { label: "Focus Areas", href: "/research/farm/focus-areas" },
];

export function FarmWorkspaceHeader() {
  return (
    <ResearchWorkspaceHeader
      metrics={[
        { title: "Farm Sites", queryKey: ["research", "farm", "metrics", "farms"], queryFn: () => researchCount("farms", { is_active: true }), icon: <Tractor className="h-4 w-4" /> },
        { title: "Active Projects", queryKey: ["research", "farm", "metrics", "projects"], queryFn: () => researchCount("projects", { project_type: "action", is_active: true }), icon: <Sprout className="h-4 w-4" /> },
        { title: "Partners", queryKey: ["research", "farm", "metrics", "partners"], queryFn: () => researchCount("partners", { partner_type: "community", is_active: true }), icon: <Handshake className="h-4 w-4" /> },
        { title: "Upcoming Activities", queryKey: ["research", "farm", "metrics", "activities"], queryFn: () => researchCount("events" as any, { status: "upcoming" }), icon: <CalendarDays className="h-4 w-4" /> },
        { title: "Impact Stories", queryKey: ["research", "farm", "metrics", "stories"], queryFn: () => researchCount("stories", { story_type: "community", is_active: true }), icon: <Leaf className="h-4 w-4" /> },
      ]}
    />
  );
}

export const farmFilters: EditableListFilter[] = [
  { name: "search", label: "Search", type: "text", placeholder: "Search name, county, location, or manager" },
  {
    name: "farm_type",
    label: "Farm Type",
    type: "select",
    options: [
      { label: "Crop", value: "crop" },
      { label: "Livestock", value: "livestock" },
      { label: "Aquaculture", value: "aquaculture" },
      { label: "Mixed", value: "mixed" },
      { label: "Demonstration", value: "demonstration" },
      { label: "Experimental", value: "experimental" },
    ],
  },
  { name: "center_id", label: "Research Center", type: "entity", relation: { adapter: "researchCenter", filters: { is_active: true } } },
  { name: "is_active", label: "Active", type: "boolean" },
  { name: "is_public", label: "Public", type: "boolean" },
];

export const farmColumns: Array<EditableRecordColumn<ResearchGenericRecord>> = [
  {
    key: "site",
    label: "Site Name",
    className: "min-w-[240px]",
    render: (record) => (
      <div className="space-y-1">
        <p className="font-medium">{titleOf(record)}</p>
        <p className="text-xs text-muted-foreground">{[record.code, labelize(record.farm_type)].filter(Boolean).join(" · ") || "Farm site"}</p>
      </div>
    ),
  },
  {
    key: "location",
    label: "Location",
    className: "min-w-[200px]",
    render: (record) => <span>{[record.location, record.county].filter(Boolean).join(", ") || "No location"}</span>,
  },
  {
    key: "manager",
    label: "Manager / Contact",
    className: "hidden min-w-[220px] lg:table-cell",
    render: (record) => <span>{[record.manager_name, record.email, record.phone].filter(Boolean).join(" · ") || "No contact"}</span>,
  },
  {
    key: "center",
    label: "Center",
    className: "hidden min-w-[190px] xl:table-cell",
    render: (record) => <RelationCell id={record.center_id} adapterKey="researchCenter" emptyLabel="No center" />,
  },
  {
    key: "status",
    label: "Status",
    className: "w-[130px]",
    render: (record) => <StatusBadge value={record.is_active === false ? "inactive" : "active"} />,
  },
];

export const farmProjectFilters: EditableListFilter[] = [
  { name: "search", label: "Search", type: "text", placeholder: "Search project title, code, or summary" },
  { name: "center_id", label: "Farm Site / Center", type: "entity", relation: { adapter: "researchCenter", filters: { is_active: true } } },
  { name: "pi_id", label: "PI / Lead", type: "entity", relation: { adapter: "person", filters: { status: "active" } } },
  { name: "status", label: "Status", type: "select", options: [
    { label: "Proposal", value: "proposal" },
    { label: "Approved", value: "approved" },
    { label: "Ongoing", value: "ongoing" },
    { label: "Completed", value: "completed" },
    { label: "Suspended", value: "suspended" },
  ] },
];

export const farmProjectColumns: Array<EditableRecordColumn<ResearchGenericRecord>> = [
  {
    key: "project",
    label: "Project",
    className: "min-w-[260px]",
    render: (record) => <span className="font-medium">{titleOf(record)}</span>,
  },
  {
    key: "site",
    label: "Farm Site",
    className: "hidden min-w-[200px] lg:table-cell",
    render: (record) => <RelationCell id={record.center_id} adapterKey="researchCenter" emptyLabel="No farm site" />,
  },
  {
    key: "focus",
    label: "Focus Area",
    className: "hidden min-w-[160px] xl:table-cell",
    render: (record) => <span>{labelize(record.project_type) || "Not set"}</span>,
  },
  {
    key: "lead",
    label: "PI / Lead",
    className: "hidden min-w-[180px] xl:table-cell",
    render: (record) => <RelationCell id={record.pi_id} adapterKey="person" emptyLabel="No lead" />,
  },
  {
    key: "status",
    label: "Status",
    className: "w-[130px]",
    render: (record) => <StatusBadge value={record.status} />,
  },
  {
    key: "dates",
    label: "Dates",
    className: "hidden w-[180px] xl:table-cell",
    render: (record) => <span>{[record.start_date, record.end_date].map((value) => value ? <DateValue key={value} value={value} /> : null).filter(Boolean).length ? [record.start_date, record.end_date].filter(Boolean).map((value) => new Date(value).getFullYear()).join(" - ") : "No dates"}</span>,
  },
];

export const partnerColumns: Array<EditableRecordColumn<ResearchGenericRecord>> = [
  { key: "name", label: "Partner", className: "min-w-[240px]", render: (record) => <span className="font-medium">{titleOf(record)}</span> },
  { key: "type", label: "Type", className: "w-[150px]", render: (record) => <span>{labelize(record.partner_type)}</span> },
  { key: "level", label: "Level", className: "hidden w-[160px] lg:table-cell", render: (record) => <span>{labelize(record.partnership_level)}</span> },
  { key: "contact", label: "Contact", className: "hidden min-w-[220px] xl:table-cell", render: (record) => <span>{[record.email, record.country].filter(Boolean).join(" · ") || "No contact"}</span> },
  { key: "status", label: "Status", className: "w-[130px]", render: (record) => <StatusBadge value={record.status} /> },
];
