import {
  ResearchPageHero,
  ResearchPageSummary,
} from "../../components/research-page-hero";
import type { Metadata } from "next";
import { ResearchImage } from "../../components/research-image";
import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  Droplets,
  HandHeart,
  MapPin,
  Sprout,
  Target,
  UsersRound,
} from "lucide-react";
import type { ResearchGenericRecord } from "@ksu/api-client/server";
import { Badge, StatusMessage } from "../../components/research-ui";
import {
  compactText,
  formatDate,
  formatLabel,
  getDonationImpacts,
  getEvents,
  getStories,
  getSustainability,
} from "../../lib/research-public-data";
import {
  getRecordSummary,
  getRecordTitle,
} from "../../lib/research-page-model";
import {
  CommunityEngagementEvents,
  type CommunityEventDto,
} from "../../components/community-engagement-events";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Community Impact",
  description:
    "Research community impact, outreach, public engagement, and success stories.",
};

const quickLinks = [
  {
    label: "Impact metrics",
    href: "/impact-metrics",
    body: "Evidence, reach, outcomes and public value.",
  },
  {
    label: "Consultancies",
    href: "/consultancies",
    body: "Commissioned studies, advisory work and evaluation.",
  },
  {
    label: "Mentorship",
    href: "/mentorship",
    body: "Growth pathways for students and researchers.",
  },
  {
    label: "Partner with us",
    href: "/partners/how-to-partner",
    body: "Work with teams delivering public outcomes.",
  },
];

export default async function CommunityImpactPage() {
  const [stories, sustainability, events, donationImpacts] = await Promise.all([
    getStories(),
    getSustainability(),
    getEvents(),
    getDonationImpacts(),
  ]);

  const feature =
    stories.data.find((story) => story.is_featured) ?? stories.data[0];
  const eventRows: CommunityEventDto[] = events.data
    .slice(0, 3)
    .map((event, index) => {
      const date = getEventDate(event);
      return {
        id: String(event.id ?? event.slug ?? index),
        title: getRecordTitle(event, "Research event"),
        href: event.slug ? `/events/${event.slug}` : "/news?tab=-events",
        month: date ? date.toLocaleString("en-GB", { month: "short" }) : "TBD",
        day: date ? String(date.getDate()) : "—",
        venue:
          compactText(event.venue) ||
          compactText(event.location) ||
          "Venue to be announced",
        status: event.status ? formatLabel(event.status) : null,
      };
    });

  return (
    <main id="research-main" className="min-h-screen bg-white">
      <CommunityImpactHero
        farmersReached={getFirstNumber(stories.data, ["beneficiary_count"])}
        householdsImproved={getFirstNumber(donationImpacts.data, [
          "households_improved",
          "beneficiaries_count",
          "beneficiary_count",
        ])}
        countiesImpacted={countUnique(stories.data, ["county", "location"])}
      />

      <section className="border-b border-border bg-white px-4 py-6 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
        <div className="mx-auto grid max-w-[1680px] gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1.24fr)_minmax(320px,0.76fr)]">
            {feature ? <FeaturedImpactStory story={feature} /> : null}
            {feature ? <OutcomeStack story={feature} /> : null}
          </div>
          <CommunityQuickLinks />
        </div>
      </section>

      {[
        stories.error,
        sustainability.error,
        donationImpacts.error,
        events.error,
      ].filter(Boolean).length > 0 ? (
        <section className="px-4 pt-5 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
          <div className="mx-auto max-w-[1680px]">
            {[
              stories.error,
              sustainability.error,
              donationImpacts.error,
              events.error,
            ]
              .filter(Boolean)
              .map((error) => (
                <StatusMessage key={error} tone="error">
                  {error}
                </StatusMessage>
              ))}
          </div>
        </section>
      ) : null}

      <section className="bg-white px-4 py-5 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
        <div className="mx-auto grid max-w-[1680px] gap-4 xl:grid-cols-[minmax(0,0.98fr)_minmax(360px,0.88fr)_minmax(420px,1.04fr)]">
          {sustainability.data.length > 0 ? (
            <SustainabilityInitiativesPanel records={sustainability.data} />
          ) : null}
          {donationImpacts.data.length > 0 ? (
            <DonationImpactPanel records={donationImpacts.data} />
          ) : null}
          {events.data.length > 0 ? (
            <CommunityEngagementEvents events={eventRows} />
          ) : null}
        </div>
      </section>
    </main>
  );
}

