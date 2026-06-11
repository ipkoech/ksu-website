"use client";

import { EditableServiceResourcePage, type EditableListFilter } from "@/components/dashboard/editable-service-resource-page";
import { researchServiceApi, type ResearchGenericPayload, type ResearchGenericRecord } from "@ksu/api-client";
import { usePermissions } from "@ksu/auth";

const reportListFilters: EditableListFilter[] = [
  {
    name: "output_type",
    label: "Output Type",
    type: "select",
    options: [
      { label: "Dataset", value: "dataset" },
      { label: "Software", value: "software" },
      { label: "Tool", value: "tool" },
      { label: "Report", value: "report" },
      { label: "Brief", value: "brief" },
      { label: "Guideline", value: "guideline" },
    ],
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

export default function ResearchReportsPage() {
  const { hasScope } = usePermissions();
  const canManage = hasScope("research.manage_reports") || hasScope("research.submit_reports") || hasScope("research:write");

  return (
    <EditableServiceResourcePage<ResearchGenericRecord, ResearchGenericPayload>
      title="Research Outputs"
      description="Publish datasets, tools, reports, briefs, and other research outputs."
      backHref="/research"
      queryKey={["research", "outputs"]}
      listFilters={reportListFilters}
      fields={[
        { name: "title", label: "Title", required: true },
        { name: "slug", label: "Slug" },
        { name: "output_type", label: "Output Type", placeholder: "dataset" },
        { name: "summary", label: "Summary", type: "textarea" },
        { name: "description", label: "Description", type: "textarea" },
        { name: "methodology", label: "Methodology", type: "textarea" },
        { name: "usage_notes", label: "Usage Notes", type: "textarea" },
        { name: "citation", label: "Citation", type: "textarea" },
        { name: "access_type", label: "Access Type", placeholder: "open" },
        { name: "access_url", label: "Access URL", type: "url" },
        { name: "download_url", label: "Download URL", type: "url" },
        { name: "repository_url", label: "Repository URL", type: "url" },
        { name: "doi", label: "DOI" },
        { name: "version", label: "Version" },
        { name: "license", label: "License" },
        { name: "license_url", label: "License URL", type: "url" },
        { name: "format", label: "Format" },
        { name: "size_bytes", label: "Size Bytes", type: "number" },
        { name: "technical_requirements", label: "Technical Requirements", type: "textarea" },
        { name: "release_date", label: "Release Date", type: "date" },
        { name: "last_updated", label: "Last Updated", type: "date" },
        { name: "cover_image_url", label: "Cover Image URL", type: "url" },
        { name: "status", label: "Status", placeholder: "published" },
        { name: "is_active", label: "Active", type: "boolean" },
        { name: "is_featured", label: "Featured", type: "boolean" },
      ]}
      list={(filters) => researchServiceApi.outputs.list({ page: 1, per_page: 50, ...filters })}
      create={(payload) => researchServiceApi.outputs.create(payload)}
      update={(id, payload) => researchServiceApi.outputs.update(id, payload)}
      delete={(id) => researchServiceApi.outputs.delete(id)}
      canCreate={canManage}
      canEdit={canManage}
      canDelete={canManage}
      getRecordTitle={(record) => record.title ?? "Untitled output"}
      getRecordMeta={(record) => [record.output_type, record.access_type, record.status].filter(Boolean).join(" · ")}
      emptyMessage="No research outputs were returned by the research service."
      buildPayload={(values) => ({
        title: values.title,
        slug: values.slug,
        output_type: values.output_type || "dataset",
        summary: values.summary,
        description: values.description,
        methodology: values.methodology,
        usage_notes: values.usage_notes,
        citation: values.citation,
        access_type: values.access_type || "open",
        access_url: values.access_url,
        download_url: values.download_url,
        repository_url: values.repository_url,
        doi: values.doi,
        version: values.version,
        license: values.license,
        license_url: values.license_url,
        format: values.format,
        size_bytes: values.size_bytes,
        technical_requirements: values.technical_requirements,
        release_date: values.release_date,
        last_updated: values.last_updated,
        cover_image_url: values.cover_image_url,
        status: values.status || "published",
        is_active: values.is_active,
        is_featured: values.is_featured,
      })}
    />
  );
}
