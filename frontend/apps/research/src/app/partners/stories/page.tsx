import { ResearchPageHero } from "../../../components/research-page-hero";
import type { Metadata } from "next";
import Link from "next/link";

import type { ResearchGenericRecord } from "@ksu/api-client/server";
import { ArrowRight, Handshake, MessageSquareQuote } from "lucide-react";
import { StatusMessage } from "../../../components/research-ui";
import {
  compactText,
  formatDate,
  formatLabel,
  getPartnerRelationshipBundle,
  getPartners,
} from "../../../lib/research-public-data";
import {
  getRecordSummary,
  getRecordTitle,
} from "../../../lib/research-page-model";
import {
  PartnerStoriesDisplay,
  type PartnerStoryDto,
} from "../../../components/partner-stories-display";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Partner Case Studies & Testimonials",
  description:
    "Backend-backed partner case studies, testimonials, and linked work from Kisii University research collaborations.",
};

type StoriesSearchParams = {
  type?: string;
};

type PartnerStoryItem = {
  id: string;
  type: string;
  typeLabel: string;
  title: string;
  summary: string;
  href: string;
  partnerName: string;
  partnerHref: string;
  date?: string;
  badges: string[];
};

const typeTabs = [
  { value: "", label: "All" },
  { value: "impact", label: "Impact stories" },
  { value: "projects", label: "Projects" },
  { value: "consultancies", label: "Consultancies" },
  { value: "startups", label: "Startups" },
  { value: "transfer", label: "Technology transfer" },
  { value: "sustainability", label: "Sustainability" },
  { value: "competitions", label: "Competitions" },
];

