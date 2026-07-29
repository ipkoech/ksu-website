import type { Metadata } from "next";
import Link from "next/link";
import { ScrollReveal } from "@ksu/ui/components";
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
import { AboutScrollAccordion } from "./about-scroll-accordion";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "About REIRM",
  description:
    "Mandate, mission, leadership, staff hierarchy, governance, and contact information for Kisii University research support.",
};

const aboutSections = [
  { id: "overview", anchor: "about-overview", label: "Overview", icon: ClipboardList },
  { id: "mandate", anchor: "about-mandate", label: "Mandate", icon: ClipboardList },
  { id: "leadership", anchor: "about-leadership", label: "Leadership", icon: MessageSquareText },
  { id: "team", anchor: "about-team", label: "Team", icon: Users },
  { id: "governance", anchor: "about-governance", label: "Governance", icon: ShieldCheck },
  { id: "contact", anchor: "about-contact", label: "Contact", icon: Mail },
] satisfies Array<{ id: string; anchor: string; label: string; icon: LucideIcon }>;

type SectionBackdropVariant =
  | "network"
  | "checklist"
  | "leadership"
  | "hierarchy"
  | "governance"
  | "contact";

export default async function AboutPage() {
  const { researchContext } = await getResearchSiteContext();
  const teamMembers = buildTeamMembers(researchContext?.team);
  const lead = getLeadTeamMember(teamMembers);

  return (
    <main id="research-main" className="min-h-screen bg-surface-subtle">
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
  const hasMiddleContent = mandateRows.length > 0 || hasLeadership || hasTeam || governanceRows.length > 0;
  const visibleSections = aboutSections.filter((section) => {
    if (section.id === "overview") return Boolean(overview || title);
    if (section.id === "mandate") return mandateRows.length > 0;
    if (section.id === "leadership") return hasLeadership;
    if (section.id === "team") return hasTeam;
    if (section.id === "governance") return governanceRows.length > 0;
    return hasContact;
  });

  return (
    <section className="px-4 py-5 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
      <div className="mx-auto max-w-[1680px]">
        <Breadcrumbs />

        <div className="grid gap-5 lg:grid-cols-[260px_minmax(0,1fr)]">
          <AboutSectionNav sections={visibleSections} />

          <div className="min-w-0 space-y-5">
            <ScrollReveal
              className="relative isolate overflow-hidden rounded-lg border border-border bg-white p-5 shadow-sm sm:p-6"
              variant="fade-up"
            >
              <SectionBackdrop variant="network" />
              <div id="about-overview" className="relative z-10 grid gap-5 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-start">
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-secondary">
                    About REIRM
                  </p>
                  <h1 className="mt-3 max-w-5xl font-[family-name:var(--font-display)] text-2xl font-semibold leading-tight text-foreground sm:text-3xl">
                    {title}
                  </h1>
                  {overview ? (
                    <ResearchRichText
                      content={overview}
                      className="mt-3 text-sm leading-7 text-muted-foreground"
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

            {hasMiddleContent ? (
              <ScrollReveal variant="fade-up">
                <AboutScrollAccordion>
                  {mandateRows.length > 0 ? (
                    <div data-about-panel data-panel-title="Mandate">
                      <div data-about-panel-content>
                        <MandateCard rows={mandateRows} />
                      </div>
                    </div>
                  ) : null}
                  {hasLeadership ? (
                    <div data-about-panel data-panel-title="Leadership">
                      <div data-about-panel-content>
                        <LeadershipCard
                          lead={lead}
                          message={leadershipMessage}
                          leadership={researchContext?.leadership}
                        />
                      </div>
                    </div>
                  ) : null}
                  {hasTeam ? (
                    <div data-about-panel data-panel-title="Team">
                      <div data-about-panel-content>
                        <TeamHierarchyCard team={researchContext?.team} members={teamMembers} />
                      </div>
                    </div>
                  ) : null}
                  {governanceRows.length > 0 ? (
                    <div data-about-panel data-panel-title="Governance">
                      <div data-about-panel-content>
                        <GovernanceCard rows={governanceRows} />
                      </div>
                    </div>
                  ) : null}
                </AboutScrollAccordion>
              </ScrollReveal>
            ) : null}

            {hasContact ? (
              <ScrollReveal variant="fade-up">
                <section id="about-contact" className="relative isolate overflow-hidden rounded-lg border border-border bg-white p-5 shadow-sm sm:p-6">
                  <SectionBackdrop variant="contact" />
                  <div className="relative z-10">
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
                  </div>
                </section>
              </ScrollReveal>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}

function AboutSectionNav({
  sections,
}: {
  sections: typeof aboutSections;
}) {
  return (
    <aside className="lg:sticky lg:top-24 lg:self-start">
      <nav
        aria-label="About sections"
        className="overflow-x-auto rounded-lg border border-border bg-white p-2 shadow-sm"
      >
        <div className="flex min-w-max gap-1 lg:min-w-0 lg:flex-col">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <Link
                key={section.id}
                href={`#${section.anchor}`}
                className="inline-flex min-h-11 items-center gap-3 rounded-md px-3 text-sm font-semibold text-muted-foreground transition hover:bg-primary/5 hover:text-primary"
              >
                <Icon aria-hidden className="h-4 w-4 shrink-0 text-primary" />
                {section.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </aside>
  );
}

function MandateCard({ rows }: { rows: Array<{ label: string; value?: string | null; icon: LucideIcon }> }) {
  return (
    <section
      id="about-mandate"
      className="relative isolate overflow-hidden rounded-lg border border-border bg-white p-5 shadow-sm sm:p-6"
    >
      <SectionBackdrop variant="checklist" />
      <div className="relative z-10">
        <SectionHeader icon={ClipboardList} label="Mandate" title="What the office is set up to do" />
      </div>
      <div className="relative z-10 mt-5 grid gap-3">
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
      className="relative isolate overflow-hidden rounded-lg border border-primary/20 bg-primary p-5 text-white shadow-sm sm:p-6"
    >
      <SectionBackdrop variant="leadership" inverted />
      <div className="relative z-10">
        <SectionHeader
          icon={MessageSquareText}
          label="Leadership"
          title="Leadership message"
          inverted
        />
        <div className="mt-5 grid gap-5 lg:grid-cols-[180px_minmax(0,1fr)]">
          {person ? <LeadershipPortrait person={person} /> : null}
          <div className="min-w-0">
            {message ? (
              <ResearchRichText
                content={message}
                className="text-sm leading-7 text-white/86 prose-headings:text-white prose-p:text-white/86 prose-strong:text-white prose-li:text-white/86"
              />
            ) : (
              <p className="text-sm leading-7 text-white/72">
                Leadership message is not published yet.
              </p>
            )}
            {person ? (
              <div className="mt-5 rounded-md border border-white/15 bg-white/10 p-3">
                <h3 className="text-sm font-semibold text-white">
                  {teamMemberName(person)}
                </h3>
                <p className="mt-1 text-xs font-semibold text-white/72">
                  {person.assignmentTitle}
                </p>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}

function LeadershipPortrait({ person }: { person: AboutTeamMember }) {
  const photoUrl = compactText(person.photo_url);

  return (
    <div className="overflow-hidden rounded-lg border border-white/15 bg-white/10 shadow-sm">
      <div
        aria-hidden
        className="flex aspect-[4/5] min-h-48 items-center justify-center bg-white/10 bg-cover bg-center text-3xl font-semibold text-white"
        style={photoUrl ? { backgroundImage: `url(${photoUrl})` } : undefined}
      >
        {photoUrl ? null : initials(teamMemberName(person))}
      </div>
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
      className="relative isolate overflow-hidden rounded-lg border border-border bg-white p-5 shadow-sm sm:p-6"
    >
      <SectionBackdrop variant="hierarchy" />
      <div className="relative z-10 flex flex-wrap items-start justify-between gap-4">
        <SectionHeader icon={Users} label="Team" title="Research staff hierarchy" />
        <Link
          href="/team"
          className="inline-flex min-h-10 items-center gap-2 rounded-md border border-border px-4 text-sm font-semibold text-primary transition hover:bg-primary/5"
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
                <span className="font-semibold text-foreground">{group.label}</span>
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
            <p className="text-sm leading-6 text-muted-foreground">Research staff hierarchy is not published yet.</p>
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
      className="relative isolate overflow-hidden rounded-lg border border-border bg-white p-5 shadow-sm sm:p-6"
    >
      <SectionBackdrop variant="governance" />
      <div className="relative z-10">
        <SectionHeader icon={ShieldCheck} label="Governance" title="Controls and reference documents" />
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
              <ArrowRight aria-hidden className="h-4 w-4 transition group-hover:translate-x-1" />
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

function SectionBackdrop({
  variant,
  inverted = false,
}: {
  variant: SectionBackdropVariant;
  inverted?: boolean;
}) {
  const stroke = inverted
    ? "hsl(var(--primary-foreground) / 0.28)"
    : "hsl(var(--primary) / 0.16)";
  const fill = inverted
    ? "hsl(var(--primary-foreground) / 0.12)"
    : "hsl(var(--primary) / 0.07)";
  const accent = inverted
    ? "hsl(var(--secondary) / 0.34)"
    : "hsl(var(--secondary) / 0.2)";

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div
        className={[
          "absolute inset-0 opacity-70",
          inverted
            ? "bg-[radial-gradient(circle_at_82%_18%,hsl(var(--primary-foreground)/0.18),transparent_24%),radial-gradient(circle_at_10%_95%,hsl(var(--secondary)/0.24),transparent_26%)]"
            : "bg-[radial-gradient(circle_at_86%_12%,hsl(var(--primary)/0.08),transparent_26%),radial-gradient(circle_at_8%_100%,hsl(var(--secondary)/0.12),transparent_22%)]",
        ].join(" ")}
      />
      <svg
        viewBox="0 0 520 280"
        className="absolute right-[-80px] top-0 h-full w-[58%] min-w-72 motion-safe:animate-pulse"
        fill="none"
      >
        <g opacity={variant === "contact" ? 0.82 : 0.72}>
          {variant === "network" ? (
            <>
              <path d="M60 206C124 116 198 82 282 104c66 18 98-18 154-48" stroke={stroke} strokeWidth="2" />
              {[72, 154, 244, 326, 438].map((x, index) => (
                <g key={x}>
                  <circle cx={x} cy={index % 2 ? 132 : 194} r="16" fill={fill} stroke={stroke} />
                  <circle cx={x} cy={index % 2 ? 132 : 194} r="4" fill={accent} />
                </g>
              ))}
            </>
          ) : null}
          {variant === "checklist" ? (
            <>
              {[72, 156, 240].map((x, index) => (
                <rect key={x} x={x} y={58 + index * 28} width="118" height="146" rx="12" fill={fill} stroke={stroke} />
              ))}
              <path d="M116 106h64M116 132h82M116 158h56" stroke={stroke} strokeWidth="5" strokeLinecap="round" />
              <path d="M92 106l12 12 24-32M92 158l12 12 24-32" stroke={accent} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
            </>
          ) : null}
          {variant === "leadership" ? (
            <>
              <circle cx="356" cy="94" r="84" fill={fill} stroke={stroke} />
              <path d="M210 216c58-58 104-86 138-84 48 3 62 54 118 32" stroke={stroke} strokeWidth="3" strokeLinecap="round" />
              <path d="M272 110h62M272 138h98M272 166h72" stroke={stroke} strokeWidth="6" strokeLinecap="round" />
            </>
          ) : null}
          {variant === "hierarchy" ? (
            <>
              <path d="M270 70v52M158 162h224M158 162v54M270 162v54M382 162v54" stroke={stroke} strokeWidth="3" />
              {[270, 158, 270, 382].map((x, index) => (
                <rect key={`${x}-${index}`} x={x - 36} y={index === 0 ? 38 : 216} width="72" height="42" rx="10" fill={fill} stroke={stroke} />
              ))}
              <circle cx="270" cy="70" r="8" fill={accent} />
            </>
          ) : null}
          {variant === "governance" ? (
            <>
              <rect x="190" y="52" width="190" height="170" rx="14" fill={fill} stroke={stroke} />
              <path d="M224 96h94M224 126h118M224 156h76" stroke={stroke} strokeWidth="6" strokeLinecap="round" />
              <path d="M350 176l28 28 54-72" stroke={accent} strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
            </>
          ) : null}
          {variant === "contact" ? (
            <>
              <path d="M148 170c74-78 162-78 264 0" stroke={stroke} strokeWidth="3" strokeLinecap="round" />
              <path d="M194 170c54-48 112-48 174 0" stroke={stroke} strokeWidth="3" strokeLinecap="round" />
              <rect x="232" y="108" width="124" height="88" rx="14" fill={fill} stroke={stroke} />
              <path d="M240 128l54 38 54-38" stroke={accent} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
            </>
          ) : null}
        </g>
      </svg>
    </div>
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
            : "mt-3 font-[family-name:var(--font-display)] text-2xl font-semibold leading-tight text-foreground"
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
    <article className="grid gap-3 rounded-md border border-border bg-surface-subtle p-4 sm:grid-cols-[42px_minmax(0,1fr)]">
      <span className="flex h-10 w-10 items-center justify-center rounded-md bg-white text-primary shadow-sm">
        <Icon aria-hidden className="h-5 w-5" />
      </span>
      <div>
        <h3 className="text-sm font-semibold text-foreground">{item.label}</h3>
        <ResearchRichText
          content={item.value}
          className="mt-2 text-sm leading-7 text-muted-foreground"
        />
      </div>
    </article>
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
        <span className="block text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          {item.label}
        </span>
        <span className="mt-1 block text-sm font-semibold text-foreground">
          {value || "Not published"}
        </span>
      </span>
    </>
  );
  const className = "flex min-h-20 items-center gap-3 rounded-md border border-border bg-surface-subtle p-4";

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
      className="mb-4 flex flex-wrap items-center gap-2 text-xs font-semibold text-muted-foreground"
    >
      <Link href="/" className="transition hover:text-primary">
        Home
      </Link>
      <ChevronRight aria-hidden className="h-3.5 w-3.5 text-muted-foreground/60" />
      <span className="text-foreground">About</span>
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
