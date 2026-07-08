import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CalendarDays, Droplets, HandHeart, MapPin, Sprout, Target, UsersRound } from "lucide-react";
import type { ResearchGenericRecord } from "@ksu/api-client";
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
import { getRecordSummary, getRecordTitle } from "../../lib/research-page-model";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Community Impact",
  description: "Research community impact, outreach, public engagement, and success stories.",
};

const quickLinks = [
  { label: "Impact metrics", href: "/impact-metrics", body: "Evidence, reach, outcomes and public value." },
  { label: "Consultancies", href: "/consultancies", body: "Commissioned studies, advisory work and evaluation." },
  { label: "Mentorship", href: "/mentorship", body: "Growth pathways for students and researchers." },
  { label: "Partner with us", href: "/partners/how-to-partner", body: "Work with teams delivering public outcomes." },
];

export default async function CommunityImpactPage() {
  const [stories, sustainability, events, donationImpacts] = await Promise.all([
    getStories(),
    getSustainability(),
    getEvents(),
    getDonationImpacts(),
  ]);

  const feature = stories.data.find((story) => story.is_featured) ?? stories.data[0];

  return (
    <main id="research-main" className="min-h-screen bg-white">
      <CommunityImpactHero
        farmersReached={getFirstNumber(stories.data, ["beneficiary_count"])}
        householdsImproved={getFirstNumber(donationImpacts.data, ["households_improved", "beneficiaries_count", "beneficiary_count"])}
        countiesImpacted={countUnique(stories.data, ["county", "location"])}
      />

      <section className="border-b border-slate-200 bg-white px-4 py-6 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
        <div className="mx-auto grid max-w-[1680px] gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1.24fr)_minmax(320px,0.76fr)]">
            {feature ? <FeaturedImpactStory story={feature} /> : null}
            {feature ? <OutcomeStack story={feature} /> : null}
          </div>
          <CommunityQuickLinks />
        </div>
      </section>

      {[stories.error, sustainability.error, donationImpacts.error, events.error].filter(Boolean).length > 0 ? (
        <section className="px-4 pt-5 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
          <div className="mx-auto max-w-[1680px]">
            {[stories.error, sustainability.error, donationImpacts.error, events.error].filter(Boolean).map((error) => (
              <StatusMessage key={error} tone="error">{error}</StatusMessage>
            ))}
          </div>
        </section>
      ) : null}

      <section className="bg-white px-4 py-5 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
        <div className="mx-auto grid max-w-[1680px] gap-4 xl:grid-cols-[minmax(0,0.98fr)_minmax(360px,0.88fr)_minmax(420px,1.04fr)]">
          {sustainability.data.length > 0 ? <SustainabilityInitiativesPanel records={sustainability.data} /> : null}
          {donationImpacts.data.length > 0 ? <DonationImpactPanel records={donationImpacts.data} /> : null}
          {events.data.length > 0 ? <PublicEngagementEvents events={events.data} /> : null}
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
    { label: "Households improved", value: householdsImproved, icon: HandHeart },
    { label: "Counties impacted", value: countiesImpacted, icon: MapPin },
  ].filter((stat) => stat.value > 0);

  return (
    <section className="relative overflow-hidden border-b border-slate-200 bg-[#f7fbfb] px-4 py-8 text-slate-950 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
      <div className="absolute inset-0 bg-[linear-gradient(90deg,#ffffff_0%,rgba(255,255,255,0.9)_28%,rgba(233,245,241,0.62)_68%,rgba(234,244,248,0.94)_100%)]" />
      <div className="absolute inset-y-0 right-0 hidden w-[72%] opacity-95 lg:block">
        <CommunityIllustration />
      </div>
      <div className="relative mx-auto grid min-h-[260px] max-w-[1680px] gap-6 lg:grid-cols-[minmax(0,0.45fr)_minmax(460px,0.55fr)] lg:items-center">
        <div className="relative z-10">
          <h1 className="max-w-3xl text-balance font-[family-name:var(--font-display)] text-5xl font-semibold leading-none text-slate-950 sm:text-6xl">
            Community Impact
          </h1>
          <div className="mt-4 h-1 w-14 rounded-full bg-secondary" />
          <p className="mt-5 max-w-2xl text-pretty text-lg leading-8 text-slate-700">
            Evidence-driven solutions. Stronger communities. Measurable public value.
          </p>
        </div>
        <div className="relative z-10 flex justify-end">
          {stats.length > 0 ? (
            <dl className="w-full max-w-[240px] rounded-lg border border-slate-200 bg-white/90 p-4 shadow-[0_22px_70px_-46px_rgba(15,23,42,0.48)] backdrop-blur">
              <dt className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Impact highlights</dt>
              {stats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <div key={stat.label} className="flex items-center gap-3 border-t border-slate-100 py-3 first:border-t-0 first:pt-0 last:pb-0">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Icon aria-hidden className="h-4 w-4" />
                    </span>
                    <div>
                      <dt className="text-xs font-medium text-slate-600">{stat.label}</dt>
                      <dd className="text-lg font-semibold text-slate-950">{stat.value.toLocaleString()}{stat.value > 999 ? "+" : ""}</dd>
                    </div>
                  </div>
                );
              })}
            </dl>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function FeaturedImpactStory({ story }: { story: ResearchGenericRecord }) {
  const title = getRecordTitle(story, "Impact story");
  const summary = getRecordSummary(story) || compactText(story.impact) || compactText(story.outcomes);
  const storyImage = getRecordImage(story, "/images/research/research-demo-imagegen.webp");
  return (
    <article className="group grid min-h-[318px] overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition hover:border-primary/35 md:grid-cols-[minmax(280px,0.94fr)_minmax(0,1fr)]">
      <div className="relative min-h-[230px] overflow-hidden bg-slate-900">
        <img src={storyImage} alt={title} className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute left-3 top-3 rounded-md bg-primary px-3 py-1 text-xs font-semibold uppercase text-white">Featured success story</div>
      </div>
      <div className="flex min-w-0 flex-col p-5">
        <div className="flex flex-wrap gap-2">
          <Badge>{formatLabel(compactText(story.story_type) || "impact")}</Badge>
        </div>
        <h2 className="mt-4 text-balance font-[family-name:var(--font-display)] text-3xl font-semibold leading-tight text-slate-950 lg:text-4xl">
          {title}
        </h2>
        <dl className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-600">
          <MiniFact label="County" value={compactText(story.county) || compactText(story.location)} />
          <MiniFact label="Reached" value={story.beneficiary_count ? `${story.beneficiary_count.toLocaleString()} people` : compactText(story.beneficiaries)} />
          <MiniFact label="Story date" value={formatDate(story.story_date ?? story.published_at)} />
        </dl>
        {summary ? <p className="mt-4 line-clamp-4 text-sm leading-7 text-slate-600">{summary}</p> : null}
        <Link href="/community-impact" className="mt-auto inline-flex items-center gap-2 pt-5 text-sm font-semibold text-primary">
          Read full story <ArrowRight aria-hidden className="h-4 w-4 transition group-hover:translate-x-1" />
        </Link>
      </div>
    </article>
  );
}

function OutcomeStack({ story }: { story: ResearchGenericRecord }) {
  const items = [
    { label: "Challenge", value: compactText(story.challenge), icon: Target },
    { label: "Response", value: compactText(story.solution) || compactText(story.approach), icon: Sprout },
    { label: "What changed", value: compactText(story.outcomes) || compactText(story.impact), icon: HandHeart },
  ].filter((item) => item.value);

  if (items.length === 0) return null;

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-slate-950">What changed</h2>
      <div className="mt-4 divide-y divide-slate-200 rounded-lg border border-slate-200">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <article key={item.label} className="grid gap-3 p-4 sm:grid-cols-[52px_minmax(0,1fr)]">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-full border border-primary/30 text-primary">
                <Icon aria-hidden className="h-5 w-5" />
              </span>
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-950">{item.label}</h3>
              <p className="mt-1 line-clamp-2 text-sm leading-6 text-slate-600">{item.value}</p>
            </div>
          </article>
        );
      })}
      </div>
    </section>
  );
}

