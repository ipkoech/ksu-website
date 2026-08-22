import type { Metadata } from "next";
import { MiniHeader, PublicFooter, PublicHeader } from "@ksu/ui/layout/public";
import { ReducedMotionProvider } from "@ksu/ui/motion";
import { CinematicHero } from "@/components/home/cinematic-hero";
import {
  HomeStatsBand,
  type HomeStat,
} from "@/components/home/home-stats-band";
import {
  StrategicPartnershipSection,
  type PartnershipOpportunity,
  type PartnershipSpotlightContent,
} from "@/components/home/strategic-partnership-section";
import { ImmediateActionsSection } from "@/components/home/immediate-actions-section";
import { ProgrammeJourney } from "@/components/home/programme-journey";
import { VcWelcomeSection } from "@/components/home/vc-welcome-section";
import {
  ResearchHighlightsSection,
  type ResearchSpotlightContent,
} from "@/components/home/research-highlights-section";
import { PartnersMarquee } from "@/components/home/partners-marquee";
import { SchoolsSection } from "@/components/home/schools-section";
import { FeaturedStoriesShowcase } from "@/components/home/featured-stories-showcase";
import { LifeAroundStudiesSection } from "@/components/home/life-around-studies-section";
import { NewsEventsBlogSection } from "@/components/home/news-events-blog-section";
import { NewsletterCtaSection } from "@/components/home/newsletter-cta-section";
import { UniversityJsonLd } from "@/components/home/audience-chips";
import { ScrollAffordance } from "@/components/home/scroll-affordance";
import { HomeSectionReveal } from "@/components/home/home-section-reveal";
import { EntityInquiryLauncher } from "@/components/public/entity-inquiry-launcher";
import { getHomepageData, type HomeMetric } from "@/lib/homepage-data";
import {
  getComposedHomepage,
  heroImage,
  mediaAlt,
  mediaUrl,
  mobileImage,
  sectionMedia,
  type HomepageHeroAction,
  type HomepageSection,
} from "@/lib/homepage-sections";
import { getResearchLanding } from "@/lib/research-landing";
import { getPublicVcHub } from "@/lib/vice-chancellor-data";
import { getNavData } from "@/lib/nav-data";
import {
  heriAfricaFrontendUrl,
  libraryFrontendUrl,
  researchFrontendUrl,
} from "@/lib/service-urls";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Kisii University — Inclusivity and Borderlessness",
  description:
    "A leading public university in Kisii, Kenya — eight schools, applied research, and community transformation. Founded 1965, chartered 2013.",
  openGraph: {
    title: "Kisii University",
    description:
      "A leading public university committed to academic excellence, innovative research, and transforming communities.",
    type: "website",
    images: [{ url: "/videos/main-hero-poster.jpg" }],
  },
};

type HeroContent = {
  videoSrc: string | null;
  posterSrc: string;
  mobilePosterSrc: string | null;
  posterAlt: string;
  identity: string;
  headlineLines: string[];
  subtitle: string;
  primaryCta: { label: string; href: string; external?: boolean };
  secondaryCta: { label: string; href: string; external?: boolean };
};

/** Used until an editor publishes a hero_admissions section, and for any
 *  field that section leaves blank. */
const heroFallback: HeroContent = {
  videoSrc: "/videos/hero-video.mp4",
  posterSrc: "/videos/main-hero-poster.jpg",
  mobilePosterSrc: null,
  posterAlt: "Students on the Kisii University campus",
  identity: "Kisii University",
  headlineLines: [
    "Inclusivity and Borderlessness.",
    "Every learner, no limits.",
  ],
  subtitle:
    "A leading public university committed to academic excellence, innovative research, and transforming communities across Kenya and beyond.",
  primaryCta: { label: "Study With Us", href: "/admissions/how-to-apply" },
  secondaryCta: { label: "Explore programmes", href: "/academics/programmes" },
};

/** Hero CTAs are stored by the admin editor as `{ label, href }` under
 *  settings.primary_cta / settings.secondary_cta. A half-filled pair is
 *  discarded rather than rendered as a link to nowhere. */
