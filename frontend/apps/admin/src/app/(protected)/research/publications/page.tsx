"use client";

import { EditableServiceResourcePage, type EditableListFilter } from "@/components/dashboard/editable-service-resource-page";
import { researchServiceApi, type ResearchPublication, type ResearchPublicationPayload } from "@ksu/api-client";
import { usePermissions } from "@ksu/auth";

const publicationListFilters: EditableListFilter[] = [
  {
    name: "publication_type",
    label: "Publication Type",
    type: "select",
    options: [
      { label: "Journal Article", value: "journal_article" },
      { label: "Conference Paper", value: "conference_paper" },
      { label: "Book", value: "book" },
      { label: "Book Chapter", value: "book_chapter" },
      { label: "Report", value: "report" },
      { label: "Working Paper", value: "working_paper" },
    ],
  },
  {
    name: "status",
    label: "Status",
    type: "select",
    options: [
      { label: "Draft", value: "draft" },
      { label: "Submitted", value: "submitted" },
      { label: "Under Review", value: "under_review" },
      { label: "Accepted", value: "accepted" },
      { label: "Published", value: "published" },
      { label: "Retracted", value: "retracted" },
    ],
  },
  {
    name: "center_id",
    label: "Research Center",
    type: "entity",
    relation: { adapter: "researchCenter", filters: { is_active: true } },
  },
  {
    name: "project_id",
    label: "Source Project",
    type: "entity",
    relation: { adapter: "researchProject", filters: { is_active: true } },
  },
  { name: "is_open_access", label: "Open Access", type: "boolean" },
  { name: "is_featured", label: "Featured", type: "boolean" },
];

export default function ResearchPublicationsPage() {
  const { hasScope } = usePermissions();
  const canManage = hasScope("research.manage_publications") || hasScope("publications.manage") || hasScope("research:write") || hasScope("publications:write");

  return (
    <EditableServiceResourcePage<ResearchPublication, ResearchPublicationPayload>
      title="Publications"
      description="Create and maintain publication records from the research service."
      backHref="/research"
      queryKey={["research", "publications"]}
      listFilters={publicationListFilters}
      fields={[
        { name: "title", label: "Title", required: true, placeholder: "Publication title" },
        { name: "slug", label: "Slug", placeholder: "publication-slug" },
        { name: "project_id", label: "Source Project", type: "entity", relation: { adapter: "researchProject", filters: { is_active: true } } },
        { name: "center_id", label: "Research Center", type: "entity", relation: { adapter: "researchCenter", filters: { is_active: true } } },
        { name: "journal_id", label: "Journal", type: "entity", relation: { adapter: "researchJournal", filters: { is_active: true } } },
        { name: "publication_type", label: "Publication Type", type: "select", placeholder: "Select type", options: [
          { label: "Journal Article", value: "journal_article" },
          { label: "Conference Paper", value: "conference_paper" },
          { label: "Book", value: "book" },
          { label: "Book Chapter", value: "book_chapter" },
          { label: "Report", value: "report" },
          { label: "Working Paper", value: "working_paper" },
        ] },
        { name: "abstract", label: "Abstract", type: "textarea" },
        { name: "journal_name", label: "Journal Name" },
        { name: "publisher", label: "Publisher" },
        { name: "volume", label: "Volume" },
        { name: "issue", label: "Issue" },
        { name: "pages", label: "Pages" },
        { name: "article_number", label: "Article Number" },
        { name: "conference_name", label: "Conference Name" },
        { name: "conference_location", label: "Conference Location" },
        { name: "conference_date", label: "Conference Date", type: "date" },
        { name: "book_title", label: "Book Title" },
        { name: "editors", label: "Editors" },
        { name: "edition", label: "Edition" },
        { name: "isbn", label: "ISBN" },
        { name: "publication_date", label: "Publication Date", type: "date" },
        { name: "submission_date", label: "Submission Date", type: "date" },
        { name: "acceptance_date", label: "Acceptance Date", type: "date" },
        { name: "year", label: "Year", type: "number" },
        { name: "doi", label: "DOI" },
        { name: "pmid", label: "PMID" },
        { name: "arxiv_id", label: "arXiv ID" },
        { name: "issn", label: "ISSN" },
        { name: "url", label: "URL", type: "url" },
        { name: "pdf_url", label: "PDF URL", type: "url" },
        { name: "is_open_access", label: "Open Access", type: "boolean" },
        { name: "access_type", label: "Access Type" },
        { name: "impact_factor", label: "Impact Factor", type: "number" },
        { name: "quartile", label: "Quartile" },
        { name: "h_index", label: "H-Index", type: "number" },
        { name: "funding_acknowledgment", label: "Funding Acknowledgment", type: "textarea" },
        { name: "cover_image_url", label: "Cover Image URL", type: "url" },
        { name: "status", label: "Status", type: "select", placeholder: "Select status", options: [
          { label: "Draft", value: "draft" },
          { label: "Submitted", value: "submitted" },
          { label: "Under Review", value: "under_review" },
          { label: "Accepted", value: "accepted" },
          { label: "Published", value: "published" },
          { label: "Retracted", value: "retracted" },
        ] },
        { name: "is_active", label: "Active", type: "boolean" },
        { name: "is_featured", label: "Featured", type: "boolean" },
      ]}
      list={(filters) => researchServiceApi.publications.list({ page: 1, per_page: 50, ...filters })}
      create={(payload) => researchServiceApi.publications.create(payload)}
      update={(id, payload) => researchServiceApi.publications.update(id, payload)}
      delete={(id) => researchServiceApi.publications.delete(id)}
      canCreate={canManage}
      canEdit={canManage}
      canDelete={canManage}
      getRecordTitle={(record) => record.title}
      getRecordMeta={(record) => [record.publication_type, record.journal_name, record.year].filter(Boolean).join(" · ")}
      getRecordDetailHref={(record) => record.slug ? `/research/publications/${record.slug}` : null}
      emptyMessage="No publications were returned by the research service."
      buildPayload={(values) => ({
        title: values.title,
        slug: values.slug,
        project_id: values.project_id,
        center_id: values.center_id,
        journal_id: values.journal_id,
        publication_type: values.publication_type || "journal_article",
        abstract: values.abstract,
        journal_name: values.journal_name,
        publisher: values.publisher,
        volume: values.volume,
        issue: values.issue,
        pages: values.pages,
        article_number: values.article_number,
        conference_name: values.conference_name,
        conference_location: values.conference_location,
        conference_date: values.conference_date,
        book_title: values.book_title,
        editors: values.editors,
        edition: values.edition,
        isbn: values.isbn,
        publication_date: values.publication_date,
        submission_date: values.submission_date,
        acceptance_date: values.acceptance_date,
        year: values.year,
        doi: values.doi,
        pmid: values.pmid,
        arxiv_id: values.arxiv_id,
        issn: values.issn,
        url: values.url,
        pdf_url: values.pdf_url,
        is_open_access: values.is_open_access,
        access_type: values.access_type,
        impact_factor: values.impact_factor,
        quartile: values.quartile,
        h_index: values.h_index,
        funding_acknowledgment: values.funding_acknowledgment,
        cover_image_url: values.cover_image_url,
        status: values.status || "published",
        is_active: values.is_active,
        is_featured: values.is_featured,
      })}
    />
  );
}
