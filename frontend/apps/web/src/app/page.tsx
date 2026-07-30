import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight, AlertTriangle, Mail, Phone, Newspaper } from "lucide-react";
import {
  AmbientPageBackground,
  ScrollReveal,
  ScrollRevealGroup,
} from "@ksu/ui/components";
import { MiniHeader, PublicFooter, PublicHeader } from "@ksu/ui/layout/public";
import { ReducedMotionProvider } from "@ksu/ui/motion";
import {
  VideoHero,
  NumbersFactsSection,
  StrategicPartnershipSection,
  AudienceBandSection,
  FeaturedStoriesGrid,
  LifeAtKsuSection,
  ResearchSection,
  PartnersMarquee,
  JourneyCtaSection,
} from "@/components/home/landing-sections";
import { CountdownStrip } from "@/components/home/countdown-strip";
import { HomepageSections } from "@/components/home/section-renderer";
import { NewsletterSubscribeForm } from "@/components/home/newsletter-subscribe-form";
import {
  FeaturedStoriesSection,
  HeroAdmissionsSection,
} from "@/components/home/sections/composed-section-variants";
import { PublicImage } from "@/components/public/public-image";
import { EntityInquiryLauncher } from "@/components/public/entity-inquiry-launcher";
import {
  getHomepageData,
  type HomeCard,
  type HomeIntake,
  type HomeMetric,
} from "@/lib/homepage-data";
import {
  getComposedHomepage,
  type HomepageSection,
} from "@/lib/homepage-sections";
import { getNavData } from "@/lib/nav-data";
import { getPublicVcHub } from "@/lib/vice-chancellor-data";
import {
  heriAfricaFrontendUrl,
  libraryFrontendUrl,
  researchFrontendUrl,
} from "@/lib/service-urls";

export const revalidate = 300;

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

const heroSlides = [
  {
    id: "main-hero",
    videoSrc: "/videos/ksu-campus-hero.mp4",
    posterSrc: "/logos/ksu-bck1.jpg",
    eyebrow: "Kisii University",
    title: "Shaping Tomorrow. Inspiring Innovation.",
    subtitle:
      "A leading public university committed to academic excellence, innovative research, and transforming communities across Kenya and beyond.",
    primaryCta: { label: "Study With Us", href: "/admissions/how-to-apply" },
    secondaryCta: { label: "Explore Programmes", href: "/academics/programmes" },
    tertiaryCta: { label: "Discover KSU", href: "/about" },
  },
];

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
  const isContentDegraded =
    [
      homepage.schools.length === 0,
      homepage.featuredProgrammes.length === 0,
      homepage.latestNews.length === 0,
      homepage.upcomingEvents.length === 0,
    ].filter(Boolean).length >= 2;

  const hasComposedHero = composedHomepage.sections.some(
    (section) => section.layout_variant === "hero_admissions"
  );

  const stats = buildStats(homepage.facts);

  return (
    <ReducedMotionProvider>
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
          heriHref={heriAfricaFrontendUrl}
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
                    activeIntakeProgrammes: homepage.activeIntakeProgrammes,
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
                  activeIntakeProgrammes: homepage.activeIntakeProgrammes,
                }}
                featuredStories={homepage.featuredStories}
                vcHub={vcHub}
              />
            </>
          ) : (
            <>
              {/* 1. Video Hero */}
              <VideoHero slides={heroSlides} />

              {/* 2. Numbers/Facts Strip - only if we have data */}
              {stats.length > 0 && <NumbersFactsSection stats={stats} />}

              {/* 3. Strategic Partnership */}
              <StrategicPartnershipSection />

              {/* 4. Audience Band */}
              <AudienceBandSection />

              {isContentDegraded && <ContentDegradedNotice />}

              {/* 5. Featured Stories - only if we have stories */}
              {homepage.featuredStories.length > 0 && (
                <FeaturedStoriesGrid stories={homepage.featuredStories} />
              )}

              {/* 6. Life at KSU */}
              <LifeAtKsuSection />

              {/* 7. News & Events - only if we have content */}
              {(homepage.latestNews.length > 0 ||
                homepage.upcomingEvents.length > 0 ||
                homepage.latestBlog) && (
                <LandingReveal>
                  <LatestContentSection
                    newsItems={homepage.latestNews}
                    events={homepage.upcomingEvents}
                    blog={homepage.latestBlog}
                  />
                </LandingReveal>
              )}

              {/* 8. Research */}
              <ResearchSection />

              {/* 9. Partners - only if we have partners */}
              {homepage.partners.length > 0 && (
                <PartnersMarquee partners={homepage.partners} />
              )}

              {/* 10. Journey CTA */}
              <JourneyCtaSection />
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
    </ReducedMotionProvider>
  );
}

