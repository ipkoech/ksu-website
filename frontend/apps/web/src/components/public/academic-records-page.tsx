import Link from "next/link";
import {
  ArrowRight,
  Building2,
  CalendarDays,
  Clock3,
  Download,
  FileText,
  GraduationCap,
  Search,
} from "lucide-react";
import type {
  PublicPageConfig,
  PublicPageSection,
} from "@/components/public/section-page";
import { BreadcrumbTrail, PageShell } from "@/components/site-shell";
import { PublicListFilterForm } from "@/components/public/list-filter-form";
import { PublicImage } from "@/components/public/public-image";

type AcademicRecordsKind =
  | "schools"
  | "programmes"
  | "calendar"
  | "examinations";

function sectionFor(config: PublicPageConfig): PublicPageSection {
  return (
    config.sections[0] ?? {
      eyebrow: "Academic records",
      title: config.title,
      body: config.body,
      cards: [],
    }
  );
}

function RecordLink({
  title,
  body,
  href,
  eyebrow,
}: {
  title: string;
  body: string;
  href?: string;
  eyebrow?: string;
}) {
  const content = (
    <>
      <div className="min-w-0 flex-1">
        {eyebrow ? (
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-secondary">
            {eyebrow}
          </p>
        ) : null}
        <h3 className="mt-2 font-[family-name:var(--font-display)] text-xl font-semibold leading-tight text-foreground">
          {title}
        </h3>
        <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">
          {body}
        </p>
      </div>
      {href ? (
        <ArrowRight
          className="mt-1 h-5 w-5 shrink-0 text-primary transition-transform group-hover:translate-x-1"
          aria-hidden
        />
      ) : null}
    </>
  );

  return href ? (
    <Link
      href={href}
      className="group flex gap-5 border-b border-border py-5 first:border-t focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
    >
      {content}
    </Link>
  ) : (
    <div className="flex gap-5 border-b border-border py-5 first:border-t">
      {content}
    </div>
  );
}

function _Records({
  kind,
  section,
}: {
  kind: AcademicRecordsKind;
  section: PublicPageSection;
}) {
  if (kind === "calendar") {
    return (
      <div className="divide-y divide-border border-y border-border">
        {section.cards.map((card) => (
          <Link
            key={card.title}
            href={card.href ?? "#"}
            className="group grid gap-4 py-6 sm:grid-cols-[auto_1fr_auto] sm:items-center"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white">
              <CalendarDays className="h-5 w-5" aria-hidden />
            </span>
            <span>
              <span className="block text-[11px] font-bold uppercase tracking-[0.16em] text-secondary">
                {card.eyebrow ?? "Academic date"}
              </span>
              <span className="mt-1 block font-[family-name:var(--font-display)] text-xl font-semibold text-foreground">
                {card.title}
              </span>
              <span className="mt-1 block text-sm leading-6 text-muted-foreground">
                {card.body}
              </span>
            </span>
            <ArrowRight
              className="h-5 w-5 text-primary transition-transform group-hover:translate-x-1"
              aria-hidden
            />
          </Link>
        ))}
      </div>
    );
  }

  if (kind === "examinations") {
    return (
      <div className="divide-y divide-border border-y border-border">
        {section.cards.map((card) => (
          <Link
            key={card.title}
            href={card.href ?? "#"}
            className="group flex items-start gap-4 py-6"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded bg-primary/10 text-primary">
              <FileText className="h-5 w-5" aria-hidden />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-[family-name:var(--font-display)] text-xl font-semibold text-foreground">
                {card.title}
              </span>
              <span className="mt-1 block text-sm leading-6 text-muted-foreground">
                {card.body}
              </span>
              <span className="mt-3 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-primary">
                Open document{" "}
                <ArrowRight
                  className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1"
                  aria-hidden
                />
              </span>
            </span>
          </Link>
        ))}
      </div>
    );
  }

  return (
    <div
      className={
        kind === "schools"
          ? "grid gap-x-8 md:grid-cols-2"
          : kind === "programmes"
            ? "grid gap-4 md:grid-cols-2 xl:grid-cols-3"
            : "divide-y divide-border border-y border-border"
      }
    >
      {section.cards.map((card, index) => (
        <RecordLink
          key={card.title}
          title={card.title}
          body={card.body}
          href={card.href}
          eyebrow={
            card.eyebrow ??
            (kind === "schools"
              ? `School ${String(index + 1).padStart(2, "0")}`
              : undefined)
          }
        />
      ))}
    </div>
  );
}

