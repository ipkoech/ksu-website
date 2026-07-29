import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import type { ResearchGenericRecord } from "@ksu/api-client";
import { ArrowRight, Briefcase, Handshake, Lightbulb, Network, Sprout } from "lucide-react";
import { ProgramTableControls } from "../programs/program-table-controls";
import { Badge, FilledBadge, StatusMessage } from "../../components/research-ui";
import {
  compactText,
  formatDate,
  formatLabel,
  getPartners,
  getPartnersFiltered,
} from "../../lib/research-public-data";
import { getRecordSummary, getRecordTitle } from "../../lib/research-page-model";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Research Partners",
  description: "Research partners, collaboration pathways, case studies, and partner network records at Kisii University.",
};

type PartnerSearchParams = {
  q?: string;
  type?: string;
  level?: string;
  active?: string;
  status?: string;
  sort?: string;
};

const partnerTypes = ["academic", "industry", "government", "ngo", "foundation", "international", "community"];
const partnershipLevels = ["strategic", "implementing", "funding", "technical", "community"];
const partnerStatuses = ["active", "inactive", "pending", "expired"];
const activeStates = [
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
  { label: "Featured", value: "featured" },
];
const sortOptions = [
  { value: "display_order", label: "Featured order" },
  { value: "created_at", label: "Newest" },
  { value: "name", label: "Name A-Z" },
  { value: "partnership_start", label: "Start date" },
];

export default async function PartnersPage({
  searchParams,
}: {
  searchParams?: Promise<PartnerSearchParams>;
}) {
  const params = (await searchParams) ?? {};
  const sort = params.sort || "display_order";
  const order = sort === "name" ? "asc" : "desc";
  const activeFlags = getActiveFlags(params.active);
  const [partners, allPartners] = await Promise.all([
    getPartnersFiltered({
      search: params.q,
      partnerType: params.type,
      partnershipLevel: params.level,
      status: params.status || "active",
      sort,
      order,
      ...activeFlags,
    }),
    getPartners(),
  ]);
  const featuredPartner = partners.data.find((partner) => partner.is_featured) ?? partners.data[0];
  const directoryPartners = featuredPartner
    ? partners.data.filter((partner) => partner.id !== featuredPartner.id)
    : partners.data;

  return (
    <main id="research-main" className="min-h-screen bg-white text-foreground">
      <PartnerHero />
      <section className="bg-white px-4 py-5 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
        <div className="mx-auto grid max-w-[1680px] gap-5 lg:grid-cols-3">
          <PathwayCard
            href="/partners/how-to-partner"
            icon={<Handshake aria-hidden className="h-5 w-5" />}
            title="How to partner"
            body="Choose a collaboration path, prepare the right details, and start the conversation with the research office."
          />
          <PathwayCard
            href="/partners/stories"
            icon={<Lightbulb aria-hidden className="h-5 w-5" />}
            title="Case studies & testimonials"
            body="See what published partnerships have produced across projects, transfer, consultancies, and community impact."
          />
          <PathwayCard
            href="#partner-directory"
            icon={<Network aria-hidden className="h-5 w-5" />}
            title="Partner directory"
            body="Browse active academic, industry, government, community, funder, and implementation partners."
          />
        </div>
      </section>

      {allPartners.data.length > 0 ? <PartnerStrip partners={allPartners.data} /> : null}

      <section id="partner-directory" className="bg-[linear-gradient(180deg,hsl(var(--surface-subtle))_0%,#ffffff_55%)] px-4 py-6 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
        <div className="mx-auto grid max-w-[1680px] gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
          <div className="min-w-0">
            <div className="mb-4 grid gap-3 md:grid-cols-[280px_minmax(0,1fr)] md:items-end">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary">Partner Directory</p>
                <h2 className="mt-2 font-[family-name:var(--font-display)] text-2xl font-semibold text-foreground">Published partner records</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">Search and filter real partner records from the research backend.</p>
              </div>
              <PartnerFilters params={params} />
            </div>

            {[partners.error, allPartners.error].filter(Boolean).map((error) => (
              <div key={error} className="mb-4">
                <StatusMessage tone="error">{error}</StatusMessage>
              </div>
            ))}

            {partners.data.length > 0 ? (
              <div className="grid gap-4">
                {featuredPartner ? <FeaturedPartner partner={featuredPartner} /> : null}
                {directoryPartners.length > 0 ? (
                  <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                    {directoryPartners.map((partner) => (
                      <PartnerCard key={partner.id} partner={partner} />
                    ))}
                  </div>
                ) : null}
              </div>
            ) : (
              <StatusMessage>No partner records match the current filters.</StatusMessage>
            )}
          </div>

          <PartnerSidebar />
        </div>
      </section>
    </main>
  );
}

