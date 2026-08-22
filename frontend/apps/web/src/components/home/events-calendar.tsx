"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, MapPin } from "lucide-react";
import { cn } from "@ksu/ui/lib/utils";
import { focusVisibleStyles } from "@ksu/ui/motion";
import type { HomeEventCard } from "@/lib/homepage-data";

/**
 * Parse "YYYY-MM-DD" into a local date.
 *
 * `new Date("2026-08-20")` is parsed as UTC midnight, which lands on the 19th
 * for anyone west of Greenwich and on the 20th here. Splitting the parts and
 * building a local date keeps a calendar cell showing the day the record
 * actually names.
 */
function parseDay(value?: string | null): Date | null {
  if (!value) return null;
  const [datePart] = value.split("T");
  const [y, m, d] = datePart.split("-").map(Number);
  if (!y || !m || !d) return null;
  const date = new Date(y, m - 1, d);
  return Number.isNaN(date.getTime()) ? null : date;
}

const key = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

const monthLabel = new Intl.DateTimeFormat("en-KE", {
  month: "long",
  year: "numeric",
});
const dayLabel = new Intl.DateTimeFormat("en-KE", {
  weekday: "long",
  day: "numeric",
  month: "long",
});
/** Monday-first, matching the Kenyan academic week. */
const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

