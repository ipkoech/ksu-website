import type { Metadata } from "next";
import type { ResearchGenericRecord, ResearchProject } from "@ksu/api-client";
import Link from "next/link";
import { ResearchFact } from "../../components/research-detail";
import { ResearchFilterForm, ResearchRecordRow } from "../../components/research-listing";
import { Badge, FilledBadge, PrimaryLink, ResearchSection, SecondaryLink, StatusMessage } from "../../components/research-ui";
import {
  compactText,
  formatDate,
  formatLabel,
  getFacilitiesFiltered,
  getFarmActivities,
  getFarmPartners,
  getFarmProjects,
  getFocusAreas,
  getStories,
} from "../../lib/research-public-data";
import {
  filterRecordsByMonth,
  getRecordMonths,
  getRecordSummary,
  getRecordTimelineLabel,
  getRecordTitle,
  getRecordYears,
} from "../../lib/research-page-model";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "University Farm",
  description: "Research farms and farm-linked sustainability work.",
};

type FarmSearchParams = { q?: string; type?: string; active?: string; status?: string; year?: string; month?: string; sort?: string };
const farmTypes = ["crop", "livestock", "aquaculture", "mixed", "demonstration", "experimental"];
const farmStatuses = ["active", "inactive", "maintenance", "planned"];
const activeStates = [
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
  { label: "Featured", value: "featured" },
];
const sortOptions = [
  { value: "name", label: "Name A-Z" },
  { value: "created_at", label: "Newest" },
  { value: "updated_at", label: "Recently updated" },
  { value: "farm_type", label: "Type" },
];

