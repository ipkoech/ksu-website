import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Building2,
  CalendarDays,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import { ResearchFilterForm } from "../../components/research-listing";
import { Badge, FilledBadge, StatusMessage } from "../../components/research-ui";
import {
  compactText,
  formatLabel,
  getCenters,
  getPrograms,
  getProgramsFiltered,
  getThemes,
} from "../../lib/research-public-data";
import {
  filterRecordsByMonth,
  getPublishedFactItems,
  getRecordMonths,
  getRecordSummary,
  getRecordTimelineLabel,
  getRecordTitle,
  getRecordYears,
} from "../../lib/research-page-model";
import type { ResearchGenericRecord } from "@ksu/api-client";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Research Programs",
  description: "Institutional research programs and initiatives at Kisii University.",
};

type ProgramSearchParams = {
  q?: string;
  status?: string;
  active?: string;
  center?: string;
  year?: string;
  month?: string;
  sort?: string;
};

const programStatuses = ["planning", "active", "completed", "suspended", "cancelled"];
const activeStates = [
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
  { label: "Featured", value: "featured" },
];
const sortOptions = [
  { label: "Latest", value: "created_at" },
  { label: "Recently updated", value: "updated_at" },
  { label: "Start date", value: "start_date" },
  { label: "End date", value: "end_date" },
  { label: "Name A-Z", value: "name" },
  { label: "Name Z-A", value: "name_desc" },
];

const quickLinks = [
  { label: "Projects", href: "/projects" },
  { label: "Publications", href: "/publications" },
  { label: "Funding", href: "/funding" },
  { label: "Centers", href: "/centers" },
];

const programGuide = [
  {
    label: "Focus",
    body: "The challenge, goals, and priority areas the program addresses.",
  },
  {
    label: "Projects",
    body: "The active initiatives and teams delivering evidence and solutions.",
  },
  {
    label: "Evidence",
    body: "Key outputs, publications, and data that inform decisions.",
  },
  {
    label: "Public value",
    body: "How the program improves lives, systems, and the environment.",
  },
];

export default async function ProgramsPage({
  searchParams,
}: {
  searchParams?: Promise<ProgramSearchParams>;
}) {
  const params = (await searchParams) ?? {};
  const sort = params.sort || "created_at";
  const sortField = sort === "name_desc" ? "name" : sort;
  const order = sort === "name" ? "asc" : "desc";
  const activeFlags = getActiveFlags(params.active);
  const [programs, allPrograms, centers, themes] = await Promise.all([
    getProgramsFiltered({
      search: params.q,
      status: params.status,
      centerId: params.center,
      year: params.year,
      sort: sortField,
      order,
      ...activeFlags,
    }),
    getPrograms(),
    getCenters(),
    getThemes(),
  ]);
  const years = getRecordYears(allPrograms.data);
  const months = getRecordMonths(allPrograms.data, params.year);
  const visiblePrograms = filterRecordsByMonth(programs.data, params.year, params.month);
  const featuredProgram =
    visiblePrograms.find((program) => program.is_featured) ?? visiblePrograms[0];
  const portfolioPrograms = featuredProgram
    ? visiblePrograms.filter((program) => program.id !== featuredProgram.id)
    : visiblePrograms;
  const errors = [programs.error, centers.error, themes.error].filter(Boolean);

  return (
    <main id="research-main" className="min-h-screen bg-white text-slate-950">
      <ProgramsHero />
      <ProgramAccessBand />

      <section
        id="program-portfolio"
        className="bg-white px-4 py-6 sm:px-6 lg:px-8 xl:px-10 2xl:px-12"
      >
        <div className="mx-auto grid max-w-[1680px] gap-6 xl:grid-cols-[minmax(0,1fr)_390px]">
          <div className="min-w-0">
            <div className="border-t border-slate-200 pt-5">
              <div className="grid gap-4 lg:grid-cols-[320px_minmax(0,1fr)] lg:items-start">
                <div className="pt-1">
                  <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold leading-tight text-slate-950 lg:whitespace-nowrap">
                    Program Portfolio
                  </h1>
                </div>
                <div className="w-full">
                  <ProgramFilters
                    params={params}
                    centers={centers.data}
                    years={years}
                    months={months}
                  />
                </div>
              </div>

              {errors.length && visiblePrograms.length === 0 ? (
                <div className="mt-5">
                  <StatusMessage tone="error">{errors[0]}</StatusMessage>
                </div>
              ) : null}

              {visiblePrograms.length > 0 ? (
                <div className="mt-5 grid gap-3 lg:grid-cols-2">
                  {featuredProgram ? (
                    <ProgramPortfolioCard
                      program={featuredProgram}
                      featured
                      className="lg:col-span-2"
                    />
                  ) : null}
                  {portfolioPrograms.map((program) => (
                    <ProgramPortfolioCard key={program.id} program={program} />
                  ))}
                </div>
              ) : !errors.length ? (
                <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-5 text-sm font-medium text-slate-600">
                  No published research programs match the current filters.
                </div>
              ) : null}
            </div>
          </div>

          <aside className="xl:pt-[4.55rem]">
            <ProgramGuidePanel />
          </aside>
        </div>
      </section>

      {themes.data.length > 0 ? <ThemesBand themes={themes.data} /> : null}
    </main>
  );
}