function PartnerHero() {
  return (
    <section className="relative isolate overflow-hidden bg-[hsl(var(--brand-overlay))] px-4 py-7 text-white sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
      <div aria-hidden className="absolute inset-0 bg-[linear-gradient(115deg,hsl(var(--brand-overlay))_0%,hsl(var(--primary)/.82)_46%,hsl(var(--primary)/.62)_100%)]" />
      <div aria-hidden className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:42px_42px] opacity-60" />
      <svg aria-hidden viewBox="0 0 900 260" className="absolute right-0 top-1/2 hidden h-full w-[58%] -translate-y-1/2 opacity-75 lg:block" fill="none">
        <g stroke="hsl(var(--secondary))" strokeOpacity="0.42" strokeWidth="1.5">
          <circle cx="132" cy="130" r="58" />
          <path d="M132 178V82M132 130c-28-8-45-28-50-59 34 2 54 20 50 59Zm0-5c25-12 43-33 49-63-33 4-53 24-49 63Z" />
          <rect x="318" y="72" width="118" height="136" rx="14" />
          <path d="M346 106h62M346 136h44M346 166h72M456 116h92M502 116v70M472 186h62" />
          <path d="M660 104c26-23 50-23 74 0 22-18 44-15 64 10M668 140l48 30 51-45" />
        </g>
        <g stroke="#10B981" strokeOpacity="0.38">
          <path d="M190 130h112M438 130h104M590 130h54M780 120h86" />
          {[190, 302, 438, 542, 590, 644, 780, 866].map((x, index) => (
            <circle key={x} cx={x} cy={index % 2 ? 112 : 130} r="7" fill="hsl(var(--brand-overlay))" stroke="hsl(var(--secondary))" />
          ))}
        </g>
      </svg>
      <div aria-hidden className="absolute inset-0 bg-gradient-to-r from-[hsl(var(--brand-overlay))]/95 via-[hsl(var(--brand-overlay))]/70 to-[hsl(var(--brand-overlay))]/20" />
      <div className="relative mx-auto flex min-h-[230px] max-w-[1680px] items-center">
        <div className="max-w-3xl">
          <p className="inline-flex rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-white">Innovation & Partnerships</p>
          <h1 className="mt-4 font-[family-name:var(--font-display)] text-4xl font-semibold leading-none text-white sm:text-5xl">Research Partners</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-white/90">A connected network of institutions, industry, funders, communities, and public agencies helping university research move into use.</p>
          <div className="mt-5 flex flex-wrap gap-3">
            <HeroButton href="/partners/how-to-partner" primary>How to partner</HeroButton>
            <HeroButton href="/partners/stories">View case studies</HeroButton>
          </div>
        </div>
      </div>
    </section>
  );
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

function PathwayCard({ href, icon, title, body }: { href: string; icon: ReactNode; title: string; body: string }) {
  return (
    <Link href={href} className="group rounded-lg border border-border bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-md">
      <span className="grid h-11 w-11 place-items-center rounded-md bg-primary text-white">{icon}</span>
      <h2 className="mt-4 text-lg font-semibold text-primary">{title}</h2>
      <p className="mt-2 min-h-[48px] text-sm leading-6 text-muted-foreground">{body}</p>
      <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary">
        Open
        <ArrowRight aria-hidden className="h-4 w-4 transition group-hover:translate-x-1" />
      </span>
    </Link>
  );
}