function ctaFromSettings(
  settings: Record<string, unknown> | null | undefined,
  key: string,
  fallback: { label: string; href: string },
) {
  const raw = settings?.[key];
  if (raw && typeof raw === "object") {
    const { label, href } = raw as Record<string, unknown>;
    if (
      typeof label === "string" &&
      label.trim() &&
      typeof href === "string" &&
      href.trim()
    ) {
      return { label: label.trim(), href: href.trim() };
    }
  }
  return fallback;
}

/** A resolved hero action from the composed `/api/v1/homepage` payload. */
function ctaFromHeroAction(action?: HomepageHeroAction | null) {
  const label = action?.label?.trim();
  const href = action?.href?.trim();
  if (!label || !href) return null;
  return { label, href, external: action?.open_in_new_tab || undefined };
}

/**
 * Split a CMS headline into the hero's two display lines. An explicit line
 * break wins; otherwise the first sentence becomes the lead line and the
 * remainder the accent one, which is the motif the hero is built around.
 */
function headlineLinesFrom(title?: string | null): string[] | null {
  const text = title?.trim();
  if (!text) return null;
  const explicit = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  if (explicit.length > 1) return explicit.slice(0, 2);
  const sentences = text.match(/^(.+?[.!?])\s+(.+)$/);
  return sentences ? [sentences[1], sentences[2]] : [text];
}

/**
 * Hero content, field by field: the composed hero payload first, then the
 * `hero_admissions` section it was resolved from, then the hardcoded floor.
 */
function heroFromCms(
  section: HomepageSection | undefined,
  resolved: Awaited<ReturnType<typeof getComposedHomepage>>["data"],
): HeroContent {
  const heroContent = resolved?.hero?.content ?? null;
  const heroMedia = resolved?.hero?.media ?? null;
  const settings = section?.settings ?? {};

  const video =
    heroMedia?.video ?? (section ? sectionMedia(section, "video")[0] : null);
  const poster =
    heroMedia?.poster ??
    heroMedia?.desktop ??
    (section
      ? (sectionMedia(section, "poster")[0] ?? heroImage(section))
      : null);
  const mobile = heroMedia?.mobile ?? (section ? mobileImage(section) : null);

  const actions = heroContent?.actions ?? [];
  const primaryAction =
    ctaFromHeroAction(
      resolved?.hero?.admissions?.visible
        ? resolved.hero.admissions.primary_action
        : null,
    ) ??
    ctaFromHeroAction(
      actions.find((action) => action.style === "primary") ?? actions[0],
    );
  const secondaryAction = ctaFromHeroAction(
    actions.find((action) => action.style === "secondary") ?? actions[1],
  );

  return {
    videoSrc: mediaUrl(video) ?? heroFallback.videoSrc,
    posterSrc: mediaUrl(poster) ?? heroFallback.posterSrc,
    mobilePosterSrc: mediaUrl(mobile) ?? heroFallback.mobilePosterSrc,
    posterAlt: poster
      ? mediaAlt(poster, heroFallback.posterAlt)
      : heroFallback.posterAlt,
    identity: heroContent?.eyebrow?.trim() || heroFallback.identity,
    headlineLines:
      headlineLinesFrom(heroContent?.headline) ??
      headlineLinesFrom(section?.title) ??
      heroFallback.headlineLines,
    subtitle:
      heroContent?.description?.trim() ||
      section?.description?.trim() ||
      section?.subtitle?.trim() ||
      heroFallback.subtitle,
    primaryCta:
      primaryAction ??
      ctaFromSettings(settings, "primary_cta", heroFallback.primaryCta),
    secondaryCta:
      secondaryAction ??
      ctaFromSettings(settings, "secondary_cta", heroFallback.secondaryCta),
  };
}

/** The at-a-glance figures for the overlapping statistics band. */
function statsFromCms(
  factsSection: HomepageSection | undefined,
  fallback: HomeMetric[],
): HomeStat[] {
  const items = (factsSection?.items ?? [])
    .filter((item) => item.is_enabled !== false)
    .sort(
      (first, second) =>
        (first.display_order ?? 100) - (second.display_order ?? 100),
    );

  const managed = items
    .map((item) => {
      const value = item.title?.trim();
      const label =
        item.subtitle?.trim() ||
        (typeof item.content?.label === "string"
          ? item.content.label.trim()
          : "");
      if (!value || !label) return null;
      return { value, label };
    })
    .filter((stat): stat is HomeStat => stat !== null);

  if (managed.length > 0) return managed;

  return fallback.map((fact) => ({ value: fact.value, label: fact.label }));
}

