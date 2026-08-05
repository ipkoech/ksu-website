"use client";

import type { EditableListFilter, EditableRecordColumn } from "@/components/dashboard/editable-service-resource-page";
import type { ResearchGenericRecord } from "@ksu/api-client";
import { ResearchResourcePage, researchServiceApi } from "../../_components/research-resource-page";
import {
  formatPublicationDate,
  labelize,
  PublicationRelationCell,
  PublicationWorkspaceHeader,
  StatusBadge,
} from "../../publications/_components/publication-workspace";

const reportFilters: EditableListFilter[] = [
  { name: "search", label: "Search", type: "text", placeholder: "Search report title, DOI, or summary" },
  {
    name: "project_id",
    label: "Linked Project",
    type: "entity",
    relation: { adapter: "researchProject", filters: { is_active: true } },
  },
  {
    name: "center_id",
    label: "Research Center",
    type: "entity",
    relation: { adapter: "researchCenter", filters: { is_active: true } },
  },
  {
    name: "access_type",
    label: "Access Type",
    type: "select",
    options: [
      { label: "Open", value: "open" },
      { label: "Restricted", value: "restricted" },
      { label: "Request", value: "request" },
      { label: "Proprietary", value: "proprietary" },
    ],
  },
  {
    name: "status",
    label: "Status",
    type: "select",
    options: [
      { label: "Draft", value: "draft" },
      { label: "Published", value: "published" },
      { label: "Archived", value: "archived" },
      { label: "Deprecated", value: "deprecated" },
    ],
  },
  { name: "is_active", label: "Active", type: "boolean" },
  { name: "is_featured", label: "Featured", type: "boolean" },
];

const reportColumns: Array<EditableRecordColumn<ResearchGenericRecord>> = [
  {
    key: "title",
    label: "Report",
    className: "min-w-[280px]",
    render: (record) => (
      <div className="space-y-1">
        <p className="font-medium">{record.title}</p>
        {record.version ? <p className="text-xs text-muted-foreground">Version {record.version}</p> : null}
      </div>
    ),
  },
  {
    key: "project",
    label: "Linked Project",
    className: "hidden min-w-[220px] lg:table-cell",
    render: (record) => <PublicationRelationCell id={record.project_id} adapterKey="researchProject" emptyLabel="No linked project" />,
  },
  {
    key: "center",
    label: "Center",
    className: "hidden min-w-[180px] xl:table-cell",
    render: (record) => <PublicationRelationCell id={record.center_id} adapterKey="researchCenter" emptyLabel="No center" />,
  },
  {
    key: "release_date",
    label: "Release Date",
    className: "hidden w-[140px] xl:table-cell",
    render: (record) => <span>{formatPublicationDate(record.release_date) || "No date"}</span>,
  },
  {
    key: "access",
    label: "Access",
    className: "w-[130px]",
    render: (record) => <span>{labelize(record.access_type)}</span>,
  },
  {
    key: "status",
    label: "Status",
    className: "w-[130px]",
    render: (record) => <StatusBadge value={record.status} />,
  },
];

export default function ResearchReportsPage() {
  return (
    <ResearchResourcePage
      title="Research Reports"
      description="Publish and manage research reports stored as report-type research outputs."
      queryKey={["research", "outputs", "reports"]}
      resource={researchServiceApi.outputs}
      manageScopes={["research.manage_reports", "research.submit_reports", "research:write"]}
      listParams={{ output_type: "report", is_active: true }}
      summarySlot={<PublicationWorkspaceHeader />}
      listFilters={reportFilters}
      recordColumns={reportColumns}
      fields={[
        { name: "title", label: "Title", required: true },
        { name: "slug", label: "Slug" },
        { name: "project_id", label: "Linked Project", type: "entity", relation: { adapter: "researchProject", filters: { is_active: true } } },
        { name: "center_id", label: "Research Center", type: "entity", relation: { adapter: "researchCenter", filters: { is_active: true } } },
        { name: "summary", label: "Summary", type: "textarea" },
        { name: "description", label: "Description", type: "textarea" },
        { name: "methodology", label: "Methodology", type: "textarea" },
        { name: "usage_notes", label: "Usage Notes", type: "textarea" },
        { name: "citation", label: "Citation", type: "textarea" },
        { name: "access_type", label: "Access Type", type: "select", placeholder: "Select access", options: [
          { label: "Open", value: "open" },
          { label: "Restricted", value: "restricted" },
          { label: "Request", value: "request" },
          { label: "Proprietary", value: "proprietary" },
        ] },
        { name: "access_url", label: "Access URL", type: "url" },
        { name: "download_url", label: "Download URL", type: "url" },
        { name: "repository_url", label: "Repository URL", type: "url" },
        { name: "doi", label: "DOI" },
        { name: "version", label: "Version" },
        { name: "license", label: "License" },
        { name: "license_url", label: "License URL", type: "url" },
        { name: "format", label: "Format" },
        { name: "release_date", label: "Release Date", type: "date" },
        { name: "last_updated", label: "Last Updated", type: "date" },
        { name: "cover_image_url", label: "Cover Image URL", type: "url" },
        { name: "status", label: "Status", type: "select", placeholder: "Select status", options: [
          { label: "Draft", value: "draft" },
          { label: "Published", value: "published" },
          { label: "Archived", value: "archived" },
          { label: "Deprecated", value: "deprecated" },
        ] },
        { name: "is_active", label: "Active", type: "boolean" },
        { name: "is_featured", label: "Featured", type: "boolean" },
      ]}
      defaults={{
        output_type: "report",
        access_type: "open",
        status: "published",
        is_active: true,
      }}
      emptyMessage="No report outputs were returned by the research service."
      metaFields={["access_type", "release_date", "status"]}
      importResource="research-outputs"
    />
  );
}
