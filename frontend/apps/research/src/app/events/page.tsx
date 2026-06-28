import type { Metadata } from "next";
import Link from "next/link";
import { BookOpenCheck, CalendarDays, Newspaper, Users } from "lucide-react";
import { ResearchClusterHero } from "../../components/research-cluster";
import { ResearchFact, ResearchSidePanel } from "../../components/research-detail";
import { ResearchFilterForm } from "../../components/research-listing";
import { Badge, FilledBadge, ResearchSection, StatusMessage } from "../../components/research-ui";
import { compactText, formatDate, formatLabel, getCenters, getEvents, getEventsFiltered } from "../../lib/research-public-data";
import type { ResearchGenericRecord } from "@ksu/api-client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Research Events",
  description: "Research events, workshops, forums, and conferences.",
};

type EventSearchParams = { q?: string; type?: string; status?: string; category?: string; center?: string; year?: string; sort?: string };
const eventTypes = ["conference", "seminar", "workshop", "webinar", "symposium", "colloquium", "defense", "lecture"];
const statuses = ["upcoming", "ongoing", "completed", "cancelled", "postponed", "draft"];

const learningLinks = [
  { label: "Training", href: "/training", description: "Workshops, courses, bootcamps, and seminars.", icon: BookOpenCheck },
  { label: "Mentorship", href: "/mentorship", description: "Mentor and mentee pathways for research growth.", icon: Users },
  { label: "Events", href: "/events", description: "Public calendar for forums, workshops, and conferences.", icon: CalendarDays },
  { label: "News", href: "/news", description: "Research updates, notices, stories, and articles.", icon: Newspaper },
];

export default async function EventsPage({ searchParams }: { searchParams?: Promise<EventSearchParams> }) {
  const params = (await searchParams) ?? {};
  const [events, allEvents, centers] = await Promise.all([
    getEventsFiltered({
      search: params.q,
      eventType: params.type,
      status: params.status,
      category: params.category,
      centerId: params.center,
      year: params.year,
      sort: params.sort || "start_date",
      order: params.sort === "title" ? "asc" : "desc",
    }),
    getEvents(),
    getCenters(),
  ]);

  return (
    <main id="research-main" className="min-h-screen bg-white">
      <ResearchClusterHero eyebrow="Events" title="Research workshops, forums, seminars, and conferences." body="Browse the public research calendar by type, status, center, year, and format cues." breadcrumbs={[{ label: "Home", href: "/" }, { label: "Learning", href: "/training" }, { label: "Events" }]} imageSrc="/images/research/research-events-hero.svg" imageAlt="Research events, forums, workshops, seminars, and conference activity" links={learningLinks} primaryAction={{ label: "View news", href: "/news" }} stats={[{ label: "Event results", value: events.data.length }, { label: "Published events", value: allEvents.data.length }, { label: "Centers", value: centers.data.length }, { label: "Event types", value: eventTypes.length }]} />
      <ResearchSection eyebrow="Calendar" title="Research events" body="Browse events by type, status, center, year, category, and format." tone="white">
        <EventFilters params={params} years={getYears(allEvents.data)} centers={centers.data} />
        {[events.error, allEvents.error, centers.error].filter(Boolean).map((error) => <div key={error} className="mt-5"><StatusMessage tone="error">{error}</StatusMessage></div>)}
        {events.data.length > 0 ? <div className="mt-7 grid gap-5 lg:grid-cols-[360px_minmax(0,1fr)]"><CalendarRail events={events.data} /><div className="grid gap-5 md:grid-cols-2">{events.data.map((event) => <EventCard key={event.id} event={event} />)}</div></div> : <div className="mt-7"><StatusMessage>No events match the current filters.</StatusMessage></div>}
      </ResearchSection>
    </main>
  );
}

function EventFilters({ params, years, centers }: { params: EventSearchParams; years: string[]; centers: ResearchGenericRecord[] }) {
  return (
    <ResearchFilterForm
      action="/events"
      resetHref="/events"
      searchValue={params.q}
      searchPlaceholder="Title, speaker, venue, agenda"
      selects={[
        { name: "type", label: "Type", value: params.type, options: eventTypes },
        { name: "status", label: "Status", value: params.status, options: statuses },
        { name: "year", label: "Year", value: params.year, options: years },
      ]}
      textFilters={[
        { name: "category", label: "Category", value: params.category, placeholder: "Category" },
      ]}
      centers={centers}
      centerValue={params.center}
      sortValue={params.sort}
      sortOptions={[
        { value: "start_date", label: "Start date" },
        { value: "created_at", label: "Newest" },
        { value: "title", label: "Title" },
      ]}
    />
  );
}

function CalendarRail({ events }: { events: ResearchGenericRecord[] }) {
  return (
    <ResearchSidePanel title="Upcoming view" eyebrow="Calendar">
      <div className="divide-y divide-slate-200">
        {events.slice(0, 8).map((event) => (
          <article key={event.id} className="py-4 first:pt-0 last:pb-0">
            <p className="text-xs font-semibold uppercase text-secondary">
              {formatDate(event.start_date)}
            </p>
            <h3 className="mt-1 text-sm font-semibold leading-6 text-slate-950">
              {event.title}
            </h3>
            <p className="mt-1 text-xs font-semibold uppercase text-slate-500">
              {formatLabel(event.event_type ?? event.status)}
            </p>
          </article>
        ))}
      </div>
    </ResearchSidePanel>
  );
}

function EventCard({ event }: { event: ResearchGenericRecord }) {
  const mode = event.is_hybrid ? "Hybrid" : event.is_virtual ? "Online" : "In person";
  return (
    <Link href={event.slug ? `/events/${event.slug}` : "/events"} className="block rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:border-primary/30 hover:shadow-[0_22px_60px_-42px_rgba(15,23,42,0.45)]">
      <div className="flex flex-wrap gap-2"><Badge>{formatLabel(event.event_type ?? "event")}</Badge><Badge>{mode}</Badge>{event.is_featured ? <FilledBadge>Featured</FilledBadge> : null}</div>
      <h2 className="mt-4 text-xl font-semibold leading-7 text-slate-950">{event.title}</h2>
      <p className="mt-3 text-sm leading-7 text-slate-600">{compactText(event.summary) || compactText(event.description) || compactText(event.agenda) || "Event details will appear when published."}</p>
      <dl className="mt-5 grid grid-cols-2 gap-3 text-sm"><ResearchFact label="Date" value={formatDate(event.start_date)} /><ResearchFact label="Venue" value={compactText(event.venue) || compactText(event.platform)} /></dl>
    </Link>
  );
}

function getYears(records: ResearchGenericRecord[]) {
  const years = records.flatMap((record) => [record.start_date, record.end_date, record.created_at]).map((value) => value ? new Date(value).getFullYear() : null).filter((year): year is number => Boolean(year) && !Number.isNaN(year));
  return Array.from(new Set(years)).sort((a, b) => b - a).map(String);
}
