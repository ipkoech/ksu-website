"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CalendarDays } from "lucide-react";
import { cn } from "@ksu/ui/lib/utils";
import { focusVisibleStyles } from "@ksu/ui/motion";
import type { HomeIntake } from "@/lib/homepage-data";

function parseDate(value?: string | null) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

const longDate = new Intl.DateTimeFormat("en-KE", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

/**
 * The intake this panel speaks for, or nothing.
 *
 * An intake whose window has closed is not open however the backend flag
 * reads: a cached page outlives its deadline, and announcing a lapsed date as
 * open is the one failure this panel must not have.
 */
export function resolveOpenIntake(intakes: HomeIntake[]): HomeIntake | null {
  const now = Date.now();
  return (
    intakes.find((intake) => {
      if (!intake.isOpen) return false;
      const closing = parseDate(intake.lateApplicationEnd ?? intake.applicationEnd);
      return !closing || closing.getTime() >= now;
    }) ?? null
  );
}

type UpcomingDate = { id: string; label: string; date: Date };

/**
 * The dates worth printing, drawn from the intake records themselves.
 *
 * The CMS key-date items carry no date values (their `content.date` holds
 * copy like "See official notice"), so they cannot be counted down or sorted;
 * the intake calendar is the only real source of dates on this page.
 */
function upcomingDates(
  intakes: HomeIntake[],
  major: Date | null,
): UpcomingDate[] {
  const now = Date.now();
  const dates: UpcomingDate[] = [];

  for (const intake of intakes) {
    const opens = parseDate(intake.applicationStart);
    if (opens && opens.getTime() > now) {
      dates.push({ id: `${intake.id}-opens`, label: `${intake.name} opens`, date: opens });
    }
    const closes = parseDate(intake.applicationEnd);
    const late = parseDate(intake.lateApplicationEnd);
    // The standard close only matters while late applications are still
    // running past it, and only when it is not itself the headline date.
    if (
      closes &&
      closes.getTime() > now &&
      late &&
      late.getTime() > closes.getTime() &&
      (!major || closes.getTime() !== major.getTime())
    ) {
      dates.push({
        id: `${intake.id}-closes`,
        label: `${intake.name} standard deadline`,
        date: closes,
      });
    }
  }

  return dates
    .filter((entry) => !major || entry.date.getTime() !== major.getTime())
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .slice(0, 3);
}

export function IntakePanel({ intakes }: { intakes: HomeIntake[] }) {
  const intake = resolveOpenIntake(intakes);
  const major = intake
    ? parseDate(intake.lateApplicationEnd ?? intake.applicationEnd)
    : null;
  const others = upcomingDates(intakes, major);

  return (
    <aside
      aria-labelledby="intake-panel-heading"
      className="min-w-0 rounded-3xl bg-brand-overlay p-6 text-white shadow-[0_28px_70px_-32px_hsl(var(--brand-overlay)/0.8)] lg:p-7"
    >
      <div className="flex items-start justify-between gap-6">
        <div className="min-w-0">
          <h4 id="intake-panel-heading" className="ksu-l-card font-normal">
            {intake ? "Applications open" : "Prepare your application"}
          </h4>
          {intake ? (
            <p className="mt-2 font-medium">{intake.name}</p>
          ) : (
            <p className="ksu-l-small mt-3 text-white/65">
              No intake is currently open. Review the entry requirements and the
              documents you will need, so you are ready when the next intake is
              announced.
            </p>
          )}
        </div>
        <CalendarDays
          className="h-6 w-6 shrink-0 text-secondary"
          strokeWidth={1.25}
          aria-hidden
        />
      </div>

      {intake && major ? <Countdown deadline={major} /> : null}

      <Link
        href={intake ? intake.href : "/admissions/how-to-apply"}
        className={cn(
          "mt-6 inline-flex min-h-11 items-center justify-center rounded-md bg-secondary px-7 py-3 font-medium text-white transition-[background-color,transform] duration-200 hover:bg-secondary/90 active:scale-[0.99]",
          focusVisibleStyles.white,
        )}
      >
        {intake ? "Apply now" : "Admissions guide"}
      </Link>

      {others.length > 0 ? (
        <dl className="mt-6 space-y-2.5 border-t border-white/12 pt-5">
          {others.map((entry) => (
            <div
              key={entry.id}
              className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5"
            >
              <dt className="ksu-l-small min-w-0 text-white/65">
                {entry.label}
              </dt>
              <dd className="ksu-l-small shrink-0 font-medium tabular-nums">
                <time dateTime={entry.date.toISOString().slice(0, 10)}>
                  {longDate.format(entry.date)}
                </time>
              </dd>
            </div>
          ))}
        </dl>
      ) : null}
    </aside>
  );
}

function remaining(deadline: Date) {
  const diff = deadline.getTime() - Date.now();
  if (diff <= 0) return null;
  const seconds = Math.floor(diff / 1000);
  return {
    days: Math.floor(seconds / 86_400),
    hours: Math.floor((seconds % 86_400) / 3600),
    minutes: Math.floor((seconds % 3600) / 60),
    seconds: seconds % 60,
  };
}

/**
 * The single headline date, counted down.
 *
 * The clock only starts after mount: the server and the browser are never on
 * the same millisecond, so rendering a live figure during SSR guarantees a
 * hydration mismatch. Until then, and without JavaScript, the deadline itself
 * is shown, which is the information that actually matters.
 */
function Countdown({ deadline }: { deadline: Date }) {
  const [left, setLeft] = useState<ReturnType<typeof remaining>>(null);

  useEffect(() => {
    setLeft(remaining(deadline));
    // One second: the seconds field has to actually move, or showing it is a
    // lie about how live the figure is.
    const timer = window.setInterval(() => {
      const next = remaining(deadline);
      setLeft(next);
      if (!next) window.clearInterval(timer);
    }, 1000);
    return () => window.clearInterval(timer);
  }, [deadline]);

  const parts = left
    ? [
        { value: left.days, label: "days" },
        { value: left.hours, label: "hrs" },
        { value: left.minutes, label: "min" },
        { value: left.seconds, label: "sec" },
      ]
    : [];

  return (
    <div className="mt-5">
      <p className="ksu-l-small text-white/60">
        Closes{" "}
        <time
          dateTime={deadline.toISOString().slice(0, 10)}
          className="font-medium text-white/85"
        >
          {longDate.format(deadline)}
        </time>
      </p>

      {parts.length > 0 ? (
        <div className="mt-3 grid grid-cols-4 gap-2" role="timer" aria-live="off">
          {parts.map((part) => (
            <div
              key={part.label}
              className="rounded-xl bg-white/10 px-2 py-2.5 text-center ring-1 ring-white/12"
            >
              <span className="block text-[1.375rem] font-medium leading-none tabular-nums text-[hsl(var(--gold-light))]">
                {String(part.value).padStart(2, "0")}
              </span>
              <span className="ksu-l-small mt-1 block text-white/55">
                {part.label}
              </span>
            </div>
          ))}
        </div>
      ) : null}

      {/* One calm announcement for screen readers rather than a figure that
          re-reads itself every thirty seconds. */}
      {left ? (
        <p className="sr-only" role="status">
          {left.days} days and {left.hours} hours left to apply.
        </p>
      ) : null}
    </div>
  );
}

export default IntakePanel;