function CommunityImpactHero({
  farmersReached,
  householdsImproved,
  countiesImpacted,
}: {
  farmersReached: number;
  householdsImproved: number;
  countiesImpacted: number;
}) {
  const stats = [
    { label: "Farmers reached", value: farmersReached, icon: UsersRound },
    {
      label: "Households improved",
      value: householdsImproved,
      icon: HandHeart,
    },
    { label: "Counties impacted", value: countiesImpacted, icon: MapPin },
  ].filter((stat) => stat.value > 0);

  return (
    <>
      <ResearchPageHero
        title="Community Impact"
        eyebrow="Impact"
        description="Evidence-driven solutions, stronger communities, and measurable public value."
        imageSrc="/images/research/headers/innovation-week-8173.jpg"
        imageAlt="Kisii University Innovation Week"
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Community Impact" },
        ]}
      />
      <ResearchPageSummary actions={[]} facts={stats}></ResearchPageSummary>
    </>
  );
}

function FeaturedImpactStory({ story }: { story: ResearchGenericRecord }) {
  const title = getRecordTitle(story, "Impact story");
  const summary =
    getRecordSummary(story) ||
    compactText(story.impact) ||
    compactText(story.outcomes);
  const storyImage = getRecordImage(
    story,
    "/images/research/verified/riana-outreach-01.jpeg",
  );
  return (
    <article className="group grid min-h-[318px] overflow-hidden rounded-lg border border-border bg-white shadow-sm transition hover:border-primary/35 md:grid-cols-[minmax(280px,0.94fr)_minmax(0,1fr)]">
      <div className="relative min-h-[230px] overflow-hidden bg-brand-overlay">
        <ResearchImage
          src={storyImage}
          alt={title}
          fill
          className="object-cover"
        />
        <div className="absolute left-3 top-3 rounded-md bg-primary px-3 py-1 text-xs font-semibold uppercase text-white">
          Featured success story
        </div>
      </div>
      <div className="flex min-w-0 flex-col p-5">
        <div className="flex flex-wrap gap-2">
          <Badge>
            {formatLabel(compactText(story.story_type) || "impact")}
          </Badge>
        </div>
        <h2 className="mt-4 text-balance font-display text-3xl font-semibold leading-tight text-foreground lg:text-4xl">
          {title}
        </h2>
        <dl className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted-foreground">
          <MiniFact
            label="County"
            value={compactText(story.county) || compactText(story.location)}
          />
          <MiniFact
            label="Reached"
            value={
              story.beneficiary_count
                ? `${story.beneficiary_count.toLocaleString()} people`
                : compactText(story.beneficiaries)
            }
          />
          <MiniFact
            label="Story date"
            value={formatDate(story.story_date ?? story.published_at)}
          />
        </dl>
        {summary ? (
          <p className="mt-4 line-clamp-4 text-sm leading-7 text-muted-foreground">
            {summary}
          </p>
        ) : null}
      </div>
    </article>
  );
}

