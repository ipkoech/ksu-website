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
import { getHomepageData } from "@/lib/homepage-data";
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
    posterSrc: "/images/hero/campus-aerial.jpg",
    eyebrow: "Kisii University",
    title: "Shaping Tomorrow. Inspiring Innovation.",
    subtitle:
      "A leading public university committed to academic excellence, innovative research, and transforming communities across Kenya and beyond.",
    primaryCta: { label: "Study With Us", href: "/admissions/how-to-apply" },
    secondaryCta: { label: "Explore Programmes", href: "/academics/programmes" },
    tertiaryCta: { label: "Discover KSU", href: "/about" },
  },
];

const defaultStats = [
  { value: 45000, suffix: "+", label: "Alumni" },
  { value: 18000, suffix: "+", label: "Active Students" },
  { value: 1200, suffix: "+", label: "Staff" },
  { value: 10, label: "Schools" },
  { value: 150, suffix: "+", label: "Programmes" },
  { value: 50, suffix: "+", label: "Research Projects" },
];

export default async function LandingPage() {
  const [homepage, megaMenuData] = await Promise.all([
    getHomepageData(),
    getNavData(),
  ]);

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

          {/* 2. Numbers/Facts Strip */}
          <NumbersFactsSection stats={defaultStats} />

          {/* 3. Strategic Partnership */}
          <StrategicPartnershipSection />

          {/* 4. Audience Band */}
          <AudienceBandSection />

          {/* 5. Academics Section - using existing */}
          {/* TODO: Add AcademicsSection component */}

          {/* 6. Featured Stories */}
          <FeaturedStoriesGrid stories={homepage.featuredStories} />

          {/* 7. Life at KSU */}
          <LifeAtKsuSection />

          {/* 8. News/Events - using existing LatestContentSection */}
          {/* TODO: Add NewsEventsSection component */}

          {/* 9. Research */}
          <ResearchSection />

          {/* 10. Partners */}
          <PartnersMarquee partners={homepage.partners} />

          {/* 11. Journey CTA */}
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
