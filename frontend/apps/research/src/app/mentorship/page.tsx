import {
  ResearchPageHero,
  ResearchPageSummary,
} from "../../components/research-page-hero";
import type { Metadata } from "next";
import { ResearchImage } from "../../components/research-image";
import Link from "next/link";
import {
  ArrowRight,
  CalendarClock,
  Filter,
  GraduationCap,
  Search,
  SlidersHorizontal,
  UsersRound,
} from "lucide-react";
import type { ResearchGenericRecord } from "@ksu/api-client/server";
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
  getListPageSize,
} from "../../lib/research-page-model";
import { pageFromSearchParams } from "@ksu/ui/components";
import { ResearchListPagination } from "../../components/research-list-pagination";
import {
  MentorshipTable as MentorshipTableClient,
  type MentorshipRowDto,
} from "../../components/mentorship-table";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Mentorship",
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
  page?: string;
};

const programTypes = [
  "research",
  "career",
  "academic",
  "writing",
  "grant_writing",
  "leadership",
];
const statuses = [
  "draft",
  "accepting_applications",
  "matching",
  "active",
  "completed",
  "suspended",
];
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
  const page = pageFromSearchParams(params);
  const perPage = getListPageSize(12);
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
      page,
      perPage,
      ...activeFlags,
    }),
    getMentorship(),
    getCenters(),
  ]);
  const years = getRecordYears(allMentorship.data);
  const months = getRecordMonths(allMentorship.data, params.year);
  const visibleMentorship = filterRecordsByMonth(
    mentorship.data,
    params.year,
    params.month,
  );
  const featuredMentorship = visibleMentorship.find((item) => item.is_featured);
  const tableMentorship = featuredMentorship
    ? visibleMentorship.filter((item) => item.id !== featuredMentorship.id)
    : visibleMentorship;
  const totalPages = Math.ceil(
    (params.month ? visibleMentorship.length : mentorship.total) /
      mentorship.perPage,
  );
  const tableRows: MentorshipRowDto[] = (
    featuredMentorship ? tableMentorship : visibleMentorship
  ).map((item) => {
    const deadline = getDeadlineState(item);
    return {
      id: String(
        item.id ?? item.slug ?? getRecordTitle(item, "Mentorship programme"),
      ),
      slug: item.slug ? String(item.slug) : null,
      title: getRecordTitle(item, "Mentorship programme"),
      summary: getRecordSummary(item) || compactText(item.benefits) || "",
      image: getRecordImage(
        item,
        "/images/research/verified/multidisciplinary-conference-2026.jpg",
      ),
      type: formatLabel(compactText(item.program_type) || "mentorship"),
      status: formatLabel(compactText(item.status) || "active"),
      deadline: deadline.label,
      cohort: formatDate(item.cohort_start_date) || "Not published",
      capacity: formatCapacity(item) || "Not published",
    };
  });

  return (
    <main id="research-main" className="min-h-screen bg-white">
      <MentorshipPortfolioHero count={visibleMentorship.length} />

      <section className="border-b border-border bg-white px-4 py-6 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
        <div className="mx-auto grid max-w-[1680px] gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="min-w-0">
            <MentorshipFilters
              params={params}
              years={years}
              months={months}
              centers={centers.data}
            />
            {[mentorship.error, allMentorship.error, centers.error]
              .filter(Boolean)
              .map((error) => (
                <div key={error} className="mt-4">
                  <StatusMessage tone="error">{error}</StatusMessage>
                </div>
              ))}
            {featuredMentorship ? (
              <FeaturedMentorship item={featuredMentorship} />
            ) : null}
            {visibleMentorship.length > 0 ? (
              <MentorshipTableClient records={tableRows} />
            ) : (
              <div className="mt-5">
                <StatusMessage>
                  No mentorship programmes match the current filters.
                </StatusMessage>
              </div>
            )}
            {visibleMentorship.length > 0 ? (
              <ResearchListPagination
                page={page}
                totalPages={totalPages}
                total={
                  params.month ? visibleMentorship.length : mentorship.total
                }
                perPage={mentorship.perPage}
                path="/mentorship"
                params={params}
                className="mt-6"
              />
            ) : null}
          </div>
          <ChooseYourPathway />
        </div>
      </section>
    </main>
  );
}

