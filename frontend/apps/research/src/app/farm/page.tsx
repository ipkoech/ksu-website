import type { Metadata } from "next";
import type { ResearchGenericRecord, ResearchProject } from "@ksu/api-client";
import Image from "next/image";
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
  const years = getRecordYears(farms.data);
  const months = getRecordMonths(farms.data, params.year);

  return (
    <main id="research-main" className="min-h-screen bg-white">
      <FarmHero farmCount={visibleFarms.length} projectCount={projects.data.length} partnerCount={partners.data.length} activityCount={activities.data.length} />
      <LandingTabs
        items={[
          { href: "#overview", label: "Overview" },
          { href: "#facilities", label: "Facilities" },
          { href: "#projects", label: "Projects" },
          { href: "#demonstrations", label: "Demonstrations" },
          { href: "#stories", label: "Stories" },
        ]}
      />

      {errors.length > 0 ? <ErrorBand errors={errors} /> : null}

      <ResearchSection
        id="overview"
        eyebrow="At The Farm"
        title="A living site for research, demonstrations, and community learning"
        body="Published facility, project, activity, partner, story, and focus-area records shape the farm page without invented content."
        tone="white"
      >
        <FarmOverview farms={visibleFarms} projects={projects.data} activities={activities.data} focusAreas={focusAreas.data} />
      </ResearchSection>

      <ResearchSection
        id="facilities"
        eyebrow="Facilities"
        title="Find farm facilities"
        body="Search first, then use the filter menu for farm type, active state, status, year, and sort order."
      >
        <FarmFilters params={params} years={years} months={months} />
        {visibleFarms.length > 0 ? (
          <div className="mt-6 divide-y divide-border rounded-lg border border-border bg-white shadow-sm">
            {visibleFarms.map((farm) => <FarmRow key={farm.id} farm={farm} />)}
          </div>
        ) : <div className="mt-7"><StatusMessage>No farm records match the current filters.</StatusMessage></div>}
      </ResearchSection>

      <ResearchSection
        id="projects"
        eyebrow="Action Research"
        title="Farm-linked projects"
        body="Action and applied projects show how the farm supports field trials, demonstrations, and practical research outcomes."
        tone="white"
      >
        {projects.data.length > 0 ? (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {projects.data.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        ) : <StatusMessage>Farm-linked project records are not published yet.</StatusMessage>}
      </ResearchSection>

      <ResearchSection
        id="demonstrations"
        eyebrow="Engagement"
        title="Partnerships and activities"
        body="Community partners and public activities show how farm work moves beyond the campus."
      >
        <div className="grid gap-5 lg:grid-cols-2">
          {partners.data.length > 0 ? (
            <RecordListPanel title="Farm partnerships" records={partners.data} />
          ) : <StatusMessage>Farm partnership records are not published yet.</StatusMessage>}
          {activities.data.length > 0 ? (
            <RecordListPanel title="Farm activities" records={activities.data} dateField="start_date" />
          ) : <StatusMessage>Farm activity records are not published yet.</StatusMessage>}
        </div>
      </ResearchSection>

      <ResearchSection
        id="stories"
        eyebrow="Impact"
        title="Stories and focus areas"
        body="Impact stories and focus areas describe the farm's research priorities and community outcomes."
        tone="white"
      >
        <div className="grid gap-5 lg:grid-cols-2">
          {farmStories.length > 0 ? (
            <RecordListPanel title="Impact stories" records={farmStories} />
          ) : <StatusMessage>Farm impact stories are not published yet.</StatusMessage>}
          {focusAreas.data.length > 0 ? (
            <RecordListPanel title="Focus areas" records={focusAreas.data} />
          ) : <StatusMessage>Farm focus area records are not published yet.</StatusMessage>}
        </div>
      </ResearchSection>
    </main>
  );
}

