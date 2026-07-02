import type { Metadata } from "next";
import Link from "next/link";
import { ResearchFilterForm, ResearchRecordRow } from "../../components/research-listing";
import {
  Badge,
  FilledBadge,
  ResearchSection,
  StatusMessage,
} from "../../components/research-ui";
import { FundingIllustratedHero, formatMoney, fundingIcons } from "../../components/funding-ui";
import {
  compactText,
  formatDate,
  formatLabel,
  getEndowments,
  getEndowmentsFiltered,
  getFunders,
} from "../../lib/research-public-data";
import {
  filterRecordsByMonth,
  getRecordMonths,
  getRecordSummary,
  getRecordTimelineLabel,
  getRecordTitle,
  getRecordYears,
} from "../../lib/research-page-model";
import type { ResearchGenericRecord } from "@ksu/api-client";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Endowment Funds",
  description: "Research endowment funds and funding partners.",
};

type EndowmentSearchParams = {
  q?: string;
  type?: string;
  status?: string;
  active?: string;
  year?: string;
  month?: string;
  sort?: string;
};

const fundTypes = ["general", "named", "restricted", "scholarship", "chair"];
const fundStatuses = ["active", "building", "suspended", "closed"];
const activeStates = [
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
  { label: "Featured", value: "featured" },
];
const sortOptions = [
  { value: "display_order", label: "Featured order" },
  { value: "established_date", label: "Established date" },
  { value: "created_at", label: "Newest" },
  { value: "current_value", label: "Current value" },
  { value: "name", label: "Name A-Z" },
];

