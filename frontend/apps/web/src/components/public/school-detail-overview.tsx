import type { ReactNode } from "react";
import Link from "next/link";
import type { EntityHeaderNavItem } from "@ksu/ui/layout/public";
import {
  Building2,
  ArrowRight,
  CalendarDays,
  Eye,
  FileText,
  Globe,
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
import { ScrollReveal } from "@ksu/ui/components";
import { RichTextRenderer } from "@ksu/ui/rich-text-renderer";
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

function formatCount(count: number, singular: string, plural = `${singular}s`) {
  return count > 0 ? `${count} ${count === 1 ? singular : plural}` : null;
}

function linkHref(value: string | null) {
  if (!value) return undefined;
  return /^https?:\/\//i.test(value) ? value : `https://${value}`;
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

function SchoolCoverBanner({
  schoolName,
  imageUrl,
}: {
  schoolName: string;
  imageUrl: string | null;
}) {
  if (!imageUrl) return null;

  return (
    <section
      aria-label={`${schoolName} academic panorama`}
      className="overflow-hidden rounded-[1.5rem] border border-border bg-white shadow-sm"
    >
      <PublicImage
        src={imageUrl}
        alt={`${schoolName} academic panorama`}
        ratio="fill"
        priority
        sizes="(min-width: 1536px) 56vw, (min-width: 1280px) 60vw, 100vw"
        className="aspect-[16/7] min-h-[220px] sm:min-h-[280px]"
        imageClassName="object-cover"
      />
    </section>
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
        className="flex w-full min-w-0 gap-3 rounded-xl p-2 transition hover:bg-primary/5"
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
  website,
}: {
  email: string | null;
  phone: string | null;
  office: string | null;
  website: string | null;
}) {
  if (!email && !phone && !office && !website) return null;

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
        <ContactRow
          icon={Globe}
          label="Website"
          value={website}
          href={linkHref(website)}
        />
      </div>
    </section>
  );
}

function SchoolInfoPanel({
  code,
  established,
  departments,
  programmes,
  staff,
  lastUpdated,
}: {
  code: string | null;
  established: string | number | null;
  departments: string | null;
  programmes: string | null;
  staff: string | null;
  lastUpdated: string | null;
}) {
  const items = [
    { label: "School Code", value: code, icon: FileText },
    { label: "Established", value: established, icon: CalendarDays },
    { label: "Departments", value: departments, icon: Building2 },
    { label: "Programmes", value: programmes, icon: GraduationCap },
    { label: "Staff", value: staff, icon: Users },
    { label: "Last Updated", value: lastUpdated, icon: CalendarDays },
  ].filter((item) => present(item.value));

  if (!items.length) return null;

  return (
    <section className="rounded-[1.5rem] border border-border bg-white p-4 shadow-sm">
      <SectionKicker>School Information</SectionKicker>
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
            <details className="group mt-2">
              <p className="text-sm leading-7 text-white/85 sm:text-base group-open:hidden">
                A welcome from {deanName} on teaching, research, and the
                school&apos;s priorities.
              </p>
              <RichTextRenderer
                content={deanMessage}
                className="hidden prose-sm text-sm leading-7 sm:text-base [&_a]:text-secondary [&_p]:text-white/85 [&_strong]:text-white group-open:block"
              />
              <summary className="mt-3 cursor-pointer list-none text-sm font-bold text-secondary hover:text-white">
                <span className="group-open:hidden">Read full message</span>
                <span className="hidden group-open:inline">Show less</span>
              </summary>
            </details>
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

function AboutCard({ overview }: { overview: string }) {
  return (
    <section className="rounded-[1.5rem] border border-border bg-white p-5 shadow-sm sm:p-6">
      <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_9rem] md:items-center">
        <div>
          <SectionKicker>About the School</SectionKicker>
          <h2 className="mt-2 font-[family-name:var(--font-display)] text-2xl font-semibold leading-tight text-foreground">
            About this school
          </h2>
          <RichTextRenderer
            content={overview}
            className="mt-3 prose-sm text-sm leading-7 text-muted-foreground"
          />
        </div>
        <div className="hidden h-24 items-center justify-center rounded-[1.25rem] bg-primary/[0.08] text-primary md:flex">
          <Landmark aria-hidden className="h-14 w-14 stroke-[1.25]" />
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
          <Link key={item.id} href={item.href} className="group flex min-h-12 items-center gap-3 py-2.5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/[0.07] text-primary">
              <Icon aria-hidden className="h-4 w-4" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-bold leading-5 text-foreground group-hover:text-primary">
                {item.name}
              </span>
              {item.meta ? <span className="mt-0.5 block text-xs text-muted-foreground">{item.meta}</span> : null}
            </span>
            <ArrowRight aria-hidden className="h-4 w-4 shrink-0 text-muted-foreground/60 group-hover:text-primary" />
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
  const website = present(school.website);
  const quickLinks = buildSchoolQuickLinks({ baseHref, navItems, counts });
  const established =
    formatDate(school.establishment_date) ?? school.founded_year ?? null;

  const contactPanel = (
    <ContactPanel
      email={email}
      phone={phone}
      office={office}
      website={website}
    />
  );
  const schoolInfoPanel = (
    <SchoolInfoPanel
      code={present(school.code)}
      established={established}
      departments={formatCount(counts.departments, "department")}
      programmes={formatCount(counts.programmes, "programme")}
      staff={formatCount(counts.staff, "record")}
      lastUpdated={formatDate(school.updated_at)}
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
    .slice(0, 4)
    .map((programme) => ({
      id: programme.id,
      name: programme.name,
      href: `/academics/programmes/${programme.slug}`,
      meta: [programme.level, programme.duration].filter(Boolean).join(" · "),
    }));
  const featuredDepartments = data.departments.slice(0, 4).map((department) => ({
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
      />
    </>
  );

  return (
    <PageShell header={header}>
      <AboutPageLenis>
        <section className="w-full bg-[linear-gradient(180deg,hsl(var(--surface-subtle))_0%,#ffffff_68%,hsl(var(--surface-muted))_100%)] px-4 py-5 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
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
              <SchoolCoverBanner
                schoolName={schoolName}
                imageUrl={schoolCoverUrl}
              />
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
              {overview ? (
                <AboutCard overview={overview} />
              ) : null}
              <div className="grid gap-4 md:grid-cols-2 xl:hidden">
                {featuredPanels}
              </div>
              {statements.length ? (
                <StatementCards statements={statements} />
              ) : null}
            </ScrollReveal>

            <aside className="hidden min-w-0 space-y-4 xl:sticky xl:top-28 xl:block">
              {featuredPanels}
              {contactPanel}
              {schoolInfoPanel}
            </aside>

            <aside className="grid gap-4 xl:hidden">
              {contactPanel}
              {schoolInfoPanel}
            </aside>
          </div>
        </section>
      </AboutPageLenis>
      <EntityInquiryLauncher
        target={{ type: "school", slug: school.slug, name: schoolName }}
      />
    </PageShell>
  );
}
