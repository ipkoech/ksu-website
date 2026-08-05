import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CalendarClock, Filter, GraduationCap, Search, SlidersHorizontal, UsersRound } from "lucide-react";
import type { ResearchGenericRecord } from "@ksu/api-client";
import { Badge, StatusMessage } from "../../components/research-ui";
import {
  compactText,
  formatDate,
  formatLabel,
  getCenters,
  getMentorship,
  getMentorshipFiltered,
} from "../../lib/research-public-data";
import {
  filterRecordsByMonth,
  getRecordMonths,
  getRecordSummary,
  getRecordTitle,
  getRecordYears,
} from "../../lib/research-page-model";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Research Mentorship",
  description: "Research mentorship programmes and sign-up pathways.",
};

type MentorshipSearchParams = {
  q?: string;
  type?: string;
  status?: string;
  active?: string;
  center?: string;
  year?: string;
  month?: string;
  sort?: string;
};

const programTypes = ["research", "career", "academic", "writing", "grant_writing", "leadership"];
const statuses = ["draft", "accepting_applications", "matching", "active", "completed", "suspended"];
const sortOptions = [
  { value: "application_deadline", label: "Application deadline" },
  { value: "cohort_start_date", label: "Cohort start" },
  { value: "created_at", label: "Newest" },
  { value: "name", label: "Name A-Z" },
];

export default async function MentorshipPage({
  searchParams,
}: {
  searchParams?: Promise<MentorshipSearchParams>;
}) {
  const params = (await searchParams) ?? {};
  const sort = params.sort || "application_deadline";
  const sortField = sort === "name" ? "name" : sort;
  const order = sort === "name" ? "asc" : "desc";
  const activeFlags = getActiveFlags(params.active);
  const [mentorship, allMentorship, centers] = await Promise.all([
    getMentorshipFiltered({
      search: params.q,
      programType: params.type,
      status: params.status,
      centerId: params.center,
      year: params.year,
      sort: sortField,
      order,
      ...activeFlags,
    }),
    getMentorship(),
    getCenters(),
  ]);
  const years = getRecordYears(allMentorship.data);
  const months = getRecordMonths(allMentorship.data, params.year);
  const visibleMentorship = filterRecordsByMonth(mentorship.data, params.year, params.month);
  const featuredMentorship = visibleMentorship.find((item) => item.is_featured);
  const tableMentorship = featuredMentorship
    ? visibleMentorship.filter((item) => item.id !== featuredMentorship.id)
    : visibleMentorship;

  const heroImage = "/images/research/research-hero-imagegen.webp";

  return (
    <main id="research-main" className="min-h-screen bg-white">
      <MentorshipPortfolioHero count={visibleMentorship.length} heroImage={heroImage} />

      <section className="border-b border-border bg-white px-4 py-6 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
        <div className="mx-auto grid max-w-[1680px] gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="min-w-0">
            <MentorshipFilters params={params} years={years} months={months} centers={centers.data} />
            {[mentorship.error, allMentorship.error, centers.error].filter(Boolean).map((error) => (
              <div key={error} className="mt-4">
                <StatusMessage tone="error">{error}</StatusMessage>
              </div>
            ))}
            {featuredMentorship ? <FeaturedMentorship item={featuredMentorship} /> : null}
            {visibleMentorship.length > 0 ? (
              <MentorshipTable records={featuredMentorship ? tableMentorship : visibleMentorship} />
            ) : (
              <div className="mt-5">
                <StatusMessage>No mentorship programmes match the current filters.</StatusMessage>
              </div>
            )}
          </div>
          <ChooseYourPathway />
        </div>
      </section>
    </main>
  );
}

function MentorshipPortfolioHero({ count, heroImage }: { count: number; heroImage?: string }) {
  return (
    <section className="relative overflow-hidden border-b border-border bg-[hsl(var(--brand-overlay))] px-4 py-8 text-white sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
      <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(2,22,50,0.96),rgba(0,82,70,0.78)),radial-gradient(circle_at_75%_30%,rgba(245,158,11,0.22),transparent_24%)]" />
      <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-1/2 opacity-45 lg:block">
        <MentorshipIllustration />
      </div>
      <div className="relative mx-auto max-w-[1680px]">
        <nav className="mb-4 flex flex-wrap items-center gap-2 text-xs font-semibold text-white/70" aria-label="Breadcrumb">
          <Link href="/" className="transition hover:text-white">Home</Link>
          <span>/</span>
          <Link href="/community-impact" className="transition hover:text-white">Community Impact</Link>
          <span>/</span>
          <span className="text-white">Mentorship</span>
        </nav>
        <p className="inline-flex rounded-md border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em]">
          Growth pathways
        </p>
        <h1 className="mt-4 max-w-4xl text-balance font-[family-name:var(--app-font-display)] text-4xl font-semibold leading-tight sm:text-5xl">
          Mentorship programmes for researchers, writers, grant teams, and emerging leaders
        </h1>
        <p className="mt-4 max-w-2xl text-pretty text-sm leading-7 text-white/82 sm:text-base">
          Find open cohorts, application windows, mentor capacity, expectations, and programme contacts.
        </p>
        {count > 0 ? <HeroChip label="Visible programmes" value={count} /> : null}
        <div className="mt-6 flex justify-end">
          <div className="overflow-hidden rounded-2xl border border-white/15 bg-white/10 p-2 shadow-2xl backdrop-blur lg:max-w-[320px]">
            <img src={heroImage || "/images/research/research-hero-imagegen.webp"} alt="Research mentorship pathways" className="h-44 w-full rounded-xl object-cover" />
          </div>
        </div>
      </div>
    </section>
  );
}