/** Rows an editor added to the partnership section's `opportunities` list. */
function opportunitiesFromRows(
  rows: Array<Record<string, unknown>> | null | undefined,
): PartnershipOpportunity[] {
  return (rows ?? [])
    .map((row, index) => {
      const title =
        typeof row.label === "string"
          ? row.label
          : typeof row.title === "string"
            ? row.title
            : null;
      const href = typeof row.url === "string" ? row.url : null;
      if (!title || !href) return null;
      const entry: PartnershipOpportunity = {
        id: `partnership-opportunity-${index}`,
        title,
        href,
        closesAt:
          typeof row.closes_at === "string" && row.closes_at.trim()
            ? row.closes_at.trim()
            : null,
      };
      return entry;
    })
    .filter((item): item is PartnershipOpportunity => item !== null);
}

/**
 * Partnership content: the active spotlight record when there is one, with
 * the CMS `featured_partnership` section as the fallback for every field it
 * does not carry, and the component's own copy as the floor under both.
 */
function partnershipFromCms(
  composed: Awaited<ReturnType<typeof getComposedHomepage>>,
): PartnershipSpotlightContent | undefined {
  const section = composed.sections.find(
    (candidate) => candidate.layout_variant === "featured_partnership",
  );
  const spotlight = composed.data?.partnership_spotlights?.[0];
  if (!spotlight && !section) return undefined;

  const media = spotlight
    ? (sectionMedia(spotlight, "heroImage")[0] ?? null)
    : section
      ? heroImage(section)
      : null;

  const ctaLabel =
    spotlight?.primary_cta?.label?.trim() ||
    spotlight?.primary_cta_label?.trim();
  const ctaHref =
    spotlight?.primary_cta?.href?.trim() || spotlight?.primary_cta_url?.trim();

  return {
    headline: spotlight?.headline ?? section?.title ?? undefined,
    statement: section?.subtitle ?? undefined,
    summary: spotlight?.summary ?? section?.description ?? undefined,
    imageUrl: media ? mediaUrl(media) : undefined,
    imageAlt: media
      ? mediaAlt(media, "The Kisii University and HERI Africa partnership")
      : undefined,
    cta:
      ctaLabel && ctaHref
        ? { label: ctaLabel, href: ctaHref }
        : { label: "Read More", href: heriAfricaFrontendUrl },
    opportunities: opportunitiesFromRows(
      Array.isArray(section?.settings?.opportunities)
        ? (section.settings.opportunities as Array<Record<string, unknown>>)
        : null,
    ),
  };
}

/**
 * Map of CMS layout variants to the bespoke landing component they control.
 * When CMS data is available and a section with the given variant is disabled
 * (is_enabled === false), the corresponding bespoke component is hidden.
 * When CMS is unavailable, all bespoke components render (graceful degradation).
 */
function isBespokeSectionEnabled(
  sections: HomepageSection[],
  cmsAvailable: boolean,
  variant: string,
): boolean {
  // CMS unavailable: show everything (graceful degradation)
  if (!cmsAvailable) return true;
  // Find section by variant; if absent, assume enabled (default visible)
  const section = sections.find((s) => s.layout_variant === variant);
  return section ? section.is_enabled !== false : true;
}

/**
 * Enable state for a beat that one of several layout variants can drive.
 *
 * `isBespokeSectionEnabled` defaults an absent variant to visible, so OR-ing
 * two of them together can never be false: a homepage realistically carries
 * `facts_strip` or `pulse_strip`, not both, and the absent one keeps voting
 * "show". Disabling the one that exists must hide the beat, so only the
 * variants actually present get a vote.
 */
function isEitherBespokeSectionEnabled(
  sections: HomepageSection[],
  cmsAvailable: boolean,
  variants: string[],
): boolean {
  if (!cmsAvailable) return true;
  const present = sections.filter((section) =>
    variants.includes(section.layout_variant),
  );
  if (present.length === 0) return true;
  return present.some((section) => section.is_enabled !== false);
}

