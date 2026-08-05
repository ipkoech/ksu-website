"use client";

import type { EditableListFilter, EditableRecordColumn } from "@/components/dashboard/editable-service-resource-page";
import type { ResearchGenericRecord } from "@ksu/api-client";
import { ResearchResourcePage, researchServiceApi } from "../_components/research-resource-page";
import { labelize, StatusBadge } from "../publications/_components/publication-workspace";

const CENTER_LIST_FIELDS = "id,name,slug,code,acronym,center_type,status,is_active,is_featured";

const centerFilters: EditableListFilter[] = [
  { name: "search", label: "Search", type: "text", placeholder: "Search centers, codes, directors, or locations" },
  { name: "center_type", label: "Center Type", type: "text", placeholder: "center, institute, unit" },
  { name: "department_id", label: "Department", type: "entity", relation: { adapter: "department" } },
  { name: "director_id", label: "Director", type: "entity", relation: { adapter: "person", filters: { status: "active" } } },
  { name: "status", label: "Status", type: "text", placeholder: "active, draft, archived" },
  { name: "is_active", label: "Active", type: "boolean" },
  { name: "is_featured", label: "Featured", type: "boolean" },
];

const centerColumns: Array<EditableRecordColumn<ResearchGenericRecord>> = [
  {
    key: "center",
    label: "Center",
    className: "min-w-[260px]",
    render: (record) => (
      <div className="space-y-1">
        <p className="font-medium">{record.name}</p>
        <p className="text-xs text-muted-foreground">{[record.code, record.acronym, labelize(record.center_type)].filter(Boolean).join(" · ")}</p>
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

export default function ResearchCentersPage() {
  return (
    <ResearchResourcePage
      title="Research Centers"
      description="Manage research centers, institutes, and their public profile details."
      queryKey={["research", "centers"]}
      resource={researchServiceApi.centers}
      manageScopes={["research.manage_projects", "research:write"]}
      hideHeader
      fields={[
        { name: "name", label: "Name", required: true },
        { name: "slug", label: "Slug" },
        { name: "code", label: "Code" },
        { name: "acronym", label: "Acronym" },
        { name: "center_type", label: "Center Type", placeholder: "center" },
        { name: "department_id", label: "Department", type: "entity", relation: { adapter: "department" } },
        { name: "director_id", label: "Director", type: "entity", relation: { adapter: "person", filters: { status: "active" } } },
        { name: "established_date", label: "Established Date", type: "date" },
        { name: "summary", label: "Summary", type: "textarea" },
        { name: "about", label: "About", type: "textarea" },
        { name: "description", label: "Description", type: "textarea" },
        { name: "mandate", label: "Mandate", type: "textarea" },
        { name: "mission", label: "Mission", type: "textarea" },
        { name: "vision", label: "Vision", type: "textarea" },
        { name: "objectives", label: "Objectives", type: "textarea" },
        { name: "research_areas", label: "Research Areas", type: "textarea" },
        { name: "location", label: "Location" },
        { name: "address", label: "Address", type: "textarea" },
        { name: "email", label: "Email", type: "email" },
        { name: "phone", label: "Phone" },
        { name: "website", label: "Website", type: "url" },
        { name: "logo_image_url", label: "Logo Image URL", type: "url" },
        { name: "cover_image_url", label: "Cover Image URL", type: "url" },
        { name: "status", label: "Status", placeholder: "active" },
        { name: "is_active", label: "Active", type: "boolean" },
        { name: "is_featured", label: "Featured", type: "boolean" },
      ]}
      defaults={{ center_type: "center", status: "active" }}
      listParams={{ fields: CENTER_LIST_FIELDS }}
      listFilters={centerFilters}
      recordColumns={centerColumns}
      emptyMessage="No research centers were returned by the research service."
      metaFields={["code", "center_type", "status"]}
      detailBaseHref="/research/centers"
      importResource="research-centers"
      editorMode="sheet"
    />
  );
}
