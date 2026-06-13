import type { Metadata } from "next";
import Link from "next/link";
import { Banknote, Handshake, Lightbulb, Network } from "lucide-react";
import { ResearchClusterHero } from "../../components/research-cluster";
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
  getCenters,
  getConsultancies,
  getConsultanciesFiltered,
} from "../../lib/research-public-data";
import type { ResearchGenericRecord } from "@ksu/api-client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Research Consultancies",
  description: "Consultancy services and expert engagement records.",
};

type ConsultancySearchParams = {
  q?: string;
  type?: string;
  client?: string;
  status?: string;
  center?: string;
  year?: string;
  sort?: string;
};

const consultancyTypes = ["research", "technical", "policy", "evaluation", "training", "advisory"];
const clientTypes = ["government", "ngo", "corporate", "international", "academic"];
const consultancyStatuses = ["proposal", "awarded", "ongoing", "completed", "cancelled"];

const innovationLinks = [
  { label: "Innovations", href: "/innovations", description: "Tools, prototypes, software, and translated research.", icon: Lightbulb },
  { label: "Partners", href: "/partners", description: "Partner profiles, sponsorships, and collaboration routes.", icon: Handshake },
  { label: "Consultancies", href: "/consultancies", description: "Applied expert services and client engagements.", icon: Network },
  { label: "Endowments", href: "/endowments", description: "Permanent funding initiatives and named funds.", icon: Banknote },
];

export default async function ConsultanciesPage({
  searchParams,
}: {
  searchParams?: Promise<ConsultancySearchParams>;
}) {
  const params = (await searchParams) ?? {};
  const [consultancies, allConsultancies, centers] = await Promise.all([
    getConsultanciesFiltered({
      search: params.q,
      consultancyType: params.type,
      clientType: params.client,
      status: params.status,
      centerId: params.center,
      year: params.year,
      sort: params.sort || "start_date",
      order: params.sort === "title" ? "asc" : "desc",
    }),
    getConsultancies(),
    getCenters(),
  ]);

  return (
    <main id="research-main" className="min-h-screen bg-white">
      <ResearchClusterHero
        eyebrow="Innovation & Partnerships"
        title="Consultancy engagements and applied expert services."
        body="Consultancy records show client needs, scope, methods, deliverables, outcomes, impact, and the university units involved."
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Innovation & Partnerships", href: "/innovations" },
          { label: "Consultancies" },
        ]}
        imageSrc="/images/research/registrar-reirm-imagegen.png"
        imageAlt="Applied research consultancy and expert service engagement"
        links={innovationLinks}
        primaryAction={{ label: "View partners", href: "/partners" }}
        stats={[
          { label: "Consultancy results", value: consultancies.data.length },
          { label: "Published consultancies", value: allConsultancies.data.length },
          { label: "Centers", value: centers.data.length },
          { label: "Service types", value: consultancyTypes.length },
        ]}
      />

      <ResearchSection
        eyebrow="Expert Services"
        title="Consultancy records"
        body="Consultancy records are maintained in the Research service and filtered through backend query parameters."
        tone="white"
      >
        <ConsultancyFilters
          params={params}
          years={getConsultancyYears(allConsultancies.data)}
          centers={centers.data}
        />

        {[consultancies.error, allConsultancies.error, centers.error].filter(Boolean).map((error) => (
          <div key={error} className="mt-5">
            <StatusMessage tone="error">{error}</StatusMessage>
          </div>
        ))}

        {consultancies.data.length > 0 ? (
          <div className="mt-7 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {consultancies.data.map((consultancy) => (
              <ConsultancyCard key={consultancy.id} consultancy={consultancy} />
            ))}
          </div>
        ) : (
          <div className="mt-7">
            <StatusMessage>No consultancies match the current filters.</StatusMessage>
          </div>
        )}
      </ResearchSection>
    </main>
  );
}

function ConsultancyFilters({
  params,
  years,
  centers,
}: {
  params: ConsultancySearchParams;
  years: string[];
  centers: ResearchGenericRecord[];
}) {
  return (
    <form className="rounded-lg border border-slate-200 bg-slate-50 p-4" action="/consultancies">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
        <label className="xl:col-span-2">
          <span className="text-xs font-semibold uppercase text-slate-500">Search</span>
          <input
            name="q"
            defaultValue={params.q ?? ""}
            placeholder="Title, client, outcomes, impact"
            className="mt-2 h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-primary"
          />
        </label>
        <SelectField name="type" label="Type" value={params.type} options={consultancyTypes} />
        <SelectField name="client" label="Client" value={params.client} options={clientTypes} />
        <SelectField name="status" label="Status" value={params.status} options={consultancyStatuses} />
        <SelectField name="year" label="Year" value={params.year} options={years} />
        <label>
          <span className="text-xs font-semibold uppercase text-slate-500">Sort</span>
          <select
            name="sort"
            defaultValue={params.sort ?? "start_date"}
            className="mt-2 h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-primary"
          >
            <option value="start_date">Start date</option>
            <option value="created_at">Newest</option>
            <option value="contract_value">Value</option>
            <option value="title">Title</option>
          </select>
        </label>
        <label className="md:col-span-2 xl:col-span-3">
          <span className="text-xs font-semibold uppercase text-slate-500">Center</span>
          <select
            name="center"
            defaultValue={params.center ?? ""}
            className="mt-2 h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-primary"
          >
            <option value="">All centers</option>
            {centers.map((center) => (
              <option key={center.id} value={center.id}>
                {center.name ?? center.title ?? center.code ?? center.id}
              </option>
            ))}
          </select>
        </label>
        <div className="flex items-end gap-2 md:col-span-2 xl:col-span-3">
          <button className="inline-flex h-11 items-center justify-center rounded-full bg-primary px-5 text-sm font-semibold text-white transition hover:bg-primary/90">
            Apply filters
          </button>
          <Link
            href="/consultancies"
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

function ConsultancyCard({ consultancy }: { consultancy: ResearchGenericRecord }) {
  return (
    <Link
      href={consultancy.slug ? `/consultancies/${consultancy.slug}` : "/consultancies"}
      className="block rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:border-primary/30 hover:shadow-[0_22px_60px_-42px_rgba(15,23,42,0.45)]"
    >
      <div className="flex flex-wrap gap-2">
        <Badge>{formatLabel(consultancy.consultancy_type ?? "consultancy")}</Badge>
        {consultancy.client_type ? <Badge>{formatLabel(consultancy.client_type)}</Badge> : null}
        {consultancy.is_featured ? <FilledBadge>Featured</FilledBadge> : null}
      </div>
      <h2 className="mt-4 text-xl font-semibold leading-7 text-slate-950">
        {consultancy.title}
      </h2>
      <p className="mt-3 text-sm leading-7 text-slate-600">
        {compactText(consultancy.summary) ||
          compactText(consultancy.objectives) ||
          compactText(consultancy.outcomes) ||
          "Consultancy scope will appear when published."}
      </p>
      <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
        <Fact label="Client" value={compactText(consultancy.client_name)} />
        <Fact label="Start" value={formatDate(consultancy.start_date)} />
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

function getConsultancyYears(records: ResearchGenericRecord[]) {
  const years = records
    .flatMap((record) => [record.start_date, record.end_date, record.created_at])
    .map((value) => (value ? new Date(value).getFullYear() : null))
    .filter((year): year is number => Boolean(year) && !Number.isNaN(year));
  return Array.from(new Set(years))
    .sort((a, b) => b - a)
    .map(String);
}
