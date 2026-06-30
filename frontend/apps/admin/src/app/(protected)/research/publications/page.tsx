"use client";

import type { ReactNode } from "react";
import {
  EditableServiceResourcePage,
  type EditableListFilter,
  type EditableRecordColumn,
} from "@/components/dashboard/editable-service-resource-page";
import { ResearchBulkActions } from "../_components/research-resource-page";
import { researchServiceApi, type ResearchPublication, type ResearchPublicationPayload } from "@ksu/api-client";
import { usePermissions } from "@ksu/auth";
import {
  AuthorsCell,
  formatPublicationDate,
  labelize,
  PublicationRelationCell,
  PublicationWorkspaceHeader,
  StatusBadge,
} from "./_components/publication-workspace";

const publicationListFilters: EditableListFilter[] = [
  {
    name: "search",
    label: "Search",
    type: "text",
    placeholder: "Search title, DOI, journal, publisher, or abstract",
  },
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
  { name: "year", label: "Year", type: "text", placeholder: "2026" },
  {
    name: "author_id",
    label: "Author",
    type: "entity",
    relation: { adapter: "person", filters: { status: "active" } },
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
  {
    name: "journal_id",
    label: "Journal",
    type: "entity",
    relation: { adapter: "researchJournal", filters: { is_active: true } },
  },
  { name: "is_open_access", label: "Open Access", type: "boolean" },
  { name: "is_featured", label: "Featured", type: "boolean" },
];

const publicationColumns: Array<EditableRecordColumn<ResearchPublication>> = [
  {
    key: "title",
    label: "Publication",
    className: "min-w-[260px]",
    render: (record) => (
      <div className="space-y-1">
        <p className="font-medium">{record.title}</p>
        {record.doi ? <p className="text-xs text-muted-foreground">DOI {record.doi}</p> : null}
      </div>
    ),
  },
  {
    key: "type",
    label: "Type",
    className: "w-[150px]",
    render: (record) => <span>{labelize(record.publication_type)}</span>,
  },
  {
    key: "authors",
    label: "Authors / Editors",
    className: "hidden min-w-[210px] lg:table-cell",
    render: (record) => <AuthorsCell record={record} />,
  },
  {
    key: "journal",
    label: "Journal / Publisher",
    className: "hidden min-w-[220px] xl:table-cell",
    render: (record) =>
      record.journal_id ? (
        <PublicationRelationCell id={record.journal_id} adapterKey="researchJournal" emptyLabel="No journal" />
      ) : (
        <span>{record.journal_name ?? record.publisher ?? "No venue recorded"}</span>
      ),
  },
  {
    key: "year",
    label: "Year",
    className: "w-[100px]",
    render: (record) => <span>{record.year ?? "No year"}</span>,
  },
  {
    key: "project",
    label: "Linked Project",
    className: "hidden min-w-[220px] xl:table-cell",
    render: (record) => <PublicationRelationCell id={record.project_id} adapterKey="researchProject" emptyLabel="No linked project" />,
  },
  {
    key: "status",
    label: "Status",
    className: "w-[130px]",
    render: (record) => <StatusBadge value={record.status} />,
  },
];

function PublicationMobileRecord(record: ResearchPublication, actions: ReactNode) {
  return (
    <div className="rounded-lg border bg-background p-3 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="line-clamp-2 text-sm font-semibold">{record.title}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {[labelize(record.publication_type), record.journal?.name ?? record.journal_name ?? record.publisher, record.year].filter(Boolean).join(" · ")}
          </p>
        </div>
        <div className="shrink-0">{actions}</div>
      </div>
      <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
        <span className="rounded-md border px-2 py-1">{labelize(record.status) || "Unspecified"}</span>
        {record.is_open_access ? <span className="rounded-md border px-2 py-1">Open access</span> : null}
      </div>
    </div>
  );
}

export default function ResearchPublicationsPage() {
  const { hasScope } = usePermissions();
  const canManage = hasScope("research.manage_publications") || hasScope("publications.manage") || hasScope("research:write") || hasScope("publications:write");

  return (
    <EditableServiceResourcePage<ResearchPublication, ResearchPublicationPayload>
      title="Publications"
      description="Create and maintain publication records from the research service."
      resourceKey="publications"
      backHref="/research"
      queryKey={["research", "publications"]}
      summarySlot={<PublicationWorkspaceHeader />}
      listFilters={publicationListFilters}
      recordColumns={publicationColumns}
      editorMode="sheet"
      renderMobileRecord={PublicationMobileRecord}
      fields={[
        { name: "title", label: "Title", required: true, placeholder: "Publication title" },
        { name: "slug", label: "Slug", placeholder: "publication-slug" },
        { name: "abstract", label: "Abstract / Summary", type: "textarea" },
        { name: "publication_type", label: "Publication Type", type: "select", placeholder: "Select type", options: [
          { label: "Journal Article", value: "journal_article" },
          { label: "Conference Paper", value: "conference_paper" },
          { label: "Book", value: "book" },
          { label: "Book Chapter", value: "book_chapter" },
          { label: "Report", value: "report" },
          { label: "Working Paper", value: "working_paper" },
          { label: "Preprint", value: "preprint" },
          { label: "Thesis", value: "thesis" },
        ] },
        { name: "project_id", label: "Source Project", type: "entity", relation: { adapter: "researchProject", filters: { is_active: true } } },
        { name: "center_id", label: "Research Center", type: "entity", relation: { adapter: "researchCenter", filters: { is_active: true } } },
        { name: "journal_id", label: "Journal", type: "entity", relation: { adapter: "researchJournal", filters: { is_active: true } } },
        { name: "editors", label: "Editors / External Authors", placeholder: "Names where author records are not available" },
        { name: "journal_name", label: "Journal Name" },
        { name: "publisher", label: "Publisher" },
        { name: "doi", label: "DOI" },
        { name: "url", label: "URL", type: "url" },
        { name: "pdf_url", label: "PDF URL", type: "url" },
        { name: "year", label: "Year", type: "number" },
        { name: "publication_date", label: "Publication Date", type: "date" },
        { name: "status", label: "Status", type: "select", placeholder: "Select status", options: [
          { label: "Draft", value: "draft" },
          { label: "Submitted", value: "submitted" },
          { label: "Under Review", value: "under_review" },
          { label: "Accepted", value: "accepted" },
          { label: "Published", value: "published" },
          { label: "Retracted", value: "retracted" },
        ] },
        { name: "volume", label: "Volume" },
        { name: "issue", label: "Issue" },
        { name: "pages", label: "Pages" },
        { name: "article_number", label: "Article Number" },
        { name: "conference_name", label: "Conference Name" },
        { name: "conference_location", label: "Conference Location" },
        { name: "conference_date", label: "Conference Date", type: "date" },
        { name: "book_title", label: "Book Title" },
        { name: "edition", label: "Edition" },
        { name: "isbn", label: "ISBN" },
        { name: "submission_date", label: "Submission Date", type: "date" },
        { name: "acceptance_date", label: "Acceptance Date", type: "date" },
        { name: "pmid", label: "PubMed Identifier" },
        { name: "arxiv_id", label: "arXiv Identifier" },
        { name: "issn", label: "ISSN" },
        { name: "is_open_access", label: "Open Access", type: "boolean" },
        { name: "access_type", label: "Access Type", type: "select", placeholder: "Select access", options: [
          { label: "Gold", value: "gold" },
          { label: "Green", value: "green" },
          { label: "Hybrid", value: "hybrid" },
          { label: "Bronze", value: "bronze" },
          { label: "Closed", value: "closed" },
        ] },
        { name: "impact_factor", label: "Impact Factor", type: "number" },
        { name: "quartile", label: "Quartile" },
        { name: "h_index", label: "H-Index", type: "number" },
        { name: "funding_acknowledgment", label: "Funding Acknowledgment", type: "textarea" },
        { name: "cover_image_url", label: "Cover Image URL", type: "url" },
        { name: "is_active", label: "Active", type: "boolean" },
        { name: "is_featured", label: "Featured", type: "boolean" },
      ]}
      list={(filters) =>
        researchServiceApi.publications.list({
          page: 1,
          per_page: 50,
          fields: "id,title,slug,publication_type,project_id,center_id,journal_id,journal_name,publisher,editors,year,publication_date,doi,status,is_open_access,is_featured,is_active",
          include: "project:id,title,code;center:id,name,code;journal:id,name,abbreviation;authors:id,name,person_id,author_order,is_corresponding",
          ...filters,
        })
      }
      create={(payload) => researchServiceApi.publications.create(payload)}
      update={(id, payload) => researchServiceApi.publications.update(id, payload)}
      delete={(id) => researchServiceApi.publications.delete(id)}
      canCreate={canManage}
      canEdit={canManage}
      canDelete={canManage}
      getRecordTitle={(record) => record.title}
      getRecordMeta={(record) =>
        [
          labelize(record.publication_type),
          record.project?.title,
          record.center?.name,
          record.journal?.name ?? record.journal_name,
          record.year,
          formatPublicationDate(record.publication_date),
        ]
          .filter(Boolean)
          .join(" · ")
      }
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
      toolbarSlot={<ResearchBulkActions resourceKey="research-publications" />}
    />
  );
}
