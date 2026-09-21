import { ResearchPageHero } from "../../components/research-page-hero";
import type { Metadata } from "next";
import { ResearchImage } from "../../components/research-image";
import { ResearchPageShell } from "../../components/research-page-primitives";
import Link from "next/link";

import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ClipboardList,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { PublicResearchContextResponse } from "@ksu/api-client/server";
import { Badge, PrimaryLink } from "../../components/research-ui";
import { ResearchRichText } from "../../components/research-rich-text";
import { compactText } from "../../lib/research-public-data";
import { getResearchSiteContext } from "../../lib/research-site-context";
import {
  buildTeamMembers,
  getLeadTeamMember,
  type AboutTeamMember,
} from "./about-page-model";

import { researchAboutSections as aboutSections } from "../../config/research-page-content";

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
    <ResearchPageShell tone="white">
      <ResearchPageHero
        title="About"
        eyebrow="REIRM"
        description="Research, Extension, Innovation and Resource Mobilization at Kisii University."
        imageSrc="/images/research/headers/innovation-week-8173.jpg"
        imageAlt="Kisii University Innovation Week"
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "About" }]}
        actions={[]}
      ></ResearchPageHero>
      <AboutWorkspace
        researchContext={researchContext}
        teamMembers={teamMembers}
        lead={lead}
      />
    </ResearchPageShell>
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
  const overview = firstText(entity?.about, entity?.description);
  const intro = overview
    .split(/\n\s*\n/)[0]
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
  const excerpt =
    intro.length > 420
      ? intro.slice(0, 420).replace(/\s+\S*$/, "") + "…"
      : intro;
  const leadershipMessage = firstText(
    researchContext?.leadership?.message,
    entity?.head_message,
  );
  const mandateRows = mandateContentRows(entity);
  const governanceRows = governanceContentRows(entity);
  const primaryContact = [
    {
      label: "Email",
      value: entity?.email,
      href: entity?.email ? "mailto:" + entity.email : undefined,
      icon: Mail,
    },
    {
      label: "Phone",
      value: entity?.phone,
      href: entity?.phone ? "tel:" + entity.phone : undefined,
      icon: Phone,
    },
    { label: "Office", value: entity?.office_location, icon: MapPin },
  ].filter((item) => compactText(item.value));
  const hasLeadership = Boolean(
    leadershipMessage || lead || researchContext?.leadership?.person,
  );
  const hasTeam =
    teamMembers.length > (lead ? 1 : 0) ||
    Boolean(researchContext?.team?.groups?.some((group) => group.count > 1));
  const visibleSections = aboutSections.filter((section) => {
    if (section.id === "overview") return true;
    if (section.id === "mandate") return mandateRows.length > 0;
    if (section.id === "leadership") return hasLeadership;
    if (section.id === "team") return hasTeam;
    if (section.id === "governance") return governanceRows.length > 0;
    return primaryContact.length > 0;
  });
  return (
    <>
      <AboutSectionNav sections={visibleSections} />
      <div className="mx-auto max-w-[1280px] space-y-12 px-4 py-10 sm:px-6 lg:space-y-16 lg:px-8 lg:py-14">
        <section id="about-overview" className="scroll-mt-32">
          <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-14">
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-widest text-primary">
                About REIRM
              </p>
              <h2 className="mt-3 font-display text-3xl font-normal leading-tight sm:text-4xl">
                Research with purpose
              </h2>
              <p className="mt-5 max-w-xl text-base leading-8 text-muted-foreground">
                {excerpt ||
                  "Research, Extension, Innovation and Resource Mobilization at Kisii University."}
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-5">
                <PrimaryLink href="/connect">Connect with us</PrimaryLink>
                <Link
                  href="/projects"
                  className="inline-flex min-h-11 items-center gap-2 text-sm text-primary hover:underline"
                >
                  Explore our work
                  <ArrowRight aria-hidden className="size-4" />
                </Link>
              </div>
            </div>
            <figure className="min-w-0">
              <ResearchImage
                src="/images/research/headers/innovation-week-8173.jpg"
                alt="Kisii University Innovation Week participants gathered for a group photograph"
                width={1024}
                height={683}
                sizes="(min-width: 1024px) 45vw, 100vw"
                className="aspect-[3/2] w-full rounded-md object-cover"
              />
              <figcaption className="mt-3 border-l-2 border-secondary pl-3 text-xs leading-5 text-muted-foreground">
                Research, innovation and collaboration at Kisii University.
              </figcaption>
            </figure>
          </div>
          {overview ? (
            <details className="group mt-8 border-y border-border py-4">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm text-primary">
                Read the full department overview
                <span aria-hidden className="text-xl group-open:rotate-45">
                  +
                </span>
              </summary>
              <ResearchRichText
                content={overview}
                className="mt-5 max-w-4xl text-sm leading-8 text-muted-foreground"
              />
            </details>
          ) : null}
        </section>
        {mandateRows.length > 0 ? <MandateCard rows={mandateRows} /> : null}
        {hasLeadership ? (
          <LeadershipCard
            lead={lead}
            message={leadershipMessage}
            leadership={researchContext?.leadership}
          />
        ) : null}
        {hasTeam ? (
          <TeamHierarchyCard
            team={researchContext?.team}
            members={teamMembers}
          />
        ) : null}
        {governanceRows.length > 0 ? (
          <GovernanceCard rows={governanceRows} />
        ) : null}
        {primaryContact.length > 0 ? (
          <section
            id="about-contact"
            className="scroll-mt-32 rounded-md bg-primary px-5 py-8 text-primary-foreground sm:p-8"
          >
            <div className="flex flex-wrap items-center justify-between gap-5">
              <div>
                <p className="text-xs uppercase tracking-widest text-primary-foreground/75">
                  Get in touch
                </p>
                <h2 className="mt-2 font-display text-2xl font-normal sm:text-3xl">
                  Connect with REIRM
                </h2>
              </div>
              <Link
                href="/connect"
                className="inline-flex min-h-11 items-center gap-2 rounded-md border border-primary-foreground/40 px-4 text-sm hover:bg-primary-foreground/10"
              >
                Contact us
                <ArrowRight aria-hidden className="size-4" />
              </Link>
            </div>
            <div className="mt-6 grid gap-5 border-t border-primary-foreground/25 pt-6 md:grid-cols-3">
              {primaryContact.map((item) => (
                <div key={item.label} className="min-w-0">
                  <p className="text-xs text-primary-foreground/75">
                    {item.label}
                  </p>
                  {item.href ? (
                    <a
                      href={item.href}
                      className="mt-2 block break-words text-sm leading-6 hover:underline"
                    >
                      {item.value}
                    </a>
                  ) : (
                    <p className="mt-2 text-sm leading-6">{item.value}</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </>
  );
}

function AboutSectionNav({ sections }: { sections: typeof aboutSections }) {
  return (
    <nav
      aria-label="About sections"
      className="border-b border-border bg-background"
    >
      <div className="mx-auto flex max-w-[1280px] gap-6 overflow-x-auto px-4 sm:px-6 lg:px-8">
        {sections.map((section) => (
          <Link
            key={section.id}
            href={"#" + section.anchor}
            className="inline-flex min-h-14 shrink-0 items-center border-b-2 border-transparent text-sm font-normal text-muted-foreground hover:border-secondary hover:text-primary"
          >
            {section.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}

function MandateCard({
  rows,
}: {
  rows: Array<{ label: string; value?: string | null; icon: LucideIcon }>;
}) {
  const mandate = rows.find((row) => row.label === "Mandate");
  const principles = rows.filter((row) => row.label !== "Mandate");
  const priorities = !mandate?.value?.includes("<")
    ? (mandate?.value ?? "")
        .split(/\n\s*\n/)
        .map((value) => value.trim())
        .filter(Boolean)
    : [];
  return (
    <section id="about-mandate" className="scroll-mt-32 space-y-10">
      {principles.length ? (
        <div className="grid gap-5 md:grid-cols-2">
          {principles.map((row) => (
            <article
              key={row.label}
              className={
                "border-t-2 border-primary bg-surface-subtle p-6 " +
                (row.label === "Core values" ? "md:col-span-2" : "")
              }
            >
              <h3 className="font-display text-xl font-normal">
                {row.label === "Core values"
                  ? row.label
                  : "Our " + row.label.toLowerCase()}
              </h3>
              <ResearchRichText
                content={row.value}
                className="mt-3 text-sm leading-7 text-muted-foreground"
              />
            </article>
          ))}
        </div>
      ) : null}
      {mandate ? (
        <div className="grid gap-6 border-t border-border pt-8 lg:grid-cols-[240px_minmax(0,1fr)]">
          <div>
            <p className="text-xs uppercase tracking-widest text-primary">
              Our mandate
            </p>
            <h2 className="mt-3 font-display text-2xl font-normal leading-tight">
              How we advance knowledge
            </h2>
          </div>
          {priorities.length > 1 ? (
            <ol className="divide-y divide-border">
              {priorities.map((priority, index) => {
                const colon = priority.indexOf(":");
                const hasLabel = colon > 0 && colon < 100;
                return (
                  <li
                    key={index}
                    className="grid grid-cols-[32px_minmax(0,1fr)] gap-4 py-5 first:pt-0 last:pb-0"
                  >
                    <span
                      aria-hidden
                      className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-sm text-primary"
                    >
                      {index + 1}
                    </span>
                    <div>
                      {hasLabel ? (
                        <h3 className="font-display text-lg font-normal leading-6 text-foreground">
                          {priority.slice(0, colon)}
                        </h3>
                      ) : null}
                      <p className="mt-2 text-sm leading-7 text-muted-foreground">
                        {hasLabel ? priority.slice(colon + 1).trim() : priority}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ol>
          ) : (
            <ResearchRichText
              content={mandate.value}
              className="text-sm leading-8 text-muted-foreground [&_p]:mb-5 [&_li]:mb-4"
            />
          )}
        </div>
      ) : null}
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
      className="scroll-mt-32 border-t border-border pt-8"
    >
      <p className="text-xs uppercase tracking-widest text-primary">
        Leadership
      </p>
      <h2 className="mt-3 font-display text-2xl font-normal">
        {message ? "Leadership message" : "Our leadership"}
      </h2>
      <div className="mt-6 grid items-start gap-6 sm:grid-cols-[160px_minmax(0,1fr)]">
        {person ? (
          <div className="max-w-[160px]">
            <LeadershipPortrait person={person} />
          </div>
        ) : null}
        <div className="min-w-0">
          {person ? (
            <>
              <h3 className="font-display text-xl font-normal">
                {teamMemberName(person)}
              </h3>
              <p className="mt-2 text-sm text-primary">
                {person.assignmentTitle}
              </p>
            </>
          ) : null}
          {message ? (
            <ResearchRichText
              content={message}
              className="mt-5 max-w-3xl text-sm leading-8 text-muted-foreground"
            />
          ) : null}
          <Link
            href="/team"
            className="mt-5 inline-flex min-h-11 items-center gap-2 text-sm text-primary hover:underline"
          >
            View the team directory
            <ArrowRight aria-hidden className="size-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

function LeadershipPortrait({ person }: { person: AboutTeamMember }) {
  const photoUrl = compactText(person.photo_url);

  return (
    <div className="overflow-hidden rounded-lg border border-white/15 bg-white/10 shadow-sm">
      {photoUrl ? (
        <ResearchImage
          src={String(photoUrl)}
          alt={teamMemberName(person)}
          width={480}
          height={600}
          className="aspect-[4/5] min-h-48 w-full object-cover"
        />
      ) : (
        <div
          aria-hidden
          className="flex aspect-[4/5] min-h-48 items-center justify-center bg-white/10 text-3xl font-semibold text-white"
        >
          {initials(teamMemberName(person))}
        </div>
      )}
    </div>
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
      className="scroll-mt-32 border-t border-border pt-8"
    >
      <div className="relative z-10 flex flex-wrap items-start justify-between gap-4">
        <SectionHeader icon={Users} label="Team" title="Meet the team" />
        <Link
          href="/team"
          className="inline-flex min-h-11 items-center gap-2 rounded-md border border-primary/25 bg-background px-5 py-3 text-sm font-semibold text-primary transition hover:border-primary hover:bg-primary/5"
        >
          Full team
          <ArrowRight aria-hidden className="h-4 w-4" />
        </Link>
      </div>
      <div className="relative z-10 mt-5 grid gap-4">
        {groups.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {groups.map((group) => (
              <div
                key={group.key}
                className="flex min-h-20 items-center justify-between gap-4 rounded-md border border-border bg-surface-subtle px-4 py-3"
              >
                <span className="font-semibold text-foreground">
                  {group.label}
                </span>
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
          <div className="rounded-md border border-border bg-surface-subtle p-4">
            <p className="text-sm leading-6 text-muted-foreground">
              Research staff hierarchy is not published yet.
            </p>
          </div>
        ) : null}
      </div>
    </section>
  );
}

function GovernanceCard({
  rows,
}: {
  rows: Array<{ label: string; value?: string | null; href: string }>;
}) {
  return (
    <section
      id="about-governance"
      className="relative isolate overflow-hidden rounded-lg border border-border bg-white p-5 shadow-sm sm:p-6"
    >
      <div className="relative z-10">
        <SectionHeader
          icon={ShieldCheck}
          label="Governance"
          title="Governance & resources"
        />
      </div>
      <div className="relative z-10 mt-5 grid gap-3 md:grid-cols-2">
        {rows.map((row) => (
          <Link
            key={row.label}
            href={row.href}
            className="group rounded-md border border-border bg-surface-subtle p-4 transition hover:border-primary/25 hover:bg-primary/5"
          >
            <span className="block text-sm font-semibold text-foreground">
              {row.label}
            </span>
            <div className="mt-2 line-clamp-3 text-sm leading-6 text-muted-foreground">
              <ResearchRichText
                content={row.value}
                className="text-sm leading-6 text-muted-foreground"
              />
            </div>
            <span className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-primary">
              Open
              <ArrowRight
                aria-hidden
                className="h-4 w-4 transition group-hover:translate-x-1"
              />
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
              ? "flex h-10 w-10 items-center justify-center rounded-md bg-white/10 text-secondary"
              : "flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary"
          }
        >
          <Icon aria-hidden className="h-5 w-5" />
        </span>
        <p
          className={
            inverted
              ? "text-sm font-semibold uppercase tracking-eyebrow text-white/70"
              : "text-sm font-semibold uppercase tracking-eyebrow text-secondary"
          }
        >
          {label}
        </p>
      </div>
      <h2
        className={
          inverted
            ? "mt-3 font-display text-2xl font-normal leading-tight text-white sm:text-3xl"
            : "mt-3 font-display text-2xl font-normal leading-tight text-foreground sm:text-3xl"
        }
      >
        {title}
      </h2>
    </div>
  );
}

function StaffMiniCard({ person }: { person: AboutTeamMember }) {
  return (
    <article className="rounded-md border border-border bg-white p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <Avatar person={person} />
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold text-foreground">
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
  return values.map(value => value?.trim() ?? "").find(Boolean) ?? "";
}

function mandateContentRows(
  entity: PublicResearchContextResponse["entity"] | undefined,
) {
  return [
    { label: "Mandate", value: entity?.mandate, icon: ClipboardList },
    { label: "Mission", value: entity?.mission, icon: CheckCircle2 },
    { label: "Vision", value: entity?.vision, icon: BookOpen },
    { label: "Core values", value: entity?.core_values, icon: ShieldCheck },
  ].filter((item) => compactText(item.value));
}

function governanceContentRows(
  entity: PublicResearchContextResponse["entity"] | undefined,
) {
  return [
    {
      label: "Service charter",
      value: entity?.service_charter,
      href: "/services",
    },
    { label: "Guidelines", value: entity?.guidelines, href: "/guidelines" },
  ].filter((item) => compactText(item.value));
}
