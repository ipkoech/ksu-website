import type { Metadata } from "next";
import Link from "next/link";
import type { ResearchGenericRecord } from "@ksu/api-client";
import {
  BadgeCheck,
  Building2,
  Contact,
  Mail,
  Phone,
  Search,
  Users,
} from "lucide-react";
import { ScrollRevealGroup } from "@ksu/ui/components";
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
  getOfficeStaff,
  getOffices,
} from "../../lib/research-public-data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Research Team",
  description: "Research office staff and contact directory.",
};

type TeamSearchParams = {
  q?: string;
  role?: string;
  office?: string;
};

const localLinks = [
  { label: "Leadership", href: "#leadership", icon: BadgeCheck },
  { label: "Team Directory", href: "#directory", icon: Users },
  { label: "Research Offices", href: "#offices", icon: Building2 },
  { label: "Contacts", href: "#contacts", icon: Contact },
];

const relatedLinks = [
  {
    label: "About Research",
    href: "/about",
    description: "Understand office structure and governance.",
    icon: Building2,
  },
  {
    label: "Expertise Directory",
    href: "/expertise",
    description: "Search specialists by skill, focus area, and theme.",
    icon: Search,
  },
  {
    label: "Research Services",
    href: "/services",
    description: "Find support routes for research work.",
    icon: Contact,
  },
  {
    label: "Contact REIRM",
    href: "/connect",
    description: "Send a public enquiry to the research office.",
    icon: Mail,
  },
];

