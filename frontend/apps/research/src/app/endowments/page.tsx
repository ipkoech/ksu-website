import type { Metadata } from "next";
import Link from "next/link";
import { Banknote, Handshake, Lightbulb, Network } from "lucide-react";
import { ResearchClusterHero } from "../../components/research-cluster";
import { ResearchFilterForm } from "../../components/research-listing";
import { ResearchFact } from "../../components/research-detail";
import {
  Badge,
  FilledBadge,
  ResearchSection,
  StatusMessage,
} from "../../components/research-ui";
import {
  compactText,
  formatDate,
  formatLabel,
  getEndowments,
  getEndowmentsFiltered,
  getFunders,
} from "../../lib/research-public-data";
import type { ResearchGenericRecord } from "@ksu/api-client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Endowment Funds",
  description: "Research endowment funds and funding partners.",
};

type EndowmentSearchParams = {
  q?: string;
  type?: string;
  status?: string;
  year?: string;
  sort?: string;
};

const fundTypes = ["general", "named", "restricted", "scholarship", "chair"];
const fundStatuses = ["active", "building", "suspended", "closed"];

const innovationLinks = [
  { label: "Innovations", href: "/innovations", description: "Tools, prototypes, software, and translated research.", icon: Lightbulb },
  { label: "Partners", href: "/partners", description: "Partner profiles, sponsorships, and collaboration routes.", icon: Handshake },
  { label: "Consultancies", href: "/consultancies", description: "Applied expert services and client engagements.", icon: Network },
  { label: "Endowments", href: "/endowments", description: "Permanent funding initiatives and named funds.", icon: Banknote },
];

export default async function EndowmentsPage({
  searchParams,
}: {
  searchParams?: Promise<EndowmentSearchParams>;
}) {
  const params = (await searchParams) ?? {};
  const [endowments, allEndowments, funders] = await Promise.all([
    getEndowmentsFiltered({
      search: params.q,
      fundType: params.type,
      status: params.status,
      year: params.year,
      sort: params.sort || "display_order",
      order: params.sort === "name" ? "asc" : "desc",
    }),
    getEndowments(),
    getFunders(),
  ]);

  return (
    <main id="research-main" className="min-h-screen bg-white">
      <ResearchClusterHero
        eyebrow="Innovation & Partnerships"
        title="Endowments and permanent funding initiatives for research impact."
        body="Endowment records publish purpose, donor context, eligibility, fund value, contribution status, and contact information."
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Innovation & Partnerships", href: "/innovations" },
          { label: "Endowments" },
        ]}
        imageSrc="/images/research/research-projects-hero.svg"
        imageAlt="Research endowment funding and permanent support initiatives"
        links={innovationLinks}
        primaryAction={{ label: "View partners", href: "/partners" }}
        stats={[
          { label: "Endowment results", value: endowments.data.length },
          { label: "Published endowments", value: allEndowments.data.length },
          { label: "Funders", value: funders.data.length },
          { label: "Fund types", value: fundTypes.length },
        ]}
      />

      <ResearchSection
        eyebrow="Endowment Funds"
        title="Published endowments"
        body="Endowment pages publish long-term funds, purposes, donors, targets, and impact details."
        tone="white"
      >
        <EndowmentFilters params={params} years={getEndowmentYears(allEndowments.data)} />

        {[endowments.error, allEndowments.error, funders.error].filter(Boolean).map((error) => (
          <div key={error} className="mt-5">
            <StatusMessage tone="error">{error}</StatusMessage>
          </div>
        ))}

        {endowments.data.length > 0 ? (
          <div className="mt-7 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {endowments.data.map((fund) => (
              <EndowmentCard key={fund.id} fund={fund} />
            ))}
          </div>
        ) : (
          <div className="mt-7">
            <StatusMessage>No endowments match the current filters.</StatusMessage>
          </div>
        )}
      </ResearchSection>

      <ResearchSection
        eyebrow="Funding Partners"
        title="Funders supporting research"
        body="Funder records identify organizations that support research work and can be connected to grants, projects, and centers."
      >
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {funders.data.slice(0, 6).map((funder) => (
            <article key={funder.id} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <Badge>{formatLabel(funder.funder_type ?? funder.category ?? "funder")}</Badge>
              <h2 className="mt-4 text-xl font-semibold text-slate-950">
                {funder.name ?? funder.title}
              </h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                {compactText(funder.about) ||
                  compactText(funder.summary) ||
                  compactText(funder.description) ||
                  "Funder profile will appear when published."}
              </p>
            </article>
          ))}
        </div>
      </ResearchSection>
    </main>
  );
}

function EndowmentFilters({
  params,
  years,
}: {
  params: EndowmentSearchParams;
  years: string[];
}) {
  return (
    <ResearchFilterForm
      action="/endowments"
      resetHref="/endowments"
      searchValue={params.q}
      searchPlaceholder="Fund name, donor, purpose"
      selects={[
        { name: "type", label: "Type", value: params.type, options: fundTypes },
        { name: "status", label: "Status", value: params.status, options: fundStatuses },
        { name: "year", label: "Year", value: params.year, options: years },
      ]}
      sortValue={params.sort}
      sortOptions={[
        { value: "display_order", label: "Featured order" },
        { value: "established_date", label: "Established date" },
        { value: "current_value", label: "Current value" },
        { value: "name", label: "Name" },
      ]}
    />
  );
}

function EndowmentCard({ fund }: { fund: ResearchGenericRecord }) {
  return (
    <Link
      href={fund.slug ? `/endowments/${fund.slug}` : "/endowments"}
      className="block rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:border-primary/30 hover:shadow-[0_22px_60px_-42px_rgba(15,23,42,0.45)]"
    >
      <div className="flex flex-wrap gap-2">
        <Badge>{formatLabel(fund.fund_type ?? "fund")}</Badge>
        {fund.status ? <Badge>{formatLabel(fund.status)}</Badge> : null}
        {fund.is_featured ? <FilledBadge>Featured</FilledBadge> : null}
      </div>
      <h2 className="mt-4 text-xl font-semibold leading-7 text-slate-950">
        {fund.name ?? fund.title}
      </h2>
      <p className="mt-3 text-sm leading-7 text-slate-600">
        {compactText(fund.purpose) ||
          compactText(fund.description) ||
          compactText(fund.donor_message) ||
          "Endowment purpose will appear when published."}
      </p>
      <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
        <ResearchFact label="Current value" value={formatMoney(fund.current_value, fund.currency)} />
        <ResearchFact label="Established" value={formatDate(fund.established_date)} />
      </dl>
    </Link>
  );
}

function formatMoney(value?: string | number | null, currency?: string | null) {
  if (value === null || value === undefined || value === "") return "";
  const amount = Number(value);
  if (Number.isNaN(amount)) return compactText(value);
  return `${currency ?? "KES"} ${new Intl.NumberFormat("en-KE").format(amount)}`;
}

function getEndowmentYears(records: ResearchGenericRecord[]) {
  const years = records
    .flatMap((record) => [record.established_date, record.created_at])
    .map((value) => (value ? new Date(value).getFullYear() : null))
    .filter((year): year is number => Boolean(year) && !Number.isNaN(year));
  return Array.from(new Set(years))
    .sort((a, b) => b - a)
    .map(String);
}
