import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import type { ResearchGenericRecord } from "@ksu/api-client";
import { ArrowRight, Briefcase, Handshake, Lightbulb, MessageSquareQuote, Sprout, Target, Trophy } from "lucide-react";
import { Badge, StatusMessage } from "../../../components/research-ui";
import {
  compactText,
  formatDate,
  formatLabel,
  getPartnerRelationshipBundle,
  getPartners,
} from "../../../lib/research-public-data";
import { getRecordSummary, getRecordTitle } from "../../../lib/research-page-model";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Partner Case Studies & Testimonials",
  description: "Backend-backed partner case studies, testimonials, and linked work from Kisii University research collaborations.",
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
  const items = bundles.flatMap(({ partner, bundle }) => buildPartnerItems(partner, bundle));
  const filteredItems = params.type ? items.filter((item) => item.type === params.type) : items;
  const featured = filteredItems[0];
  const rest = featured ? filteredItems.slice(1) : filteredItems;
  const testimonials = partners.data
    .map((partner) => ({
      partner,
      quote: compactText(partner.key_achievements) || compactText(partner.about),
    }))
    .filter((item) => item.quote)
    .slice(0, 6);
  const errors = partners.error ? [partners.error] : [];

  return (
    <main id="research-main" className="min-h-screen bg-white text-foreground">
      <section className="relative isolate overflow-hidden bg-[hsl(var(--brand-overlay))] px-4 py-7 text-white sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
        <div aria-hidden className="absolute inset-0 bg-[linear-gradient(115deg,hsl(var(--brand-overlay))_0%,hsl(var(--primary)/.82)_48%,hsl(var(--primary)/.62)_100%)]" />
        <div aria-hidden className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:42px_42px] opacity-60" />
        <svg aria-hidden viewBox="0 0 900 260" className="absolute right-0 top-1/2 hidden h-full w-[58%] -translate-y-1/2 opacity-70 lg:block" fill="none">
          <g stroke="hsl(var(--secondary))" strokeOpacity="0.44" strokeWidth="1.5">
            <rect x="92" y="74" width="156" height="116" rx="14" />
            <path d="M122 112h92M122 144h58M122 170h84" />
            <rect x="374" y="58" width="150" height="150" rx="16" />
            <path d="M406 104h86M406 136h54M406 168h70M560 104l40 28-40 28" />
            <path d="M706 114c30-27 58-27 86 0 25-20 49-16 72 13M714 151l60 36 62-56" />
          </g>
          <g stroke="#10B981" strokeOpacity="0.38">
            <path d="M250 132h104M526 132h84M656 132h38" />
            {[250, 354, 526, 610, 656, 694].map((x, index) => (
              <circle key={x} cx={x} cy={index % 2 ? 112 : 132} r="7" fill="hsl(var(--brand-overlay))" stroke="hsl(var(--secondary))" />
            ))}
          </g>
        </svg>
        <div aria-hidden className="absolute inset-0 bg-gradient-to-r from-[hsl(var(--brand-overlay))]/95 via-[hsl(var(--brand-overlay))]/70 to-[hsl(var(--brand-overlay))]/20" />
        <div className="relative mx-auto flex min-h-[230px] max-w-[1680px] items-center">
          <div className="max-w-3xl">
            <p className="inline-flex rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-white">Partner Evidence</p>
            <h1 className="mt-4 font-[family-name:var(--app-font-display)] text-4xl font-semibold leading-none text-white sm:text-5xl">Case Studies & Testimonials</h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-white/90">Published partner-linked work across projects, consultancies, innovation pathways, technology transfer, and impact records.</p>
            <div className="mt-5 flex flex-wrap gap-3">
              <HeroButton href="#case-studies" primary>Explore stories</HeroButton>
              <HeroButton href="/partners/how-to-partner">Become a partner</HeroButton>
            </div>
          </div>
        </div>
      </section>

      <section id="case-studies" className="px-4 py-6 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
        <div className="mx-auto grid max-w-[1680px] gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className="min-w-0">
            <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary">Published evidence</p>
                <h2 className="mt-2 font-[family-name:var(--app-font-display)] text-2xl font-semibold text-foreground">What partnerships have produced</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {typeTabs.map((tab) => (
                  <Link
                    key={tab.label}
                    href={tab.value ? `/partners/stories?type=${tab.value}` : "/partners/stories"}
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
              <div className="grid gap-4">
                <StoryCard item={featured} featured />
                {rest.length > 0 ? (
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {rest.map((item) => (
                      <StoryCard key={`${item.type}-${item.id}-${item.partnerName}`} item={item} />
                    ))}
                  </div>
                ) : null}
              </div>
            ) : (
              <StatusMessage>No partner-linked records are available for this view.</StatusMessage>
            )}
          </div>

          <aside className="grid gap-4 xl:sticky xl:top-24">
            <section className="rounded-lg border border-border bg-white p-5 shadow-sm">
              <h2 className="text-lg font-semibold text-primary">Impact themes</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {Array.from(new Set(items.flatMap((item) => item.badges).filter(Boolean))).slice(0, 12).map((badge) => (
                  <span key={badge} className="rounded-full border border-border bg-surface-subtle px-3 py-1 text-xs font-semibold text-muted-foreground">{formatLabel(badge)}</span>
                ))}
              </div>
            </section>
            <section className="rounded-lg border border-primary/20 bg-accent/70 p-5 shadow-sm">
              <Handshake aria-hidden className="h-7 w-7 text-primary" />
              <h2 className="mt-3 font-semibold text-primary">Create the next case study</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">Start with the partnership guide, then connect with the research office.</p>
              <Link href="/partners/how-to-partner" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary">
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
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary">Testimonials</p>
              <h2 className="mt-2 font-[family-name:var(--app-font-display)] text-2xl font-semibold text-foreground">Partner profile highlights</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {testimonials.map(({ partner, quote }) => (
                <Link key={partner.id} href={partner.slug ? `/partners/${partner.slug}` : "/partners"} className="rounded-lg border border-border bg-white p-5 shadow-sm transition hover:border-primary/35 hover:shadow-md">
                  <MessageSquareQuote aria-hidden className="h-6 w-6 text-primary" />
                  <p className="mt-3 line-clamp-4 text-sm leading-6 text-muted-foreground">{quote}</p>
                  <p className="mt-4 text-sm font-semibold text-primary">{getRecordTitle(partner, "Partner")}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </main>
  );
}

function buildPartnerItems(partner: ResearchGenericRecord, bundle: Awaited<ReturnType<typeof getPartnerRelationshipBundle>>) {
  const partnerName = getRecordTitle(partner, "Partner");
  const partnerHref = partner.slug ? `/partners/${partner.slug}` : "/partners";
  const rows: PartnerStoryItem[] = [];
  const push = (type: string, typeLabel: string, hrefBase: string, records: ResearchGenericRecord[], badgeFields: string[] = [], dateField?: string) => {
    for (const record of records.slice(0, 8)) {
      rows.push({
        id: String(record.id ?? `${type}-${rows.length}`),
        type,
        typeLabel,
        title: getRecordTitle(record, typeLabel),
        summary: getRecordSummary(record) || compactText(record.collaboration_areas) || compactText(record.public_benefit) || compactText(record.outcomes) || compactText(record.impact),
        href: recordHref(hrefBase, record),
        partnerName,
        partnerHref,
        date: dateField ? formatDate(record[dateField]) : undefined,
        badges: badgeFields.map((field) => compactText(record[field])).filter(Boolean),
      });
    }
  };

  push("impact", "Impact story", "/community-impact", bundle.impactStories.data, ["story_type", "category"], "story_date");
  push("projects", "Project", "/projects", bundle.projects.data, ["project_type", "status"], "start_date");
  push("consultancies", "Consultancy", "/consultancies", bundle.consultancies.data, ["consultancy_type", "status"], "start_date");
  push("startups", "Startup", "/startups", bundle.startups.data, ["venture_stage", "sector"], "created_at");
  push("transfer", "Technology transfer", "/technology-transfer", bundle.technologyTransferCases.data, ["case_type", "transfer_status"], "agreement_date");
  push("sustainability", "Sustainability", "/sustainability", bundle.sustainability.data, ["initiative_type", "status"], "start_date");
  push("competitions", "Competition", "/competitions", bundle.competitionEntries.data, ["entry_type", "entry_status"], "event_date");
  push("incubation", "Incubation", "/incubation", bundle.incubationRecords.data, ["incubation_type", "stage"], "start_date");

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
  return recordDetailRoutes.has(hrefBase) && record.slug ? `${hrefBase}/${record.slug}` : hrefBase;
}

function StoryCard({ item, featured = false }: { item: PartnerStoryItem; featured?: boolean }) {
  const Icon = iconForType(item.type);
  return (
    <Link href={item.href} className={`group rounded-lg border border-border bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-md ${featured ? "lg:grid lg:grid-cols-[minmax(0,1fr)_280px] lg:items-center" : ""}`}>
      <div>
        <div className="flex flex-wrap gap-2">
          <Badge>{item.typeLabel}</Badge>
          {item.badges.slice(0, 2).map((badge) => <Badge key={badge}>{formatLabel(badge)}</Badge>)}
        </div>
        <h3 className={`${featured ? "text-2xl" : "text-lg"} mt-3 font-semibold leading-tight text-primary`}>{item.title}</h3>
        {item.summary ? <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted-foreground">{item.summary}</p> : null}
      </div>
      <div className={`${featured ? "mt-5 border-t border-border pt-4 lg:mt-0 lg:border-l lg:border-t-0 lg:pl-5 lg:pt-0" : "mt-4 border-t border-border pt-3"} flex items-center justify-between gap-4`}>
        <span>
          <span className="block text-xs font-semibold uppercase text-muted-foreground">Partner</span>
          <span className="mt-1 block text-sm font-semibold text-foreground">{item.partnerName}</span>
          {item.date ? <span className="mt-1 block text-xs text-muted-foreground">{item.date}</span> : null}
        </span>
        <span className="grid h-11 w-11 place-items-center rounded-md bg-primary/10 text-primary">
          <Icon aria-hidden className="h-5 w-5" />
        </span>
      </div>
    </Link>
  );
}

function iconForType(type: string) {
  if (type === "projects") return Sprout;
  if (type === "consultancies") return Briefcase;
  if (type === "startups") return Target;
  if (type === "transfer") return Lightbulb;
  if (type === "sustainability") return Handshake;
  if (type === "competitions") return Trophy;
  return MessageSquareQuote;
}

function HeroButton({ href, primary = false, children }: { href: string; primary?: boolean; children: ReactNode }) {
  return (
    <Link
      href={href}
      className={
        primary
          ? "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-primary px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90"
          : "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-white/40 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15"
      }
    >
      {children}
      <ArrowRight aria-hidden className="h-4 w-4" />
    </Link>
  );
}
