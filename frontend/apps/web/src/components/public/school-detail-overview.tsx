import type { ReactNode } from "react";
import Link from "next/link";
import type { EntityHeaderNavItem } from "@ksu/ui/layout/public";
import {
  Building2,
  ArrowRight,
  CalendarDays,
  Eye,
  GraduationCap,
  Landmark,
  Mail,
  MapPin,
  Phone,
  Quote,
  ShieldCheck,
  Target,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { AmbientPageBackground, ScrollReveal } from "@ksu/ui/components";
import {
  RichTextRenderer,
  richTextToPlainText,
} from "@ksu/ui/rich-text-renderer";
import { BreadcrumbTrail, PageShell } from "@/components/site-shell";
import { PublicImage } from "@/components/public/public-image";
import { EntityInquiryLauncher } from "@/components/public/entity-inquiry-launcher";
import {
  ExploreMorePanel,
  MobileSchoolLinksGrid,
  SchoolLinksPanel,
  buildSchoolQuickLinks,
} from "@/components/public/school-detail-navigation";
import { AboutPageLenis } from "@/components/ui/about-page-lenis";
import { publicFileUrl } from "@/lib/public-media";
import type { SchoolDetailOverviewData } from "@/lib/school-detail-data";

type StatementCard = {
  title: string;
  body: string;
  icon: LucideIcon;
};

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

  if (!parts.length) return "D";

  const selected = parts.length === 1 ? [parts[0]] : [parts[0], parts.at(-1)!];

  return selected
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function present(value?: string | number | null) {
  if (value === null || value === undefined) return null;
  const text = String(value).trim();
  return text.length ? text : null;
}

function schoolSummary(data: SchoolDetailOverviewData) {
  const { school } = data;
  return present(school.about) ?? present(school.description);
}

function formatDate(value?: string | null) {
  const text = present(value);
  if (!text) return null;

  const date = new Date(text);
  if (Number.isNaN(date.getTime())) return null;

  return new Intl.DateTimeFormat("en-KE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function DeanPortrait({
  name,
  image,
}: {
  name: string;
  image?: string | null;
}) {
  if (image) {
    return (
      <PublicImage
        src={image}
        alt={name}
        ratio="profile"
        sizes="220px"
        className="h-full w-full"
      />
    );
  }

  return (
    <div className="flex h-full w-full items-center justify-center bg-[linear-gradient(135deg,#dbeafe,#bfdbfe_54%,#fff7ed)] font-[family-name:var(--font-display)] text-5xl font-semibold text-primary">
      {initialsFromName(name)}
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

function ContactRow({
  icon: Icon,
  label,
  value,
  href,
}: {
  icon: LucideIcon;
  label: string;
  value: string | null;
  href?: string;
}) {
  if (!value) return null;

  const content = (
    <>
      <Icon aria-hidden className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
      <span className="min-w-0 flex-1">
        <span className="block text-xs font-bold text-foreground">{label}</span>
        <span className="mt-0.5 block break-words text-sm font-medium leading-5 text-primary [overflow-wrap:anywhere]">
          {value}
        </span>
      </span>
    </>
  );

  if (href) {
    return (
      <a
        href={href}
        className="flex w-full min-w-0 gap-3 rounded-xl p-2 transition-colors hover:bg-primary/5"
      >
        {content}
      </a>
    );
  }

  return (
    <div className="flex w-full min-w-0 gap-3 rounded-xl p-2">{content}</div>
  );
}

function ContactPanel({
  email,
  phone,
  office,
}: {
  email: string | null;
  phone: string | null;
  office: string | null;
}) {
  if (!email && !phone && !office) return null;

  return (
    <section className="min-w-0 overflow-hidden rounded-[1.5rem] border border-border bg-white p-4 shadow-sm">
      <SectionKicker>Contact Information</SectionKicker>
      <div className="mt-3 grid min-w-0 gap-1.5">
        <ContactRow icon={MapPin} label="Office" value={office} />
        <ContactRow
          icon={Phone}
          label="Phone"
          value={phone}
          href={phone ? `tel:${phone}` : undefined}
        />
        <ContactRow
          icon={Mail}
          label="Email"
          value={email}
          href={email ? `mailto:${email}` : undefined}
        />
      </div>
    </section>
  );
}

function SchoolHighlights({
  established,
  departments,
  programmes,
  staff,
}: {
  established: string | number | null;
  departments: number;
  programmes: number;
  staff: number;
}) {
  const numberFormatter = new Intl.NumberFormat("en-KE");
  const items = [
    {
      label: "Departments",
      value: numberFormatter.format(departments),
      icon: Building2,
    },
    {
      label: "Programmes",
      value: numberFormatter.format(programmes),
      icon: GraduationCap,
    },
    {
      label: "Staff",
      value: numberFormatter.format(staff),
      icon: Users,
    },
    established
      ? { label: "Established", value: established, icon: CalendarDays }
      : null,
  ];

  return (
    <section
      aria-label="School highlights"
      className="overflow-hidden rounded-[1.5rem] border border-border bg-white shadow-sm"
    >
      <dl className="grid grid-cols-2 sm:grid-cols-4">
        {items.map((item) => {
          if (!item) return null;
          const Icon = item.icon;

          return (
            <div
              key={item.label}
              className="border-b border-r border-border/60 p-4 even:border-r-0 sm:border-b-0 sm:even:border-r sm:last:border-r-0"
            >
              <Icon aria-hidden className="h-5 w-5 text-secondary" />
              <dd className="mt-3 text-xl font-bold leading-none text-foreground">
                {item.value}
              </dd>
              <dt className="mt-1.5 text-xs font-bold uppercase tracking-[0.08em] text-muted-foreground">
                {item.label}
              </dt>
            </div>
          );
        })}
      </dl>
    </section>
  );
}

function DeanMessageCard({
  deanName,
  deanTitle,
  deanMessage,
  deanImage,
  schoolName,
  deanEmail,
}: {
  deanName: string;
  deanTitle: string;
  deanMessage: string | null;
  deanImage?: string | null;
  schoolName: string;
  deanEmail: string | null;
}) {
  const messageText = richTextToPlainText(deanMessage);
  const messageWords = messageText.split(/\s+/).filter(Boolean);
  const hasMoreMessage = messageWords.length > 200;
  const messagePreview = hasMoreMessage
    ? `${messageWords.slice(0, 200).join(" ")}…`
    : messageText;

  return (
    <section className="overflow-hidden rounded-[1.5rem] bg-brand-overlay p-5 text-white shadow-[0_24px_70px_-48px_rgba(15,23,42,0.9)] sm:p-6">
      <div className="grid gap-5 sm:grid-cols-[7rem_minmax(0,1fr)] sm:items-center">
        <div className="w-24 overflow-hidden rounded-full bg-white/10 ring-1 ring-white/15 sm:w-auto">
          <div className="aspect-square">
            <DeanPortrait name={deanName} image={deanImage} />
          </div>
        </div>
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-[0.08em] text-secondary">
            Dean's Message
          </p>
          <Quote aria-hidden className="mt-3 h-7 w-7 text-secondary" />
          {deanMessage ? (
            hasMoreMessage ? (
              <details className="group mt-2">
                <p className="text-sm leading-7 text-white/85 sm:text-base group-open:hidden">
                  {messagePreview}
                </p>
                <RichTextRenderer
                  content={deanMessage}
                  className="hidden prose-sm text-sm leading-7 sm:text-base [&_a]:text-secondary [&_p]:text-white/85 [&_strong]:text-white group-open:block"
                />
                <summary className="mt-3 w-fit cursor-pointer list-none rounded-md text-sm font-bold text-secondary transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary">
                  <span className="group-open:hidden">View more</span>
                  <span className="hidden group-open:inline">View less</span>
                </summary>
              </details>
            ) : (
              <p className="mt-2 text-sm leading-7 text-white/85 sm:text-base">
                {messagePreview}
              </p>
            )
          ) : null}
          <div className="mt-4 text-sm leading-6">
            <p className="font-bold text-white">{deanName}</p>
            <p className="text-white/70">
              {deanTitle}, {schoolName}
            </p>
            {deanEmail ? (
              <p className="mt-1 text-xs font-semibold text-white/70">
                Email:{" "}
                <a href={`mailto:${deanEmail}`} className="text-secondary">
                  {deanEmail}
                </a>
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}

function AboutCard({
  overview,
  schoolName,
  coverImageUrl,
}: {
  overview: string;
  schoolName: string;
  coverImageUrl: string | null;
}) {
  return (
    <section className="rounded-[1.5rem] border border-border bg-white p-5 shadow-sm sm:p-6">
      <div className="grid grid-cols-[minmax(0,1fr)_5rem] items-start gap-4 sm:grid-cols-[minmax(0,1fr)_7rem] md:grid-cols-[minmax(0,1fr)_9rem] md:items-center md:gap-5">
        <div className="min-w-0">
          <SectionKicker>About the School</SectionKicker>
          <RichTextRenderer
            content={overview}
            className="mt-2 prose-sm text-sm leading-7 text-muted-foreground"
          />
        </div>
        <div className="h-20 overflow-hidden rounded-[1.25rem] bg-primary/[0.08] text-primary sm:h-24">
          {coverImageUrl ? (
            <PublicImage
              src={coverImageUrl}
              alt={`${schoolName} cover`}
              ratio="fill"
              sizes="(min-width: 768px) 144px, (min-width: 640px) 112px, 80px"
              className="h-full w-full"
              imageClassName="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <Landmark
                aria-hidden
                className="h-9 w-9 stroke-[1.25] sm:h-12 sm:w-12 md:h-14 md:w-14"
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function FeaturedSchoolLinks({
  title,
  items,
  icon: Icon,
  allHref,
  allLabel,
}: {
  title: string;
  items: Array<{ id: string; name: string; href: string; meta?: string | null }>;
  icon: LucideIcon;
  allHref?: string;
  allLabel?: string;
}) {
  if (!items.length) return null;

  return (
    <section className="rounded-[1.5rem] border border-border bg-white p-4 shadow-sm">
      <SectionKicker>{title}</SectionKicker>
      <div className="mt-3 divide-y divide-slate-100">
        {items.map((item) => (
          <Link key={item.id} href={item.href} className="group flex min-h-12 items-center gap-3 py-2.5 transition-colors">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/[0.07] text-primary">
              <Icon aria-hidden className="h-4 w-4" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-bold leading-5 text-foreground group-hover:text-primary">
                {item.name}
              </span>
              {item.meta ? <span className="mt-0.5 block text-xs text-muted-foreground">{item.meta}</span> : null}
            </span>
            <ArrowRight aria-hidden className="h-4 w-4 shrink-0 text-muted-foreground/60 transition-colors group-hover:text-primary" />
          </Link>
        ))}
      </div>
      {allHref && allLabel ? (
        <Link href={allHref} className="mt-3 inline-flex min-h-10 items-center gap-2 text-sm font-bold text-primary">
          {allLabel}
          <ArrowRight aria-hidden className="h-4 w-4" />
        </Link>
      ) : null}
    </section>
  );
}

function StatementCards({ statements }: { statements: StatementCard[] }) {
  return (
    <section
      id="school-statements"
      className="grid gap-3 md:grid-cols-2 xl:grid-cols-4"
      aria-label="School mission, vision, mandate and core values"
    >
      {statements.map((item) => {
        const Icon = item.icon;

        return (
          <article
            key={item.title}
            className="rounded-[1.5rem] border border-border bg-white p-4 shadow-sm"
          >
            <div className="flex gap-3 md:block">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-secondary/[0.12] text-secondary md:h-12 md:w-12">
                <Icon aria-hidden className="h-5 w-5" />
              </span>
              <div className="min-w-0 md:mt-4">
                <h3 className="text-xs font-bold uppercase tracking-[0.08em] text-primary">
                  {item.title}
                </h3>
                <RichTextRenderer
                  content={item.body}
                  className="mt-1.5 prose-sm text-sm leading-6 text-muted-foreground"
                />
              </div>
            </div>
          </article>
        );
      })}
    </section>
  );
}

export function SchoolDetailOverview({
  data,
  header,
  navItems,
}: {
  data: SchoolDetailOverviewData;
  header?: ReactNode;
  navItems?: EntityHeaderNavItem[];
}) {
  const { school, dean, counts } = data;
  const schoolName = school.name;
  const schoolCoverUrl = publicFileUrl(school.cover_image_id);
  const baseHref = `/academics/schools/${school.slug}`;
  const deanName =
    present(dean?.name) ?? present(school.dean_name) ?? "Dean profile";
  const deanTitle = present(dean?.title) ?? "Dean";
  const deanEmail = present(school.dean_email);
  const deanMessage = present(school.head_message) ?? present(dean?.message);
  const overview = schoolSummary(data);
  const email = present(school.email);
  const phone = present(school.phone);
  const office = present(school.office_location);
  const quickLinks = buildSchoolQuickLinks({ baseHref, navItems, counts });
  const established =
    formatDate(school.establishment_date) ?? school.founded_year ?? null;

  const contactPanel = (
    <ContactPanel
      email={email}
      phone={phone}
      office={office}
    />
  );
  const mission = present(school.mission);
  const vision = present(school.vision);
  const mandate = present(school.mandate);
  const coreValues = present(school.core_values);
  const statements: StatementCard[] = [
    mission ? { title: "Mission", body: mission, icon: Target } : null,
    vision ? { title: "Vision", body: vision, icon: Eye } : null,
    mandate ? { title: "Mandate", body: mandate, icon: ShieldCheck } : null,
    coreValues
      ? { title: "Core values", body: coreValues, icon: Users }
      : null,
  ].filter(Boolean) as StatementCard[];
  const showDeanCard = Boolean(
    dean || present(school.dean_name) || deanMessage,
  );
  const featuredProgrammes = data.programmes
    .slice()
    .sort(
      (first, second) =>
        Number(first.display_order ?? 0) - Number(second.display_order ?? 0) ||
        first.name.localeCompare(second.name),
    )
    .slice(0, 3)
    .map((programme) => ({
      id: programme.id,
      name: programme.name,
      href: `/academics/programmes/${programme.slug}`,
      meta: [programme.level, programme.duration].filter(Boolean).join(" · "),
    }));
  const featuredDepartments = data.departments.slice(0, 3).map((department) => ({
    id: department.id,
    name: department.name,
    href: `${baseHref}/departments/${department.slug}`,
    meta: present(department.code),
  }));
  const featuredPanels = (
    <>
      <FeaturedSchoolLinks
        title="Featured Programmes"
        items={featuredProgrammes}
        icon={GraduationCap}
        allHref={`${baseHref}/programmes`}
        allLabel="View all programmes"
      />
      <FeaturedSchoolLinks
        title="Departments"
        items={featuredDepartments}
        icon={Building2}
        allHref={`${baseHref}/departments`}
        allLabel="View all departments"
      />
    </>
  );

  return (
    <PageShell header={header}>
      <AboutPageLenis>
        <AmbientPageBackground variant="academic" intensity="soft">
          <section className="w-full px-4 py-5 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
            <div className="mb-4">
              <BreadcrumbTrail
                items={[
                  { label: "Home", href: "/" },
                  { label: "Academics", href: "/academics" },
                  { label: "Schools", href: "/academics/schools" },
                  { label: schoolName },
                ]}
              />
              <h1 className="sr-only">{schoolName}</h1>
            </div>
            <div className="grid w-full gap-4 xl:grid-cols-[minmax(220px,0.2fr)_minmax(0,1fr)_minmax(260px,0.22fr)] 2xl:grid-cols-[minmax(240px,0.18fr)_minmax(0,1fr)_minmax(300px,0.22fr)] xl:items-start">
              <aside className="hidden min-w-0 space-y-4 xl:sticky xl:top-28 xl:block">
                <SchoolLinksPanel links={quickLinks} />
                <ExploreMorePanel />
              </aside>

              <ScrollReveal as="main" className="grid min-w-0 gap-4">
              {showDeanCard ? (
                <DeanMessageCard
                  deanName={deanName}
                  deanTitle={deanTitle}
                  deanMessage={deanMessage}
                  deanImage={dean?.image}
                  schoolName={schoolName}
                  deanEmail={deanEmail}
                />
              ) : null}
              <MobileSchoolLinksGrid links={quickLinks} />
              <SchoolHighlights
                established={established}
                departments={counts.departments}
                programmes={counts.programmes}
                staff={counts.staff}
              />
              {overview ? (
                <AboutCard
                  overview={overview}
                  schoolName={schoolName}
                  coverImageUrl={schoolCoverUrl}
                />
              ) : null}
              <div className="grid gap-4 md:grid-cols-2 xl:hidden">
                {featuredPanels}
              </div>
              {statements.length ? (
                <StatementCards statements={statements} />
              ) : null}
              </ScrollReveal>

              <aside className="hidden min-w-0 space-y-4 xl:sticky xl:top-28 xl:block">
                {contactPanel}
                {featuredPanels}
              </aside>

              <aside className="xl:hidden">{contactPanel}</aside>
            </div>
          </section>
        </AmbientPageBackground>
      </AboutPageLenis>
      <EntityInquiryLauncher
        target={{ type: "school", slug: school.slug, name: schoolName }}
      />
    </PageShell>
  );
}
