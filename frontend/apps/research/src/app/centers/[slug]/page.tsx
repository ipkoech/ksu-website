import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ResearchDetailHero,
  ResearchDetailSidebar,
  ResearchRecordPanel,
} from "../../../components/research-detail";
import {
  Badge,
  ResearchSection,
  StatusMessage,
} from "../../../components/research-ui";
import { ResearchStoryAccordion } from "../../../components/research-rich-text";
import {
  compactText,
  formatDate,
  formatLabel,
  generateSlugParams,
  getCenterBySlug,
  getCenterProjects,
  getCenterPublications,
  getProgramsFiltered,
  getRelatedOutputs,
} from "../../../lib/research-public-data";
import {
  getNarrativeSections,
  getRecordSummary,
  getRecordTitle,
} from "../../../lib/research-page-model";
import type { ResearchGenericRecord, ResearchProject, ResearchPublication } from "@ksu/api-client";
import { researchServiceApi } from "@ksu/api-client";

export const revalidate = 300;

export async function generateStaticParams() {
  return generateSlugParams(researchServiceApi.centers.list);
}

export default async function CenterDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { data, error } = await getCenterBySlug(slug);
  if (!data) notFound();

  const center = data as ResearchGenericRecord;
  const [programs, projects, publications, outputs] = await Promise.all([
    getProgramsFiltered({ centerId: center.id }),
    getCenterProjects(center.id),
    getCenterPublications(center.id),
    getRelatedOutputs({ centerId: center.id }),
  ]);
  const farms = getChildRecords(center, ["farms", "facilities"]);
  const teamMembers = getChildRecords(center, ["team_members", "people", "staff"]);
  const title = getRecordTitle(center, "Research center");
  const contactEmail = compactText(center.contact_email) || compactText(center.email);
  const website = compactText(center.website) || compactText(center.url);
  const storySections = getNarrativeSections(center, [
    { title: "Center mandate", fields: ["mandate", "about", "summary", "description"] },
    { title: "Research focus", fields: ["research_areas", "focus_areas", "objectives"] },
    { title: "How the center works", fields: ["functions", "services_summary", "activities"] },
    { title: "Public value", fields: ["impact", "strategic_priorities", "benefits"] },
  ]);

  return (
    <main id="research-main" className="min-h-screen bg-white">
      <ResearchDetailHero
        eyebrow="Research Center"
        title={title}
        body={compactText(center.about) || compactText(center.mandate) || getRecordSummary(center)}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Centers", href: "/centers" },
          { label: title },
        ]}
        labels={[center.center_type, center.status, center.is_featured ? "featured" : null]}
        facts={[
          { label: "Programs", value: programs.data.length },
          { label: "Projects", value: projects.data.length },
          { label: "Publications", value: publications.data.length },
          { label: "Outputs", value: outputs.data.length },
          { label: "Location", value: compactText(center.location) },
        ]}
        actions={[
          { label: "Back to centers", href: "/centers", variant: "secondary" },
          ...(contactEmail ? [{ label: "Contact center", href: `mailto:${contactEmail}` }] : []),
          ...(website ? [{ label: "Open website", href: website, variant: "secondary" as const }] : []),
        ]}
        imageSrc={compactText(center.cover_image_url) || "/images/research/research-innovation-hero.svg"}
        imageAlt="Research center profile, work, and public outputs"
      />

      {[error, programs.error, projects.error, publications.error, outputs.error]
        .filter(Boolean)
        .map((message, i) => (
          <section key={i} className="px-4 pt-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
            <div className="mx-auto max-w-[1680px]">
              <StatusMessage tone="error">{message}</StatusMessage>
            </div>
          </section>
        ))}

      <ResearchSection
        eyebrow="Center Story"
        title="Mandate, focus, and public value"
        body="Center profile fields are shown directly from the published backend record."
        tone="white"
      >
        <div className="grid grid-cols-[minmax(0,1fr)] gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="flex min-w-0 flex-col gap-5">
            <CenterStory sections={storySections} />
            <ResearchRecordPanel
              title="Facilities and farms"
              records={farms}
              hrefBase="/farm"
              empty="No public facilities are currently linked to this center."
            />
          </div>
          <ResearchDetailSidebar
            labels={[center.center_type, center.status, center.is_featured ? "Featured" : null]}
            facts={[
              { label: "Location", value: compactText(center.location) },
              { label: "Email", value: contactEmail },
              { label: "Phone", value: compactText(center.phone) },
              { label: "Website", value: website },
              { label: "Code", value: compactText(center.code) },
            ]}
            actions={[
              ...(contactEmail ? [{ label: "Contact center", href: `mailto:${contactEmail}` }] : []),
              ...(website ? [{ label: "Open center website", href: website, variant: "secondary" as const }] : []),
            ]}
          />
        </div>
      </ResearchSection>

      <ResearchSection
        eyebrow="Work From This Center"
        title="Programmes, projects, outputs, and people"
        body="Linked backend records show the center's public work without placeholder entries."
      >
        <div className="grid gap-5 lg:grid-cols-2">
          <ResearchRecordPanel
            title="Research programmes"
            records={programs.data}
            hrefBase="/programs"
            empty="No public programmes are currently linked to this center."
          />
          <ProjectPanel records={projects.data} />
          <PublicationPanel records={publications.data} />
          <ResearchRecordPanel
            title="Data, tools, and reports"
            records={outputs.data}
            hrefBase="/outputs"
            empty="No public outputs are currently linked to this center."
          />
          <ResearchRecordPanel
            title="People"
            records={teamMembers}
            empty="No public team members are currently linked to this center."
          />
          <ExploreCenter center={center} />
        </div>
      </ResearchSection>
    </main>
  );
}

