import Link from "next/link";
import { notFound } from "next/navigation";
import type { ResearchGenericRecord, ResearchPublication } from "@ksu/api-client";
import { researchServiceApi } from "@ksu/api-client";
import {
  ResearchDetailHero,
  ResearchDetailSidebar,
} from "../../../components/research-detail";
import { ResearchSection, StatusMessage } from "../../../components/research-ui";
import { ResearchStoryAccordion } from "../../../components/research-rich-text";
import {
  compactText,
  formatDate,
  generateSlugParams,
  getPublicationBySlug,
} from "../../../lib/research-public-data";
import { getNarrativeSections, getRecordSummary, getRecordTitle } from "../../../lib/research-page-model";

import { researchRecordMetadata } from "../../../lib/research-metadata";

export const revalidate = 300;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { data } = await getPublicationBySlug(slug);
  return researchRecordMetadata(data, { fallbackTitle: "Publication", pathname: "/publications/" + slug });
}

export async function generateStaticParams() {
  return generateSlugParams(researchServiceApi.publications.list);
}

export default async function PublicationDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { data, error } = await getPublicationBySlug(slug);
  if (!data) notFound();

  const publication = data as ResearchPublication & ResearchGenericRecord;
  const project = publication.project as ResearchGenericRecord | undefined;
  const center = publication.center as ResearchGenericRecord | undefined;
  const storySections = getNarrativeSections(publication, [
    { title: "What this publication covers", fields: ["abstract", "summary", "description"] },
    { title: "Research support", fields: ["funding_acknowledgment", "funding_acknowledgement"] },
    { title: "Where it appeared", fields: ["journal_name", "publisher", "conference_name", "book_title"] },
    { title: "How to access it", fields: ["access_type", "url", "pdf_url", "doi"] },
  ]);
  const accessLinks = (
    [
      ["Open publication", compactText(publication.url)],
      ["Download PDF", compactText(publication.pdf_url)],
      ["DOI", publication.doi ? `https://doi.org/${publication.doi}` : ""],
    ] as Array<[string, string]>
  ).filter(([, href]) => href);

  return (
    <main id="research-main" className="min-h-screen bg-white">
      <ResearchDetailHero
        eyebrow="Publication"
        title={publication.title}
        body={compactText(publication.abstract)}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Publications", href: "/publications" },
          { label: publication.title },
        ]}
        labels={[
          publication.publication_type,
          publication.access_type,
          publication.is_open_access ? "open access" : null,
        ]}
        facts={[
          { label: "Year", value: compactText(publication.year) },
          { label: "Published", value: formatDate(publication.publication_date) },
          { label: "Journal", value: publication.journal_name },
          { label: "DOI", value: publication.doi },
        ]}
        actions={[
          { label: "Back to publications", href: "/publications", variant: "secondary" },
          ...accessLinks.slice(0, 2).map(([label, href]) => ({ label, href })),
        ]}
        imageSrc="/images/research/research-home-hero.svg"
        imageAlt="Publication record and research evidence"
      />

      {error ? (
        <section className="px-4 pt-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
          <div className="mx-auto max-w-[1680px]">
            <StatusMessage tone="error">{error}</StatusMessage>
          </div>
        </section>
      ) : null}

      <ResearchSection
        eyebrow="About this publication"
        title="Publication record"
        body="Bibliographic details, access paths, and research context are assembled from the published API record."
        tone="white"
      >
        <div className="grid grid-cols-[minmax(0,1fr)] gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="flex min-w-0 flex-col gap-5">
            <PublicationStory sections={storySections} />
            <InfoPanel
              title="Published in"
              fields={[
                ["Journal", publication.journal_name],
                ["Publisher", publication.publisher],
                ["Conference", publication.conference_name],
                ["Book", publication.book_title],
                ["Volume and issue", [publication.volume, publication.issue].map(compactText).filter(Boolean).join(" / ")],
                ["Pages", publication.pages],
              ]}
            />
          </div>
          <ResearchDetailSidebar
            labels={[
              publication.publication_type ?? "publication",
              publication.access_type,
              publication.is_open_access ? "open access" : null,
            ]}
            facts={[
              { label: "Year", value: publication.year },
              { label: "Published", value: formatDate(publication.publication_date) },
              { label: "DOI", value: publication.doi },
              { label: "ISSN / ISBN", value: [publication.issn, publication.isbn].map(compactText).filter(Boolean).join(" / ") },
            ]}
            actions={accessLinks.map(([label, href]) => ({ label, href }))}
          />
        </div>
      </ResearchSection>

      <ResearchSection
        eyebrow="Research Context"
        title="Project, center, citation, and access"
        body="Linked context is shown only when the backend record exposes a public project, center, identifier, or access URL."
      >
        <div className="grid gap-5 lg:grid-cols-2">
          <ContextCard
            title="Project"
            record={project}
            hrefBase="/projects"
            empty="No public project is linked to this publication yet."
          />
          <ContextCard
            title="Center"
            record={center}
            hrefBase="/centers"
            empty="No public center is linked to this publication yet."
          />
          <InfoPanel
            title="Citation"
            fields={[
              ["DOI", publication.doi],
              ["PMID", publication.pmid],
              ["ArXiv", publication.arxiv_id],
              ["URL", publication.url],
            ]}
          />
          <InfoPanel
            title="Access"
            fields={[
              ["Access type", publication.access_type],
              ["PDF", publication.pdf_url],
              ["External URL", publication.url],
            ]}
          />
        </div>
      </ResearchSection>
    </main>
  );
}

function PublicationStory({ sections }: { sections: Array<{ title: string; body: string }> }) {
  return (
    <ResearchStoryAccordion
      sections={sections}
      empty="Publication story sections appear when abstract, support, venue, or access fields are published."
    />
  );
}

function InfoPanel({ title, fields }: { title: string; fields: Array<[string, unknown]> }) {
  const entries = fields
    .map(([label, value]) => [label, compactText(value as string | number | null | undefined)] as const)
    .filter(([, value]) => value);

  return (
    <section className="min-w-0 rounded-lg border border-border bg-white p-5 shadow-sm">
      <h2 className="font-display text-xl font-semibold text-foreground">{title}</h2>
      {entries.length ? (
        <dl className="mt-4 grid gap-3 text-sm">
          {entries.map(([label, value]) => (
            <div key={label} className="rounded-md bg-surface-subtle p-3">
              <dt className="text-xs font-semibold uppercase text-muted-foreground">{label}</dt>
              <dd className="mt-1 break-words font-semibold text-foreground">{value}</dd>
            </div>
          ))}
        </dl>
      ) : <p className="mt-3 text-sm leading-7 text-muted-foreground">No public details are published yet.</p>}
    </section>
  );
}

function ContextCard({ title, record, hrefBase, empty }: { title: string; record?: ResearchGenericRecord; hrefBase: string; empty: string }) {
  return (
    <section className="min-w-0 rounded-lg border border-border bg-white p-5 shadow-sm">
      <h2 className="font-display text-xl font-semibold text-foreground">{title}</h2>
      {record ? (
        <>
          <h3 className="mt-4 text-base font-semibold text-foreground">
            {record.slug ? (
              <Link href={`${hrefBase}/${record.slug}`} className="transition hover:text-primary">
                {getRecordTitle(record, title)}
              </Link>
            ) : getRecordTitle(record, title)}
          </h3>
          {getRecordSummary(record) ? <p className="mt-2 text-sm leading-7 text-muted-foreground">{getRecordSummary(record)}</p> : null}
        </>
      ) : <p className="mt-3 text-sm leading-7 text-muted-foreground">{empty}</p>}
    </section>
  );
}
