"use client";

import Link from "next/link";

export type NewsEventDto = {
  id: string;
  title: string;
  href: string;
  date: string | null;
  venue: string;
};

export function NewsEventsCalendar({ items }: { items: NewsEventDto[] }) {
  if (items.length === 0) return null;
  const dates = items.map((item) => (item.date ? new Date(item.date) : null));
  const anchor = dates.find((date) => date && !Number.isNaN(date.getTime())) ?? null;
  const year = anchor?.getFullYear();
  const month = anchor?.getMonth();
  const daysInMonth = year !== undefined && month !== undefined ? new Date(year, month + 1, 0).getDate() : 0;
  const firstWeekday = year !== undefined && month !== undefined ? new Date(year, month, 1).getDay() : 0;
  const eventDays = new Set(
    dates.filter((date): date is Date => Boolean(date && !Number.isNaN(date.getTime()) && date.getFullYear() === year && date.getMonth() === month)).map((date) => date.getDate()),
  );

  return (
    <div id="events" data-server-data-display="research-news-events">
      <div className="space-y-4">
        <div className="flex items-end justify-between gap-4">
          <h2 className="font-display text-2xl font-semibold text-foreground">Events calendar</h2>
          <Link href="/news#events" className="text-sm font-semibold text-primary">View all</Link>
        </div>
        <div className="grid gap-4 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
          {anchor ? (
            <div className="rounded-lg border border-border bg-white p-4 shadow-sm">
              <h3 className="text-center text-sm font-semibold text-foreground">{anchor.toLocaleString("en-GB", { month: "long", year: "numeric" })}</h3>
              <div className="mt-4 grid grid-cols-7 gap-1 text-center text-[10px] font-semibold uppercase text-muted-foreground">
                {["S", "M", "T", "W", "T", "F", "S"].map((day, index) => <span key={`${day}-${index}`}>{day}</span>)}
              </div>
              <div className="mt-2 grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground">
                {Array.from({ length: firstWeekday }, (_, index) => <span key={`pad-${index}`} aria-hidden />)}
                {Array.from({ length: daysInMonth }, (_, index) => index + 1).map((day) => <span key={day} className={`flex aspect-square items-center justify-center rounded-full ${eventDays.has(day) ? "bg-primary text-white" : "text-muted-foreground"}`}>{day}</span>)}
              </div>
            </div>
          ) : null}
          <div className="grid gap-3">
            {items.slice(0, 3).map((item) => {
              const date = item.date ? new Date(item.date) : null;
              const valid = date && !Number.isNaN(date.getTime());
              const today = valid && date.toDateString() === new Date().toDateString();
              const past = valid && !today && date.getTime() < Date.now();
              return (
                <Link key={item.id} href={item.href} className="grid grid-cols-[64px_minmax(0,1fr)_auto] items-center gap-3 rounded-lg border border-border bg-white p-3 shadow-sm transition hover:border-primary/30 hover:shadow-md">
                  <div className="overflow-hidden rounded-md border border-primary/15 text-center">
                    <div className={`${today ? "bg-secondary" : "bg-primary"} py-1 text-[10px] font-semibold uppercase text-white`}>{valid ? date.toLocaleString("en-GB", { month: "short" }) : "TBD"}</div>
                    <div className="bg-white py-2 font-display text-2xl font-semibold text-foreground">{valid ? date.getDate() : "—"}</div>
                  </div>
                  <div className="min-w-0"><h3 className="line-clamp-1 font-display text-lg font-semibold leading-6 text-foreground">{item.title}</h3><p className="mt-1 line-clamp-1 text-sm text-muted-foreground">{item.venue}</p></div>
                  <span className={`rounded-md px-2 py-1 text-[10px] font-semibold ${today ? "bg-secondary/10 text-secondary" : past ? "bg-surface-muted text-muted-foreground" : "bg-primary/10 text-primary"}`}>{today ? "Today" : past ? "Past" : "Upcoming"}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
