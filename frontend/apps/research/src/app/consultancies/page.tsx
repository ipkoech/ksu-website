import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BriefcaseBusiness, FileText, Filter, Handshake, Search, SlidersHorizontal } from "lucide-react";
import type { ResearchGenericRecord } from "@ksu/api-client";
import { Badge, StatusMessage } from "../../components/research-ui";
import {
  compactText,
  formatLabel,
  getCenters,
  getConsultancies,
  getConsultanciesFiltered,
} from "../../lib/research-public-data";
import {
  filterRecordsByMonth,
  getRecordMonths,
  getRecordSummary,
  getRecordTimelineLabel,
  getRecordTitle,
  getRecordYears,
} from "../../lib/research-page-model";

export const revalidate = 300;

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
  active?: string;
  year?: string;
  month?: string;
  sort?: string;
};

const consultancyTypes = ["research", "technical", "policy", "evaluation", "training", "advisory"];
const clientTypes = ["government", "ngo", "corporate", "international", "academic"];
const consultancyStatuses = ["proposal", "awarded", "ongoing", "completed", "cancelled"];
const sortOptions = [
  { value: "start_date", label: "Start date" },
  { value: "contract_value", label: "Value" },
  { value: "created_at", label: "Newest" },
  { value: "title", label: "Title A-Z" },
];

export default async function ConsultanciesPage({
  searchParams,
}: {
  searchParams?: Promise<ConsultancySearchParams>;
}) {
  const params = (await searchParams) ?? {};
  const sort = params.sort || "start_date";
  const order = sort === "title" ? "asc" : "desc";
  const activeFlags = getActiveFlags(params.active);
  const [consultancies, allConsultancies, centers] = await Promise.all([
    getConsultanciesFiltered({
      search: params.q,
      consultancyType: params.type,
      clientType: params.client,
      status: params.status,
      centerId: params.center,
      year: params.year,
      sort,
      order,
      ...activeFlags,
    }),
    getConsultancies(),
    getCenters(),
  ]);
  const years = getRecordYears(allConsultancies.data);
  const months = getRecordMonths(allConsultancies.data, params.year);
  const visibleConsultancies = filterRecordsByMonth(consultancies.data, params.year, params.month);
  const featuredConsultancy = visibleConsultancies.find((consultancy) => consultancy.is_featured);
  const tableConsultancies = featuredConsultancy
    ? visibleConsultancies.filter((consultancy) => consultancy.id !== featuredConsultancy.id)
    : visibleConsultancies;

  const heroImage = "/images/research/research-office-operations-hero.webp";

  return (
    <main id="research-main" className="min-h-screen bg-white">
      <ConsultancyPortfolioHero count={visibleConsultancies.length} heroImage={heroImage} />

      <section className="border-b border-border bg-white px-4 py-6 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
        <div className="mx-auto grid max-w-[1680px] gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="min-w-0">
            <ConsultancyFilters params={params} years={years} months={months} centers={centers.data} />
            {[consultancies.error, allConsultancies.error, centers.error].filter(Boolean).map((error) => (
              <div key={error} className="mt-4">
                <StatusMessage tone="error">{error}</StatusMessage>
              </div>
            ))}
            {featuredConsultancy ? <FeaturedConsultancy consultancy={featuredConsultancy} /> : null}
            {visibleConsultancies.length > 0 ? (
              <ConsultancyTable records={featuredConsultancy ? tableConsultancies : visibleConsultancies} />
            ) : (
              <div className="mt-5">
                <StatusMessage>No consultancies match the current filters.</StatusMessage>
              </div>
            )}
          </div>
          <EngagementPathways />
        </div>
      </section>
    </main>
  );
}

