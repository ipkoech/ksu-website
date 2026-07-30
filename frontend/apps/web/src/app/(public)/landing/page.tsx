import { MiniHeader, PublicFooter, PublicHeader } from "@ksu/ui/layout/public";
import { AmbientPageBackground } from "@ksu/ui/components";
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
import { EntityInquiryLauncher } from "@/components/public/entity-inquiry-launcher";
import { getHomepageData, type HomeMetric } from "@/lib/homepage-data";
import { getNavData } from "@/lib/nav-data";
import {
  heriAfricaFrontendUrl,
  libraryFrontendUrl,
  researchFrontendUrl,
} from "@/lib/service-urls";

export const revalidate = 300;

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

export default async function LandingPage() {
  const [homepage, megaMenuData] = await Promise.all([
    getHomepageData(),
    getNavData(),
  ]);

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
          {/* 1. Video Hero */}
          <VideoHero slides={heroSlides} />

          {/* 2. Numbers/Facts Strip - only if we have data */}
          {stats.length > 0 && <NumbersFactsSection stats={stats} />}

          {/* 3. Strategic Partnership */}
          <StrategicPartnershipSection />

          {/* 4. Audience Band */}
          <AudienceBandSection />

          {/* 5. Featured Stories - only if we have stories */}
          {homepage.featuredStories.length > 0 && (
            <FeaturedStoriesGrid stories={homepage.featuredStories} />
          )}

          {/* 6. Life at KSU */}
          <LifeAtKsuSection />

          {/* 7. Research */}
          <ResearchSection />

          {/* 8. Partners - only if we have partners */}
          {homepage.partners.length > 0 && (
            <PartnersMarquee partners={homepage.partners} />
          )}

          {/* 9. Journey CTA */}
          <JourneyCtaSection />
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