function OutcomeStack({ story }: { story: ResearchGenericRecord }) {
  const items = [
    { label: "Challenge", value: compactText(story.challenge), icon: Target },
    {
      label: "Response",
      value: compactText(story.solution) || compactText(story.approach),
      icon: Sprout,
    },
    {
      label: "What changed",
      value: compactText(story.outcomes) || compactText(story.impact),
      icon: HandHeart,
    },
  ].filter((item) => item.value);

  if (items.length === 0) return null;

  return (
    <section className="rounded-lg border border-border bg-white p-4 shadow-sm">
      <h2 className="font-display text-2xl font-semibold text-foreground">
        What changed
      </h2>
      <div className="mt-4 divide-y divide-border rounded-lg border border-border">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <article
              key={item.label}
              className="grid gap-3 p-4 sm:grid-cols-[52px_minmax(0,1fr)]"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-full border border-primary/30 text-primary">
                  <Icon aria-hidden className="h-5 w-5" />
                </span>
              </div>
              <div>
                <h3 className="text-base font-semibold text-foreground">
                  {item.label}
                </h3>
                <p className="mt-1 line-clamp-2 text-sm leading-6 text-muted-foreground">
                  {item.value}
                </p>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function SustainabilityInitiativesPanel({
  records,
}: {
  records: ResearchGenericRecord[];
}) {
  return (
    <section className="rounded-lg border border-border bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-end justify-between gap-4">
        <h2 className="font-display text-2xl font-semibold text-foreground">
          Sustainability initiatives
        </h2>
        <Link
          href="/sustainability"
          className="inline-flex items-center gap-2 text-sm font-semibold text-primary"
        >
          View all <ArrowRight aria-hidden className="h-4 w-4" />
        </Link>
      </div>
      <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-3">
        {records.slice(0, 3).map((record) => {
          const title = getRecordTitle(record, "Sustainability initiative");
          return (
            <Link
              key={compactText(record.id) || compactText(record.slug) || title}
              href={
                record.slug
                  ? `/sustainability/${record.slug}`
                  : "/sustainability"
              }
              className="group overflow-hidden rounded-lg border border-border bg-white transition hover:border-primary/35 hover:shadow-sm"
            >
              <ResearchImage
                src={getRecordImage(
                  record,
                  "/images/research/verified/environment-03.jpeg",
                )}
                alt={title}
                width={640}
                height={224}
                className="h-28 w-full object-cover transition group-hover:scale-105"
              />
              <div className="p-3">
                <h3 className="line-clamp-2 text-sm font-semibold leading-5 text-foreground">
                  {title}
                </h3>
                <p className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin aria-hidden className="h-3.5 w-3.5" />
                  {compactText(record.county) ||
                    compactText(record.location) ||
                    formatLabel(compactText(record.initiative_type))}
                </p>
                {formatDate(record.start_date) ? (
                  <p className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                    <CalendarDays aria-hidden className="h-3.5 w-3.5" />
                    {formatDate(record.start_date)}
                  </p>
                ) : null}
                {compactText(record.impact) ? (
                  <p className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                    <UsersRound aria-hidden className="h-3.5 w-3.5" />
                    {compactText(record.impact)}
                  </p>
                ) : null}
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

function DonationImpactPanel({
  records,
}: {
  records: ResearchGenericRecord[];
}) {
  const cards = records
    .slice(0, 4)
    .map((record, index) => ({
      id: compactText(record.id) || compactText(record.slug) || `${index}`,
      title: getRecordTitle(
        record,
        donationFallbacks[index]?.title ?? "Donation impact",
      ),
      value:
        formatDonationValue(record) || donationFallbacks[index]?.value || "",
      body:
        compactText(record.summary) ||
        compactText(record.description) ||
        compactText(record.impact) ||
        donationFallbacks[index]?.body ||
        "",
      icon: donationFallbacks[index]?.icon ?? Sprout,
    }))
    .filter((card) => card.title || card.value || card.body);

  if (cards.length === 0) return null;

  return (
    <section className="rounded-lg border border-border bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-end justify-between gap-4">
        <h2 className="font-display text-2xl font-semibold text-foreground">
          Donation impact
        </h2>
        <Link
          href="/donate"
          className="inline-flex items-center gap-2 text-sm font-semibold text-primary"
        >
          View all <ArrowRight aria-hidden className="h-4 w-4" />
        </Link>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <article
              key={card.id}
              className="rounded-lg border border-border bg-white p-4 text-center"
            >
              <Icon aria-hidden className="mx-auto h-8 w-8 text-primary" />
              <h3 className="mt-3 text-sm font-medium leading-5 text-muted-foreground">
                {card.title}
              </h3>
              {card.value ? (
                <p className="mt-3 text-3xl font-semibold text-primary">
                  {card.value}
                </p>
              ) : null}
              {card.body ? (
                <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground">
                  {card.body}
                </p>
              ) : null}
            </article>
          );
        })}
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <HandHeart aria-hidden className="h-4 w-4 text-primary" />
          Your support is creating lasting change in our communities.
        </p>
        <Link
          href="/donate"
          className="inline-flex items-center gap-2 text-sm font-semibold text-primary"
        >
          Support our work <ArrowRight aria-hidden className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}

const donationFallbacks = [
  {
    title: "Soil tests subsidized",
    value: "",
    body: "Smallholder farms supported",
    icon: Sprout,
  },
  {
    title: "Water kits distributed",
    value: "",
    body: "Households benefited",
    icon: Droplets,
  },
  {
    title: "Improved seeds supplied",
    value: "",
    body: "Seed distributed",
    icon: Sprout,
  },
  {
    title: "Training materials provided",
    value: "",
    body: "Farmers trained",
    icon: CalendarDays,
  },
];

function CommunityQuickLinks() {
  return (
    <aside className="rounded-lg border border-border bg-white p-5 shadow-sm xl:sticky xl:top-28 xl:self-start">
      <h2 className="font-display text-2xl font-semibold text-foreground">
        Explore more
      </h2>
      <div className="mt-3 divide-y divide-border">
        {quickLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="group flex items-center justify-between gap-4 py-3"
          >
            <span>
              <span className="block text-sm font-semibold text-primary">
                {link.label}
              </span>
              <span className="mt-1 block text-xs leading-5 text-muted-foreground">
                {link.body}
              </span>
            </span>
            <ArrowRight
              aria-hidden
              className="h-4 w-4 shrink-0 text-muted-foreground/70 transition group-hover:translate-x-1 group-hover:text-primary"
            />
          </Link>
        ))}
      </div>
    </aside>
  );
}

function MiniFact({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="rounded-md bg-surface-subtle p-2.5">
      <dt className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-1 text-sm font-semibold text-foreground">{value}</dd>
    </div>
  );
}

function getRecordImage(record: ResearchGenericRecord, fallback: string) {
  return (
    compactText(record.cover_image_url) ||
    compactText(record.image_url) ||
    fallback
  );
}

function formatDonationValue(record: ResearchGenericRecord) {
  const candidates = [
    record.value,
    record.amount,
    record.amount_used,
    record.beneficiary_count,
    record.households_improved,
    record.farmers_trained,
  ];
  const value = candidates.map(compactText).find(Boolean);
  return value ? formatCompactNumber(value) : "";
}

function formatCompactNumber(value: string) {
  const numeric = Number(value);
  if (Number.isNaN(numeric)) return value;
  if (numeric >= 1_000_000)
    return `${Number((numeric / 1_000_000).toFixed(1))}M`;
  if (numeric >= 1_000) return numeric.toLocaleString();
  return String(numeric);
}

function getEventDate(event: ResearchGenericRecord) {
  const date = new Date(
    String(event.start_date ?? event.event_date ?? event.published_at ?? ""),
  );
  return Number.isNaN(date.getTime()) ? null : date;
}

function getFirstNumber(records: ResearchGenericRecord[], fields: string[]) {
  for (const record of records) {
    for (const field of fields) {
      const value = Number(record[field]);
      if (!Number.isNaN(value) && value > 0) return value;
    }
  }
  return 0;
}

function countUnique(records: ResearchGenericRecord[], fields: string[]) {
  const values = new Set<string>();
  for (const record of records) {
    for (const field of fields) {
      const value = compactText(record[field]);
      if (value) values.add(value);
    }
  }
  return values.size;
}