function ConsultancyPortfolioHero({ count, heroImage }: { count: number; heroImage?: string }) {
  return (
    <section className="relative overflow-hidden border-b border-border bg-[hsl(var(--brand-overlay))] px-4 py-8 text-white sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
      <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(2,22,50,0.96),rgba(0,82,70,0.78)),radial-gradient(circle_at_75%_30%,rgba(245,158,11,0.22),transparent_24%)]" />
      <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-1/2 opacity-45 lg:block">
        <ConsultancyIllustration />
      </div>
      <div className="relative mx-auto max-w-[1680px]">
        <nav className="mb-4 flex flex-wrap items-center gap-2 text-xs font-semibold text-white/70" aria-label="Breadcrumb">
          <Link href="/" className="transition hover:text-white">Home</Link>
          <span>/</span>
          <Link href="/community-impact" className="transition hover:text-white">Community Impact</Link>
          <span>/</span>
          <span className="text-white">Consultancies</span>
        </nav>
        <p className="inline-flex rounded-md border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em]">
          Expert services
        </p>
        <h1 className="mt-4 max-w-4xl text-balance font-[family-name:var(--font-display)] text-4xl font-semibold leading-tight sm:text-5xl">
          Commissioned research, advisory work, and public-value delivery
        </h1>
        <p className="mt-4 max-w-2xl text-pretty text-sm leading-7 text-white/82 sm:text-base">
          Browse client needs, university expertise, delivery windows, values, and outcomes behind published consultancy engagements.
        </p>
        {count > 0 ? <HeroChip label="Visible engagements" value={count} /> : null}
        <div className="mt-6 flex justify-end">
          <div className="overflow-hidden rounded-2xl border border-white/15 bg-white/10 p-2 shadow-2xl backdrop-blur lg:max-w-[320px]">
            <img src={heroImage || "/images/research/research-office-operations-hero.webp"} alt="Consultancy engagements and public value" className="h-44 w-full rounded-xl object-cover" />
          </div>
        </div>
      </div>
    </section>
  );
}

function ConsultancyFilters({
  params,
  years,
  months,
  centers,
}: {
  params: ConsultancySearchParams;
  years: string[];
  months: Array<{ value: string; label: string }>;
  centers: ResearchGenericRecord[];
}) {
  return (
    <form action="/consultancies" className="mb-5 rounded-lg border border-border bg-white p-3 shadow-sm">
      <div className="grid gap-2 lg:grid-cols-[minmax(220px,1fr)_auto_auto_auto]">
        <label className="relative block">
          <Search aria-hidden className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/70" />
          <input
            name="q"
            defaultValue={params.q ?? ""}
            placeholder="Search title, client, outcomes, or impact..."
            className="h-11 w-full rounded-md border border-border bg-white pl-9 pr-3 text-sm font-medium text-foreground outline-none ring-primary/20 transition placeholder:text-muted-foreground/70 focus:border-primary focus:ring-4"
          />
        </label>
        <button type="submit" className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-5 text-sm font-semibold text-white">
          Search
        </button>
        <details className="relative">
          <summary className="inline-flex h-11 cursor-pointer list-none items-center justify-center gap-2 rounded-md border border-border bg-white px-4 text-sm font-semibold text-foreground">
            <Filter aria-hidden className="h-4 w-4" /> Filter
          </summary>
          <div className="absolute right-0 z-20 mt-2 grid w-[320px] gap-3 rounded-lg border border-border bg-white p-4 shadow-xl">
            <SelectField name="type" label="Type" value={params.type} options={consultancyTypes} />
            <SelectField name="client" label="Client" value={params.client} options={clientTypes} />
            <SelectField name="status" label="Status" value={params.status} options={consultancyStatuses} />
            <SelectField name="year" label="Year" value={params.year} options={years} />
            <SelectField name="month" label="Month" value={params.month} options={months} />
            <SelectField name="center" label="Center" value={params.center} options={centers.map((center) => ({ value: compactText(center.id), label: getRecordTitle(center, "Center") }))} />
            <SelectField name="active" label="Active state" value={params.active} options={["active", "inactive", "featured"]} />
          </div>
        </details>
        <details className="relative">
          <summary className="inline-flex h-11 cursor-pointer list-none items-center justify-center gap-2 rounded-md border border-border bg-white px-4 text-sm font-semibold text-foreground">
            <SlidersHorizontal aria-hidden className="h-4 w-4" /> Sort
          </summary>
          <div className="absolute right-0 z-20 mt-2 w-[260px] rounded-lg border border-border bg-white p-4 shadow-xl">
            <SelectField name="sort" label="Sort" value={params.sort} options={sortOptions} includeBlank={false} />
          </div>
        </details>
      </div>
    </form>
  );
}

