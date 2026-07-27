import Link from "next/link";
import type { ComponentType, ReactNode } from "react";
import {
  ArrowRight,
  AlertTriangle,
  BookOpen,
  Building2,
  CalendarDays,
  ClipboardCheck,
  Facebook,
  GraduationCap,
  Instagram,
  Linkedin,
  Mail,
  MapPin,
  Megaphone,
  Newspaper,
  Phone,
  ShieldCheck,
  Sparkles,
  Users,
  Youtube,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  AmbientPageBackground,
  ScrollReveal,
  ScrollRevealGroup,
} from "@ksu/ui/components";
import { MiniHeader, PublicFooter, PublicHeader } from "@ksu/ui/layout/public";
import { CountdownStrip } from "@/components/home/countdown-strip";
import { AnimatedStatRow } from "@/components/home/animated-stat-row";
import { HomepageSections } from "@/components/home/section-renderer";
import { NewsletterSubscribeForm } from "@/components/home/newsletter-subscribe-form";
import {
  FeaturedStoriesSection,
  HeroAdmissionsSection,
} from "@/components/home/sections/composed-section-variants";
import {
  ProgressiveImageCard,
  PublicImage,
} from "@/components/public/public-image";
import { EntityInquiryLauncher } from "@/components/public/entity-inquiry-launcher";
import {
  getHomepageData,
  type HomeCard,
  type HomeIntake,
  type HomeMetric,
  type HomePartner,
  type HomeSchoolCard,
  type HomeSocialLinks,
} from "@/lib/homepage-data";
import {
  getComposedHomepage,
  type HomepageSection,
} from "@/lib/homepage-sections";
import { getNavData } from "@/lib/nav-data";
import { getPublicVcHub } from "@/lib/vice-chancellor-data";
import { libraryFrontendUrl, researchFrontendUrl } from "@/lib/service-urls";

export const revalidate = 300;

const researchHref = researchFrontendUrl;

const fallbackHomeHeroSection: HomepageSection = {
  id: "homepage-hero-fallback",
  page_key: "homepage",
  scope_type: "university",
  section_key: "hero-admissions-fallback",
  layout_variant: "hero_admissions",
  title: "Shaping Tomorrow. Inspiring Innovation.",
  subtitle: "Kisii University",
  description:
    "A leading public university committed to academic excellence, innovative research and transforming communities.",
  items: [
    {
      id: "explore-programmes",
      item_type: "cta",
      title: "Explore programmes",
      cta_label: "Explore programmes",
      cta_url: "/academics/programmes",
      display_order: 10,
      is_enabled: true,
      content: { intent: "primary" },
    },
    {
      id: "discover-kisii",
      item_type: "cta",
      title: "Discover Kisii University",
      cta_label: "Discover Kisii University",
      cta_url: "/about",
      display_order: 20,
      is_enabled: true,
      content: { intent: "secondary" },
    },
  ],
};

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

function LandingReveal({
  children,
  className,
  variant = "fade-up",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  variant?:
    | "fade-up"
    | "fade-down"
    | "fade-left"
    | "fade-right"
    | "zoom-in"
    | "zoom-out";
  delay?: number;
}) {
  return (
    <ScrollReveal className={className} variant={variant} delay={delay}>
      {children}
    </ScrollReveal>
  );
}

