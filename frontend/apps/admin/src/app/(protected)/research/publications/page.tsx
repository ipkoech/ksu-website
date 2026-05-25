"use client";

import { EditableServiceResourcePage } from "@/components/dashboard/editable-service-resource-page";
import { researchServiceApi, type ResearchPublication, type ResearchPublicationPayload } from "@ksu/api-client";
import { usePermissions } from "@ksu/auth";

export default function ResearchPublicationsPage() {
  const { hasScope } = usePermissions();
  const canManage = hasScope("research.manage_publications") || hasScope("publications.manage") || hasScope("research:write") || hasScope("publications:write");

  return (
    <EditableServiceResourcePage<ResearchPublication, ResearchPublicationPayload>
      title="Publications"
      description="Create and maintain publication records from the research service."
      backHref="/research"
      queryKey={["research", "publications"]}
      fields={[
        { name: "title", label: "Title", required: true, placeholder: "Publication title" },
        { name: "slug", label: "Slug", placeholder: "publication-slug" },
        { name: "publication_type", label: "Publication Type", placeholder: "journal_article" },
        { name: "journal_name", label: "Journal Name" },
        { name: "year", label: "Year", type: "number" },
        { name: "doi", label: "DOI" },
        { name: "status", label: "Status", placeholder: "published" },
        { name: "is_active", label: "Active", type: "boolean" },
        { name: "is_featured", label: "Featured", type: "boolean" },
      ]}
      list={() => researchServiceApi.publications.list({ page: 1, per_page: 50 })}
      create={(payload) => researchServiceApi.publications.create(payload)}
      update={(id, payload) => researchServiceApi.publications.update(id, payload)}
      delete={(id) => researchServiceApi.publications.delete(id)}
      canCreate={canManage}
      canEdit={canManage}
      canDelete={canManage}
      getRecordTitle={(record) => record.title}
      getRecordMeta={(record) => [record.publication_type, record.journal_name, record.year].filter(Boolean).join(" · ")}
      emptyMessage="No publications were returned by the research service."
      buildPayload={(values) => ({
        title: values.title,
        slug: values.slug,
        publication_type: values.publication_type || "journal_article",
        journal_name: values.journal_name,
        year: values.year,
        doi: values.doi,
        status: values.status || "published",
        is_active: values.is_active,
        is_featured: values.is_featured,
      })}
    />
  );
}
