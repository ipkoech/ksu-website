import type { Metadata } from "next";
import Link from "next/link";
import { ResearchFilterForm, ResearchRecordRow } from "../../components/research-listing";
import {
  Badge,
  FilledBadge,
  PrimaryLink,
  ResearchSection,
  SecondaryLink,
  StatusMessage,
} from "../../components/research-ui";
import {
  compactText,
  formatDate,
  formatLabel,
  getPartners,
  getPartnersFiltered,
} from "../../lib/research-public-data";
import type { ResearchGenericRecord } from "@ksu/api-client";
import { getRecordSummary, getRecordTimelineLabel, getRecordTitle } from "../../lib/research-page-model";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Research Partners",
  description: "Research partners and collaboration networks at Kisii University.",
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
  const featuredPartner = partners.data.find((partner) => partner.is_featured);
  const rowPartners = featuredPartner ? partners.data.filter((partner) => partner.id !== featuredPartner.id) : partners.data;

  return (
    <main id="research-main" className="min-h-screen bg-white">
      <PartnersMasthead
        resultCount={partners.data.length}
        publishedCount={allPartners.data.length}
        typeCount={partnerTypes.length}
        levelCount={partnershipLevels.length}
      />

      <ResearchSection
        eyebrow="Collaboration Network"
        title="Research partners"
        body="Search first, then use the filter menu for partner type, active state, partnership level, status, and sort order."
        tone="white"
      >
        <PartnerFilters params={params} />
        {[partners.error, allPartners.error].filter(Boolean).map((error) => (
          <div key={error} className="mt-5">
            <StatusMessage tone="error">{error}</StatusMessage>
          </div>
        ))}

        {partners.data.length > 0 ? (
          <>
            {featuredPartner ? <div className="mt-6"><FeaturedPartner partner={featuredPartner} /></div> : null}
            <div className="mt-6 divide-y divide-slate-200 rounded-lg border border-slate-200 bg-white shadow-sm">
              {rowPartners.map((partner) => <PartnerRow key={partner.id} partner={partner} />)}
            </div>
          </>
        ) : (
          <div className="mt-7">
            <StatusMessage>No partners match the current filters.</StatusMessage>
          </div>
        )}
      </ResearchSection>
    </main>
  );
}