export default async function TeamPage({
  searchParams,
}: {
  searchParams?: Promise<TeamSearchParams>;
}) {
  const params = (await searchParams) ?? {};
  const [staff, offices] = await Promise.all([getOfficeStaff(), getOffices()]);
  const officeMap = new Map(offices.data.map((office) => [office.id, office]));
  const roles = uniqueValues(staff.data.map((item) => compactText(item.role || item.staff_type)));
  const leadership = staff.data.filter(isLeadership).sort(sortLeadership);
  const filteredStaff = staff.data.filter((person) =>
    matchesTeamFilters(person, params, officeMap),
  );
  const contactableStaff = staff.data.filter(
    (person) => compactText(person.email) || compactText(person.phone),
  );
  const errors = [staff.error, offices.error].filter(Boolean);

  return (
    <main id="research-main" className="min-h-screen bg-white">
      <ResearchInstitutionalHero
        eyebrow="Research Team"
        title="Find the people and offices that support research work."
        body="The team directory presents office staff records as a public service directory for researchers, students, partners, and funders."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Team" }]}
        localLinks={localLinks}
        relatedLinks={relatedLinks}
        imageSrc="/images/research/research-demo-imagegen.png"
        imageAlt="Kisii University research staff coordinating project support"
        primaryAction={{ label: "Search expertise", href: "/expertise" }}
        secondaryAction={{ label: "Contact REIRM", href: "/connect" }}
        facts={[
          { label: "Published staff", value: staff.data.length },
          { label: "Leadership records", value: leadership.length },
          { label: "Research offices", value: offices.data.length },
          { label: "Public contacts", value: contactableStaff.length },
        ]}
      />

      {errors.length > 0 ? (
        <section className="px-4 pt-6 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
          <div className="mx-auto max-w-[1680px] space-y-3">
            {errors.map((error) => (
              <StatusMessage key={error} tone="error">
                {error}
              </StatusMessage>
            ))}
          </div>
        </section>
      ) : null}

      <ResearchSection
        eyebrow="Leadership"
        title="Research leadership and office coordinators"
        body="Leadership records are drawn from published staff assignments, roles, staff type, and leadership ranking."
        tone="white"
      >
        <div id="leadership">
          {leadership.length > 0 ? (
            <ScrollRevealGroup className="grid gap-5 md:grid-cols-2 xl:grid-cols-3" staggerDelay={75}>
              {leadership.map((person) => (
                <PersonCard key={person.id} person={person} office={officeMap.get(person.office_id)} prominent />
              ))}
            </ScrollRevealGroup>
          ) : (
            <InstitutionalEmpty>
              No leadership staff records have been published yet.
            </InstitutionalEmpty>
          )}
        </div>
      </ResearchSection>

      <ResearchSection
        eyebrow="Directory"
        title="Search the research team"
        body="Filter by name, role, responsibility, and office to find published research contacts."
      >
        <div id="directory">
          <TeamFilters params={params} offices={offices.data} roles={roles} />

          {filteredStaff.length > 0 ? (
            <ScrollRevealGroup className="mt-7 grid gap-5 md:grid-cols-2 xl:grid-cols-3" staggerDelay={55}>
              {filteredStaff.map((person) => (
                <PersonCard key={person.id} person={person} office={officeMap.get(person.office_id)} />
              ))}
            </ScrollRevealGroup>
          ) : (
            <div className="mt-7">
              <InstitutionalEmpty>
                No team records match the current search or filter selection.
              </InstitutionalEmpty>
            </div>
          )}
        </div>
      </ResearchSection>

      <ResearchSection
        eyebrow="Office Contacts"
        title="Research offices and public contact routes"
        body="Office records anchor the directory so visitors know where each service sits institutionally."
        tone="white"
      >
        <div id="offices" className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="grid gap-5 md:grid-cols-2">
            {offices.data.length > 0 ? (
              offices.data.map((office) => (
                <OfficeContact key={office.id} office={office} staffCount={staff.data.filter((person) => person.office_id === office.id).length} />
              ))
            ) : (
              <InstitutionalEmpty>
                No research office records have been published yet.
              </InstitutionalEmpty>
            )}
          </div>

          <InstitutionalPanel id="contacts" className="h-fit bg-slate-950 text-white">
            <p className="text-sm font-semibold uppercase text-secondary">
              Contact Routing
            </p>
            <h3 className="mt-3 font-[family-name:var(--font-display)] text-2xl font-semibold leading-7 text-white">
              Start with the office record, then the role.
            </h3>
            <p className="mt-3 text-sm leading-7 text-white/72">
              Visitors can use office contacts for service questions and staff contacts for person-specific research support where those details are published.
            </p>
            <div className="mt-5 space-y-3">
              {contactableStaff.slice(0, 5).map((person) => (
                <div key={person.id} className="rounded-lg border border-white/10 bg-white/5 p-3">
                  <p className="text-sm font-semibold text-white">{personName(person)}</p>
                  <p className="mt-1 text-xs leading-5 text-white/65">
                    {[compactText(person.role), compactText(person.email), compactText(person.phone)]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                </div>
              ))}
              {contactableStaff.length === 0 ? (
                <p className="text-sm leading-6 text-white/72">
                  No staff-specific public contacts have been published yet.
                </p>
              ) : null}
            </div>
          </InstitutionalPanel>
        </div>
      </ResearchSection>
    </main>
  );
}

function TeamFilters({
  params,
  offices,
  roles,
}: {
  params: TeamSearchParams;
  offices: ResearchGenericRecord[];
  roles: string[];
}) {
  return (
    <form className="rounded-lg border border-slate-200 bg-slate-50 p-4" action="/team">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[minmax(0,1.4fr)_minmax(180px,0.8fr)_minmax(180px,0.8fr)_auto]">
        <label>
          <span className="text-xs font-semibold uppercase text-slate-500">Search</span>
          <input
            name="q"
            defaultValue={params.q ?? ""}
            placeholder="Name, role, responsibility"
            className="mt-2 h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm transition focus:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          />
        </label>
        <FilterSelect name="role" label="Role" value={params.role} options={roles} emptyLabel="All roles" />
        <label>
          <span className="text-xs font-semibold uppercase text-slate-500">Office</span>
          <select
            name="office"
            defaultValue={params.office ?? ""}
            className="mt-2 h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm transition focus:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <option value="">All offices</option>
            {offices.map((office) => (
              <option key={office.id} value={office.id}>
                {recordTitle(office)}
              </option>
            ))}
          </select>
        </label>
        <div className="flex items-end gap-2">
          <button className="inline-flex h-11 items-center justify-center rounded-full bg-primary px-5 text-sm font-semibold text-white transition hover:bg-primary/90">
            Search
          </button>
          <Link
            href="/team"
            className="inline-flex h-11 items-center justify-center rounded-full border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:border-primary/40 hover:text-primary"
          >
            Reset
          </Link>
        </div>
      </div>
    </form>
  );
}

function FilterSelect({
  name,
  label,
  value,
  options,
  emptyLabel,
}: {
  name: string;
  label: string;
  value?: string;
  options: string[];
  emptyLabel: string;
}) {
  return (
    <label>
      <span className="text-xs font-semibold uppercase text-slate-500">{label}</span>
      <select
        name={name}
        defaultValue={value ?? ""}
        className="mt-2 h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm transition focus:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        <option value="">{emptyLabel}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {formatLabel(option)}
          </option>
        ))}
      </select>
    </label>
  );
}

