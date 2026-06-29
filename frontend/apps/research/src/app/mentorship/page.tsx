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
import type { ResearchGenericRecord } from "@ksu/api-client";

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
const activeStates = [
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
  { label: "Featured", value: "featured" },
];
const sortOptions = [
  { value: "application_deadline", label: "Application deadline" },
  { value: "cohort_start_date", label: "Cohort start" },
  { value: "created_at", label: "Newest" },
  { value: "updated_at", label: "Recently updated" },
  { value: "name", label: "Name A-Z" },
  { value: "name_desc", label: "Name Z-A" },
];

export default async function MentorshipPage({
  searchParams,
}: {
  searchParams?: Promise<MentorshipSearchParams>;
}) {
  const params = (await searchParams) ?? {};
  const sort = params.sort || "application_deadline";
  const sortField = sort === "name_desc" ? "name" : sort;
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
  const rowMentorship = featuredMentorship
    ? visibleMentorship.filter((item) => item.id !== featuredMentorship.id)
    : visibleMentorship;

  return (
    <main id="research-main" className="min-h-screen bg-white">
      <MentorshipMasthead
        resultCount={visibleMentorship.length}
        publishedCount={allMentorship.data.length}
        centersCount={centers.data.length}
        programTypesCount={programTypes.length}
      />

      <ResearchSection
        eyebrow="Mentorship Pathways"
        title="Mentorship programmes"
        body="Search public mentorship records and use the filter menu for type, status, active state, center, year, month, and sort order."
        tone="white"
      >
        <MentorshipFilters params={params} years={years} months={months} centers={centers.data} />

        {[mentorship.error, allMentorship.error, centers.error].filter(Boolean).map((error, i) => (
          <div key={i} className="mt-5">
            <StatusMessage tone="error">{error}</StatusMessage>
          </div>
        ))}

        {visibleMentorship.length > 0 ? (
          <>
            {featuredMentorship ? (
              <div className="mt-6">
                <FeaturedMentorship item={featuredMentorship} />
              </div>
            ) : null}
            <div className="mt-6 divide-y divide-slate-200 rounded-lg border border-slate-200 bg-white shadow-sm">
              {rowMentorship.map((item) => (
                <MentorshipRow key={item.id} item={item} />
              ))}
            </div>
          </>
        ) : (
          <div className="mt-7">
            <StatusMessage>No published mentorship programmes match the current filters.</StatusMessage>
          </div>
        )}
      </ResearchSection>
    </main>
  );
}

function MentorshipMasthead({
  resultCount,
  publishedCount,
  centersCount,
  programTypesCount,
}: {
  resultCount: number;
  publishedCount: number;
  centersCount: number;
  programTypesCount: number;
}) {
  const stats = [
    { label: "Mentorship results", value: resultCount },
    { label: "Published mentorship", value: publishedCount },
    { label: "Centers", value: centersCount },
    { label: "Program types", value: programTypesCount },
  ];

  return (
    <section className="border-b border-slate-200 bg-white px-4 py-6 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
      <div className="mx-auto grid max-w-[1680px] gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(320px,520px)] lg:items-end">
        <div>
          <nav className="mb-4 flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500" aria-label="Breadcrumb">
            <Link href="/" className="transition hover:text-primary">Home</Link>
            <span className="text-slate-300">/</span>
            <Link href="/training" className="transition hover:text-primary">Learning</Link>
            <span className="text-slate-300">/</span>
            <span className="text-slate-900">Mentorship</span>
          </nav>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-secondary">
            Learning
          </p>
          <h1 className="mt-3 max-w-5xl text-balance font-[family-name:var(--font-display)] text-3xl font-semibold leading-tight text-slate-950 sm:text-4xl">
            Mentor and mentee pathways for research growth
          </h1>
          <p className="mt-3 max-w-4xl text-pretty text-sm leading-7 text-slate-700 sm:text-base">
            Find structured mentorship programmes for researchers, students, writers, grant applicants, and emerging leaders.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <PrimaryLink href="/training">View training</PrimaryLink>
            <SecondaryLink href="/events">Browse events</SecondaryLink>
          </div>
        </div>
        <dl className="grid gap-2 sm:grid-cols-2">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
              <dt className="text-[11px] font-semibold uppercase text-slate-500">{stat.label}</dt>
              <dd className="mt-1 text-lg font-semibold text-slate-950">{stat.value}</dd>
            </div>
          ))}
        </dl>
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
    <ResearchFilterForm
      action="/mentorship"
      resetHref="/mentorship"
      searchValue={params.q}
      searchPlaceholder="Programme, requirements, benefits"
      selects={[
        { name: "type", label: "Type", value: params.type, options: programTypes },
        { name: "active", label: "Active state", value: params.active, options: activeStates },
        { name: "status", label: "Status", value: params.status, options: statuses },
        { name: "year", label: "Year", value: params.year, options: years },
        { name: "month", label: "Month", value: params.month, options: months },
      ]}
      centers={centers}
      centerValue={params.center}
      sortValue={params.sort ?? "application_deadline"}
      sortOptions={sortOptions}
    />
  );
}

