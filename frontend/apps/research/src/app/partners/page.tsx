import { ResearchPageHero } from "../../components/research-page-hero";
import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import {
  ArrowRight,
  Briefcase,
  Handshake,
  Lightbulb,
  Network,
  Sprout,
} from "lucide-react";
import { ProgramTableControls } from "../programs/program-table-controls";
import { StatusMessage } from "../../components/research-ui";
import { PartnersDisplay } from "../../components/research-record-displays";
import {
  getPartners,
  getPartnersFiltered,
} from "../../lib/research-public-data";
import { getListPageSize } from "../../lib/research-page-model";
import { toResearchRecordDisplayDto } from "../../lib/research-formatters";
import { pageFromSearchParams } from "@ksu/ui/components";
import { ResearchListPagination } from "../../components/research-list-pagination";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Partners",
  description:
    "Research partners, collaboration pathways, case studies, and partner network records at Kisii University.",
};

type PartnerSearchParams = {
  q?: string;
  type?: string;
  level?: string;
  active?: string;
  status?: string;
  sort?: string;
  page?: string;
};

const partnerTypes = [
  "academic",
  "industry",
  "government",
  "ngo",
  "foundation",
  "international",
  "community",
];
const partnershipLevels = [
  "strategic",
  "implementing",
  "funding",
  "technical",
  "community",
];
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
  const page = pageFromSearchParams(params);
  const perPage = getListPageSize(12);
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
      page,
      perPage,
      ...activeFlags,
    }),
    getPartners(),
  ]);
  const featuredPartner =
    partners.data.find((partner) => partner.is_featured) ?? partners.data[0];
  const directoryPartners = featuredPartner
    ? partners.data.filter((partner) => partner.id !== featuredPartner.id)
    : partners.data;
  const totalPages = Math.ceil(partners.total / partners.perPage);
  const allPartnerDisplayRecords = allPartners.data.map((partner) =>
    toResearchRecordDisplayDto(partner),
  );
  const featuredPartnerDisplay = featuredPartner
    ? toResearchRecordDisplayDto(featuredPartner)
    : undefined;
  const directoryPartnerDisplayRecords = directoryPartners.map((partner) =>
    toResearchRecordDisplayDto(partner),
  );

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

      {allPartnerDisplayRecords.length > 0 ? (
        <PartnersDisplay
          allPartners={allPartnerDisplayRecords}
          directoryPartners={[]}
        />
      ) : null}

      <section
        id="partner-directory"
        className="bg-[linear-gradient(180deg,hsl(var(--surface-subtle))_0%,#ffffff_55%)] px-4 py-6 sm:px-6 lg:px-8 xl:px-10 2xl:px-12"
      >
        <div className="mx-auto grid max-w-[1680px] gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
          <div className="min-w-0">
            <div className="mb-4 grid gap-3 md:grid-cols-[280px_minmax(0,1fr)] md:items-end">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary">
                  Partner Directory
                </p>
                <h2 className="mt-2 font-display text-2xl font-semibold text-foreground">
                  Published partner records
                </h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Search and filter real partner records from the research
                  backend.
                </p>
              </div>
              <PartnerFilters params={params} />
            </div>

            {[partners.error, allPartners.error]
              .filter(Boolean)
              .map((error) => (
                <div key={error} className="mb-4">
                  <StatusMessage tone="error">{error}</StatusMessage>
                </div>
              ))}

            {partners.data.length > 0 ? (
              <div className="grid gap-4">
                <PartnersDisplay
                  allPartners={[]}
                  featuredPartner={featuredPartnerDisplay}
                  directoryPartners={directoryPartnerDisplayRecords}
                />
                <ResearchListPagination
                  page={page}
                  totalPages={totalPages}
                  total={partners.total}
                  perPage={partners.perPage}
                  path="/partners"
                  params={params}
                  className="mt-6"
                />
              </div>
            ) : (
              <StatusMessage>
                No partner records match the current filters.
              </StatusMessage>
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
    <ResearchPageHero
      title="Partners"
      eyebrow="Innovation"
      description="Institutions, industry, funders, communities, and public agencies helping university research move into use."
      imageSrc="/images/research/headers/innovation-week-8263.jpg"
      imageAlt="Kisii University Innovation Week"
      breadcrumbs={[{ label: "Home", href: "/" }, { label: "Partners" }]}
      actions={[
        { label: "How to partner", href: "/partners/how-to-partner" },
        { label: "View case studies", href: "/partners/stories" },
      ]}
    ></ResearchPageHero>
  );
}

