import { notFound } from "next/navigation";
import type { ResearchGenericRecord } from "@ksu/api-client";
import { researchServiceApi } from "@ksu/api-client";
import {
  ResearchDetailHero,
  ResearchDetailSidebar,
  ResearchRecordPanel,
} from "../../../components/research-detail";
import { ResearchSection, StatusMessage } from "../../../components/research-ui";
import { ResearchStoryAccordion } from "../../../components/research-rich-text";
import {
  compactText,
  formatDate,
  generateSlugParams,
  getRelatedOutputs,
  getSustainabilityActivities,
  getSustainabilityBySlug,
  getSustainabilityPartners,
} from "../../../lib/research-public-data";
import { getNarrativeSections, getRecordSummary, getRecordTitle } from "../../../lib/research-page-model";

export const revalidate = 300;

export async function generateStaticParams() {
  return generateSlugParams(researchServiceApi.sustainability.list);
}

export default async function SustainabilityDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { data, error } = await getSustainabilityBySlug(slug);
  if (!data) notFound();

  const initiative = data as ResearchGenericRecord;
  const title = getRecordTitle(initiative, "Sustainability initiative");
  const storySections = getNarrativeSections(initiative, [
    { title: "Why This Matters", fields: ["summary", "description", "objectives"] },
    { title: "How The Work Happens", fields: ["approach", "activities", "methodology"] },
    { title: "Public Value", fields: ["impact", "outcomes", "community_impact"] },
    { title: "Signals And Goals", fields: ["sdg_goals", "targets", "indicators"] },
  ]);
  const [partners, activities, outputs] = await Promise.all([
    getSustainabilityPartners(),
    getSustainabilityActivities(),
    initiative.project_id ? getRelatedOutputs({ projectId: initiative.project_id }) : Promise.resolve({ data: [], total: 0, perPage: 100, error: null }),
  ]);

  return (
    <main id="research-main" className="min-h-screen bg-white">
      <ResearchDetailHero
        eyebrow="Sustainability"
        title={title}
        body={getRecordSummary(initiative)}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Sustainability", href: "/sustainability" },
          { label: title },
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
        imageSrc="/images/research/sustainability-hero-imagegen.webp"
        imageAlt="Sustainability initiative activities, partnerships, and public impact"
      />

      {[error, partners.error, activities.error, outputs.error]
        .filter(Boolean)
        .map((message, i) => (
          <section key={i} className="px-4 pt-4 sm:px-6 lg:px-8">
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
          <div className="flex min-w-0 flex-col gap-5">
            <SustainabilityStory sections={storySections} />
          </div>
          <ResearchDetailSidebar
            labels={[initiative.initiative_type ?? "sustainability", initiative.status]}
            facts={[
              { label: "Start", value: formatDate(initiative.start_date) },
              { label: "End", value: formatDate(initiative.end_date) },
              { label: "Contact", value: compactText(initiative.contact_email) },
              { label: "Website", value: compactText(initiative.website) },
            ]}
            actions={[
              ...(compactText(initiative.website)
                ? [{ label: "Open website", href: compactText(initiative.website) }]
                : []),
              ...(compactText(initiative.contact_email)
                ? [{ label: "Contact initiative", href: `mailto:${compactText(initiative.contact_email)}`, variant: "secondary" as const }]
                : []),
            ]}
          />
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

function SustainabilityStory({ sections }: { sections: Array<{ title: string; body: string }> }) {
  return (
    <ResearchStoryAccordion
      sections={sections}
      empty="The sustainability story appears when objectives, approach, activity, impact, or SDG fields are published."
    />
  );
}