function AcademicPageIntro({
  config,
  kind,
}: {
  config: PublicPageConfig;
  kind: AcademicRecordsKind;
}) {
  const titles: Record<AcademicRecordsKind, string> = {
    schools: "Schools that shape possibility",
    programmes: "Find your direction",
    calendar: "Plan your academic year",
    examinations: "Prepare with confidence",
  };

  return (
    <div className="border-b border-border px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      <div className="mx-auto flex w-full max-w-[1680px] items-end justify-between gap-8">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-secondary">
            {config.eyebrow}
          </p>
          <h1 className="mt-3 max-w-3xl font-[family-name:var(--font-display)] text-4xl font-semibold leading-[0.98] text-foreground sm:text-5xl lg:text-6xl">
            {titles[kind]}
          </h1>
        </div>
        <p className="hidden max-w-sm border-l-2 border-secondary pl-4 text-sm leading-6 text-muted-foreground lg:block">
          {config.body}
        </p>
      </div>
    </div>
  );
}

function SchoolsEditorial({
  section,
}: {
  section: PublicPageSection;
}) {
  return (
    <>
      <section className="bg-brand-overlay px-4 py-8 text-white sm:px-6 lg:px-8 lg:py-12">
        <div className="mx-auto grid w-full max-w-[1680px] gap-0 overflow-hidden lg:grid-cols-[0.8fr_1.2fr]">
          <div className="flex flex-col justify-between bg-primary p-6 sm:p-8 lg:p-12">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-secondary">
                Academic schools
              </p>
              <h2 className="mt-4 max-w-xl font-[family-name:var(--font-display)] text-4xl font-semibold leading-[0.95] sm:text-5xl lg:text-6xl">
                Schools that shape possibility
              </h2>
              <p className="mt-5 max-w-md text-sm leading-7 text-white/75">
                Explore the schools where teaching, research, and community
                impact come together.
              </p>
            </div>
            <div className="mt-10 grid grid-cols-3 gap-3 border-t border-white/20 pt-5 text-xs text-white/70">
              <div><strong className="block text-2xl text-white">{section.cards.length}</strong>schools</div>
              <div><strong className="block text-2xl text-white">{section.cards.filter((card) => card.href).length}</strong>pathways</div>
              <div><strong className="block text-2xl text-white">KSU</strong>community</div>
            </div>
          </div>
          <div className="relative min-h-[260px] overflow-hidden bg-slate-900 lg:min-h-[360px]">
            <PublicImage
              src="/images/backgrounds/KSUGreenLandscapingMay2026-9664.jpg"
              alt="Kisii University campus"
              ratio="fill"
              sizes="(min-width: 1024px) 60vw, 100vw"
              className="h-full w-full"
              imageClassName="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent" />
            <p className="absolute bottom-5 left-5 text-xs font-bold uppercase tracking-[0.16em] text-white/90">
              Learning in context
            </p>
          </div>
        </div>
      </section>
      <section className="px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <div className="mx-auto w-full max-w-[1680px]">
          {section.filters ? (
            <PublicListFilterForm
              className="mb-7 max-w-2xl border-b border-border pb-5"
              searchName={section.filters.queryName ?? "q"}
              searchValue={section.filters.query}
              searchPlaceholder="Search schools"
              searchLabel="Search schools"
              selects={[]}
              clearHref={section.filters.clearHref}
              total={section.cards.length}
              visible={section.cards.length}
            />
          ) : null}
          <div className="divide-y divide-border border-y border-border">
            {section.cards.map((card, index) => (
              <Link
                key={card.title}
                href={card.href ?? "#"}
                className="group grid gap-4 py-5 sm:grid-cols-[5rem_1.25fr_1fr_auto] sm:items-center"
              >
                <span className="font-[family-name:var(--font-display)] text-3xl text-secondary/80">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="flex items-center gap-3">
                  <Building2 className="h-5 w-5 shrink-0 text-primary" aria-hidden />
                  <span className="font-[family-name:var(--font-display)] text-xl font-semibold text-foreground group-hover:text-primary">
                    {card.title}
                  </span>
                </span>
                <span className="text-sm leading-6 text-muted-foreground">
                  {card.body}
                </span>
                <ArrowRight className="h-5 w-5 text-primary transition-transform group-hover:translate-x-1" aria-hidden />
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

function ProgrammeFinder({
  config,
  section,
  page,
  pageHref,
  hasNextPage,
}: {
  config: PublicPageConfig;
  section: PublicPageSection;
  page: number;
  pageHref: (page: number) => string;
  hasNextPage: boolean;
}) {
  const filters = section.filters;
  return (
    <section className="px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      <div className="mx-auto grid w-full max-w-[1680px] overflow-hidden border border-border lg:grid-cols-[0.7fr_1.3fr]">
        <div className="relative min-h-[300px] overflow-hidden bg-primary lg:min-h-[560px]">
          <PublicImage
            src="/images/backgrounds/VCKSUMedicalSchoolInspectionApril1,2026-5704.jpg"
            alt="Kisii University students learning"
            ratio="fill"
            sizes="(min-width: 1024px) 35vw, 100vw"
            className="h-full w-full"
            imageClassName="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/20 to-transparent" />
          <div className="absolute bottom-7 left-6 right-6 text-white sm:left-8 sm:right-8">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-secondary">100+ programmes</p>
            <p className="mt-2 max-w-sm font-[family-name:var(--font-display)] text-3xl font-semibold leading-tight sm:text-4xl">
              Build the future you want to lead.
            </p>
          </div>
        </div>
        <div className="relative bg-[#faf8f2] p-6 sm:p-8 lg:p-12 lg:pr-28">
          <div className="absolute right-0 top-10 hidden w-20 bg-secondary px-3 py-5 text-center text-white lg:block">
            <GraduationCap className="mx-auto h-5 w-5" aria-hidden />
            <span className="mt-2 block text-[10px] font-bold uppercase tracking-[0.12em]">Admissions</span>
            <span className="mt-2 block text-[10px] leading-4 text-white/80">Explore your next intake</span>
            <ArrowRight className="mx-auto mt-4 h-4 w-4 rotate-90" aria-hidden />
          </div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-secondary">Programme finder</p>
          <h2 className="mt-3 max-w-xl font-[family-name:var(--font-display)] text-4xl font-semibold leading-[0.95] text-foreground sm:text-5xl">
            Find your direction
          </h2>
          <p className="mt-4 max-w-xl text-sm leading-7 text-muted-foreground">Search live programme records by name, level, school, or mode of study.</p>
          {filters ? (
            <PublicListFilterForm
              className="mt-8 border-y border-border py-5"
              searchName={filters.queryName ?? "q"}
              searchValue={filters.query}
              searchPlaceholder="Search programmes by name or keyword"
              searchLabel="Search programmes"
              selects={[
                ...(filters.levelOptions ? [{ name: "level", label: "Level", value: filters.level, allLabel: "All levels", options: filters.levelOptions }] : []),
                ...(filters.schoolOptions ? [{ name: "school_id", label: "School", value: filters.schoolId, allLabel: "All schools", options: filters.schoolOptions }] : []),
                ...(filters.modeOptions ? [{ name: "mode_of_study", label: "Mode", value: filters.mode, allLabel: "All modes", options: filters.modeOptions }] : []),
              ]}
              clearHref={filters.clearHref}
              total={section.cards.length}
              visible={section.cards.length}
            />
          ) : null}
          <div className="divide-y divide-border border-b border-border">
            {section.cards.map((card) => (
              <Link key={card.title} href={card.href ?? "#"} className="group grid gap-2 py-4 sm:grid-cols-[1fr_auto] sm:items-center">
                <span>
                  <span className="block font-semibold text-foreground group-hover:text-primary">{card.title}</span>
                  <span className="mt-1 block text-xs leading-5 text-muted-foreground">{card.body}</span>
                </span>
                <ArrowRight className="h-4 w-4 text-primary transition-transform group-hover:translate-x-1" aria-hidden />
              </Link>
            ))}
          </div>
          {config.relatedItems?.[0] ? (
            <Link href={config.relatedItems[0].href ?? "/admissions/intakes"} className="mt-6 flex items-center justify-between gap-4 bg-secondary p-4 text-sm font-semibold text-white transition hover:bg-primary">
              <span><span className="block text-[10px] uppercase tracking-[0.16em] text-white/75">Admissions</span>{config.relatedItems[0].title}</span>
              <ArrowRight className="h-5 w-5" aria-hidden />
            </Link>
          ) : null}
          <nav className="mt-5 flex items-center justify-between text-sm" aria-label="Programme pages">
            {page > 1 ? <Link href={pageHref(page - 1)} className="font-semibold text-primary">← Previous</Link> : <span />}
            <span className="text-muted-foreground">Page {page}</span>
            {hasNextPage ? <Link href={pageHref(page + 1)} className="font-semibold text-primary">Next →</Link> : <span />}
          </nav>
        </div>
      </div>
    </section>
  );
}

function CalendarEditorial({ section }: { section: PublicPageSection }) {
  return (
    <section className="bg-[#faf8f2] px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      <div className="mx-auto grid w-full max-w-[1680px] gap-8 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-secondary">Academic calendar</p>
          <h2 className="mt-3 max-w-md font-[family-name:var(--font-display)] text-5xl font-semibold leading-[0.95] text-primary sm:text-6xl">Plan ahead.<br /><span className="text-secondary">Stay on track.</span></h2>
          <p className="mt-5 max-w-md text-sm leading-7 text-muted-foreground">A year of discovery, growth, and achievement. Your academic journey starts here.</p>
          <div className="mt-8 overflow-hidden bg-primary text-white">
            <div className="relative min-h-[220px]">
              <PublicImage
                src="/images/backgrounds/KSUGreenLandscapingMay2026-3810.jpg"
                alt="Kisii University academic calendar"
                ratio="fill"
                sizes="(min-width: 1024px) 28vw, 100vw"
                className="absolute inset-0 h-full w-full"
                imageClassName="object-cover opacity-55"
              />
              <div className="absolute inset-0 bg-primary/55" />
              <div className="relative z-10 flex h-full flex-col justify-end p-5">
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-secondary">Upcoming</p>
                <p className="mt-1 font-[family-name:var(--font-display)] text-4xl font-semibold">{section.cards[0]?.title ?? "Key academic date"}</p>
                <p className="mt-1 text-sm text-white/75">{section.cards[0]?.body ?? "Check back for the next published update."}</p>
                {section.cards[0]?.href ? <Link href={section.cards[0].href} className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-secondary">View details <ArrowRight className="h-4 w-4" aria-hidden /></Link> : null}
              </div>
            </div>
          </div>
        </div>
        <div className="relative overflow-hidden border border-primary/10 bg-white p-5 sm:p-8">
          <div className="absolute left-1/2 top-1/2 hidden h-56 w-[88%] -translate-x-1/2 -translate-y-1/2 rounded-[50%] border border-primary/15 sm:block" />
          <div className="relative grid gap-3 sm:grid-cols-2">
            {section.cards.map((card, index) => (
              <Link key={card.title} href={card.href ?? "#"} className="group relative flex min-h-28 items-center gap-4 border-b border-border py-4 sm:min-h-36 sm:border-b-0 sm:p-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-primary/20 bg-white font-[family-name:var(--font-display)] text-sm font-semibold text-primary group-hover:border-secondary">{String(index + 1).padStart(2, "0")}</span>
                <span><span className="block text-xs font-bold uppercase tracking-[0.12em] text-secondary">{index % 2 === 0 ? "Semester milestone" : "Academic date"}</span><span className="mt-1 block font-[family-name:var(--font-display)] text-lg font-semibold text-foreground group-hover:text-primary">{card.title}</span><span className="mt-1 block text-xs leading-5 text-muted-foreground">{card.body}</span></span>
                <ArrowRight className="ml-auto h-4 w-4 shrink-0 text-primary transition-transform group-hover:translate-x-1" aria-hidden />
              </Link>
            ))}
          </div>
          <div className="relative mt-6 border-t border-border pt-5 text-right">
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Dates may change — check official updates</span>
          </div>
        </div>
      </div>
    </section>
  );
}

function ExaminationsEditorial({ section }: { section: PublicPageSection }) {
  return (
    <section className="bg-brand-overlay px-4 py-8 text-white sm:px-6 lg:px-8 lg:py-12">
      <div className="mx-auto w-full max-w-[1680px]">
        <div className="grid gap-8 lg:grid-cols-[0.75fr_1.25fr] lg:items-end">
          <div className="relative min-h-[280px] overflow-hidden bg-slate-900 p-6 sm:p-8">
            <PublicImage
              src="/images/backgrounds/KSUGreenLandscapingMay2026-7456.jpg"
              alt="Kisii University student preparing for examinations"
              ratio="fill"
              sizes="(min-width: 1024px) 38vw, 100vw"
              className="absolute inset-0 h-full w-full"
              imageClassName="object-cover"
            />
            <div className="absolute inset-0 bg-brand-overlay/80" />
            <div className="relative z-10 flex h-full flex-col justify-end">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-secondary">Examinations</p>
            <h2 className="mt-3 max-w-xl font-[family-name:var(--font-display)] text-4xl font-semibold leading-tight sm:text-5xl">Prepare with confidence.</h2>
            <p className="mt-4 max-w-md text-sm leading-7 text-white/70">Timetables, policies, and official examination documents in one place.</p>
            </div>
          </div>
          <div className="border border-white/15 bg-white/10 p-5 sm:p-6">
            <div className="flex items-center gap-3 text-secondary"><Clock3 className="h-5 w-5" aria-hidden /><span className="text-xs font-bold uppercase tracking-[0.16em]">Upcoming examination period</span></div>
            <p className="mt-3 font-[family-name:var(--font-display)] text-2xl font-semibold">{section.cards[0]?.title ?? "No examination period published"}</p>
            <p className="mt-1 text-sm text-white/70">{section.cards[0]?.body ?? "Published examination dates will appear here."}</p>
          </div>
        </div>
        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {section.cards.map((card) => (
            <Link key={card.title} href={card.href ?? "#"} className="group flex min-h-32 flex-col justify-between border border-white/15 bg-white p-5 text-brand-overlay transition hover:-translate-y-1 hover:border-secondary">
              <div className="flex items-start justify-between gap-3"><FileText className="h-5 w-5 text-secondary" aria-hidden /><Download className="h-4 w-4 text-primary transition-transform group-hover:translate-y-0.5" aria-hidden /></div>
              <span><span className="mt-6 block font-semibold text-primary">{card.title}</span><span className="mt-1 block text-xs leading-5 text-slate-600">{card.body}</span></span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export function AcademicRecordsPage({
  config,
  kind,
  page = 1,
}: {
  config: PublicPageConfig;
  kind: AcademicRecordsKind;
  page?: number;
}) {
  const section = sectionFor(config);
  const isProgrammeFinder = kind === "programmes";
  const hasNextPage = isProgrammeFinder && section.cards.length >= 8;
  const pageHref = (targetPage: number) => {
    const params = new URLSearchParams();
    const filters = section.filters;
    if (filters?.query) params.set("q", filters.query);
    if (filters?.level) params.set("level", filters.level);
    if (filters?.schoolId) params.set("school_id", filters.schoolId);
    if (filters?.mode) params.set("mode_of_study", filters.mode);
    if (filters?.sort) params.set("sort", filters.sort);
    if (targetPage > 1) params.set("page", String(targetPage));
    const query = params.toString();
    return `${config.currentHref}${query ? `?${query}` : ""}`;
  };

  return (
    <PageShell>
      <BreadcrumbTrail items={config.breadcrumb} />
      <main>
        <AcademicPageIntro config={config} kind={kind} />
        {kind === "schools" ? <SchoolsEditorial section={section} /> : null}
        {kind === "programmes" ? (
          <ProgrammeFinder config={config} section={section} page={page} pageHref={pageHref} hasNextPage={hasNextPage} />
        ) : null}
        {kind === "calendar" ? <CalendarEditorial section={section} /> : null}
        {kind === "examinations" ? <ExaminationsEditorial section={section} /> : null}
        {!section.cards.length ? (
          <div className="mx-auto flex max-w-[1680px] items-center gap-3 border-y border-border px-4 py-10 text-muted-foreground sm:px-6 lg:px-8">
            <Search className="h-5 w-5" aria-hidden /> No published records are available yet.
          </div>
        ) : null}
      </main>
    </PageShell>
  );
}