export default async function HomePage() {
  const [homepage, megaMenuData, composedHomepage, vcHub] = await Promise.all([
    getHomepageData(),
    getNavData(),
    getComposedHomepage(),
    getPublicVcHub(),
  ]);
  const degradedSections = [
    homepage.schools.length === 0,
    homepage.featuredProgrammes.length === 0,
    homepage.latestNews.length === 0,
    homepage.upcomingEvents.length === 0,
  ].filter(Boolean).length;
  const isContentDegraded = degradedSections >= 2;
  const hasComposedHero = composedHomepage.sections.some(
    (section) => section.layout_variant === "hero_admissions",
  );

  return (
    <div className="min-h-screen text-foreground">
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

      <AmbientPageBackground
        as="main"
        id="main-content"
        variant="academic"
        intensity="soft"
        className="overflow-x-clip"
        tabIndex={-1}
      >
        {composedHomepage.hasRenderableSections ? (
          <>
            {hasComposedHero ? null : (
              <HeroAdmissionsSection
                section={fallbackHomeHeroSection}
                hero={composedHomepage.data?.hero}
                programmeFinderData={{
                  schools: homepage.schools,
                  programmes: homepage.featuredProgrammes,
                  intakes: homepage.activeIntakes,
                }}
              />
            )}
            <HomepageSections
              sections={composedHomepage.sections}
              hero={composedHomepage.data?.hero}
              socialLinks={homepage.socialLinks}
              partnershipSpotlights={
                composedHomepage.data?.partnership_spotlights ?? []
              }
              programmeFinderData={{
                schools: homepage.schools,
                programmes: homepage.featuredProgrammes,
                intakes: homepage.activeIntakes,
              }}
              featuredStories={homepage.featuredStories}
              vcHub={vcHub}
            />
          </>
        ) : (
          <>
            <HeroAdmissionsSection
              section={fallbackHomeHeroSection}
              hero={composedHomepage.data?.hero}
              programmeFinderData={{
                schools: homepage.schools,
                programmes: homepage.featuredProgrammes,
                intakes: homepage.activeIntakes,
              }}
            />

            {/* Hero value proposition + secondary CTAs */}
            <section className="border-b border-white/10 bg-primary py-3 text-white">
              <div className="mx-auto flex max-w-[1680px] flex-wrap items-center justify-center gap-2 px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
                <p className="text-center text-xs font-medium text-white/70 sm:text-sm">
                  A public university advancing inclusive education, applied
                  research, and community transformation in Kenya.
                </p>
                <span className="hidden text-white/30 sm:inline">|</span>
                <div className="flex flex-wrap justify-center gap-2">
                  <Link
                    href={
                      homepage.activeIntakes[0]?.href ??
                      "/admissions/how-to-apply"
                    }
                    className="inline-flex min-h-[36px] items-center gap-1.5 rounded-full bg-secondary px-3 text-xs font-semibold text-white transition hover:bg-secondary/90"
                  >
                    Apply Now <ArrowRight className="h-3 w-3" aria-hidden />
                  </Link>
                  <Link
                    href="/academics/programmes"
                    className="inline-flex min-h-[36px] items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 text-xs font-semibold text-white transition hover:bg-white/20"
                  >
                    Explore Programmes{" "}
                    <ArrowRight className="h-3 w-3" aria-hidden />
                  </Link>
                  <Link
                    href="/campus-life"
                    className="inline-flex min-h-[36px] items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 text-xs font-semibold text-white transition hover:bg-white/20"
                  >
                    Explore Campus Life{" "}
                    <ArrowRight className="h-3 w-3" aria-hidden />
                  </Link>
                </div>
              </div>
            </section>

            {/* Audience / Action Band */}
            <section className="border-y border-border bg-white py-8 lg:py-12">
              <div className="mx-auto max-w-[1680px] px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
                <div className="grid gap-5 sm:grid-cols-3">
                  {/* Prospective Students */}
                  <div className="rounded-xl border border-border bg-accent/60 p-5">
                    <p className="text-xs font-bold uppercase tracking-[0.1em] text-primary">
                      Prospective Students
                    </p>
                    <div className="mt-4 space-y-1">
                      {[
                        {
                          label: "Apply Now",
                          href:
                            homepage.activeIntakes[0]?.href ??
                            "/admissions/how-to-apply",
                          icon: ClipboardCheck,
                          accent: true,
                        },
                        {
                          label: "Explore Programmes",
                          href: "/academics/programmes",
                          icon: GraduationCap,
                        },
                        {
                          label: "Entry Requirements",
                          href: "/admissions/requirements",
                          icon: BookOpen,
                        },
                      ].map((item) => (
                        <Link
                          key={item.label}
                          href={item.href}
                          className={`flex min-h-[44px] items-center gap-3 rounded-md px-2.5 py-2.5 text-sm font-semibold transition ${item.accent ? "bg-secondary/10 text-secondary hover:bg-secondary/20" : "text-muted-foreground hover:bg-accent hover:text-primary"}`}
                        >
                          <item.icon className="h-4 w-4 shrink-0" />
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  </div>

                  {/* Current Students & Staff */}
                  <div className="rounded-xl border border-border bg-white p-5 shadow-sm">
                    <p className="text-xs font-bold uppercase tracking-[0.1em] text-primary">
                      Students & Staff
                    </p>
                    <div className="mt-4 space-y-1">
                      {[
                        {
                          label: "Student Portal",
                          href: "https://portal.kisiiuniversity.ac.ke",
                          icon: Users,
                          external: true,
                        },
                        {
                          label: "Staff Portal",
                          href: "https://digital.kisiiuniversity.ac.ke/staff/services/login",
                          icon: Building2,
                          external: true,
                        },
                        {
                          label: "Library",
                          href: libraryFrontendUrl,
                          icon: BookOpen,
                          external: true,
                        },
                      ].map((item) => (
                        <a
                          key={item.label}
                          href={item.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex min-h-[44px] items-center gap-3 rounded-md px-2.5 py-2.5 text-sm font-semibold text-muted-foreground transition hover:bg-accent hover:text-primary"
                        >
                          <item.icon className="h-4 w-4 shrink-0" />
                          {item.label}
                        </a>
                      ))}
                    </div>
                  </div>

                  {/* Parents & Guardians */}
                  <div className="rounded-xl border border-border bg-white p-5 shadow-sm">
                    <p className="text-xs font-bold uppercase tracking-[0.1em] text-primary">
                      Parents & Guardians
                    </p>
                    <div className="mt-4 space-y-1">
                      {[
                        {
                          label: "Safety & Wellbeing",
                          href: "/campus-life/support",
                          icon: ShieldCheck,
                        },
                        {
                          label: "Fees & Scholarships",
                          href: "/admissions/fees",
                          icon: CalendarDays,
                        },
                        {
                          label: "Contact Admissions",
                          href: "/contact",
                          icon: Phone,
                        },
                      ].map((item) => (
                        <Link
                          key={item.label}
                          href={item.href}
                          className="flex min-h-[44px] items-center gap-3 rounded-md px-2.5 py-2.5 text-sm font-semibold text-muted-foreground transition hover:bg-accent hover:text-primary"
                        >
                          <item.icon className="h-4 w-4 shrink-0" />
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {isContentDegraded ? <ContentDegradedNotice /> : null}

            <WhyChooseSection
              facts={homepage.facts}
              applyHref={
                homepage.activeIntakes[0]?.href ?? "/admissions/how-to-apply"
              }
            />

            <section className="relative z-10 pb-0">
              <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
                <AcademicsPathwaySection
                  schools={homepage.schools}
                  activeIntakes={homepage.activeIntakes}
                />
                <LandingReveal>
                  <FeaturedStoriesSection stories={homepage.featuredStories} />
                </LandingReveal>
                <LandingReveal variant="fade-left">
                  <LatestContentSection
                    newsItems={homepage.latestNews}
                    events={homepage.upcomingEvents}
                    blog={homepage.latestBlog}
                    socialLinks={homepage.socialLinks}
                  />
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
          </>
        )}
      </AmbientPageBackground>

      {/* Mobile Sticky CTA Bar */}
      <nav
        className="fixed inset-x-0 bottom-0 z-40 flex items-stretch gap-1 border-t border-border bg-white/95 px-2 py-2 backdrop-blur sm:hidden"
        aria-label="Quick actions"
        style={{ paddingBottom: "max(0.5rem, env(safe-area-inset-bottom))" }}
      >
        {[
          {
            label: "Apply",
            href: homepage.activeIntakes[0]?.href ?? "/admissions/how-to-apply",
          },
          { label: "Programmes", href: "/academics/programmes" },
          { label: "Contact", href: "/contact" },
        ].map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className="flex flex-1 items-center justify-center rounded-md bg-primary px-3 py-2.5 text-xs font-semibold text-white transition hover:bg-primary/90"
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <PublicFooter
        contactInfo={homepage.contactInfo}
        socialLinks={homepage.socialLinks}
        researchHref={researchFrontendUrl}
        libraryHref={libraryFrontendUrl}
      />
      <EntityInquiryLauncher
        target={{
          type: "university",
          slug: "kisii-university",
          name: "Kisii University",
        }}
        aboveMobileNavigation
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

function WhyChooseSection({
  facts,
  applyHref,
}: {
  facts: HomeMetric[];
  applyHref: string;
}) {
  const reasons = [
    {
      title: "Accredited Public University",
      body: "Chartered in 2013 under the Universities Act 2012, delivering regulated, quality-assured higher education.",
      icon: Building2,
    },
    {
      title: "Diverse Programmes",
      body: "Academic programmes across schools from certificates to doctoral research.",
      icon: GraduationCap,
    },
    {
      title: "Research with Community Impact",
      body: "Research connected to agriculture, health, education, technology, and public service priorities.",
      icon: Sparkles,
    },
    {
      title: "Student Support Services",
      body: "Accommodation, health services, clubs, sports, counselling, and career guidance.",
      icon: ShieldCheck,
    },
  ] satisfies Array<{ title: string; body: string; icon: LucideIcon }>;

  return (
    <section className="border-b border-border bg-[linear-gradient(180deg,hsl(var(--surface-subtle))_0%,#ffffff_100%)] px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      <div className="mx-auto grid max-w-[1680px] gap-8 xl:grid-cols-[minmax(0,1fr)_360px]">
        <LandingReveal variant="fade-right">
          <div>
            <p className="text-sm font-semibold uppercase text-secondary">
              Why Choose KSU
            </p>
            <h2 className="mt-2 max-w-3xl font-[family-name:var(--font-display)] text-3xl font-semibold text-foreground sm:text-4xl">
              Why choose Kisii University
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-muted-foreground">
              A student-focused public university combining accredited
              programmes, applied research, and practical support from
              application to graduation.
            </p>
          </div>
          <ScrollRevealGroup
            className="mt-7 grid gap-4 sm:grid-cols-2"
            variant="fade-up"
            staggerDelay={70}
          >
            {reasons.map((item) => (
              <div
                key={item.title}
                className="rounded-md border border-border bg-white p-5 shadow-sm shadow-primary/60 transition duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-md bg-accent text-primary ring-1 ring-border">
                  <item.icon className="h-5 w-5" aria-hidden />
                </span>
                <h3 className="mt-4 font-[family-name:var(--font-display)] text-lg font-semibold text-foreground">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {item.body}
                </p>
              </div>
            ))}
          </ScrollRevealGroup>
          {facts.length ? (
            <LandingReveal className="mt-6" variant="zoom-in" delay={90}>
              <AnimatedStatRow facts={facts} />
            </LandingReveal>
          ) : null}
        </LandingReveal>

        <LandingReveal variant="fade-left" delay={120}>
          <aside className="rounded-md border border-border bg-primary p-6 text-white shadow-lg shadow-primary/10 xl:sticky xl:top-24">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-white/70">
              Admissions support
            </p>
            <h3 className="mt-3 font-[family-name:var(--font-display)] text-2xl font-semibold">
              Ready to find your path at KSU?
            </h3>
            <p className="mt-3 text-sm leading-6 text-white/75">
              Explore available programmes, confirm requirements, and contact
              the admissions team for guidance before you submit.
            </p>
            <div className="mt-6 grid gap-3">
              <Link
                href={applyHref}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-secondary px-4 text-sm font-semibold text-white transition hover:bg-secondary/90"
              >
                Apply Now
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
              <Link
                href="/contact"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-white/20 bg-white/10 px-4 text-sm font-semibold text-white transition hover:bg-white/20"
              >
                Contact Us
                <Mail className="h-4 w-4" aria-hidden />
              </Link>
            </div>
          </aside>
        </LandingReveal>
      </div>
    </section>
  );
}

function AcademicsPathwaySection({
  schools,
  activeIntakes,
}: {
  schools: HomeSchoolCard[];
  activeIntakes: HomeIntake[];
}) {
  const activeIntake = activeIntakes[0] ?? null;
  const activeDeadline =
    activeIntake?.lateApplicationEnd ?? activeIntake?.applicationEnd;
  const shouldShowCountdown = hasFutureDeadline(activeDeadline);
  const journey = [
    {
      step: "01",
      title: "Choose programme",
      body: "Compare schools, levels, delivery modes, and programme fit.",
      href: "/academics/programmes",
    },
    {
      step: "02",
      title: "Check requirements",
      body: "Confirm entry criteria, intake eligibility, and required records.",
      href: "/admissions/requirements",
    },
    {
      step: "03",
      title: "Confirm intake",
      body:
        activeIntake && shouldShowCountdown
          ? `Apply for the ${intakeLabel(activeIntake)} before the deadline.`
          : "Review the admission guide and prepare your application documents.",
      href: activeIntake?.href ?? "/admissions/intakes",
    },
    {
      step: "04",
      title: "Apply and submit",
      body: "Complete the official application route and submit documents.",
      href: activeIntake?.href ?? "/admissions/how-to-apply",
      accent: true,
    },
  ];

  return (
    <section className="border-b border-border bg-white py-12 lg:py-14">
      <div className="mx-auto max-w-[1680px]">
        <LandingReveal>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase text-secondary">
                Academics and Admissions
              </p>
              <h2 className="mt-2 font-[family-name:var(--font-display)] text-3xl font-semibold text-foreground sm:text-4xl">
                Schools, programmes, and your application journey
              </h2>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-muted-foreground">
                Browse schools with sample programmes, scan highlighted academic
                routes, and move straight into the admission steps.
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
        </LandingReveal>

        <div className="mt-8 grid gap-5 xl:grid-cols-[minmax(0,1.45fr)_minmax(340px,0.75fr)]">
          <LandingReveal variant="fade-right">
            <div className="rounded-md border border-border bg-accent/40 p-4">
              <div className="flex items-center justify-between gap-3">
                <SectionKicker title="Schools" />
                <Link
                  href="/academics/schools"
                  className="text-xs font-bold text-primary hover:text-secondary"
                >
                  View all
                </Link>
              </div>
              {schools.length ? (
                <ScrollRevealGroup
                  className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3"
                  variant="fade-up"
                  staggerDelay={55}
                >
                  {schools.slice(0, 6).map((school) => (
                    <SchoolCard key={school.href} school={school} />
                  ))}
                </ScrollRevealGroup>
              ) : (
                <div className="mt-5">
                  <HomeEmptyState
                    title="Schools are not available"
                    body="Published school records could not be loaded right now."
                    actionHref="/academics/schools"
                    actionLabel="Open schools"
                  />
                </div>
              )}
            </div>
          </LandingReveal>

          <LandingReveal variant="fade-left" delay={80}>
            <div className="h-full rounded-md border border-border bg-brand-overlay p-4 text-white shadow-lg shadow-primary/10">
              <SectionKicker
                title="Application Journey"
                className="text-white"
              />
              <div className="mt-5 grid gap-3">
                {journey.map((item) => (
                  <Link
                    key={item.step}
                    href={item.href}
                    className={`group rounded-md border p-3 transition ${
                      item.accent
                        ? "border-secondary/50 bg-secondary/15 hover:bg-secondary/25"
                        : "border-white/10 bg-white/5 hover:bg-white/10"
                    }`}
                  >
                    <span className="text-xs font-bold text-secondary">
                      {item.step}
                    </span>
                    <h3 className="mt-1 text-sm font-bold text-white">
                      {item.title}
                    </h3>
                    <p className="mt-1 text-xs leading-5 text-white/70">
                      {item.body}
                    </p>
                  </Link>
                ))}
              </div>
              <div className="mt-5 rounded-md border border-white/10 bg-white p-4 text-foreground">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-secondary">
                  {activeIntake && shouldShowCountdown
                    ? "Applications Open"
                    : "Admissions"}
                </p>
                <h3 className="mt-2 font-[family-name:var(--font-display)] text-xl font-semibold">
                  {activeIntake && shouldShowCountdown
                    ? `${intakeLabel(activeIntake)} is currently open`
                    : "Prepare your application for the next intake"}
                </h3>
                <p className="mt-2 text-xs leading-5 text-muted-foreground">
                  {activeIntake && shouldShowCountdown
                    ? `Application deadline: ${formatDate(activeDeadline)}.`
                    : "Review the guide, compare programmes, and contact admissions for current routes."}
                </p>
                <div className="mt-4 grid gap-2">
                  <Link
                    href={activeIntake?.href ?? "/admissions/how-to-apply"}
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-white transition hover:bg-primary/90"
                  >
                    Apply Now
                    <ArrowRight className="h-4 w-4" aria-hidden />
                  </Link>
                  <Link
                    href="/contact"
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-border bg-white px-4 text-sm font-semibold text-primary transition hover:bg-accent"
                  >
                    Contact Us
                    <Mail className="h-4 w-4" aria-hidden />
                  </Link>
                </div>
                {activeIntake && shouldShowCountdown && activeDeadline ? (
                  <div className="mt-4 overflow-hidden rounded-md">
                    <CountdownStrip
                      title={`${intakeLabel(activeIntake)} Countdown`}
                      deadline={activeDeadline}
                      deadlineLabel={formatDate(activeDeadline)}
                      compact
                    />
                  </div>
                ) : null}
              </div>
            </div>
          </LandingReveal>
        </div>
      </div>
    </section>
  );
}

function hasFutureDeadline(value?: string | null) {
  if (!value) return false;
  const deadline = new Date(value);
  if (Number.isNaN(deadline.getTime())) return false;
  return deadline.getTime() > Date.now();
}

function SchoolCard({ school }: { school: HomeSchoolCard }) {
  return (
    <article className="group h-full overflow-hidden rounded-md border border-border bg-white shadow-sm shadow-primary/60 transition duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md hover:shadow-primary">
      <Link
        href={school.href}
        className="block"
        aria-label={`View ${school.title}`}
      >
        <PublicImage
          src={school.imageUrl}
          alt=""
          ratio="card"
          fallbackContent={<GraduationCap className="h-8 w-8" aria-hidden />}
          sizes="(min-width: 1280px) 28vw, (min-width: 768px) 42vw, 100vw"
          className="h-28"
          imageClassName="transition duration-500 group-hover:scale-105"
        />
      </Link>
      <div className="p-4">
        <Link href={school.href} className="block">
          <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-secondary">
            {school.eyebrow ?? "School"}
          </span>
          <h3 className="mt-1 line-clamp-2 font-[family-name:var(--font-display)] text-lg font-semibold leading-6 text-foreground transition group-hover:text-primary">
            {school.title}
          </h3>
          <p className="mt-2 line-clamp-2 text-xs leading-5 text-muted-foreground">
            {school.body}
          </p>
        </Link>
        <div className="mt-4 border-t border-border pt-3">
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
            Featured programmes
          </p>
          {school.programmes.length ? (
            <div className="mt-2 grid gap-1.5">
              {school.programmes.map((programme) => (
                <Link
                  key={programme.href}
                  href={programme.href}
                  className="flex min-h-9 items-center justify-between gap-2 rounded-md px-2 py-1.5 text-xs font-semibold text-muted-foreground transition hover:bg-accent hover:text-primary"
                >
                  <span className="line-clamp-1">{programme.title}</span>
                  <ArrowRight className="h-3 w-3 shrink-0" aria-hidden />
                </Link>
              ))}
            </div>
          ) : (
            <Link
              href={school.href}
              className="mt-2 inline-flex min-h-9 items-center gap-2 rounded-md px-2 text-xs font-semibold text-primary transition hover:bg-accent"
            >
              Browse school programmes
              <ArrowRight className="h-3 w-3" aria-hidden />
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}

function SectionKicker({
  title,
  className = "text-foreground",
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
  socialLinks,
}: {
  newsItems: HomeCard[];
  events: HomeCard[];
  blog: HomeCard | null;
  socialLinks: HomeSocialLinks;
}) {
  const stories = [...newsItems.slice(0, 3), ...(blog ? [blog] : [])];
  const featured = stories[0];
  const latestStories = stories.slice(1, 4);

  return (
    <section className="-mx-4 border-b border-primary/10 bg-[linear-gradient(180deg,hsl(var(--surface-subtle))_0%,#ffffff_54%,hsl(var(--surface-muted))_100%)] px-4 py-12 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 xl:-mx-10 xl:px-10 2xl:-mx-12 2xl:px-12">
      <div className="mx-auto max-w-[1680px]">
        <div className="mb-7 grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.34em] text-primary">
              Kisii University Updates
            </p>
            <span className="mt-2 block h-px w-16 bg-secondary" />
            <h2 className="mt-3 font-[family-name:var(--font-display)] text-4xl font-bold leading-[0.95] text-primary sm:text-5xl lg:text-6xl">
              Stories, News &amp; Events
            </h2>
            <p className="mt-4 max-w-3xl text-base leading-7 text-muted-foreground">
              Discover what is happening across campus—partnerships that create
              impact, achievements that inspire, and events that bring us
              together.
            </p>
          </div>
          <nav
            className="flex flex-wrap items-center gap-4 text-sm font-bold text-primary sm:gap-7"
            aria-label="University updates"
          >
            {[
              ["News", "/media/news"],
              ["Events", "/media/events"],
              ["Articles", "/media/articles"],
            ].map(([label, href], index) => (
              <Link
                key={href}
                href={href}
                className={`group inline-flex min-h-11 items-center gap-3 ${
                  index > 0 ? "sm:border-l sm:border-primary/20 sm:pl-7" : ""
                }`}
              >
                {label}
                <ArrowRight className="h-4 w-4 text-secondary transition group-hover:translate-x-1" />
              </Link>
            ))}
          </nav>
        </div>

        <div className="grid items-stretch gap-6 xl:grid-cols-[minmax(0,1.08fr)_minmax(280px,0.72fr)_minmax(300px,0.78fr)]">
          {featured ? (
            <FeaturedStory item={featured} />
          ) : (
            <HomeEmptyState
              title="Stories are being refreshed"
              body="Open the news listing for current published university updates."
              actionHref="/media/news"
              actionLabel="Open news"
            />
          )}

          <div className="min-w-0 bg-white/50 p-0 xl:px-2">
            <SectionKicker title="Latest stories" className="text-primary" />
            {latestStories.length ? (
              <div className="mt-5 divide-y divide-primary/10">
                {latestStories.map((item) => (
                  <StoryListItem key={item.href} item={item} />
                ))}
              </div>
            ) : (
              <HomeEmptyState
                title="More stories are being refreshed"
                body="Open the media centre for the latest records."
                actionHref="/media/news"
                actionLabel="Open media centre"
              />
            )}
          </div>

          <UpcomingEventsPanel events={events} />
        </div>

        <div className="mt-8 grid gap-6 rounded-md border border-primary/10 bg-white/80 px-5 py-5 shadow-sm xl:grid-cols-[minmax(0,1fr)_1px_minmax(420px,0.75fr)] xl:items-center xl:px-8">
          <div className="grid gap-4 md:grid-cols-[auto_minmax(0,280px)_minmax(280px,1fr)] md:items-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-white shadow-lg shadow-primary/20">
              <Mail className="h-7 w-7" aria-hidden />
            </span>
            <div>
              <h3 className="font-[family-name:var(--font-display)] text-2xl font-bold text-primary">
                Subscribe to updates
              </h3>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                Get the latest news, events, and stories straight to your inbox.
              </p>
            </div>
            <NewsletterSubscribeForm />
          </div>
          <span className="hidden h-24 w-px bg-primary/15 xl:block" />
          <div className="grid gap-4 sm:grid-cols-2">
            <Link
              href="/contact"
              className="group flex items-center gap-4 rounded-md p-2 transition hover:bg-primary/5"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-white shadow-lg shadow-primary/20">
                <Phone className="h-5 w-5" aria-hidden />
              </span>
              <span>
                <span className="block font-[family-name:var(--font-display)] text-xl font-bold text-primary">
                  Contact us
                </span>
                <span className="mt-1 block text-sm leading-5 text-muted-foreground">
                  Reach the university for official support and enquiries.
                </span>
                <span className="mt-1 inline-flex items-center gap-2 text-sm font-bold text-secondary">
                  Get in touch
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                </span>
              </span>
            </Link>
            <Link
              href="/contact"
              className="group flex items-center gap-4 rounded-md p-2 transition hover:bg-primary/5"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-secondary text-white shadow-lg shadow-secondary/25">
                <Newspaper className="h-5 w-5" aria-hidden />
              </span>
              <span>
                <span className="block font-[family-name:var(--font-display)] text-xl font-bold text-primary">
                  Submit a story
                </span>
                <span className="mt-1 block text-sm leading-5 text-muted-foreground">
                  Share a story with Corporate Communication.
                </span>
                <span className="mt-1 inline-flex items-center gap-2 text-sm font-bold text-secondary">
                  Submit story
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                </span>
              </span>
            </Link>
            <SocialMediaLinks links={socialLinks} className="sm:col-span-2" />
          </div>
        </div>
      </div>
    </section>
  );
}

function SocialMediaLinks({
  links,
  className,
}: {
  links: HomeSocialLinks;
  className?: string;
}) {
  type SocialLinkItem = {
    label: string;
    href?: string;
    icon: ComponentType<{ className?: string }>;
    colorClassName: string;
  };
  const allItems: SocialLinkItem[] = [
    {
      label: "Facebook",
      href: links.facebook,
      icon: Facebook,
      colorClassName: "text-[#1877F2]",
    },
    {
      label: "X",
      href: links.twitter,
      icon: XSocialIcon,
      colorClassName: "text-black",
    },
    {
      label: "Instagram",
      href: links.instagram,
      icon: Instagram,
      colorClassName: "text-[#E4405F]",
    },
    {
      label: "YouTube",
      href: links.youtube,
      icon: Youtube,
      colorClassName: "text-[#FF0000]",
    },
    {
      label: "LinkedIn",
      href: links.linkedin,
      icon: Linkedin,
      colorClassName: "text-[#0A66C2]",
    },
  ];
  const items = allItems.filter(
    (item): item is SocialLinkItem & { href: string } => Boolean(item.href),
  );

  if (!items.length) return null;

  return (
    <div className={className}>
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
        Follow Kisii University
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {items.map(({ label, href, icon: Icon, colorClassName }) => (
          <a
            key={label}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Follow Kisii University on ${label}`}
            className={[
              "inline-flex h-10 w-10 items-center justify-center rounded-full border border-primary/15 bg-white transition hover:border-current hover:bg-surface-subtle",
              colorClassName,
            ].join(" ")}
          >
            <Icon className="h-4 w-4" aria-hidden />
          </a>
        ))}
      </div>
    </div>
  );
}

function XSocialIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M17.53 3H21l-7.58 8.66L22.34 21h-6.99l-5.47-6.74L3.62 21H.15l8.1-9.25L-.3 3h7.16l4.95 6.18L17.53 3Zm-1.22 16.35h1.92L5.81 4.56H3.75l12.56 14.79Z" />
    </svg>
  );
}

function FeaturedStory({ item }: { item: HomeCard }) {
  return (
    <Link
      href={item.href}
      className="group relative block min-h-[360px] overflow-hidden rounded-md bg-primary text-white sm:min-h-[420px] xl:h-full"
    >
      <PublicImage
        src={item.imageUrl}
        alt=""
        ratio="fill"
        fallbackSrc="/logos/ksu-bck1.jpg"
        fallbackContent={<Newspaper className="h-10 w-10" aria-hidden />}
        sizes="(min-width: 1280px) 42vw, 100vw"
        className="absolute inset-0 h-full w-full"
        imageClassName="object-cover transition duration-700 group-hover:scale-105"
      />
      <span className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.05)_10%,rgba(0,53,37,0.88)_100%)]" />
      <span className="absolute inset-x-0 bottom-0 z-10 p-5 sm:p-7">
        <span className="flex flex-wrap items-center gap-3 text-sm font-semibold">
          <span className="rounded-full bg-secondary px-3 py-1 text-white">
            {item.eyebrow ?? "Story"}
          </span>
          {item.meta ? (
            <span className="text-white/85">{item.meta}</span>
          ) : null}
        </span>
        <span className="mt-4 block font-[family-name:var(--font-display)] text-2xl font-bold leading-tight sm:text-3xl">
          {item.title}
        </span>
        <span className="mt-2 block max-w-2xl text-sm leading-6 text-white/85">
          {item.body}
        </span>
        <span className="mt-5 inline-flex items-center gap-3 text-sm font-bold text-secondary">
          Read story
          <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
        </span>
      </span>
    </Link>
  );
}

function StoryListItem({ item }: { item: HomeCard }) {
  return (
    <Link
      href={item.href}
      className="group grid min-w-0 grid-cols-[84px_minmax(0,1fr)] gap-3 py-4 sm:grid-cols-[116px_minmax(0,1fr)_auto] sm:gap-4"
    >
      <PublicImage
        src={item.imageUrl}
        alt=""
        ratio="news"
        fallbackSrc="/logos/ksu-bck5.jpg"
        fallbackContent={<Newspaper className="h-5 w-5" aria-hidden />}
        sizes="116px"
        className="h-20 rounded-sm sm:h-24"
        imageClassName="object-cover"
      />
      <span className="min-w-0">
        <span className="flex flex-wrap items-center gap-3 text-[11px] font-bold uppercase tracking-[0.12em] text-primary">
          <span>{item.eyebrow ?? "Update"}</span>
          {item.meta ? (
            <span className="font-medium normal-case tracking-normal text-muted-foreground">
              {item.meta}
            </span>
          ) : null}
        </span>
        <span className="mt-2 line-clamp-2 block font-[family-name:var(--font-display)] text-lg font-bold leading-5 text-foreground transition group-hover:text-primary">
          {item.title}
        </span>
        <span className="mt-2 line-clamp-2 block text-sm leading-5 text-muted-foreground">
          {item.body}
        </span>
      </span>
      <ArrowRight className="mt-10 hidden h-5 w-5 text-secondary transition group-hover:translate-x-1 sm:block" />
    </Link>
  );
}

function UpcomingEventsPanel({ events }: { events: HomeCard[] }) {
  return (
    <aside className="h-full rounded-md bg-primary px-5 py-6 text-white shadow-xl shadow-primary/15 sm:px-7">
      <SectionKicker title="Upcoming events" className="text-white" />
      {events.length ? (
        <div className="relative mt-6 space-y-0 pl-5 before:absolute before:left-[11px] before:top-4 before:h-[calc(100%-2rem)] before:w-px before:bg-secondary">
          {events.slice(0, 3).map((event) => (
            <EventAgendaItem key={event.href} event={event} />
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
      <Link
        href="/media/events"
        className="mt-6 inline-flex min-h-11 items-center gap-3 border-t border-white/15 pt-5 text-sm font-bold text-white hover:text-secondary"
      >
        View all events
        <ArrowRight className="h-4 w-4" aria-hidden />
      </Link>
    </aside>
  );
}

function EventAgendaItem({ event }: { event: HomeCard }) {
  const { month, day, weekday, detail } = eventDateParts(event.meta);

  return (
    <Link
      href={event.href}
      className="group relative grid grid-cols-[60px_minmax(0,1fr)] gap-4 border-b border-white/15 py-5 sm:grid-cols-[72px_minmax(0,1fr)_auto] sm:gap-5"
    >
      <span className="absolute -left-[19px] top-1/2 h-4 w-4 -translate-y-1/2 rounded-full border-2 border-secondary bg-primary" />
      <span className="rounded-md bg-white px-2 py-3 text-center text-primary shadow-sm">
        <span className="block text-xs font-bold uppercase tracking-[0.18em]">
          {month}
        </span>
        <span className="block font-[family-name:var(--font-display)] text-3xl font-bold leading-none">
          {day}
        </span>
        <span className="block text-xs font-bold uppercase">{weekday}</span>
      </span>
      <span className="min-w-0">
        <span className="block font-[family-name:var(--font-display)] text-xl font-bold leading-tight text-secondary">
          {event.title}
        </span>
        <span className="mt-3 flex items-center gap-2 text-sm text-white/85">
          <CalendarDays className="h-4 w-4" aria-hidden />
          {detail.time}
        </span>
        {detail.location ? (
          <span className="mt-2 flex items-center gap-2 text-sm text-white/85">
            <MapPin className="h-4 w-4" aria-hidden />
            {detail.location}
          </span>
        ) : null}
      </span>
      <ArrowRight className="mt-10 hidden h-5 w-5 text-secondary transition group-hover:translate-x-1 sm:block" />
    </Link>
  );
}

function eventDateParts(meta?: string | null) {
  const [dateText, locationText] = (meta ?? "").split(" · ");
  const date = new Date(dateText ?? "");
  if (Number.isNaN(date.getTime())) {
    return {
      month: "Event",
      day: "",
      weekday: "",
      detail: {
        time: dateText || "Time to be confirmed",
        location: locationText,
      },
    };
  }

  return {
    month: date.toLocaleDateString("en-KE", { month: "short" }),
    day: date.toLocaleDateString("en-KE", { day: "2-digit" }),
    weekday: date.toLocaleDateString("en-KE", { weekday: "short" }),
    detail: {
      time: date.toLocaleTimeString("en-KE", {
        hour: "numeric",
        minute: "2-digit",
      }),
      location: locationText,
    },
  };
}

function CampusLifeSection() {
  return (
    <section className="border-b border-border bg-white py-12">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <SectionKicker title="Life at Kisii University" />
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
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
            className={`group min-w-0 overflow-hidden rounded-md border border-border bg-white shadow-sm shadow-primary/60 transition duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md ${
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
                <h3 className="mb-2 font-[family-name:var(--font-display)] text-xl font-bold text-foreground">
                  {item.title}
                </h3>
              ) : null}
              <p className="line-clamp-3 text-sm leading-6 text-muted-foreground">
                {item.body}
              </p>
              <span className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-primary">
                Open section
                <ArrowRight
                  className="h-3.5 w-3.5 transition group-hover:translate-x-1"
                  aria-hidden
                />
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
    <section className="border-y border-border bg-white py-5">
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
    <section className="-mx-4 bg-brand-overlay px-4 py-12 text-white sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 xl:-mx-10 xl:px-10 2xl:-mx-12 2xl:px-12">
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
                <ArrowRight
                  className="h-4 w-4 transition group-hover:translate-x-1"
                  aria-hidden
                />
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
    <section className="mt-5 grid gap-3 rounded-md border border-border bg-white p-3 shadow-sm shadow-primary/60 sm:grid-cols-2 lg:grid-cols-4">
      {rows.map((row) => (
        <div key={row.label} className="flex gap-3 rounded-md p-2">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-accent text-primary">
            <row.icon className="h-4 w-4" aria-hidden />
          </span>
          <span className="min-w-0">
            <span className="block text-xs font-bold text-foreground">
              {row.label}
            </span>
            <span className="mt-1 block break-words text-sm font-semibold leading-5 text-muted-foreground">
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
    <div className="rounded-md border border-dashed border-border bg-white/80 p-6 text-center">
      <Megaphone className="mx-auto h-7 w-7 text-primary" aria-hidden />
      <h3 className="mt-3 text-sm font-bold text-foreground">{title}</h3>
      <p className="mt-2 text-xs leading-5 text-muted-foreground">{body}</p>
      <div className="mt-4 flex flex-col justify-center gap-2 sm:flex-row">
        <Link
          href={actionHref}
          target={external ? "_blank" : undefined}
          rel={external ? "noopener noreferrer" : undefined}
          className="inline-flex min-h-11 items-center justify-center rounded-md border border-border bg-white px-3 text-xs font-bold text-primary transition hover:bg-accent"
        >
          {actionLabel}
        </Link>
        <Link
          href="/contact"
          className="inline-flex min-h-11 items-center justify-center rounded-md border border-border bg-white px-3 text-xs font-bold text-primary transition hover:bg-accent"
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
