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
import { Button, ScrollReveal } from "@ksu/ui/components";
import { MiniHeader, PublicFooter, PublicHeader } from "@ksu/ui/layout/public";
import { LandingHero } from "@/components/home/landing-hero";
import { AnimatedStatRow } from "@/components/home/animated-stat-row";
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

export const dynamic = "force-dynamic";

const researchHref = "https://research.kisiiuniversity.ac.ke";

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
}) {
  return <ScrollReveal className={className}>{children}</ScrollReveal>;
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
      <PublicHeader megaMenuData={megaMenuData} />

      <main id="main-content" tabIndex={-1}>
        <LandingHero {...homepage.hero} />

        <section className="relative z-10 pb-0">
          <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
            <TrustFactRow facts={homepage.facts} />
            {isContentDegraded ? <ContentDegradedNotice /> : null}
            <LandingReveal>
              <SchoolsSection
                schools={homepage.schools}
                quickLinks={homepage.publicQuickLinks}
                activeIntakes={homepage.activeIntakes}
                viceChancellor={homepage.viceChancellor}
              />
            </LandingReveal>
            <LandingReveal>
              <ProgrammesAdmissionsSection
                programmes={homepage.featuredProgrammes}
                activeIntakes={homepage.activeIntakes}
              />
            </LandingReveal>
            <LandingReveal>
              <LatestContentSection
                newsItems={homepage.latestNews}
                events={homepage.upcomingEvents}
                blog={homepage.latestBlog}
              />
            </LandingReveal>
            <LandingReveal>
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
  return (
    <LandingReveal>
      <AnimatedStatRow facts={facts} />
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
    <section className="border-b border-blue-100 bg-white py-8">
      <div className="grid gap-6 xl:grid-cols-[minmax(240px,0.78fr)_minmax(0,1.18fr)_minmax(260px,0.86fr)]">
        <ViceChancellorMessage leader={viceChancellor} />
        <div className="border-blue-100 xl:border-x xl:px-7">
          <SectionKicker title="Our Schools" />
          {schools.length ? (
            <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {schools.slice(0, 7).map((school, index) => (
                <SchoolCard key={school.href} school={school} index={index} />
              ))}
            </div>
          ) : (
            <HomeEmptyState
              title="Schools are not available"
              body="Published school records could not be loaded right now."
              actionHref="/academics/schools"
              actionLabel="Open schools"
            />
          )}
        </div>
        <QuickPublicLinks links={quickLinks} activeIntakes={activeIntakes} />
      </div>
    </section>
  );
}

function ViceChancellorMessage({ leader }: { leader: HomeLeader | null }) {
  return (
    <aside>
      <SectionKicker title="Message from the Vice Chancellor" />
      <div className="mt-4 grid gap-4">
        <PublicImage
          src={leader?.image}
          alt={leader?.name ?? "Vice Chancellor"}
          ratio="card"
          fallbackSrc="/logos/vc3.jpg"
          sizes="(min-width: 1280px) 24vw, (min-width: 640px) 40vw, 100vw"
          className="h-64 rounded-md sm:h-72 xl:h-80"
          imageClassName="object-top"
        />
        <div>
          <p className="text-sm leading-6 text-slate-700">
            {leader?.message ??
              "Kisii University remains committed to quality teaching, research, innovation, and service to society."}
          </p>
          <div className="mt-4">
            <h3 className="text-sm font-bold text-primary">
              {leader?.name ?? "Vice Chancellor"}
            </h3>
            <p className="text-xs font-semibold text-slate-500">
              {leader?.title ?? "Vice Chancellor"}
            </p>
            <Link
              href={leader?.href ?? "/about/university-management"}
              className="mt-3 inline-flex min-h-11 items-center gap-2 text-xs font-bold text-primary hover:text-secondary"
            >
              Read full message
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </aside>
  );
}

function SchoolCard({ school, index }: { school: HomeCard; index: number }) {
  return (
    <Link
      href={school.href}
      className={`group block h-full overflow-hidden rounded-md border border-blue-100 bg-white shadow-sm shadow-blue-100/60 transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md hover:shadow-blue-200 ${
        index === 6 ? "sm:col-span-2 lg:col-span-3" : ""
      }`}
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
        <h3 className="w-full line-clamp-2 text-center text-sm font-bold leading-5 text-slate-950 transition group-hover:text-primary">
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
    <aside>
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
                <Icon className="h-4 w-4" />
              </span>
              <span className="min-w-0 flex-1">{link.label}</span>
              {external ? (
                <ExternalLink className="h-3.5 w-3.5 text-slate-300 transition group-hover:text-primary" />
              ) : (
                <ChevronRight className="h-3.5 w-3.5 text-slate-300 transition group-hover:translate-x-1 group-hover:text-primary" />
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
    <section className="-mx-4 bg-blue-50/70 px-4 py-8 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 xl:-mx-10 xl:px-10 2xl:-mx-12 2xl:px-12">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.78fr)_minmax(280px,0.92fr)]">
        <FeaturedProgrammes programmes={programmes} />
        <AdmissionsGuideCard activeIntake={activeIntake} />
        <ApplyCtaCard activeIntake={activeIntake} />
      </div>
    </section>
  );
}

