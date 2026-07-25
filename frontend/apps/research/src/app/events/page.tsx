import type { Metadata } from "next";
import Link from "next/link";
import { ResearchSidePanel } from "../../components/research-detail";
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
  getEvents,
  getEventsFiltered,
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
  title: "Research Events",
  description: "Research events, workshops, forums, and conferences.",
};

type EventSearchParams = {
  q?: string;
  type?: string;
  status?: string;
  active?: string;
  category?: string;
  center?: string;
  year?: string;
  month?: string;
  sort?: string;
};

const eventTypes = ["conference", "seminar", "workshop", "webinar", "symposium", "colloquium", "defense", "lecture"];
const statuses = ["upcoming", "ongoing", "completed", "cancelled", "postponed", "draft"];
const activeStates = [
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
  { label: "Featured", value: "featured" },
];
const sortOptions = [
  { label: "Start date", value: "start_date" },
  { label: "Newest", value: "created_at" },
  { label: "Recently updated", value: "updated_at" },
  { label: "Title A-Z", value: "title" },
  { label: "Title Z-A", value: "title_desc" },
];

export default async function EventsPage({
  searchParams,
}: {
  searchParams?: Promise<EventSearchParams>;
}) {
  const params = (await searchParams) ?? {};
  const sort = params.sort || "start_date";
  const sortField = sort === "title_desc" ? "title" : sort;
  const order = sort === "title" ? "asc" : "desc";
  const activeFlags = getActiveFlags(params.active);
  const [events, allEvents, centers] = await Promise.all([
    getEventsFiltered({
      search: params.q,
      eventType: params.type,
      status: params.status,
      category: params.category,
      centerId: params.center,
      year: params.year,
      sort: sortField,
      order,
      ...activeFlags,
    }),
    getEvents(),
    getCenters(),
  ]);
  const years = getRecordYears(allEvents.data);
  const months = getRecordMonths(allEvents.data, params.year);
  const visibleEvents = filterRecordsByMonth(events.data, params.year, params.month);
  const featuredEvent = visibleEvents.find((event) => event.is_featured);
  const rowEvents = featuredEvent
    ? visibleEvents.filter((event) => event.id !== featuredEvent.id)
    : visibleEvents;

  return (
    <main id="research-main" className="min-h-screen bg-white">
      <EventsMasthead
        resultCount={visibleEvents.length}
        publishedCount={allEvents.data.length}
        centersCount={centers.data.length}
        eventTypesCount={eventTypes.length}
      />

      <ResearchSection
        eyebrow="Research Calendar"
        title="Events"
        body="Search public events and use the filter menu for type, status, active state, center, category, year, month, and sort order."
        tone="white"
      >
        <EventFilters params={params} years={years} months={months} centers={centers.data} />

        {[events.error, allEvents.error, centers.error]
          .filter(Boolean)
          .map((error, i) => (
            <div key={i} className="mt-5">
              <StatusMessage tone="error">{error}</StatusMessage>
            </div>
          ))}

        {visibleEvents.length > 0 ? (
          <div className="mt-6 grid gap-5 lg:grid-cols-[340px_minmax(0,1fr)]">
            <CalendarRail events={visibleEvents} />
            <div>
              {featuredEvent ? (
                <div className="mb-6">
                  <FeaturedEvent event={featuredEvent} />
                </div>
              ) : null}
              <div className="divide-y divide-slate-200 rounded-lg border border-border bg-white shadow-sm">
                {rowEvents.map((event) => (
                  <EventRow key={event.id} event={event} />
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-7">
            <StatusMessage>No published events match the current filters.</StatusMessage>
          </div>
        )}
      </ResearchSection>
    </main>
  );
}

function EventsMasthead({
  resultCount,
  publishedCount,
  centersCount,
  eventTypesCount,
}: {
  resultCount: number;
  publishedCount: number;
  centersCount: number;
  eventTypesCount: number;
}) {
  const stats = [
    { label: "Event results", value: resultCount },
    { label: "Published events", value: publishedCount },
    { label: "Centers", value: centersCount },
    { label: "Event types", value: eventTypesCount },
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
            <span className="text-foreground">Events</span>
          </nav>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-secondary">
            Events
          </p>
          <h1 className="mt-3 max-w-5xl text-balance font-[family-name:var(--font-display)] text-3xl font-semibold leading-tight text-foreground sm:text-4xl">
            Research workshops, forums, seminars, and conferences
          </h1>
          <p className="mt-3 max-w-4xl text-pretty text-sm leading-7 text-muted-foreground sm:text-base">
            Browse the public research calendar by event type, date, center, venue, platform, and registration status.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <PrimaryLink href="/news">View news</PrimaryLink>
            <SecondaryLink href="/training">Explore training</SecondaryLink>
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

function EventFilters({
  params,
  years,
  months,
  centers,
}: {
  params: EventSearchParams;
  years: string[];
  months: Array<{ value: string; label: string }>;
  centers: ResearchGenericRecord[];
}) {
  return (
    <ResearchFilterForm
      action="/events"
      resetHref="/events"
      searchValue={params.q}
      searchPlaceholder="Title, speaker, venue, agenda"
      selects={[
        { name: "type", label: "Type", value: params.type, options: eventTypes },
        { name: "active", label: "Active state", value: params.active, options: activeStates },
        { name: "status", label: "Status", value: params.status, options: statuses },
        { name: "year", label: "Year", value: params.year, options: years },
        { name: "month", label: "Month", value: params.month, options: months },
      ]}
      textFilters={[
        { name: "category", label: "Category", value: params.category, placeholder: "Category" },
      ]}
      centers={centers}
      centerValue={params.center}
      sortValue={params.sort}
      sortOptions={sortOptions}
    />
  );
}

function CalendarRail({ events }: { events: ResearchGenericRecord[] }) {
  return (
    <ResearchSidePanel title="Calendar view" eyebrow="Events">
      <div className="divide-y divide-slate-200">
        {events.slice(0, 8).map((event) => (
          <article key={event.id} className="py-4 first:pt-0 last:pb-0">
            <p className="text-xs font-semibold uppercase text-secondary">
              {formatDate(event.start_date) || formatDate(event.event_date)}
            </p>
            <h3 className="mt-1 text-sm font-semibold leading-6 text-foreground">
              {getRecordTitle(event, "Research event")}
            </h3>
            <p className="mt-1 text-xs font-semibold uppercase text-muted-foreground">
              {formatLabel(event.event_type ?? event.status)}
            </p>
          </article>
        ))}
      </div>
    </ResearchSidePanel>
  );
}

function FeaturedEvent({ event }: { event: ResearchGenericRecord }) {
  return (
    <Link
      href={event.slug ? `/events/${event.slug}` : "/events"}
      className="group grid gap-4 rounded-lg border border-primary/20 bg-primary/[0.03] p-4 shadow-sm transition hover:border-primary/40 lg:grid-cols-[minmax(0,1fr)_260px_auto] lg:items-center"
    >
      <EventRowContent event={event} featured />
    </Link>
  );
}

function EventRow({ event }: { event: ResearchGenericRecord }) {
  const mode = getEventMode(event);
  return (
    <ResearchRecordRow
      href={event.slug ? `/events/${event.slug}` : "/events"}
      title={getRecordTitle(event, "Research event")}
      description={
        getRecordSummary(event) ||
        compactText(event.agenda) ||
        "Event details have not been published yet."
      }
      badges={[event.event_type, mode, event.status]}
      filledBadges={[event.is_featured ? "Featured" : null]}
      facts={[
        { label: "Date", value: formatDate(event.start_date) || formatDate(event.event_date) },
        { label: "Venue", value: compactText(event.venue) || compactText(event.platform) },
        { label: "Registration", value: formatDate(event.registration_deadline) },
      ]}
    />
  );
}

function EventRowContent({
  event,
  featured = false,
}: {
  event: ResearchGenericRecord;
  featured?: boolean;
}) {
  const mode = getEventMode(event);
  return (
    <>
      <div>
        <div className="flex flex-wrap gap-2">
          <Badge>{formatLabel(compactText(event.event_type) || "event")}</Badge>
          <Badge>{mode}</Badge>
          {featured || event.is_featured ? <FilledBadge>Featured</FilledBadge> : null}
        </div>
        <h2 className="mt-3 text-lg font-semibold leading-7 text-foreground">
          {getRecordTitle(event, "Research event")}
        </h2>
        <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">
          {getRecordSummary(event) ||
            compactText(event.agenda) ||
            "Event details have not been published yet."}
        </p>
      </div>
      <dl className="grid gap-2 text-sm">
        <div className="rounded-md bg-white p-2.5">
          <dt className="text-xs font-semibold uppercase text-muted-foreground">Date</dt>
          <dd className="mt-1 font-semibold text-foreground">{formatDate(event.start_date) || formatDate(event.event_date) || "Not published"}</dd>
        </div>
        <div className="rounded-md bg-white p-2.5">
          <dt className="text-xs font-semibold uppercase text-muted-foreground">Venue</dt>
          <dd className="mt-1 font-semibold text-foreground">{compactText(event.venue) || compactText(event.platform) || "Not published"}</dd>
        </div>
      </dl>
      <span className="inline-flex min-h-10 items-center justify-center rounded-md border border-primary/20 px-3 text-sm font-semibold text-primary transition group-hover:bg-primary group-hover:text-white">
        View event
      </span>
    </>
  );
}

function getEventMode(event: ResearchGenericRecord) {
  if (event.is_hybrid) return "Hybrid";
  if (event.is_virtual) return "Online";
  return "In person";
}

function getActiveFlags(value?: string) {
  if (value === "inactive") return { isActive: false };
  if (value === "featured") return { isActive: true, isFeatured: true };
  return { isActive: true };
}
