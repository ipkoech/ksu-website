import Link from "next/link";
import type { ReactNode } from "react";
import {
  ArrowRight,
  BookOpen,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  Check,
  ClipboardCheck,
  ExternalLink,
  GraduationCap,
  Handshake,
  Landmark,
  Library,
  Mail,
  Megaphone,
  Microscope,
  Network,
  Newspaper,
  Search,
  ShieldCheck,
  Target,
  UserRound,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "@ksu/ui/components";
import {
  MiniHeader,
  PublicFooter,
  PublicHeader,
} from "@ksu/ui/layout/public";
import { LandingHero } from "@/components/home/landing-hero";
import { AnnouncementHeader } from "@/components/site-shell";
import {
  getHomepageData,
  type HomeCard,
  type HomeLink,
  type HomeMetric,
  type HomePartner,
} from "@/lib/homepage-data";
import { getNavData } from "@/lib/nav-data";

export const dynamic = "force-dynamic";

const researchHref = "https://research.kisiiuniversity.ac.ke";

const factIcons = [GraduationCap, Users, BookOpen, CalendarDays] satisfies LucideIcon[];
const pathIcons = [UserRound, Network, Handshake] satisfies LucideIcon[];
const schoolIcons = [
  BriefcaseBusiness,
  GraduationCap,
  Network,
  Users,
  ShieldCheck,
  Landmark,
  Target,
  Microscope,
] satisfies LucideIcon[];

const serviceChannels = [
  {
    title: "Academic Operations",
    description: "Schools, departments, programmes, and academic governance.",
    href: "/academics",
    icon: Building2,
  },
  {
    title: "Institutional Governance",
    description: "Council, management, quality assurance, and service charter.",
    href: "/about/governance",
    icon: ClipboardCheck,
  },
  {
    title: "Research Enterprise",
    description: "Projects, publications, innovation, grants, and partnerships.",
    href: researchHref,
    icon: Target,
  },
] satisfies Array<{
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
}>;

const pillars = [
  {
    title: "Teaching",
    body: "Structured academic delivery across schools, departments, and professional programmes.",
    href: "/academics",
    cta: "Explore academics",
    icon: BookOpen,
  },
  {
    title: "Research",
    body: "Research, innovation, grants, and knowledge partnerships aligned to public priorities.",
    href: researchHref,
    cta: "Explore research",
    icon: Search,
  },
  {
    title: "Service",
    body: "Public service, outreach, campus support, and stakeholder engagement beyond the classroom.",
    href: "/campus-life",
    cta: "Explore service",
    icon: Users,
  },
] satisfies Array<{
  title: string;
  body: string;
  href: string;
  cta: string;
  icon: LucideIcon;
}>;

const assuranceLinks = [
  { title: "Governance", href: "/about/governance" },
  { title: "Quality assurance", href: "/about/quality-assurance" },
  { title: "Service charter", href: "/about/service-charter" },
  { title: "Public information", href: "/about" },
];

const quickLinkIcons: Record<string, LucideIcon> = {
  "Student Portal": UserRound,
  "Staff Portal": BriefcaseBusiness,
  "E-Learning": Network,
  Alumni: Users,
  "A-Z Index": Search,
  Programmes: BookOpen,
  Library,
  Research: Microscope,
  Governance: Landmark,
  "Quality Assurance": ShieldCheck,
  "News & Events": Newspaper,
};

function isExternalHref(href: string) {
  return /^https?:\/\//i.test(href);
}

function linkProps(link: { href: string; external?: boolean }) {
  const external = link.external ?? isExternalHref(link.href);
  return {
    target: external ? "_blank" : undefined,
    rel: external ? "noopener noreferrer" : undefined,
  };
}

function LandingReveal({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  variant?: string;
}) {
  return <div className={className}>{children}</div>;
}

export default async function HomePage() {
  const [homepage, megaMenuData] = await Promise.all([
    getHomepageData(),
    getNavData(),
  ]);

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f8fbff_0%,#ffffff_38%,#f6f8fc_100%)] text-slate-950">
      <AnnouncementHeader announcements={homepage.announcements} />
      <MiniHeader
        contactInfo={homepage.contactInfo}
        quickLinks={homepage.miniQuickLinks}
        socialLinks={homepage.socialLinks}
      />
      <PublicHeader megaMenuData={megaMenuData} />

      <main>
        <LandingHero {...homepage.hero} />

        <section className="relative z-10 pb-14 lg:-mt-8 lg:pb-12">
          <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
            <TrustFactRow facts={homepage.facts} />
            <PathPanel items={homepage.priorityActions} />
            <EnterpriseServiceSection />
            <SchoolsAndAdmissions
              schools={homepage.schools.slice(0, 8)}
              admissionsSteps={homepage.admissionsActions}
            />
            <PillarSection />
            <NewsSection
              newsItems={homepage.latestNews}
              contactEmail={homepage.contactInfo.email}
              quickLinks={homepage.serviceLinks}
              programmeStats={homepage.programmesSummary}
            />
            <PartnersSection partners={homepage.partners} />
          </div>
        </section>
      </main>

      <PublicFooter
        contactInfo={homepage.contactInfo}
        socialLinks={homepage.socialLinks}
      />
    </div>
  );
}