function MentorshipPortfolioHero({ count }: { count: number }) {
  return (
    <>
      <ResearchPageHero
        title="Mentorship"
        eyebrow="Support"
        description="Explore mentorship programmes and opportunities to connect with mentors."
        imageSrc="/images/research/headers/innovation-week-8020.jpg"
        imageAlt="Kisii University Innovation Week"
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Mentorship" }]}
      />
      <ResearchPageSummary
        actions={[]}
        facts={count > 0 ? [{ label: "Programmes", value: count }] : []}
      ></ResearchPageSummary>
    </>
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
    <form
      action="/mentorship"
      className="mb-5 rounded-lg border border-border bg-white p-3 shadow-sm"
    >
      <div className="grid gap-2 lg:grid-cols-[minmax(220px,1fr)_auto_auto_auto]">
        <label className="relative block">
          <Search
            aria-hidden
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/70"
          />
          <input
            name="q"
            defaultValue={params.q ?? ""}
            placeholder="Search programme, requirements, benefits..."
            className="h-11 w-full rounded-md border border-border bg-white pl-9 pr-3 text-sm font-medium text-foreground outline-none ring-primary/20 transition placeholder:text-muted-foreground/70 focus:border-primary focus:ring-4"
          />
        </label>
        <button
          type="submit"
          className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-5 text-sm font-semibold text-white"
        >
          Search
        </button>
        <details className="relative">
          <summary className="inline-flex h-11 cursor-pointer list-none items-center justify-center gap-2 rounded-md border border-border bg-white px-4 text-sm font-semibold text-foreground">
            <Filter aria-hidden className="h-4 w-4" /> Filter
          </summary>
          <div className="absolute right-0 z-20 mt-2 grid w-[320px] gap-3 rounded-lg border border-border bg-white p-4 shadow-xl">
            <SelectField
              name="type"
              label="Type"
              value={params.type}
              options={programTypes}
            />
            <SelectField
              name="status"
              label="Status"
              value={params.status}
              options={statuses}
            />
            <SelectField
              name="year"
              label="Year"
              value={params.year}
              options={years}
            />
            <SelectField
              name="month"
              label="Month"
              value={params.month}
              options={months}
            />
            <SelectField
              name="center"
              label="Center"
              value={params.center}
              options={centers.map((center) => ({
                value: compactText(center.id),
                label: getRecordTitle(center, "Center"),
              }))}
            />
            <SelectField
              name="active"
              label="Active state"
              value={params.active}
              options={["active", "inactive", "featured"]}
            />
          </div>
        </details>
        <details className="relative">
          <summary className="inline-flex h-11 cursor-pointer list-none items-center justify-center gap-2 rounded-md border border-border bg-white px-4 text-sm font-semibold text-foreground">
            <SlidersHorizontal aria-hidden className="h-4 w-4" /> Sort
          </summary>
          <div className="absolute right-0 z-20 mt-2 w-[260px] rounded-lg border border-border bg-white p-4 shadow-xl">
            <SelectField
              name="sort"
              label="Sort"
              value={params.sort}
              options={sortOptions}
              includeBlank={false}
            />
          </div>
        </details>
      </div>
    </form>
  );
}

function FeaturedMentorship({ item }: { item: ResearchGenericRecord }) {
  const href = item.slug ? `/mentorship/${item.slug}` : "/mentorship";
  const summary = getRecordSummary(item) || compactText(item.benefits);
  const imageSrc = getRecordImage(
    item,
    "/images/research/verified/multidisciplinary-conference-2026.jpg",
  );
  return (
    <Link
      href={href}
      className="group mb-5 grid gap-4 rounded-lg border border-primary/25 bg-primary/[0.03] p-4 shadow-sm transition hover:border-primary/45 lg:grid-cols-[minmax(0,1fr)_220px]"
    >
      <div>
        <div className="mb-3 overflow-hidden rounded-lg border border-primary/15 bg-white/80">
          <ResearchImage
            src={imageSrc}
            alt={getRecordTitle(item, "Mentorship programme")}
            width={640}
            height={256}
            className="h-32 w-full object-cover"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge>
            {formatLabel(compactText(item.program_type) || "mentorship")}
          </Badge>
          <DeadlineStatusBadge record={item} />
          <span className="rounded-md bg-primary px-3 py-1 text-xs font-semibold uppercase text-white">
            Featured
          </span>
        </div>
        <h2 className="mt-3 text-balance font-display text-2xl font-semibold leading-tight text-foreground">
          {getRecordTitle(item, "Mentorship programme")}
        </h2>
        {summary ? (
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">
            {summary}
          </p>
        ) : null}
      </div>
      <dl className="grid gap-2 text-sm sm:grid-cols-2 lg:grid-cols-1">
        <MiniFact label="Cohort" value={formatDate(item.cohort_start_date)} />
        <MiniFact label="Capacity" value={formatCapacity(item)} />
      </dl>
    </Link>
  );
}

