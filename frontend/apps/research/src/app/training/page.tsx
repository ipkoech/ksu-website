import type { Metadata } from "next";
import Link from "next/link";
import { BookOpenCheck, CalendarDays, Newspaper, Users } from "lucide-react";
import { ResearchClusterHero } from "../../components/research-cluster";
import { Badge, FilledBadge, ResearchSection, StatusMessage } from "../../components/research-ui";
import {
  compactText,
  formatDate,
  formatLabel,
  getCenters,
  getTraining,
  getTrainingFiltered,
} from "../../lib/research-public-data";
import type { ResearchGenericRecord } from "@ksu/api-client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Training Programs",
  description: "Research training programmes, workshops, and bootcamps.",
};

type TrainingSearchParams = {
  q?: string;
  type?: string;
  mode?: string;
  category?: string;
  status?: string;
  center?: string;
  year?: string;
  sort?: string;
};

const programTypes = ["workshop", "course", "seminar", "webinar", "bootcamp", "conference", "retreat"];
const deliveryModes = ["in_person", "online", "hybrid"];
const categories = ["research_methods", "writing", "grant_writing", "data_analysis", "leadership", "ethics", "career"];
const statuses = ["draft", "published", "ongoing", "completed", "cancelled", "postponed"];

const learningLinks = [
  { label: "Training", href: "/training", description: "Workshops, courses, bootcamps, and seminars.", icon: BookOpenCheck },
  { label: "Mentorship", href: "/mentorship", description: "Mentor and mentee pathways for research growth.", icon: Users },
  { label: "Events", href: "/events", description: "Public calendar for forums, workshops, and conferences.", icon: CalendarDays },
  { label: "News", href: "/news", description: "Research updates, notices, stories, and articles.", icon: Newspaper },
];

export default async function TrainingPage({ searchParams }: { searchParams?: Promise<TrainingSearchParams> }) {
  const params = (await searchParams) ?? {};
  const [training, allTraining, centers] = await Promise.all([
    getTrainingFiltered({
      search: params.q,
      programType: params.type,
      deliveryMode: params.mode,
      category: params.category,
      status: params.status,
      centerId: params.center,
      year: params.year,
      sort: params.sort || "start_date",
      order: params.sort === "title" ? "asc" : "desc",
    }),
    getTraining(),
    getCenters(),
  ]);

  return (
    <main id="research-main" className="min-h-screen bg-white">
      <ResearchClusterHero
        eyebrow="Learning"
        title="Research training, workshops, seminars, and bootcamps."
        body="Find research methods, writing, ethics, grant writing, data, innovation, and leadership capacity-building programmes."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Learning", href: "/training" }, { label: "Training" }]}
        imageSrc="/images/research/research-demo-imagegen.png"
        imageAlt="Research training workshop with staff and postgraduate students"
        links={learningLinks}
        primaryAction={{ label: "View events", href: "/events" }}
        stats={[
          { label: "Training results", value: training.data.length },
          { label: "Published training", value: allTraining.data.length },
          { label: "Centers", value: centers.data.length },
          { label: "Delivery modes", value: deliveryModes.length },
        ]}
      />
      <ResearchSection
        eyebrow="Training Catalogue"
        title="Training programs"
        body="Training records are loaded from the Research Training endpoint and filtered through backend query parameters."
        tone="white"
      >
        <TrainingFilters params={params} years={getYears(allTraining.data)} centers={centers.data} />
        {[training.error, allTraining.error, centers.error].filter(Boolean).map((error) => (
          <div key={error} className="mt-5"><StatusMessage tone="error">{error}</StatusMessage></div>
        ))}
        {training.data.length > 0 ? (
          <div className="mt-7 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {training.data.map((item) => <TrainingCard key={item.id} item={item} />)}
          </div>
        ) : (
          <div className="mt-7"><StatusMessage>No training programs match the current filters.</StatusMessage></div>
        )}
      </ResearchSection>
    </main>
  );
}

