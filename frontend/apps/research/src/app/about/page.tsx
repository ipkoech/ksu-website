import type { Metadata } from "next";
import Link from "next/link";
import type { ResearchGenericRecord } from "@ksu/api-client";
import {
  Building2,
  ClipboardList,
  Landmark,
  Mail,
  MapPin,
  Phone,
  Scale,
  Users,
} from "lucide-react";
import { ScrollReveal, ScrollRevealGroup } from "@ksu/ui/components";
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
  getBoardMembers,
  getBoards,
  getOfficeStaff,
  getOffices,
} from "../../lib/research-public-data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "About Research",
  description: "Research office, governance, and REIRM structure.",
};

const localLinks = [
  { label: "Research Offices", href: "#offices", icon: Building2 },
  { label: "Mandate", href: "#mandate", icon: ClipboardList },
  { label: "Governance", href: "#governance", icon: Landmark },
  { label: "Board Members", href: "#members", icon: Users },
];

const relatedLinks = [
  {
    label: "Research Team",
    href: "/team",
    description: "Find the people and offices supporting researchers.",
    icon: Users,
  },
  {
    label: "Expertise Directory",
    href: "/expertise",
    description: "Search for skills, themes, and research focus areas.",
    icon: Scale,
  },
  {
    label: "Research Services",
    href: "/services",
    description: "Review the support routes available to staff and partners.",
    icon: ClipboardList,
  },
  {
    label: "Contact REIRM",
    href: "/connect",
    description: "Start a research, partnership, or support conversation.",
    icon: Mail,
  },
];

export default async function AboutPage() {
  const [offices, boards, boardMembers, staff] = await Promise.all([
    getOffices(),
    getBoards(),
    getBoardMembers(),
    getOfficeStaff(),
  ]);
  const leadOffice = offices.data[0] ?? null;
  const errors = [offices.error, boards.error, boardMembers.error, staff.error].filter(Boolean);

  return (
    <main id="research-main" className="min-h-screen bg-white">
      <ResearchInstitutionalHero
        eyebrow="About REIRM"
        title="The public structure behind Kisii University research support."
        body="Research, Extension, Innovation and Resource Mobilization is presented here as an institutional service: offices, governance, mandate, leadership, and contact pathways."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "About" }]}
        localLinks={localLinks}
        relatedLinks={relatedLinks}
        imageSrc="/images/research/registrar-reirm-imagegen.png"
        imageAlt="Research office leadership and coordination at Kisii University"
        primaryAction={{ label: "Meet the team", href: "/team" }}
        secondaryAction={{ label: "Find expertise", href: "/expertise" }}
        facts={[
          { label: "Published offices", value: offices.data.length },
          { label: "Governance boards", value: boards.data.length },
          { label: "Board members", value: boardMembers.data.length },
          { label: "Team records", value: staff.data.length },
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
        eyebrow="Mandate"
        title="What the research office is responsible for"
        body="The mandate, mission, vision, priorities, and leadership message are shown from published Research Office records."
        tone="white"
      >
        <div id="mandate" className="grid grid-cols-[minmax(0,1fr)] gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
          <ScrollReveal>
            {leadOffice ? (
              <InstitutionalPanel className="h-full">
                <div className="flex flex-wrap gap-2">
                  {leadOffice.code ? <FilledBadge>{leadOffice.code}</FilledBadge> : null}
                  {leadOffice.status ? <Badge>{formatLabel(leadOffice.status)}</Badge> : null}
                </div>
                <h2 className="mt-4 font-[family-name:var(--font-display)] text-3xl font-semibold leading-tight text-slate-950">
                  {recordTitle(leadOffice)}
                </h2>
                <p className="mt-4 text-base leading-8 text-slate-700">
                  {recordSummary(leadOffice) ||
                    "This office has been published, but its mandate narrative has not been completed yet."}
                </p>
                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  <StatementCard label="Mission" value={leadOffice.mission} />
                  <StatementCard label="Vision" value={leadOffice.vision} />
                  <StatementCard label="Mandate" value={leadOffice.mandate} />
                  <StatementCard label="Strategic priorities" value={leadOffice.strategic_priorities} />
                </div>
              </InstitutionalPanel>
            ) : (
              <InstitutionalEmpty>
                No published research office record is available yet. Once an office is published, its mandate and leadership information will appear here.
              </InstitutionalEmpty>
            )}
          </ScrollReveal>

          <ScrollReveal>
            <InstitutionalPanel className="h-full bg-slate-950 text-white">
              <p className="text-sm font-semibold uppercase text-secondary">
                Leadership Message
              </p>
              <blockquote className="mt-4 text-lg font-semibold leading-8 text-white">
                {compactText(leadOffice?.leadership_message) ||
                  "The REIRM office coordinates research support, extension, innovation and resource mobilization across the university."}
              </blockquote>
              <div className="mt-6 flex flex-col gap-3 text-sm leading-6 text-white/75">
                {contactRows(leadOffice).map((item) => {
                  const Icon = item.icon;

                  return (
                    <p key={item.label} className="flex items-start gap-3">
                      <Icon aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-secondary" />
                      <span>{item.value}</span>
                    </p>
                  );
                })}
              </div>
            </InstitutionalPanel>
          </ScrollReveal>
        </div>
      </ResearchSection>

      <ResearchSection
        eyebrow="Office Structure"
        title="Research offices"
        body="Offices are displayed as public service units with clear contact routes and functions."
      >
        <div id="offices">
          {offices.data.length > 0 ? (
            <ScrollRevealGroup className="grid gap-5 md:grid-cols-2 xl:grid-cols-3" staggerDelay={75}>
              {offices.data.map((office) => (
                <OfficeCard key={office.id} office={office} />
              ))}
            </ScrollRevealGroup>
          ) : (
            <InstitutionalEmpty>
              No research offices have been published yet.
            </InstitutionalEmpty>
          )}
        </div>
      </ResearchSection>

      <ResearchSection
        eyebrow="Governance"
        title="Boards and advisory structures"
        body="Governance records explain how oversight, advice, and approvals are organized around the research mandate."
        tone="white"
      >
        <div id="governance" className="grid gap-5 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
          <div className="flex flex-col gap-4">
            {boards.data.length > 0 ? (
              boards.data.map((board) => (
                <InstitutionalPanel key={board.id}>
                  <div className="flex flex-wrap gap-2">
                    {board.board_type ? <Badge>{formatLabel(board.board_type)}</Badge> : null}
                    {board.status ? <Badge>{formatLabel(board.status)}</Badge> : null}
                  </div>
                  <h3 className="mt-3 font-[family-name:var(--font-display)] text-2xl font-semibold text-slate-950">
                    {recordTitle(board)}
                  </h3>
                  {recordSummary(board) ? (
                    <p className="mt-3 text-sm leading-7 text-slate-600">
                      {recordSummary(board)}
                    </p>
                  ) : null}
                </InstitutionalPanel>
              ))
            ) : (
              <InstitutionalEmpty>
                No governance board records have been published yet.
              </InstitutionalEmpty>
            )}
          </div>

          <div id="members" className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase text-secondary">
                  Members
                </p>
                <h3 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-slate-950">
                  Board member records
                </h3>
              </div>
              <Link
                href="/team"
                className="hidden rounded-md border border-primary/20 bg-white px-4 py-2 text-sm font-semibold text-primary transition hover:border-primary hover:bg-primary/5 sm:inline-flex"
              >
                View team
              </Link>
            </div>
            {boardMembers.data.length > 0 ? (
              <div className="grid gap-3 md:grid-cols-2">
                {boardMembers.data.map((member) => (
                  <MemberCard key={member.id} member={member} />
                ))}
              </div>
            ) : (
              <InstitutionalEmpty>
                No board member records have been published yet.
              </InstitutionalEmpty>
            )}
          </div>
        </div>
      </ResearchSection>
    </main>
  );
}

