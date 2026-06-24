import { notFound } from "next/navigation";
import type { ResearchGenericRecord } from "@ksu/api-client";
import {
  ResearchDetailHero,
  ResearchDetailSidebar,
  ResearchRecordPanel,
  ResearchTextPanel,
} from "../../../components/research-detail";
import { ResearchSection, StatusMessage } from "../../../components/research-ui";
import {
  compactText,
  getFarmActivities,
  getFarmBySlug,
  getFarmPartners,
  getFarmProjects,
} from "../../../lib/research-public-data";

export const dynamic = "force-dynamic";

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
  const [projects, partners, activities] = await Promise.all([
    getFarmProjects(),
    getFarmPartners(),
    getFarmActivities(),
  ]);

  return (
    <main id="research-main" className="min-h-screen bg-white">
      <ResearchDetailHero
        eyebrow="University Farm"
        title={farm.name ?? farm.title ?? "University farm"}
        body={compactText(farm.about) || compactText(farm.activities)}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "University Farm", href: "/farm" },
          { label: farm.name ?? farm.title ?? "Farm" },
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
        imageSrc="/images/research/university-farm-hero-imagegen.webp"
        imageAlt="University farm research, demonstration, and extension work"
      />

      {[error, projects.error, partners.error, activities.error]
        .filter(Boolean)
        .map((message) => (
          <section key={message} className="px-4 pt-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-[1680px]">
              <StatusMessage tone="error">{message}</StatusMessage>
            </div>
          </section>
        ))}

      <ResearchSection
        eyebrow="Farm Profile"
        title="Applied research, demonstration, and extension"
        body="Farm records describe the facilities, activities, products, capacity, contact points, and center relationship."
        tone="white"
      >
        <div className="grid grid-cols-[minmax(0,1fr)] gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="flex min-w-0 flex-col gap-5">
            <ResearchTextPanel
              title="About the farm"
              fields={[
                ["About", farm.about],
                ["Activities", farm.activities],
                ["Products", farm.products],
                ["Facilities", farm.facilities],
                ["Capacity", farm.capacity_info],
              ]}
            />
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
