import type { Metadata } from "next";
import Link from "next/link";
import type { Person } from "@ksu/api-client";
import { personsApi } from "@ksu/api-client";
import {
  Badge,
  PrimaryLink,
  ResearchSection,
  SecondaryLink,
  StatusMessage,
} from "../../components/research-ui";
import { compactText, formatLabel } from "../../lib/research-public-data";
import { publicFrontendUrl } from "../../lib/service-urls";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "About Research",
  description: "Research office, governance, and REIRM structure.",
};

export default async function AboutPage() {
  const staff = await getResearchStaff();
  const lead = staff.data.find((person) =>
    compactText(person.institutional_role).toLowerCase().includes("research"),
  ) ?? staff.data.find((person) => person.is_featured) ?? staff.data[0];

  return (
    <main id="research-main" className="min-h-screen bg-white">
      <AboutMasthead
        staffCount={staff.data.length}
        leadName={lead ? personName(lead) : undefined}
      />

      {staff.error ? (
        <section className="px-4 pt-6 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
          <div className="mx-auto max-w-[1680px]">
            <StatusMessage tone="error">{staff.error}</StatusMessage>
          </div>
        </section>
      ) : null}

      <ResearchSection
        eyebrow="People"
        title="Staff supporting research, extension, innovation, and resource mobilization"
        body="Research staff records are pulled from the main university people service, with profiles, roles, departments, and research interests shown only when published."
        tone="white"
      >
        <div id="staff" className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {staff.data.slice(0, 6).map((person) => (
              <StaffCard key={person.id} person={person} />
            ))}
          </div>
          <section className="rounded-lg border border-slate-200 bg-slate-50 p-5">
            <p className="text-xs font-semibold uppercase text-secondary">Research Office</p>
            <h3 className="mt-2 font-[family-name:var(--font-display)] text-2xl font-semibold text-slate-950">
              {lead ? personName(lead) : "Research staff directory"}
            </h3>
            {lead ? (
              <>
                <p className="mt-2 text-sm font-semibold text-primary">
                  {compactText(lead.institutional_role) || compactText(lead.academic_rank) || compactText(lead.title)}
                </p>
                {personSummary(lead) ? (
                  <p className="mt-3 text-sm leading-7 text-slate-600">{personSummary(lead)}</p>
                ) : null}
              </>
            ) : (
              <StatusMessage>Research staff records are not published yet.</StatusMessage>
            )}
            <div className="mt-5 flex flex-wrap gap-3">
              <PrimaryLink href="/team">Open team</PrimaryLink>
              <SecondaryLink href="/expertise">Find expertise</SecondaryLink>
            </div>
          </section>
        </div>
      </ResearchSection>

      <ResearchSection
        eyebrow="Governance"
        title="Boards and advisory structures"
        body="Governance and advisory content is shown as an institutional summary until a dedicated public board endpoint is available."
      >
        <section id="governance" className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-slate-950">
            Research governance is coordinated through published university offices and staff roles.
          </h3>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            This section deliberately avoids placeholder board members. When the main service exposes public board records, this panel can render those records directly.
          </p>
        </section>
      </ResearchSection>
    </main>
  );
}

function AboutMasthead({ staffCount, leadName }: { staffCount: number; leadName?: string }) {
  const stats = [
    { label: "Department", value: "REIRM" },
    { label: "Research staff", value: staffCount },
    { label: "Lead profile", value: leadName || "Not published" },
  ];

  return (
    <section className="border-b border-slate-200 bg-white px-4 py-6 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
      <div className="mx-auto grid max-w-[1680px] gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(320px,520px)] lg:items-end">
        <div>
          <nav className="mb-4 flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500" aria-label="Breadcrumb">
            <Link href="/" className="transition hover:text-primary">Home</Link>
            <span className="text-slate-300">/</span>
            <span className="text-slate-900">About</span>
          </nav>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-secondary">About REIRM</p>
          <h1 className="mt-3 max-w-5xl text-balance font-[family-name:var(--font-display)] text-3xl font-semibold leading-tight text-slate-950 sm:text-4xl">
            The public structure behind Kisii University research support
          </h1>
          <p className="mt-3 max-w-4xl text-pretty text-sm leading-7 text-slate-700 sm:text-base">
            Research, Extension, Innovation and Resource Mobilization is presented through backend-backed staff records, office pathways, and governance notes.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <PrimaryLink href="/team">Meet the team</PrimaryLink>
            <SecondaryLink href="/expertise">Find expertise</SecondaryLink>
          </div>
        </div>
        <dl className="grid gap-2 sm:grid-cols-3 lg:grid-cols-1">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
              <dt className="text-[11px] font-semibold uppercase text-slate-500">{stat.label}</dt>
              <dd className="mt-1 break-words text-sm font-semibold text-slate-950">{stat.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

async function getResearchStaff() {
  try {
    const response = await personsApi.list({
      fields: "id,slug,full_name,title,academic_rank,institutional_role,leadership_message,bio,specialization,research_interests,department_name,email,is_researcher,is_featured",
      is_researcher: true,
      status: "active",
      page: 1,
      per_page: 12,
    });
    return { data: response.data ?? [], error: null as string | null };
  } catch (error) {
    return {
      data: [] as Person[],
      error: error instanceof Error ? error.message : "Unable to load research staff.",
    };
  }
}

function StaffCard({ person }: { person: Person }) {
  const interests = Array.isArray(person.research_interests) ? person.research_interests.slice(0, 2) : [];
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap gap-2">
        <Badge>{formatLabel(person.academic_rank ?? person.title ?? "researcher")}</Badge>
        {person.is_featured ? <Badge>Featured</Badge> : null}
      </div>
      <h3 className="mt-4 text-lg font-semibold leading-6 text-slate-950">{personName(person)}</h3>
      {compactText(person.institutional_role) || compactText(person.department_name) ? (
        <p className="mt-2 text-sm font-semibold text-primary">
          {compactText(person.institutional_role) || compactText(person.department_name)}
        </p>
      ) : null}
      {personSummary(person) ? (
        <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">{personSummary(person)}</p>
      ) : null}
      {interests.length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {interests.map((interest) => (
            <Badge key={interest}>{interest}</Badge>
          ))}
        </div>
      ) : null}
      {person.slug ? (
        <a
          href={`${publicFrontendUrl}/staff/${person.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex text-sm font-semibold text-primary"
        >
          View profile
        </a>
      ) : null}
    </article>
  );
}

function personName(person: Person) {
  return compactText(person.full_name) || [person.first_name, person.last_name].map(compactText).filter(Boolean).join(" ") || "Research staff";
}

function personSummary(person: Person) {
  return compactText(person.leadership_message) || compactText(person.bio) || compactText(person.specialization);
}
