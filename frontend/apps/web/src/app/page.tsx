import Link from "next/link";
import type { ReactNode } from "react";
import {
  ArrowRight,
  AlertTriangle,
  BookOpen,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  Download,
  ExternalLink,
  GraduationCap,
  Mail,
  MapPin,
  Megaphone,
  Newspaper,
  Phone,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button, ScrollReveal, ScrollRevealGroup } from "@ksu/ui/components";
import { MiniHeader, PublicFooter, PublicHeader } from "@ksu/ui/layout/public";
import { LandingHero } from "@/components/home/landing-hero";
import { AnimatedStatRow } from "@/components/home/animated-stat-row";
import { CountdownStrip } from "@/components/home/countdown-strip";
import { FeaturedProgrammeTabs } from "@/components/home/featured-programme-tabs";
import { AnnouncementHeader } from "@/components/site-shell";
import {
  ProgressiveImageCard,
  PublicImage,
} from "@/components/public/public-image";
import {
  getHomepageData,
  type HomeCard,
  type HomeIntake,
  type HomeLeader,
  type HomeLink,
  type HomeMetric,
  type HomePartner,
} from "@/lib/homepage-data";
import { getNavData } from "@/lib/nav-data";
import { libraryFrontendUrl, researchFrontendUrl } from "@/lib/service-urls";

export const revalidate = 300;

const researchHref = researchFrontendUrl;

const quickLinkIcons: Record<string, LucideIcon> = {
  "Admissions Guide": ClipboardCheck,
  Programmes: BookOpen,
  "Fees Structure": CheckCircle2,
  Downloads: Download,
  Timetables: CalendarDays,
  "Student Portal": Users,
  "Staff Portal": BriefcaseBusiness,
  "Contact Directory": Search,
};

const intakeSteps = [
  "Choose programme",
  "Check requirements",
  "Submit application",
  "Upload documents",
  "Review and submit",
];

const campusLife = [
  {
    title: "Clubs & Societies",
    body: "Connect with academic, professional, and student-interest groups.",
    href: "/campus-life/clubs",
    imageUrl: "/logos/ksu-bck1.jpg",
    icon: Users,
  },
  {
    title: "Accommodation",
    body: "Find student housing information and support channels.",
    href: "/campus-life/accommodation",
    imageUrl: "/images/about/about-overview-branded.webp",
    icon: Building2,
  },
  {
    title: "Health Services",
    body: "Access campus health and wellness information.",
    href: "/campus-life/health-services",
    imageUrl: "/images/about/about-service-charter-branded.webp",
    icon: ShieldCheck,
  },
  {
    title: "Student Support",
    body: "Guidance, welfare, and student service routes.",
    href: "/campus-life/student-support",
    imageUrl: "/logos/ksu-bck5.jpg",
    icon: Sparkles,
  },
] satisfies Array<{
  title: string;
  body: string;
  href: string;
  imageUrl: string;
  icon: LucideIcon;
}>;

const defaultInstitutionalFacts: HomeMetric[] = [
  { value: "Open", label: "Admissions" },
  { value: "Live", label: "Programmes" },
  { value: "Active", label: "Research" },
  { value: "Public", label: "Services" },
];

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
  variant = "fade-up",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  variant?: "fade-up" | "fade-down" | "fade-left" | "fade-right" | "zoom-in" | "zoom-out";
  delay?: number;
}) {
  return (
    <ScrollReveal className={className} variant={variant} delay={delay}>
      {children}
    </ScrollReveal>
  );
}

export default async function HomePage() {
  const [homepage, megaMenuData] = await Promise.all([
    getHomepageData(),
    getNavData(),
  ]);
  const degradedSections = [
    homepage.schools.length === 0,
    homepage.featuredProgrammes.length === 0,
    homepage.latestNews.length === 0,
    homepage.upcomingEvents.length === 0,
  ].filter(Boolean).length;
  const isContentDegraded = degradedSections >= 2;

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f8fbff_0%,#ffffff_38%,#f6f8fc_100%)] text-slate-950">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <AnnouncementHeader announcements={homepage.announcements} />
      <MiniHeader
        contactInfo={homepage.contactInfo}
        quickLinks={homepage.miniQuickLinks}
        socialLinks={homepage.socialLinks}
      />
      <PublicHeader
        megaMenuData={megaMenuData}
        researchHref={researchFrontendUrl}
        libraryHref={libraryFrontendUrl}
      />

      <main id="main-content" tabIndex={-1}>
        <LandingHero {...homepage.hero} />

        <section className="relative z-10 pb-0">
          <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
            <TrustFactRow facts={homepage.facts} />
            {isContentDegraded ? <ContentDegradedNotice /> : null}
            <LandingReveal variant="fade-right">
              <SchoolsSection
                schools={homepage.schools}
                quickLinks={homepage.publicQuickLinks}
                activeIntakes={homepage.activeIntakes}
                viceChancellor={homepage.viceChancellor}
              />
            </LandingReveal>
            <LandingReveal variant="zoom-in">
              <ProgrammesAdmissionsSection
                programmes={homepage.featuredProgrammes}
                activeIntakes={homepage.activeIntakes}
              />
            </LandingReveal>
            <LandingReveal variant="fade-left">
              <LatestContentSection
                newsItems={homepage.latestNews}
                events={homepage.upcomingEvents}
                blog={homepage.latestBlog}
              />
            </LandingReveal>
            <LandingReveal variant="zoom-out">
              <ResearchSection />
            </LandingReveal>
            <LandingReveal>
              <CampusLifeSection />
            </LandingReveal>
            <LandingReveal>
              <PartnersSection partners={homepage.partners} />
            </LandingReveal>
            <LandingReveal>
              <JourneyCta />
            </LandingReveal>
          </div>
        </section>
      </main>

      <PublicFooter
        contactInfo={homepage.contactInfo}
        socialLinks={homepage.socialLinks}
        researchHref={researchFrontendUrl}
        libraryHref={libraryFrontendUrl}
      />
    </div>
  );
}

