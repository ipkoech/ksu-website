import { notFound } from "next/navigation";
import Link from "next/link";
import type { ResearchGenericRecord, ResearchPublication } from "@ksu/api-client";
import { ResearchDetailHero } from "../../../components/research-detail";
import {
  Badge,
  ResearchSection,
  StatusMessage,
} from "../../../components/research-ui";
import {
  compactText,
  formatDate,
  formatLabel,
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
        imageSrc="/images/research/research-hero-imagegen.png"
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
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-5">
            <TextPanel
              title="About this publication"
              fields={[
                ["Abstract", publication.abstract],
                ["Funding acknowledgement", publication.funding_acknowledgment],
              ]}
            />
            <TextPanel
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
          <aside className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap gap-2">
              <Badge>{formatLabel(publication.publication_type ?? "publication")}</Badge>
              {publication.access_type ? <Badge>{formatLabel(publication.access_type)}</Badge> : null}
              {publication.is_open_access ? <Badge>Open access</Badge> : null}
            </div>
            <dl className="mt-5 grid gap-3 text-sm">
              <Fact label="Year" value={compactText(publication.year)} />
              <Fact label="Published" value={formatDate(publication.publication_date)} />
              <Fact label="DOI" value={compactText(publication.doi)} />
              <Fact label="ISSN / ISBN" value={[publication.issn, publication.isbn].map(compactText).filter(Boolean).join(" / ")} />
            </dl>
            {accessLinks.length > 0 ? (
              <div className="mt-5 grid gap-2">
                {accessLinks.map(([label, href]) => (
                  <a
                    key={label}
                    href={href ?? "#"}
                    className="inline-flex min-h-11 items-center justify-center rounded-full bg-primary px-4 text-sm font-semibold text-white transition hover:bg-primary/90"
                  >
                    {label}
                  </a>
                ))}
              </div>
            ) : null}
          </aside>
        </div>
      </ResearchSection>

      <ResearchSection
        eyebrow="Research Context"
        title="How this publication connects"
        body="Relationships are displayed as project and center context where they are published by the API."
      >
        <div className="grid gap-5 lg:grid-cols-2">
          <RelationshipCard
            title="Related project"
            record={project}
            hrefBase="/projects"
            empty="No public project is linked to this publication yet."
          />
          <RelationshipCard
            title="Related center"
            record={center}
            hrefBase="/centers"
            empty="No public center is linked to this publication yet."
          />
          <TextPanel
            title="Citation"
            fields={[
              ["DOI", publication.doi],
              ["PMID", publication.pmid],
              ["ArXiv", publication.arxiv_id],
              ["URL", publication.url],
            ]}
          />
          <TextPanel
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

function TextPanel({
  title,
  fields,
}: {
  title: string;
  fields: Array<[string, string | number | null | undefined]>;
}) {
  const entries = fields
    .map(([label, value]) => [label, compactText(value)] as const)
    .filter(([, value]) => value);

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold text-slate-950">
        {title}
      </h2>
      {entries.length > 0 ? (
        <div className="mt-4 space-y-4">
          {entries.map(([label, value]) => (
            <div key={label}>
              <p className="text-xs font-semibold uppercase text-slate-500">{label}</p>
              <p className="mt-1 break-words whitespace-pre-line text-sm leading-7 text-slate-600">
                {value}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-3 text-sm leading-7 text-slate-600">
          This information has not been published yet.
        </p>
      )}
    </section>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-slate-50 p-3">
      <dt className="text-xs font-semibold uppercase text-slate-500">{label}</dt>
      <dd className="mt-1 break-words font-semibold text-slate-950">
        {value || "Not published"}
      </dd>
    </div>
  );
}

function RelationshipCard({
  title,
  record,
  hrefBase,
  empty,
}: {
  title: string;
  record?: ResearchGenericRecord;
  hrefBase: string;
  empty: string;
}) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-xl font-semibold text-slate-950">{title}</h2>
      {record ? (
        <>
          <h3 className="mt-4 text-base font-semibold text-slate-950">
            {record.slug ? (
              <Link href={`${hrefBase}/${record.slug}`} className="transition hover:text-primary">
                {record.name ?? record.title}
              </Link>
            ) : (
              record.name ?? record.title
            )}
          </h3>
          <p className="mt-2 text-sm leading-7 text-slate-600">
            {compactText(record.summary) ||
              compactText(record.about) ||
              compactText(record.description) ||
              "Additional relationship details are not published yet."}
          </p>
        </>
      ) : (
        <p className="mt-3 text-sm leading-7 text-slate-600">{empty}</p>
      )}
    </section>
  );
}
