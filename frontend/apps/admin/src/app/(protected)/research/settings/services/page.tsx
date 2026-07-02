"use client";

import type { EditableListFilter, EditableRecordColumn } from "@/components/dashboard/editable-service-resource-page";
import type { ResearchGenericRecord } from "@ksu/api-client";
import { ResearchResourcePage, researchServiceApi } from "../../_components/research-resource-page";
import { labelize, PublicationRelationCell, StatusBadge } from "../../publications/_components/publication-workspace";
import { ResearchSettingsWorkspaceHeader } from "../_components/settings-workspace";

const serviceFilters: EditableListFilter[] = [
  { name: "search", label: "Search", type: "text", placeholder: "Search services, categories, contacts" },
  { name: "service_type", label: "Service Type", type: "text", placeholder: "support, review, compliance" },
  { name: "center_id", label: "Research Center", type: "entity", relation: { adapter: "researchCenter", filters: { is_active: true } } },
  { name: "department_id", label: "Administrative Unit", type: "entity", relation: { adapter: "department", filters: { department_type: "administrative", is_active: true } } },
  { name: "is_free", label: "Free", type: "boolean" },
  { name: "is_active", label: "Active", type: "boolean" },
  { name: "is_featured", label: "Featured", type: "boolean" },
];

const serviceColumns: EditableRecordColumn<ResearchGenericRecord>[] = [
  {
    key: "service",
    label: "Service",
    className: "min-w-[260px]",
    render: (record) => (
      <div className="space-y-1">
        <p className="font-medium">{record.name}</p>
        <p className="text-xs text-muted-foreground">{[record.code, labelize(record.service_type), labelize(record.category)].filter(Boolean).join(" · ")}</p>
      </div>
    ),
  },
  {
    key: "center",
    label: "Center",
    className: "hidden min-w-[200px] lg:table-cell",
    render: (record) => <PublicationRelationCell id={record.center_id} adapterKey="researchCenter" emptyLabel="No center" />,
  },
  {
    key: "contact",
    label: "Contact",
    className: "hidden min-w-[200px] xl:table-cell",
    render: (record) => <span>{[record.contact_name, record.contact_email].filter(Boolean).join(" · ") || "No contact"}</span>,
  },
  {
    key: "access",
    label: "Access",
    className: "hidden w-[150px] xl:table-cell",
    render: (record) => <span>{record.is_free ? "Free" : "Fee applies"}</span>,
  },
  {
    key: "status",
    label: "Status",
    className: "w-[120px]",
    render: (record) => <StatusBadge value={record.is_active ? "active" : "inactive"} />,
  },
];

export default function ResearchServicesPage() {
  return (
    <ResearchResourcePage
      title="Research Services"
      description="Manage research office services, access steps, and support contacts."
      queryKey={["research", "services"]}
      resource={researchServiceApi.services}
      manageScopes={["research.manage_guidelines", "research:write"]}
      summarySlot={<ResearchSettingsWorkspaceHeader />}
      fields={[
        { name: "name", label: "Name", required: true },
        { name: "slug", label: "Slug" },
        { name: "code", label: "Code" },
        { name: "service_type", label: "Service Type", placeholder: "support" },
        { name: "category", label: "Category" },
        { name: "center_id", label: "Research Center", type: "entity", relation: { adapter: "researchCenter", filters: { is_active: true } } },
        { name: "department_id", label: "Administrative Unit", type: "entity", relation: { adapter: "department", filters: { department_type: "administrative", is_active: true } } },
        { name: "summary", label: "Summary", type: "textarea" },
        { name: "description", label: "Description", type: "textarea" },
        { name: "scope", label: "Scope", type: "textarea" },
        { name: "process", label: "Process", type: "textarea" },
        { name: "eligibility", label: "Eligibility", type: "textarea" },
        { name: "deliverables", label: "Deliverables", type: "textarea" },
        { name: "turnaround_time", label: "Turnaround Time" },
        { name: "how_to_access", label: "How To Access", type: "textarea" },
        { name: "request_url", label: "Request URL", type: "url" },
        { name: "contact_email", label: "Contact Email", type: "email" },
        { name: "contact_name", label: "Contact Name" },
        { name: "contact_phone", label: "Contact Phone" },
        { name: "is_free", label: "Free", type: "boolean" },
        { name: "fee_structure", label: "Fee Structure", type: "textarea" },
        { name: "cover_image_url", label: "Cover Image URL", type: "url" },
        { name: "is_active", label: "Active", type: "boolean" },
        { name: "is_featured", label: "Featured", type: "boolean" },
      ]}
      defaults={{ service_type: "support", is_free: true }}
      listFilters={serviceFilters}
      recordColumns={serviceColumns}
      emptyMessage="No research services were returned by the research service."
      metaFields={["service_type", "category", "is_free"]}
      detailHref={(record) => `/research/services/${record.id}`}
      editorMode="sheet"
    />
  );
}