export default async function LandingPage() {
  const [homepage, megaMenuData, composedHomepage, vcHub, researchLanding] =
    await Promise.all([
      getHomepageData(),
      getNavData(),
      getComposedHomepage(),
      getPublicVcHub(),
      getResearchLanding(),
    ]);

  // CMS availability: true when sections were returned (even if empty array).
  // Use rawSections: normalizeSections drops disabled entries, so the
  // normalized list can't distinguish "disabled by an admin" from "absent".
  const cmsAvailable = composedHomepage.data !== null;
  const allSections = composedHomepage.rawSections;

  const showSection = (variant: string) =>
    isBespokeSectionEnabled(allSections, cmsAvailable, variant);
  const showEitherSection = (variants: string[]) =>
    isEitherBespokeSectionEnabled(allSections, cmsAvailable, variants);

  const sectionByVariant = (variant: string) =>
    composedHomepage.sections.find(
      (section) => section.layout_variant === variant,
    );

  const heroSection = sectionByVariant("hero_admissions");
  const hero = heroFromCms(heroSection, composedHomepage.data);

  const factsSection = sectionByVariant("facts_strip");
  // Whatever the backend actually publishes, capped at the four the band is
  // laid out for. Editors control which four via display_order; nothing is
  // substituted in when fewer are available.
  const stats = statsFromCms(factsSection, homepage.facts).slice(0, 4);

  const partnership = partnershipFromCms(composedHomepage);
  const programmeFinderSection = sectionByVariant("programme_finder");
  const campusLifeSection =
    composedHomepage.sections.find(
      (section) => section.section_key === "campus-life",
    ) ?? sectionByVariant("media_mosaic");

  // The Vice-Chancellor's own words. The VC hub is the authority; the
  // leadership record's message is the fallback when the hub is unpublished.
  const vcWelcome =
    vcHub?.welcome_message?.trim() || homepage.viceChancellor?.message?.trim();
  const vcWelcomeTitle = vcHub?.welcome_title?.trim() || null;
  // "Meet our VC" opens the Vice-Chancellor's own page — his welcome, record,
  // activities and addresses — not the credentials sheet. The professional
  // profile is reachable from that page for anyone who wants it.
  const vcHref = "/about/vice-chancellor";

  // Research spotlight. Measures come from the research service's own stats
  // endpoint — the project record carries no structured figures, and none are
  // invented here.
  const researchMeasures = homepage.researchStats
    .filter((stat) => stat.value && stat.label)
    .slice(0, 3)
    .map((stat, index) => ({
      id: `research-measure-${index}`,
      value: stat.value,
      label: stat.label,
    }));
  const researchCardsSection = sectionByVariant("research_cards");
  const researchCardsMedia = researchCardsSection
    ? heroImage(researchCardsSection)
    : null;

  // The band's own heading describes research at the University, so it comes
  // from the CMS section rather than from whichever project happens to be
  // first — putting a project title here made the portfolio-wide figures below
  // it read as that one project's results.
  const researchProjectCards = researchLanding.featuredProjects.map(
    (project) => ({
      id: project.id,
      title: project.title,
      summary: project.summary ?? project.expectedOutcomes,
      status: project.status,
      href: `${researchFrontendUrl}/projects/${project.slug}`,
    }),
  );

  const hasResearchContent =
    researchProjectCards.length > 0 || Boolean(researchCardsSection?.title);

  const researchSpotlight: ResearchSpotlightContent | null = hasResearchContent
    ? {
        title: researchCardsSection?.title || "Research at Kisii University",
        summary: researchCardsSection?.description,
        imageUrl: researchCardsMedia ? mediaUrl(researchCardsMedia) : null,
        imageAlt: researchCardsMedia ? mediaAlt(researchCardsMedia, "") : "",
        measures: researchMeasures,
        // Empty when the research service is unreachable: the CMS copy and the
        // figures still carry the band rather than the page losing a beat.
        projects: researchProjectCards,
        // The index, not a single project — "Explore research" pointing at one
        // project's page was a promise the destination did not keep.
        cta: { label: "Explore research", href: researchFrontendUrl },
      }
    : null;

  return (
    <ReducedMotionProvider>
      <div className="ksu-landing ksu-canvas min-h-screen text-foreground">
        <UniversityJsonLd />
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

        <main id="main-content" tabIndex={-1} className="overflow-x-clip">
          {/* 1 — Video hero (hero_admissions) */}
          {showSection("hero_admissions") && <CinematicHero {...hero} />}

          {/* 2 — Statistics band, overlapping the hero / partnership seam */}
          {showEitherSection(["facts_strip", "pulse_strip"]) && (
            <HomeStatsBand stats={stats} />
          )}

          {/* 3 — Kisii University × HERI Africa (featured_partnership) */}
          {showSection("featured_partnership") && (
            <HomeSectionReveal>
              <StrategicPartnershipSection spotlight={partnership} />
            </HomeSectionReveal>
          )}

          {/* 4 — Quick-action band, from the CMS hero CTA items */}
          <HomeSectionReveal>
            <ImmediateActionsSection section={heroSection} />
          </HomeSectionReveal>

          {/* 5 — Programme finder and the admissions pathway, as one section:
                  choosing a programme and applying for it are one decision
                  (programme_finder + the live intakes + date_timeline). */}
          {showSection("programme_finder") && (
            <HomeSectionReveal>
              <ProgrammeJourney
                schools={homepage.schools}
                filters={homepage.programmeFilters}
                topProgrammes={homepage.featuredProgrammes.slice(0, 6)}
                intakes={homepage.activeIntakes}
                subtitle={programmeFinderSection?.description ?? undefined}
              />
            </HomeSectionReveal>
          )}

          {/* 6 — The schools, as the browse-by-discipline route out of the
                  finder above. */}
          <HomeSectionReveal>
            <SchoolsSection schools={homepage.schools} />
          </HomeSectionReveal>

          {/* 7 — Research spotlight (research_cards) */}
          {showSection("research_cards") && (
            <HomeSectionReveal>
              <ResearchHighlightsSection spotlight={researchSpotlight} />
            </HomeSectionReveal>
          )}

          {/* 8 — Partner rail. Sits between research and stories, and is the
                  only place partner logos appear on this page. */}
          {showSection("logo_carousel") && (
            <HomeSectionReveal>
              <PartnersMarquee partners={homepage.partners} />
            </HomeSectionReveal>
          )}

          {/* 9 — Vice-Chancellor welcome (leadership_activity) */}
          {showSection("leadership_activity") && (
            <HomeSectionReveal>
              <VcWelcomeSection
                leader={homepage.viceChancellor}
                content={
                  vcWelcome
                    ? {
                        title: vcWelcomeTitle,
                        message: vcWelcome,
                        href: vcHref,
                      }
                    : undefined
                }
              />
            </HomeSectionReveal>
          )}

          {/* 10 — Featured stories. Editors control this beat by publishing
                   stories in Corporate Communication → Stories: with none
                   published the section stays out of the page rather than
                   showing an apology box. */}
          <HomeSectionReveal>
            <FeaturedStoriesShowcase stories={homepage.featuredStories} />
          </HomeSectionReveal>

          {/* 11 — Life at Kisii (campus-life / media_mosaic) */}
          {campusLifeSection ? (
            <HomeSectionReveal>
              <LifeAroundStudiesSection section={campusLifeSection} />
            </HomeSectionReveal>
          ) : null}

          {/* 12 — News, events and blog (news_grid) */}
          {showSection("news_grid") && (
            <HomeSectionReveal>
              <NewsEventsBlogSection
                news={homepage.latestNews}
                events={homepage.upcomingEvents}
                blogs={homepage.latestBlogs}
                /* "Today" is resolved on the server so the calendar's first
                   paint matches on both sides; the page revalidates every five
                   minutes, so it never drifts far. */
                todayIso={new Date().toISOString().slice(0, 10)}
              />
            </HomeSectionReveal>
          )}

          {/* 13 — Newsletter CTA, immediately before the footer */}
          <HomeSectionReveal>
            <NewsletterCtaSection
              contactInfo={homepage.contactInfo}
              socialLinks={homepage.socialLinks}
            />
          </HomeSectionReveal>
        </main>

        <PublicFooter
          contactInfo={homepage.contactInfo}
          socialLinks={homepage.socialLinks}
          researchHref={researchFrontendUrl}
          libraryHref={libraryFrontendUrl}
        />
        <ScrollAffordance />
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