function CenterStory({ sections }: { sections: Array<{ title: string; body: string }> }) {
  return (
    <ResearchStoryAccordion
      sections={sections}
      empty="The center story will appear when mandate, focus, activities, or impact fields are published."
    />
  );
}

function ProjectPanel({ records }: { records: ResearchProject[] }) {
  return (
    <section className="rounded-lg border border-border bg-white p-5 shadow-sm">
      <h2 className="font-display text-xl font-semibold text-foreground">Research projects</h2>
      <div className="mt-4 divide-y divide-border">
        {records.slice(0, 6).map((record) => (
          <article key={record.id} className="py-4 first:pt-0 last:pb-0">
            <div className="flex flex-wrap gap-2">
              <Badge>{formatLabel(record.project_type ?? "research")}</Badge>
              <Badge>{formatLabel(record.status ?? "ongoing")}</Badge>
            </div>
            <h3 className="mt-3 text-base font-semibold text-foreground">
              <Link href={record.slug ? `/projects/${record.slug}` : "/projects"} className="transition hover:text-primary">
                {record.title}
              </Link>
            </h3>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              {compactText(record.summary) || compactText(record.abstract) || `${record.progress_percentage ?? 0}% complete`}
            </p>
          </article>
        ))}
        {records.length === 0 ? (
          <p className="py-4 text-sm text-muted-foreground">
            No public projects are currently linked to this center.
          </p>
        ) : null}
      </div>
    </section>
  );
}

function PublicationPanel({ records }: { records: ResearchPublication[] }) {
  return (
    <section className="rounded-lg border border-border bg-white p-5 shadow-sm">
      <h2 className="font-display text-xl font-semibold text-foreground">Publications</h2>
      <div className="mt-4 divide-y divide-border">
        {records.slice(0, 6).map((record) => (
          <article key={record.id} className="py-4 first:pt-0 last:pb-0">
            <h3 className="text-base font-semibold text-foreground">
              <Link href={record.slug ? `/publications/${record.slug}` : "/publications"} className="transition hover:text-primary">
                {record.title}
              </Link>
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {[record.journal_name, record.year, formatDate(record.publication_date)]
                .map(compactText)
                .filter(Boolean)
                .join(" · ")}
            </p>
          </article>
        ))}
        {records.length === 0 ? (
          <p className="py-4 text-sm text-muted-foreground">
            No public publications are currently linked to this center.
          </p>
        ) : null}
      </div>
    </section>
  );
}

function ExploreCenter({ center }: { center: ResearchGenericRecord }) {
  const links = [
    { label: "View center projects", href: `/projects?center=${center.id}` },
    { label: "Browse programmes", href: `/programs?center=${center.id}` },
    { label: "Browse publications", href: "/publications" },
    { label: "Partner with research", href: "/partners" },
  ];

  return (
    <section className="rounded-lg border border-border bg-white p-5 shadow-sm">
      <h2 className="font-display text-xl font-semibold text-foreground">Explore next</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="rounded-md border border-border p-3 text-sm font-semibold text-primary transition hover:border-primary/30 hover:bg-primary/5"
          >
            {link.label}
          </Link>
        ))}
      </div>
    </section>
  );
}

function getChildRecords(record: ResearchGenericRecord, fields: string[]) {
  for (const field of fields) {
    if (Array.isArray(record[field])) return record[field] as ResearchGenericRecord[];
  }
  return [];
}