export default async function FarmPage({ searchParams }: { searchParams?: Promise<FarmSearchParams> }) {
  const params = (await searchParams) ?? {};
  const sort = params.sort || "name";
  const order = sort === "name" || sort === "farm_type" ? "asc" : "desc";
  const activeFlags = getActiveFlags(params.active);
  const [farms, projects, partners, activities, stories, focusAreas] =
    await Promise.all([
      getFacilitiesFiltered({
        search: params.q,
        farmType: params.type,
        status: params.status,
        year: params.year,
        sort,
        order,
        ...activeFlags,
      }),
      getFarmProjects(),
      getFarmPartners(),
      getFarmActivities(),
      getStories(),
      getFocusAreas(),
    ]);
  const visibleFarms = filterRecordsByMonth(farms.data, params.year, params.month);
  const farmStories = stories.data.filter((story) =>
    ["community", "farm", "agriculture"].includes(compactText(story.story_type).toLowerCase()),
  );
  const errors = [farms, projects, partners, activities, stories, focusAreas].flatMap((item) =>
    item.error ? [item.error] : [],
  );

  return (
    <main id="research-main" className="min-h-screen bg-white">
      <FarmMasthead farmCount={visibleFarms.length} projectCount={projects.data.length} partnerCount={partners.data.length} activityCount={activities.data.length} />

      {errors.length > 0 ? <ErrorBand errors={errors} /> : null}

      <ResearchSection
        eyebrow="Facilities"
        title="University farm facilities"
        body="Search first, then use the filter menu for farm type, active state, status, year, and sort order."
        tone="white"
      >
        <FarmFilters params={params} years={getRecordYears(farms.data)} months={getRecordMonths(farms.data, params.year)} />
        {visibleFarms.length > 0 ? (
          <div className="mt-6 divide-y divide-slate-200 rounded-lg border border-slate-200 bg-white shadow-sm">
            {visibleFarms.map((farm) => <FarmRow key={farm.id} farm={farm} />)}
          </div>
        ) : <div className="mt-7"><StatusMessage>No farm records match the current filters.</StatusMessage></div>}
      </ResearchSection>

      {projects.data.length > 0 ? (
        <ResearchSection
          eyebrow="Action Research"
          title="Farm-linked projects"
          body="Action and applied projects show how the farm supports field trials, demonstrations, and practical research outcomes."
        >
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {projects.data.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </ResearchSection>
      ) : null}

      {partners.data.length > 0 || activities.data.length > 0 ? (
        <ResearchSection
          eyebrow="Engagement"
          title="Partnerships and activities"
          body="Community partners and public activities show how farm work moves beyond the campus."
          tone="white"
        >
          <div className="grid gap-5 lg:grid-cols-2">
            {partners.data.length > 0 ? (
              <RecordListPanel title="Farm partnerships" records={partners.data} />
            ) : null}
            {activities.data.length > 0 ? (
              <RecordListPanel title="Farm activities" records={activities.data} dateField="start_date" />
            ) : null}
          </div>
        </ResearchSection>
      ) : null}

      {farmStories.length > 0 || focusAreas.data.length > 0 ? (
        <ResearchSection
          eyebrow="Impact"
          title="Stories and focus areas"
          body="Impact stories and focus areas describe the farm's research priorities and community outcomes."
        >
          <div className="grid gap-5 lg:grid-cols-2">
            {farmStories.length > 0 ? (
              <RecordListPanel title="Impact stories" records={farmStories} />
            ) : null}
            {focusAreas.data.length > 0 ? (
              <RecordListPanel title="Focus areas" records={focusAreas.data} />
            ) : null}
          </div>
        </ResearchSection>
      ) : null}
    </main>
  );
}

function FarmMasthead({ farmCount, projectCount, partnerCount, activityCount }: { farmCount: number; projectCount: number; partnerCount: number; activityCount: number }) {
  const stats = [
    { label: "Farm records", value: farmCount },
    { label: "Farm projects", value: projectCount },
    { label: "Partners", value: partnerCount },
    { label: "Activities", value: activityCount },
  ];
  return (
    <section className="border-b border-slate-200 bg-white px-4 py-6 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
      <div className="mx-auto grid max-w-[1680px] gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(320px,520px)] lg:items-end">
        <div>
          <nav className="mb-4 flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500" aria-label="Breadcrumb">
            <Link href="/" className="transition hover:text-primary">Home</Link>
            <span className="text-slate-300">/</span>
            <span className="text-slate-900">University Farm</span>
          </nav>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-secondary">University Farm</p>
          <h1 className="mt-3 max-w-5xl text-balance font-[family-name:var(--font-display)] text-3xl font-semibold leading-tight text-slate-950 sm:text-4xl">Farm-linked research, facilities, field demonstrations, and public engagement</h1>
          <p className="mt-3 max-w-4xl text-pretty text-sm leading-7 text-slate-700 sm:text-base">Browse farm records with project, partner, activity, story, and focus-area evidence from the backend.</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <PrimaryLink href="/sustainability">View sustainability</PrimaryLink>
            <SecondaryLink href="/community-impact">Community impact</SecondaryLink>
          </div>
        </div>
        <dl className="grid gap-2 sm:grid-cols-2">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2"><dt className="text-[11px] font-semibold uppercase text-slate-500">{stat.label}</dt><dd className="mt-1 text-lg font-semibold text-slate-950">{stat.value}</dd></div>
          ))}
        </dl>
      </div>
    </section>
  );
}

function FarmFilters({ params, years, months }: { params: FarmSearchParams; years: string[]; months: Array<{ value: string; label: string }> }) {
  return (
    <ResearchFilterForm
      action="/farm"
      resetHref="/farm"
      searchValue={params.q}
      searchPlaceholder="Farm name, location, activities, products"
      selects={[
        { name: "type", label: "Type", value: params.type, options: farmTypes },
        { name: "active", label: "Active state", value: params.active, options: activeStates },
        { name: "status", label: "Status", value: params.status, options: farmStatuses },
        { name: "year", label: "Year", value: params.year, options: years },
        { name: "month", label: "Month", value: params.month, options: months },
      ]}
      sortValue={params.sort}
      sortOptions={sortOptions}
    />
  );
}

