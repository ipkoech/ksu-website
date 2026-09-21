"use client";

import Link from "next/link";
import { CalendarDays, MapPin } from "lucide-react";

export type ConferenceEventDto = {
  id: string;
  title: string;
  slug: string;
  summary?: string | null;
  startDate?: string | null;
  venue?: string | null;
};

export function ConferenceRecords({ events }: { events: ConferenceEventDto[] }) {
  return (
    <div data-server-data-display="web-conferences">
      <p className="mt-4 text-base leading-7 text-muted-foreground sm:text-lg">
        {events.length > 0 ? "These records are loaded from published event data." : "No conference events were returned. Use the official conference portal for current calls and registration."}
      </p>
      {events.length > 0 ? (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <Link key={event.id} href={`/media/events/${event.slug}`} className="group block rounded-lg border border-border bg-white p-5 shadow-sm transition hover:border-primary/30 hover:shadow-md">
              <h3 className="font-[family-name:var(--font-display)] text-lg font-semibold text-foreground group-hover:text-primary">{event.title}</h3>
              {event.summary ? <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">{event.summary}</p> : null}
              <div className="mt-4 flex flex-wrap gap-3 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1.5"><CalendarDays className="h-3.5 w-3.5 text-primary" aria-hidden />{formatDate(event.startDate)}</span>
                {event.venue ? <span className="inline-flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-primary" aria-hidden />{event.venue}</span> : null}
              </div>
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function formatDate(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" }).format(date);
}
