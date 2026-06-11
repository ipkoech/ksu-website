"use client";

import { researchServiceApi } from "@ksu/api-client";
import { ResearchAdminDetailPage } from "../../_components/research-admin-detail-page";

export default function ResearchPublicationDetailPage() {
  return (
    <ResearchAdminDetailPage
      title="Publication"
      description="View publication metadata, access links, identifiers, and public visibility fields."
      resource={researchServiceApi.publications}
      backHref="/research/publications"
      publicHrefBase="/publications"
      labelFields={["publication_type", "status", "access_type"]}
      factFields={[
        { label: "Journal", field: "journal_name" },
        { label: "Year", field: "year" },
        { label: "Publication Date", field: "publication_date", format: "date" },
        { label: "DOI", field: "doi" },
        { label: "Open Access", field: "is_open_access", format: "boolean" },
      ]}
      sections={[
        { title: "Abstract", fields: ["abstract"] },
        { title: "Source Details", fields: ["publisher", "volume", "issue", "pages", "conference_name", "book_title", "editors", "isbn"] },
        { title: "Access and Indexing", fields: ["url", "pdf_url", "pmid", "arxiv_id", "issn", "impact_factor", "quartile", "h_index"] },
        { title: "Funding", fields: ["funding_acknowledgment", "grant_numbers"] },
      ]}
    />
  );
}