function FarmRow({ farm }: { farm: ResearchGenericRecord }) {
  return (
    <ResearchRecordRow
      href={farm.slug ? `/farm/${farm.slug}` : "/farm"}
      title={getRecordTitle(farm, "University farm")}
      description={getRecordSummary(farm) || compactText(farm.activities) || compactText(farm.products) || "Farm profile has not been published yet."}
      badges={[farm.farm_type ?? "farm", farm.status]}
      filledBadges={[farm.is_featured ? "Featured" : null]}
      facts={[
        { label: "Size", value: farm.size_hectares ? `${compactText(farm.size_hectares)} hectares` : "" },
        { label: "Location", value: compactText(farm.location) || compactText(farm.county) },
        { label: "Updated", value: getRecordTimelineLabel(farm) },
      ]}
    />
  );
}

function ProjectCard({ project }: { project: ResearchProject }) {
  const projectRecord = project as ResearchProject & Record<string, unknown>;
  const description =
    compactText(project.summary) ||
    compactText(projectRecord.expected_outcomes as string | number | null | undefined) ||
    compactText(projectRecord.impact as string | number | null | undefined);

  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap gap-2">
        <Badge>{formatLabel(project.project_type ?? "research")}</Badge>
        {project.status ? <Badge>{formatLabel(project.status)}</Badge> : null}
        {project.is_featured ? <FilledBadge>Featured</FilledBadge> : null}
      </div>
      <h2 className="mt-4 text-xl font-semibold leading-7 text-slate-950">
        {project.slug ? (
          <a href={`/projects/${project.slug}`} className="transition hover:text-primary">
            {project.title}
          </a>
        ) : (
          project.title
        )}
      </h2>
      {description ? (
        <p className="mt-3 text-sm leading-7 text-slate-600">{description}</p>
      ) : null}
      <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
        <ResearchFact label="Progress" value={`${project.progress_percentage ?? 0}%`} />
        {project.updated_at ? <ResearchFact label="Updated" value={formatDate(project.updated_at)} /> : null}
      </dl>
    </article>
  );
}

function getActiveFlags(value?: string) {
  if (value === "inactive") return { isActive: false };
  if (value === "featured") return { isActive: true, isFeatured: true };
  return { isActive: true };
}

function RecordListPanel({
  title,
  records,
  dateField,
}: {
  title: string;
  records: ResearchGenericRecord[];
  dateField?: string;
}) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-xl font-semibold text-slate-950">{title}</h2>
      <div className="mt-4 divide-y divide-slate-200">
        {records.slice(0, 8).map((record) => (
          <article key={record.id} className="py-4 first:pt-0 last:pb-0">
            <div className="flex flex-wrap gap-2">
              {record.partner_type ? <Badge>{formatLabel(record.partner_type)}</Badge> : null}
              {record.event_type ? <Badge>{formatLabel(record.event_type)}</Badge> : null}
              {record.status ? <Badge>{formatLabel(record.status)}</Badge> : null}
            </div>
            <h3 className="mt-3 text-base font-semibold leading-6 text-slate-950">
              {compactText(record.name) || compactText(record.title) || compactText(record.code)}
            </h3>
            {compactText(record.about) || compactText(record.summary) || compactText(record.description) ? (
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {compactText(record.about) || compactText(record.summary) || compactText(record.description)}
              </p>
            ) : null}
            {dateField && record[dateField] ? (
              <p className="mt-2 text-xs font-semibold uppercase text-slate-500">
                {formatDate(record[dateField] as string)}
              </p>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  );
}

function ErrorBand({ errors }: { errors: string[] }) {
  const uniqueErrors = Array.from(new Set(errors));

  return (
    <section className="px-4 pt-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-[1680px] flex-col gap-3">
        {uniqueErrors.map((error) => (
          <StatusMessage key={error} tone="error">
            {error}
          </StatusMessage>
        ))}
      </div>
    </section>
  );
}