function PersonCard({
  person,
  office,
  prominent = false,
}: {
  person: ResearchGenericRecord;
  office?: ResearchGenericRecord;
  prominent?: boolean;
}) {
  return (
    <InstitutionalPanel className={prominent ? "border-primary/25" : ""}>
      <div className="flex items-start gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary text-lg font-semibold text-white">
          {initials(personName(person))}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap gap-2">
            {prominent ? <FilledBadge>Leadership</FilledBadge> : null}
            {person.staff_type ? <Badge>{formatLabel(person.staff_type)}</Badge> : null}
          </div>
          <h3 className="mt-2 font-[family-name:var(--font-display)] text-2xl font-semibold leading-7 text-slate-950">
            {personName(person)}
          </h3>
          {compactText(person.role || person.title_override) ? (
            <p className="mt-1 text-sm font-semibold text-primary">
              {compactText(person.role || person.title_override)}
            </p>
          ) : null}
        </div>
      </div>

      {compactText(person.responsibilities || person.bio || person.summary || person.description) ? (
        <p className="mt-4 text-sm leading-7 text-slate-600">
          {compactText(person.responsibilities || person.bio || person.summary || person.description)}
        </p>
      ) : null}

      <div className="mt-5 space-y-2 border-t border-slate-200 pt-4 text-sm text-slate-600">
        {office ? (
          <p className="flex items-start gap-2">
            <Building2 aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <span>{recordTitle(office)}</span>
          </p>
        ) : null}
        {compactText(person.email) ? (
          <p className="flex items-start gap-2">
            <Mail aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <span>{compactText(person.email)}</span>
          </p>
        ) : null}
        {compactText(person.phone) ? (
          <p className="flex items-start gap-2">
            <Phone aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <span>{compactText(person.phone)}</span>
          </p>
        ) : null}
      </div>
    </InstitutionalPanel>
  );
}

function OfficeContact({
  office,
  staffCount,
}: {
  office: ResearchGenericRecord;
  staffCount: number;
}) {
  return (
    <InstitutionalPanel>
      <div className="flex flex-wrap gap-2">
        {office.code ? <FilledBadge>{office.code}</FilledBadge> : null}
        <Badge>{staffCount} team records</Badge>
      </div>
      <h3 className="mt-3 font-[family-name:var(--font-display)] text-2xl font-semibold text-slate-950">
        {recordTitle(office)}
      </h3>
      {compactText(office.about || office.services_summary || office.mandate) ? (
        <p className="mt-3 text-sm leading-7 text-slate-600">
          {compactText(office.about || office.services_summary || office.mandate)}
        </p>
      ) : null}
      <div className="mt-5 space-y-2 text-sm text-slate-600">
        {compactText(office.email) ? (
          <p className="flex items-start gap-2">
            <Mail aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <span>{compactText(office.email)}</span>
          </p>
        ) : null}
        {compactText(office.phone) ? (
          <p className="flex items-start gap-2">
            <Phone aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <span>{compactText(office.phone)}</span>
          </p>
        ) : null}
      </div>
    </InstitutionalPanel>
  );
}

function matchesTeamFilters(
  person: ResearchGenericRecord,
  params: TeamSearchParams,
  officeMap: Map<string, ResearchGenericRecord>,
) {
  const query = compactText(params.q).toLowerCase();
  const role = compactText(params.role).toLowerCase();
  const office = compactText(params.office);
  const officeRecord = officeMap.get(person.office_id);
  const searchable = [
    personName(person),
    person.role,
    person.staff_type,
    person.title_override,
    person.responsibilities,
    officeRecord ? recordTitle(officeRecord) : "",
  ]
    .map(compactText)
    .join(" ")
    .toLowerCase();

  if (query && !searchable.includes(query)) return false;
  if (role && compactText(person.role || person.staff_type).toLowerCase() !== role) return false;
  if (office && person.office_id !== office) return false;
  return true;
}

function isLeadership(person: ResearchGenericRecord) {
  const label = compactText(`${person.staff_type ?? ""} ${person.role ?? ""}`).toLowerCase();
  return Boolean(person.leadership_rank) || /(leader|director|registrar|chair|coordinator|manager|head)/.test(label);
}

function sortLeadership(a: ResearchGenericRecord, b: ResearchGenericRecord) {
  const rankA = Number(a.leadership_rank ?? 999);
  const rankB = Number(b.leadership_rank ?? 999);
  if (rankA !== rankB) return rankA - rankB;
  return personName(a).localeCompare(personName(b));
}

function personName(person: ResearchGenericRecord) {
  const nestedStaff = person.staff_assignment?.staff ?? person.staff ?? {};
  return (
    compactText(person.title_override) ||
    compactText(person.display_name) ||
    compactText(person.name) ||
    compactText(nestedStaff.full_name) ||
    compactText(`${nestedStaff.first_name ?? ""} ${nestedStaff.last_name ?? ""}`) ||
    compactText(person.role) ||
    "Published team member"
  );
}

function recordTitle(record?: ResearchGenericRecord | null) {
  return (
    compactText(record?.name) ||
    compactText(record?.title) ||
    compactText(record?.display_name) ||
    compactText(record?.code) ||
    "Published record"
  );
}

function uniqueValues(values: string[]) {
  return Array.from(new Set(values.filter(Boolean))).sort((a, b) => a.localeCompare(b));
}

function initials(name: string) {
  const parts = name.split(/\s+/).filter(Boolean).slice(0, 2);
  return parts.map((part) => part[0]?.toUpperCase()).join("") || "R";
}