function PathwayCard({
  href,
  icon,
  title,
  body,
}: {
  href: string;
  icon: ReactNode;
  title: string;
  body: string;
}) {
  return (
    <Link
      href={href}
      className="group rounded-lg border border-border bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-md"
    >
      <span className="grid h-11 w-11 place-items-center rounded-md bg-primary text-white">
        {icon}
      </span>
      <h2 className="mt-4 text-lg font-semibold text-primary">{title}</h2>
      <p className="mt-2 min-h-[48px] text-sm leading-6 text-muted-foreground">
        {body}
      </p>
      <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary">
        Open
        <ArrowRight
          aria-hidden
          className="h-4 w-4 transition group-hover:translate-x-1"
        />
      </span>
    </Link>
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
        {
          name: "type",
          label: "Type",
          value: params.type,
          options: partnerTypes,
        },
        {
          name: "level",
          label: "Level",
          value: params.level,
          options: partnershipLevels,
        },
        {
          name: "active",
          label: "Active state",
          value: params.active,
          options: activeStates,
        },
        {
          name: "status",
          label: "Status",
          value: params.status,
          options: partnerStatuses,
        },
      ]}
      sortValue={params.sort}
      sortOptions={sortOptions}
    />
  );
}

function PartnerSidebar() {
  const links = [
    {
      href: "/projects",
      title: "Projects",
      body: "Collaborate on active research workstreams.",
      icon: <Sprout aria-hidden className="h-5 w-5" />,
    },
    {
      href: "/technology-transfer",
      title: "Technology transfer",
      body: "Move protected research and inventions into use.",
      icon: <Lightbulb aria-hidden className="h-5 w-5" />,
    },
    {
      href: "/startups",
      title: "Startups & incubation",
      body: "Support venture validation, mentorship, and market access.",
      icon: <Briefcase aria-hidden className="h-5 w-5" />,
    },
    {
      href: "/consultancies",
      title: "Consultancies",
      body: "Engage research expertise for applied work.",
      icon: <Handshake aria-hidden className="h-5 w-5" />,
    },
  ];
  return (
    <aside className="grid gap-4 xl:sticky xl:top-24">
      <section className="rounded-lg border border-border bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-primary">
          Partnership pathways
        </h2>
        <div className="mt-3 divide-y divide-border">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="group grid grid-cols-[34px_minmax(0,1fr)_auto] gap-3 py-3"
            >
              <span className="grid h-9 w-9 place-items-center rounded-md bg-primary/10 text-primary">
                {link.icon}
              </span>
              <span>
                <span className="block text-sm font-semibold text-primary">
                  {link.title}
                </span>
                <span className="mt-0.5 block text-xs leading-5 text-muted-foreground">
                  {link.body}
                </span>
              </span>
              <ArrowRight
                aria-hidden
                className="mt-2 h-4 w-4 text-muted-foreground/70 transition group-hover:translate-x-1 group-hover:text-primary"
              />
            </Link>
          ))}
        </div>
      </section>
      <section className="rounded-lg border border-primary/20 bg-accent/70 p-5 shadow-sm">
        <h2 className="font-semibold text-primary">Start a partnership</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Use the partner guide to identify the right route before contacting
          the research office.
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
  );
}

function getActiveFlags(value?: string) {
  if (value === "inactive") return { isActive: false };
  if (value === "featured") return { isActive: true, isFeatured: true };
  return { isActive: true };
}