function FeaturedMentorship({ item }: { item: ResearchGenericRecord }) {
  return (
    <Link
      href={item.slug ? `/mentorship/${item.slug}` : "/mentorship"}
      className="group grid gap-4 rounded-lg border border-primary/20 bg-primary/[0.03] p-4 shadow-sm transition hover:border-primary/40 lg:grid-cols-[minmax(0,1fr)_260px_auto] lg:items-center"
    >
      <MentorshipRowContent item={item} featured />
    </Link>
  );
}

function MentorshipRow({ item }: { item: ResearchGenericRecord }) {
  return (
    <ResearchRecordRow
      href={item.slug ? `/mentorship/${item.slug}` : "/mentorship"}
      title={getRecordTitle(item, "Mentorship programme")}
      description={
        getRecordSummary(item) ||
        compactText(item.benefits) ||
        "Mentorship details have not been published yet."
      }
      badges={[item.program_type, item.status]}
      filledBadges={[item.is_featured ? "Featured" : null]}
      facts={[
        { label: "Deadline", value: formatDate(item.application_deadline) },
        { label: "Cohort", value: formatDate(item.cohort_start_date) },
        { label: "Capacity", value: [item.max_mentees ? `${item.max_mentees} mentees` : "", item.max_mentors ? `${item.max_mentors} mentors` : ""].filter(Boolean).join(" · ") },
      ]}
    />
  );
}

function MentorshipRowContent({
  item,
  featured = false,
}: {
  item: ResearchGenericRecord;
  featured?: boolean;
}) {
  return (
    <>
      <div>
        <div className="flex flex-wrap gap-2">
          <Badge>{formatLabel(compactText(item.program_type) || "mentorship")}</Badge>
          {item.status ? <Badge>{formatLabel(item.status)}</Badge> : null}
          {featured || item.is_featured ? <FilledBadge>Featured</FilledBadge> : null}
        </div>
        <h2 className="mt-3 text-lg font-semibold leading-7 text-slate-950">
          {getRecordTitle(item, "Mentorship programme")}
        </h2>
        <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">
          {getRecordSummary(item) ||
            compactText(item.benefits) ||
            "Mentorship details have not been published yet."}
        </p>
      </div>
      <dl className="grid gap-2 text-sm">
        <div className="rounded-md bg-white p-2.5">
          <dt className="text-xs font-semibold uppercase text-slate-500">Deadline</dt>
          <dd className="mt-1 font-semibold text-slate-950">{formatDate(item.application_deadline) || "Not published"}</dd>
        </div>
        <div className="rounded-md bg-white p-2.5">
          <dt className="text-xs font-semibold uppercase text-slate-500">Cohort</dt>
          <dd className="mt-1 font-semibold text-slate-950">{formatDate(item.cohort_start_date) || "Not published"}</dd>
        </div>
      </dl>
      <span className="inline-flex min-h-10 items-center justify-center rounded-md border border-primary/20 px-3 text-sm font-semibold text-primary transition group-hover:bg-primary group-hover:text-white">
        View mentorship
      </span>
    </>
  );
}

function getActiveFlags(value?: string) {
  if (value === "inactive") return { isActive: false };
  if (value === "featured") return { isActive: true, isFeatured: true };
  return { isActive: true };
}
