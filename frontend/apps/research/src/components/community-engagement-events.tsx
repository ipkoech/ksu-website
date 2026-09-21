"use client";

import Link from "next/link";
import { CalendarDays, MapPin } from "lucide-react";
import { Badge } from "./research-ui";

export type CommunityEventDto = {
  id: string;
  title: string;
  href: string;
  month: string;
  day: string;
  venue: string;
  status: string | null;
};

export function CommunityEngagementEvents({ events }: { events: CommunityEventDto[] }) {
  return (
    <section className="rounded-lg border border-border bg-white p-4 shadow-sm" data-server-data-display="research-community-events">
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-semibold text-foreground">Public engagement events</h2>
        </div>
        <Link href="/news?tab=-events" className="inline-flex items-center gap-2 text-sm font-semibold text-primary">View all</Link>
      </div>
      {events.length > 0 ? (
        <div className="grid gap-2">
          {events.map((event) => (
            <Link key={event.id} href={event.href} className="grid grid-cols-[64px_minmax(0,1fr)] gap-3 rounded-lg border border-border p-3 transition hover:border-primary/35">
              <time className="flex h-16 flex-col items-center justify-center rounded-md bg-primary/10 text-primary">
                <span className="text-[10px] font-bold uppercase">{event.month}</span>
                <span className="text-2xl font-semibold">{event.day}</span>
              </time>
              <div className="min-w-0">
                <h3 className="line-clamp-2 text-sm font-semibold leading-5 text-foreground">{event.title}</h3>
                <p className="mt-1 flex items-center gap-1 line-clamp-1 text-xs text-muted-foreground">
                  <MapPin aria-hidden className="h-3.5 w-3.5" />
                  {event.venue}
                </p>
                {event.status ? <Badge>{event.status}</Badge> : null}
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <p className="rounded-md border border-dashed border-border p-4 text-sm text-muted-foreground">No public engagement events are published.</p>
      )}
      <div className="mt-4 flex flex-wrap gap-4 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-primary" />Event day</span>
        <CalendarDays aria-hidden className="h-4 w-4 text-primary" />
      </div>
    </section>
  );
}