function DeadlineStatusBadge({ record }: { record: ResearchGenericRecord }) {
  const status = getDeadlineState(record);
  return (
    <span
      className={`inline-flex items-center rounded-md px-3 py-1 text-xs font-semibold uppercase ${status.className}`}
    >
      {status.label}
    </span>
  );
}

function ChooseYourPathway() {
  const pathways = [
    {
      label: "Research",
      body: "Design, ethics, fieldwork, analysis and publication guidance.",
      icon: GraduationCap,
    },
    {
      label: "Grant writing",
      body: "Proposal framing, budgets, partner roles and review cycles.",
      icon: CalendarClock,
    },
    {
      label: "Leadership",
      body: "Project leadership, team supervision and public engagement.",
      icon: UsersRound,
    },
  ];
  return (
    <aside className="rounded-lg border border-border bg-white p-5 shadow-sm xl:sticky xl:top-28 xl:self-start">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-secondary">
        Choose your pathway
      </p>
      <div className="mt-4 grid gap-3">
        {pathways.map((pathway) => {
          const Icon = pathway.icon;
          return (
            <div
              key={pathway.label}
              className="flex gap-3 rounded-lg border border-border p-3"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                <Icon aria-hidden className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-sm font-semibold text-foreground">
                  {pathway.label}
                </h2>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  {pathway.body}
                </p>
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
          <Link
            key={link.href}
            href={link.href}
            className="flex items-center justify-between gap-4 py-3 text-sm font-semibold text-primary"
          >
            {link.label}
            <ArrowRight
              aria-hidden
              className="h-4 w-4 text-muted-foreground/70"
            />
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
      <span className="text-xs font-semibold uppercase text-muted-foreground">
        {label}
      </span>
      <select
        name={name}
        defaultValue={value ?? ""}
        className="mt-2 h-10 w-full rounded-md border border-border bg-white px-3 text-sm font-medium text-foreground"
      >
        {includeBlank ? (
          <option value="">All {label.toLowerCase()}</option>
        ) : null}
        {options.map((option) => {
          const normalized =
            typeof option === "string"
              ? { value: option, label: formatLabel(option) }
              : option;
          if (!normalized.value) return null;
          return (
            <option
              key={`${name}-${normalized.value}`}
              value={normalized.value}
            >
              {normalized.label}
            </option>
          );
        })}
      </select>
    </label>
  );
}

function MiniFact({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="rounded-md bg-white p-2.5">
      <dt className="text-xs font-semibold uppercase text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-1 font-semibold text-foreground">{value}</dd>
    </div>
  );
}

function getRecordImage(record: ResearchGenericRecord, fallback: string) {
  return (
    compactText(record.cover_image_url) ||
    compactText(record.image_url) ||
    fallback
  );
}

function getDeadlineState(record: ResearchGenericRecord) {
  const explicit = compactText(record.status);
  if (explicit === "matching")
    return { label: "Matching", className: "bg-accent text-primary" };
  if (explicit === "active")
    return { label: "Active", className: "bg-emerald-100 text-emerald-800" };
  if (explicit === "completed")
    return {
      label: "Completed",
      className: "bg-surface-muted text-muted-foreground",
    };
  const deadline = record.application_deadline
    ? new Date(String(record.application_deadline))
    : null;
  if (!deadline || Number.isNaN(deadline.getTime()))
    return {
      label: formatLabel(explicit || "Open"),
      className: "bg-emerald-100 text-emerald-800",
    };
  const days = Math.ceil((deadline.getTime() - Date.now()) / 86_400_000);
  if (days < 0)
    return {
      label: "Closed",
      className: "bg-surface-muted text-muted-foreground",
    };
  if (days <= 14)
    return {
      label: "Closing soon",
      className: "bg-secondary/20 text-secondary",
    };
  return { label: "Open", className: "bg-emerald-100 text-emerald-800" };
}

function formatCapacity(record: ResearchGenericRecord) {
  return [
    record.max_mentees ? `${record.max_mentees} mentees` : "",
    record.max_mentors ? `${record.max_mentors} mentors` : "",
  ]
    .filter(Boolean)
    .join(" · ");
}

function getActiveFlags(value?: string) {
  if (value === "inactive") return { isActive: false };
  if (value === "featured") return { isActive: true, isFeatured: true };
  return { isActive: true };
}