export default async function EndowmentsPage({
  searchParams,
}: {
  searchParams?: Promise<EndowmentSearchParams>;
}) {
  const params = (await searchParams) ?? {};
  const sort = params.sort || "display_order";
  const order = sort === "name" ? "asc" : "desc";
  const activeFlags = getActiveFlags(params.active);
  const [endowments, allEndowments, funders] = await Promise.all([
    getEndowmentsFiltered({
      search: params.q,
      fundType: params.type,
      status: params.status,
      year: params.year,
      sort,
      order,
      ...activeFlags,
    }),
    getEndowments(),
    getFunders(),
  ]);
  const years = getRecordYears(allEndowments.data);
  const months = getRecordMonths(allEndowments.data, params.year);
  const visibleEndowments = filterRecordsByMonth(endowments.data, params.year, params.month);
  const featuredEndowment = visibleEndowments.find((fund) => fund.is_featured);
  const rowEndowments = featuredEndowment
    ? visibleEndowments.filter((fund) => fund.id !== featuredEndowment.id)
    : visibleEndowments;

  return (
    <main id="research-main" className="min-h-screen bg-slate-50">
      <EndowmentsMasthead
        resultCount={visibleEndowments.length}
        publishedCount={allEndowments.data.length}
        fundersCount={funders.data.length}
        fundTypeCount={fundTypes.length}
      />

      <ResearchSection
        eyebrow="Endowment Funds"
        title="Published endowments"
        body="Search first, then use the filter menu for fund type, active state, status, year, month, and sort order."
        tone="white"
      >
        <EndowmentFilters params={params} years={years} months={months} />

        {[endowments.error, allEndowments.error, funders.error].filter(Boolean).map((error) => (
          <div key={error} className="mt-5">
            <StatusMessage tone="error">{error}</StatusMessage>
          </div>
        ))}

        {visibleEndowments.length > 0 ? (
          <>
            {featuredEndowment ? (
              <div className="mt-6">
                <FeaturedEndowment fund={featuredEndowment} />
              </div>
            ) : null}
            <div className="mt-6 divide-y divide-slate-200 rounded-lg border border-slate-200 bg-white shadow-sm">
              {rowEndowments.map((fund) => (
                <EndowmentRow key={fund.id} fund={fund} />
              ))}
            </div>
          </>
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
              {compactText(funder.about) || compactText(funder.summary) || compactText(funder.description) ? (
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  {compactText(funder.about) || compactText(funder.summary) || compactText(funder.description)}
                </p>
              ) : null}
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
  months,
}: {
  params: EndowmentSearchParams;
  years: string[];
  months: Array<{ value: string; label: string }>;
}) {
  return (
    <ResearchFilterForm
      action="/endowments"
      resetHref="/endowments"
      searchValue={params.q}
      searchPlaceholder="Fund name, donor, purpose"
      selects={[
        { name: "type", label: "Type", value: params.type, options: fundTypes },
        { name: "active", label: "Active state", value: params.active, options: activeStates },
        { name: "status", label: "Status", value: params.status, options: fundStatuses },
        { name: "year", label: "Year", value: params.year, options: years },
        { name: "month", label: "Month", value: params.month, options: months },
      ]}
      sortValue={params.sort}
      sortOptions={sortOptions}
    />
  );
}

function EndowmentsMasthead({
  resultCount,
  publishedCount,
  fundersCount,
  fundTypeCount,
}: {
  resultCount: number;
  publishedCount: number;
  fundersCount: number;
  fundTypeCount: number;
}) {
  return (
    <FundingIllustratedHero
      eyebrow="Funding / Endowments"
      title="Research Endowments"
      body="Scan purpose, donor context, contribution status, current value, annual distribution, and eligibility from published fund records."
      tone="endowment"
      actions={[
        { label: "Support research", href: "/donate" },
        { label: "View partners", href: "/partners", variant: "secondary" },
      ]}
      facts={[
        { label: "Results", value: resultCount || "", icon: fundingIcons.check },
        { label: "Published", value: publishedCount || "", icon: fundingIcons.award },
        { label: "Funders", value: fundersCount || "", icon: fundingIcons.bank },
        { label: "Fund types", value: fundTypeCount || "", icon: fundingIcons.money },
      ]}
    />
  );
}

function FeaturedEndowment({ fund }: { fund: ResearchGenericRecord }) {
  return (
    <Link
      href={fund.slug ? `/endowments/${fund.slug}` : "/endowments"}
      className="group grid gap-4 rounded-lg border border-primary/20 bg-primary/[0.03] p-4 shadow-sm transition hover:border-primary/40 lg:grid-cols-[minmax(0,1fr)_260px_auto] lg:items-center"
    >
      <div>
        <div className="flex flex-wrap gap-2">
          <Badge>{formatLabel(fund.fund_type ?? "fund")}</Badge>
          {fund.status ? <Badge>{formatLabel(fund.status)}</Badge> : null}
          <FilledBadge>Featured</FilledBadge>
        </div>
        <h2 className="mt-3 text-lg font-semibold leading-7 text-slate-950">
          {getRecordTitle(fund, "Endowment fund")}
        </h2>
        {compactText(fund.purpose) || getRecordSummary(fund) || compactText(fund.donor_message) ? <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">
          {compactText(fund.purpose) ||
            getRecordSummary(fund) ||
            compactText(fund.donor_message)}
        </p> : null}
      </div>
      <dl className="grid gap-2 text-sm">
        {formatMoney(fund.current_value, fund.currency) ? <div className="rounded-md bg-white p-2.5">
          <dt className="text-xs font-semibold uppercase text-slate-500">Current value</dt>
          <dd className="mt-1 font-semibold text-slate-950">{formatMoney(fund.current_value, fund.currency)}</dd>
        </div> : null}
        {formatDate(fund.established_date) ? <div className="rounded-md bg-white p-2.5">
          <dt className="text-xs font-semibold uppercase text-slate-500">Established</dt>
          <dd className="mt-1 font-semibold text-slate-950">{formatDate(fund.established_date)}</dd>
        </div> : null}
      </dl>
      <span className="inline-flex min-h-10 items-center justify-center rounded-md border border-primary/20 px-3 text-sm font-semibold text-primary transition group-hover:bg-primary group-hover:text-white">
        Open fund
      </span>
    </Link>
  );
}

function EndowmentRow({ fund }: { fund: ResearchGenericRecord }) {
  return (
    <ResearchRecordRow
      href={fund.slug ? `/endowments/${fund.slug}` : "/endowments"}
      title={getRecordTitle(fund, "Endowment fund")}
      description={
        compactText(fund.purpose) ||
        getRecordSummary(fund) ||
        compactText(fund.donor_message)
      }
      badges={[fund.fund_type ?? "fund", fund.status]}
      filledBadges={[fund.is_featured ? "Featured" : null, fund.is_accepting_contributions ? "Accepting contributions" : null]}
      facts={[
        { label: "Current value", value: formatMoney(fund.current_value, fund.currency) },
        { label: "Established", value: formatDate(fund.established_date) },
        { label: "Updated", value: getRecordTimelineLabel(fund) },
      ]}
    />
  );
}

function getActiveFlags(value?: string) {
  if (value === "inactive") return { isActive: false };
  if (value === "featured") return { isActive: true, isFeatured: true };
  return { isActive: true };
}