function buildStats(facts: HomeMetric[]) {
  if (facts.length === 0) return [];

  return facts
    .slice(0, 6)
    .map((fact) => {
      const numericValue = parseInt(fact.value.replace(/[^0-9]/g, ""), 10) || 0;
      if (numericValue === 0) return null;
      const hasSuffix = fact.value.includes("+") || fact.value.includes("K");
      return {
        value: numericValue,
        suffix: hasSuffix ? "+" : undefined,
        label: fact.label,
        description: fact.detail,
      };
    })
    .filter((stat): stat is NonNullable<typeof stat> => stat !== null);
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
        </div>
      </div>
    </section>
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
  const stories = [...newsItems.slice(0, 3), ...(blog ? [blog] : [])];
  const featured = stories[0];
  const latestStories = stories.slice(1, 4);

  return (
    <section className="border-b border-primary/10 bg-gradient-to-b from-accent/40 to-background py-14 lg:py-20">
      <div className="mx-auto max-w-[1680px] px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
        <div className="mb-10 grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.34em] text-primary">
              Kisii University Updates
            </p>
            <span className="mt-2 block h-px w-16 bg-secondary" />
            <h2 className="mt-3 font-[family-name:var(--font-display)] text-4xl font-bold leading-[0.95] text-primary sm:text-5xl">
              Stories, News &amp; Events
            </h2>
            <p className="mt-4 max-w-3xl text-base leading-7 text-muted-foreground">
              Discover what is happening across campus—partnerships that create
              impact, achievements that inspire, and events that bring us together.
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

        <div className="grid items-stretch gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(280px,0.7fr)_minmax(300px,0.8fr)]">
          {featured ? (
            <FeaturedStory item={featured} />
          ) : (
            <div className="rounded-xl border border-dashed border-border bg-white/80 p-8 text-center">
              <Newspaper className="mx-auto h-8 w-8 text-muted-foreground" />
              <p className="mt-3 text-sm text-muted-foreground">
                No stories available
              </p>
            </div>
          )}

          <div className="min-w-0">
            <h3 className="font-[family-name:var(--font-display)] text-xl font-bold text-primary">
              Latest Stories
            </h3>
            <span className="mt-2 block h-0.5 w-7 bg-secondary" />
            {latestStories.length ? (
              <div className="mt-5 divide-y divide-primary/10">
                {latestStories.map((item) => (
                  <StoryListItem key={item.href} item={item} />
                ))}
              </div>
            ) : (
              <p className="mt-5 text-sm text-muted-foreground">
                More stories coming soon
              </p>
            )}
          </div>

          <UpcomingEventsPanel events={events} />
        </div>

        <NewsletterBanner />
      </div>
    </section>
  );
}

