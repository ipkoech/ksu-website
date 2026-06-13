import type { Metadata } from "next";
import Link from "next/link";
import {
  Badge,
  FilledBadge,
  ResearchPageIntro,
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
      <ResearchPageIntro
        eyebrow="Innovation & Partnerships"
        title="Endowments and permanent funding initiatives for research impact."
        body="Endowment records publish purpose, donor context, eligibility, fund value, contribution status, and contact information."
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Innovation & Partnerships", href: "/innovations" },
          { label: "Endowments" },
        ]}
      />

      <ResearchSection
        eyebrow="Endowment Funds"
        title="Published endowments"
        body="Endowment records are backend-backed information pages for long-term research support."
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
    <form className="rounded-lg border border-slate-200 bg-slate-50 p-4" action="/endowments">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
        <label className="xl:col-span-2">
          <span className="text-xs font-semibold uppercase text-slate-500">Search</span>
          <input
            name="q"
            defaultValue={params.q ?? ""}
            placeholder="Fund name, donor, purpose"
            className="mt-2 h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-primary"
          />
        </label>
        <SelectField name="type" label="Type" value={params.type} options={fundTypes} />
        <SelectField name="status" label="Status" value={params.status} options={fundStatuses} />
        <SelectField name="year" label="Year" value={params.year} options={years} />
        <label>
          <span className="text-xs font-semibold uppercase text-slate-500">Sort</span>
          <select
            name="sort"
            defaultValue={params.sort ?? "display_order"}
            className="mt-2 h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-primary"
          >
            <option value="display_order">Featured order</option>
            <option value="established_date">Established date</option>
            <option value="current_value">Current value</option>
            <option value="name">Name</option>
          </select>
        </label>
        <div className="flex items-end gap-2 md:col-span-2 xl:col-span-6">
          <button className="inline-flex h-11 items-center justify-center rounded-full bg-primary px-5 text-sm font-semibold text-white transition hover:bg-primary/90">
            Apply filters
          </button>
          <Link
            href="/endowments"
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
        <Fact label="Current value" value={formatMoney(fund.current_value, fund.currency)} />
        <Fact label="Established" value={formatDate(fund.established_date)} />
      </dl>
    </Link>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-slate-50 p-3">
      <dt className="text-xs font-semibold uppercase text-slate-500">{label}</dt>
      <dd className="mt-1 font-semibold text-slate-950">{value || "Not published"}</dd>
    </div>
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