function TrustFactRow({ facts }: { facts: HomeMetric[] }) {
  return (
    <LandingReveal variant="fade-up">
      <div className="grid grid-cols-2 gap-3 rounded-lg border border-blue-100 bg-white p-2 shadow-lg shadow-blue-100/70 lg:grid-cols-4 lg:gap-0 lg:p-0 lg:divide-x lg:divide-blue-100">
        {facts.map((fact, index) => {
          const Icon = factIcons[index % factIcons.length];

          return (
            <div
              key={`${fact.label}-${fact.value}`}
              className="flex items-start gap-3 p-2.5 sm:gap-4 sm:p-4 lg:gap-3 lg:p-3"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary sm:h-12 sm:w-12 lg:h-10 lg:w-10">
                <Icon className="h-5 w-5 sm:h-6 sm:w-6 lg:h-5 lg:w-5" />
              </span>
              <span>
                <span className="block text-[13px] font-bold text-slate-950 sm:text-sm lg:text-xs">
                  {fact.value}
                </span>
                <span className="mt-1 block text-xs leading-5 text-slate-600 lg:leading-4">
                  {fact.detail ?? fact.label}
                </span>
              </span>
            </div>
          );
        })}
      </div>
    </LandingReveal>
  );
}

function PathPanel({ items }: { items: HomeCard[] }) {
  return (
    <LandingReveal variant="fade-up" delay={100}>
      <section className="mt-4 rounded-lg border border-blue-100 bg-blue-50/80 p-4 sm:p-6 lg:mt-3 lg:p-4">
        <div className="grid gap-4 lg:grid-cols-[260px_1fr] lg:items-center">
          <div className="text-center lg:text-left">
            <p className="font-[family-name:var(--font-display)] text-2xl font-bold leading-tight text-slate-950 sm:text-3xl lg:text-2xl">
              Choose your gateway
            </p>
            <p className="mt-1 text-xs leading-5 text-slate-600 sm:mt-2 sm:text-sm sm:leading-6 lg:mt-1 lg:text-xs lg:leading-4">
              Direct routes for the university's main stakeholder groups.
            </p>
          </div>

          <div className="grid gap-3 lg:grid-cols-3">
            {items.map((step, index) => {
              const Icon = pathIcons[index % pathIcons.length];

              return (
                <Link
                  key={step.title}
                  href={step.href}
                  {...linkProps(step)}
                  className="group grid grid-cols-[34px_1fr_20px] items-center gap-3 rounded-md bg-white/70 p-2.5 transition hover:bg-white hover:shadow-sm lg:bg-transparent lg:p-0 lg:hover:bg-transparent lg:hover:shadow-none"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-xs font-bold text-primary shadow-sm">
                    {index + 1}
                  </span>
                  <span className="min-w-0">
                    <span className="flex items-center gap-2 text-[13px] font-bold text-slate-950 sm:text-sm lg:text-xs">
                      <Icon className="hidden h-5 w-5 text-primary sm:block lg:h-4 lg:w-4" />
                      {step.title}
                    </span>
                    <span className="mt-1 block text-xs leading-4 text-slate-600">
                      {step.body}
                    </span>
                  </span>
                  {step.external ? (
                    <ExternalLink className="h-5 w-5 text-slate-400 transition group-hover:text-primary lg:h-4 lg:w-4" />
                  ) : (
                    <ArrowRight className="h-5 w-5 text-slate-400 transition group-hover:translate-x-1 group-hover:text-primary lg:h-4 lg:w-4" />
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    </LandingReveal>
  );
}

function EnterpriseServiceSection() {
  return (
    <section className="mt-5 grid gap-3 lg:mt-4 lg:grid-cols-3">
      {serviceChannels.map((channel, index) => (
        <LandingReveal key={channel.title} delay={index * 60}>
          <Link
            href={channel.href}
            {...linkProps(channel)}
            className="group flex h-full gap-4 rounded-md border border-blue-100 bg-white p-4 shadow-sm shadow-blue-100/50 transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md hover:shadow-blue-100 lg:p-3"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-primary text-white lg:h-10 lg:w-10">
              <channel.icon className="h-5 w-5" />
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-bold text-slate-950 lg:text-xs">
                {channel.title}
              </span>
              <span className="mt-1.5 block text-xs leading-5 text-slate-600 lg:leading-4">
                {channel.description}
              </span>
              <span className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-primary">
                Open section
                <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-1" />
              </span>
            </span>
          </Link>
        </LandingReveal>
      ))}
    </section>
  );
}

function SchoolsAndAdmissions({
  schools,
  admissionsSteps,
}: {
  schools: HomeCard[];
  admissionsSteps: HomeCard[];
}) {
  return (
    <section className="-mx-4 mt-10 border-y border-blue-100 bg-[linear-gradient(135deg,#f8fbff_0%,#eff6ff_100%)] px-4 py-8 sm:-mx-6 sm:px-6 lg:-mx-8 lg:mt-7 lg:px-8 lg:py-10 xl:-mx-10 xl:px-10 2xl:-mx-12 2xl:px-12">
      <LandingReveal>
        <div className="mb-7 grid gap-5 lg:grid-cols-[minmax(0,0.72fr)_auto] lg:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary">
              Academic structure
            </p>
            <h2 className="mt-2 font-[family-name:var(--font-display)] text-3xl font-bold leading-tight text-slate-950 sm:text-4xl lg:text-3xl">
              Explore schools and programme pathways
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
              Discover schools, departments, and programmes from the current
              academic records.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              asChild
              variant="outline"
              className="h-10 rounded-md border-blue-200 bg-white px-4 text-sm font-semibold text-primary hover:bg-blue-50"
            >
              <Link href="/academics/programmes">
                Browse all programmes
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Link
              href="/academics/schools"
              className="inline-flex h-10 items-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-white transition hover:bg-primary/90"
            >
              View all schools
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </LandingReveal>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_300px] 2xl:grid-cols-[minmax(0,1fr)_320px]">
        <LandingReveal>
          {schools.length ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {schools.map((school, index) => (
                <SchoolDirectoryCard
                  key={school.href}
                  school={school}
                  index={index}
                />
              ))}
            </div>
          ) : (
            <HomeEmptyState
              title="Schools are not available"
              body="Academic school records could not be loaded right now."
            />
          )}
        </LandingReveal>

        <AdmissionsGuideCard admissionsSteps={admissionsSteps} />
      </div>
    </section>
  );
}

function SchoolDirectoryCard({
  school,
  index,
}: {
  school: HomeCard;
  index: number;
}) {
  const Icon = schoolIcons[index % schoolIcons.length];

  return (
    <Link
      href={school.href}
      className="group block h-full overflow-hidden rounded-md border border-blue-100 bg-white shadow-sm shadow-blue-100/60 transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md hover:shadow-blue-200"
    >
      <div className="relative h-32 overflow-hidden bg-blue-100">
        {school.imageUrl ? (
          <img
            src={school.imageUrl}
            alt=""
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-[linear-gradient(135deg,#dbeafe,#fff7ed)] text-primary">
            <GraduationCap className="h-10 w-10" />
          </div>
        )}
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,23,42,0.04)_0%,rgba(37,99,235,0.1)_100%)]" />
        <span className="absolute left-3 top-3 rounded-md bg-primary px-2.5 py-1.5 text-xs font-bold uppercase tracking-[0.08em] text-white shadow-sm shadow-blue-950/20">
          {school.eyebrow || String(index + 1).padStart(2, "0")}
        </span>
      </div>

      <div className="relative flex min-h-[214px] flex-col px-4 pb-4 pt-8">
        <span className="absolute -top-5 left-4 flex h-11 w-11 items-center justify-center rounded-full border-4 border-white bg-blue-50 text-primary shadow-sm">
          <Icon className="h-5 w-5" />
        </span>

        <h3 className="text-lg font-bold leading-tight text-slate-950 transition group-hover:text-primary lg:text-base">
          {school.title}
        </h3>

        <p className="mt-3 flex-1 text-sm leading-6 text-slate-600 lg:text-[13px] lg:leading-5">
          {school.body}
        </p>

        <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary">
          {school.action ?? "View school"}
          <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
        </span>
      </div>
    </Link>
  );
}

function AdmissionsGuideCard({ admissionsSteps }: { admissionsSteps: HomeCard[] }) {
  return (
    <LandingReveal variant="fade-up" delay={120}>
      <aside className="flex h-full flex-col justify-between rounded-md bg-primary p-5 text-white shadow-lg shadow-blue-200/80">
        <div>
          <div className="flex items-start gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-white/15 text-white ring-1 ring-white/20">
              <ClipboardCheck className="h-6 w-6" />
            </span>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-100">
                Admissions
              </p>
              <h2 className="mt-1 font-[family-name:var(--font-display)] text-2xl font-bold leading-tight">
                Admissions Pathway
              </h2>
              <p className="mt-2 text-sm leading-6 text-white/75">
                A clear, step-by-step guide to joining Kisii University.
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-2">
            {admissionsSteps.map((step, index) => (
              <Link
                key={step.title}
                href={step.href}
                className="group grid grid-cols-[32px_1fr_18px] gap-3 rounded-md border border-white/15 bg-white/10 p-3 transition hover:bg-white/15"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-xs font-bold text-primary">
                  {index + 1}
                </span>
                <span>
                  <span className="block text-sm font-bold text-white">
                    {step.title}
                  </span>
                  <span className="mt-1 block text-xs leading-5 text-white/70">
                    {step.body}
                  </span>
                </span>
                <ArrowRight className="mt-1 h-4 w-4 text-white/50 transition group-hover:translate-x-1 group-hover:text-white" />
              </Link>
            ))}
          </div>

          <div className="mt-5 border-t border-white/10 pt-4">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/60">
              Institutional Assurance
            </p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {assuranceLinks.map((link) => (
                <Link
                  key={link.title}
                  href={link.href}
                  className="inline-flex min-h-8 items-center gap-2 text-xs font-semibold text-white/80 transition hover:text-white"
                >
                  <Check className="h-3.5 w-3.5 shrink-0 text-blue-100" />
                  <span>{link.title}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>

        <Button
          asChild
          size="lg"
          variant="outline"
          className="mt-7 rounded-md border-white bg-white text-primary hover:bg-blue-50 lg:h-10 lg:text-sm"
        >
          <Link href="/admissions/how-to-apply">
            View Admissions Guide
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </aside>
    </LandingReveal>
  );
}

function PillarSection() {
  return (
    <section className="-mx-4 mt-9 bg-white px-4 py-8 sm:-mx-6 sm:px-6 lg:-mx-8 lg:mt-8 lg:px-8 xl:-mx-10 xl:px-10 2xl:-mx-12 2xl:px-12">
      <div className="rounded-lg border border-blue-100 bg-white p-5 shadow-sm shadow-blue-100/60 sm:p-6 lg:grid lg:grid-cols-[330px_1fr] lg:gap-8 xl:grid-cols-[360px_1fr] xl:p-8">
        <LandingReveal>
          <div>
            <div className="flex items-center gap-3">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary">
                University mandate
              </p>
              <span className="h-px w-10 bg-primary" />
            </div>
            <h2 className="mt-5 max-w-sm font-[family-name:var(--font-display)] text-3xl font-bold leading-tight text-slate-950 lg:text-[30px]">
              Teaching, research, and service in one public mission
            </h2>
            <p className="mt-5 max-w-sm text-sm leading-7 text-slate-600">
              Kisii University connects academic delivery, research enterprise,
              governance, and public service through one institutional mandate.
            </p>
            <Link
              href="/about/strategic-plan"
              className="mt-5 inline-flex min-h-8 items-center gap-2 text-sm font-semibold text-primary hover:text-secondary"
            >
              View strategic direction
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </LandingReveal>

        <div className="relative mt-7 lg:mt-0">
          <div className="pointer-events-none absolute left-[16.5%] right-[16.5%] top-6 hidden border-t border-dashed border-primary/45 lg:block" />
          <div className="grid gap-4 md:grid-cols-3">
            {pillars.map((pillar, index) => (
              <LandingReveal key={pillar.title} delay={index * 80}>
                <Link
                  href={pillar.href}
                  {...linkProps(pillar)}
                  className="group relative flex h-full min-h-[224px] flex-col justify-between overflow-hidden rounded-md border border-blue-100 bg-white p-5 shadow-sm shadow-blue-100/60 transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md hover:shadow-blue-100"
                >
                  <span
                    className={
                      pillar.title === "Research"
                        ? "mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-secondary text-white shadow-lg shadow-orange-100"
                        : "mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-lg shadow-blue-100"
                    }
                  >
                    <pillar.icon className="h-7 w-7" />
                  </span>

                  <span className="min-w-0">
                    <span
                      className={
                        pillar.title === "Research"
                          ? "block h-1 w-4 rounded-full bg-secondary"
                          : "block h-1 w-4 rounded-full bg-primary"
                      }
                    />
                    <span className="mt-5 block text-sm font-bold uppercase tracking-[0.14em] text-primary">
                      {pillar.title}
                    </span>
                    <span className="mt-3 block text-sm leading-6 text-slate-600">
                      {pillar.body}
                    </span>
                  </span>

                  <span className="relative z-10 mt-6 inline-flex items-center gap-2 text-sm font-semibold text-primary">
                    {pillar.cta}
                    <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                  </span>

                  <span
                    className={
                      pillar.title === "Research"
                        ? "pointer-events-none absolute bottom-4 right-4 text-orange-100/80"
                        : "pointer-events-none absolute bottom-4 right-4 text-blue-100/80"
                    }
                  >
                    <pillar.icon className="h-16 w-16" />
                  </span>
                </Link>
              </LandingReveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function NewsSection({
  newsItems,
  contactEmail,
  quickLinks,
  programmeStats,
}: {
  newsItems: HomeCard[];
  contactEmail: string;
  quickLinks: HomeLink[];
  programmeStats: HomeMetric[];
}) {
  return (
    <section className="-mx-4 mt-0 border-y border-blue-100 bg-blue-50/65 px-4 py-8 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 xl:-mx-10 xl:px-10 2xl:-mx-12 2xl:px-12">
      <div className="rounded-lg border border-blue-100 bg-[linear-gradient(135deg,#f8fbff_0%,#eff6ff_100%)] p-5 shadow-sm shadow-blue-100/60 sm:p-6 xl:p-8">
        <LandingReveal>
          <div className="mb-6">
            <div className="mb-3 flex items-center gap-3">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary">
                Current information
              </p>
              <span className="h-px w-10 bg-primary" />
            </div>

            <div className="grid gap-4 xl:grid-cols-[max-content_minmax(18rem,1fr)_auto] xl:items-center">
              <div>
                <h2 className="font-[family-name:var(--font-display)] text-3xl font-bold leading-tight text-slate-950 lg:text-2xl">
                  Latest news and notices
                </h2>
              </div>

              <p className="max-w-3xl text-sm leading-6 text-slate-600">
                Public updates, institutional notices, and current stories from
                Kisii University.
              </p>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center xl:shrink-0 xl:justify-end">
                <a
                  href={`mailto:${contactEmail}`}
                  className="inline-flex min-h-8 items-center gap-2 text-sm font-semibold text-primary hover:text-secondary"
                >
                  <Mail className="h-4 w-4" />
                  {contactEmail}
                </a>
                <a
                  href={`mailto:${contactEmail}`}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-primary bg-white px-4 text-sm font-semibold text-primary transition hover:bg-blue-50"
                >
                  Contact the university
                  <ArrowRight className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>
        </LandingReveal>

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_18rem] xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_360px]">
          <LandingReveal delay={80}>
            <article className="h-full rounded-md border border-blue-100 bg-white p-5 shadow-sm shadow-blue-100/60">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h3 className="font-[family-name:var(--font-display)] text-2xl font-bold text-slate-950">
                  News & Events
                </h3>
                <Link
                  href="/news"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-secondary"
                >
                  View all news
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              {newsItems.length ? (
                <div className="divide-y divide-blue-50">
                  {newsItems.map((item) => (
                    <Link
                      key={`${item.eyebrow}-${item.title}`}
                      href={item.href}
                      className="group grid grid-cols-[58px_1fr_18px] items-center gap-3 py-4 first:pt-1 last:pb-1"
                    >
                      <span className="rounded-md bg-blue-50 px-2 py-2 text-center text-[11px] font-bold uppercase text-primary">
                        {(item.eyebrow ?? "News").slice(0, 3)}
                      </span>
                      <span className="min-w-0 text-sm font-semibold leading-5 text-slate-950 transition group-hover:text-primary">
                        {item.title}
                      </span>
                      <ArrowRight className="h-4 w-4 text-slate-300 transition group-hover:translate-x-1 group-hover:text-primary" />
                    </Link>
                  ))}
                </div>
              ) : (
                <HomeEmptyState
                  title="No public updates available"
                  body="News records could not be loaded right now."
                />
              )}
            </article>
          </LandingReveal>

          <LandingReveal>
            <article className="h-full overflow-hidden rounded-md border border-blue-100 bg-white shadow-sm shadow-blue-100/60">
              <img
                src="/logos/ksu-bck1.jpg"
                alt=""
                className="h-48 w-full object-cover object-[50%_42%] sm:h-56 lg:h-44 xl:h-48"
              />
              <div className="relative p-5">
                <span className="absolute -top-7 left-5 flex h-12 w-12 items-center justify-center rounded-md bg-primary text-white shadow-lg shadow-blue-100">
                  <Microscope className="h-6 w-6" />
                </span>
                <p className="mt-4 text-xs font-bold uppercase tracking-[0.18em] text-primary">
                  Research enterprise
                </p>
                <h3 className="mt-2 max-w-md text-xl font-bold leading-snug text-slate-950">
                  Applied knowledge for public and regional priorities
                </h3>
                <p className="mt-3 max-w-md text-sm leading-6 text-slate-600">
                  Reach research projects, publications, innovation activity,
                  grants, and collaboration channels from a single route.
                </p>
                <Link
                  href={researchHref}
                  {...linkProps({ href: researchHref })}
                  className="mt-5 inline-flex min-h-8 items-center gap-2 text-sm font-semibold text-primary hover:text-secondary"
                >
                  Explore research
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </article>
          </LandingReveal>

          <ServiceShortcutsCard quickLinks={quickLinks} />
        </div>

        <AcademicStatsStrip stats={programmeStats} />
      </div>
    </section>
  );
}

function ServiceShortcutsCard({
  quickLinks,
}: {
  quickLinks: HomeLink[];
}) {
  return (
    <LandingReveal delay={160}>
      <aside className="h-full rounded-md border border-blue-100 bg-white p-5 shadow-sm shadow-blue-100/60">
        <h3 className="font-[family-name:var(--font-display)] text-2xl font-bold text-slate-950">
          Service Shortcuts
        </h3>
        <div className="mt-4 grid gap-1.5">
          {quickLinks.map((link) => {
            const Icon = quickLinkIcons[link.label] ?? ArrowRight;
            const external = link.external ?? isExternalHref(link.href);

            return (
              <Link
                key={`${link.label}-${link.href}`}
                href={link.href}
                {...linkProps(link)}
                className="group flex min-h-10 items-center gap-3 rounded-md px-2 text-sm font-semibold text-slate-700 transition hover:bg-blue-50 hover:text-primary"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-blue-50 text-primary">
                  <Icon className="h-4 w-4" />
                </span>
                <span className="min-w-0 flex-1">{link.label}</span>
                {external ? (
                  <ExternalLink className="h-3.5 w-3.5 text-slate-300 transition group-hover:text-primary" />
                ) : (
                  <ArrowRight className="h-3.5 w-3.5 text-slate-300 transition group-hover:translate-x-1 group-hover:text-primary" />
                )}
              </Link>
            );
          })}
        </div>
      </aside>
    </LandingReveal>
  );
}

function AcademicStatsStrip({ stats }: { stats: HomeMetric[] }) {
  return (
    <LandingReveal variant="fade-up" delay={180}>
      <div className="mt-6 grid gap-3 rounded-md border border-blue-100 bg-white/85 p-3 shadow-sm shadow-blue-100/60 sm:grid-cols-3 lg:gap-0 lg:divide-x lg:divide-blue-100 lg:p-0">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="flex items-start gap-3 rounded-md bg-white/80 p-3 lg:rounded-none lg:bg-transparent lg:p-4"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-50 text-primary">
              <BookOpen className="h-5 w-5" />
            </span>
            <span>
              <span className="block text-sm font-bold text-primary">
                {stat.value} {stat.label}
              </span>
              <span className="mt-1 block text-xs leading-5 text-slate-600">
                {stat.detail}
              </span>
            </span>
          </div>
        ))}
      </div>
    </LandingReveal>
  );
}

function PartnersSection({ partners }: { partners: HomePartner[] }) {
  if (!partners.length) return null;

  const marqueeItems = partners.length >= 8 ? partners : [...partners, ...partners];

  return (
    <section className="-mx-4 border-b border-blue-100 bg-white px-4 py-8 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 xl:-mx-10 xl:px-10 2xl:-mx-12 2xl:px-12">
      <div className="overflow-hidden">
        <div className="homepage-partner-marquee flex w-max items-center gap-10">
          {[...marqueeItems, ...marqueeItems].map((partner, index) => {
            const logo = (
              <img
                src={partner.logoUrl}
                alt={partner.name}
                className="h-12 w-auto max-w-[160px] object-contain opacity-75 grayscale transition hover:opacity-100 hover:grayscale-0 sm:h-14"
              />
            );

            return partner.href ? (
              <a
                key={`${partner.id}-${index}`}
                href={partner.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-16 min-w-[150px] items-center justify-center"
              >
                {logo}
              </a>
            ) : (
              <span
                key={`${partner.id}-${index}`}
                className="flex h-16 min-w-[150px] items-center justify-center"
              >
                {logo}
              </span>
            );
          })}
        </div>
      </div>
      <style>{`
        @keyframes homepagePartnerMarquee {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-50%);
          }
        }

        .homepage-partner-marquee {
          animation: homepagePartnerMarquee 32s linear infinite;
        }

        .homepage-partner-marquee:hover {
          animation-play-state: paused;
        }

        @media (prefers-reduced-motion: reduce) {
          .homepage-partner-marquee {
            animation: none;
          }
        }
      `}</style>
    </section>
  );
}

function HomeEmptyState({
  title,
  body,
}: {
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-md border border-dashed border-blue-200 bg-white/80 p-6 text-center">
      <Megaphone className="mx-auto h-7 w-7 text-primary" />
      <h3 className="mt-3 text-sm font-bold text-slate-950">{title}</h3>
      <p className="mt-2 text-xs leading-5 text-slate-600">{body}</p>
    </div>
  );
}
