import type { ReactElement } from "react";
import {
  AlumniStorySection,
  DateTimelineSection,
  EventsListSection,
  FactsStripSection,
  FeaturedPartnershipSection,
  HeroAdmissionsSection,
  LeadershipActivitySection,
  LogoCarouselSection,
  MediaMosaicSection,
  PillarGridSection,
  ProgrammeFinderSection,
  PulseStripSection,
  ResearchCardsSection,
  NewsGridSection,
} from "@/components/home/sections/composed-section-variants";
import {
  HOMEPAGE_SECTION_LAYOUT_VARIANTS,
  isKnownHomepageLayoutVariant,
  type HomepagePartnershipSpotlight,
  type HomepageResolvedHero,
  type HomepageSection,
  type HomepageSectionLayoutVariant,
} from "@/lib/homepage-sections";

type SectionComponent = (props: {
  section: HomepageSection;
  hero?: HomepageResolvedHero | null;
  partnershipSpotlights?: HomepagePartnershipSpotlight[];
}) => ReactElement | null;

export const HOMEPAGE_SECTION_RENDERERS: Record<
  HomepageSectionLayoutVariant,
  SectionComponent
> = {
  hero_admissions: HeroAdmissionsSection,
  pulse_strip: PulseStripSection,
  featured_partnership: FeaturedPartnershipSection,
  programme_finder: ProgrammeFinderSection,
  date_timeline: DateTimelineSection,
  pillar_grid: PillarGridSection,
  media_mosaic: MediaMosaicSection,
  leadership_activity: LeadershipActivitySection,
  research_cards: ResearchCardsSection,
  news_grid: NewsGridSection,
  events_list: EventsListSection,
  logo_carousel: LogoCarouselSection,
  alumni_story: AlumniStorySection,
  facts_strip: FactsStripSection,
};

export function HomepageSectionRenderer({
  section,
  hero,
  partnershipSpotlights,
}: {
  section: HomepageSection;
  hero?: HomepageResolvedHero | null;
  partnershipSpotlights?: HomepagePartnershipSpotlight[];
}) {
  if (!isKnownHomepageLayoutVariant(section.layout_variant)) {
    console.warn(
      `Unknown homepage section layout variant: ${section.layout_variant}`,
    );
    return null;
  }

  const Renderer = HOMEPAGE_SECTION_RENDERERS[section.layout_variant];
  return (
    <Renderer
      section={section}
      hero={hero}
      partnershipSpotlights={partnershipSpotlights}
    />
  );
}

export function HomepageSections({
  sections,
  hero,
  partnershipSpotlights,
}: {
  sections: HomepageSection[];
  hero?: HomepageResolvedHero | null;
  partnershipSpotlights?: HomepagePartnershipSpotlight[];
}) {
  return (
    <>
      {sections.map((section) => (
        <HomepageSectionRenderer
          key={section.id}
          section={section}
          hero={hero}
          partnershipSpotlights={partnershipSpotlights}
        />
      ))}
    </>
  );
}

export const SUPPORTED_HOMEPAGE_SECTION_VARIANTS =
  HOMEPAGE_SECTION_LAYOUT_VARIANTS;
