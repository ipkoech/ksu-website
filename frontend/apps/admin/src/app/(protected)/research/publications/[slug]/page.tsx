"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ExternalLink } from "lucide-react";
import { researchServiceApi, type ResearchGenericRecord } from "@ksu/api-client";
import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from "@ksu/ui/components";
import { ResearchAdminDetailPage } from "../../_components/research-admin-detail-page";
import { formatPublicationDate, labelize } from "../_components/publication-workspace";

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
        { label: "Project", field: "project_id", relation: { adapter: "researchProject" } },
        { label: "Center", field: "center_id", relation: { adapter: "researchCenter" } },
        { label: "Journal", field: "journal_id", relation: { adapter: "researchJournal" } },
        { label: "Journal Name", field: "journal_name" },
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
      renderAfter={(record) => <PublicationRelations record={record} />}
    />
  );
}

function PublicationRelations({ record }: { record: ResearchGenericRecord }) {
  const relatedOutputs = useQuery({
    queryKey: ["research", "publication-detail", "outputs", record.project_id],
    queryFn: () =>
      researchServiceApi.outputs.list({
        page: 1,
        per_page: 6,
        project_id: record.project_id,
        fields: "id,title,slug,output_type,status,release_date",
      }),
    enabled: Boolean(record.project_id),
  });

  return (
    <div className="space-y-6">
      <AuthorsCard record={record} />
      <ExternalLinksCard record={record} />
      <RelatedOutputsCard
        loading={relatedOutputs.isLoading}
        records={relatedOutputs.data?.data ?? []}
        enabled={Boolean(record.project_id)}
      />
    </div>
  );
}

function AuthorsCard({ record }: { record: ResearchGenericRecord }) {
  const authors = Array.isArray(record.authors) ? record.authors : [];
  if (authors.length === 0 && !record.editors) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Authors and Editors</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {authors.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {authors.map((author) => (
              <Badge key={author.id ?? author.name} variant={author.is_corresponding ? "default" : "secondary"}>
                {[author.author_order, author.name].filter(Boolean).join(". ")}
              </Badge>
            ))}
          </div>
        ) : null}
        {record.editors ? (
          <div>
            <p className="text-xs font-semibold uppercase text-muted-foreground">Editors / External Authors</p>
            <p className="mt-1 text-sm">{record.editors}</p>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

function ExternalLinksCard({ record }: { record: ResearchGenericRecord }) {
  const links = [
    record.doi ? { label: "Open DOI", href: String(record.doi).startsWith("http") ? record.doi : `https://doi.org/${record.doi}` } : null,
    record.url ? { label: "Open URL", href: record.url } : null,
    record.pdf_url ? { label: "Open PDF", href: record.pdf_url } : null,
  ].filter(Boolean) as Array<{ label: string; href: string }>;

  if (links.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>External Links</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-2">
        {links.map((link) => (
          <Button key={link.label} asChild variant="outline" size="sm">
            <Link href={link.href} target="_blank">
              <ExternalLink className="mr-2 h-4 w-4" />
              {link.label}
            </Link>
          </Button>
        ))}
      </CardContent>
    </Card>
  );
}

function RelatedOutputsCard({
  loading,
  records,
  enabled,
}: {
  loading: boolean;
  records: ResearchGenericRecord[];
  enabled: boolean;
}) {
  if (!enabled) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Related Outputs</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading related outputs...</p>
        ) : records.length === 0 ? (
          <p className="text-sm text-muted-foreground">No project outputs are linked to this publication.</p>
        ) : (
          <div className="divide-y rounded-lg border">
            {records.map((output) => (
              <div key={output.id} className="flex flex-col gap-1 p-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-medium">{output.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {[labelize(output.output_type), formatPublicationDate(output.release_date), labelize(output.status)].filter(Boolean).join(" · ")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