function OfficeCard({ office }: { office: ResearchGenericRecord }) {
  return (
    <InstitutionalPanel className="flex min-h-[310px] flex-col">
      <div className="flex flex-wrap gap-2">
        {office.code ? <FilledBadge>{office.code}</FilledBadge> : null}
        {office.status ? <Badge>{formatLabel(office.status)}</Badge> : null}
      </div>
      <h3 className="mt-4 font-[family-name:var(--font-display)] text-2xl font-semibold leading-7 text-slate-950">
        {recordTitle(office)}
      </h3>
      <p className="mt-3 text-sm leading-7 text-slate-600">
        {recordSummary(office) ||
          "This office has been published and is awaiting a public summary."}
      </p>
      <div className="mt-5 flex flex-col gap-2 text-sm text-slate-600">
        {contactRows(office).map((item) => {
          const Icon = item.icon;

          return (
            <p key={item.label} className="flex items-start gap-2">
              <Icon aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <span>{item.value}</span>
            </p>
          );
        })}
      </div>
    </InstitutionalPanel>
  );
}

function StatementCard({
  label,
  value,
}: {
  label: string;
  value?: string | number | null;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs font-semibold uppercase text-secondary">{label}</p>
      <p className="mt-2 text-sm leading-7 text-slate-700">
        {compactText(value) || "Not published yet."}
      </p>
    </div>
  );
}

function MemberCard({ member }: { member: ResearchGenericRecord }) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="flex flex-wrap gap-2">
        {member.role ? <FilledBadge>{formatLabel(member.role)}</FilledBadge> : null}
        {member.member_type ? <Badge>{formatLabel(member.member_type)}</Badge> : null}
      </div>
      <h4 className="mt-3 text-base font-semibold leading-6 text-slate-950">
        {recordTitle(member)}
      </h4>
      {recordSummary(member) ? (
        <p className="mt-2 text-sm leading-6 text-slate-600">
          {recordSummary(member)}
        </p>
      ) : null}
    </article>
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

function recordSummary(record?: ResearchGenericRecord | null) {
  return (
    compactText(record?.about) ||
    compactText(record?.mandate) ||
    compactText(record?.summary) ||
    compactText(record?.description) ||
    compactText(record?.functions) ||
    compactText(record?.services_summary)
  );
}

function contactRows(record?: ResearchGenericRecord | null) {
  const rows = [
    { label: "Email", value: compactText(record?.email), icon: Mail },
    { label: "Phone", value: compactText(record?.phone), icon: Phone },
    { label: "Location", value: compactText(record?.location || record?.address), icon: MapPin },
  ];

  return rows.filter((row) => row.value);
}