function FarmHero({ farmCount, projectCount, partnerCount, activityCount }: { farmCount: number; projectCount: number; partnerCount: number; activityCount: number }) {
  const stats = [
    { label: "Farm records", value: farmCount },
    { label: "Farm projects", value: projectCount },
    { label: "Partners", value: partnerCount },
    { label: "Activities", value: activityCount },
  ];
  return (
    <section className="border-b border-border bg-white">
      <div className="mx-auto grid min-h-[560px] max-w-[1680px] lg:grid-cols-[minmax(0,0.95fr)_minmax(420px,0.75fr)]">
        <div className="flex flex-col justify-center px-4 py-8 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
          <nav className="mb-5 flex flex-wrap items-center gap-2 text-xs font-semibold text-muted-foreground" aria-label="Breadcrumb">
            <Link href="/" className="transition hover:text-primary">Home</Link>
            <span className="text-muted-foreground/60">/</span>
            <span className="text-foreground">University Farm</span>
          </nav>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-secondary">University Farm</p>
          <h1 className="mt-4 max-w-5xl text-balance font-[family-name:var(--app-font-display)] text-4xl font-semibold leading-tight text-foreground sm:text-5xl lg:text-6xl">University Farm: Field Research in Practice</h1>
          <p className="mt-5 max-w-3xl text-pretty text-base leading-8 text-muted-foreground sm:text-lg">Farm facilities, demonstrations, action research, training, partners, and community engagement organized as a living research destination.</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <PrimaryLink href="#facilities">Explore farm facilities</PrimaryLink>
            <SecondaryLink href="#projects">View farm projects</SecondaryLink>
            <SecondaryLink href="#demonstrations">Plan a visit</SecondaryLink>
          </div>
          <dl className="mt-8 grid gap-2 sm:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="rounded-md border border-border bg-surface-subtle px-3 py-3">
                <dt className="text-[11px] font-semibold uppercase text-muted-foreground">{stat.label}</dt>
                <dd className="mt-1 text-xl font-semibold text-foreground">{stat.value}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="relative min-h-[320px] overflow-hidden border-t border-border lg:min-h-full lg:border-l lg:border-t-0">
          <Image
            src="/images/research/university-farm-hero-imagegen.webp"
            alt="University farm research demonstration field"
            fill
            priority
            sizes="(min-width: 1024px) 42vw, 100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,23,42,0.02)_0%,rgba(15,23,42,0.62)_100%)]" />
          <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
            <p className="max-w-md text-sm font-semibold leading-6">Backend records surface facilities, field projects, demonstrations, partners, and public outcomes.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function LandingTabs({ items }: { items: { href: string; label: string }[] }) {
  return (
    <nav className="sticky top-0 z-20 border-b border-border bg-white/95 px-4 py-3 backdrop-blur sm:px-6 lg:px-8 xl:px-10 2xl:px-12" aria-label="Farm sections">
      <div className="mx-auto flex max-w-[1680px] gap-2 overflow-x-auto">
        {items.map((item) => (
          <a key={item.href} href={item.href} className="shrink-0 rounded-md border border-border bg-white px-4 py-2 text-sm font-semibold text-muted-foreground transition hover:border-primary/30 hover:text-primary">
            {item.label}
          </a>
        ))}
      </div>
    </nav>
  );
}

function FarmOverview({
  farms,
  projects,
  activities,
  focusAreas,
}: {
  farms: ResearchGenericRecord[];
  projects: ResearchProject[];
  activities: ResearchGenericRecord[];
  focusAreas: ResearchGenericRecord[];
}) {
  const leadFarm = farms[0];
  const leadProject = projects[0];
  const leadActivity = activities[0];
  const displayFocusAreas = focusAreas.slice(0, 4);

  return (
    <div className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
      <article className="rounded-lg border border-border bg-white p-5 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-secondary">Featured facility</p>
        {leadFarm ? (
          <>
            <h2 className="mt-3 text-2xl font-semibold leading-tight text-foreground">
              {leadFarm.slug ? <Link href={`/farm/${leadFarm.slug}`} className="transition hover:text-primary">{getRecordTitle(leadFarm, "University farm")}</Link> : getRecordTitle(leadFarm, "University farm")}
            </h2>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">{getRecordSummary(leadFarm) || compactText(leadFarm.activities) || compactText(leadFarm.products) || "Published farm details will appear when available."}</p>
            <dl className="mt-5 grid gap-3 sm:grid-cols-3">
              <ResearchFact label="Type" value={formatLabel(leadFarm.farm_type ?? "farm")} />
              <ResearchFact label="Location" value={compactText(leadFarm.location) || compactText(leadFarm.county)} />
              <ResearchFact label="Updated" value={getRecordTimelineLabel(leadFarm)} />
            </dl>
          </>
        ) : (
          <StatusMessage>No farm facilities are published yet.</StatusMessage>
        )}
      </article>
      <div className="grid gap-4">
        <FeatureTile eyebrow="Project in the field" title={leadProject?.title} body={compactText(leadProject?.summary) || "Project details will appear when farm-linked records are published."} href={leadProject?.slug ? `/projects/${leadProject.slug}` : undefined} />
        <FeatureTile eyebrow="Demonstration or activity" title={compactText(leadActivity?.title) || compactText(leadActivity?.name)} body={compactText(leadActivity?.summary) || compactText(leadActivity?.description) || "Activity records will appear when published."} />
        {displayFocusAreas.length > 0 ? (
          <div className="rounded-lg border border-border bg-surface-subtle p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Focus areas</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {displayFocusAreas.map((area) => (
                <Badge key={area.id}>{compactText(area.name) || compactText(area.title)}</Badge>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function FeatureTile({ eyebrow, title, body, href }: { eyebrow: string; title?: string | null; body?: string; href?: string }) {
  const content = (
    <>
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-secondary">{eyebrow}</p>
      <h3 className="mt-3 text-lg font-semibold leading-7 text-foreground">{title || "Published record"}</h3>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{body}</p>
    </>
  );

  return href ? (
    <Link href={href} className="block rounded-lg border border-border bg-white p-4 shadow-sm transition hover:border-primary/30">
      {content}
    </Link>
  ) : (
    <article className="rounded-lg border border-border bg-white p-4 shadow-sm">{content}</article>
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
    <article className="rounded-lg border border-border bg-white p-5 shadow-sm">
      <div className="flex flex-wrap gap-2">
        <Badge>{formatLabel(project.project_type ?? "research")}</Badge>
        {project.status ? <Badge>{formatLabel(project.status)}</Badge> : null}
        {project.is_featured ? <FilledBadge>Featured</FilledBadge> : null}
      </div>
      <h2 className="mt-4 text-xl font-semibold leading-7 text-foreground">
        {project.slug ? (
          <a href={`/projects/${project.slug}`} className="transition hover:text-primary">
            {project.title}
          </a>
        ) : (
          project.title
        )}
      </h2>
      {description ? (
        <p className="mt-3 text-sm leading-7 text-muted-foreground">{description}</p>
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
    <section className="rounded-lg border border-border bg-white p-5 shadow-sm">
      <h2 className="text-xl font-semibold text-foreground">{title}</h2>
      <div className="mt-4 divide-y divide-border">
        {records.slice(0, 8).map((record) => (
          <article key={record.id} className="py-4 first:pt-0 last:pb-0">
            <div className="flex flex-wrap gap-2">
              {record.partner_type ? <Badge>{formatLabel(record.partner_type)}</Badge> : null}
              {record.event_type ? <Badge>{formatLabel(record.event_type)}</Badge> : null}
              {record.status ? <Badge>{formatLabel(record.status)}</Badge> : null}
            </div>
            <h3 className="mt-3 text-base font-semibold leading-6 text-foreground">
              {compactText(record.name) || compactText(record.title) || compactText(record.code)}
            </h3>
            {compactText(record.about) || compactText(record.summary) || compactText(record.description) ? (
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {compactText(record.about) || compactText(record.summary) || compactText(record.description)}
              </p>
            ) : null}
            {dateField && record[dateField] ? (
              <p className="mt-2 text-xs font-semibold uppercase text-muted-foreground">
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
