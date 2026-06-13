import { notFound } from "next/navigation";
import Link from "next/link";
import type { ResearchGenericRecord } from "@ksu/api-client";
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
  getOutputBySlug,
} from "../../../lib/research-public-data";

export const dynamic = "force-dynamic";

export default async function OutputDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { data, error } = await getOutputBySlug(slug);
  if (!data) notFound();

  const output = data as ResearchGenericRecord;
  const project = output.project as ResearchGenericRecord | undefined;
  const center = output.center as ResearchGenericRecord | undefined;
  const accessLinks = [
    ["Download", output.download_url],
    ["Repository", output.repository_url],
    ["Access", output.access_url],
    ["DOI", output.doi ? `https://doi.org/${output.doi}` : null],
  ].filter(([, href]) => compactText(href));

  return (
    <main id="research-main" className="min-h-screen bg-white">
      <ResearchDetailHero
        eyebrow="Research Output"
        title={output.title ?? output.name ?? "Research output"}
        body={compactText(output.summary) || compactText(output.description)}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Outputs", href: "/outputs" },
          { label: output.title ?? output.name ?? "Output" },
        ]}
        labels={[output.output_type, output.access_type, output.status]}
        facts={[
          { label: "Released", value: formatDate(output.release_date) },
          { label: "Version", value: output.version },
          { label: "DOI", value: output.doi },
          { label: "License", value: output.license },
        ]}
        actions={[
          { label: "Back to outputs", href: "/outputs", variant: "secondary" },
          ...accessLinks.slice(0, 2).map(([label, href]) => ({
            label,
            href: href ?? "#",
          })),
        ]}
        imageSrc="/images/research/research-demo-imagegen.png"
        imageAlt="Research output, dataset, toolkit, or report detail"
      />

      {error ? (
        <section className="px-4 pt-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[1680px]">
            <StatusMessage tone="error">{error}</StatusMessage>
          </div>
        </section>
      ) : null}

      <ResearchSection
        eyebrow="Output Profile"
        title="What this output is and how it can be used"
        body="Output details are shown in public terms: purpose, use, access, citation, and research context."
        tone="white"
      >
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-5">
            <TextPanel
              title="About this output"
              fields={[
                ["Summary", output.summary],
                ["Description", output.description],
                ["Methodology", output.methodology],
                ["Usage notes", output.usage_notes],
              ]}
            />
            <TextPanel
              title="Citation and reuse"
              fields={[
                ["Citation", output.citation],
                ["License", output.license],
                ["Format", output.format],
                ["Size", output.size],
              ]}
            />
          </div>
          <aside className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap gap-2">
              <Badge>{formatLabel(output.output_type ?? "output")}</Badge>
              {output.access_type ? <Badge>{formatLabel(output.access_type)}</Badge> : null}
              {output.status ? <Badge>{formatLabel(output.status)}</Badge> : null}
            </div>
            <dl className="mt-5 grid gap-3 text-sm">
              <Fact label="Released" value={formatDate(output.release_date)} />
              <Fact label="Version" value={compactText(output.version)} />
              <Fact label="DOI" value={compactText(output.doi)} />
              <Fact label="Repository" value={compactText(output.repository_url)} />
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
        title="Project and center relationships"
        body="Visitors see where the output came from and where to continue exploring."
      >
        <div className="grid gap-5 lg:grid-cols-2">
          <RelationshipCard
            title="Produced by this project"
            record={project}
            hrefBase="/projects"
            empty="No public project is linked to this output yet."
          />
          <RelationshipCard
            title="Connected center"
            record={center}
            hrefBase="/centers"
            empty="No public center is linked to this output yet."
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
