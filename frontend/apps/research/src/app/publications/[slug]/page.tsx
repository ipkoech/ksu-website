import { notFound } from "next/navigation";
import type { ResearchGenericRecord, ResearchPublication } from "@ksu/api-client";
import {
  ResearchDetailHero,
  ResearchDetailSidebar,
  ResearchRelationshipCard,
  ResearchTextPanel,
} from "../../../components/research-detail";
import { ResearchSection, StatusMessage } from "../../../components/research-ui";
import {
  compactText,
  formatDate,
  getPublicationBySlug,
} from "../../../lib/research-public-data";

export const dynamic = "force-dynamic";

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
  const accessLinks = [
    ["Open publication", publication.url],
    ["Download PDF", publication.pdf_url],
    ["DOI", publication.doi ? `https://doi.org/${publication.doi}` : null],
  ].filter(([, href]) => compactText(href));

  return (
    <main id="research-main" className="min-h-screen bg-white">
      <ResearchDetailHero
        eyebrow="Publication"
        title={publication.title}
        body={compactText(publication.abstract) || "Publication detail and access information."}
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
          ...accessLinks.slice(0, 2).map(([label, href]) => ({
            label: compactText(label),
            href: href ?? "#",
          })),
        ]}
        imageSrc="/images/research/research-home-hero.webp"
        imageAlt="Publication record and research evidence"
      />

      {error ? (
        <section className="px-4 pt-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[1680px]">
            <StatusMessage tone="error">{error}</StatusMessage>
          </div>
        </section>
      ) : null}

      <ResearchSection
        eyebrow="About this publication"
        title="Publication record"
        body="This page uses public language for bibliographic, access, and research-context relationships."
        tone="white"
      >
        <div className="grid grid-cols-[minmax(0,1fr)] gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="flex min-w-0 flex-col gap-5">
            <ResearchTextPanel
              title="About this publication"
              fields={[
                ["Abstract", publication.abstract],
                ["Funding acknowledgement", publication.funding_acknowledgment],
              ]}
            />
            <ResearchTextPanel
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
            actions={accessLinks.map(([label, href]) => ({
              label: compactText(label),
              href: href ?? "#",
            }))}
          />
        </div>
      </ResearchSection>

      <ResearchSection
        eyebrow="Research Context"
        title="How this publication connects"
        body="Relationships are displayed as project and center context where they are published by the API."
      >
        <div className="grid gap-5 lg:grid-cols-2">
          <ResearchRelationshipCard
            title="Related project"
            record={project}
            hrefBase="/projects"
            empty="No public project is linked to this publication yet."
          />
          <ResearchRelationshipCard
            title="Related center"
            record={center}
            hrefBase="/centers"
            empty="No public center is linked to this publication yet."
          />
          <ResearchTextPanel
            title="Citation"
            fields={[
              ["DOI", publication.doi],
              ["PMID", publication.pmid],
              ["ArXiv", publication.arxiv_id],
              ["URL", publication.url],
            ]}
          />
          <ResearchTextPanel
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