function FeaturedConsultancy({ consultancy }: { consultancy: ResearchGenericRecord }) {
  const href = consultancy.slug ? `/consultancies/${consultancy.slug}` : "/consultancies";
  const summary = getRecordSummary(consultancy) || compactText(consultancy.objectives) || compactText(consultancy.outcomes);
  const imageSrc = getRecordImage(consultancy, "/images/research/research-about-hero.webp");
  return (
    <Link href={href} className="group mb-5 grid gap-4 rounded-lg border border-primary/25 bg-primary/[0.03] p-4 shadow-sm transition hover:border-primary/45 lg:grid-cols-[minmax(0,1fr)_220px]">
      <div>
        <div className="mb-3 overflow-hidden rounded-lg border border-primary/15 bg-white/80">
          <img src={imageSrc} alt={getRecordTitle(consultancy, "Consultancy")} className="h-32 w-full object-cover" />
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge>{formatLabel(compactText(consultancy.consultancy_type) || "consultancy")}</Badge>
          {consultancy.client_type ? <Badge>{formatLabel(consultancy.client_type)}</Badge> : null}
          <span className="rounded-md bg-primary px-3 py-1 text-xs font-semibold uppercase text-white">Featured</span>
        </div>
        <h2 className="mt-3 text-balance font-[family-name:var(--font-display)] text-2xl font-semibold leading-tight text-foreground">
          {getRecordTitle(consultancy, "Consultancy")}
        </h2>
        {summary ? <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">{summary}</p> : null}
      </div>
      <dl className="grid gap-2 text-sm sm:grid-cols-2 lg:grid-cols-1">
        <MiniFact label="Client" value={compactText(consultancy.client_name)} />
        <MiniFact label="Value" value={formatMoney(consultancy.contract_value, consultancy.currency)} />
      </dl>
    </Link>
  );
}

function ConsultancyTable({ records }: { records: ResearchGenericRecord[] }) {
  if (records.length === 0) return null;

  return (
    <section className="rounded-lg border border-border bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-surface-subtle text-xs uppercase tracking-[0.14em] text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Consultancy</th>
              <th className="px-4 py-3">Client</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Window</th>
              <th className="px-4 py-3">Value</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {records.map((consultancy) => {
              const href = consultancy.slug ? `/consultancies/${consultancy.slug}` : "/consultancies";
              return (
                <tr key={consultancy.id ?? consultancy.slug} className="group transition hover:bg-surface-subtle">
                  <td className="px-4 py-3">
                    <Link href={href} className="flex items-start gap-3 rounded-sm focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20">
                      <img src={getRecordImage(consultancy, "/images/research/research-about-hero.webp")} alt={getRecordTitle(consultancy, "Consultancy")} className="mt-0.5 h-12 w-16 shrink-0 rounded-md object-cover" />
                      <span>
                        <span className="font-semibold text-foreground transition group-hover:text-primary">{getRecordTitle(consultancy, "Consultancy")}</span>
                        <span className="mt-1 block line-clamp-1 text-xs text-muted-foreground">{getRecordSummary(consultancy) || compactText(consultancy.outcomes)}</span>
                      </span>
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{compactText(consultancy.client_name)}</td>
                  <td className="px-4 py-3"><Badge>{formatLabel(compactText(consultancy.consultancy_type) || "consultancy")}</Badge></td>
                  <td className="px-4 py-3"><Badge>{formatLabel(compactText(consultancy.status) || "active")}</Badge></td>
                  <td className="px-4 py-3 text-muted-foreground">{getRecordTimelineLabel(consultancy)}</td>
                  <td className="px-4 py-3 font-semibold text-primary">{formatMoney(consultancy.contract_value, consultancy.currency)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function EngagementPathways() {
  const paths = [
    { label: "Advisory", body: "Technical and policy guidance for public and private clients.", icon: BriefcaseBusiness },
    { label: "Evaluation", body: "Independent studies, audits, baseline and outcome reviews.", icon: FileText },
    { label: "Partnerships", body: "Move from client need to collaborative implementation.", icon: Handshake },
  ];
  return (
    <aside className="rounded-lg border border-border bg-white p-5 shadow-sm xl:sticky xl:top-28 xl:self-start">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-secondary">Engagement pathways</p>
      <div className="mt-4 grid gap-3">
        {paths.map((path) => {
          const Icon = path.icon;
          return (
            <div key={path.label} className="flex gap-3 rounded-lg border border-border p-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                <Icon aria-hidden className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-sm font-semibold text-foreground">{path.label}</h2>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">{path.body}</p>
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-5 divide-y divide-slate-200">
        {[
          { href: "/partners", label: "Partner network" },
          { href: "/services", label: "Research services" },
          { href: "/connect#partnership", label: "Start a conversation" },
        ].map((link) => (
          <Link key={link.href} href={link.href} className="flex items-center justify-between gap-4 py-3 text-sm font-semibold text-primary">
            {link.label}
            <ArrowRight aria-hidden className="h-4 w-4 text-muted-foreground/70" />
          </Link>
        ))}
      </div>
    </aside>
  );
}

function SelectField({
  name,
  label,
  value,
  options,
  includeBlank = true,
}: {
  name: string;
  label: string;
  value?: string;
  options: Array<string | { value: string; label: string }>;
  includeBlank?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase text-muted-foreground">{label}</span>
      <select name={name} defaultValue={value ?? ""} className="mt-2 h-10 w-full rounded-md border border-border bg-white px-3 text-sm font-medium text-foreground">
        {includeBlank ? <option value="">All {label.toLowerCase()}</option> : null}
        {options.map((option) => {
          const normalized = typeof option === "string" ? { value: option, label: formatLabel(option) } : option;
          if (!normalized.value) return null;
          return <option key={`${name}-${normalized.value}`} value={normalized.value}>{normalized.label}</option>;
        })}
      </select>
    </label>
  );
}

function MiniFact({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="rounded-md bg-white p-2.5">
      <dt className="text-xs font-semibold uppercase text-muted-foreground">{label}</dt>
      <dd className="mt-1 font-semibold text-foreground">{value}</dd>
    </div>
  );
}

function HeroChip({ label, value }: { label: string; value: number }) {
  return (
    <dl className="mt-5 inline-flex rounded-md border border-white/15 bg-white/10 px-4 py-2">
      <div>
        <dt className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/65">{label}</dt>
        <dd className="mt-1 text-xl font-semibold text-white">{value.toLocaleString()}</dd>
      </div>
    </dl>
  );
}

function getRecordImage(record: ResearchGenericRecord, fallback: string) {
  return compactText(record.cover_image_url) || compactText(record.image_url) || fallback;
}

function formatMoney(value?: string | number | null, currency?: string | null) {
  if (value === null || value === undefined || value === "") return "";
  const amount = Number(value);
  if (Number.isNaN(amount)) return compactText(value);
  return `${currency ?? "KES"} ${new Intl.NumberFormat("en-KE").format(amount)}`;
}

function getActiveFlags(value?: string) {
  if (value === "inactive") return { isActive: false };
  if (value === "featured") return { isActive: true, isFeatured: true };
  return { isActive: true };
}

function ConsultancyIllustration() {
  return (
    <svg viewBox="0 0 760 360" className="h-full w-full" role="img" aria-label="Consultancy illustration">
      <rect x="120" y="96" width="220" height="142" rx="12" fill="#ffffff" opacity="0.1" stroke="#ffffff" strokeOpacity="0.22" />
      <rect x="396" y="72" width="180" height="208" rx="12" fill="#ffffff" opacity="0.08" stroke="#ffffff" strokeOpacity="0.2" />
      <path d="M152 200 L202 166 L248 184 L306 128" fill="none" stroke="#f59e0b" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M426 126 H540 M426 164 H520 M426 202 H552 M426 240 H506" stroke="#ffffff" strokeOpacity="0.34" strokeWidth="6" strokeLinecap="round" />
      <circle cx="620" cy="122" r="70" fill="#00a86b" opacity="0.13" />
      <path d="M604 122 C628 98 656 98 678 122 C656 146 628 146 604 122Z" fill="#f59e0b" opacity="0.62" />
    </svg>
  );
}
