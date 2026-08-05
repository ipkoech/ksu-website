import Link from "next/link";
import type { ReactNode } from "react";
import {
  ArrowRight,
  BadgeCheck,
  BookOpen,
  BriefcaseBusiness,
  CalendarDays,
  Download,
  ExternalLink,
  FileText,
  Globe,
  Landmark,
  Mail,
  MapPin,
  Newspaper,
  Phone,
  Quote,
  Target,
  UserRound,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { ScrollReveal } from "@ksu/ui/components";
import { PageShell } from "@/components/site-shell";
import { PublicImage } from "@/components/public/public-image";
import { PublicTeamSection } from "@/components/public/public-team-section";
import { EntityInquiryLauncher } from "@/components/public/entity-inquiry-launcher";
import {
  QuickLinksPanel,
  buildMediaTypeLinks,
  type EntityQuickLink,
} from "./entity-quick-links";
import { AboutPageLenis } from "@/components/ui/about-page-lenis";
import type {
  AdministrationOfficeDetailData,
  AdministrationUpdateRecord,
  DepartmentServiceRecord,
} from "@/lib/administration-office-detail-data";
import type {
  PublicTeamAssignment,
  PublicTeamPerson,
} from "@/lib/public-team-data";
import type { PublicPersonProfile } from "@/lib/public-person-data";
import { publicFileUrl, resolvePublicMediaUrl } from "@/lib/public-media";

type SectionKey =
  | "overview"
  | "about"
  | "directorates"
  | "units"
  | "schools"
  | "team"
  | "services"
  | "media"
  | "downloads"
  | "contact"
  | "news"
  | "events"
  | "blogs"
  | "announcements"
  | "gallery";

export type AdministrationOfficeDetailSectionKey = SectionKey;

export type AdministrationMediaType =
  | "news"
  | "events"
  | "blogs"
  | "announcements"
  | "gallery";

type ContactIconLink = {
  label: string;
  href: string;
  icon: LucideIcon;
  external?: boolean;
};

function present(value?: string | number | null) {
  if (value === null || value === undefined) return null;
  const text = String(value).trim();
  return text.length ? text : null;
}

function externalHref(value?: string | null) {
  const raw = present(value);
  if (!raw) return null;
  if (/^(https?:|mailto:|tel:)/i.test(raw)) return raw;
  return `https://${raw}`;
}

function googleScholarHref(person?: PublicPersonProfile | null) {
  return (
    externalHref(person?.google_scholar_url) ??
    (present(person?.google_scholar_id)
      ? `https://scholar.google.com/citations?user=${encodeURIComponent(
        present(person?.google_scholar_id)!,
      )}`
      : null)
  );
}

function orcidHref(value?: string | null) {
  const raw = present(value);
  if (!raw) return null;
  if (/^https?:\/\//i.test(raw)) return raw;
  return `https://orcid.org/${raw}`;
}

function stripHtml(value?: string | null) {
  return (value ?? "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<[^>]*>/g, " ")
    .replace(/\u00a0/g, " ")
    .replace(/[ \t]+/g, " ")
    .replace(/\n\s+/g, "\n")
    .trim();
}

function text(value?: string | null) {
  return present(stripHtml(value));
}

function formatDate(value?: string | null) {
  const raw = present(value);
  if (!raw) return null;
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return raw;
  return new Intl.DateTimeFormat("en-KE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function formatType(value?: string | null) {
  return (
    present(value)
      ?.replace(/_/g, " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase()) ?? null
  );
}

function displayPersonName(
  person?: PublicTeamPerson | PublicPersonProfile | null,
) {
  if (!person) return "Division head";

  const title = present(person.title);
  const fullName = present(person.full_name);

  if (fullName) {
    if (title && !fullName.toLowerCase().startsWith(title.toLowerCase())) {
      return `${title} ${fullName}`;
    }
    return fullName;
  }

  return (
    [person.title, person.first_name, person.middle_name, person.last_name]
      .map((value) => present(value))
      .filter(Boolean)
      .join(" ") || "Division head"
  );
}

function roleLabel(
  assignment?: PublicTeamAssignment | null,
  person?: PublicTeamPerson | PublicPersonProfile | null,
) {
  return (
    present(assignment?.title) ||
    present(assignment?.role_display) ||
    present(assignment?.role_label) ||
    present(assignment?.role?.replace(/_/g, " ")) ||
    present(person?.institutional_role) ||
    present(person?.academic_rank) ||
    "Division head"
  );
}

function headPhoto(person?: PublicTeamPerson | PublicPersonProfile | null) {
  return (
    resolvePublicMediaUrl(person?.photo_url) ??
    publicFileUrl(person?.photo_id) ??
    null
  );
}

function initialsFromName(name: string) {
  const parts = name
    .split(/\s+/)
    .map((part) => part.replace(/[^A-Za-z]/g, ""))
    .filter(Boolean)
    .filter(
      (part) =>
        !new Set(["dr", "prof", "mr", "mrs", "ms", "rev", "eng"]).has(
          part.toLowerCase(),
        ),
    );

  if (!parts.length) return "H";
  const selected = parts.length === 1 ? [parts[0]] : [parts[0], parts.at(-1)!];
  return selected
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function getDivisionHead(data: AdministrationOfficeDetailData) {
  const assignments = data.team?.assignments ?? [];
  const profile = data.headProfile;

  const sorted = assignments
    .slice()
    .sort(
      (first, second) =>
        Number(first.hierarchy_level ?? 99) -
        Number(second.hierarchy_level ?? 99) ||
        Number(second.is_primary) - Number(first.is_primary) ||
        Number(first.display_order ?? 100) - Number(second.display_order ?? 100),
    );
  const head = profile
    ? sorted.find((assignment) => assignment.person_id === profile.id)
    : sorted.find((assignment) => assignment.is_primary) ??
    sorted.find((assignment) =>
      /dvc|head|director|dean|registrar|chair/i.test(
        `${assignment.role ?? ""} ${assignment.title ?? ""}`,
      ),
    ) ??
    sorted[0];
  const person = profile ?? (head ? data.team?.persons[head.person_id] : null);

  return person ? { assignment: head, person } : null;
}

function headMessageText(data: AdministrationOfficeDetailData) {
  return (
    text(data.entity.head_message) ??
    text(data.headProfile?.leadership_message) ??
    text(data.headProfile?.full_bio) ??
    text(data.headProfile?.bio)
  );
}

function optionalProfileUrl(
  profile: PublicPersonProfile | null | undefined,
  key: string,
) {
  const value = (profile as unknown as Record<string, unknown> | null)?.[key];
  return typeof value === "string" ? externalHref(value) : null;
}

function buildHeadContactLinks(
  person: PublicTeamPerson | PublicPersonProfile,
  profile: PublicPersonProfile | null,
  profileHref: string,
): ContactIconLink[] {
  const email = present(profile?.email ?? person.email);
  const phone = present(
    profile?.phone ??
    profile?.office_phone ??
    profile?.alternative_phone ??
    person.phone ??
    person.office_phone,
  );
  const websiteHref = externalHref(profile?.website_url);
  const linkedinHref = externalHref(profile?.linkedin_url);
  const scholarHref = googleScholarHref(profile);
  const orcidProfileHref = orcidHref(profile?.orcid);
  const researchGateHref = externalHref(profile?.researchgate_url);
  const facebookHref = optionalProfileUrl(profile, "facebook_url");
  const xHref =
    optionalProfileUrl(profile, "twitter_url") ??
    optionalProfileUrl(profile, "x_url");
  const instagramHref = optionalProfileUrl(profile, "instagram_url");
  const links: Array<ContactIconLink | null> = [
    email
      ? {
        label: "Email",
        href: `mailto:${email}`,
        icon: Mail,
      }
      : null,
    phone
      ? {
        label: "Call",
        href: `tel:${phone}`,
        icon: Phone,
      }
      : null,
    websiteHref
      ? {
        label: "Website",
        href: websiteHref,
        icon: Globe,
        external: true,
      }
      : null,
    linkedinHref
      ? {
        label: "LinkedIn",
        href: linkedinHref,
        icon: ExternalLink,
        external: true,
      }
      : null,
    scholarHref
      ? {
        label: "Google Scholar",
        href: scholarHref,
        icon: BookOpen,
        external: true,
      }
      : null,
    orcidProfileHref
      ? {
        label: "ORCID",
        href: orcidProfileHref,
        icon: BadgeCheck,
        external: true,
      }
      : null,
    researchGateHref
      ? {
        label: "ResearchGate",
        href: researchGateHref,
        icon: ExternalLink,
        external: true,
      }
      : null,
    facebookHref
      ? {
        label: "Facebook",
        href: facebookHref,
        icon: ExternalLink,
        external: true,
      }
      : null,
    xHref
      ? {
        label: "X",
        href: xHref,
        icon: ExternalLink,
        external: true,
      }
      : null,
    instagramHref
      ? {
        label: "Instagram",
        href: instagramHref,
        icon: ExternalLink,
        external: true,
      }
      : null,
    {
      label: "View profile",
      href: profileHref,
      icon: UserRound,
    },
  ];

  return links.filter(Boolean) as ContactIconLink[];
}

function HeadContactIconLink({ item }: { item: ContactIconLink }) {
  const Icon = item.icon;
  const className =
    "inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-white text-primary shadow-sm transition hover:border-primary/40 hover:bg-primary hover:text-white";
  const content = (
    <>
      <Icon aria-hidden className="h-4 w-4" />
      <span className="sr-only">{item.label}</span>
    </>
  );

  if (item.external || /^(mailto:|tel:)/i.test(item.href)) {
    return (
      <a
        href={item.href}
        aria-label={item.label}
        title={item.label}
        target={item.external ? "_blank" : undefined}
        rel={item.external ? "noopener noreferrer" : undefined}
        className={className}
      >
        {content}
      </a>
    );
  }

  return (
    <Link
      href={item.href}
      aria-label={item.label}
      title={item.label}
      className={className}
    >
      {content}
    </Link>
  );
}

function compactMeta(values: Array<string | number | null | undefined>) {
  return values
    .map((value) => present(value))
    .filter(Boolean)
    .join(" · ");
}

function RichText({ value }: { value?: string | null }) {
  const content = text(value);
  if (!content) return null;

  const paragraphs = content
    .split(/\n{2,}|\n/)
    .map((part) => part.trim())
    .filter(Boolean);

  return (
    <div className="grid gap-3 text-sm leading-7 text-muted-foreground">
      {paragraphs.map((paragraph) => (
        <p key={paragraph}>{paragraph}</p>
      ))}
    </div>
  );
}

function SectionKicker({ children }: { children: string }) {
  return (
    <p className="text-xs font-bold uppercase tracking-[0.08em] text-primary">
      {children}
    </p>
  );
}

function SectionHeading({
  id,
  eyebrow,
  title,
  body,
}: {
  id: string;
  eyebrow: string;
  title: string;
  body?: string | null;
}) {
  return (
    <div id={id} className="scroll-mt-28">
      <SectionKicker>{eyebrow}</SectionKicker>
      <h2 className="mt-2 font-[family-name:var(--font-display)] text-2xl font-semibold leading-tight text-foreground">
        {title}
      </h2>
      {body ? (
        <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
          {body}
        </p>
      ) : null}
    </div>
  );
}

function DivisionHeadProfile({ data }: { data: AdministrationOfficeDetailData }) {
  const head = getDivisionHead(data);
  if (!head) return null;

  const { assignment, person } = head;
  const name = displayPersonName(person);
  const role = roleLabel(assignment, person);
  const photoUrl = headPhoto(person);
  const profileHref = `/staff/${person.id}`;
  const message = headMessageText(data);
  const contactLinks = buildHeadContactLinks(person, data.headProfile, profileHref);
  const isAcademicDivision =
    data.entity.entityKind === "division" && data.entity.code === "ARSA";

  return (
    <section id="profile" className="scroll-mt-28">
      <article className="overflow-hidden rounded-[1.5rem] border border-border bg-white shadow-sm">
        <div className="grid gap-4 p-4 sm:p-5 lg:grid-cols-[12rem_minmax(0,1fr)] lg:items-start">
          <div className="flex flex-col items-center gap-3 rounded-2xl bg-surface-subtle p-4 text-center">
            <div className="h-32 w-32 overflow-hidden rounded-full bg-primary/[0.08] ring-4 ring-white shadow-sm sm:h-36 sm:w-36">
              {photoUrl ? (
                <PublicImage
                  src={photoUrl}
                  alt={name}
                  ratio="profile"
                  sizes="144px"
                  className="h-full w-full"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center font-[family-name:var(--font-display)] text-3xl font-semibold text-primary">
                  {initialsFromName(name)}
                </div>
              )}
            </div>
            <p className="text-xs font-bold uppercase tracking-[0.08em] text-primary">
              {isAcademicDivision
                ? "Academic leadership"
                : data.kind === "division"
                ? "Division Head"
                : "Directorate Head"}
            </p>
          </div>
          <div className="grid min-w-0 content-start divide-y divide-slate-100">
            <div className="pb-4">
              {message ? (
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.08em] text-muted-foreground">
                    Head&apos;s Message
                  </p>
                  <div className="mt-2 flex gap-3">
                    <Quote
                      aria-hidden
                      className="mt-1 h-5 w-5 shrink-0 text-secondary"
                    />
                    <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
                      {message}
                    </p>
                  </div>
                </div>
              ) : null}
            </div>
            <div className="grid gap-4 py-4 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.08em] text-muted-foreground">
                  Name
                </p>
                <h2 className="mt-1 font-[family-name:var(--font-display)] text-2xl font-semibold leading-tight text-foreground">
                  {name}
                </h2>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.08em] text-muted-foreground">
                  Position
                </p>
                <p className="mt-1 text-sm font-bold leading-6 text-primary">
                  {role}
                </p>
              </div>
            </div>
            <div className="pt-4">
              <p className="text-xs font-bold uppercase tracking-[0.08em] text-muted-foreground">
                Contact
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {contactLinks.map((item) => (
                  <HeadContactIconLink
                    key={`${item.label}-${item.href}`}
                    item={item}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </article>
    </section>
  );
}

function StatementCard({
  title,
  body,
  icon: Icon,
}: {
  title: string;
  body?: string | null;
  icon: LucideIcon;
}) {
  if (!text(body)) return null;

  return (
    <article className="rounded-[1.25rem] border border-border bg-white p-4 shadow-sm">
      <div className="flex gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/[0.08] text-primary">
          <Icon aria-hidden className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <h3 className="text-base font-bold text-foreground">{title}</h3>
          <div className="mt-2">
            <RichText value={body} />
          </div>
        </div>
      </div>
    </article>
  );
}

function HeadMessage({ data }: { data: AdministrationOfficeDetailData }) {
  if (getDivisionHead(data)) return null;

  const message = headMessageText(data);
  if (!message) return null;

  return (
    <section
      id="message"
      className="scroll-mt-28 rounded-[1.5rem] bg-brand-overlay p-5 text-white shadow-sm sm:p-6"
    >
      <SectionKicker>Leadership Message</SectionKicker>
      <Quote aria-hidden className="mt-3 h-7 w-7 text-secondary" />
      <p className="mt-2 text-sm leading-7 text-white/80 sm:text-base">
        {message}
      </p>
    </section>
  );
}

function AboutSection({ data }: { data: AdministrationOfficeDetailData }) {
  const { entity } = data;
  const isDivision = entity.entityKind === "division";
  const description = text(entity.description);
  const mission = isDivision ? entity.mission : null;
  const vision = isDivision ? entity.vision : null;
  const values = isDivision ? entity.core_values : null;
  const mandate = isDivision ? null : entity.mandate;
  const serviceCharter = isDivision ? null : entity.service_charter;
  const isAcademicDivision = isDivision && entity.code === "ARSA";

  if (
    !description &&
    !text(mission) &&
    !text(vision) &&
    !text(values) &&
    !text(mandate) &&
    !text(serviceCharter)
  ) {
    return null;
  }

  return (
    <section className="grid gap-4">
      <SectionHeading
        id="about"
        eyebrow={
          isAcademicDivision
            ? "Academic, Research & Student Affairs"
            : isDivision
            ? "Division Profile"
            : "Directorate Profile"
        }
        title={
          isAcademicDivision
            ? "Academic leadership and support"
            : isDivision
            ? "About the division"
            : "About the directorate"
        }
      />
      {description ? (
        <article className="rounded-[1.25rem] border border-border bg-white p-5 shadow-sm">
          <RichText value={description} />
        </article>
      ) : null}
      <div className="grid gap-3 md:grid-cols-2">
        <StatementCard title="Mission" body={mission} icon={Target} />
        <StatementCard title="Vision" body={vision} icon={Landmark} />
        <StatementCard title="Mandate" body={mandate} icon={Target} />
        <StatementCard
          title="Service Charter"
          body={serviceCharter}
          icon={FileText}
        />
        <StatementCard title="Core Values" body={values} icon={Users} />
      </div>
    </section>
  );
}

function LinkedRecordCard({
  href,
  title,
  eyebrow,
  body,
  icon: Icon,
}: {
  href: string;
  title: string;
  eyebrow?: string | null;
  body?: string | null;
  icon: LucideIcon;
}) {
  return (
    <Link
      href={href}
      className="group rounded-[1.25rem] border border-border bg-white p-4 shadow-sm transition-colors hover:border-primary/30 hover:bg-primary/[0.03]"
    >
      <div className="flex gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/[0.08] text-primary">
          <Icon aria-hidden className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          {eyebrow ? (
            <p className="text-xs font-bold uppercase tracking-[0.08em] text-primary">
              {eyebrow}
            </p>
          ) : null}
          <h3 className="mt-1 text-base font-bold text-foreground group-hover:text-primary">
            {title}
          </h3>
          {body ? (
            <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">
              {body}
            </p>
          ) : null}
        </div>
        <ArrowRight
          aria-hidden
          className="h-4 w-4 shrink-0 text-muted-foreground/60 transition-transform duration-150 group-hover:translate-x-0.5 group-hover:text-primary"
        />
      </div>
    </Link>
  );
}

function DirectoratesSection({
  data,
}: {
  data: AdministrationOfficeDetailData;
}) {
  if (!data.childWings.length) return null;
  const isAcademicDivision =
    data.entity.entityKind === "division" && data.entity.code === "ARSA";

  return (
    <section className="grid gap-4">
      <SectionHeading
        id="directorates"
        eyebrow={isAcademicDivision ? "Academic support portfolios" : "Administrative Units"}
        title={isAcademicDivision ? "Connect with the right office" : "Units under this division"}
        body={
          isAcademicDivision
            ? "Find the office responsible for your academic journey, research support and student services."
            : "These units coordinate broad portfolios and provide leadership for related administrative and academic-support functions."
        }
      />
      <div className="grid gap-3 md:grid-cols-2">
        {data.childWings.map((wing) => (
          <LinkedRecordCard
            key={wing.id}
            href={`/administration/units/${wing.slug}`}
            title={wing.name}
            eyebrow={formatType(wing.wing_type)}
            body={text(wing.description) ?? text(wing.mandate)}
            icon={Landmark}
          />
        ))}
      </div>
    </section>
  );
}

function UnitsSection({ data }: { data: AdministrationOfficeDetailData }) {
  if (!data.childWings.length && !data.departments.length) return null;
  const departmentWingIds = new Set(
    data.departments
      .map((department) => present(department.wing_id))
      .filter((value): value is string => Boolean(value)),
  );
  const visibleWings =
    data.kind === "division"
      ? data.childWings.filter((wing) => !departmentWingIds.has(wing.id))
      : data.childWings;

  return (
    <section className="grid gap-4">
      <SectionHeading
        id="units"
        eyebrow="Administrative Units"
        title={
          data.kind === "division"
            ? "Departments and units under this division"
            : "Departments and units"
        }
        body="Portfolio units and operational departments are listed separately to avoid duplicate records."
      />
      {visibleWings.length ? (
        <div className="grid gap-3 md:grid-cols-2">
          {visibleWings.map((wing) => (
            <LinkedRecordCard
              key={wing.id}
              href={`/administration/units/${wing.slug}`}
              title={wing.name}
              eyebrow={formatType(wing.wing_type) ?? "Portfolio Unit"}
              body={text(wing.description) ?? text(wing.mandate)}
              icon={Landmark}
            />
          ))}
        </div>
      ) : null}
      <div className="grid gap-3 md:grid-cols-2">
        {data.departments.map((department) => (
          <LinkedRecordCard
            key={department.id}
            href={`/administration/units/${department.slug}`}
            title={department.name}
            eyebrow={department.code}
            body={
              text(department.about) ??
              text(department.mandate) ??
              text(department.service_charter)
            }
            icon={Landmark}
          />
        ))}
      </div>
    </section>
  );
}

function SchoolsSection({ data }: { data: AdministrationOfficeDetailData }) {
  if (!data.schools.length) return null;

  return (
    <section className="grid gap-4">
      <SectionHeading
        id="schools"
        eyebrow="Academic Schools"
        title="Schools attached to this directorate"
      />
      <div className="grid gap-3 md:grid-cols-2">
        {data.schools.map((school) => (
          <LinkedRecordCard
            key={school.id}
            href={`/academics/schools/${school.slug}`}
            title={school.name}
            eyebrow={school.code}
            body={formatType(school.school_type)}
            icon={Landmark}
          />
        ))}
      </div>
    </section>
  );
}

function ServicesSection({
  services,
}: {
  services: DepartmentServiceRecord[];
}) {
  if (!services.length) {
    return (
      <section className="grid gap-4">
        <SectionHeading
          id="services"
          eyebrow="Services"
          title="Services"
          body="Published services for this office will appear here once they are attached to the relevant administrative units."
        />
      </section>
    );
  }

  return (
    <section className="grid gap-4">
      <SectionHeading
        id="services"
        eyebrow="Services"
        title="Services"
        body="Service records are listed separately from the division overview so users can focus on processes, requirements, and service contacts."
      />
      <div className="grid gap-3 md:grid-cols-2">
        {services.map((service) => {
          const meta = compactMeta([
            service.turnaround_time,
            service.fee,
            service.contact_email,
            service.contact_phone,
          ]);

          return (
            <article
              key={service.id}
              className="rounded-[1.25rem] border border-border bg-white p-4 shadow-sm"
            >
              <div className="flex gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/[0.08] text-primary">
                  <BriefcaseBusiness aria-hidden className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <h3 className="text-base font-bold text-foreground">
                    {service.name}
                  </h3>
                  {text(service.description) ? (
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      {text(service.description)}
                    </p>
                  ) : null}
                  {text(service.requirements) ? (
                    <p className="mt-3 text-sm leading-6 text-muted-foreground">
                      <span className="font-bold text-foreground">
                        Requirements:{" "}
                      </span>
                      {text(service.requirements)}
                    </p>
                  ) : null}
                  {text(service.process) ? (
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      <span className="font-bold text-foreground">
                        Process:{" "}
                      </span>
                      {text(service.process)}
                    </p>
                  ) : null}
                  {meta ? (
                    <p className="mt-3 text-xs font-semibold text-primary">
                      {meta}
                    </p>
                  ) : null}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function mediaHref(item: AdministrationUpdateRecord) {
  switch (item.recordType) {
    case "blog":
      return `/media/articles/${item.slug}`;
    case "event":
      return `/media/events/${item.slug}`;
    case "announcement":
      return `/media/announcements/${item.slug}`;
    case "gallery":
      return `/media/gallery/${item.id}`;
    case "news":
      return `/media/news/${item.slug}`;
  }
}

function mediaDate(item: AdministrationUpdateRecord) {
  switch (item.recordType) {
    case "event":
      return formatDate(item.start_date);
    case "gallery":
      return formatDate(item.created_at);
    case "blog":
    case "announcement":
    case "news":
      return formatDate(item.published_at ?? item.created_at);
  }
}

function mediaTitle(item: AdministrationUpdateRecord) {
  if (item.recordType === "gallery") {
    return present(item.title) ?? present(item.original_filename) ?? "Gallery image";
  }
  return item.title;
}

function mediaSummary(item: AdministrationUpdateRecord) {
  switch (item.recordType) {
    case "gallery":
      return text(item.description) ?? text(item.caption) ?? text(item.alt_text);
    case "event":
      return text(item.summary);
    case "blog":
    case "announcement":
    case "news":
      return text(item.summary);
  }
}

function mediaLabel(item: AdministrationUpdateRecord) {
  return item.recordType === "gallery" ? "Gallery" : formatType(item.recordType);
}

function mediaTypeMatches(item: AdministrationUpdateRecord, type?: AdministrationMediaType) {
  if (!type) return true;
  if (type === "blogs") return item.recordType === "blog";
  if (type === "events") return item.recordType === "event";
  if (type === "announcements") return item.recordType === "announcement";
  if (type === "gallery") return item.recordType === "gallery";
  return item.recordType === "news";
}

function mediaTypeTitle(type?: AdministrationMediaType) {
  if (!type) return "News, events, blogs, announcements, and gallery";

  return {
    news: "News",
    events: "Events",
    blogs: "Blogs",
    announcements: "Announcements",
    gallery: "Gallery",
  }[type];
}

function mediaTypeBody(type?: AdministrationMediaType) {
  if (type === "gallery") {
    return "Gallery records are limited to media directly related to this office.";
  }
  if (type) {
    return "If no office-specific records are published yet, a small set of latest university-wide records is shown.";
  }
  return undefined;
}

function MediaSection({
  data,
  mediaType,
}: {
  data: AdministrationOfficeDetailData;
  mediaType?: AdministrationMediaType;
}) {
  const updates = data.updates.filter((item) => mediaTypeMatches(item, mediaType));
  const scopedCount = updates.filter((item) => item.recordScope !== "fallback").length;
  const fallbackCount = updates.filter((item) => item.recordScope === "fallback").length;
  const categories = [
    {
      label: "News",
      href: `${data.baseHref}/media/news`,
      body: "Published news items related to this office or university operations.",
      icon: Newspaper,
    },
    {
      label: "Events",
      href: `${data.baseHref}/media/events`,
      body: "Upcoming and past events connected to this administrative area.",
      icon: CalendarDays,
    },
    {
      label: "Blogs",
      href: `${data.baseHref}/media/blogs`,
      body: "Feature articles, updates, and public stories.",
      icon: FileText,
    },
    {
      label: "Announcements",
      href: `${data.baseHref}/media/announcements`,
      body: "Official notices and time-sensitive public updates.",
      icon: Quote,
    },
    {
      label: "Gallery",
      href: `${data.baseHref}/media/gallery`,
      body: "Published image and media gallery records.",
      icon: Download,
    },
  ];

  return (
    <section className="grid gap-4">
      <SectionHeading
        id="media"
        eyebrow="Media"
        title={mediaTypeTitle(mediaType)}
        body={mediaTypeBody(mediaType)}
      />
      {!mediaType ? (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {categories.map((category) => (
            <LinkedRecordCard
              key={category.label}
              href={category.href}
              title={category.label}
              eyebrow="Media category"
              body={category.body}
              icon={category.icon}
            />
          ))}
        </div>
      ) : null}
      {fallbackCount > 0 && scopedCount === 0 && mediaType !== "gallery" ? (
        <p className="rounded-[1.25rem] border border-dashed border-border bg-white p-4 text-sm leading-6 text-muted-foreground">
          No records are currently published for this office, so the latest
          university-wide {mediaTypeTitle(mediaType).toLowerCase()} are shown.
        </p>
      ) : null}
      {!updates.length ? (
        <p className="rounded-[1.25rem] border border-dashed border-border bg-white p-4 text-sm leading-6 text-muted-foreground">
          No {mediaType ? mediaTypeTitle(mediaType).toLowerCase() : "media"} records
          are currently published for this office.
        </p>
      ) : null}
      <div className="grid gap-3 md:grid-cols-2">
        {updates.map((item) => (
          <Link
            key={`${item.recordType}-${item.id}`}
            href={mediaHref(item)}
            className="group rounded-[1.25rem] border border-border bg-white p-4 shadow-sm transition-colors hover:border-primary/30 hover:bg-primary/[0.03]"
          >
            <p className="text-xs font-bold uppercase tracking-[0.08em] text-primary">
              {mediaLabel(item) ?? "Media"}
            </p>
            <h3 className="mt-2 text-base font-bold text-foreground group-hover:text-primary">
              {mediaTitle(item)}
            </h3>
            {mediaSummary(item) ? (
              <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted-foreground">
                {mediaSummary(item)}
              </p>
            ) : null}
            {mediaDate(item) ? (
              <p className="mt-3 text-xs font-semibold text-muted-foreground">
                {mediaDate(item)}
              </p>
            ) : null}
          </Link>
        ))}
      </div>
    </section>
  );
}

function DownloadsSection({ data }: { data: AdministrationOfficeDetailData }) {
  if (!data.documents.length) return null;

  return (
    <section className="grid gap-4">
      <SectionHeading
        id="downloads"
        eyebrow="Downloads"
        title="Documents and files"
      />
      <div className="grid gap-3">
        {data.documents.map((document) => {
          const meta = compactMeta([
            document.document_type,
            document.category,
            document.version,
            formatDate(document.updated_at),
          ]);
          const fileUrl = publicFileUrl(document.file_id);

          return (
            <article
              key={document.id}
              className="rounded-[1.25rem] border border-border bg-white p-4 shadow-sm"
            >
              <div className="flex gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/[0.08] text-primary">
                  <FileText aria-hidden className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="text-base font-bold text-foreground">
                    {document.title}
                  </h3>
                  {meta ? (
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      {meta}
                    </p>
                  ) : null}
                  {text(document.description) ? (
                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">
                      {text(document.description)}
                    </p>
                  ) : null}
                </div>
                {fileUrl ? (
                  <a
                    href={fileUrl}
                    className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-primary/20 text-primary transition-colors hover:bg-primary hover:text-white"
                    aria-label={`Download ${document.title}`}
                  >
                    <Download aria-hidden className="h-4 w-4" />
                  </a>
                ) : null}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function ContactRows({ data }: { data: AdministrationOfficeDetailData }) {
  const entity = data.entity;
  const rows = [
    { label: "Office", value: present(entity.office_location), icon: MapPin },
    {
      label: "Email",
      value: present(entity.email),
      icon: Mail,
      href: entity.email ? `mailto:${entity.email}` : undefined,
    },
    {
      label: "Phone",
      value: present(entity.phone),
      icon: Phone,
      href: entity.phone ? `tel:${entity.phone}` : undefined,
    },
  ].filter((item) => item.value);

  if (!rows.length) return null;

  return (
    <div className="grid gap-3 md:grid-cols-3">
      {rows.map((item) => {
        const Icon = item.icon;
        const content = (
          <>
            <Icon aria-hidden className="h-5 w-5 text-primary" />
            <span>
              <span className="block text-xs font-bold uppercase tracking-[0.08em] text-muted-foreground">
                {item.label}
              </span>
              <span className="mt-1 block break-words text-sm font-semibold text-foreground [overflow-wrap:anywhere]">
                {item.value}
              </span>
            </span>
          </>
        );

        return item.href ? (
          <a
            key={item.label}
            href={item.href}
            className="flex gap-3 rounded-[1.25rem] border border-border bg-white p-4 shadow-sm transition-colors hover:border-primary/30"
          >
            {content}
          </a>
        ) : (
          <div
            key={item.label}
            className="flex gap-3 rounded-[1.25rem] border border-border bg-white p-4 shadow-sm"
          >
            {content}
          </div>
        );
      })}
    </div>
  );
}

function ContactSection({ data }: { data: AdministrationOfficeDetailData }) {
  const hasContact =
    present(data.entity.office_location) ||
    present(data.entity.email) ||
    present(data.entity.phone) ||
    Object.keys(data.entity.operating_hours ?? {}).length > 0;

  if (!hasContact) return null;

  return (
    <section className="grid gap-4">
      <SectionHeading
        id="contact"
        eyebrow="Contact"
        title="Contact information"
      />
      <ContactRows data={data} />
      {Object.keys(data.entity.operating_hours ?? {}).length ? (
        <article className="rounded-[1.25rem] border border-border bg-white p-4 shadow-sm">
          <SectionKicker>Operating Hours</SectionKicker>
          <dl className="mt-3 grid gap-2 sm:grid-cols-2">
            {Object.entries(data.entity.operating_hours ?? {}).map(
              ([key, value]) => (
                <div
                  key={key}
                  className="flex items-center justify-between gap-3 rounded-lg bg-surface-subtle px-3 py-2"
                >
                  <dt className="text-sm font-semibold capitalize text-muted-foreground">
                    {key.replace(/_/g, " ")}
                  </dt>
                  <dd className="text-sm font-bold text-foreground">
                    {String(value)}
                  </dd>
                </div>
              ),
            )}
          </dl>
        </article>
      ) : null}
    </section>
  );
}

function InfoPanel({ data }: { data: AdministrationOfficeDetailData }) {
  const entity = data.entity;
  const items = [
    { label: "Code", value: present(entity.code), icon: FileText },
    {
      label: "Type",
      value: formatType(
        entity.entityKind === "division"
          ? entity.division_type
          : entity.wing_type,
      ),
      icon: Landmark,
    },
    {
      label: "Portfolio Units",
      value: data.counts.childWings || null,
      icon: Landmark,
    },
    {
      label: "Administrative Units",
      value: data.counts.departments || null,
      icon: BriefcaseBusiness,
    },
    {
      label: "Attached Schools",
      value: data.counts.schools || null,
      icon: Landmark,
    },
  ].filter((item) => item.value);

  if (!items.length) return null;

  return (
    <section className="rounded-[1.5rem] border border-border bg-white p-4 shadow-sm">
      <SectionKicker>At a Glance</SectionKicker>
      <dl className="mt-3 grid gap-2">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.label}
              className="flex w-full min-w-0 gap-3 rounded-xl p-2"
            >
              <Icon
                aria-hidden
                className="mt-0.5 h-5 w-5 shrink-0 text-primary"
              />
              <div className="min-w-0 flex-1">
                <dt className="text-xs font-bold text-foreground">
                  {item.label}
                </dt>
                <dd className="mt-0.5 break-words text-sm font-medium leading-5 text-primary [overflow-wrap:anywhere]">
                  {item.value}
                </dd>
              </div>
            </div>
          );
        })}
      </dl>
    </section>
  );
}

function ContactPanel({ data }: { data: AdministrationOfficeDetailData }) {
  const rows = [
    {
      label: "Office",
      value: present(data.entity.office_location),
      icon: MapPin,
    },
    {
      label: "Phone",
      value: present(data.entity.phone),
      icon: Phone,
      href: data.entity.phone ? `tel:${data.entity.phone}` : undefined,
    },
    {
      label: "Email",
      value: present(data.entity.email),
      icon: Mail,
      href: data.entity.email ? `mailto:${data.entity.email}` : undefined,
    },
  ].filter((item) => item.value);

  if (!rows.length) return null;

  return (
    <section className="min-w-0 overflow-hidden rounded-[1.5rem] border border-border bg-white p-4 shadow-sm">
      <SectionKicker>Contact</SectionKicker>
      <div className="mt-3 grid min-w-0 gap-1.5">
        {rows.map((item) => {
          const Icon = item.icon;
          const content = (
            <>
              <Icon
                aria-hidden
                className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground"
              />
              <span className="min-w-0 flex-1">
                <span className="block text-xs font-bold text-foreground">
                  {item.label}
                </span>
                <span className="mt-0.5 block break-words text-sm font-medium leading-5 text-primary [overflow-wrap:anywhere]">
                  {item.value}
                </span>
              </span>
            </>
          );

          return item.href ? (
            <a
              key={item.label}
              href={item.href}
              className="flex w-full min-w-0 gap-3 rounded-xl p-2 transition-colors hover:bg-primary/5"
            >
              {content}
            </a>
          ) : (
            <div
              key={item.label}
              className="flex w-full min-w-0 gap-3 rounded-xl p-2"
            >
              {content}
            </div>
          );
        })}
      </div>
    </section>
  );
}

function quickLinksFor(data: AdministrationOfficeDetailData): EntityQuickLink[] {
  const h = data.baseHref;
  const links: EntityQuickLink[] = [
    { label: "Overview", href: h, icon: UserRound, section: "overview" },
  ];
  if (data.kind === "division" && (data.childWings.length || data.departments.length))
    links.push({ label: "Units", href: `${h}/units`, icon: BriefcaseBusiness, section: "units" });
  if (data.kind === "division" && data.schools.length)
    links.push({ label: "Schools", href: `${h}/schools`, icon: Landmark, section: "schools" });
  if (data.counts.team > 0)
    links.push({ label: "Team", href: `${h}/team`, icon: Users, section: "team" });
  if (data.services.length)
    links.push({ label: "Services", href: `${h}/services`, icon: BriefcaseBusiness, section: "services" });
  links.push({ label: "Media", href: `${h}/media`, icon: Newspaper, section: "media" });
  if (data.documents.length)
    links.push({ label: "Downloads", href: `${h}/downloads`, icon: Download, section: "downloads" });
  if (present(data.entity.email) || present(data.entity.phone) || present(data.entity.office_location))
    links.push({ label: "Contact", href: `${h}/contact`, icon: Phone, section: "contact" });
  return links;
}

function ParentPanel({ data }: { data: AdministrationOfficeDetailData }) {
  if (!data.parent) return null;

  return (
    <section className="rounded-[1.5rem] border border-border bg-white p-4 shadow-sm">
      <SectionKicker>Administration</SectionKicker>
      <Link
        href={data.parent.href}
        className="group mt-3 flex min-h-10 items-center gap-3 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
      >
        <Landmark aria-hidden className="h-4 w-4 shrink-0 text-primary" />
        <span className="min-w-0 flex-1">{data.parent.label}</span>
        <ArrowRight
          aria-hidden
          className="h-4 w-4 shrink-0 text-muted-foreground/60 transition-transform duration-150 group-hover:translate-x-0.5 group-hover:text-primary"
        />
      </Link>
    </section>
  );
}

function renderOfficeSection(
  section: AdministrationOfficeDetailSectionKey,
  data: AdministrationOfficeDetailData,
  mediaType?: AdministrationMediaType,
) {
  if (section === "about") return <AboutSection data={data} />;
  if (section === "directorates") return <DirectoratesSection data={data} />;
  if (section === "units") return <UnitsSection data={data} />;
  if (section === "schools") return <SchoolsSection data={data} />;
  if (section === "team") {
    return data.counts.team > 0 ? (
      <section id="team" className="scroll-mt-28">
        <PublicTeamSection team={data.team} title={`${data.entity.name} Team`} />
      </section>
    ) : null;
  }
  if (section === "services") return <ServicesSection services={data.services} />;
  if (section === "media") return <MediaSection data={data} mediaType={mediaType} />;
  if (section === "downloads") return <DownloadsSection data={data} />;
  if (section === "contact") return <ContactSection data={data} />;

  return (
    <>
      <DivisionHeadProfile data={data} />
      <HeadMessage data={data} />
      <AboutSection data={data} />
    </>
  );
}

export function AdministrationOfficeDetailSection({
  data,
  header,
  section = "overview",
  mediaType,
}: {
  data: AdministrationOfficeDetailData;
  header?: ReactNode;
  section?: AdministrationOfficeDetailSectionKey;
  mediaType?: AdministrationMediaType;
}) {
  const sidebarLinks =
    section === "media" ? buildMediaTypeLinks(data.baseHref) : quickLinksFor(data);
  const sidebarTitle = section === "media" ? "Content Types" : "Quick Links";
  const sidebarLabel =
    section === "media"
      ? "Media content type links"
      : "Administration page quick links";
  const contactPanel = <ContactPanel data={data} />;
  const infoPanel = <InfoPanel data={data} />;

  return (
    <PageShell header={header}>
      <AboutPageLenis>
        <section className="w-full bg-[linear-gradient(180deg,hsl(var(--surface-subtle))_0%,#ffffff_68%,hsl(var(--surface-muted))_100%)] px-4 py-5 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
          <div className="grid w-full gap-4 xl:grid-cols-[minmax(220px,0.2fr)_minmax(0,1fr)_minmax(260px,0.22fr)] 2xl:grid-cols-[minmax(240px,0.18fr)_minmax(0,1fr)_minmax(300px,0.22fr)] xl:items-start">
            <aside className="hidden min-w-0 space-y-4 xl:sticky xl:top-28 xl:block">
              <QuickLinksPanel
                links={sidebarLinks}
                title={sidebarTitle}
                ariaLabel={sidebarLabel}
              />
              <ParentPanel data={data} />
            </aside>

            <ScrollReveal as="main" className="grid min-w-0 gap-5">
              {renderOfficeSection(section, data, mediaType)}
            </ScrollReveal>

            <aside className="hidden min-w-0 space-y-4 xl:sticky xl:top-28 xl:block">
              {contactPanel}
              {infoPanel}
            </aside>

            <aside className="grid gap-4 xl:hidden">
              {contactPanel}
              {infoPanel}
              <ParentPanel data={data} />
            </aside>
          </div>
        </section>
      </AboutPageLenis>
      <EntityInquiryLauncher
        target={{
          type: "office",
          slug: data.entity.slug,
          name: data.entity.name,
        }}
      />
    </PageShell>
  );
}