/** Every day an event covers, so a multi-day event marks its whole run. */
function daysCovered(event: HomeEventCard): string[] {
  const start = parseDay(event.startDate);
  if (!start) return [];
  const end = parseDay(event.endDate) ?? start;
  const days: string[] = [];
  const cursor = new Date(start);
  // Bounded: a mis-entered end date must not spin this loop.
  for (let i = 0; i < 31 && cursor <= end; i += 1) {
    days.push(key(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return days;
}

export interface EventsCalendarProps {
  events: HomeEventCard[];
  /** Server-rendered "today", so the first paint matches on both sides. */
  todayIso: string;
}

export function EventsCalendar({ events, todayIso }: EventsCalendarProps) {
  // Memoised: a fresh Date on every render would invalidate the memos below.
  const today = useMemo(() => parseDay(todayIso) ?? new Date(), [todayIso]);

  const byDay = useMemo(() => {
    const map = new Map<string, HomeEventCard[]>();
    for (const event of events) {
      for (const day of daysCovered(event)) {
        map.set(day, [...(map.get(day) ?? []), event]);
      }
    }
    return map;
  }, [events]);

  // Open on the month holding the next event, not on an empty current month.
  const firstEventDay = useMemo(() => {
    const days = [...byDay.keys()].sort();
    return days.find((d) => d >= key(today)) ?? days[0] ?? null;
  }, [byDay, today]);

  const initial = firstEventDay ? parseDay(firstEventDay)! : today;
  const [cursor, setCursor] = useState(
    new Date(initial.getFullYear(), initial.getMonth(), 1),
  );
  const [selected, setSelected] = useState<string | null>(firstEventDay);

  const grid = useMemo(() => {
    const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
    // getDay() is Sunday-based; shift so Monday is column 0.
    const lead = (first.getDay() + 6) % 7;
    const start = new Date(first);
    start.setDate(first.getDate() - lead);
    return Array.from({ length: 42 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    });
  }, [cursor]);

  const selectedEvents = selected ? (byDay.get(selected) ?? []) : [];
  const shiftMonth = (delta: number) =>
    setCursor(
      (current) =>
        new Date(current.getFullYear(), current.getMonth() + delta, 1),
    );

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)] lg:gap-10">
      {/* Month grid */}
      <div className="min-w-0">
        <div className="flex items-center justify-between gap-4">
          <h4 className="ksu-l-card font-normal" aria-live="polite">
            {monthLabel.format(cursor)}
          </h4>
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => shiftMonth(-1)}
              aria-label={`Previous month, ${monthLabel.format(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}`}
              className={cn(
                "flex h-11 w-11 items-center justify-center rounded-md text-brand-overlay/60 transition-colors hover:bg-[hsl(var(--primary-soft))] hover:text-primary",
                focusVisibleStyles.primary,
              )}
            >
              <ChevronLeft className="h-4 w-4" aria-hidden />
            </button>
            <button
              type="button"
              onClick={() => shiftMonth(1)}
              aria-label={`Next month, ${monthLabel.format(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}`}
              className={cn(
                "flex h-11 w-11 items-center justify-center rounded-md text-brand-overlay/60 transition-colors hover:bg-[hsl(var(--primary-soft))] hover:text-primary",
                focusVisibleStyles.primary,
              )}
            >
              <ChevronRight className="h-4 w-4" aria-hidden />
            </button>
          </div>
        </div>

        <table className="mt-4 w-full table-fixed border-separate border-spacing-1">
          <caption className="sr-only">
            Events at Kisii University, {monthLabel.format(cursor)}. Days with
            events are buttons.
          </caption>
          <thead>
            <tr>
              {WEEKDAYS.map((d) => (
                <th
                  key={d}
                  scope="col"
                  className="ksu-l-small pb-1 font-medium text-brand-overlay/45"
                >
                  <span aria-hidden>{d.slice(0, 1)}</span>
                  <span className="sr-only">{d}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 6 }, (_, week) => (
              <tr key={week}>
                {grid.slice(week * 7, week * 7 + 7).map((day) => {
                  const dk = key(day);
                  const outside = day.getMonth() !== cursor.getMonth();
                  const count = byDay.get(dk)?.length ?? 0;
                  const isToday = dk === key(today);
                  const isSelected = dk === selected;

                  return (
                    <td key={dk} className="p-0 text-center align-middle">
                      {count > 0 ? (
                        <button
                          type="button"
                          onClick={() => setSelected(dk)}
                          aria-pressed={isSelected}
                          aria-label={`${dayLabel.format(day)}, ${count} ${count === 1 ? "event" : "events"}`}
                          className={cn(
                            "relative flex aspect-square w-full items-center justify-center rounded-lg font-medium transition-colors",
                            isSelected
                              ? "bg-primary text-white"
                              : "bg-[hsl(var(--primary-soft))] text-primary hover:bg-[hsl(var(--primary-muted))]",
                            outside && !isSelected && "opacity-55",
                            focusVisibleStyles.primary,
                          )}
                        >
                          {day.getDate()}
                          <span
                            className={cn(
                              "absolute bottom-1.5 h-1 w-1 rounded-full",
                              isSelected
                                ? "bg-[hsl(var(--gold-light))]"
                                : "bg-secondary",
                            )}
                            aria-hidden
                          />
                        </button>
                      ) : (
                        <span
                          className={cn(
                            "flex aspect-square w-full items-center justify-center rounded-lg",
                            outside
                              ? "text-brand-overlay/25"
                              : "text-brand-overlay/55",
                            isToday && "ring-1 ring-inset ring-primary/40",
                          )}
                          {...(isToday ? { "aria-current": "date" } : {})}
                        >
                          {day.getDate()}
                        </span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* The selected day */}
      <div className="min-w-0" aria-live="polite">
        <h4 className="ksu-l-card font-normal">
          {selected
            ? dayLabel.format(parseDay(selected)!)
            : "Upcoming events"}
        </h4>

        {selectedEvents.length > 0 ? (
          <ul className="mt-4 space-y-1">
            {selectedEvents.map((event) => (
              <li key={event.id ?? event.href} className="min-w-0">
                <Link
                  href={event.href}
                  className={cn(
                    "group -mx-3 block rounded-lg px-3 py-3 transition-colors duration-300 hover:bg-white",
                    focusVisibleStyles.primary,
                  )}
                >
                  <span className="ksu-l-small block font-medium transition-colors duration-300 group-hover:text-primary">
                    {event.title}
                  </span>
                  <span className="ksu-l-small mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-brand-overlay/55">
                    {event.timeLabel ? <span>{event.timeLabel}</span> : null}
                    {event.venue ? (
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" aria-hidden />
                        {event.venue}
                      </span>
                    ) : null}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="ksu-l-small mt-4 text-brand-overlay/55">
            No events on this day. Pick a highlighted date to see what is on.
          </p>
        )}
      </div>
    </div>
  );
}

export default EventsCalendar;
