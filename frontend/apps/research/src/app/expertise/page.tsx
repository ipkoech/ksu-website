import type { Metadata } from "next";
import Link from "next/link";
import type { ResearchGenericRecord, ResearchProject } from "@ksu/api-client";
import {
  BookOpenCheck,
  Building2,
  ExternalLink,
  FlaskConical,
  Network,
  Search,
  Tags,
  Target,
  Users,
} from "lucide-react";
import {
  InstitutionalEmpty,
  InstitutionalPanel,
  ResearchInstitutionalHero,
} from "../../components/research-institutional";
import {
  Badge,
  FilledBadge,
  ResearchSection,
  StatusMessage,
} from "../../components/research-ui";
import {
  compactText,
  formatLabel,
  getCenters,
  getExpertiseTags,
  getFocusAreas,
  getProjects,
  getThemes,
} from "../../lib/research-public-data";
import { publicFrontendUrl } from "../../lib/service-urls";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Researchers & Expertise",
  description: "Research expertise, focus areas, and staff directory.",
};

type ExpertiseSearchParams = {
  q?: string;
  area?: string;
  theme?: string;
};

const localLinks = [
  { label: "Type to Search", href: "#search", icon: Search },
  { label: "Focus Areas", href: "#focus-areas", icon: Target },
  { label: "Expertise Tags", href: "#expertise-tags", icon: Tags },
  { label: "Related Work", href: "#related-work", icon: Network },
];

const relatedLinks = [
  {
    label: "Research Projects",
    href: "/projects",
    description: "Explore published projects by year, type, and status.",
    icon: FlaskConical,
  },
  {
    label: "Centers & Institutes",
    href: "/centers",
    description: "Find the institutional homes behind research activity.",
    icon: Building2,
  },
  {
    label: "Publications",
    href: "/publications",
    description: "Review publications and outputs tied to research work.",
    icon: BookOpenCheck,
  },
  {
    label: "Research Team",
    href: "/team",
    description: "Open the staff and office contact directory.",
    icon: Users,
  },
];

