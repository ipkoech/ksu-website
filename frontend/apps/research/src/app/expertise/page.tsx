import type { Metadata } from "next";
import type { Person } from "@ksu/api-client";
import { personsApi } from "@ksu/api-client";
import { pageFromSearchParams } from "@ksu/ui/components";
import { ArrowRight, UserRound } from "lucide-react";
import { ResearchFilterForm } from "../../components/research-listing";
import { ResearchListPagination } from "../../components/research-list-pagination";
import { ResearchPortfolioHero, ResearchPortfolioQuickLinks } from "../../components/research-portfolio";
import { Badge, StatusMessage } from "../../components/research-ui";
import { compactText, formatLabel } from "../../lib/research-public-data";
import { ExpertiseDetailSheet } from "./expertise-detail-sheet";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Researchers & Expertise",
  description: "Find Kisii University researchers, staff expertise, and priority knowledge areas.",
};

type ExpertiseSearchParams = {
  q?: string;
  department?: string;
  featured?: string;
  sort?: string;
  page?: string;
};

const perPage = 12;
const peopleTimeoutMs = 3000;

const sortOptions = [
  { value: "name", label: "Name A-Z" },
  { value: "featured", label: "Featured first" },
  { value: "department", label: "Department" },
  { value: "updated", label: "Recently updated" },
];

export default async function ExpertisePage({
  searchParams,
}: {
  searchParams?: Promise<ExpertiseSearchParams>;
}) {
  const params = (await searchParams) ?? {};
  const page = pageFromSearchParams(params);
  const people = await getResearchPeople();
  const departments = getDepartments(people.data);
  const filteredPeople = sortPeople(
    people.data.filter((person) => matchesPerson(person, params)),
    params.sort || "featured",
  );
  const visiblePeople = filteredPeople.slice((page - 1) * perPage, page * perPage);
  const totalPages = Math.ceil(filteredPeople.length / perPage);
  const themes = getExpertiseThemes(people.data);

  return (
    <main id="research-main" className="min-h-screen bg-white">
      <ResearchPortfolioHero
        eyebrow="Research expertise"
        title="Find Expertise"
        body="Connect with Kisii University researchers, staff specialists, and priority knowledge areas across active research work."
        illustration="expertise"
      />

      <section id="expertise-directory" className="bg-white px-4 py-6 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
        <div className="mx-auto grid max-w-[1680px] gap-6 xl:grid-cols-[minmax(0,1fr)_320px] xl:items-start">
          <div className="min-w-0">
            <div className="grid gap-4 lg:grid-cols-[320px_minmax(0,1fr)] lg:items-start">
              <div className="pt-1">
                <h2 className="font-[family-name:var(--app-font-display)] text-3xl font-semibold leading-tight text-foreground">
                  Expertise Directory
                </h2>
                <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                  Search researchers by name, role, department, specialization, or research interests.
                </p>
              </div>
              <ExpertiseFilters params={params} departments={departments} />
            </div>

            {people.error ? (
              <div className="mt-5">
                <StatusMessage tone="error">{people.error}</StatusMessage>
              </div>
            ) : null}

            {visiblePeople.length ? (
              <>
                <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
                  {visiblePeople.map((person) => (
                    <ExpertiseCard key={person.id} person={person} />
                  ))}
                </div>
                <ResearchListPagination
                  page={page}
                  totalPages={totalPages}
                  total={filteredPeople.length}
                  perPage={perPage}
                  path="/expertise"
                  params={params}
                  className="mt-6"
                />
              </>
            ) : (
              <div className="mt-7">
                <StatusMessage>No researchers match the current expertise filters.</StatusMessage>
              </div>
            )}
          </div>

          <div className="grid gap-4">
            <ResearchPortfolioQuickLinks
              links={[
                { label: "Team", href: "/team", body: "Research staff directory" },
                { label: "Centers", href: "/centers", body: "Institutional anchors" },
                { label: "Programs", href: "/programs", body: "Strategic research umbrellas" },
                { label: "Projects", href: "/projects", body: "Active research work" },
                { label: "Consultancies", href: "/consultancies", body: "Professional research services" },
              ]}
            />
            <aside className="rounded-lg border border-border bg-white p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary">Work with our experts</p>
              <div className="mt-3 divide-y divide-border">
                {[
                  ["Discover", "Search by person, department, or knowledge area."],
                  ["Contact", "Open the profile sheet and use the published contact path."],
                  ["Collaborate", "Connect through projects, centers, or the research office."],
                ].map(([title, body], index) => (
                  <div key={title} className="grid grid-cols-[32px_minmax(0,1fr)] gap-3 py-3 first:pt-0 last:pb-0">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-semibold text-white">
                      {index + 1}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{title}</p>
                      <p className="mt-1 text-xs leading-5 text-muted-foreground">{body}</p>
                    </div>
                  </div>
                ))}
              </div>
            </aside>
            {themes.length ? (
              <aside className="rounded-lg border border-border bg-white p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary">Expertise themes</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {themes.slice(0, 12).map((theme) => (
                    <span key={theme} className="rounded-md border border-border bg-surface-subtle px-2.5 py-1 text-xs font-semibold text-muted-foreground">
                      {theme}
                    </span>
                  ))}
                </div>
              </aside>
            ) : null}
          </div>
        </div>
      </section>
    </main>
  );
}

