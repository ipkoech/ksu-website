"use client";

import type { EditableListFilter, EditableRecordColumn } from "@/components/dashboard/editable-service-resource-page";
import type { ResearchGenericRecord } from "@ksu/api-client";
import { ResearchResourcePage, researchServiceApi } from "../../_components/research-resource-page";
import { PublicationWorkspaceHeader, StatusBadge } from "../_components/publication-workspace";

const journalFilters: EditableListFilter[] = [
  { name: "search", label: "Search", type: "text", placeholder: "Search journal, publisher, or ISSN" },
  { name: "is_open_access", label: "Open Access", type: "boolean" },
  { name: "is_university_journal", label: "University Journal", type: "boolean" },
  { name: "is_active", label: "Active", type: "boolean" },
  { name: "is_featured", label: "Featured", type: "boolean" },
];

const journalColumns: Array<EditableRecordColumn<ResearchGenericRecord>> = [
  {
    key: "name",
    label: "Journal",
    className: "min-w-[260px]",
    render: (record) => (
      <div className="space-y-1">
        <p className="font-medium">{record.name}</p>
        {record.abbreviation ? <p className="text-xs text-muted-foreground">{record.abbreviation}</p> : null}
      </div>
    ),
  },
  {
    key: "publisher",
    label: "Publisher",
    className: "hidden min-w-[220px] lg:table-cell",
    render: (record) => <span>{record.publisher ?? "No publisher"}</span>,
  },
  {
    key: "issn",
    label: "ISSN",
    className: "hidden w-[140px] xl:table-cell",
    render: (record) => <span>{record.issn ?? record.eissn ?? "Not recorded"}</span>,
  },
  {
    key: "metrics",
    label: "Metrics",
    className: "hidden min-w-[170px] xl:table-cell",
    render: (record) => (
      <span>
        {[record.quartile, record.impact_factor ? `IF ${record.impact_factor}` : null].filter(Boolean).join(" · ") || "No metrics"}
      </span>
    ),
  },
  {
    key: "access",
    label: "Access",
    className: "w-[130px]",
    render: (record) => <span>{record.is_open_access ? "Open access" : "Standard"}</span>,
  },
  {
    key: "status",
    label: "Status",
    className: "w-[130px]",
    render: (record) => <StatusBadge value={record.is_active === false ? "inactive" : "active"} />,
  },
];

export default function ResearchJournalsPage() {
  return (
    <ResearchResourcePage
      title="Research Journals"
      description="Manage journals and publication venues used by research publications."
      queryKey={["research", "journals"]}
      resource={researchServiceApi.journals}
      manageScopes={["research.manage_publications", "publications.manage", "research:write"]}
      summarySlot={<PublicationWorkspaceHeader />}
      listFilters={journalFilters}
      recordColumns={journalColumns}
      fields={[
        { name: "name", label: "Name", required: true },
        { name: "slug", label: "Slug" },
        { name: "abbreviation", label: "Abbreviation" },
        { name: "issn", label: "ISSN" },
        { name: "eissn", label: "EISSN" },
        { name: "publisher", label: "Publisher" },
        { name: "publisher_location", label: "Publisher Location" },
        { name: "website", label: "Website", type: "url" },
        { name: "submission_url", label: "Submission URL", type: "url" },
        { name: "description", label: "Description", type: "textarea" },
        { name: "scope", label: "Scope", type: "textarea" },
        { name: "impact_factor", label: "Impact Factor", type: "number" },
        { name: "impact_factor_year", label: "Impact Factor Year", type: "number" },
        { name: "h_index", label: "H-Index", type: "number" },
        { name: "quartile", label: "Quartile" },
        { name: "sjr_score", label: "SJR Score", type: "number" },
        { name: "is_open_access", label: "Open Access", type: "boolean" },
        { name: "is_university_journal", label: "University Journal", type: "boolean" },
        { name: "is_active", label: "Active", type: "boolean" },
        { name: "is_featured", label: "Featured", type: "boolean" },
      ]}
      emptyMessage="No journals were returned by the research service."
      metaFields={["abbreviation", "publisher", "quartile"]}
      importResource="research-journals"
    />
  );
}
