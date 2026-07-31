import { Fragment, type ReactElement } from "react";
import {
  AlumniStorySection,
  DateTimelineSection,
  EventsListSection,
  FactsStripSection,
  FeaturedStoriesSection,
  FeaturedPartnershipSection,
  HeroAdmissionsSection,
  LeadershipActivitySection,
  LogoCarouselSection,
  MediaMosaicSection,
  PillarGridSection,
  ProgrammeFinderSection,
  type ProgrammeFinderData,
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
import type { HomeSocialLinks } from "@/lib/homepage-data";
import type { HomeCard } from "@/lib/homepage-data";
import type { VcPublicHub } from "@ksu/api-client";

type SectionComponent = (props: {
  section: HomepageSection;
  hero?: HomepageResolvedHero | null;
  factsSection?: HomepageSection | null;
  partnershipSpotlights?: HomepagePartnershipSpotlight[];
  academicDatesSection?: HomepageSection | null;
  eventsSection?: HomepageSection | null;
  programmeFinderData?: ProgrammeFinderData;
  featuredStories?: HomeCard[];
  socialLinks?: HomeSocialLinks;
  vcHub?: VcPublicHub | null;
}) => ReactElement | null;

function FeaturedStoriesRenderer({
  featuredStories,
}: Parameters<SectionComponent>[0]) {
  return <FeaturedStoriesSection stories={featuredStories} />;
}

export const HOMEPAGE_SECTION_RENDERERS: Record<
  HomepageSectionLayoutVariant,
  SectionComponent
> = {
  hero_admissions: HeroAdmissionsSection,
  pulse_strip: PulseStripSection,
  featured_partnership: FeaturedPartnershipSection,
  programme_finder: ProgrammeFinderSection,
  featured_stories: FeaturedStoriesRenderer,
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
  factsSection,
  partnershipSpotlights,
  academicDatesSection,
  eventsSection,
  programmeFinderData,
  featuredStories,
  socialLinks,
  vcHub,
}: {
  section: HomepageSection;
  hero?: HomepageResolvedHero | null;
  factsSection?: HomepageSection | null;
  partnershipSpotlights?: HomepagePartnershipSpotlight[];
  academicDatesSection?: HomepageSection | null;
  eventsSection?: HomepageSection | null;
  programmeFinderData?: ProgrammeFinderData;
  featuredStories?: HomeCard[];
  socialLinks?: HomeSocialLinks;
  vcHub?: VcPublicHub | null;
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
      factsSection={factsSection}
      partnershipSpotlights={partnershipSpotlights}
      academicDatesSection={academicDatesSection}
      eventsSection={eventsSection}
      programmeFinderData={programmeFinderData}
      featuredStories={featuredStories}
      socialLinks={socialLinks}
      vcHub={vcHub}
    />
  );
}

export function HomepageSections({
  sections,
  hero,
  partnershipSpotlights,
  programmeFinderData,
  featuredStories,
  socialLinks,
  vcHub,
}: {
  sections: HomepageSection[];
  hero?: HomepageResolvedHero | null;
  partnershipSpotlights?: HomepagePartnershipSpotlight[];
  programmeFinderData?: ProgrammeFinderData;
  featuredStories?: HomeCard[];
  socialLinks?: HomeSocialLinks;
  vcHub?: VcPublicHub | null;
}) {
  const orderedSections = orderHomepageSections(sections);
  const factsSection = sections.find(
    (section) =>
      section.layout_variant === "facts_strip" ||
      section.section_key === "facts",
  );
  const hasPulseStrip = sections.some(
    (section) => section.layout_variant === "pulse_strip",
  );
  const academicDatesSection = sections.find(
    (section) =>
      section.layout_variant === "date_timeline" ||
      section.section_key === "academic-dates",
  );
  const eventsSection = sections.find(
    (section) => section.layout_variant === "events_list",
  );
  const hasMergedNewsEvents = sections.some(
    (section) => section.layout_variant === "news_grid",
  );
  const hasMergedProgrammeDates = sections.some(
    (section) => section.layout_variant === "programme_finder",
  );
  const hasExplicitFeaturedStories = sections.some(
    (section) => section.layout_variant === "featured_stories",
  );

  return (
    <>
      {orderedSections.map((section) => {
        if (hasPulseStrip && section.layout_variant === "facts_strip") {
          return null;
        }
        if (
          hasMergedProgrammeDates &&
          section.layout_variant === "date_timeline"
        ) {
          return null;
        }
        if (hasMergedNewsEvents && section.layout_variant === "events_list") {
          return null;
        }

        return (
          <Fragment key={section.id}>
            <HomepageSectionRenderer
              section={section}
              hero={hero}
              factsSection={factsSection}
              partnershipSpotlights={partnershipSpotlights}
              academicDatesSection={academicDatesSection}
              eventsSection={eventsSection}
              programmeFinderData={programmeFinderData}
              featuredStories={featuredStories}
              socialLinks={socialLinks}
              vcHub={vcHub}
            />
            {section.layout_variant === "programme_finder" &&
            !hasExplicitFeaturedStories ? (
              <FeaturedStoriesSection stories={featuredStories} />
            ) : null}
          </Fragment>
        );
      })}
    </>
  );
}

function orderHomepageSections(sections: HomepageSection[]) {
  const priority: Record<HomepageSectionLayoutVariant, number> = {
    hero_admissions: 10,
    pulse_strip: 20,
    featured_partnership: 30,
    pillar_grid: 40,
    facts_strip: 20,
    programme_finder: 50,
    date_timeline: 51,
    featured_stories: 55,
    media_mosaic: 58,
    leadership_activity: 60,
    research_cards: 70,
    logo_carousel: 80,
    news_grid: 100,
    events_list: 101,
    alumni_story: 110,
  };

  return sections
    .map((section, index) => ({ section, index }))
    .sort((first, second) => {
      const firstPriority = isKnownHomepageLayoutVariant(
        first.section.layout_variant,
      )
        ? priority[first.section.layout_variant]
        : 1_000;
      const secondPriority = isKnownHomepageLayoutVariant(
        second.section.layout_variant,
      )
        ? priority[second.section.layout_variant]
        : 1_000;
      return (
        firstPriority - secondPriority ||
        (first.section.display_order ?? 1_000) -
          (second.section.display_order ?? 1_000) ||
        first.index - second.index
      );
    })
    .map(({ section }) => section);
}

export const SUPPORTED_HOMEPAGE_SECTION_VARIANTS =
  HOMEPAGE_SECTION_LAYOUT_VARIANTS;