function TrainingFilters({ params, years, centers }: { params: TrainingSearchParams; years: string[]; centers: ResearchGenericRecord[] }) {
  return (
    <form className="rounded-lg border border-slate-200 bg-slate-50 p-4" action="/training">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
        <label className="xl:col-span-2">
          <span className="text-xs font-semibold uppercase text-slate-500">Search</span>
          <input name="q" defaultValue={params.q ?? ""} placeholder="Title, curriculum, audience" className="mt-2 h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-primary" />
        </label>
        <SelectField name="type" label="Type" value={params.type} options={programTypes} />
        <SelectField name="mode" label="Mode" value={params.mode} options={deliveryModes} />
        <SelectField name="category" label="Category" value={params.category} options={categories} />
        <SelectField name="status" label="Status" value={params.status} options={statuses} />
        <SelectField name="year" label="Year" value={params.year} options={years} />
        <label className="md:col-span-2 xl:col-span-3">
          <span className="text-xs font-semibold uppercase text-slate-500">Center</span>
          <select name="center" defaultValue={params.center ?? ""} className="mt-2 h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-primary">
            <option value="">All centers</option>
            {centers.map((center) => <option key={center.id} value={center.id}>{center.name ?? center.title ?? center.code ?? center.id}</option>)}
          </select>
        </label>
        <label>
          <span className="text-xs font-semibold uppercase text-slate-500">Sort</span>
          <select name="sort" defaultValue={params.sort ?? "start_date"} className="mt-2 h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-primary">
            <option value="start_date">Start date</option>
            <option value="registration_deadline">Registration deadline</option>
            <option value="created_at">Newest</option>
            <option value="title">Title</option>
          </select>
        </label>
        <div className="flex items-end gap-2 md:col-span-2 xl:col-span-2">
          <button className="inline-flex h-11 items-center justify-center rounded-full bg-primary px-5 text-sm font-semibold text-white transition hover:bg-primary/90">Apply filters</button>
          <Link href="/training" className="inline-flex h-11 items-center justify-center rounded-full border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:border-primary/40 hover:text-primary">Reset</Link>
        </div>
      </div>
    </form>
  );
}

function SelectField({ name, label, value, options }: { name: string; label: string; value?: string; options: string[] }) {
  return (
    <label>
      <span className="text-xs font-semibold uppercase text-slate-500">{label}</span>
      <select name={name} defaultValue={value ?? ""} className="mt-2 h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-primary">
        <option value="">All {label.toLowerCase()}</option>
        {options.map((option) => <option key={option} value={option}>{formatLabel(option)}</option>)}
      </select>
    </label>
  );
}

function TrainingCard({ item }: { item: ResearchGenericRecord }) {
  return (
    <Link href={item.slug ? `/training/${item.slug}` : "/training"} className="block rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:border-primary/30 hover:shadow-[0_22px_60px_-42px_rgba(15,23,42,0.45)]">
      <div className="flex flex-wrap gap-2">
        <Badge>{formatLabel(item.program_type ?? "training")}</Badge>
        <Badge>{formatLabel(item.delivery_mode ?? item.status)}</Badge>
        {item.offers_certificate ? <FilledBadge>Certificate</FilledBadge> : null}
      </div>
      <h2 className="mt-4 text-xl font-semibold leading-7 text-slate-950">{item.title}</h2>
      <p className="mt-3 text-sm leading-7 text-slate-600">{compactText(item.summary) || compactText(item.target_audience) || "Training details will appear when published."}</p>
      <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
        <Fact label="Starts" value={formatDate(item.start_date)} />
        <Fact label="Registration" value={formatDate(item.registration_deadline)} />
      </dl>
    </Link>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return <div className="rounded-md bg-slate-50 p-3"><dt className="text-xs font-semibold uppercase text-slate-500">{label}</dt><dd className="mt-1 font-semibold text-slate-950">{value || "Not published"}</dd></div>;
}

function getYears(records: ResearchGenericRecord[]) {
  const years = records.flatMap((record) => [record.start_date, record.end_date, record.created_at]).map((value) => value ? new Date(value).getFullYear() : null).filter((year): year is number => Boolean(year) && !Number.isNaN(year));
  return Array.from(new Set(years)).sort((a, b) => b - a).map(String);
}
