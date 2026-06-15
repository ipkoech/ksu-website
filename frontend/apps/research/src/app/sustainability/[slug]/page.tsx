import { notFound } from "next/navigation";
import type { ResearchGenericRecord } from "@ksu/api-client";
import {
  ResearchDetailHero,
  ResearchFact,
  ResearchRecordPanel,
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
  getRelatedOutputs,
  getSustainabilityActivities,
  getSustainabilityBySlug,
  getSustainabilityPartners,
} from "../../../lib/research-public-data";

export const dynamic = "force-dynamic";

export default async function SustainabilityDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { data, error } = await getSustainabilityBySlug(slug);
  if (!data) notFound();

  const initiative = data as ResearchGenericRecord;
  const [partners, activities, outputs] = await Promise.all([
    getSustainabilityPartners(),
    getSustainabilityActivities(),
    initiative.project_id ? getRelatedOutputs({ projectId: initiative.project_id }) : Promise.resolve({ data: [], error: null }),
  ]);

  return (
    <main id="research-main" className="min-h-screen bg-white">
      <ResearchDetailHero
        eyebrow="Sustainability"
        title={initiative.name ?? initiative.title ?? "Sustainability initiative"}
        body={compactText(initiative.summary) || compactText(initiative.description)}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Sustainability", href: "/sustainability" },
          { label: initiative.name ?? initiative.title ?? "Initiative" },
        ]}
        labels={[initiative.initiative_type ?? "sustainability", initiative.status]}
        facts={[
          { label: "Start", value: formatDate(initiative.start_date) },
          { label: "End", value: formatDate(initiative.end_date) },
          { label: "SDG goals", value: Array.isArray(initiative.sdg_goals) ? initiative.sdg_goals.join(", ") : compactText(initiative.sdg_goals) },
          { label: "Contact", value: compactText(initiative.contact_email) },
        ]}
        actions={[
          { label: "Back to sustainability", href: "/sustainability", variant: "secondary" },
          ...(compactText(initiative.website) ? [{ label: "Open website", href: compactText(initiative.website) }] : []),
          ...(compactText(initiative.contact_email) ? [{ label: "Contact initiative", href: `mailto:${compactText(initiative.contact_email)}`, variant: "secondary" as const }] : []),
        ]}
        imageSrc="/images/research/research-workflows.png"
        imageAlt="Sustainability initiative activities, partnerships, and public impact"
      />

      {[error, partners.error, activities.error, outputs.error]
        .filter(Boolean)
        .map((message) => (
          <section key={message} className="px-4 pt-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-[1680px]">
              <StatusMessage tone="error">{message}</StatusMessage>
            </div>
          </section>
        ))}

      <ResearchSection
        eyebrow="Initiative Profile"
        title="Sustainability focus and public value"
        body="Sustainability details describe objectives, approach, activities, impact, SDG alignment, and public contact points."
        tone="white"
      >
        <div className="grid grid-cols-[minmax(0,1fr)] gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="min-w-0 space-y-5">
            <ResearchTextPanel
              title="Overview"
              fields={[
                ["Summary", initiative.summary],
                ["Description", initiative.description],
                ["Objectives", initiative.objectives],
              ]}
            />
            <ResearchTextPanel
              title="Approach and impact"
              fields={[
                ["Approach", initiative.approach],
                ["Activities", initiative.activities],
                ["Impact", initiative.impact],
                ["SDG goals", Array.isArray(initiative.sdg_goals) ? initiative.sdg_goals.join(", ") : initiative.sdg_goals],
              ]}
            />
          </div>
          <aside className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap gap-2">
              <Badge>{formatLabel(initiative.initiative_type ?? "sustainability")}</Badge>
              {initiative.status ? <Badge>{formatLabel(initiative.status)}</Badge> : null}
            </div>
            <dl className="mt-5 grid gap-3 text-sm">
              <ResearchFact label="Start" value={formatDate(initiative.start_date)} />
              <ResearchFact label="End" value={formatDate(initiative.end_date)} />
              <ResearchFact label="Contact" value={compactText(initiative.contact_email)} />
              <ResearchFact label="Website" value={compactText(initiative.website)} />
            </dl>
          </aside>
        </div>
      </ResearchSection>

      <ResearchSection
        eyebrow="Delivery Network"
        title="Partners, activities, and outputs"
        body="Related records show who participates and what public outputs are available."
      >
        <div className="grid gap-5 lg:grid-cols-3">
          <ResearchRecordPanel title="Partners" records={partners.data} hrefBase="/partners" />
          <ResearchRecordPanel title="Activities" records={activities.data} hrefBase="/events" />
          <ResearchRecordPanel title="Outputs" records={outputs.data} hrefBase="/outputs" />
        </div>
      </ResearchSection>
    </main>
  );
}