function FeaturedProgrammes({ programmes }: { programmes: HomeCard[] }) {
  return (
    <section className="rounded-md border border-blue-100 bg-white shadow-sm shadow-blue-100/60">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="px-4 pt-4">
          <SectionKicker title="Featured Programmes" />
        </div>
        <Link
          href="/academics/programmes"
          className="mr-4 mt-4 inline-flex min-h-11 items-center gap-1.5 text-xs font-semibold text-primary hover:text-secondary"
        >
          View all programmes
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {programmes.length ? (
        <div className="px-4 pb-4">
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
  activeIntake,
}: {
  activeIntake: HomeIntake | null;
}) {
  return (
    <section className="border-blue-100 lg:border-x lg:px-6">
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
    <aside className="overflow-hidden rounded-md bg-primary text-white shadow-sm shadow-blue-100/70">
      <div className="p-6">
        <h3 className="font-[family-name:var(--font-display)] text-2xl font-bold">
          Apply to Kisii University
        </h3>
        <p className="mt-4 max-w-xs text-sm font-medium leading-6 text-white/85">
          Join a vibrant community of learners and become part of a tradition of
          excellence and service.
        </p>
        <Button
          asChild
          className="mt-5 h-11 rounded-md bg-white px-5 text-sm font-semibold text-primary hover:bg-white/90"
        >
          <Link href={activeIntake?.href ?? "/admissions/how-to-apply"}>
            Apply Now
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
      {activeIntake ? <CountdownStrip intake={activeIntake} /> : null}
    </aside>
  );
}

function AdmissionsPanel({ activeIntakes }: { activeIntakes: HomeIntake[] }) {
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
        <CountdownStrip intake={activeIntake} />
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
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
        <Button
          asChild
          variant="outline"
          className="h-10 rounded-md border-blue-200 bg-white px-5 text-sm font-semibold text-primary hover:bg-blue-50"
        >
          <Link href="/admissions/requirements">
            View requirements
            <ArrowRight className="h-4 w-4" />
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

function CountdownStrip({
  intake,
  compact = false,
}: {
  intake: HomeIntake;
  compact?: boolean;
}) {
  const target = new Date(intake.lateApplicationEnd ?? intake.applicationEnd);
  const diff = Math.max(target.getTime() - Date.now(), 0);
  const seconds = Math.floor(diff / 1000);
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  const items = [
    { label: "Days", value: days },
    { label: "Hours", value: hours },
    { label: "Minutes", value: minutes },
    { label: "Seconds", value: remainingSeconds },
  ];

  return (
    <div className={`${compact ? "p-3" : "p-5"} bg-secondary text-white`}>
      <p className="font-[family-name:var(--font-display)] text-xl font-bold">
        {intakeLabel(intake)} Countdown
      </p>
      <div className="mt-3 grid grid-cols-4 gap-2">
        {items.map((item) => (
          <div
            key={item.label}
            className="border-r border-white/30 text-center last:border-r-0"
          >
            <span
              className={`block font-bold text-white ${compact ? "text-lg" : "text-3xl"}`}
            >
              {String(item.value).padStart(2, "0")}
            </span>
            <span className="mt-1 block text-[11px] font-semibold text-white/90">
              {item.label}
            </span>
          </div>
        ))}
      </div>
      <p className="mt-4 text-xs font-semibold text-white/90">
        Application deadline:{" "}
        {formatDate(intake.lateApplicationEnd ?? intake.applicationEnd)}
      </p>
    </div>
  );
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
    <section className="border-b border-blue-100 bg-white py-8">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(280px,0.78fr)_minmax(280px,0.78fr)]">
        <div className="border-blue-100 xl:border-r xl:pr-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <SectionKicker title="Latest News" />
            <Link
              href="/news"
              className="inline-flex min-h-11 items-center gap-2 text-xs font-semibold text-primary hover:text-secondary"
            >
              View all news
              <ArrowRight className="h-3.5 w-3.5" />
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
              actionHref="/news"
              actionLabel="Open news"
            />
          )}
        </div>
        <EventsCard events={events} />
        <LatestBlogCard blog={blog} />
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
        <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-1" />
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
          Read more <ArrowRight className="h-3 w-3" />
        </span>
      </span>
    </Link>
  );
}

