import { notFound } from "next/navigation";
import type { ResearchGenericRecord } from "@ksu/api-client";
import {
  ResearchDetailHero,
  ResearchFact,
  ResearchRelationshipCard,
  ResearchTextPanel,
} from "../../../components/research-detail";
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
        <div className="grid grid-cols-[minmax(0,1fr)] gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="min-w-0 space-y-5">
            <ResearchTextPanel
              title="About this output"
              fields={[
                ["Summary", output.summary],
                ["Description", output.description],
                ["Methodology", output.methodology],
                ["Usage notes", output.usage_notes],
              ]}
            />
            <ResearchTextPanel
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
              <ResearchFact label="Released" value={formatDate(output.release_date)} />
              <ResearchFact label="Version" value={compactText(output.version)} />
              <ResearchFact label="DOI" value={compactText(output.doi)} />
              <ResearchFact label="Repository" value={compactText(output.repository_url)} />
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
          <ResearchRelationshipCard
            title="Produced by this project"
            record={project}
            hrefBase="/projects"
            empty="No public project is linked to this output yet."
          />
          <ResearchRelationshipCard
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
