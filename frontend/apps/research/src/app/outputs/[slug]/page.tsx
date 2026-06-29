import { notFound } from "next/navigation";
import Link from "next/link";
import type { ResearchGenericRecord } from "@ksu/api-client";
import { researchServiceApi } from "@ksu/api-client";
import {
  ResearchDetailHero,
  ResearchDetailSidebar,
} from "../../../components/research-detail";
import { ResearchSection, StatusMessage } from "../../../components/research-ui";
import {
  compactText,
  formatDate,
  generateSlugParams,
  getOutputBySlug,
} from "../../../lib/research-public-data";
import {
  getNarrativeSections,
  getRecordSummary,
  getRecordTitle,
} from "../../../lib/research-page-model";

export const revalidate = 300;

export async function generateStaticParams() {
  return generateSlugParams(researchServiceApi.outputs.list);
}

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
  const title = getRecordTitle(output, "Research output");
  const accessLinks = [
    ["Download", output.download_url],
    ["Repository", output.repository_url],
    ["Access", output.access_url],
    ["DOI", output.doi ? `https://doi.org/${output.doi}` : null],
  ].filter(([, href]) => compactText(href));
  const storySections = getNarrativeSections(output, [
    { title: "What this output is", fields: ["summary", "description", "about"] },
    { title: "How it was produced", fields: ["methodology", "methods", "source"] },
    { title: "How it can be used", fields: ["usage_notes", "applications", "reuse_notes"] },
    { title: "Citation and reuse", fields: ["citation", "license", "format"] },
  ]);

  return (
    <main id="research-main" className="min-h-screen bg-white">
      <ResearchDetailHero
        eyebrow="Research Output"
        title={title}
        body={getRecordSummary(output)}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Outputs", href: "/outputs" },
          { label: title },
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
            label: compactText(label),
            href: compactText(href),
          })),
        ]}
        imageSrc={compactText(output.cover_image_url) || "/images/research/research-projects-hero.svg"}
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
        eyebrow="Output Story"
        title="Purpose, access, and reuse"
        body="Output details are shown from published backend fields: purpose, use, access, citation, and source context."
        tone="white"
      >
        <div className="grid grid-cols-[minmax(0,1fr)] gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="flex min-w-0 flex-col gap-5">
            <OutputStory sections={storySections} />
            <SourceContext project={project} center={center} />
          </div>
          <ResearchDetailSidebar
            labels={[output.output_type ?? "output", output.access_type, output.status]}
            facts={[
              { label: "Released", value: formatDate(output.release_date) },
              { label: "Version", value: output.version },
              { label: "DOI", value: output.doi },
              { label: "Repository", value: output.repository_url },
              { label: "License", value: output.license },
            ]}
            actions={accessLinks.map(([label, href]) => ({
              label: compactText(label),
              href: compactText(href),
            }))}
          />
        </div>
      </ResearchSection>
    </main>
  );
}

function OutputStory({ sections }: { sections: Array<{ title: string; body: string }> }) {
  if (sections.length === 0) {
    return (
      <StatusMessage>
        The output story will appear when summary, methodology, usage, or citation fields are published.
      </StatusMessage>
    );
  }

  return (
    <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      {sections.map((section, index) => (
        <details key={section.title} className="group border-b border-slate-200 last:border-b-0" open={index === 0}>
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-base font-semibold text-slate-950 transition hover:bg-slate-50">
            {section.title}
            <span className="text-primary transition group-open:rotate-45">+</span>
          </summary>
          <p className="px-5 pb-5 text-sm leading-7 text-slate-600">{section.body}</p>
        </details>
      ))}
    </section>
  );
}

function SourceContext({
  project,
  center,
}: {
  project?: ResearchGenericRecord;
  center?: ResearchGenericRecord;
}) {
  if (!project && !center) {
    return (
      <StatusMessage>
        Source project and center details will appear when linked public records are available.
      </StatusMessage>
    );
  }

  const cards = [
    project
      ? {
          label: "Produced by this project",
          title: getRecordTitle(project, "Research project"),
          href: project.slug ? `/projects/${project.slug}` : "/projects",
          body: getRecordSummary(project),
        }
      : null,
    center
      ? {
          label: "Hosted by this center",
          title: getRecordTitle(center, "Research center"),
          href: center.slug ? `/centers/${center.slug}` : "/centers",
          body: getRecordSummary(center),
        }
      : null,
  ].filter(Boolean) as Array<{ label: string; title: string; href: string; body: string }>;

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-xl font-semibold text-slate-950">Source context</h2>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {cards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="rounded-md border border-slate-200 p-3 transition hover:border-primary/30 hover:bg-primary/5"
          >
            <p className="text-xs font-semibold uppercase text-secondary">{card.label}</p>
            <h3 className="mt-2 text-base font-semibold text-slate-950">{card.title}</h3>
            {card.body ? (
              <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">{card.body}</p>
            ) : null}
          </Link>
        ))}
      </div>
    </section>
  );
}