function EventsCard({ events }: { events: HomeCard[] }) {
  return (
    <aside className="border-blue-100 xl:border-r xl:pr-6">
      <div className="mb-3 flex items-center justify-between gap-3">
        <SectionKicker title="Upcoming Events" />
        <Link
          href="/events"
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
          actionHref="/events"
          actionLabel="Open events"
        />
      )}
    </aside>
  );
}

function LatestBlogCard({ blog }: { blog: HomeCard | null }) {
  if (!blog) {
    return (
      <aside>
        <SectionKicker title="Latest Blog" />
        <HomeEmptyState
          title="Blog updates are being refreshed"
          body="Open the blog listing for current published articles."
          actionHref="/blogs"
          actionLabel="Open blogs"
        />
      </aside>
    );
  }

  return (
    <aside>
      <div className="mb-3 flex items-center justify-between gap-3">
        <SectionKicker title="Latest Blog" />
        <Link
          href="/blogs"
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
    <section className="relative -mx-4 min-h-[360px] overflow-hidden bg-slate-950 px-4 py-12 text-white sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 xl:-mx-10 xl:px-10 2xl:-mx-12 2xl:px-12">
      <PublicImage
        src="/images/about/about-strategic-plan-branded.webp"
        alt=""
        ratio="fill"
        sizes="100vw"
        className="absolute inset-0 h-full w-full"
        imageClassName="object-cover"
      />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(2,20,49,0.9)_0%,rgba(2,20,49,0.72)_42%,rgba(2,20,49,0.18)_100%)]" />
      <div className="relative z-10 flex min-h-[280px] max-w-7xl items-center">
        <div className="max-w-xl">
          <SectionKicker
            title="Research and Innovation"
            className="text-white"
          />
          <h2 className="mt-5 font-[family-name:var(--font-display)] text-4xl font-bold leading-tight">
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
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

function CampusLifeSection() {
  return (
    <section className="py-5">
      <SectionKicker title="Life at Kisii University" />
      <div className="mt-4 grid gap-1 sm:grid-cols-2 lg:grid-cols-4">
        {campusLife.map((item) => (
          <Link key={item.href} href={item.href} className="group block">
            <ProgressiveImageCard
              src={item.imageUrl}
              alt=""
              ratio="card"
              sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
              className="h-32 rounded-sm"
            >
              <span className="absolute bottom-2 left-3 right-3 text-center text-xs font-bold text-white drop-shadow">
                {item.title}
              </span>
            </ProgressiveImageCard>
          </Link>
        ))}
      </div>
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
  return (
    <section className="-mx-4 grid text-white sm:-mx-6 lg:-mx-8 lg:grid-cols-2 xl:-mx-10 2xl:-mx-12">
      <div className="relative overflow-hidden bg-primary p-8 sm:p-10">
        <PublicImage
          src="/logos/ksu-bck1.jpg"
          alt=""
          ratio="fill"
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="absolute inset-0 h-full w-full"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(59,130,246,0.82),rgba(59,130,246,0.56))]" />
        <div className="relative z-10">
          <h2 className="font-[family-name:var(--font-display)] text-3xl font-bold">
            Ready to start your journey?
          </h2>
          <p className="mt-2 max-w-md text-sm leading-6 text-white/85">
            Apply today and take the first step toward a brighter future at
            Kisii University.
          </p>
          <Button
            asChild
            className="mt-5 min-h-11 rounded-md bg-white px-5 text-sm font-semibold text-primary hover:bg-white/90"
          >
            <Link href="/admissions/how-to-apply">
              Apply Now
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
      <div className="relative overflow-hidden bg-secondary p-8 sm:p-10">
        <PublicImage
          src="/images/about/about-strategic-plan-branded.webp"
          alt=""
          ratio="fill"
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="absolute inset-0 h-full w-full"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(249,115,22,0.84),rgba(249,115,22,0.55))]" />
        <div className="relative z-10">
          <h2 className="font-[family-name:var(--font-display)] text-3xl font-bold">
            Partner with Kisii University
          </h2>
          <p className="mt-2 max-w-md text-sm leading-6 text-white/85">
            Collaborate in research, innovation, and community impact for a
            better tomorrow.
          </p>
          <Button
            asChild
            className="mt-5 min-h-11 rounded-md bg-white px-5 text-sm font-semibold text-secondary hover:bg-white/90"
          >
            <Link href={researchHref} {...linkProps({ href: researchHref })}>
              Partner with us
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

function ContactStrip({
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
            <row.icon className="h-4 w-4" />
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
      <Megaphone className="mx-auto h-7 w-7 text-primary" />
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