function PartnersMasthead({ resultCount, publishedCount, typeCount, levelCount }: { resultCount: number; publishedCount: number; typeCount: number; levelCount: number }) {
  const stats = [
    { label: "Partner results", value: resultCount },
    { label: "Published partners", value: publishedCount },
    { label: "Partner types", value: typeCount },
    { label: "Partnership levels", value: levelCount },
  ];

  return (
    <section className="border-b border-slate-200 bg-white px-4 py-6 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
      <div className="mx-auto grid max-w-[1680px] gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(320px,520px)] lg:items-end">
        <div>
          <nav className="mb-4 flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500" aria-label="Breadcrumb">
            <Link href="/" className="transition hover:text-primary">Home</Link>
            <span className="text-slate-300">/</span>
            <Link href="/innovations" className="transition hover:text-primary">Innovation & Partnerships</Link>
            <span className="text-slate-300">/</span>
            <span className="text-slate-900">Partners</span>
          </nav>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-secondary">Innovation & Partnerships</p>
          <h1 className="mt-3 max-w-5xl text-balance font-[family-name:var(--font-display)] text-3xl font-semibold leading-tight text-slate-950 sm:text-4xl">Academic, industry, community, government, and funder collaborators</h1>
          <p className="mt-3 max-w-4xl text-pretty text-sm leading-7 text-slate-700 sm:text-base">Browse published partner records by collaboration area, partnership level, country, status, and engagement window.</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <PrimaryLink href="/connect#partnership">Start partnership</PrimaryLink>
            <SecondaryLink href="/consultancies">View consultancies</SecondaryLink>
          </div>
        </div>
        <dl className="grid gap-2 sm:grid-cols-2">
          {stats.map((stat) => <div key={stat.label} className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2"><dt className="text-[11px] font-semibold uppercase text-slate-500">{stat.label}</dt><dd className="mt-1 text-lg font-semibold text-slate-950">{stat.value}</dd></div>)}
        </dl>
      </div>
    </section>
  );
}

function PartnerFilters({ params }: { params: PartnerSearchParams }) {
  return (
    <ResearchFilterForm
      action="/partners"
      resetHref="/partners"
      searchValue={params.q}
      searchPlaceholder="Partner name, collaboration area, country"
      selects={[
        { name: "type", label: "Type", value: params.type, options: partnerTypes },
        { name: "active", label: "Active state", value: params.active, options: activeStates },
        { name: "level", label: "Level", value: params.level, options: partnershipLevels },
        { name: "status", label: "Status", value: params.status, options: partnerStatuses },
      ]}
      sortValue={params.sort}
      sortOptions={sortOptions}
    />
  );
}

function FeaturedPartner({ partner }: { partner: ResearchGenericRecord }) {
  const dateRange = [formatDate(partner.partnership_start), formatDate(partner.partnership_end)]
    .filter(Boolean)
    .join(" - ");

  return (
    <Link
      href={partner.slug ? `/partners/${partner.slug}` : "/partners"}
      className="group grid gap-4 rounded-lg border border-primary/20 bg-primary/[0.03] p-4 shadow-sm transition hover:border-primary/40 lg:grid-cols-[minmax(0,1fr)_260px_auto] lg:items-center"
    >
      <div>
        <div className="flex flex-wrap gap-2">
          <Badge>{formatLabel(partner.partner_type ?? "partner")}</Badge>
          {partner.partnership_level ? <Badge>{formatLabel(partner.partnership_level)}</Badge> : null}
          <FilledBadge>Featured</FilledBadge>
        </div>
        <h2 className="mt-3 text-lg font-semibold leading-7 text-slate-950">{getRecordTitle(partner, "Research partner")}</h2>
        <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">{getRecordSummary(partner) || compactText(partner.collaboration_areas) || "Partner profile has not been published yet."}</p>
      </div>
      <dl className="grid gap-2 text-sm">
        <div className="rounded-md bg-white p-2.5"><dt className="text-xs font-semibold uppercase text-slate-500">Country</dt><dd className="mt-1 font-semibold text-slate-950">{compactText(partner.country) || "Not published"}</dd></div>
        <div className="rounded-md bg-white p-2.5"><dt className="text-xs font-semibold uppercase text-slate-500">Window</dt><dd className="mt-1 font-semibold text-slate-950">{dateRange || "Not published"}</dd></div>
      </dl>
      <span className="inline-flex min-h-10 items-center justify-center rounded-md border border-primary/20 px-3 text-sm font-semibold text-primary transition group-hover:bg-primary group-hover:text-white">Open partner</span>
    </Link>
  );
}

function PartnerRow({ partner }: { partner: ResearchGenericRecord }) {
  const dateRange = [formatDate(partner.partnership_start), formatDate(partner.partnership_end)].filter(Boolean).join(" - ");
  return (
    <ResearchRecordRow
      href={partner.slug ? `/partners/${partner.slug}` : "/partners"}
      title={getRecordTitle(partner, "Research partner")}
      description={getRecordSummary(partner) || compactText(partner.collaboration_areas) || "Partner profile has not been published yet."}
      badges={[partner.partner_type ?? "partner", partner.partnership_level, partner.status]}
      filledBadges={[partner.is_featured ? "Featured" : null]}
      facts={[
        { label: "Country", value: compactText(partner.country) },
        { label: "Window", value: dateRange },
        { label: "Updated", value: getRecordTimelineLabel(partner) },
      ]}
    />
  );
}

function getActiveFlags(value?: string) {
  if (value === "inactive") return { isActive: false };
  if (value === "featured") return { isActive: true, isFeatured: true };
  return { isActive: true };
}
