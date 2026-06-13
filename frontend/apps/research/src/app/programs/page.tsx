import type { Metadata } from "next";
import Link from "next/link";
import { BookOpenCheck, Building2, FlaskConical, GraduationCap, Sprout } from "lucide-react";
import { ResearchClusterHero } from "../../components/research-cluster";
import {
  Badge,
  FilledBadge,
  ResearchSection,
  StatusMessage,
} from "../../components/research-ui";
import {
  compactText,
  formatDate,
  formatLabel,
  getCenters,
  getPrograms,
  getProgramsFiltered,
  getThemes,
} from "../../lib/research-public-data";
import type { ResearchGenericRecord } from "@ksu/api-client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Research Programs",
  description: "Institutional research programs and themes at Kisii University.",
};

type ProgramSearchParams = {
  q?: string;
  status?: string;
  center?: string;
  year?: string;
  sort?: string;
};

const programStatuses = ["planning", "active", "completed", "suspended", "cancelled"];

const discoveryLinks = [
  {
    label: "Projects",
    href: "/projects",
    description: "Browse funded, applied, action, and collaborative work.",
    icon: FlaskConical,
  },
  {
    label: "Programs",
    href: "/programs",
    description: "See long-term research pathways and related projects.",
    icon: BookOpenCheck,
  },
  {
    label: "Centers",
    href: "/centers",
    description: "Find the institutional homes for research activity.",
    icon: Building2,
  },
  {
    label: "Facilities",
    href: "/facilities",
    description: "Explore farms, labs, and practical research infrastructure.",
    icon: Sprout,
  },
  {
    label: "Capacity",
    href: "/capacity",
    description: "Training, mentorship, and scholarship support.",
    icon: GraduationCap,
  },
];

export default async function ProgramsPage({
  searchParams,
}: {
  searchParams?: Promise<ProgramSearchParams>;
}) {
  const params = (await searchParams) ?? {};
  const [programs, allPrograms, centers, themes] = await Promise.all([
    getProgramsFiltered({
      search: params.q,
      status: params.status,
      centerId: params.center,
      year: params.year,
      sort: params.sort || "created_at",
      order: params.sort === "name" ? "asc" : "desc",
    }),
    getPrograms(),
    getCenters(),
    getThemes(),
  ]);

  return (
    <main id="research-main" className="min-h-screen bg-white">
      <ResearchClusterHero
        eyebrow="Discovery"
        title="Research programs and long-term inquiry pathways."
        body="Programs organize related projects, centers, themes, and outputs into public research pathways."
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Discovery", href: "/projects" },
          { label: "Programs" },
        ]}
        imageSrc="/images/research/research-demo-imagegen.png"
        imageAlt="Research teams reviewing long-term programmes and project pathways"
        links={discoveryLinks}
        primaryAction={{ label: "Browse projects", href: "/projects" }}
        stats={[
          { label: "Program results", value: programs.data.length },
          { label: "Published programs", value: allPrograms.data.length },
          { label: "Centers", value: centers.data.length },
          { label: "Themes", value: themes.data.length },
        ]}
      />

      <ResearchSection
        eyebrow="Programs"
        title="Program catalogue"
        body="Program records are loaded from the Research Programs endpoint and can be filtered by status, center, and year."
        tone="white"
      >
        <ProgramFilters
          params={params}
          centers={centers.data}
          years={getProgramYears(allPrograms.data)}
        />

        {[programs.error, centers.error]
          .filter(Boolean)
          .map((error) => (
            <div key={error} className="mt-5">
              <StatusMessage tone="error">{error}</StatusMessage>
            </div>
          ))}

        {programs.data.length > 0 ? (
          <div className="mt-7 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {programs.data.map((program) => (
              <ProgramCard key={program.id} program={program} />
            ))}
          </div>
        ) : (
          <div className="mt-7">
            <StatusMessage>No research programs match the current filters.</StatusMessage>
          </div>
        )}
      </ResearchSection>

      <ResearchSection
        eyebrow="Focus"
        title="Themes supporting discovery"
        body="Theme records provide the public focus-area language that helps visitors understand the research portfolio."
      >
        {themes.error ? <StatusMessage tone="error">{themes.error}</StatusMessage> : null}
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {themes.data.map((theme) => (
            <article key={theme.id} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap gap-2">
                {[theme.theme_type, theme.category, theme.status].map(compactText).filter(Boolean).slice(0, 2).map((label) => (
                  <Badge key={label}>{formatLabel(label)}</Badge>
                ))}
              </div>
              <h2 className="mt-4 text-xl font-semibold text-slate-950">
                {theme.name ?? theme.title}
              </h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                {compactText(theme.summary) ||
                  compactText(theme.description) ||
                  "Additional theme detail will appear when published."}
              </p>
            </article>
          ))}
          {themes.data.length === 0 ? (
            <StatusMessage>No research themes are currently published.</StatusMessage>
          ) : null}
        </div>
      </ResearchSection>
    </main>
  );
}