function PartnerStrip({ partners }: { partners: ResearchGenericRecord[] }) {
  return (
    <section className="border-y border-border bg-surface-subtle px-4 py-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
      <div className="mx-auto flex max-w-[1680px] gap-3 overflow-x-auto">
        {partners.slice(0, 18).map((partner) => (
          <Link key={partner.id} href={partner.slug ? `/partners/${partner.slug}` : "/partners"} className="flex min-w-[210px] items-center gap-3 rounded-md border border-border bg-white px-3 py-2 shadow-sm">
            <PartnerMark partner={partner} />
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold text-primary">{getRecordTitle(partner, "Partner")}</span>
              <span className="block truncate text-xs text-muted-foreground">{formatLabel(partner.partner_type)}</span>
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

function PartnerFilters({ params }: { params: PartnerSearchParams }) {
  return (
    <ProgramTableControls
      action="/partners"
      resetHref="/partners"
      searchValue={params.q}
      searchPlaceholder="Search partners, countries, collaboration areas..."
      filterTitle="Filter partners"
      sortTitle="Sort partners"
      filterSelects={[
        { name: "type", label: "Type", value: params.type, options: partnerTypes },
        { name: "level", label: "Level", value: params.level, options: partnershipLevels },
        { name: "active", label: "Active state", value: params.active, options: activeStates },
        { name: "status", label: "Status", value: params.status, options: partnerStatuses },
      ]}
      sortValue={params.sort}
      sortOptions={sortOptions}
    />
  );
}

function FeaturedPartner({ partner }: { partner: ResearchGenericRecord }) {
  return (
    <Link href={partner.slug ? `/partners/${partner.slug}` : "/partners"} className="group grid gap-4 rounded-lg border border-primary/25 bg-white p-4 shadow-sm transition hover:border-primary/50 md:grid-cols-[76px_minmax(0,1fr)_220px_auto] md:items-center">
      <PartnerMark partner={partner} large />
      <div className="min-w-0">
        <div className="flex flex-wrap gap-2">
          <FilledBadge>Featured partner</FilledBadge>
          {partner.partner_type ? <Badge>{formatLabel(partner.partner_type)}</Badge> : null}
          {partner.partnership_level ? <Badge>{formatLabel(partner.partnership_level)}</Badge> : null}
        </div>
        <h3 className="mt-3 text-xl font-semibold leading-7 text-primary">{getRecordTitle(partner, "Research partner")}</h3>
        <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">{partnerSummary(partner)}</p>
      </div>
      <PartnerFacts partner={partner} />
      <span className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-white shadow-sm transition group-hover:bg-primary/90">
        Open partner
        <ArrowRight aria-hidden className="h-4 w-4" />
      </span>
    </Link>
  );
}

function PartnerCard({ partner }: { partner: ResearchGenericRecord }) {
  return (
    <Link href={partner.slug ? `/partners/${partner.slug}` : "/partners"} className="group rounded-lg border border-border bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-md">
      <div className="flex items-start gap-3">
        <PartnerMark partner={partner} />
        <div className="min-w-0 flex-1">
          <h3 className="line-clamp-2 text-base font-semibold leading-6 text-primary">{getRecordTitle(partner, "Research partner")}</h3>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {partner.partner_type ? <Badge>{formatLabel(partner.partner_type)}</Badge> : null}
            {partner.partnership_level ? <Badge>{formatLabel(partner.partnership_level)}</Badge> : null}
          </div>
        </div>
      </div>
      <p className="mt-3 line-clamp-3 min-h-[60px] text-sm leading-5 text-muted-foreground">{partnerSummary(partner)}</p>
      <div className="mt-4 flex items-center justify-between gap-3 border-t border-border pt-3 text-xs text-muted-foreground">
        <span>{compactText(partner.country) || "Country not listed"}</span>
        <span className="inline-flex items-center gap-1 font-semibold text-primary">
          Details
          <ArrowRight aria-hidden className="h-3.5 w-3.5 transition group-hover:translate-x-1" />
        </span>
      </div>
    </Link>
  );
}

function PartnerMark({ partner, large = false }: { partner: ResearchGenericRecord; large?: boolean }) {
  const logo = compactText(partner.logo_url);
  const title = getRecordTitle(partner, "Partner");
  if (logo) {
    return (
      <span className={`${large ? "h-16 w-16" : "h-11 w-11"} relative shrink-0 overflow-hidden rounded-md border border-border bg-white`}>
        <Image src={logo} alt={`${title} logo`} fill sizes={large ? "64px" : "44px"} className="object-contain p-1.5" />
      </span>
    );
  }
  return (
    <span className={`${large ? "h-16 w-16 text-lg" : "h-11 w-11 text-sm"} grid shrink-0 place-items-center rounded-md bg-primary/10 font-semibold text-primary`}>
      {title.slice(0, 2).toUpperCase()}
    </span>
  );
}

function PartnerFacts({ partner }: { partner: ResearchGenericRecord }) {
  const dateRange = [formatDate(partner.partnership_start), formatDate(partner.partnership_end)].filter(Boolean).join(" - ");
  const facts = [
    { label: "Country", value: compactText(partner.country) },
    { label: "Window", value: dateRange },
  ].filter((fact) => fact.value);
  if (!facts.length) return null;
  return (
    <dl className="grid gap-2 text-sm">
      {facts.map((fact) => (
        <div key={fact.label} className="rounded-md bg-surface-subtle p-2.5">
          <dt className="text-[11px] font-semibold uppercase text-muted-foreground">{fact.label}</dt>
          <dd className="mt-1 line-clamp-2 font-semibold text-foreground">{fact.value}</dd>
        </div>
      ))}
    </dl>
  );
}

function PartnerSidebar() {
  const links = [
    { href: "/projects", title: "Projects", body: "Collaborate on active research workstreams.", icon: <Sprout aria-hidden className="h-5 w-5" /> },
    { href: "/technology-transfer", title: "Technology transfer", body: "Move protected research and inventions into use.", icon: <Lightbulb aria-hidden className="h-5 w-5" /> },
    { href: "/startups", title: "Startups & incubation", body: "Support venture validation, mentorship, and market access.", icon: <Briefcase aria-hidden className="h-5 w-5" /> },
    { href: "/consultancies", title: "Consultancies", body: "Engage research expertise for applied work.", icon: <Handshake aria-hidden className="h-5 w-5" /> },
  ];
  return (
    <aside className="grid gap-4 xl:sticky xl:top-24">
      <section className="rounded-lg border border-border bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-primary">Partnership pathways</h2>
        <div className="mt-3 divide-y divide-slate-200">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="group grid grid-cols-[34px_minmax(0,1fr)_auto] gap-3 py-3">
              <span className="grid h-9 w-9 place-items-center rounded-md bg-primary/10 text-primary">{link.icon}</span>
              <span>
                <span className="block text-sm font-semibold text-primary">{link.title}</span>
                <span className="mt-0.5 block text-xs leading-5 text-muted-foreground">{link.body}</span>
              </span>
              <ArrowRight aria-hidden className="mt-2 h-4 w-4 text-muted-foreground/70 transition group-hover:translate-x-1 group-hover:text-primary" />
            </Link>
          ))}
        </div>
      </section>
      <section className="rounded-lg border border-primary/20 bg-accent/70 p-5 shadow-sm">
        <h2 className="font-semibold text-primary">Start a partnership</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">Use the partner guide to identify the right route before contacting the research office.</p>
        <Link href="/partners/how-to-partner" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary">
          View guide
          <ArrowRight aria-hidden className="h-4 w-4" />
        </Link>
      </section>
    </aside>
  );
}

function partnerSummary(partner: ResearchGenericRecord) {
  return (
    getRecordSummary(partner) ||
    compactText(partner.collaboration_areas) ||
    compactText(partner.about) ||
    compactText(partner.key_achievements) ||
    "Partner profile details are available on the partner page."
  );
}

function getActiveFlags(value?: string) {
  if (value === "inactive") return { isActive: false };
  if (value === "featured") return { isActive: true, isFeatured: true };
  return { isActive: true };
}