async function getResearchPeople() {
  const request = personsApi
    .list({
      fields: "id,slug,full_name,first_name,last_name,title,academic_rank,email,phone,office_phone,department_name,department,institutional_role,bio,full_bio,specialization,research_interests,publications_count,h_index,google_scholar_url,website_url,researchgate_url,linkedin_url,photo_url,is_researcher,is_featured,updated_at",
      is_researcher: true,
      status: "active",
      page: 1,
      per_page: 100,
    })
    .then((response) => ({ data: response.data ?? [], error: null as string | null }))
    .catch((error) => ({
      data: [] as Person[],
      error: error instanceof Error ? error.message : "Unable to load researcher profiles.",
    }));

  const timeout = new Promise<{ data: Person[]; error: string | null }>((resolve) => {
    setTimeout(
      () => resolve({ data: [], error: "Researcher profiles are temporarily unavailable." }),
      peopleTimeoutMs,
    );
  });

  return Promise.race([request, timeout]);
}

function ExpertiseFilters({
  params,
  departments,
}: {
  params: ExpertiseSearchParams;
  departments: string[];
}) {
  return (
    <ResearchFilterForm
      action="/expertise"
      resetHref="/expertise"
      searchValue={params.q}
      searchPlaceholder="Name, theme, department, method..."
      selects={[
        {
          name: "department",
          label: "Department",
          value: params.department,
          options: departments.map((department) => ({ value: department, label: department })),
        },
        {
          name: "featured",
          label: "Active state",
          value: params.featured,
          options: [
            { value: "all", label: "All researchers" },
            { value: "featured", label: "Featured" },
          ],
        },
      ]}
      sortValue={params.sort}
      sortOptions={sortOptions}
    />
  );
}

function ExpertiseCard({ person }: { person: Person }) {
  const name = personName(person);
  const role = compactText(person.institutional_role) || compactText(person.title) || compactText(person.academic_rank);
  const department = compactText(person.department_name) || compactText(person.department?.name);
  const interests = Array.isArray(person.research_interests) ? person.research_interests.filter(Boolean).slice(0, 3) : [];

  return (
    <ExpertiseDetailSheet person={person}>
      <button
        type="button"
        className="group flex min-h-[230px] w-full flex-col rounded-lg border border-border bg-white p-4 text-left shadow-sm transition hover:border-primary/30 hover:shadow-md focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/15"
      >
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/10 text-primary">
            {person.photo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={person.photo_url} alt="" className="h-full w-full object-cover" />
            ) : (
              <UserRound aria-hidden className="h-5 w-5" />
            )}
          </div>
          <div className="min-w-0">
            <h3 className="line-clamp-2 text-base font-semibold leading-6 text-foreground group-hover:text-primary">
              {name}
            </h3>
            {role ? <p className="mt-1 line-clamp-1 text-xs font-semibold text-primary">{role}</p> : null}
          </div>
        </div>
        {department ? (
          <p className="mt-3 line-clamp-1 text-xs font-medium text-muted-foreground">{department}</p>
        ) : null}
        {person.specialization || person.bio ? (
          <p className="mt-3 line-clamp-3 text-sm leading-6 text-muted-foreground">
            {compactText(person.specialization) || compactText(person.bio)}
          </p>
        ) : null}
        {interests.length ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {interests.map((interest) => (
              <Badge key={interest}>{interest}</Badge>
            ))}
          </div>
        ) : null}
        <div className="mt-auto flex items-center justify-between gap-3 pt-4 text-xs text-muted-foreground">
          <span>{person.publications_count ? `${person.publications_count} publications` : "Research profile"}</span>
          <span className="inline-flex items-center gap-1 font-semibold text-primary">
            View profile
            <ArrowRight aria-hidden className="h-3.5 w-3.5 transition group-hover:translate-x-1" />
          </span>
        </div>
      </button>
    </ExpertiseDetailSheet>
  );
}

function matchesPerson(person: Person, params: ExpertiseSearchParams) {
  const department = compactText(person.department_name) || compactText(person.department?.name);
  if (params.department && department !== params.department) return false;
  if (params.featured === "featured" && !person.is_featured) return false;

  const query = compactText(params.q).toLowerCase();
  if (!query) return true;
  const interests = Array.isArray(person.research_interests) ? person.research_interests.join(" ") : "";

  return [
    personName(person),
    person.title,
    person.academic_rank,
    person.institutional_role,
    department,
    person.specialization,
    person.bio,
    person.full_bio,
    interests,
  ]
    .map(compactText)
    .join(" ")
    .toLowerCase()
    .includes(query);
}

function sortPeople(people: Person[], sort: string) {
  return [...people].sort((a, b) => {
    if (sort === "updated") {
      return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
    }
    if (sort === "department") {
      return getDepartment(a).localeCompare(getDepartment(b)) || personName(a).localeCompare(personName(b));
    }
    if (sort === "featured") {
      return Number(Boolean(b.is_featured)) - Number(Boolean(a.is_featured)) || personName(a).localeCompare(personName(b));
    }
    return personName(a).localeCompare(personName(b));
  });
}

function getDepartments(people: Person[]) {
  return Array.from(new Set(people.map(getDepartment).filter(Boolean))).sort();
}

function getDepartment(person: Person) {
  return compactText(person.department_name) || compactText(person.department?.name);
}

function getExpertiseThemes(people: Person[]) {
  return Array.from(
    new Set(
      people.flatMap((person) =>
        Array.isArray(person.research_interests) ? person.research_interests.map(formatLabel) : [],
      ),
    ),
  ).filter(Boolean);
}

function personName(person: Person) {
  return compactText(person.full_name) || [person.first_name, person.last_name].map(compactText).filter(Boolean).join(" ") || person.id;
}
