import type { Metadata } from "next";
import Link from "next/link";
import { Banknote, Handshake, Lightbulb, Network } from "lucide-react";
import { ResearchClusterHero } from "../../components/research-cluster";
import {
  Badge,
  FilledBadge,
  IconCard,
  ResearchSection,
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

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Research Partners",
  description: "Research partners and collaboration networks at Kisii University.",
};

type PartnerSearchParams = {
  q?: string;
  type?: string;
  level?: string;
  status?: string;
  sort?: string;
};

const partnerTypes = ["academic", "industry", "government", "ngo", "foundation", "international", "community"];
const partnershipLevels = ["strategic", "implementing", "funding", "technical", "community"];
const partnerStatuses = ["active", "inactive", "pending", "expired"];

const innovationLinks = [
  { label: "Innovations", href: "/innovations", description: "Tools, prototypes, software, and translated research.", icon: Lightbulb },
  { label: "Partners", href: "/partners", description: "Partner profiles, sponsorships, and collaboration routes.", icon: Handshake },
  { label: "Consultancies", href: "/consultancies", description: "Applied expert services and client engagements.", icon: Network },
  { label: "Endowments", href: "/endowments", description: "Permanent funding initiatives and named funds.", icon: Banknote },
];

export default async function PartnersPage({
  searchParams,
}: {
  searchParams?: Promise<PartnerSearchParams>;
}) {
  const params = (await searchParams) ?? {};
  const [partners, allPartners] = await Promise.all([
    getPartnersFiltered({
      search: params.q,
      partnerType: params.type,
      partnershipLevel: params.level,
      status: params.status || "active",
      sort: params.sort || "display_order",
      order: params.sort === "name" ? "asc" : "desc",
    }),
    getPartners(),
  ]);

  return (
    <main id="research-main" className="min-h-screen bg-white">
      <ResearchClusterHero
        eyebrow="Innovation & Partnerships"
        title="Academic, industry, community, government, and funder collaborations."
        body="See who partners with Kisii University, what they collaborate on, and where partnership outputs are published."
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Innovation & Partnerships", href: "/innovations" },
          { label: "Partners" },
        ]}
        imageSrc="/images/research/innovation-partnerships.png"
        imageAlt="Research partnership network across university, community, industry, and funders"
        links={innovationLinks}
        primaryAction={{ label: "Start partnership", href: "/connect#partnership" }}
        stats={[
          { label: "Partner results", value: partners.data.length },
          { label: "Published partners", value: allPartners.data.length },
          { label: "Partner types", value: partnerTypes.length },
          { label: "Partnership levels", value: partnershipLevels.length },
        ]}
      />

      <ResearchSection
        eyebrow="Collaboration Network"
        title="Research partners"
        body="Partner profiles are loaded from the Research Partners endpoint with server-side filters for type, level, and status."
        tone="white"
      >
        <PartnerFilters params={params} />
        {[partners.error, allPartners.error].filter(Boolean).map((error) => (
          <div key={error} className="mt-5">
            <StatusMessage tone="error">{error}</StatusMessage>
          </div>
        ))}

        {partners.data.length > 0 ? (
          <div className="mt-7 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {partners.data.map((partner) => (
              <PartnerCard key={partner.id} partner={partner} />
            ))}
          </div>
        ) : (
          <div className="mt-7">
            <StatusMessage>No partners match the current filters.</StatusMessage>
          </div>
        )}
      </ResearchSection>

      <ResearchSection
        eyebrow="How To Partner"
        title="Ways to work with Kisii University"
        body="Partnership guidance is organized around research collaboration, talent pipelines, and philanthropic support."
      >
        <div id="how-to-partner" className="grid gap-5 md:grid-cols-3">
          <IconCard
            icon="flask"
            title="Research partnerships"
            body="Define a challenge, identify experts or centers, agree scope and data terms, then launch joint work."
            href="/connect#partnership"
            action="Start inquiry"
          />
          <IconCard
            icon="users"
            title="Talent partnerships"
            body="Build student projects, internships, mentorship, training, and graduate talent pipelines."
            href="/capacity"
            action="View capacity"
          />
          <IconCard
            icon="award"
            title="Philanthropic partnerships"
            body="Support facilities, scholarships, innovation funds, community work, and endowed programmes."
            href="/endowments"
            action="View funds"
          />
        </div>
      </ResearchSection>
    </main>
  );
}

