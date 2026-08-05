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
  getTraining,
  getTrainingFiltered,
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
  title: "Training Programs",
  description: "Research training programmes, workshops, and bootcamps.",
};

type TrainingSearchParams = {
  q?: string;
  type?: string;
  mode?: string;
  category?: string;
  status?: string;
  active?: string;
  center?: string;
  year?: string;
  month?: string;
  sort?: string;
};

const programTypes = ["workshop", "course", "seminar", "webinar", "bootcamp", "conference", "retreat"];
const deliveryModes = ["in_person", "online", "hybrid"];
const categories = ["research_methods", "writing", "grant_writing", "data_analysis", "leadership", "ethics", "career"];
const statuses = ["draft", "published", "ongoing", "completed", "cancelled", "postponed"];
const activeStates = [
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
  { label: "Featured", value: "featured" },
];
const sortOptions = [
  { value: "start_date", label: "Start date" },
  { value: "registration_deadline", label: "Registration deadline" },
  { value: "created_at", label: "Newest" },
  { value: "updated_at", label: "Recently updated" },
  { value: "title", label: "Title A-Z" },
  { value: "title_desc", label: "Title Z-A" },
];

export default async function TrainingPage({
  searchParams,
}: {
  searchParams?: Promise<TrainingSearchParams>;
}) {
  const params = (await searchParams) ?? {};
  const sort = params.sort || "start_date";
  const sortField = sort === "title_desc" ? "title" : sort;
  const order = sort === "title" ? "asc" : "desc";
  const activeFlags = getActiveFlags(params.active);
  const [training, allTraining, centers] = await Promise.all([
    getTrainingFiltered({
      search: params.q,
      programType: params.type,
      deliveryMode: params.mode,
      category: params.category,
      status: params.status,
      centerId: params.center,
      year: params.year,
      sort: sortField,
      order,
      ...activeFlags,
    }),
    getTraining(),
    getCenters(),
  ]);
  const years = getRecordYears(allTraining.data);
  const months = getRecordMonths(allTraining.data, params.year);
  const visibleTraining = filterRecordsByMonth(training.data, params.year, params.month);
  const featuredTraining = visibleTraining.find((item) => item.is_featured);
  const rowTraining = featuredTraining
    ? visibleTraining.filter((item) => item.id !== featuredTraining.id)
    : visibleTraining;

  return (
    <main id="research-main" className="min-h-screen bg-white">
      <TrainingMasthead
        resultCount={visibleTraining.length}
        publishedCount={allTraining.data.length}
        centersCount={centers.data.length}
        deliveryModesCount={deliveryModes.length}
      />

      <ResearchSection
        eyebrow="Training Catalogue"
        title="Training programs"
        body="Search public training records and use the filter menu for type, mode, category, active state, status, center, year, month, and sort order."
        tone="white"
      >
        <TrainingFilters params={params} years={years} months={months} centers={centers.data} />

        {[training.error, allTraining.error, centers.error].filter(Boolean).map((error) => (
          <div key={error} className="mt-5">
            <StatusMessage tone="error">{error}</StatusMessage>
          </div>
        ))}

        {visibleTraining.length > 0 ? (
          <>
            {featuredTraining ? (
              <div className="mt-6">
                <FeaturedTraining item={featuredTraining} />
              </div>
            ) : null}
            <div className="mt-6 divide-y divide-border rounded-lg border border-border bg-white shadow-sm">
              {rowTraining.map((item) => (
                <TrainingRow key={item.id} item={item} />
              ))}
            </div>
          </>
        ) : (
          <div className="mt-7">
            <StatusMessage>No published training programs match the current filters.</StatusMessage>
          </div>
        )}
      </ResearchSection>
    </main>
  );
}