function FeaturedStory({ item }: { item: HomeCard }) {
  return (
    <Link
      href={item.href}
      className="group relative block min-h-[360px] overflow-hidden rounded-xl bg-primary text-white sm:min-h-[420px] xl:h-full"
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
      <span className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
      <span className="absolute inset-x-0 bottom-0 z-10 p-5 sm:p-7">
        <span className="flex flex-wrap items-center gap-3 text-sm font-semibold">
          <span className="rounded-full bg-secondary px-3 py-1 text-white">
            {item.eyebrow ?? "Story"}
          </span>
          {item.meta && <span className="text-white/85">{item.meta}</span>}
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
      className="group grid min-w-0 grid-cols-[84px_minmax(0,1fr)] gap-3 py-4 sm:grid-cols-[100px_minmax(0,1fr)]"
    >
      <PublicImage
        src={item.imageUrl}
        alt=""
        ratio="news"
        fallbackSrc="/logos/ksu-bck5.jpg"
        sizes="100px"
        className="h-20 rounded-md"
        imageClassName="object-cover"
      />
      <span className="min-w-0">
        <span className="flex flex-wrap items-center gap-3 text-[11px] font-bold uppercase tracking-[0.12em] text-primary">
          <span>{item.eyebrow ?? "Update"}</span>
        </span>
        <span className="mt-2 line-clamp-2 block font-[family-name:var(--font-display)] text-base font-bold leading-5 text-foreground transition group-hover:text-primary">
          {item.title}
        </span>
      </span>
    </Link>
  );
}

function UpcomingEventsPanel({ events }: { events: HomeCard[] }) {
  return (
    <aside className="h-full rounded-xl bg-primary px-5 py-6 text-white shadow-xl shadow-primary/15">
      <h3 className="font-[family-name:var(--font-display)] text-xl font-bold">
        Upcoming Events
      </h3>
      <span className="mt-2 block h-0.5 w-7 bg-secondary" />
      {events.length ? (
        <div className="mt-5 space-y-4">
          {events.slice(0, 3).map((event) => (
            <EventItem key={event.href} event={event} />
          ))}
        </div>
      ) : (
        <p className="mt-5 text-sm text-white/70">No upcoming events</p>
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

function EventItem({ event }: { event: HomeCard }) {
  const { month, day } = parseEventDate(event.meta);

  return (
    <Link
      href={event.href}
      className="group flex gap-4 rounded-lg border border-white/10 bg-white/5 p-3 transition hover:bg-white/10"
    >
      <span className="flex w-14 flex-col items-center rounded-md bg-white px-2 py-2 text-primary">
        <span className="text-xs font-bold uppercase">{month}</span>
        <span className="font-[family-name:var(--font-display)] text-2xl font-bold leading-none">
          {day}
        </span>
      </span>
      <span className="min-w-0 flex-1">
        <span className="line-clamp-2 font-[family-name:var(--font-display)] text-base font-bold leading-tight text-secondary">
          {event.title}
        </span>
        <span className="mt-2 line-clamp-1 text-xs text-white/70">
          {event.body}
        </span>
      </span>
    </Link>
  );
}

function parseEventDate(meta?: string | null) {
  const [dateText] = (meta ?? "").split(" · ");
  const date = new Date(dateText ?? "");
  if (Number.isNaN(date.getTime())) {
    return { month: "TBD", day: "--" };
  }
  return {
    month: date.toLocaleDateString("en-KE", { month: "short" }),
    day: date.toLocaleDateString("en-KE", { day: "2-digit" }),
  };
}

function NewsletterBanner() {
  return (
    <div className="mt-10 grid gap-6 rounded-xl border border-primary/10 bg-white/80 p-6 shadow-sm lg:grid-cols-[auto_minmax(0,1fr)_auto] lg:items-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-lg shadow-primary/20">
        <Mail className="h-6 w-6" aria-hidden />
      </span>
      <div>
        <h3 className="font-[family-name:var(--font-display)] text-xl font-bold text-primary">
          Subscribe to updates
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Get the latest news, events, and stories straight to your inbox.
        </p>
      </div>
      <NewsletterSubscribeForm />
    </div>
  );
}