function ContentDegradedNotice() {
  return (
    <section className="border-b border-amber-200 bg-amber-50 px-4 py-4 text-amber-950 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-3">
          <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-amber-100 text-amber-700">
            <AlertTriangle className="h-5 w-5" aria-hidden />
          </span>
          <div>
            <h2 className="text-base font-bold tracking-normal">
              Some live content is temporarily unavailable
            </h2>
            <p className="mt-1 text-sm leading-6 text-amber-900">
              Schools, programmes, news, or events may be incomplete. Admissions
              links and service contacts remain available.
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Link
            href="/"
            className="inline-flex min-h-11 items-center justify-center rounded-md border border-amber-300 bg-white px-4 text-sm font-semibold text-amber-950 transition hover:bg-amber-100"
          >
            Retry homepage
          </Link>
          <Link
            href="/contact"
            className="inline-flex min-h-11 items-center justify-center rounded-md border border-amber-300 bg-white px-4 text-sm font-semibold text-amber-950 transition hover:bg-amber-100"
          >
            Contact support
          </Link>
          <Link
            href="/search"
            className="inline-flex min-h-11 items-center justify-center rounded-md border border-amber-300 bg-white px-4 text-sm font-semibold text-amber-950 transition hover:bg-amber-100"
          >
            Search site
          </Link>
        </div>
      </div>
    </section>
  );
}

function TrustFactRow({ facts }: { facts: HomeMetric[] }) {
  const visibleFacts = facts.length ? facts : defaultInstitutionalFacts;

  return (
    <LandingReveal>
      <AnimatedStatRow facts={visibleFacts} />
    </LandingReveal>
  );
}

function SchoolsSection({
  schools,
  quickLinks,
  activeIntakes,
  viceChancellor,
}: {
  schools: HomeCard[];
  quickLinks: HomeLink[];
  activeIntakes: HomeIntake[];
  viceChancellor: HomeLeader | null;
}) {
  return (
    <section className="border-b border-blue-100 bg-white py-12">
      <div className="grid gap-8 xl:grid-cols-[minmax(280px,0.82fr)_minmax(0,1.35fr)]">
        <div className="grid gap-5">
          <div className="rounded-md bg-primary p-6 text-white shadow-sm shadow-blue-100/70">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/70">
              Academic gateway
            </p>
            <h2 className="mt-4 font-[family-name:var(--font-display)] text-3xl font-bold leading-tight">
              Find your school, programme, and student service route.
            </h2>
            <p className="mt-4 text-sm leading-6 text-white/82">
              Kisii University brings academic schools, admissions guidance,
              public services, and institutional leadership into one clear
              entry point.
            </p>
            <Link
              href="/academics/schools"
              className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-md bg-white px-4 text-sm font-semibold text-primary transition hover:bg-white/90"
            >
              Explore schools
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
          <ViceChancellorMessage leader={viceChancellor} />
          <QuickPublicLinks links={quickLinks} activeIntakes={activeIntakes} />
        </div>

        <div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <SectionKicker title="Our Schools" />
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
                Browse academic homes for teaching, research, professional
                training, and community engagement.
              </p>
            </div>
            <Link
              href="/academics"
              className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-primary hover:text-secondary"
            >
              View academics
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
          {schools.length ? (
            <ScrollRevealGroup
              className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
              variant="fade-up"
              staggerDelay={55}
            >
              {schools.slice(0, 8).map((school) => (
                <SchoolCard key={school.href} school={school} />
              ))}
            </ScrollRevealGroup>
          ) : (
            <HomeEmptyState
              title="Schools are not available"
              body="Published school records could not be loaded right now."
              actionHref="/academics/schools"
              actionLabel="Open schools"
            />
          )}
        </div>
      </div>
    </section>
  );
}

