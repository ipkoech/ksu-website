import { notFound } from "next/navigation";
import type { ResearchGenericRecord } from "@ksu/api-client";
import { researchServiceApi } from "@ksu/api-client";
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
  generateSlugParams,
  getOutputBySlug,
} from "../../../lib/research-public-data";

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
        imageSrc="/images/research/research-projects-hero.svg"
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
          <div className="flex min-w-0 flex-col gap-5">
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
          <ResearchDetailSidebar
            labels={[output.output_type ?? "output", output.access_type, output.status]}
            facts={[
              { label: "Released", value: formatDate(output.release_date) },
              { label: "Version", value: output.version },
              { label: "DOI", value: output.doi },
              { label: "Repository", value: output.repository_url },
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