function TrainingMasthead({
  resultCount,
  publishedCount,
  centersCount,
  deliveryModesCount,
}: {
  resultCount: number;
  publishedCount: number;
  centersCount: number;
  deliveryModesCount: number;
}) {
  const stats = [
    { label: "Training results", value: resultCount },
    { label: "Published training", value: publishedCount },
    { label: "Centers", value: centersCount },
    { label: "Delivery modes", value: deliveryModesCount },
  ];

  return (
    <section className="border-b border-border bg-white px-4 py-6 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
      <div className="mx-auto grid max-w-[1680px] gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(320px,520px)] lg:items-end">
        <div>
          <nav className="mb-4 flex flex-wrap items-center gap-2 text-xs font-semibold text-muted-foreground" aria-label="Breadcrumb">
            <Link href="/" className="transition hover:text-primary">Home</Link>
            <span className="text-muted-foreground/60">/</span>
            <Link href="/training" className="transition hover:text-primary">Learning</Link>
            <span className="text-muted-foreground/60">/</span>
            <span className="text-foreground">Training</span>
          </nav>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-secondary">
            Learning
          </p>
          <h1 className="mt-3 max-w-5xl text-balance font-[family-name:var(--app-font-display)] text-3xl font-semibold leading-tight text-foreground sm:text-4xl">
            Research training, workshops, seminars, and bootcamps
          </h1>
          <p className="mt-3 max-w-4xl text-pretty text-sm leading-7 text-muted-foreground sm:text-base">
            Find research methods, writing, ethics, grant writing, data, innovation, and leadership capacity-building programmes.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <PrimaryLink href="/events">View events</PrimaryLink>
            <SecondaryLink href="/mentorship">Explore mentorship</SecondaryLink>
          </div>
        </div>
        <dl className="grid gap-2 sm:grid-cols-2">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-md border border-border bg-surface-subtle px-3 py-2">
              <dt className="text-[11px] font-semibold uppercase text-muted-foreground">{stat.label}</dt>
              <dd className="mt-1 text-lg font-semibold text-foreground">{stat.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

function TrainingFilters({
  params,
  years,
  months,
  centers,
}: {
  params: TrainingSearchParams;
  years: string[];
  months: Array<{ value: string; label: string }>;
  centers: ResearchGenericRecord[];
}) {
  return (
    <ResearchFilterForm
      action="/training"
      resetHref="/training"
      searchValue={params.q}
      searchPlaceholder="Title, curriculum, audience"
      selects={[
        { name: "type", label: "Type", value: params.type, options: programTypes },
        { name: "mode", label: "Mode", value: params.mode, options: deliveryModes },
        { name: "category", label: "Category", value: params.category, options: categories },
        { name: "active", label: "Active state", value: params.active, options: activeStates },
        { name: "status", label: "Status", value: params.status, options: statuses },
        { name: "year", label: "Year", value: params.year, options: years },
        { name: "month", label: "Month", value: params.month, options: months },
      ]}
      centers={centers}
      centerValue={params.center}
      sortValue={params.sort ?? "start_date"}
      sortOptions={sortOptions}
    />
  );
}

function FeaturedTraining({ item }: { item: ResearchGenericRecord }) {
  return (
    <Link
      href={item.slug ? `/training/${item.slug}` : "/training"}
      className="group grid gap-4 rounded-lg border border-primary/20 bg-primary/[0.03] p-4 shadow-sm transition hover:border-primary/40 lg:grid-cols-[minmax(0,1fr)_260px_auto] lg:items-center"
    >
      <TrainingRowContent item={item} featured />
    </Link>
  );
}

function TrainingRow({ item }: { item: ResearchGenericRecord }) {
  return (
    <ResearchRecordRow
      href={item.slug ? `/training/${item.slug}` : "/training"}
      title={getRecordTitle(item, "Training program")}
      description={
        getRecordSummary(item) ||
        compactText(item.target_audience) ||
        "Training details have not been published yet."
      }
      badges={[item.program_type, item.delivery_mode, item.status]}
      filledBadges={[item.offers_certificate ? "Certificate" : null, item.is_featured ? "Featured" : null]}
      facts={[
        { label: "Starts", value: formatDate(item.start_date) },
        { label: "Registration", value: formatDate(item.registration_deadline) },
        { label: "Mode", value: formatLabel(item.delivery_mode) },
      ]}
    />
  );
}

function TrainingRowContent({
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
          <Badge>{formatLabel(compactText(item.program_type) || "training")}</Badge>
          {item.delivery_mode ? <Badge>{formatLabel(item.delivery_mode)}</Badge> : null}
          {item.offers_certificate ? <FilledBadge>Certificate</FilledBadge> : null}
          {featured || item.is_featured ? <FilledBadge>Featured</FilledBadge> : null}
        </div>
        <h2 className="mt-3 text-lg font-semibold leading-7 text-foreground">
          {getRecordTitle(item, "Training program")}
        </h2>
        <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">
          {getRecordSummary(item) ||
            compactText(item.target_audience) ||
            "Training details have not been published yet."}
        </p>
      </div>
      <dl className="grid gap-2 text-sm">
        <div className="rounded-md bg-white p-2.5">
          <dt className="text-xs font-semibold uppercase text-muted-foreground">Starts</dt>
          <dd className="mt-1 font-semibold text-foreground">{formatDate(item.start_date) || "Not published"}</dd>
        </div>
        <div className="rounded-md bg-white p-2.5">
          <dt className="text-xs font-semibold uppercase text-muted-foreground">Registration</dt>
          <dd className="mt-1 font-semibold text-foreground">{formatDate(item.registration_deadline) || "Not published"}</dd>
        </div>
      </dl>
      <span className="inline-flex min-h-10 items-center justify-center rounded-md border border-primary/20 px-3 text-sm font-semibold text-primary transition group-hover:bg-primary group-hover:text-white">
        View training
      </span>
    </>
  );
}

function getActiveFlags(value?: string) {
  if (value === "inactive") return { isActive: false };
  if (value === "featured") return { isActive: true, isFeatured: true };
  return { isActive: true };
}