export default async function PartnerStoriesPage({
  searchParams,
}: {
  searchParams?: Promise<StoriesSearchParams>;
}) {
  const params = (await searchParams) ?? {};
  const partners = await getPartners();
  const bundles = await Promise.all(
    partners.data.slice(0, 24).map(async (partner) => ({
      partner,
      bundle: await getPartnerRelationshipBundle(String(partner.id)),
    })),
  );
  const items = bundles.flatMap(({ partner, bundle }) =>
    buildPartnerItems(partner, bundle),
  );
  const filteredItems = params.type
    ? items.filter((item) => item.type === params.type)
    : items;
  const featured = filteredItems[0];
  const testimonials = partners.data
    .map((partner) => ({
      partner,
      quote:
        compactText(partner.key_achievements) || compactText(partner.about),
    }))
    .filter((item) => item.quote)
    .slice(0, 6);
  const errors = partners.error ? [partners.error] : [];
  const storyRows: PartnerStoryDto[] = filteredItems.map((item) => ({
    id: `${item.type}-${item.id}-${item.partnerName}`,
    typeLabel: item.typeLabel,
    title: item.title,
    summary: item.summary,
    href: item.href,
    partnerName: item.partnerName,
    date: item.date,
    badges: item.badges.map(formatLabel),
  }));

  return (
    <main id="research-main" className="min-h-screen bg-white text-foreground">
      <ResearchPageHero
        title="Case Studies & Testimonials"
        eyebrow="Innovation"
        description="Published partner-linked projects, consultancies, innovation pathways, technology transfer, and impact."
        imageSrc="/images/research/headers/innovation-week-8197.jpg"
        imageAlt="Kisii University Innovation Week"
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Case Studies & Testimonials" },
        ]}
        actions={[
          { label: "Explore stories", href: "#case-studies" },
          { label: "Become a partner", href: "/partners/how-to-partner" },
        ]}
      ></ResearchPageHero>

      <section
        id="case-studies"
        className="px-4 py-6 sm:px-6 lg:px-8 xl:px-10 2xl:px-12"
      >
        <div className="mx-auto grid max-w-[1680px] gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className="min-w-0">
            <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary">
                  Published evidence
                </p>
                <h2 className="mt-2 font-display text-2xl font-semibold text-foreground">
                  What partnerships have produced
                </h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {typeTabs.map((tab) => (
                  <Link
                    key={tab.label}
                    href={
                      tab.value
                        ? `/partners/stories?type=${tab.value}`
                        : "/partners/stories"
                    }
                    className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                      (params.type ?? "") === tab.value
                        ? "border-primary bg-primary text-white"
                        : "border-border bg-white text-muted-foreground hover:border-primary/35 hover:text-primary"
                    }`}
                  >
                    {tab.label}
                  </Link>
                ))}
              </div>
            </div>

            {errors.map((error) => (
              <div key={error} className="mb-4">
                <StatusMessage tone="error">{error}</StatusMessage>
              </div>
            ))}

            {featured ? (
              <PartnerStoriesDisplay items={storyRows} />
            ) : (
              <StatusMessage>
                No partner-linked records are available for this view.
              </StatusMessage>
            )}
          </div>

          <aside className="grid gap-4 xl:sticky xl:top-24">
            <section className="rounded-lg border border-border bg-white p-5 shadow-sm">
              <h2 className="text-lg font-semibold text-primary">
                Impact themes
              </h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {Array.from(
                  new Set(items.flatMap((item) => item.badges).filter(Boolean)),
                )
                  .slice(0, 12)
                  .map((badge) => (
                    <span
                      key={badge}
                      className="rounded-full border border-border bg-surface-subtle px-3 py-1 text-xs font-semibold text-muted-foreground"
                    >
                      {formatLabel(badge)}
                    </span>
                  ))}
              </div>
            </section>
            <section className="rounded-lg border border-primary/20 bg-accent/70 p-5 shadow-sm">
              <Handshake aria-hidden className="h-7 w-7 text-primary" />
              <h2 className="mt-3 font-semibold text-primary">
                Create the next case study
              </h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Start with the partnership guide, then connect with the research
                office.
              </p>
              <Link
                href="/partners/how-to-partner"
                className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary"
              >
                View guide
                <ArrowRight aria-hidden className="h-4 w-4" />
              </Link>
            </section>
          </aside>
        </div>
      </section>

      {testimonials.length > 0 ? (
        <section className="border-y border-border bg-surface-subtle px-4 py-6 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
          <div className="mx-auto max-w-[1680px]">
            <div className="mb-5 max-w-3xl">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary">
                Testimonials
              </p>
              <h2 className="mt-2 font-display text-2xl font-semibold text-foreground">
                Partner profile highlights
              </h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {testimonials.map(({ partner, quote }) => (
                <Link
                  key={partner.id}
                  href={
                    partner.slug ? `/partners/${partner.slug}` : "/partners"
                  }
                  className="rounded-lg border border-border bg-white p-5 shadow-sm transition hover:border-primary/35 hover:shadow-md"
                >
                  <MessageSquareQuote
                    aria-hidden
                    className="h-6 w-6 text-primary"
                  />
                  <p className="mt-3 line-clamp-4 text-sm leading-6 text-muted-foreground">
                    {quote}
                  </p>
                  <p className="mt-4 text-sm font-semibold text-primary">
                    {getRecordTitle(partner, "Partner")}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </main>
  );
}

function buildPartnerItems(
  partner: ResearchGenericRecord,
  bundle: Awaited<ReturnType<typeof getPartnerRelationshipBundle>>,
) {
  const partnerName = getRecordTitle(partner, "Partner");
  const partnerHref = partner.slug ? `/partners/${partner.slug}` : "/partners";
  const rows: PartnerStoryItem[] = [];
  const push = (
    type: string,
    typeLabel: string,
    hrefBase: string,
    records: ResearchGenericRecord[],
    badgeFields: string[] = [],
    dateField?: string,
  ) => {
    for (const record of records.slice(0, 8)) {
      rows.push({
        id: String(record.id ?? `${type}-${rows.length}`),
        type,
        typeLabel,
        title: getRecordTitle(record, typeLabel),
        summary:
          getRecordSummary(record) ||
          compactText(record.collaboration_areas) ||
          compactText(record.public_benefit) ||
          compactText(record.outcomes) ||
          compactText(record.impact),
        href: recordHref(hrefBase, record),
        partnerName,
        partnerHref,
        date: dateField ? formatDate(record[dateField]) : undefined,
        badges: badgeFields
          .map((field) => compactText(record[field]))
          .filter(Boolean),
      });
    }
  };

  push(
    "impact",
    "Impact story",
    "/community-impact",
    bundle.impactStories.data,
    ["story_type", "category"],
    "story_date",
  );
  push(
    "projects",
    "Project",
    "/projects",
    bundle.projects.data,
    ["project_type", "status"],
    "start_date",
  );
  push(
    "consultancies",
    "Consultancy",
    "/consultancies",
    bundle.consultancies.data,
    ["consultancy_type", "status"],
    "start_date",
  );
  push(
    "startups",
    "Startup",
    "/startups",
    bundle.startups.data,
    ["venture_stage", "sector"],
    "created_at",
  );
  push(
    "transfer",
    "Technology transfer",
    "/technology-transfer",
    bundle.technologyTransferCases.data,
    ["case_type", "transfer_status"],
    "agreement_date",
  );
  push(
    "sustainability",
    "Sustainability",
    "/sustainability",
    bundle.sustainability.data,
    ["initiative_type", "status"],
    "start_date",
  );
  push(
    "competitions",
    "Competition",
    "/competitions",
    bundle.competitionEntries.data,
    ["entry_type", "entry_status"],
    "event_date",
  );
  push(
    "incubation",
    "Incubation",
    "/incubation",
    bundle.incubationRecords.data,
    ["incubation_type", "stage"],
    "start_date",
  );

  return rows;
}

const recordDetailRoutes = new Set([
  "/projects",
  "/consultancies",
  "/sustainability",
  "/events",
  "/innovations",
  "/outputs",
  "/publications",
]);

function recordHref(hrefBase: string, record: ResearchGenericRecord) {
  return recordDetailRoutes.has(hrefBase) && record.slug
    ? `${hrefBase}/${record.slug}`
    : hrefBase;
}
