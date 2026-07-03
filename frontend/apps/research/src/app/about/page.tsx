import type { Metadata } from "next";
import Link from "next/link";
import { ScrollReveal, ScrollRevealGroup } from "@ksu/ui/components";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Mail,
  MapPin,
  MessageSquareText,
  Phone,
  ShieldCheck,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { PublicResearchContextResponse } from "@ksu/api-client";
import { Badge, PrimaryLink } from "../../components/research-ui";
import { ResearchRichText } from "../../components/research-rich-text";
import { compactText } from "../../lib/research-public-data";
import { getResearchSiteContext } from "../../lib/research-site-context";
import {
  buildTeamMembers,
  getLeadTeamMember,
  type AboutTeamMember,
} from "./about-page-model";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "About REIRM",
  description:
    "Mandate, mission, leadership, staff hierarchy, governance, and contact information for Kisii University research support.",
};

export default async function AboutPage() {
  const { researchContext } = await getResearchSiteContext();
  const teamMembers = buildTeamMembers(researchContext?.team);
  const lead = getLeadTeamMember(teamMembers);

  return (
    <main id="research-main" className="min-h-screen bg-slate-50">
      <AboutWorkspace
        researchContext={researchContext}
        teamMembers={teamMembers}
        lead={lead}
      />
    </main>
  );
}

