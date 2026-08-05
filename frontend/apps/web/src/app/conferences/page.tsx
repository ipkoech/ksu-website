import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CalendarDays, MapPin } from "lucide-react";
import { eventsApi } from "@ksu/api-client";
import type { Event } from "@ksu/api-client";
import { CampusPageHeader } from "@ksu/ui/components";
import { PageShell } from "@/components/site-shell";

export const metadata: Metadata = {
  title: "Conferences",
  description:
    "Find conference events, calls for papers, registration links, and multidisciplinary engagement opportunities.",
};

function formatDate(value: string | null | undefined) {
  if (!value) return "";
  const d = new Date(value);
  return isNaN(d.getTime())
    ? value
    : new Intl.DateTimeFormat("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }).format(d);
}

async function fetchEvents(): Promise<Event[]> {
  try {
    const response = await eventsApi.list({
      is_published: true,
      search: "conference",
      per_page: 9,
      fields:
        "id,title,slug,summary,plain_text,rich_text,content,start_date,venue,location,is_virtual",
    });
    return Array.isArray(response.data) ? response.data : [];
  } catch {
    return [];
  }
}

export default async function ConferencesPage() {
  const events = await fetchEvents();
  const hasEvents = events.length > 0;

  return (
    <PageShell>
      <CampusPageHeader
        title="Conferences and calls"
        eyebrow="Conferences"
        description="Find conference events, calls for papers, registration links, and multidisciplinary engagement opportunities."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Conferences" }]}
        seed="/conferences"
      />

      <section className="w-full bg-[linear-gradient(180deg,hsl(var(--surface-subtle))_0%,#ffffff_70%,hsl(var(--surface-muted))_100%)] px-4 py-10 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
        <div className="mx-auto max-w-4xl">
          <div className="mt-0">
            <p className="text-xs font-bold uppercase tracking-[0.08em] text-primary">
              Conference records
            </p>
            <h2 className="mt-4 font-[family-name:var(--font-display)] text-3xl text-foreground sm:text-4xl">
              Published conference events
            </h2>
            <p className="mt-4 text-base leading-7 text-muted-foreground sm:text-lg">
              {hasEvents
                ? "These records are loaded from published event data."
                : "No conference events were returned. Use the official conference portal for current calls and registration."}
            </p>
          </div>

          {hasEvents && (
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {events.map((event) => (
                <Link
                  key={event.id}
                  href={`/media/events/${event.slug}`}
                  className="group block rounded-lg border border-border bg-white p-5 shadow-sm transition hover:border-primary/30 hover:shadow-md"
                >
                  <h3 className="font-[family-name:var(--font-display)] text-lg font-semibold text-foreground group-hover:text-primary">
                    {event.title}
                  </h3>
                  {event.summary && (
                    <p className="mt-2 text-sm leading-6 text-muted-foreground line-clamp-2">
                      {event.summary}
                    </p>
                  )}
                  <div className="mt-4 flex flex-wrap gap-3 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5">
                      <CalendarDays
                        className="h-3.5 w-3.5 text-primary"
                        aria-hidden
                      />
                      {formatDate(event.start_date)}
                    </span>
                    {event.venue && (
                      <span className="inline-flex items-center gap-1.5">
                        <MapPin
                          className="h-3.5 w-3.5 text-primary"
                          aria-hidden
                        />
                        {event.venue}
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}

          <div className="mt-14 rounded-lg border border-primary/20 bg-primary/5 p-6 sm:p-8">
            <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-foreground">
              Open conference portal
            </h2>
            <p className="mt-3 text-base leading-7 text-muted-foreground">
              Visit the official Kisii University digital conference portal for
              current calls for papers, registration, and ongoing conference
              activities.
            </p>
            <a
              href="https://digital.kisiiuniversity.ac.ke/conferences"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary/90"
            >
              Go to conference portal
              <ArrowRight className="h-4 w-4" aria-hidden />
            </a>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