function ProgramsHero() {
  return (
    <section className="relative isolate overflow-hidden bg-slate-950 px-4 py-12 text-white sm:px-6 lg:px-8 lg:py-14 xl:px-10 2xl:px-12">
      <div
        aria-hidden
        className="absolute inset-0 bg-[url('/images/research/research-hero-imagegen.webp')] bg-cover bg-center"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-r from-slate-950/78 via-slate-950/42 to-slate-950/8"
      />
      <div aria-hidden className="absolute inset-x-0 bottom-0 h-px bg-white/20" />
      <div className="relative mx-auto max-w-[1680px] py-4">
        <span className="inline-flex rounded-md border border-white/25 bg-primary/80 px-3 py-1 text-xs font-semibold text-white shadow-sm backdrop-blur">
          Published program portfolio
        </span>
        <h2 className="mt-4 max-w-2xl font-[family-name:var(--font-display)] text-4xl font-semibold leading-none text-white sm:text-5xl lg:text-6xl">
          Research Programs
        </h2>
        <p className="mt-4 max-w-xl text-pretty text-base leading-7 text-white/92 sm:text-lg">
          Strategic research umbrellas coordinating projects, expertise, funding, and outputs
          around Kisii University priority areas.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="#program-portfolio"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-primary px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/30"
          >
            Explore programs
            <ArrowRight aria-hidden className="h-4 w-4" />
          </Link>
          <Link
            href="/projects"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-white/40 bg-white/8 px-5 py-3 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/15 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/20"
          >
            View projects
            <ArrowRight aria-hidden className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

function ProgramAccessBand() {
  return (
    <section className="border-b border-slate-200 bg-white px-4 py-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
      <div className="mx-auto grid max-w-[1680px] gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(280px,520px)] lg:items-stretch">
        <div className="rounded-lg border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-5 shadow-sm">
          <div className="flex h-full flex-col justify-center">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
              Research program discovery
            </p>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              Browse published programs by focus, status, center, active state, and timeline.
              Open a program to see the workstreams and evidence attached to it.
            </p>
          </div>
        </div>
        <nav
          aria-label="Research quick access"
          className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm"
        >
          <ul className="divide-y divide-slate-200">
            {quickLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="group flex items-center justify-between gap-4 px-1 py-2.5 text-sm font-semibold text-primary transition hover:text-secondary"
                >
                  {link.label}
                  <ChevronRight
                    aria-hidden
                    className="h-4 w-4 text-slate-400 transition group-hover:translate-x-1 group-hover:text-secondary"
                  />
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </section>
  );
}

function ProgramFilters({
  params,
  centers,
  years,
  months,
}: {
  params: ProgramSearchParams;
  centers: ResearchGenericRecord[];
  years: string[];
  months: Array<{ value: string; label: string }>;
}) {
  return (
    <ResearchFilterForm
      action="/programs"
      resetHref="/programs"
      searchValue={params.q}
      searchPlaceholder="Search programs by title, code or focus area..."
      selects={[
        { name: "active", label: "Active state", value: params.active, options: activeStates },
        { name: "status", label: "Status", value: params.status, options: programStatuses },
        { name: "year", label: "Year", value: params.year, options: years },
        { name: "month", label: "Month", value: params.month, options: months },
      ]}
      centers={centers}
      centerValue={params.center}
      sortValue={params.sort}
      sortOptions={sortOptions}
    />
  );
}

function ProgramPortfolioCard({
  program,
  featured = false,
  className = "",
}: {
  program: ResearchGenericRecord;
  featured?: boolean;
  className?: string;
}) {
  const href = program.slug ? `/programs/${program.slug}` : "/programs";
  const summary = getRecordSummary(program);
  const title = getRecordTitle(program, "Research program");
  const facts = getPublishedFactItems([
    { label: "Center", value: getCenterName(program) },
    { label: "Timeline", value: getRecordTimelineLabel(program) },
  ]);
  const metrics = getProgramMetrics(program);
  const image = getProgramImage(program);
  const badges = [program.program_type, program.status]
    .map(compactText)
    .filter(Boolean)
    .slice(0, 2);

  return (
    <article
      className={`group rounded-lg border bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-[0_22px_60px_-42px_rgba(15,23,42,0.5)] ${
        featured ? "border-primary/55 bg-primary/[0.025]" : "border-slate-200"
      } ${className}`}
    >
      <div
        className={
          featured
            ? "grid gap-4 md:grid-cols-[230px_minmax(0,1fr)_auto] md:items-center"
            : "flex h-full flex-col"
        }
      >
        {featured ? (
          <div className="relative min-h-[120px] overflow-hidden rounded-md border border-slate-200 bg-slate-100">
            <Image
              src={image}
              alt=""
              fill
              sizes="230px"
              className="object-cover"
              unoptimized
            />
            <span className="absolute left-3 top-3 rounded-md bg-primary px-2.5 py-1 text-[11px] font-semibold uppercase text-white shadow-sm">
              Featured program
            </span>
          </div>
        ) : null}

        <div className="min-w-0">
          <div className="flex flex-wrap gap-2">
            {badges.map((badge) => (
              <Badge key={badge}>{formatLabel(badge)}</Badge>
            ))}
            {program.is_featured && !featured ? <FilledBadge>Featured</FilledBadge> : null}
          </div>
          <h2 className="mt-3 flex items-start gap-2 text-lg font-semibold leading-6 text-slate-950">
            <Link href={href} className="transition hover:text-primary">
              {title}
            </Link>
            <ExternalLink aria-hidden className="mt-1 h-3.5 w-3.5 shrink-0 text-primary" />
          </h2>
          {summary ? (
            <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">{summary}</p>
          ) : null}
          {facts.length ? (
            <dl className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs font-medium text-slate-600">
              {facts.map((fact) => (
                <div key={fact.label} className="inline-flex items-center gap-2">
                  {fact.label === "Timeline" ? (
                    <CalendarDays aria-hidden className="h-4 w-4 text-primary" />
                  ) : (
                    <Building2 aria-hidden className="h-4 w-4 text-primary" />
                  )}
                  <dt className="sr-only">{fact.label}</dt>
                  <dd>{fact.value}</dd>
                </div>
              ))}
            </dl>
          ) : null}
        </div>

        <div className={featured ? "flex flex-col items-start gap-3 md:items-end" : "mt-auto pt-5"}>
          {metrics.length ? (
            <dl className="grid grid-cols-3 gap-2">
              {metrics.map((metric) => (
                <div
                  key={metric.label}
                  className="min-w-[74px] rounded-md border border-slate-200 bg-white px-2.5 py-2 text-center shadow-sm"
                >
                  <dt className="text-[11px] font-medium leading-4 text-slate-500">
                    {metric.label}
                  </dt>
                  <dd className="text-base font-semibold leading-5 text-primary">
                    {metric.value}
                  </dd>
                </div>
              ))}
            </dl>
          ) : null}
          <Link
            href={href}
            className={
              featured
                ? "inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary/90"
                : "inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-primary/30 px-4 py-2 text-sm font-semibold text-primary transition hover:bg-primary hover:text-white"
            }
          >
            Open program
            <ArrowRight aria-hidden className="h-4 w-4" />
          </Link>
          {featured ? (
            <Link href={href} className="text-xs font-semibold text-primary transition hover:text-secondary">
              Program story
            </Link>
          ) : null}
        </div>
      </div>
    </article>
  );
}

function ProgramGuidePanel() {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold text-slate-950">
        How to read a program
      </h2>
      <p className="mt-1 text-sm text-slate-600">
        Each program page brings together what matters.
      </p>
      <div className="mt-4 overflow-hidden rounded-lg border border-slate-200">
        {programGuide.map((item, index) => (
          <div key={item.label} className="flex gap-3 border-b border-slate-200 p-4 last:border-b-0">
            <span
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white ${
                index === 0
                  ? "bg-primary"
                  : index === 1
                    ? "bg-blue-700"
                    : index === 2
                      ? "bg-secondary"
                      : "bg-emerald-700"
              }`}
            >
              {index + 1}
            </span>
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-semibold text-slate-950">{item.label}</h3>
              <p className="mt-1 text-xs leading-5 text-slate-600">{item.body}</p>
            </div>
            <ChevronRight aria-hidden className="mt-2 h-4 w-4 shrink-0 text-slate-400" />
          </div>
        ))}
      </div>
    </section>
  );
}

function ThemesBand({ themes }: { themes: ResearchGenericRecord[] }) {
  return (
    <section className="border-y border-slate-200 bg-slate-50 px-4 py-5 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
      <div className="mx-auto max-w-[1680px] rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-slate-950">
            Programs by theme
          </h2>
          <Link
            href="/expertise"
            className="inline-flex items-center gap-2 text-sm font-semibold text-primary transition hover:text-secondary"
          >
            View all themes
            <ArrowRight aria-hidden className="h-4 w-4" />
          </Link>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {themes.slice(0, 5).map((theme, index) => (
            <Link
              key={theme.id ?? getRecordTitle(theme, `theme-${index}`)}
              href="/expertise"
              className="group flex items-center gap-3 rounded-md border border-slate-200 bg-white p-3 transition hover:border-primary/40 hover:shadow-sm"
            >
              <span
                className={`h-12 w-1 rounded-full ${
                  index % 3 === 0 ? "bg-primary" : index % 3 === 1 ? "bg-blue-700" : "bg-secondary"
                }`}
              />
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold text-slate-950 group-hover:text-primary">
                  {getRecordTitle(theme, "Research theme")}
                </span>
                {compactText(theme.program_count ?? theme.programs_count) ? (
                  <span className="mt-1 block text-xs text-slate-500">
                    {compactText(theme.program_count ?? theme.programs_count)} programs
                  </span>
                ) : null}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function getCenterName(record: ResearchGenericRecord) {
  const center = record.center as ResearchGenericRecord | undefined;
  return center ? getRecordTitle(center, "") : compactText(record.center_name);
}

function getActiveFlags(value?: string) {
  if (value === "inactive") return { isActive: false };
  if (value === "featured") return { isActive: true, isFeatured: true };
  return { isActive: true };
}

function getProgramImage(program: ResearchGenericRecord) {
  return (
    compactText(program.cover_image_url) ||
    compactText(program.image_url) ||
    compactText(program.thumbnail_url) ||
    "/images/research/research-projects-hero.webp"
  );
}

function getProgramMetrics(program: ResearchGenericRecord) {
  return [
    {
      label: "Project streams",
      value: firstPositiveCount(program, [
        "project_streams_count",
        "project_count",
        "projects_count",
        "projects",
      ]),
    },
    {
      label: "Outputs",
      value: firstPositiveCount(program, [
        "outputs_count",
        "research_outputs_count",
        "publications_count",
        "outputs",
      ]),
    },
    {
      label: "Partners",
      value: firstPositiveCount(program, ["partners_count", "partner_count", "partners"]),
    },
  ].filter((metric): metric is { label: string; value: string } => Boolean(metric.value));
}

function firstPositiveCount(record: ResearchGenericRecord, fields: string[]) {
  for (const field of fields) {
    const value = record[field];
    const count = Array.isArray(value) ? value.length : Number(value);
    if (Number.isFinite(count) && count > 0) return String(count);
  }
  return "";
}
