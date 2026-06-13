import type { Metadata } from "next";
import Link from "next/link";
import { BookOpenCheck, CalendarDays, Newspaper, Users } from "lucide-react";
import { ResearchClusterHero } from "../../components/research-cluster";
import { Badge, FilledBadge, ResearchSection, StatusMessage } from "../../components/research-ui";
import { compactText, formatDate, formatLabel, getCenters, getMentorship, getMentorshipFiltered } from "../../lib/research-public-data";
import type { ResearchGenericRecord } from "@ksu/api-client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Research Mentorship",
  description: "Research mentorship programmes and sign-up pathways.",
};

type MentorshipSearchParams = { q?: string; type?: string; status?: string; center?: string; year?: string; sort?: string };
const programTypes = ["research", "career", "academic", "writing", "grant_writing", "leadership"];
const statuses = ["draft", "accepting_applications", "matching", "active", "completed", "suspended"];

const learningLinks = [
  { label: "Training", href: "/training", description: "Workshops, courses, bootcamps, and seminars.", icon: BookOpenCheck },
  { label: "Mentorship", href: "/mentorship", description: "Mentor and mentee pathways for research growth.", icon: Users },
  { label: "Events", href: "/events", description: "Public calendar for forums, workshops, and conferences.", icon: CalendarDays },
  { label: "News", href: "/news", description: "Research updates, notices, stories, and articles.", icon: Newspaper },
];

export default async function MentorshipPage({ searchParams }: { searchParams?: Promise<MentorshipSearchParams> }) {
  const params = (await searchParams) ?? {};
  const [mentorship, allMentorship, centers] = await Promise.all([
    getMentorshipFiltered({
      search: params.q,
      programType: params.type,
      status: params.status,
      centerId: params.center,
      year: params.year,
      sort: params.sort || "application_deadline",
      order: params.sort === "name" ? "asc" : "desc",
    }),
    getMentorship(),
    getCenters(),
  ]);

  return (
    <main id="research-main" className="min-h-screen bg-white">
      <ResearchClusterHero eyebrow="Learning" title="Mentor and mentee pathways for research growth." body="Find structured mentorship programmes for researchers, students, writers, grant applicants, and emerging leaders." breadcrumbs={[{ label: "Home", href: "/" }, { label: "Learning", href: "/training" }, { label: "Mentorship" }]} imageSrc="/images/research/registrar-reirm-imagegen.png" imageAlt="Mentorship session for researchers and postgraduate students" links={learningLinks} primaryAction={{ label: "View training", href: "/training" }} stats={[{ label: "Mentorship results", value: mentorship.data.length }, { label: "Published mentorship", value: allMentorship.data.length }, { label: "Centers", value: centers.data.length }, { label: "Program types", value: programTypes.length }]} />
      <ResearchSection eyebrow="Mentorship Pathways" title="Mentorship programmes" body="Mentorship records are loaded from the Research Mentorship endpoint and filtered through backend query parameters." tone="white">
        <MentorshipFilters params={params} years={getYears(allMentorship.data)} centers={centers.data} />
        {[mentorship.error, allMentorship.error, centers.error].filter(Boolean).map((error) => <div key={error} className="mt-5"><StatusMessage tone="error">{error}</StatusMessage></div>)}
        {mentorship.data.length > 0 ? <div className="mt-7 grid gap-5 md:grid-cols-2 xl:grid-cols-3">{mentorship.data.map((item) => <MentorshipCard key={item.id} item={item} />)}</div> : <div className="mt-7"><StatusMessage>No mentorship programmes match the current filters.</StatusMessage></div>}
      </ResearchSection>
    </main>
  );
}

function MentorshipFilters({ params, years, centers }: { params: MentorshipSearchParams; years: string[]; centers: ResearchGenericRecord[] }) {
  return (
    <form className="rounded-lg border border-slate-200 bg-slate-50 p-4" action="/mentorship">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
        <label className="xl:col-span-2"><span className="text-xs font-semibold uppercase text-slate-500">Search</span><input name="q" defaultValue={params.q ?? ""} placeholder="Programme, requirements, benefits" className="mt-2 h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-primary" /></label>
        <SelectField name="type" label="Type" value={params.type} options={programTypes} />
        <SelectField name="status" label="Status" value={params.status} options={statuses} />
        <SelectField name="year" label="Year" value={params.year} options={years} />
        <label className="xl:col-span-2"><span className="text-xs font-semibold uppercase text-slate-500">Center</span><select name="center" defaultValue={params.center ?? ""} className="mt-2 h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-primary"><option value="">All centers</option>{centers.map((center) => <option key={center.id} value={center.id}>{center.name ?? center.title ?? center.code ?? center.id}</option>)}</select></label>
        <label><span className="text-xs font-semibold uppercase text-slate-500">Sort</span><select name="sort" defaultValue={params.sort ?? "application_deadline"} className="mt-2 h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-primary"><option value="application_deadline">Application deadline</option><option value="cohort_start_date">Cohort start</option><option value="created_at">Newest</option><option value="name">Name</option></select></label>
        <div className="flex items-end gap-2 md:col-span-2 xl:col-span-5"><button className="inline-flex h-11 items-center justify-center rounded-full bg-primary px-5 text-sm font-semibold text-white transition hover:bg-primary/90">Apply filters</button><Link href="/mentorship" className="inline-flex h-11 items-center justify-center rounded-full border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:border-primary/40 hover:text-primary">Reset</Link></div>
      </div>
    </form>
  );
}

function SelectField({ name, label, value, options }: { name: string; label: string; value?: string; options: string[] }) {
  return <label><span className="text-xs font-semibold uppercase text-slate-500">{label}</span><select name={name} defaultValue={value ?? ""} className="mt-2 h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-primary"><option value="">All {label.toLowerCase()}</option>{options.map((option) => <option key={option} value={option}>{formatLabel(option)}</option>)}</select></label>;
}

function MentorshipCard({ item }: { item: ResearchGenericRecord }) {
  return (
    <Link href={item.slug ? `/mentorship/${item.slug}` : "/mentorship"} className="block rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:border-primary/30 hover:shadow-[0_22px_60px_-42px_rgba(15,23,42,0.45)]">
      <div className="flex flex-wrap gap-2"><Badge>{formatLabel(item.program_type ?? "mentorship")}</Badge><Badge>{formatLabel(item.status ?? "active")}</Badge>{item.is_featured ? <FilledBadge>Featured</FilledBadge> : null}</div>
      <h2 className="mt-4 text-xl font-semibold leading-7 text-slate-950">{item.name ?? item.title}</h2>
      <p className="mt-3 text-sm leading-7 text-slate-600">{compactText(item.summary) || compactText(item.benefits) || "Mentorship details will appear when published."}</p>
      <dl className="mt-5 grid grid-cols-2 gap-3 text-sm"><Fact label="Deadline" value={formatDate(item.application_deadline)} /><Fact label="Cohort" value={formatDate(item.cohort_start_date)} /></dl>
    </Link>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return <div className="rounded-md bg-slate-50 p-3"><dt className="text-xs font-semibold uppercase text-slate-500">{label}</dt><dd className="mt-1 font-semibold text-slate-950">{value || "Not published"}</dd></div>;
}

function getYears(records: ResearchGenericRecord[]) {
  const years = records.flatMap((record) => [record.application_open, record.application_deadline, record.cohort_start_date, record.created_at]).map((value) => value ? new Date(value).getFullYear() : null).filter((year): year is number => Boolean(year) && !Number.isNaN(year));
  return Array.from(new Set(years)).sort((a, b) => b - a).map(String);
}
