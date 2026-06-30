import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Building2, ExternalLink, UserRound } from "lucide-react";
import type { Person } from "@ksu/api-client";
import { personsApi } from "@ksu/api-client";
import { PrimaryLink, SecondaryLink, StatusMessage } from "../../components/research-ui";
import { publicFrontendUrl } from "../../lib/service-urls";
import { compactText } from "../../lib/research-public-data";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Research Team",
  description: "Research staff, leadership, and contact directory.",
};

const MAIN_SITE = publicFrontendUrl;

export default async function TeamPage() {
  let people: Person[] = [];
  let peopleError: string | null = null;

  try {
    const response = await personsApi.list({
      per_page: 24,
      fields: "id,slug,full_name,first_name,last_name,title,academic_rank,email,department_name,department,institutional_role,bio,specialization,research_interests,is_researcher,is_featured",
      is_researcher: true,
      status: "active",
    });
    people = response.data ?? [];
  } catch (error) {
    peopleError = error instanceof Error ? error.message : "Unable to load research team records.";
  }

  return (
    <main id="research-main" className="min-h-screen bg-white">
      <TeamMasthead staffCount={people.length} />

      <section className="border-b border-slate-200 bg-white px-4 py-10 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
        <div className="mx-auto max-w-[1680px]">
          <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase text-secondary">University Directory</p>
              <h2 className="mt-2 font-[family-name:var(--font-display)] text-3xl font-semibold leading-tight text-slate-950 sm:text-4xl">
                Staff and leadership profiles
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
                Click any name to open the full public profile on the main university website.
              </p>
            </div>
            <Link
              href={`${MAIN_SITE}/staff`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-secondary"
            >
              Full staff directory
              <ExternalLink aria-hidden className="h-4 w-4" />
            </Link>
          </div>

          {peopleError ? (
            <StatusMessage tone="error">{peopleError}</StatusMessage>
          ) : people.length === 0 ? (
            <StatusMessage tone="neutral">
              Staff records are temporarily unavailable. Visit the main university directory for the latest research team information.
            </StatusMessage>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {people.map((person) => (
                <a
                  key={person.id}
                  href={`${MAIN_SITE}/staff/${person.slug || person.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:border-primary/30 hover:shadow-md"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <UserRound aria-hidden className="h-6 w-6" />
                  </div>
                  <h3 className="mt-4 font-[family-name:var(--font-display)] text-lg font-semibold text-slate-950 group-hover:text-primary">
                    {personName(person)}
                  </h3>
                  {compactText(person.institutional_role) || compactText(person.title) ? (
                    <p className="mt-1 text-sm font-medium text-primary">{compactText(person.institutional_role) || compactText(person.title)}</p>
                  ) : null}
                  {person.academic_rank ? (
                    <p className="mt-0.5 text-xs capitalize text-slate-500">{person.academic_rank}</p>
                  ) : null}
                  {person.department_name || person.department?.name ? (
                    <p className="mt-2 text-xs leading-5 text-slate-600 line-clamp-1">{person.department_name || person.department?.name}</p>
                  ) : null}
                  {person.specialization || person.bio ? (
                    <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">{compactText(person.specialization) || compactText(person.bio)}</p>
                  ) : null}
                  <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-primary">
                    View profile
                    <ExternalLink aria-hidden className="h-3 w-3" />
                  </span>
                </a>
              ))}
            </div>
          )}

          <div className="mt-8 rounded-[1.25rem] border border-blue-100 bg-blue-50/60 p-6">
            <div className="flex items-start gap-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Building2 aria-hidden className="h-5 w-5" />
              </span>
              <div>
                <h3 className="text-lg font-semibold text-slate-950">REIRM Research Office</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  The Directorate of Research, Extension, Innovation and Resource Mobilization is the administrative home for research at Kisii University.
                </p>
                <Link href="/connect" className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-secondary">
                  Contact the office <ArrowRight aria-hidden className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function TeamMasthead({ staffCount }: { staffCount: number }) {
  const stats = [
    { label: "Research staff", value: staffCount },
    { label: "Department", value: "REIRM" },
    { label: "Profiles", value: "Main web" },
  ];

  return (
    <section className="border-b border-slate-200 bg-white px-4 py-6 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
      <div className="mx-auto grid max-w-[1680px] gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(320px,520px)] lg:items-end">
        <div>
          <nav className="mb-4 flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500" aria-label="Breadcrumb">
            <Link href="/" className="transition hover:text-primary">Home</Link>
            <span className="text-slate-300">/</span>
            <span className="text-slate-900">Team</span>
          </nav>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-secondary">Research Team</p>
          <h1 className="mt-3 max-w-5xl text-balance font-[family-name:var(--font-display)] text-3xl font-semibold leading-tight text-slate-950 sm:text-4xl">
            Staff and leadership profiles that support research work
          </h1>
          <p className="mt-3 max-w-4xl text-pretty text-sm leading-7 text-slate-700 sm:text-base">
            Browse researcher records from the main university people service. Staff detail pages open on the main web profile design.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <PrimaryLink href="/expertise">Search expertise</PrimaryLink>
            <SecondaryLink href="/connect">Contact REIRM</SecondaryLink>
          </div>
        </div>
        <dl className="grid gap-2 sm:grid-cols-3 lg:grid-cols-1">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
              <dt className="text-[11px] font-semibold uppercase text-slate-500">{stat.label}</dt>
              <dd className="mt-1 text-sm font-semibold text-slate-950">{stat.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

function personName(person: Person) {
  return compactText(person.full_name) || [person.first_name, person.last_name].map(compactText).filter(Boolean).join(" ") || person.id;
}
