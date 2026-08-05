import type { Metadata } from "next";
import { MiniHeader, PublicFooter, PublicHeader } from "@ksu/ui/layout/public";
import { AmbientPageBackground } from "@ksu/ui/components";
import { ReducedMotionProvider } from "@ksu/ui/motion";
import {
  NumbersFactsSection,
  StrategicPartnershipSection,
  PartnersMarquee,
  VcWelcomeSection,
  HappeningNowSection,
} from "@/components/home/landing-sections";
import { CinematicHero } from "@/components/home/cinematic-hero";
import { EditorialShowcaseSection } from "@/components/home/editorial-showcase-section";
import { WhyKsuSection } from "@/components/home/why-ksu-section";
import { FlowFeaturesSection } from "@/components/home/flow-features-section";
import type {
  PartnershipChapterContent,
  PartnershipSpotlightContent,
} from "@/components/home/strategic-partnership-section";
import {
  AudienceChips,
  UniversityJsonLd,
} from "@/components/home/audience-chips";
import { type LandingStat } from "@/components/home/why-ksu-section";
import { ProgrammeFinderCompact } from "@/components/home/programme-finder-compact";
import { LifeAroundStudiesSection } from "@/components/home/life-around-studies-section";
import {
  ResearchHighlightsSection,
  type ResearchThemeDisplay,
} from "@/components/home/research-highlights-section";
import { HomepageSections } from "@/components/home/section-renderer";
import { EntityInquiryLauncher } from "@/components/public/entity-inquiry-launcher";
import { getHomepageData, type HomeMetric } from "@/lib/homepage-data";
import {
  getComposedHomepage,
  heroImage,
  mediaAlt,
  mediaUrl,
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
  title: "Kisii University — Shaping Tomorrow. Inspiring Innovation.",
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

const hero = {
  videoSrc: "/videos/main-hero-1080.mp4",
  posterSrc: "/videos/main-hero-poster.jpg",
  headlineLines: ["Shaping tomorrow.", "Inspiring innovation."],
  subtitle:
    "A leading public university committed to academic excellence, innovative research, and transforming communities across Kenya and beyond.",
  primaryCta: { label: "Study with us", href: "/admissions/how-to-apply" },
  secondaryCta: { label: "Explore programmes", href: "/academics/programmes" },
};

function parseStatValue(raw: string): { value: number; suffix: string } | null {
  const match = raw.replace(/,/g, "").match(/^(\d+)\s*(.*)$/);
  if (!match) return null;
  const value = Number(match[1]);
  if (!Number.isFinite(value) || value <= 0) return null;
  return { value, suffix: match[2] ?? "" };
}

/** The at-a-glance figures from the CMS facts section, count-up ready. */
function overlayStatsFromFacts(
  factsSection: HomepageSection | undefined,
  fallback: HomeMetric[],
): LandingStat[] {
  const items = (factsSection?.items ?? [])
    .filter((item) => item.is_enabled !== false)
    .sort(
      (first, second) =>
        (first.display_order ?? 100) - (second.display_order ?? 100),
    );

  const stats = items
    .map((item) => {
      const parsed = parseStatValue(item.title ?? "");
      const label =
        item.subtitle ??
        (typeof item.content?.label === "string" ? item.content.label : null);
      if (!parsed || !label) return null;
      return { value: parsed.value, suffix: parsed.suffix, label };
    })
    .filter((stat): stat is NonNullable<typeof stat> => stat !== null);

  if (stats.length > 0) return stats;

  return fallback
    .map((fact) => {
      const parsed = parseStatValue(fact.value);
      if (!parsed) return null;
      return { value: parsed.value, suffix: parsed.suffix, label: fact.label };
    })
    .filter((stat): stat is NonNullable<typeof stat> => stat !== null);
}

/** Partnership content resolved from the CMS: spotlight record when present,
 *  otherwise the featured-partnership section itself. */
function partnershipFromCms(
  composed: Awaited<ReturnType<typeof getComposedHomepage>>,
): PartnershipSpotlightContent | undefined {
  const section = composed.sections.find(
    (candidate) => candidate.layout_variant === "featured_partnership",
  );
  const spotlight = composed.data?.partnership_spotlights?.[0];

  const chapters: PartnershipChapterContent[] = (section?.items ?? [])
    .filter(
      (item) =>
        item.is_enabled !== false &&
        item.content?.group === "chapter" &&
        (item.body_text || item.subtitle),
    )
    .slice(0, 3)
    .map((item) => ({
      id: item.id,
      kicker: item.title ?? "Partnership",
      body: item.body_text ?? item.subtitle ?? "",
    }));

  const heroMedia = section ? heroImage(section) : null;
  const image = heroMedia ? mediaUrl(heroMedia) : undefined;

  if (!spotlight && !section) return undefined;

  return {
    eyebrow: section?.subtitle ?? undefined,
    headline: spotlight?.headline ?? section?.title ?? undefined,
    summary: spotlight?.summary ?? section?.description ?? undefined,
    imageUrl: image ?? undefined,
    imageAlt: heroMedia
      ? mediaAlt(heroMedia, "The Kisii University and HERI Africa partnership")
      : undefined,
    chapters: chapters.length > 0 ? chapters : undefined,
  };
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

  const factsSection = composedHomepage.sections.find(
    (section) => section.layout_variant === "facts_strip",
  );
  const pillarSection = composedHomepage.sections.find(
    (section) => section.layout_variant === "pillar_grid",
  );
  const overlayStats = overlayStatsFromFacts(factsSection, homepage.facts);
  const partnership = partnershipFromCms(composedHomepage);
  const campusLifeSection = composedHomepage.sections.find(
    (section) => section.section_key === "campus-life",
  );
  const researchCardsSection = composedHomepage.sections.find(
    (section) => section.layout_variant === "research_cards",
  );

  // Research themes from the research service, topped up with the CMS
  // research cards when the service lists fewer than four.
  const serviceThemes: ResearchThemeDisplay[] = researchLanding.themes.map(
    (theme) => ({
      id: theme.id,
      name: theme.name,
      description: theme.description,
      imageUrl: null,
      href: researchFrontendUrl,
    }),
  );
  const cmsThemes: ResearchThemeDisplay[] = (
    researchCardsSection?.items ?? []
  )
    .filter((item) => item.is_enabled !== false && item.title)
    .map((item) => ({
      id: item.id,
      name: item.title ?? "",
      description: item.subtitle ?? item.body_text,
      imageUrl:
        typeof item.content?.imageUrl === "string"
          ? item.content.imageUrl
          : null,
      href: researchFrontendUrl,
    }));
  const themeNames = new Set(
    serviceThemes.map((theme) => theme.name.toLowerCase()),
  );
  const researchThemes = [
    ...serviceThemes,
    ...cmsThemes.filter((theme) => !themeNames.has(theme.name.toLowerCase())),
  ].slice(0, 4);

  // Beats rendered with landing-specific treatments are removed from the
  // composed stream; the page ends at university news.
  const composedSections = composedHomepage.sections.filter(
    (section) =>
      section.layout_variant !== "hero_admissions" &&
      section.layout_variant !== "featured_partnership" &&
      section.layout_variant !== "featured_stories" &&
      section.layout_variant !== "facts_strip" &&
      section.layout_variant !== "programme_finder" &&
      section.layout_variant !== "date_timeline" &&
      section.layout_variant !== "pillar_grid" &&
      section.layout_variant !== "research_cards" &&
      section.layout_variant !== "news_grid" &&
      section.id !== campusLifeSection?.id,
  );

  return (
    <ReducedMotionProvider>
      <div className="min-h-screen text-foreground">
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

        <AmbientPageBackground
          as="main"
          id="main-content"
          variant="academic"
          intensity="soft"
          className="overflow-x-clip"
          tabIndex={-1}
        >
          {/* The promise — cinematic full-viewport hero */}
          <CinematicHero {...hero} />

          {/* Why Kisii University — cream interlude with the proof figures */}
          <WhyKsuSection stats={overlayStats} />

          {/* The signature moment — KSU × HERI Africa, CMS content */}
          <StrategicPartnershipSection spotlight={partnership} />

          {/* One mandate, three promises — the black benefits band */}
          <FlowFeaturesSection section={pillarSection} />

          {/* The voice behind the promises — Vice-Chancellor */}
          <VcWelcomeSection leader={homepage.viceChancellor} />

          {/* Task routing — the action bridge into the programme finder */}
          <AudienceChips />

          {/* The offer — programme finder, featured programmes, schools */}
          <ProgrammeFinderCompact
            schools={homepage.schools}
            featuredProgrammes={homepage.featuredProgrammes}
          />

          {/* The frontier — research themes + featured project */}
          <ResearchHighlightsSection
            themes={researchThemes}
            featuredProject={
              researchLanding.featuredProject
                ? {
                    title: researchLanding.featuredProject.title,
                    summary: researchLanding.featuredProject.summary,
                    status: researchLanding.featuredProject.status,
                    href: `${researchFrontendUrl}/projects/${researchLanding.featuredProject.slug}`,
                  }
                : null
            }
          />

          {/* The place to live — life around studies */}
          {campusLifeSection ? (
            <LifeAroundStudiesSection section={campusLifeSection} />
          ) : null}

          {/* The people — featured stories showcase */}
          <EditorialShowcaseSection
            id="featured-stories"
            badge="Stories"
            headingLead="Stories worth"
            headingAccent="telling."
            subtitle="Voices from students, staff, and alumni. A look into the people and moments that make Kisii University."
            viewAllHref="/stories"
            viewAllLabel="View all stories"
            cards={homepage.featuredStories}
            emptyMessage="Stories are being prepared. Visit the stories page for earlier features."
          />

          {/* The pulse — university news and upcoming events */}
          <EditorialShowcaseSection
            id="news-events"
            badge="News & events"
            headingLead="The latest from"
            headingAccent="the centre."
            subtitle="Announcements, research milestones, and what is happening across the university."
            viewAllHref="/news"
            viewAllLabel="View all news"
            cards={homepage.latestNews}
            emptyMessage="News updates are on the way. See the news page for the full archive."
            events={homepage.upcomingEvents}
            eventsHref="/events"
            tone="wash"
          />

          {composedHomepage.hasRenderableSections ? (
            /* Remaining current-design sections, ending at university news */
            <HomepageSections
              sections={composedSections}
              hero={composedHomepage.data?.hero}
              socialLinks={homepage.socialLinks}
              partnershipSpotlights={
                composedHomepage.data?.partnership_spotlights ?? []
              }
              featuredStories={homepage.featuredStories}
              vcHub={vcHub}
              suppressImplicitFeaturedStories
            />
          ) : (
            /* Fallback when CMS content is unavailable */
            <>
              {overlayStats.length === 0 && homepage.facts.length > 0 && (
                <NumbersFactsSection
                  stats={homepage.facts
                    .map((fact) => {
                      const parsed = parseStatValue(fact.value);
                      return parsed
                        ? {
                            value: parsed.value,
                            suffix: parsed.suffix || undefined,
                            label: fact.label,
                            description: fact.detail,
                          }
                        : null;
                    })
                    .filter(
                      (stat): stat is NonNullable<typeof stat> => stat !== null,
                    )}
                />
              )}
              <HappeningNowSection
                newsItems={homepage.latestNews}
                events={homepage.upcomingEvents}
                blog={homepage.latestBlog}
              />
              {homepage.partners.length > 0 && (
                <PartnersMarquee partners={homepage.partners} />
              )}
            </>
          )}
        </AmbientPageBackground>

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
