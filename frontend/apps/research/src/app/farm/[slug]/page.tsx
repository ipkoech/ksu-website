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
  generateSlugParams,
  getFarmActivities,
  getFarmBySlug,
  getFarmPartners,
  getFarmProjects,
} from "../../../lib/research-public-data";
import { getNarrativeSections, getRecordSummary, getRecordTitle } from "../../../lib/research-page-model";

export const revalidate = 300;

export async function generateStaticParams() {
  return generateSlugParams(researchServiceApi.farms.list);
}

export default async function FarmDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { data, error } = await getFarmBySlug(slug);
  if (!data) notFound();

  const farm = data as ResearchGenericRecord;
  const center = farm.center as ResearchGenericRecord | undefined;
  const title = getRecordTitle(farm, "University farm");
  const storySections = getNarrativeSections(farm, [
    { title: "What The Farm Supports", fields: ["about", "summary", "description", "activities"] },
    { title: "Research And Demonstrations", fields: ["facilities", "capacity_info", "equipment", "research_areas"] },
    { title: "Production And Extension", fields: ["products", "services", "community_impact", "extension"] },
    { title: "Operational Base", fields: ["location", "county", "manager_name", "contact_person"] },
  ]);
  const [projects, partners, activities] = await Promise.all([
    getFarmProjects(),
    getFarmPartners(),
    getFarmActivities(),
  ]);

  return (
    <main id="research-main" className="min-h-screen bg-white">
      <ResearchDetailHero
        eyebrow="University Farm"
        title={title}
        body={getRecordSummary(farm) || compactText(farm.activities)}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "University Farm", href: "/farm" },
          { label: title },
        ]}
        labels={[farm.farm_type ?? "farm", farm.status]}
        facts={[
          { label: "Size", value: farm.size_hectares ? `${compactText(farm.size_hectares)} hectares` : "" },
          { label: "Location", value: compactText(farm.location) || compactText(farm.county) },
          { label: "Manager", value: compactText(farm.manager_name) },
          { label: "Connected center", value: compactText(center?.name) || compactText(center?.title) },
        ]}
        actions={[
          { label: "Back to farm", href: "/farm", variant: "secondary" },
          ...(center?.slug ? [{ label: "View center", href: `/centers/${center.slug}` }] : []),
          ...(compactText(farm.email) ? [{ label: "Contact farm", href: `mailto:${compactText(farm.email)}`, variant: "secondary" as const }] : []),
        ]}
        imageSrc="/images/research/research-farm-hero.svg"
        imageAlt="University farm research, demonstration, and extension work"
      />

      {[error, projects.error, partners.error, activities.error]
        .filter(Boolean)
        .map((message, i) => (
          <section key={i} className="px-4 pt-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-[1680px]">
              <StatusMessage tone="error">{message}</StatusMessage>
            </div>
          </section>
        ))}

      <ResearchSection
        eyebrow="Farm Profile"
        title="Applied research, demonstration, and extension"
        body="Farm records describe the facilities, activities, products, capacity, contact points, and center connection."
        tone="white"
      >
        <div className="grid grid-cols-[minmax(0,1fr)] gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="flex min-w-0 flex-col gap-5">
            <FarmStory sections={storySections} />
          </div>
          <ResearchDetailSidebar
            labels={[farm.farm_type ?? "farm", farm.status]}
            facts={[
              { label: "Size", value: farm.size_hectares ? `${compactText(farm.size_hectares)} hectares` : "" },
              { label: "Location", value: compactText(farm.location) || compactText(farm.county) },
              { label: "Manager", value: compactText(farm.manager_name) },
              { label: "Email", value: compactText(farm.email) },
              { label: "Phone", value: compactText(farm.phone) },
              { label: "Connected center", value: center ? compactText(center.name ?? center.title) : "" },
            ]}
            actions={[
              ...(center?.slug ? [{ label: "View connected center", href: `/centers/${center.slug}` }] : []),
              ...(compactText(farm.email)
                ? [{ label: "Contact farm", href: `mailto:${compactText(farm.email)}`, variant: "secondary" as const }]
                : []),
            ]}
          />
        </div>
      </ResearchSection>

      <ResearchSection
        eyebrow="Farm Network"
        title="Projects, partners, and public activities"
        body="These records show how the farm connects to research work and community engagement."
      >
        <div className="grid gap-5 lg:grid-cols-3">
          <ResearchRecordPanel title="Farm-linked projects" records={projects.data} hrefBase="/projects" />
          <ResearchRecordPanel title="Partners" records={partners.data} hrefBase="/partners" />
          <ResearchRecordPanel title="Activities" records={activities.data} hrefBase="/events" />
        </div>
      </ResearchSection>
    </main>
  );
}

function FarmStory({ sections }: { sections: Array<{ title: string; body: string }> }) {
  return (
    <ResearchStoryAccordion
      sections={sections}
      empty="The farm story appears when profile, facilities, activities, production, or contact fields are published."
    />
  );
}