function ViceChancellorMessage({ leader }: { leader: HomeLeader | null }) {
  if (!leader) {
    return null;
  }

  return (
    <aside className="rounded-md border border-blue-100 bg-blue-50/60 p-4">
      <SectionKicker title="Message from the Vice Chancellor" />
      <div className="mt-4 grid gap-4">
        {leader.image ? (
          <PublicImage
            src={leader.image}
            alt={leader.name}
            ratio="card"
            sizes="(min-width: 1280px) 24vw, (min-width: 640px) 40vw, 100vw"
            className="h-64 rounded-md sm:h-72 xl:h-80"
            imageClassName="object-top"
          />
        ) : null}
        <div>
          {leader.message ? (
            <p className="text-sm leading-6 text-slate-700">
              {leader.message}
            </p>
          ) : null}
          <div className="mt-4">
            <h3 className="text-sm font-bold text-primary">{leader.name}</h3>
            <p className="text-xs font-semibold text-slate-500">
              {leader.title}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}

function SchoolCard({ school }: { school: HomeCard }) {
  return (
    <Link
      href={school.href}
      className="group block h-full overflow-hidden rounded-md border border-blue-100 bg-white shadow-sm shadow-blue-100/60 transition duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md hover:shadow-blue-200"
    >
      <PublicImage
        src={school.imageUrl}
        alt=""
        ratio="card"
        fallbackContent={<GraduationCap className="h-8 w-8" aria-hidden />}
        sizes="(min-width: 1280px) 18vw, (min-width: 1024px) 28vw, (min-width: 640px) 45vw, 100vw"
        className="h-28"
        imageClassName="transition duration-500 group-hover:scale-105"
      />
      <div className="flex min-h-16 items-center px-3 py-2">
        <h3 className="w-full line-clamp-2 text-sm font-bold leading-5 text-slate-950 transition group-hover:text-primary">
          {school.title}
        </h3>
      </div>
    </Link>
  );
}

function QuickPublicLinks({
  links,
  activeIntakes,
}: {
  links: HomeLink[];
  activeIntakes: HomeIntake[];
}) {
  const kuccpsIntake = activeIntakes.find((intake) =>
    `${intake.name} ${intake.code}`.toLowerCase().includes("kuccps"),
  );
  const visibleLinks = kuccpsIntake
    ? [
        {
          label: `${intakeLabel(kuccpsIntake)} Apply Now`,
          href: kuccpsIntake.href,
        },
        ...links,
      ]
    : links;

  return (
    <aside className="rounded-md border border-blue-100 bg-white p-4 shadow-sm shadow-blue-100/60">
      <SectionKicker title="Quick Links" />
      <div className="mt-4 overflow-hidden rounded-md border border-blue-100 bg-white">
        {visibleLinks.slice(0, 8).map((link, index) => {
          const external = link.external ?? isExternalHref(link.href);
          const highlighted = index === 0 && kuccpsIntake;
          const Icon = highlighted
            ? Megaphone
            : (quickLinkIcons[link.label] ?? ArrowRight);

          return (
            <Link
              key={`${link.label}-${link.href}`}
              href={link.href}
              {...linkProps(link)}
              className={`group flex min-h-11 items-center gap-3 border-b border-blue-50 px-3 text-sm font-semibold transition last:border-b-0 ${
                highlighted
                  ? "bg-orange-50 text-secondary"
                  : "bg-white text-slate-700 hover:bg-blue-50 hover:text-primary"
              }`}
            >
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md ${
                  highlighted
                    ? "bg-white text-secondary"
                    : "bg-blue-50 text-primary"
                }`}
              >
                <Icon className="h-4 w-4" aria-hidden />
              </span>
              <span className="min-w-0 flex-1">{link.label}</span>
              {external ? (
                <ExternalLink className="h-3.5 w-3.5 text-slate-300 transition group-hover:text-primary" aria-hidden />
              ) : (
                <ChevronRight className="h-3.5 w-3.5 text-slate-300 transition group-hover:translate-x-1 group-hover:text-primary" aria-hidden />
              )}
            </Link>
          );
        })}
      </div>
    </aside>
  );
}

function SectionKicker({
  title,
  className = "text-slate-950",
}: {
  title: string;
  className?: string;
}) {
  return (
    <div>
      <h2
        className={`font-[family-name:var(--font-display)] text-xl font-bold ${className}`}
      >
        {title}
      </h2>
      <span className="mt-2 block h-0.5 w-7 bg-secondary" />
    </div>
  );
}

function ProgrammesAdmissionsSection({
  programmes,
  activeIntakes,
}: {
  programmes: HomeCard[];
  activeIntakes: HomeIntake[];
}) {
  const activeIntake = activeIntakes[0] ?? null;

  return (
    <section className="-mx-4 overflow-hidden bg-blue-50/80 px-4 py-12 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 xl:-mx-10 xl:px-10 2xl:-mx-12 2xl:px-12">
      <div className="grid gap-7 lg:grid-cols-[minmax(300px,0.72fr)_minmax(0,1.28fr)]">
        <ApplyCtaCard activeIntake={activeIntake} />
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(280px,0.58fr)]">
          <FeaturedProgrammes programmes={programmes} />
          <AdmissionsGuideCard activeIntake={activeIntake} />
        </div>
      </div>
    </section>
  );
}

function FeaturedProgrammes({ programmes }: { programmes: HomeCard[] }) {
  return (
    <section className="rounded-md border border-blue-100 bg-white shadow-sm shadow-blue-100/60">
      <div className="mb-3 flex flex-col gap-3 border-b border-blue-50 px-5 pb-4 pt-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <SectionKicker title="Featured Programmes" />
          <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600">
            Explore selected programmes and move quickly from discovery to
            application guidance.
          </p>
        </div>
        <Link
          href="/academics/programmes"
          className="inline-flex min-h-11 items-center gap-1.5 text-xs font-semibold text-primary hover:text-secondary"
        >
          View all programmes
          <ArrowRight className="h-3.5 w-3.5" aria-hidden />
        </Link>
      </div>

      {programmes.length ? (
        <div className="px-5 pb-5">
          <FeaturedProgrammeTabs programmes={programmes} />
        </div>
      ) : (
        <div className="p-4">
          <HomeEmptyState
            title="Programmes are not available"
            body="Featured programme records could not be loaded right now."
            actionHref="/academics/programmes"
            actionLabel="Open programmes"
          />
        </div>
      )}
    </section>
  );
}

function AdmissionsGuideCard({
  activeIntake: _activeIntake,
}: {
  activeIntake: HomeIntake | null;
}) {
  return (
    <section className="rounded-md border border-blue-100 bg-white p-5 shadow-sm shadow-blue-100/60">
      <SectionKicker title="Your Admissions Journey" />

      <div className="mt-5 grid gap-4">
        {[
          [
            "Choose Your Programme",
            "Explore and select the programme that matches your passion.",
          ],
          [
            "Apply",
            "Apply via KUCCPS or Direct Entry and submit required documents.",
          ],
          [
            "Pay Application Fee",
            "Make payment through the available university channels.",
          ],
          ["Upload Documents", "Upload academic and supporting documents."],
          [
            "Track Application",
            "Track application status and receive updates.",
          ],
        ].map(([title, body], index) => (
          <div key={title} className="grid grid-cols-[34px_1fr] gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
              {index + 1}
            </span>
            <p className="pt-0.5 text-xs leading-5 text-slate-600">
              <span className="block text-sm font-bold text-slate-950">
                {title}
              </span>
              {body}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

function ApplyCtaCard({ activeIntake }: { activeIntake: HomeIntake | null }) {
  return (
    <aside className="relative min-h-[430px] overflow-hidden rounded-md bg-primary text-white shadow-sm shadow-blue-100/70">
      <PublicImage
        src="/logos/ksu-bck5.jpg"
        alt=""
        ratio="fill"
        sizes="(min-width: 1024px) 36vw, 100vw"
        className="absolute inset-0 h-full w-full"
        imageClassName="object-cover"
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,20,49,0.55)_0%,rgba(2,20,49,0.9)_100%)]" />
      <div className="relative z-10 flex min-h-[430px] flex-col justify-end p-6 sm:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/70">
          Start your journey
        </p>
        <h3 className="mt-4 max-w-sm font-[family-name:var(--font-display)] text-4xl font-bold leading-tight">
          Apply to Kisii University with confidence.
        </h3>
        <p className="mt-4 max-w-sm text-sm font-medium leading-6 text-white/85">
          Choose a programme, check the requirements, and complete your
          application through the active intake route.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
          <Button
            asChild
            className="min-h-11 rounded-md bg-secondary px-5 text-sm font-semibold text-white hover:bg-secondary/90"
          >
            <Link href={activeIntake?.href ?? "/admissions/how-to-apply"}>
              Apply Now
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="min-h-11 rounded-md border-white/80 bg-white px-5 text-sm font-semibold text-primary hover:bg-white/90"
          >
            <Link href="/admissions/requirements">
              View requirements
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </Button>
        </div>
      </div>
      {activeIntake ? (
        <CountdownStrip
          title={`${intakeLabel(activeIntake)} Countdown`}
          deadline={activeIntake.lateApplicationEnd ?? activeIntake.applicationEnd}
          deadlineLabel={formatDate(activeIntake.lateApplicationEnd ?? activeIntake.applicationEnd)}
        />
      ) : null}
    </aside>
  );
}

function _AdmissionsPanel({ activeIntakes }: { activeIntakes: HomeIntake[] }) {
  const activeIntake = activeIntakes[0] ?? null;

  return (
    <section className="rounded-md border border-blue-100 bg-white p-4 shadow-sm shadow-blue-100/60">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold text-slate-950">
            Admissions
          </h2>
          <p className="mt-1 text-sm leading-6 text-slate-600">
            {activeIntake
              ? "Follow the active intake process and complete the application before the deadline."
              : "Review application guidance, requirements, and intake records before applying."}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {activeIntakes.length ? (
            activeIntakes.slice(0, 2).map((intake) => (
              <Link
                key={intake.id}
                href={intake.href}
                className="rounded-md bg-primary px-3 py-1.5 text-xs font-bold text-white"
              >
                {intakeLabel(intake)}
              </Link>
            ))
          ) : (
            <span className="rounded-md bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600">
              No active intake
            </span>
          )}
        </div>
      </div>

      <div className="mt-5 grid gap-2 sm:grid-cols-5">
        {intakeSteps.map((step, index) => (
          <div
            key={step}
            className="rounded-md border border-blue-100 bg-blue-50/60 p-3"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
              {index + 1}
            </span>
            <p className="mt-2 text-xs font-semibold leading-4 text-slate-700">
              {step}
            </p>
          </div>
        ))}
      </div>

      {activeIntake ? (
        <CountdownStrip
          title={`${intakeLabel(activeIntake)} Countdown`}
          deadline={activeIntake.lateApplicationEnd ?? activeIntake.applicationEnd}
          deadlineLabel={formatDate(activeIntake.lateApplicationEnd ?? activeIntake.applicationEnd)}
        />
      ) : (
        <div className="mt-5 rounded-md border border-dashed border-blue-200 bg-blue-50/50 p-4">
          <p className="text-sm font-bold text-slate-950">
            Active intake countdown will appear here.
          </p>
          <p className="mt-1 text-xs leading-5 text-slate-600">
            The panel uses backend intake records and hides deadline counters
            when no active intake is open.
          </p>
        </div>
      )}

      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <Button
          asChild
          className="h-10 rounded-md bg-secondary px-5 text-sm font-semibold text-white hover:bg-secondary/90"
        >
          <Link href={activeIntake?.href ?? "/admissions/how-to-apply"}>
            Start Application
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </Button>
        <Button
          asChild
          variant="outline"
          className="h-10 rounded-md border-blue-200 bg-white px-5 text-sm font-semibold text-primary hover:bg-blue-50"
        >
          <Link href="/admissions/requirements">
            View requirements
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </Button>
      </div>
    </section>
  );
}

function intakeLabel(intake: HomeIntake) {
  const text = `${intake.name} ${intake.code}`.toLowerCase();
  if (text.includes("kuccps")) return "KUCCPS Intake";
  if (text.includes("school") || text.includes("self"))
    return "School-Based Intake";
  return intake.name;
}

function LatestContentSection({
  newsItems,
  events,
  blog,
}: {
  newsItems: HomeCard[];
  events: HomeCard[];
  blog: HomeCard | null;
}) {
  return (
    <section className="border-b border-blue-100 bg-white py-12">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <SectionKicker title="News, Events and Notices" />
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
            Follow university announcements, academic events, student notices,
            and public updates from one editorial view.
          </p>
        </div>
        <Link
          href="/media/news"
          className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-primary hover:text-secondary"
        >
          View media centre
          <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      </div>
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.24fr)_minmax(300px,0.76fr)]">
        <div>
          <div className="mb-4 flex items-center justify-between gap-3">
            <h3 className="text-sm font-bold uppercase tracking-[0.14em] text-slate-500">
              Latest News
            </h3>
            <Link
              href="/media/news"
              className="inline-flex min-h-11 items-center gap-2 text-xs font-semibold text-primary hover:text-secondary"
            >
              View all news
              <ArrowRight className="h-3.5 w-3.5" aria-hidden />
            </Link>
          </div>
          {newsItems.length ? (
            <div className="grid gap-4 sm:grid-cols-[1.2fr_0.9fr]">
              <NewsLead item={newsItems[0]} />
              <div className="grid gap-3">
                {newsItems.slice(1, 3).map((item) => (
                  <NewsMini key={item.href} item={item} />
                ))}
              </div>
            </div>
          ) : (
            <HomeEmptyState
              title="News updates are being refreshed"
              body="Open the news listing for current published university updates."
              actionHref="/media/news"
              actionLabel="Open news"
            />
          )}
        </div>
        <div className="grid gap-5">
          <EventsCard events={events} />
          <LatestBlogCard blog={blog} />
        </div>
      </div>
    </section>
  );
}

function NewsLead({ item }: { item: HomeCard }) {
  return (
    <Link href={item.href} className="group block">
      <PublicImage
        src={item.imageUrl}
        alt=""
        ratio="news"
        fallbackSrc="/logos/ksu-bck1.jpg"
        fallbackContent={<Newspaper className="h-8 w-8" aria-hidden />}
        sizes="(min-width: 1280px) 34vw, (min-width: 640px) 54vw, 100vw"
        className="h-44 rounded-md"
        imageClassName="transition duration-500 group-hover:scale-105"
      />
      {item.meta ? (
        <p className="mt-3 text-xs font-semibold text-slate-500">{item.meta}</p>
      ) : null}
      <h3 className="mt-1 line-clamp-2 font-[family-name:var(--font-display)] text-xl font-bold leading-6 text-slate-950 transition group-hover:text-primary">
        {item.title}
      </h3>
      <span className="mt-2 inline-flex items-center gap-2 text-xs font-semibold text-primary">
        Read more
        <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-1" aria-hidden />
      </span>
    </Link>
  );
}

function NewsMini({ item }: { item: HomeCard }) {
  return (
    <Link
      href={item.href}
      className="group grid min-w-0 grid-cols-[82px_minmax(0,1fr)] gap-3"
    >
      <PublicImage
        src={item.imageUrl}
        alt=""
        ratio="news"
        fallbackSrc="/logos/ksu-bck5.jpg"
        fallbackContent={<Newspaper className="h-5 w-5" aria-hidden />}
        sizes="82px"
        className="h-20 rounded-md"
      />
      <span className="min-w-0">
        {item.meta ? (
          <span className="block text-[11px] font-semibold text-slate-500">
            {item.meta}
          </span>
        ) : null}
        <span className="mt-1 line-clamp-2 block text-sm font-bold leading-5 text-slate-950 group-hover:text-primary">
          {item.title}
        </span>
        <span className="mt-1 inline-flex items-center gap-1 text-[11px] font-semibold text-primary">
          Read more <ArrowRight className="h-3 w-3" aria-hidden />
        </span>
      </span>
    </Link>
  );
}

function EventsCard({ events }: { events: HomeCard[] }) {
  return (
    <aside className="rounded-md border border-blue-100 bg-blue-50/60 p-5">
      <div className="mb-3 flex items-center justify-between gap-3">
        <SectionKicker title="Upcoming Events" />
        <Link
          href="/media/events"
          className="inline-flex min-h-11 items-center text-xs font-semibold text-primary hover:text-secondary"
        >
          View all events
        </Link>
      </div>
      {events.length ? (
        <div className="divide-y divide-blue-50">
          {events.slice(0, 3).map((event) => (
            <Link
              key={event.href}
              href={event.href}
              className="group grid grid-cols-[48px_1fr] gap-3 py-3"
            >
              <span className="rounded-md border border-blue-100 bg-blue-50 px-2 py-2 text-center text-[11px] font-bold uppercase text-primary">
                {event.meta?.slice(0, 6) ?? "Event"}
              </span>
              <span>
                <span className="block text-sm font-bold leading-5 text-slate-950 group-hover:text-primary">
                  {event.title}
                </span>
                <span className="mt-1 block text-xs leading-5 text-slate-600">
                  {event.meta ?? event.body}
                </span>
              </span>
            </Link>
          ))}
        </div>
      ) : (
        <HomeEmptyState
          title="Event listings are being refreshed"
          body="Open the events listing for current university activities."
          actionHref="/media/events"
          actionLabel="Open events"
        />
      )}
    </aside>
  );
}

function LatestBlogCard({ blog }: { blog: HomeCard | null }) {
  if (!blog) {
    return (
      <aside className="rounded-md border border-blue-100 bg-white p-5 shadow-sm shadow-blue-100/60">
        <SectionKicker title="Latest Blog" />
        <HomeEmptyState
          title="Blog updates are being refreshed"
          body="Open the blog listing for current published articles."
          actionHref="/media/articles"
          actionLabel="Open blogs"
        />
      </aside>
    );
  }

  return (
    <aside className="rounded-md border border-blue-100 bg-white p-5 shadow-sm shadow-blue-100/60">
      <div className="mb-3 flex items-center justify-between gap-3">
        <SectionKicker title="Latest Blog" />
        <Link
          href="/media/articles"
          className="inline-flex min-h-11 items-center text-xs font-semibold text-primary hover:text-secondary"
        >
          View all blogs
        </Link>
      </div>
      <NewsMini item={blog} />
    </aside>
  );
}

function ResearchSection() {
  return (
    <section className="relative -mx-4 min-h-[430px] overflow-hidden bg-slate-950 px-4 py-14 text-white sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 xl:-mx-10 xl:px-10 2xl:-mx-12 2xl:px-12">
      <PublicImage
        src="/images/about/about-strategic-plan-branded.webp"
        alt=""
        ratio="fill"
        sizes="100vw"
        className="absolute inset-0 h-full w-full"
        imageClassName="object-cover"
      />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(2,20,49,0.9)_0%,rgba(2,20,49,0.72)_42%,rgba(2,20,49,0.18)_100%)]" />
      <div className="relative z-10 grid min-h-[320px] max-w-7xl items-center gap-8 lg:grid-cols-[minmax(0,0.95fr)_minmax(320px,0.65fr)]">
        <div className="max-w-2xl">
          <SectionKicker
            title="Research and Innovation"
            className="text-white"
          />
          <h2 className="mt-5 font-[family-name:var(--font-display)] text-4xl font-bold leading-tight sm:text-5xl">
            Research that responds to real community and national priorities.
          </h2>
          <p className="mt-4 text-base leading-7 text-white/85">
            Kisii University advances teaching, discovery, innovation, and
            partnerships that connect knowledge to health, agriculture,
            education, technology, environment, and public service.
          </p>
          <Link
            href={researchHref}
            {...linkProps({ href: researchHref })}
            className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-md bg-white px-4 text-sm font-semibold text-primary transition hover:bg-white/90"
          >
            Explore research areas
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
        <ScrollRevealGroup
          className="grid gap-3"
          variant="fade-left"
          staggerDelay={80}
        >
          {[
            ["Health and wellbeing", "Applied research for stronger communities."],
            ["Agriculture and environment", "Knowledge for resilient livelihoods."],
            ["Technology and society", "Innovation for public service and enterprise."],
          ].map(([title, body]) => (
            <div
              key={title}
              className="rounded-md border border-white/15 bg-white/10 p-4 backdrop-blur-sm"
            >
              <h3 className="text-sm font-bold text-white">{title}</h3>
              <p className="mt-2 text-xs leading-5 text-white/72">{body}</p>
            </div>
          ))}
        </ScrollRevealGroup>
      </div>
    </section>
  );
}

function CampusLifeSection() {
  return (
    <section className="border-b border-blue-100 bg-white py-12">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <SectionKicker title="Life at Kisii University" />
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
            Student life connects support services, accommodation, clubs,
            wellness, and everyday participation across the university.
          </p>
        </div>
        <Link
          href="/campus-life"
          className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-primary hover:text-secondary"
        >
          Explore campus life
          <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      </div>
      <ScrollRevealGroup
        className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        variant="fade-up"
        staggerDelay={70}
      >
        {campusLife.map((item, index) => (
          <Link
            key={item.href}
            href={item.href}
            className={`group min-w-0 overflow-hidden rounded-md border border-blue-100 bg-white shadow-sm shadow-blue-100/60 transition duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md ${
              index === 0 ? "lg:col-span-2" : ""
            }`}
          >
            <ProgressiveImageCard
              src={item.imageUrl}
              alt=""
              ratio="card"
              sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
              className={index === 0 ? "h-48 lg:h-56" : "h-32"}
            >
              <span className="absolute left-3 top-3 flex h-9 w-9 items-center justify-center rounded-md bg-white/90 text-primary shadow-sm">
                <item.icon className="h-4 w-4" aria-hidden />
              </span>
              <span className="absolute bottom-2 left-3 right-3 text-xs font-bold text-white drop-shadow">
                {item.title}
              </span>
            </ProgressiveImageCard>
            <div className="p-4">
              {index === 0 ? (
                <h3 className="mb-2 font-[family-name:var(--font-display)] text-xl font-bold text-slate-950">
                  {item.title}
                </h3>
              ) : null}
              <p className="line-clamp-3 text-sm leading-6 text-slate-600">
                {item.body}
              </p>
              <span className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-primary">
                Open section
                <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-1" aria-hidden />
              </span>
            </div>
          </Link>
        ))}
      </ScrollRevealGroup>
    </section>
  );
}

function PartnersSection({ partners }: { partners: HomePartner[] }) {
  const marqueePartners = [...partners, ...partners];

  return (
    <section className="border-y border-blue-100 bg-white py-5">
      <SectionKicker title="Our Partners" />
      {partners.length ? (
        <div className="relative mt-4 overflow-hidden bg-white py-2">
          <style>
            {`
              @keyframes partner-marquee {
                from { transform: translateX(0); }
                to { transform: translateX(-50%); }
              }
              @media (prefers-reduced-motion: reduce) {
                .partner-marquee-track {
                  animation: none !important;
                  transform: none !important;
                }
              }
            `}
          </style>
          <div className="partner-marquee-track flex w-max gap-8 px-3 [animation:partner-marquee_34s_linear_infinite] hover:[animation-play-state:paused]">
            {marqueePartners.map((partner, index) => {
              const content = (
                <>
                  <PublicImage
                    src={partner.logoUrl}
                    alt={partner.name}
                    ratio="logo"
                    sizes="150px"
                    className="mx-auto h-12 w-[150px] bg-white"
                    imageClassName="object-contain"
                  />
                </>
              );

              return partner.href ? (
                <a
                  key={`${partner.id}-${index}`}
                  href={partner.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-16 w-44 shrink-0 items-center justify-center bg-white"
                >
                  {content}
                </a>
              ) : (
                <div
                  key={`${partner.id}-${index}`}
                  className="flex h-16 w-44 shrink-0 items-center justify-center bg-white"
                >
                  {content}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="mt-4">
          <HomeEmptyState
            title="Partners are not available"
            body="Active partner records could not be loaded right now."
            actionHref={researchHref}
            actionLabel="Open research"
          />
        </div>
      )}
    </section>
  );
}

function JourneyCta() {
  const routes = [
    {
      title: "Apply Now",
      body: "Start your application through the admissions guide and active intake routes.",
      href: "/admissions/how-to-apply",
      label: "Apply",
      image: "/logos/ksu-bck1.jpg",
      tone: "primary",
    },
    {
      title: "Explore Programmes",
      body: "Compare academic options across schools before choosing your path.",
      href: "/academics/programmes",
      label: "View programmes",
      image: "/logos/ksu-bck5.jpg",
      tone: "secondary",
    },
    {
      title: "Contact Admissions",
      body: "Reach the university for guidance on requirements, deadlines, and next steps.",
      href: "/contact",
      label: "Contact us",
      image: "/images/about/about-service-charter-branded.webp",
      tone: "primary",
    },
  ];

  return (
    <section className="-mx-4 bg-slate-950 px-4 py-12 text-white sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 xl:-mx-10 xl:px-10 2xl:-mx-12 2xl:px-12">
      <div className="mb-7 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/60">
            Take the next step
          </p>
          <h2 className="mt-3 font-[family-name:var(--font-display)] text-4xl font-bold leading-tight">
            Start with the route that fits your goal.
          </h2>
        </div>
        <p className="max-w-md text-sm leading-6 text-white/72">
          Clear pathways for applicants, programme explorers, and visitors who
          need direct admissions support.
        </p>
      </div>
      <ScrollRevealGroup
        className="grid gap-4 lg:grid-cols-3"
        variant="fade-up"
        staggerDelay={80}
      >
        {routes.map((route) => (
          <Link
            key={route.href}
            href={route.href}
            className="group relative block min-h-[260px] overflow-hidden rounded-md border border-white/15 bg-white/10 p-6"
          >
            <PublicImage
              src={route.image}
              alt=""
              ratio="fill"
              sizes="(min-width: 1024px) 33vw, 100vw"
              className="absolute inset-0 h-full w-full"
              imageClassName="object-cover transition duration-500 group-hover:scale-105"
            />
            <div
              className={`absolute inset-0 ${
                route.tone === "secondary"
                  ? "bg-[linear-gradient(180deg,rgba(249,115,22,0.72),rgba(2,20,49,0.9))]"
                  : "bg-[linear-gradient(180deg,rgba(59,130,246,0.72),rgba(2,20,49,0.92))]"
              }`}
            />
            <div className="relative z-10 flex min-h-[212px] flex-col justify-end">
              <h3 className="font-[family-name:var(--font-display)] text-3xl font-bold">
                {route.title}
              </h3>
              <p className="mt-3 text-sm leading-6 text-white/82">
                {route.body}
              </p>
              <span className="mt-5 inline-flex min-h-11 w-fit items-center gap-2 rounded-md bg-white px-4 text-sm font-semibold text-primary transition group-hover:bg-white/90">
                {route.label}
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" aria-hidden />
              </span>
            </div>
          </Link>
        ))}
      </ScrollRevealGroup>
    </section>
  );
}

function _ContactStrip({
  contactInfo,
}: {
  contactInfo: { address: string; phone: string; email: string };
}) {
  const rows = [
    { label: "Address", value: contactInfo.address, icon: MapPin },
    { label: "Phone", value: contactInfo.phone, icon: Phone },
    { label: "Email", value: contactInfo.email, icon: Mail },
    {
      label: "Office Hours",
      value: "Mon - Fri: 8:00 AM - 5:00 PM",
      icon: CalendarDays,
    },
  ];

  return (
    <section className="mt-5 grid gap-3 rounded-md border border-blue-100 bg-white p-3 shadow-sm shadow-blue-100/60 sm:grid-cols-2 lg:grid-cols-4">
      {rows.map((row) => (
        <div key={row.label} className="flex gap-3 rounded-md p-2">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-blue-50 text-primary">
            <row.icon className="h-4 w-4" aria-hidden />
          </span>
          <span className="min-w-0">
            <span className="block text-xs font-bold text-slate-950">
              {row.label}
            </span>
            <span className="mt-1 block break-words text-sm font-semibold leading-5 text-slate-600">
              {row.value}
            </span>
          </span>
        </div>
      ))}
    </section>
  );
}

function HomeEmptyState({
  title,
  body,
  actionHref = "/search",
  actionLabel = "Search site",
}: {
  title: string;
  body: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  const external = isExternalHref(actionHref);

  return (
    <div className="rounded-md border border-dashed border-blue-200 bg-white/80 p-6 text-center">
      <Megaphone className="mx-auto h-7 w-7 text-primary" aria-hidden />
      <h3 className="mt-3 text-sm font-bold text-slate-950">{title}</h3>
      <p className="mt-2 text-xs leading-5 text-slate-600">{body}</p>
      <div className="mt-4 flex flex-col justify-center gap-2 sm:flex-row">
        <Link
          href={actionHref}
          target={external ? "_blank" : undefined}
          rel={external ? "noopener noreferrer" : undefined}
          className="inline-flex min-h-11 items-center justify-center rounded-md border border-blue-200 bg-white px-3 text-xs font-bold text-primary transition hover:bg-blue-50"
        >
          {actionLabel}
        </Link>
        <Link
          href="/contact"
          className="inline-flex min-h-11 items-center justify-center rounded-md border border-blue-200 bg-white px-3 text-xs font-bold text-primary transition hover:bg-blue-50"
        >
          Contact support
        </Link>
      </div>
    </div>
  );
}

function formatDate(value?: string | null) {
  if (!value) return "Published deadline";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-KE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}