function PartnerFilters({ params }: { params: PartnerSearchParams }) {
  return (
    <form className="rounded-lg border border-slate-200 bg-slate-50 p-4" action="/partners">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
        <label className="xl:col-span-2">
          <span className="text-xs font-semibold uppercase text-slate-500">Search</span>
          <input
            name="q"
            defaultValue={params.q ?? ""}
            placeholder="Partner name, collaboration area, country"
            className="mt-2 h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-primary"
          />
        </label>
        <SelectField name="type" label="Type" value={params.type} options={partnerTypes} />
        <SelectField name="level" label="Level" value={params.level} options={partnershipLevels} />
        <SelectField name="status" label="Status" value={params.status} options={partnerStatuses} />
        <label>
          <span className="text-xs font-semibold uppercase text-slate-500">Sort</span>
          <select
            name="sort"
            defaultValue={params.sort ?? "display_order"}
            className="mt-2 h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-primary"
          >
            <option value="display_order">Featured order</option>
            <option value="created_at">Newest</option>
            <option value="name">Name</option>
            <option value="partnership_start">Start date</option>
          </select>
        </label>
        <div className="flex items-end gap-2 md:col-span-2 xl:col-span-6">
          <button className="inline-flex h-11 items-center justify-center rounded-full bg-primary px-5 text-sm font-semibold text-white transition hover:bg-primary/90">
            Apply filters
          </button>
          <Link
            href="/partners"
            className="inline-flex h-11 items-center justify-center rounded-full border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:border-primary/40 hover:text-primary"
          >
            Reset
          </Link>
        </div>
      </div>
    </form>
  );
}

function SelectField({
  name,
  label,
  value,
  options,
}: {
  name: string;
  label: string;
  value?: string;
  options: string[];
}) {
  return (
    <label>
      <span className="text-xs font-semibold uppercase text-slate-500">{label}</span>
      <select
        name={name}
        defaultValue={value ?? ""}
        className="mt-2 h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-primary"
      >
        <option value="">All {label.toLowerCase()}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {formatLabel(option)}
          </option>
        ))}
      </select>
    </label>
  );
}

function PartnerCard({ partner }: { partner: ResearchGenericRecord }) {
  const dateRange = [formatDate(partner.partnership_start), formatDate(partner.partnership_end)]
    .filter(Boolean)
    .join(" - ");

  return (
    <Link
      href={partner.slug ? `/partners/${partner.slug}` : "/partners"}
      className="block rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:border-primary/30 hover:shadow-[0_22px_60px_-42px_rgba(15,23,42,0.45)]"
    >
      <div className="flex flex-wrap gap-2">
        <Badge>{formatLabel(partner.partner_type ?? "partner")}</Badge>
        {partner.partnership_level ? <Badge>{formatLabel(partner.partnership_level)}</Badge> : null}
        {partner.is_featured ? <FilledBadge>Featured</FilledBadge> : null}
      </div>
      <h2 className="mt-4 text-xl font-semibold leading-7 text-slate-950">
        {partner.name}
      </h2>
      <p className="mt-3 text-sm leading-7 text-slate-600">
        {compactText(partner.about) ||
          compactText(partner.collaboration_areas) ||
          "Partner profile will appear when published."}
      </p>
      <p className="mt-5 rounded-md bg-slate-50 p-3 text-sm font-semibold text-slate-700">
        {[partner.country, dateRange].map(compactText).filter(Boolean).join(" · ") ||
          "Partnership details not published"}
      </p>
    </Link>
  );
}