function SustainabilityInitiativesPanel({ records }: { records: ResearchGenericRecord[] }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-end justify-between gap-4">
        <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-slate-950">Sustainability initiatives</h2>
        <Link href="/sustainability" className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
          View all <ArrowRight aria-hidden className="h-4 w-4" />
        </Link>
      </div>
      <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-3">
        {records.slice(0, 3).map((record) => {
          const title = getRecordTitle(record, "Sustainability initiative");
          return (
            <Link key={compactText(record.id) || compactText(record.slug) || title} href={record.slug ? `/sustainability/${record.slug}` : "/sustainability"} className="group overflow-hidden rounded-lg border border-slate-200 bg-white transition hover:border-primary/35 hover:shadow-sm">
              <img src={getRecordImage(record, "/images/research/sustainability-hero-imagegen.webp")} alt={title} className="h-28 w-full object-cover transition group-hover:scale-105" />
              <div className="p-3">
                <h3 className="line-clamp-2 text-sm font-semibold leading-5 text-slate-950">{title}</h3>
                <p className="mt-2 flex items-center gap-1 text-xs text-slate-500">
                  <MapPin aria-hidden className="h-3.5 w-3.5" />
                  {compactText(record.county) || compactText(record.location) || formatLabel(compactText(record.initiative_type))}
                </p>
                {formatDate(record.start_date) ? (
                  <p className="mt-2 flex items-center gap-1 text-xs text-slate-500">
                    <CalendarDays aria-hidden className="h-3.5 w-3.5" />
                    {formatDate(record.start_date)}
                  </p>
                ) : null}
                {compactText(record.impact) ? (
                  <p className="mt-2 flex items-center gap-1 text-xs text-slate-500">
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

function DonationImpactPanel({ records }: { records: ResearchGenericRecord[] }) {
  const cards = records.slice(0, 4).map((record, index) => ({
    id: compactText(record.id) || compactText(record.slug) || `${index}`,
    title: getRecordTitle(record, donationFallbacks[index]?.title ?? "Donation impact"),
    value: formatDonationValue(record) || donationFallbacks[index]?.value || "",
    body: compactText(record.summary) || compactText(record.description) || compactText(record.impact) || donationFallbacks[index]?.body || "",
    icon: donationFallbacks[index]?.icon ?? Sprout,
  })).filter((card) => card.title || card.value || card.body);

  if (cards.length === 0) return null;

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-end justify-between gap-4">
        <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-slate-950">Donation impact</h2>
        <Link href="/donate" className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
          View all <ArrowRight aria-hidden className="h-4 w-4" />
        </Link>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <article key={card.id} className="rounded-lg border border-slate-200 bg-white p-4 text-center">
              <Icon aria-hidden className="mx-auto h-8 w-8 text-primary" />
              <h3 className="mt-3 text-sm font-medium leading-5 text-slate-700">{card.title}</h3>
              {card.value ? <p className="mt-3 text-3xl font-semibold text-primary">{card.value}</p> : null}
              {card.body ? <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">{card.body}</p> : null}
            </article>
          );
        })}
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4">
        <p className="flex items-center gap-2 text-sm text-slate-600">
          <HandHeart aria-hidden className="h-4 w-4 text-primary" />
          Your support is creating lasting change in our communities.
        </p>
        <Link href="/donate" className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
          Support our work <ArrowRight aria-hidden className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}

const donationFallbacks = [
  { title: "Soil tests subsidized", value: "", body: "Smallholder farms supported", icon: Sprout },
  { title: "Water kits distributed", value: "", body: "Households benefited", icon: Droplets },
  { title: "Improved seeds supplied", value: "", body: "Seed distributed", icon: Sprout },
  { title: "Training materials provided", value: "", body: "Farmers trained", icon: CalendarDays },
];

function PublicEngagementEvents({ events }: { events: ResearchGenericRecord[] }) {
  const featuredEvents = events.slice(0, 3);
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-slate-950">Public engagement events</h2>
        </div>
        <Link href="/news?tab=-events" className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
          View all <ArrowRight aria-hidden className="h-4 w-4" />
        </Link>
      </div>
      <div className="grid gap-4 lg:grid-cols-[minmax(220px,0.8fr)_minmax(0,1fr)]">
        <MiniCalendar events={featuredEvents} />
        <div className="grid gap-2">
          {featuredEvents.map((event) => {
            const parts = getEventDateParts(event);
            return (
              <Link key={compactText(event.id) || compactText(event.slug) || getRecordTitle(event, "Research event")} href={event.slug ? `/events/${event.slug}` : "/news?tab=-events"} className="grid grid-cols-[64px_minmax(0,1fr)] gap-3 rounded-lg border border-slate-200 p-3 transition hover:border-primary/35">
                <time className="flex h-16 flex-col items-center justify-center rounded-md bg-primary/10 text-primary">
                  <span className="text-[10px] font-bold uppercase">{parts.month}</span>
                  <span className="text-2xl font-semibold">{parts.day}</span>
                </time>
                <div className="min-w-0">
                  <h3 className="line-clamp-2 text-sm font-semibold leading-5 text-slate-950">{getRecordTitle(event, "Research event")}</h3>
                  <p className="mt-1 flex items-center gap-1 line-clamp-1 text-xs text-slate-500">
                    <MapPin aria-hidden className="h-3.5 w-3.5" />
                    {compactText(event.venue) || compactText(event.location)}
                  </p>
                  {event.status ? <Badge>{formatLabel(event.status)}</Badge> : null}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-4 text-xs text-slate-500">
        <LegendDot className="bg-primary" label="Upcoming" />
        <LegendDot className="bg-secondary" label="Ongoing" />
        <LegendDot className="bg-slate-300" label="Completed" />
      </div>
    </section>
  );
}

function MiniCalendar({ events }: { events: ResearchGenericRecord[] }) {
  const activeDays = new Set(events.map((event) => getEventDateParts(event).day).filter(Boolean));
  const days = Array.from({ length: 35 }, (_, index) => index + 1);
  return (
    <div className="rounded-lg border border-slate-200 p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-lg font-semibold text-slate-950">May 2025</span>
        <CalendarDays aria-hidden className="h-5 w-5 text-primary" />
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-semibold text-slate-500">
        {["S", "M", "T", "W", "T", "F", "S"].map((day, index) => <span key={`${day}-${index}`}>{day}</span>)}
      </div>
      <div className="mt-2 grid grid-cols-7 gap-1 text-center text-xs text-slate-600">
        {days.map((day) => (
          <span key={day} className={`flex h-7 items-center justify-center rounded-full ${activeDays.has(String(day).padStart(2, "0")) || day === 20 ? "bg-primary text-white" : ""}`}>
            {day}
          </span>
        ))}
      </div>
    </div>
  );
}

function LegendDot({ className, label }: { className: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className={`h-2 w-2 rounded-full ${className}`} />
      {label}
    </span>
  );
}

function CommunityQuickLinks() {
  return (
    <aside className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm xl:sticky xl:top-28 xl:self-start">
      <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-slate-950">Explore more</h2>
      <div className="mt-3 divide-y divide-slate-200">
        {quickLinks.map((link) => (
          <Link key={link.href} href={link.href} className="group flex items-center justify-between gap-4 py-3">
            <span>
              <span className="block text-sm font-semibold text-primary">{link.label}</span>
              <span className="mt-1 block text-xs leading-5 text-slate-500">{link.body}</span>
            </span>
            <ArrowRight aria-hidden className="h-4 w-4 shrink-0 text-slate-400 transition group-hover:translate-x-1 group-hover:text-primary" />
          </Link>
        ))}
      </div>
    </aside>
  );
}

function MiniFact({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="rounded-md bg-slate-50 p-2.5">
      <dt className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">{label}</dt>
      <dd className="mt-1 text-sm font-semibold text-slate-950">{value}</dd>
    </div>
  );
}

function getRecordImage(record: ResearchGenericRecord, fallback: string) {
  return compactText(record.cover_image_url) || compactText(record.image_url) || fallback;
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
  if (numeric >= 1_000_000) return `${Number((numeric / 1_000_000).toFixed(1))}M`;
  if (numeric >= 1_000) return numeric.toLocaleString();
  return String(numeric);
}

function getEventDateParts(event: ResearchGenericRecord) {
  const date = new Date(String(event.start_date ?? event.event_date ?? event.published_at ?? ""));
  if (Number.isNaN(date.getTime())) return { month: "MAY", day: "" };
  return {
    month: date.toLocaleString("en-US", { month: "short" }).toUpperCase(),
    day: String(date.getDate()).padStart(2, "0"),
  };
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

function CommunityIllustration() {
  return (
    <svg viewBox="0 0 760 360" className="h-full w-full" role="img" aria-label="Community impact illustration">
      <defs>
        <linearGradient id="community-sky" x1="0" x2="1">
          <stop offset="0" stopColor="#f6fbfb" />
          <stop offset="1" stopColor="#dbeef5" />
        </linearGradient>
      </defs>
      <rect width="760" height="360" fill="url(#community-sky)" opacity="0.2" />
      <path d="M0 230 C120 170 210 196 316 142 C444 77 560 94 760 46 V360 H0Z" fill="#dfeee7" />
      <path d="M0 282 C128 236 230 256 348 210 C480 158 606 168 760 118 V360 H0Z" fill="#c8e3d9" />
      <path d="M90 286 C180 242 280 244 380 214 C512 176 612 174 736 140" fill="none" stroke="#0b4f71" strokeOpacity="0.24" strokeWidth="2" />
      <path d="M510 108 L642 70 L720 132 L684 240 L548 222 L486 154Z" fill="#f9fbff" stroke="#0b4f71" strokeWidth="2" />
      <path d="M578 116 L640 104 L686 138 L664 198 L596 190 L558 146Z" fill="#0f6b53" opacity="0.78" />
      <path d="M260 250 V176 C260 144 286 118 318 118 H374 C406 118 432 144 432 176 V250Z" fill="#e7f1ec" stroke="#0f6b53" strokeOpacity="0.3" />
      <rect x="300" y="178" width="92" height="72" fill="#ffffff" opacity="0.7" />
      <circle cx="190" cy="154" r="32" fill="#184f3f" />
      <path d="M156 220 C162 176 218 176 224 220Z" fill="#1d6b51" />
      <circle cx="262" cy="160" r="30" fill="#d88b2c" />
      <path d="M232 226 C238 184 290 184 298 226Z" fill="#1e6a91" />
      <circle cx="332" cy="160" r="31" fill="#263b4d" />
      <path d="M300 228 C308 184 358 184 368 228Z" fill="#123d31" />
      <rect x="182" y="202" width="126" height="78" rx="14" fill="#f2f6ef" stroke="#0f6b53" strokeOpacity="0.22" />
      <rect x="470" y="120" width="112" height="128" rx="14" fill="#ffffff" opacity="0.76" stroke="#0f6b53" strokeOpacity="0.18" />
      <path d="M512 210 C518 176 546 174 552 210Z" fill="#0f6b53" opacity="0.82" />
      <circle cx="532" cy="166" r="18" fill="#1d6b51" />
      <path d="M642 104 C666 88 694 96 710 120" fill="none" stroke="#0b4f71" strokeOpacity="0.42" strokeWidth="2" />
      <circle cx="640" cy="150" r="5" fill="#f59e0b" />
      <path d="M640 150 L604 176 L578 146" fill="none" stroke="#ffffff" strokeWidth="2" strokeOpacity="0.78" />
    </svg>
  );
}