function ProgramFilters({
  params,
  centers,
  years,
}: {
  params: ProgramSearchParams;
  centers: ResearchGenericRecord[];
  years: string[];
}) {
  return (
    <form className="rounded-lg border border-slate-200 bg-slate-50 p-4" action="/programs">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
        <label className="xl:col-span-2">
          <span className="text-xs font-semibold uppercase text-slate-500">Search</span>
          <input
            name="q"
            defaultValue={params.q ?? ""}
            placeholder="Program name, summary, code"
            className="mt-2 h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-primary"
          />
        </label>
        <SelectField name="status" label="Status" value={params.status} options={programStatuses} />
        <SelectField name="year" label="Year" value={params.year} options={years} />
        <label>
          <span className="text-xs font-semibold uppercase text-slate-500">Sort</span>
          <select
            name="sort"
            defaultValue={params.sort ?? "created_at"}
            className="mt-2 h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-primary"
          >
            <option value="created_at">Newest</option>
            <option value="start_date">Start date</option>
            <option value="name">Name</option>
          </select>
        </label>
        <label className="md:col-span-2 xl:col-span-3">
          <span className="text-xs font-semibold uppercase text-slate-500">Center</span>
          <select
            name="center"
            defaultValue={params.center ?? ""}
            className="mt-2 h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-primary"
          >
            <option value="">All centers</option>
            {centers.map((center) => (
              <option key={center.id} value={center.id}>
                {center.name ?? center.title ?? center.code ?? center.id}
              </option>
            ))}
          </select>
        </label>
        <div className="flex items-end gap-2 md:col-span-2 xl:col-span-3">
          <button className="inline-flex h-11 items-center justify-center rounded-full bg-primary px-5 text-sm font-semibold text-white transition hover:bg-primary/90">
            Apply filters
          </button>
          <Link
            href="/programs"
            className="inline-flex h-11 items-center justify-center rounded-full border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:border-primary/40 hover:text-primary"
          >
            Reset
          </Link>
        </div>
      </div>
    </form>
  );
}

function SelectField({
  name,
  label,
  value,
  options,
}: {
  name: string;
  label: string;
  value?: string;
  options: string[];
}) {
  return (
    <label>
      <span className="text-xs font-semibold uppercase text-slate-500">{label}</span>
      <select
        name={name}
        defaultValue={value ?? ""}
        className="mt-2 h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-primary"
      >
        <option value="">All {label.toLowerCase()}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {formatLabel(option)}
          </option>
        ))}
      </select>
    </label>
  );
}

function ProgramCard({ program }: { program: ResearchGenericRecord }) {
  return (
    <Link
      href={program.slug ? `/programs/${program.slug}` : "/programs"}
      className="group block rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:border-primary/30 hover:shadow-[0_22px_60px_-42px_rgba(15,23,42,0.45)]"
    >
      <div className="flex flex-wrap gap-2">
        <Badge>{formatLabel(program.status ?? "active")}</Badge>
        {program.is_featured ? <FilledBadge>Featured</FilledBadge> : null}
      </div>
      <h2 className="mt-4 text-xl font-semibold leading-7 text-slate-950">
        {program.name ?? program.title}
      </h2>
      <p className="mt-3 text-sm leading-7 text-slate-600">
        {compactText(program.summary) ||
          compactText(program.description) ||
          "Program overview will appear when published by the research office."}
      </p>
      <p className="mt-5 rounded-md bg-slate-50 p-3 text-sm font-semibold text-slate-700">
        {[formatDate(program.start_date), formatDate(program.end_date)]
          .filter(Boolean)
          .join(" - ") || "Timeline not published"}
      </p>
    </Link>
  );
}

function getProgramYears(programs: ResearchGenericRecord[]) {
  const years = programs
    .flatMap((program) => [program.start_date, program.end_date, program.created_at])
    .map((value) => (value ? new Date(value).getFullYear() : null))
    .filter((year): year is number => Boolean(year) && !Number.isNaN(year));
  return Array.from(new Set(years))
    .sort((a, b) => b - a)
    .map(String);
}
