import Link from "next/link";
import {
  ArrowRight,
  CalendarPlus,
  Download,
  FileWarning,
  MapPin,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import { CampusPageHeader } from "@ksu/ui/components";
import { PageShell } from "@/components/site-shell";
import type {
  ExaminationSitting,
  ExaminationTimetableData,
} from "@/lib/examination-timetable-data";
import {
  MobileTimetableFilterButton,
  PrintTimetableButton,
} from "./timetable-actions";

function displayDate(value: string) {
  const date = new Date(`${value}T00:00:00`);
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

function displayTime(value: string) {
  const [hours = "0", minutes = "00"] = value.split(":");
  const date = new Date(2000, 0, 1, Number(hours), Number(minutes));
  return new Intl.DateTimeFormat("en-GB", {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function groupSittings(sittings: ExaminationSitting[]) {
  const groups = new Map<string, ExaminationSitting[]>();
  for (const sitting of sittings) {
    groups.set(sitting.sitting_date, [
      ...(groups.get(sitting.sitting_date) ?? []),
      sitting,
    ]);
  }
  return [...groups.entries()];
}

export function ExaminationTimetableFinder({
  data,
}: {
  data: ExaminationTimetableData;
}) {
  const groups = groupSittings(data.sittings);
  const selectedProgramme = data.programmes.find(
    (item) => item.id === data.selectedProgrammeId,
  );

  return (
    <PageShell>
      <CampusPageHeader
        seed="/academics/examinations/timetable"
        variant="default"
        titleWeight="normal"
        eyebrow="Examination Timetable"
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Academics", href: "/academics" },
          { label: "Examinations", href: "/academics/examinations" },
          { label: "Timetable" },
        ]}
        title={
          <>
            Find your <em className="italic">examination schedule.</em>
          </>
        }
        description="Choose your programme and search by course code to see the latest official published examination sittings."
      />

      <section className="border-b border-primary/10 bg-surface-subtle px-5 py-10 sm:px-8 lg:px-16 xl:px-20">
        <div className="mx-auto w-full max-w-7xl">
          <details
            id="mobile-filters"
            className="group rounded-3xl bg-white ring-1 ring-primary/10 lg:hidden"
          >
            <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 px-5 text-xs font-bold uppercase tracking-wide text-primary">
              <span className="inline-flex items-center gap-2">
                <SlidersHorizontal
                  aria-hidden
                  className="h-4 w-4 text-secondary"
                />
                Filter timetable
              </span>
              <span className="rounded-full bg-primary px-3 py-1 text-[0.65rem] text-white group-open:bg-secondary group-open:text-foreground">
                {data.selectedProgrammeId || data.courseCode
                  ? "Active"
                  : "Open"}
              </span>
            </summary>
            <form
              method="GET"
              className="space-y-5 border-t border-primary/10 p-5"
            >
              <label className="block text-xs font-bold uppercase tracking-[0.14em] text-primary">
                Programme
                <select
                  name="programme_id"
                  defaultValue={data.selectedProgrammeId ?? ""}
                  className="mt-2 min-h-12 w-full rounded-2xl border border-primary/15 bg-white px-4 text-sm font-normal normal-case tracking-normal"
                >
                  <option value="">All programmes</option>
                  {data.programmes.map((programme) => (
                    <option key={programme.id} value={programme.id}>
                      {programme.code ? `${programme.code} — ` : ""}
                      {programme.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-xs font-bold uppercase tracking-[0.14em] text-primary">
                Course code or title
                <input
                  type="search"
                  name="course_code"
                  defaultValue={data.courseCode ?? ""}
                  placeholder="e.g. COMP 301"
                  className="mt-2 min-h-12 w-full rounded-2xl border border-primary/15 bg-white px-4 text-sm font-normal normal-case tracking-normal"
                />
              </label>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-2xl bg-secondary px-5 text-xs font-bold uppercase tracking-wide text-foreground"
                >
                  Apply filters <Search aria-hidden className="h-4 w-4" />
                </button>
                <Link
                  href="/academics/examinations/timetable"
                  className="inline-flex min-h-12 items-center justify-center rounded-2xl px-4 text-xs font-bold uppercase text-primary ring-1 ring-primary/20"
                >
                  Clear
                </Link>
              </div>
            </form>
          </details>
          <form
            method="GET"
            className="hidden gap-5 rounded-3xl bg-white p-6 ring-1 ring-primary/10 sm:p-7 lg:grid lg:grid-cols-[1.2fr_1fr_auto] lg:items-end"
          >
            <label className="text-xs font-bold uppercase tracking-[0.14em] text-primary">
              Programme
              <select
                name="programme_id"
                defaultValue={data.selectedProgrammeId ?? ""}
                className="mt-2 min-h-12 w-full rounded-2xl border border-primary/15 bg-white px-4 text-sm font-normal normal-case tracking-normal"
              >
                <option value="">All programmes</option>
                {data.programmes.map((programme) => (
                  <option key={programme.id} value={programme.id}>
                    {programme.code ? `${programme.code} — ` : ""}
                    {programme.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-xs font-bold uppercase tracking-[0.14em] text-primary">
              Course code or title
              <input
                type="search"
                name="course_code"
                defaultValue={data.courseCode ?? ""}
                placeholder="e.g. COMP 301"
                className="mt-2 min-h-12 w-full rounded-2xl border border-primary/15 bg-white px-4 text-sm font-normal normal-case tracking-normal"
              />
            </label>
            <button
              type="submit"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-secondary px-6 text-xs font-bold uppercase tracking-wide text-foreground hover:bg-amber-400"
            >
              Show timetable <Search aria-hidden className="h-4 w-4" />
            </button>
          </form>
        </div>
      </section>

      <section className="bg-primary px-5 py-6 text-white sm:px-8 lg:px-16 lg:py-8 xl:px-20">
        <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-secondary">
              {data.timetable
                ? "Official published timetable"
                : "Timetable status"}
            </p>
            <h2 className="mt-2 font-[family-name:var(--font-display)] text-xl font-normal tracking-tight sm:text-2xl">
              {data.timetable?.title ?? "No structured timetable published"}
              {data.timetable?.version
                ? ` — Version ${data.timetable.version}`
                : ""}
            </h2>
            <p className="mt-2 text-sm text-white/70">
              {data.calendar
                ? `${data.calendar.academic_year} · Semester ${data.calendar.semester}`
                : "Check the PDF timetable or contact the examinations office."}
              {selectedProgramme ? ` · ${selectedProgramme.name}` : ""}
            </p>
          </div>
          <div className="hidden flex-wrap gap-3 print:hidden lg:flex">
            <PrintTimetableButton />
            {data.fallbackDocument ? (
              <Link
                href={data.fallbackDocument.href}
                className="inline-flex min-h-12 items-center gap-2 rounded-2xl bg-secondary px-5 py-3 text-xs font-bold uppercase tracking-wide text-foreground"
              >
                Download PDF <Download aria-hidden className="h-4 w-4" />
              </Link>
            ) : null}
          </div>
        </div>
      </section>

      <section className="bg-white px-5 py-10 pb-28 sm:px-8 sm:py-14 lg:px-16 lg:py-16 xl:px-20">
        <div className="mx-auto w-full max-w-7xl">
          {groups.length ? (
            <div className="space-y-14">
              {groups.map(([date, sittings]) => (
                <section key={date}>
                  <div className="flex items-center gap-5 border-b border-primary/15 pb-5">
                    <span className="h-1 w-12 bg-secondary" aria-hidden />
                    <h2 className="font-[family-name:var(--font-display)] text-2xl font-normal tracking-tight text-primary sm:text-3xl">
                      {displayDate(date)}
                    </h2>
                  </div>
                  <div className="divide-y divide-primary/10">
                    {sittings.map((sitting) => {
                      const cancelled = sitting.status === "cancelled";
                      const rescheduled = sitting.status === "rescheduled";
                      const venue = [
                        sitting.venue?.name,
                        sitting.venue?.building,
                      ]
                        .filter(Boolean)
                        .join(" · ");
                      return (
                        <article
                          key={sitting.id}
                          className={`grid grid-cols-[5.5rem_1fr] gap-x-4 gap-y-4 py-6 md:grid-cols-[9rem_1.2fr_1fr] md:gap-5 ${cancelled ? "opacity-60" : ""}`}
                        >
                          <div className="row-span-2 md:row-span-1">
                            <p
                              className={`font-[family-name:var(--font-display)] text-lg font-normal text-primary sm:text-xl ${cancelled ? "line-through" : ""}`}
                            >
                              {displayTime(sitting.start_time)}
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground">
                              to {displayTime(sitting.end_time)}
                            </p>
                            {cancelled || rescheduled ? (
                              <span className="mt-3 inline-flex rounded-full bg-secondary/15 px-3 py-1 text-[0.68rem] font-bold uppercase tracking-wider text-primary">
                                {sitting.status}
                              </span>
                            ) : null}
                          </div>
                          <div className="border-l-2 border-secondary pl-4 md:pl-5">
                            <p className="text-xs font-bold uppercase tracking-[0.16em] text-secondary">
                              {sitting.course_code}
                            </p>
                            <h3
                              className={`mt-2 font-[family-name:var(--font-display)] text-xl font-normal tracking-tight text-primary sm:text-2xl ${cancelled ? "line-through" : ""}`}
                            >
                              {sitting.course_title}
                            </h3>
                            {sitting.cohort_label ? (
                              <p className="mt-2 text-sm text-muted-foreground">
                                {sitting.cohort_label}
                              </p>
                            ) : null}
                            {sitting.special_instructions ? (
                              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                                {sitting.special_instructions}
                              </p>
                            ) : null}
                          </div>
                          <div className="col-start-2 md:col-start-auto">
                            {venue ? (
                              <p className="flex items-start gap-2 text-sm font-bold text-primary">
                                <MapPin
                                  aria-hidden
                                  className="mt-0.5 h-4 w-4 shrink-0 text-secondary"
                                />
                                {venue}
                              </p>
                            ) : null}
                            {sitting.programmes?.length ? (
                              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                                {sitting.programmes
                                  .map((item) => item.code || item.name)
                                  .join(", ")}
                              </p>
                            ) : null}
                          </div>
                        </article>
                      );
                    })}
                  </div>
                </section>
              ))}
            </div>
          ) : (
            <div className="rounded-3xl bg-surface-subtle p-8 text-center ring-1 ring-primary/10 sm:p-12">
              <FileWarning
                aria-hidden
                className="mx-auto h-10 w-10 text-secondary"
              />
              <h2 className="mt-5 font-[family-name:var(--font-display)] text-3xl font-normal tracking-tight text-primary">
                No examination sittings found.
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-muted-foreground">
                Try clearing the programme or course search. If the structured
                timetable has not been published, use the official PDF
                timetable.
              </p>
              <div className="mt-7 flex flex-wrap justify-center gap-3">
                <Link
                  href="/academics/examinations/timetable"
                  className="inline-flex min-h-12 items-center gap-2 rounded-2xl bg-primary px-6 py-3 text-xs font-bold uppercase tracking-wide text-white"
                >
                  Clear filters <ArrowRight aria-hidden className="h-4 w-4" />
                </Link>
                {data.fallbackDocument ? (
                  <Link
                    href={data.fallbackDocument.href}
                    className="inline-flex min-h-12 items-center gap-2 rounded-2xl ring-1 ring-primary/20 px-6 py-3 text-xs font-bold uppercase tracking-wide text-primary"
                  >
                    Open PDF <Download aria-hidden className="h-4 w-4" />
                  </Link>
                ) : null}
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="bg-surface-subtle px-5 py-12 sm:px-8 lg:px-16 xl:px-20 print:hidden">
        <div className="mx-auto grid w-full max-w-7xl gap-6 lg:grid-cols-3">
          <Link
            href="/academics/examinations"
            className="group border-t border-primary/15 pt-5"
          >
            <FileWarning aria-hidden className="h-6 w-6 text-secondary" />
            <h3 className="mt-4 font-[family-name:var(--font-display)] text-xl font-normal text-primary">
              Official notices
            </h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Review timetable changes and examination notices.
            </p>
            <span className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-primary group-hover:underline">
              View notices <ArrowRight aria-hidden className="h-4 w-4" />
            </span>
          </Link>
          <Link
            href="/academics/calendar"
            className="group border-t border-primary/15 pt-5"
          >
            <CalendarPlus aria-hidden className="h-6 w-6 text-secondary" />
            <h3 className="mt-4 font-[family-name:var(--font-display)] text-xl font-normal text-primary">
              Academic calendar
            </h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Confirm the official semester examination period.
            </p>
            <span className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-primary group-hover:underline">
              View calendar <ArrowRight aria-hidden className="h-4 w-4" />
            </span>
          </Link>
          <Link
            href="/contact"
            className="group border-t border-primary/15 pt-5"
          >
            <MapPin aria-hidden className="h-6 w-6 text-secondary" />
            <h3 className="mt-4 font-[family-name:var(--font-display)] text-xl font-normal text-primary">
              Report a conflict
            </h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Contact the examinations office if two registered papers overlap.
            </p>
            <span className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-primary group-hover:underline">
              Contact office <ArrowRight aria-hidden className="h-4 w-4" />
            </span>
          </Link>
        </div>
      </section>

      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-primary/10 bg-white/95 px-4 py-3 shadow-xl backdrop-blur lg:hidden print:hidden">
        <div className="mx-auto flex max-w-md gap-3">
          <MobileTimetableFilterButton />
          {data.fallbackDocument ? (
            <Link
              href={data.fallbackDocument.href}
              className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-2xl bg-secondary px-4 text-xs font-bold uppercase tracking-wide text-foreground"
            >
              <Download aria-hidden className="h-4 w-4" /> Download PDF
            </Link>
          ) : (
            <PrintTimetableButton />
          )}
        </div>
      </div>
    </PageShell>
  );
}