export default async function ExpertisePage({
  searchParams,
}: {
  searchParams?: Promise<ExpertiseSearchParams>;
}) {
  const params = (await searchParams) ?? {};
  const [expertiseTags, focusAreas, themes, centers, projects] = await Promise.all([
    getExpertiseTags(),
    getFocusAreas(),
    getThemes(),
    getCenters(),
    getProjects(),
  ]);
  const filteredTags = expertiseTags.data.filter((tag) => matchesRecord(tag, params));
  const filteredFocusAreas = focusAreas.data.filter((area) => matchesRecord(area, params));
  const filteredThemes = themes.data.filter((theme) => matchesRecord(theme, params));
  const filteredCenters = centers.data.filter((center) => matchesRecord(center, params));
  const filteredProjects = projects.data.filter((project) => matchesProject(project, params));
  const errors = [
    expertiseTags.error,
    focusAreas.error,
    themes.error,
    centers.error,
    projects.error,
  ].filter(Boolean);

  return (
    <main id="research-main" className="min-h-screen bg-white">
      <ResearchInstitutionalHero
        eyebrow="Expertise Directory"
        title="Search skills, research areas, people, and related work."
        body="Expertise is shown as a public discovery layer over published staff, tags, focus areas, themes, centers, and projects."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Expertise" }]}
        localLinks={localLinks}
        relatedLinks={relatedLinks}
        imageSrc="/images/research/research-innovation-hero.svg"
        imageAlt="Researchers collaborating across disciplines and partner networks"
        primaryAction={{ label: "Browse projects", href: "/projects" }}
        secondaryAction={{ label: "Meet the team", href: "/team" }}
        facts={[
          { label: "Expertise tags", value: expertiseTags.data.length },
          { label: "Focus areas", value: focusAreas.data.length },
          { label: "Themes", value: themes.data.length },
          { label: "Centers", value: centers.data.length },
        ]}
      />

      {errors.length > 0 ? (
        <section className="px-4 pt-6 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
          <div className="mx-auto flex max-w-[1680px] flex-col gap-3">
            {errors.map((error) => (
              <StatusMessage key={error} tone="error">
                {error}
              </StatusMessage>
            ))}
          </div>
        </section>
      ) : null}

      <ResearchSection
        eyebrow="Search"
        title="Type to search the research ecosystem"
        body="Use public language such as climate, health, food systems, education, data, innovation, or a researcher's role."
        tone="white"
      >
        <div id="search">
          <ExpertiseFilters params={params} focusAreas={focusAreas.data} themes={themes.data} />

          <div className="mt-7">
            <InstitutionalPanel className="bg-slate-950 text-white">
              <p className="text-sm font-semibold uppercase text-secondary">
                Search Guide
              </p>
              <h3 className="mt-3 font-[family-name:var(--font-display)] text-2xl font-semibold leading-7 text-white">
                Expertise appears across several published records.
              </h3>
              <p className="mt-3 text-sm leading-7 text-white/75">
                Search by person, focus area, theme, center, project, or expertise tag to find the right research contact.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {expertiseTags.data.slice(0, 10).map((tag) => (
                  <Link
                    key={tag.id}
                    href={`/expertise?q=${encodeURIComponent(recordTitle(tag))}`}
                    className="rounded-md border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold text-white transition hover:bg-white/20"
                  >
                    {recordTitle(tag)}
                  </Link>
                ))}
              </div>
            </InstitutionalPanel>
          </div>
        </div>
      </ResearchSection>

      <ResearchSection
        eyebrow="Research Areas"
        title="Themes, focus areas, and expertise tags"
        body="These records create the public taxonomy that helps visitors understand what Kisii University researchers work on."
      >
        <div className="grid gap-5 xl:grid-cols-3">
          <TaxonomyPanel
            id="focus-areas"
            title="Focus areas"
            records={filteredFocusAreas}
            empty="No focus areas match the current search."
          />
          <TaxonomyPanel
            title="Themes"
            records={filteredThemes}
            empty="No research themes match the current search."
          />
          <TaxonomyPanel
            id="expertise-tags"
            title="Expertise tags"
            records={filteredTags}
            empty="No expertise tags match the current search."
          />
        </div>
      </ResearchSection>

      <section className="border-y border-slate-200 bg-primary px-4 py-12 text-white sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
        <div className="mx-auto max-w-[1680px]">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-center">
            <div>
              <p className="text-sm font-semibold uppercase text-secondary">Find Researchers</p>
              <h2 className="mt-2 font-[family-name:var(--font-display)] text-3xl font-semibold leading-tight sm:text-4xl">
                Browse the university staff directory
              </h2>
              <p className="mt-3 max-w-2xl text-base leading-7 text-white/80">
                Researcher profiles are managed through the main university directory. Search by name, department, academic rank, or research area.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <a
                  href={`${publicFrontendUrl}/staff`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-11 items-center gap-2 rounded-md bg-secondary px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-secondary/90"
                >
                  Open staff directory
                  <ExternalLink aria-hidden className="h-4 w-4" />
                </a>
                <a
                  href={`${publicFrontendUrl}/search`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-11 items-center gap-2 rounded-md border border-white/30 bg-white/10 px-5 py-3 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/20"
                >
                  Search main site
                  <ExternalLink aria-hidden className="h-4 w-4" />
                </a>
              </div>
            </div>
            <div className="rounded-lg border border-white/15 bg-white/[0.04] p-5 backdrop-blur">
              <p className="text-xs font-semibold uppercase text-white/50">Quick insight</p>
              <div className="mt-4 grid grid-cols-2 gap-3">
                {[
                  { label: "Expertise tags", value: expertiseTags.data.length },
                  { label: "Focus areas", value: focusAreas.data.length },
                  { label: "Themes", value: themes.data.length },
                  { label: "Centers", value: centers.data.length },
                ].map((item) => (
                  <div key={item.label} className="rounded-md border border-white/10 p-3">
                    <p className="font-[family-name:var(--font-display)] text-2xl font-semibold">{item.value}</p>
                    <p className="mt-1 text-xs text-white/60">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <ResearchSection
        eyebrow="Related Work"
        title="Where this expertise shows up"
        body="Projects and centers show the institutional work connected to the expertise visitors are searching for."
        tone="white"
      >
        <div id="related-work" className="grid gap-5 xl:grid-cols-2">
          <RelationshipPanel
            title="Related projects"
            href="/projects"
            records={filteredProjects}
            empty="No published projects match the current expertise search."
          />
          <RelationshipPanel
            title="Related centers"
            href="/centers"
            records={filteredCenters}
            empty="No published centers match the current expertise search."
          />
        </div>
      </ResearchSection>
    </main>
  );
}

function ExpertiseFilters({
  params,
  focusAreas,
  themes,
}: {
  params: ExpertiseSearchParams;
  focusAreas: ResearchGenericRecord[];
  themes: ResearchGenericRecord[];
}) {
  return (
    <form className="rounded-lg border border-slate-200 bg-slate-50 p-4" action="/expertise">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[minmax(0,1.5fr)_minmax(180px,0.8fr)_minmax(180px,0.8fr)_auto]">
        <label>
          <span className="text-xs font-semibold uppercase text-slate-500">Type to search</span>
          <input
            name="q"
            defaultValue={params.q ?? ""}
            placeholder="Researcher, skill, theme, project"
            className="mt-2 h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm transition focus:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          />
        </label>
        <RecordSelect name="area" label="Focus area" value={params.area} records={focusAreas} />
        <RecordSelect name="theme" label="Theme" value={params.theme} records={themes} />
        <div className="flex items-end gap-2">
          <button className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-5 text-sm font-semibold text-white transition hover:bg-primary/90">
            Search
          </button>
          <Link
            href="/expertise"
            className="inline-flex h-11 items-center justify-center rounded-md border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
          >
            Reset
          </Link>
        </div>
      </div>
    </form>
  );
}

function RecordSelect({
  name,
  label,
  value,
  records,
}: {
  name: string;
  label: string;
  value?: string;
  records: ResearchGenericRecord[];
}) {
  return (
    <label>
      <span className="text-xs font-semibold uppercase text-slate-500">{label}</span>
      <select
        name={name}
        defaultValue={value ?? ""}
        className="mt-2 h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm transition focus:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        <option value="">All {label.toLowerCase()}s</option>
        {records.map((record) => (
          <option key={record.id} value={record.id}>
            {recordTitle(record)}
          </option>
        ))}
      </select>
    </label>
  );
}

function TaxonomyPanel({
  id,
  title,
  records,
  empty,
}: {
  id?: string;
  title: string;
  records: ResearchGenericRecord[];
  empty: string;
}) {
  return (
    <section id={id} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <SectionHeader label="Directory" title={title} count={records.length} />
      {records.length > 0 ? (
        <div className="mt-4 flex flex-col gap-3">
          {records.map((record) => (
            <article key={record.id} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <div className="flex flex-wrap gap-2">
                {record.category ? <Badge>{formatLabel(record.category)}</Badge> : null}
                {record.status ? <Badge>{formatLabel(record.status)}</Badge> : null}
              </div>
              <h3 className="mt-3 text-base font-semibold leading-6 text-slate-950">
                {recordTitle(record)}
              </h3>
              {recordSummary(record) ? (
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {recordSummary(record)}
                </p>
              ) : null}
            </article>
          ))}
        </div>
      ) : (
        <div className="mt-4">
          <InstitutionalEmpty>{empty}</InstitutionalEmpty>
        </div>
      )}
    </section>
  );
}

function RelationshipPanel({
  title,
  href,
  records,
  empty,
}: {
  title: string;
  href: string;
  records: Array<ResearchGenericRecord | ResearchProject>;
  empty: string;
}) {
  return (
    <section className="rounded-lg border border-slate-200 bg-slate-50 p-5">
      <div className="flex items-start justify-between gap-4">
        <SectionHeader label="Related" title={title} count={records.length} />
        <Link
          href={href}
          className="rounded-md border border-primary/20 bg-white px-4 py-2 text-sm font-semibold text-primary transition hover:border-primary hover:bg-primary/5"
        >
          View all
        </Link>
      </div>
      {records.length > 0 ? (
        <div className="mt-4 grid gap-3">
          {records.slice(0, 6).map((record) => (
            <article key={record.id} className="rounded-lg border border-slate-200 bg-white p-4">
              <h3 className="text-base font-semibold leading-6 text-slate-950">
                {recordTitle(record)}
              </h3>
              {recordSummary(record) ? (
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {recordSummary(record)}
                </p>
              ) : null}
              <div className="mt-3 flex flex-wrap gap-2">
                {"project_type" in record && record.project_type ? (
                  <Badge>{formatLabel(record.project_type)}</Badge>
                ) : null}
                {record.status ? <Badge>{formatLabel(record.status)}</Badge> : null}
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="mt-4">
          <InstitutionalEmpty>{empty}</InstitutionalEmpty>
        </div>
      )}
    </section>
  );
}

function SectionHeader({
  label,
  title,
  count,
}: {
  label: string;
  title: string;
  count: number;
}) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase text-secondary">{label}</p>
      <h2 className="mt-1 font-[family-name:var(--font-display)] text-2xl font-semibold leading-tight text-slate-950">
        {title}
      </h2>
      <p className="mt-1 text-xs font-semibold text-slate-500">
        {count} published records
      </p>
    </div>
  );
}

function matchesRecord(record: ResearchGenericRecord, params: ExpertiseSearchParams) {
  if (params.area && record.id !== params.area && record.focus_area_id !== params.area) return false;
  if (params.theme && record.id !== params.theme && record.theme_id !== params.theme) return false;
  const query = compactText(params.q).toLowerCase();
  if (!query) return true;
  return recordSearchText(record).includes(query);
}

function matchesProject(project: ResearchProject, params: ExpertiseSearchParams) {
  const record = project as ResearchGenericRecord;
  if (params.area && record.focus_area_id !== params.area) return false;
  if (params.theme && record.theme_id !== params.theme) return false;
  const query = compactText(params.q).toLowerCase();
  if (!query) return true;
  return [
    project.title,
    project.summary,
    record.description,
    project.project_type,
    project.status,
  ]
    .map(compactText)
    .join(" ")
    .toLowerCase()
    .includes(query);
}

function recordSearchText(record: ResearchGenericRecord) {
  const nestedStaff = record.staff_assignment?.staff ?? record.staff ?? {};

  return [
    recordTitle(record),
    recordSummary(record),
    record.category,
    record.status,
    record.role,
    record.staff_type,
    record.responsibilities,
    nestedStaff.full_name,
  ]
    .map(compactText)
    .join(" ")
    .toLowerCase();
}

function recordTitle(record: ResearchGenericRecord | ResearchProject) {
  return (
    compactText(record.title) ||
    compactText("name" in record ? record.name : undefined) ||
    compactText("display_name" in record ? record.display_name : undefined) ||
    compactText("code" in record ? record.code : undefined) ||
    "Published record"
  );
}

function recordSummary(record: ResearchGenericRecord | ResearchProject) {
  const generic = record as ResearchGenericRecord;

  return (
    compactText(record.summary) ||
    compactText(generic.description) ||
    compactText(generic.about) ||
    compactText(generic.mandate) ||
    compactText(generic.objectives)
  );
}