function MentorshipFilters({
  params,
  years,
  months,
  centers,
}: {
  params: MentorshipSearchParams;
  years: string[];
  months: Array<{ value: string; label: string }>;
  centers: ResearchGenericRecord[];
}) {
  return (
    <form action="/mentorship" className="mb-5 rounded-lg border border-border bg-white p-3 shadow-sm">
      <div className="grid gap-2 lg:grid-cols-[minmax(220px,1fr)_auto_auto_auto]">
        <label className="relative block">
          <Search aria-hidden className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/70" />
          <input
            name="q"
            defaultValue={params.q ?? ""}
            placeholder="Search programme, requirements, benefits..."
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
            <SelectField name="type" label="Type" value={params.type} options={programTypes} />
            <SelectField name="status" label="Status" value={params.status} options={statuses} />
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

function FeaturedMentorship({ item }: { item: ResearchGenericRecord }) {
  const href = item.slug ? `/mentorship/${item.slug}` : "/mentorship";
  const summary = getRecordSummary(item) || compactText(item.benefits);
  const imageSrc = getRecordImage(item, "/images/research/research-about-hero.webp");
  return (
    <Link href={href} className="group mb-5 grid gap-4 rounded-lg border border-primary/25 bg-primary/[0.03] p-4 shadow-sm transition hover:border-primary/45 lg:grid-cols-[minmax(0,1fr)_220px]">
      <div>
        <div className="mb-3 overflow-hidden rounded-lg border border-primary/15 bg-white/80">
          <img src={imageSrc} alt={getRecordTitle(item, "Mentorship programme")} className="h-32 w-full object-cover" />
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge>{formatLabel(compactText(item.program_type) || "mentorship")}</Badge>
          <DeadlineStatusBadge record={item} />
          <span className="rounded-md bg-primary px-3 py-1 text-xs font-semibold uppercase text-white">Featured</span>
        </div>
        <h2 className="mt-3 text-balance font-[family-name:var(--app-font-display)] text-2xl font-semibold leading-tight text-foreground">
          {getRecordTitle(item, "Mentorship programme")}
        </h2>
        {summary ? <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">{summary}</p> : null}
      </div>
      <dl className="grid gap-2 text-sm sm:grid-cols-2 lg:grid-cols-1">
        <MiniFact label="Cohort" value={formatDate(item.cohort_start_date)} />
        <MiniFact label="Capacity" value={formatCapacity(item)} />
      </dl>
    </Link>
  );
}

function MentorshipTable({ records }: { records: ResearchGenericRecord[] }) {
  if (records.length === 0) return null;

  return (
    <section className="rounded-lg border border-border bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-surface-subtle text-xs uppercase tracking-[0.14em] text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Programme</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Application deadline</th>
              <th className="px-4 py-3">Cohort</th>
              <th className="px-4 py-3">Capacity</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {records.map((item) => {
              const href = item.slug ? `/mentorship/${item.slug}` : "/mentorship";
              return (
                <tr key={item.id ?? item.slug} className="group transition hover:bg-surface-subtle">
                  <td className="px-4 py-3">
                    <Link href={href} className="flex items-start gap-3 rounded-sm focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20">
                      <img src={getRecordImage(item, "/images/research/research-about-hero.webp")} alt={getRecordTitle(item, "Mentorship programme")} className="mt-0.5 h-12 w-16 shrink-0 rounded-md object-cover" />
                      <span>
                        <span className="font-semibold text-foreground transition group-hover:text-primary">{getRecordTitle(item, "Mentorship programme")}</span>
                        <span className="mt-1 block line-clamp-1 text-xs text-muted-foreground">{getRecordSummary(item) || compactText(item.benefits)}</span>
                      </span>
                    </Link>
                  </td>
                  <td className="px-4 py-3"><Badge>{formatLabel(compactText(item.program_type) || "mentorship")}</Badge></td>
                  <td className="px-4 py-3"><Badge>{formatLabel(compactText(item.status) || "active")}</Badge></td>
                  <td className="px-4 py-3"><DeadlineStatusBadge record={item} /></td>
                  <td className="px-4 py-3 text-muted-foreground">{formatDate(item.cohort_start_date)}</td>
                  <td className="px-4 py-3 text-muted-foreground">{formatCapacity(item)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function DeadlineStatusBadge({ record }: { record: ResearchGenericRecord }) {
  const status = getDeadlineState(record);
  return (
    <span className={`inline-flex items-center rounded-md px-3 py-1 text-xs font-semibold uppercase ${status.className}`}>
      {status.label}
    </span>
  );
}

function ChooseYourPathway() {
  const pathways = [
    { label: "Research", body: "Design, ethics, fieldwork, analysis and publication guidance.", icon: GraduationCap },
    { label: "Grant writing", body: "Proposal framing, budgets, partner roles and review cycles.", icon: CalendarClock },
    { label: "Leadership", body: "Project leadership, team supervision and public engagement.", icon: UsersRound },
  ];
  return (
    <aside className="rounded-lg border border-border bg-white p-5 shadow-sm xl:sticky xl:top-28 xl:self-start">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-secondary">Choose your pathway</p>
      <div className="mt-4 grid gap-3">
        {pathways.map((pathway) => {
          const Icon = pathway.icon;
          return (
            <div key={pathway.label} className="flex gap-3 rounded-lg border border-border p-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                <Icon aria-hidden className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-sm font-semibold text-foreground">{pathway.label}</h2>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">{pathway.body}</p>
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-5 divide-y divide-border">
        {[
          { href: "/training", label: "Training programmes" },
          { href: "/news?tab=-events", label: "Events calendar" },
          { href: "/connect#mentorship", label: "Contact research office" },
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

function getDeadlineState(record: ResearchGenericRecord) {
  const explicit = compactText(record.status);
  if (explicit === "matching") return { label: "Matching", className: "bg-accent text-primary" };
  if (explicit === "active") return { label: "Active", className: "bg-emerald-100 text-emerald-800" };
  if (explicit === "completed") return { label: "Completed", className: "bg-surface-muted text-muted-foreground" };
  const deadline = record.application_deadline ? new Date(String(record.application_deadline)) : null;
  if (!deadline || Number.isNaN(deadline.getTime())) return { label: formatLabel(explicit || "Open"), className: "bg-emerald-100 text-emerald-800" };
  const days = Math.ceil((deadline.getTime() - Date.now()) / 86_400_000);
  if (days < 0) return { label: "Closed", className: "bg-surface-muted text-muted-foreground" };
  if (days <= 14) return { label: "Closing soon", className: "bg-secondary/20 text-secondary" };
  return { label: "Open", className: "bg-emerald-100 text-emerald-800" };
}

function formatCapacity(record: ResearchGenericRecord) {
  return [
    record.max_mentees ? `${record.max_mentees} mentees` : "",
    record.max_mentors ? `${record.max_mentors} mentors` : "",
  ].filter(Boolean).join(" · ");
}

function getActiveFlags(value?: string) {
  if (value === "inactive") return { isActive: false };
  if (value === "featured") return { isActive: true, isFeatured: true };
  return { isActive: true };
}

function MentorshipIllustration() {
  return (
    <svg viewBox="0 0 760 360" className="h-full w-full" role="img" aria-label="Mentorship illustration">
      <circle cx="214" cy="174" r="82" fill="#ffffff" opacity="0.08" />
      <circle cx="548" cy="150" r="104" fill="#00a86b" opacity="0.12" />
      <rect x="144" y="112" width="176" height="124" rx="12" fill="#ffffff" opacity="0.1" stroke="#ffffff" strokeOpacity="0.2" />
      <rect x="398" y="82" width="198" height="184" rx="12" fill="#ffffff" opacity="0.08" stroke="#ffffff" strokeOpacity="0.2" />
      <path d="M178 196 C204 154 256 154 282 196" fill="none" stroke="#f59e0b" strokeWidth="6" strokeLinecap="round" />
      <path d="M430 126 H560 M430 164 H532 M430 202 H570 M430 238 H520" stroke="#ffffff" strokeOpacity="0.34" strokeWidth="6" strokeLinecap="round" />
      <path d="M292 176 C360 126 426 120 498 154" fill="none" stroke="#f59e0b" strokeOpacity="0.55" strokeWidth="3" strokeDasharray="8 10" />
    </svg>
  );
}