function AboutWorkspace({
  researchContext,
  teamMembers,
  lead,
}: {
  researchContext: PublicResearchContextResponse | null;
  teamMembers: AboutTeamMember[];
  lead: AboutTeamMember | null;
}) {
  const entity = researchContext?.entity;
  const title = compactText(entity?.name) || "Research, Extension, Innovation and Resource Mobilization";
  const overview = firstText(entity?.about, entity?.description);
  const leadershipMessage = firstText(
    researchContext?.leadership?.message,
    entity?.head_message,
  );
  const mandateRows = mandateContentRows(entity);
  const governanceRows = governanceContentRows(entity);
  const primaryContact = [
    { label: "Email", value: entity?.email, href: entity?.email ? `mailto:${entity.email}` : undefined, icon: Mail },
    { label: "Phone", value: entity?.phone, href: entity?.phone ? `tel:${entity.phone}` : undefined, icon: Phone },
    { label: "Office", value: entity?.office_location, icon: MapPin },
  ];
  const hasLeadership = Boolean(leadershipMessage || lead || researchContext?.leadership?.person);
  const hasTeam = teamMembers.length > 0 || Boolean(researchContext?.team?.groups?.length);
  const hasContact = primaryContact.some((item) => compactText(item.value));

  return (
    <section className="px-4 py-5 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
      <div className="mx-auto max-w-[1680px]">
        <Breadcrumbs />

        <div className="min-w-0 space-y-5">
          <ScrollReveal
            className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
            variant="fade-up"
          >
            <div id="about-overview" className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-start">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-secondary">
                  About REIRM
                </p>
                <h1 className="mt-3 max-w-5xl font-[family-name:var(--font-display)] text-2xl font-semibold leading-tight text-slate-950 sm:text-3xl">
                  {title}
                </h1>
                {overview ? (
                  <ResearchRichText
                    content={overview}
                    className="mt-3 text-sm leading-7 text-slate-700"
                  />
                ) : null}
              </div>
              <div className="flex flex-wrap gap-2 xl:justify-end">
                <PrimaryLink href="/connect#research">Start an inquiry</PrimaryLink>
                {teamMembers.length > 0 ? (
                  <Link
                    href="/team"
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-primary/25 bg-white px-5 py-3 text-sm font-semibold text-primary transition hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/15"
                  >
                    Team
                    <ArrowRight aria-hidden className="h-4 w-4" />
                  </Link>
                ) : null}
              </div>
            </div>
          </ScrollReveal>

          {mandateRows.length > 0 || hasLeadership ? (
            <ScrollRevealGroup
              className="grid gap-5 xl:grid-cols-2"
              duration={620}
              staggerDelay={80}
            >
              {mandateRows.length > 0 ? (
                <MandateCard rows={mandateRows} />
              ) : null}
              {hasLeadership ? (
                <LeadershipCard
                  lead={lead}
                  message={leadershipMessage}
                  leadership={researchContext?.leadership}
                />
              ) : null}
            </ScrollRevealGroup>
          ) : null}

          {hasTeam ? (
            <ScrollReveal variant="fade-up">
              <TeamHierarchyCard team={researchContext?.team} members={teamMembers} />
            </ScrollReveal>
          ) : null}

          {governanceRows.length > 0 ? (
            <ScrollReveal variant="fade-up">
              <GovernanceCard rows={governanceRows} />
            </ScrollReveal>
          ) : null}

          {hasContact ? (
            <ScrollReveal variant="fade-up">
              <section id="about-contact" className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                <SectionHeader
                  icon={Mail}
                  label="Contact"
                  title="Research office contact"
                />
                <div className="mt-5 grid gap-3 md:grid-cols-3">
                  {primaryContact.filter((item) => compactText(item.value)).map((item) => (
                    <ContactTile key={item.label} item={item} />
                  ))}
                </div>
              </section>
            </ScrollReveal>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function MandateCard({ rows }: { rows: Array<{ label: string; value?: string | null; icon: LucideIcon }> }) {
  return (
    <section
      id="about-mandate"
      className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
    >
      <SectionHeader icon={ClipboardList} label="Mandate" title="What the office is set up to do" />
      <div className="mt-5 grid gap-3">
        {rows.map((item) => (
          <InfoRow key={item.label} item={item} />
        ))}
      </div>
    </section>
  );
}

function LeadershipCard({
  lead,
  message,
  leadership,
}: {
  lead: AboutTeamMember | null;
  message: string;
  leadership: PublicResearchContextResponse["leadership"] | undefined;
}) {
  const person = lead ?? teamPersonFromLeadership(leadership);

  return (
    <section
      id="about-leadership"
      className="rounded-lg border border-primary/20 bg-primary p-5 text-white shadow-sm sm:p-6"
    >
      <SectionHeader
        icon={MessageSquareText}
        label="Leadership"
        title="Leadership message"
        inverted
      />
      {message ? (
        <ResearchRichText
          content={message}
          className="mt-5 text-sm leading-7 text-white/86 prose-headings:text-white prose-p:text-white/86 prose-strong:text-white prose-li:text-white/86"
        />
      ) : (
        <p className="mt-5 text-sm leading-7 text-white/72">
          Leadership message is not published yet.
        </p>
      )}
      {person ? (
        <div className="mt-6 flex items-center gap-4 rounded-md border border-white/15 bg-white/10 p-3">
          <Avatar person={person} />
          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold text-white">
              {teamMemberName(person)}
            </h3>
            <p className="mt-1 text-xs font-semibold text-white/72">
              {person.assignmentTitle}
            </p>
          </div>
        </div>
      ) : null}
    </section>
  );
}

function TeamHierarchyCard({
  team,
  members,
}: {
  team: PublicResearchContextResponse["team"] | undefined;
  members: AboutTeamMember[];
}) {
  const groups = team?.groups ?? [];

  return (
    <section
      id="about-team"
      className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <SectionHeader icon={Users} label="Team" title="Research staff hierarchy" />
        <Link
          href="/team"
          className="inline-flex min-h-10 items-center gap-2 rounded-md border border-slate-200 px-4 text-sm font-semibold text-primary transition hover:bg-primary/5"
        >
          Full team
          <ArrowRight aria-hidden className="h-4 w-4" />
        </Link>
      </div>
      <div className="mt-5 grid gap-4">
        {groups.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {groups.map((group) => (
              <div
                key={group.key}
                className="flex min-h-20 items-center justify-between gap-4 rounded-md border border-slate-200 bg-slate-50 px-4 py-3"
              >
                <span className="font-semibold text-slate-800">{group.label}</span>
                <span className="rounded-full bg-white px-2.5 py-1 text-sm font-semibold text-primary shadow-sm">
                  {group.count}
                </span>
              </div>
            ))}
          </div>
        ) : null}
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {members.slice(0, 8).map((member) => (
            <StaffMiniCard key={member.assignmentId} person={member} />
          ))}
        </div>
        {groups.length === 0 && members.length === 0 ? (
          <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm leading-6 text-slate-600">Research staff hierarchy is not published yet.</p>
          </div>
        ) : null}
      </div>
    </section>
  );
}

function GovernanceCard({ rows }: { rows: Array<{ label: string; value?: string | null; href: string }> }) {
  return (
    <section
      id="about-governance"
      className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
    >
      <SectionHeader icon={ShieldCheck} label="Governance" title="Controls and reference documents" />
      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {rows.map((row) => (
          <Link
            key={row.label}
            href={row.href}
            className="group rounded-md border border-slate-200 bg-slate-50 p-4 transition hover:border-primary/25 hover:bg-primary/5"
          >
            <span className="block text-sm font-semibold text-slate-950">
              {row.label}
            </span>
            <div className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600">
              <ResearchRichText
                content={row.value}
                className="text-sm leading-6 text-slate-600"
              />
            </div>
            <span className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-primary">
              Open
              <ArrowRight aria-hidden className="h-4 w-4 transition group-hover:translate-x-1" />
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

function SectionHeader({
  icon: Icon,
  label,
  title,
  inverted = false,
}: {
  icon: LucideIcon;
  label: string;
  title: string;
  inverted?: boolean;
}) {
  return (
    <div>
      <div className="flex items-center gap-3">
        <span
          className={
            inverted
              ? "flex h-10 w-10 items-center justify-center rounded-md bg-white/12 text-secondary"
              : "flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary"
          }
        >
          <Icon aria-hidden className="h-5 w-5" />
        </span>
        <p
          className={
            inverted
              ? "text-xs font-semibold uppercase tracking-[0.2em] text-white/72"
              : "text-xs font-semibold uppercase tracking-[0.2em] text-secondary"
          }
        >
          {label}
        </p>
      </div>
      <h2
        className={
          inverted
            ? "mt-3 font-[family-name:var(--font-display)] text-2xl font-semibold leading-tight text-white"
            : "mt-3 font-[family-name:var(--font-display)] text-2xl font-semibold leading-tight text-slate-950"
        }
      >
        {title}
      </h2>
    </div>
  );
}

function InfoRow({
  item,
}: {
  item: { label: string; value?: string | null; icon: LucideIcon };
}) {
  const Icon = item.icon;
  return (
    <article className="grid gap-3 rounded-md border border-slate-200 bg-slate-50 p-4 sm:grid-cols-[42px_minmax(0,1fr)]">
      <span className="flex h-10 w-10 items-center justify-center rounded-md bg-white text-primary shadow-sm">
        <Icon aria-hidden className="h-5 w-5" />
      </span>
      <div>
        <h3 className="text-sm font-semibold text-slate-950">{item.label}</h3>
        <ResearchRichText
          content={item.value}
          className="mt-2 text-sm leading-7 text-slate-600"
        />
      </div>
    </article>
  );
}

function StaffMiniCard({ person }: { person: AboutTeamMember }) {
  return (
    <article className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <Avatar person={person} />
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold text-slate-950">
            {teamMemberName(person)}
          </h3>
          <p className="mt-1 truncate text-xs font-semibold text-primary">
            {person.assignmentTitle}
          </p>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <Badge>{person.groupLabel}</Badge>
        <Badge>Level {person.hierarchyLevel}</Badge>
      </div>
    </article>
  );
}

function ContactTile({
  item,
}: {
  item: {
    label: string;
    value?: string | null;
    href?: string;
    icon: LucideIcon;
  };
}) {
  const Icon = item.icon;
  const value = compactText(item.value);
  const content = (
    <>
      <Icon aria-hidden className="h-5 w-5 text-primary" />
      <span>
        <span className="block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
          {item.label}
        </span>
        <span className="mt-1 block text-sm font-semibold text-slate-950">
          {value || "Not published"}
        </span>
      </span>
    </>
  );
  const className = "flex min-h-20 items-center gap-3 rounded-md border border-slate-200 bg-slate-50 p-4";

  return item.href && value ? (
    <a href={item.href} className={`${className} transition hover:border-primary/25 hover:bg-primary/5`}>
      {content}
    </a>
  ) : (
    <div className={className}>{content}</div>
  );
}

function Avatar({ person }: { person: AboutTeamMember }) {
  const photoUrl = compactText(person.photo_url);
  return (
    <span
      aria-hidden
      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-primary/10 bg-cover bg-center text-sm font-semibold text-primary"
      style={photoUrl ? { backgroundImage: `url(${photoUrl})` } : undefined}
    >
      {photoUrl ? null : initials(teamMemberName(person))}
    </span>
  );
}

function Breadcrumbs() {
  return (
    <nav
      aria-label="Breadcrumb"
      className="mb-4 flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500"
    >
      <Link href="/" className="transition hover:text-primary">
        Home
      </Link>
      <ChevronRight aria-hidden className="h-3.5 w-3.5 text-slate-300" />
      <span className="text-slate-900">About</span>
    </nav>
  );
}

function teamMemberName(person: AboutTeamMember) {
  return compactText(person.full_name) || "Research staff";
}

function teamPersonFromLeadership(
  leadership: PublicResearchContextResponse["leadership"] | undefined,
): AboutTeamMember | null {
  const person = leadership?.person;
  const assignment = leadership?.assignment;
  if (!person || !assignment) return null;
  return {
    ...person,
    assignmentId: String(assignment.id),
    assignmentTitle:
      compactText(assignment.title) ||
      compactText(assignment.role_display) ||
      compactText(person.institutional_role) ||
      "Research leadership",
    roleLabel: compactText(assignment.role_label) || "Leadership",
    groupKey: compactText(assignment.group) || "leadership",
    groupLabel: "Leadership",
    hierarchyLevel: Number(assignment.hierarchy_level ?? 1),
    displayOrder: Number(assignment.display_order ?? 1),
    reportsToId: assignment.reports_to_id,
    isActing: Boolean(assignment.is_acting),
  };
}

function initials(value: string) {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

function firstText(...values: Array<string | null | undefined>) {
  return values.map(compactText).find(Boolean) ?? "";
}

function mandateContentRows(entity: PublicResearchContextResponse["entity"] | undefined) {
  return [
    { label: "Mandate", value: entity?.mandate, icon: ClipboardList },
    { label: "Mission", value: entity?.mission, icon: CheckCircle2 },
    { label: "Vision", value: entity?.vision, icon: BookOpen },
    { label: "Core values", value: entity?.core_values, icon: ShieldCheck },
  ].filter((item) => compactText(item.value));
}

function governanceContentRows(entity: PublicResearchContextResponse["entity"] | undefined) {
  return [
    { label: "Service charter", value: entity?.service_charter, href: "/services" },
    { label: "Guidelines", value: entity?.guidelines, href: "/guidelines" },
  ].filter((item) => compactText(item.value));
}
