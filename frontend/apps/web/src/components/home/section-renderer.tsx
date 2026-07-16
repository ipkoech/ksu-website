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

type SectionComponent = (props: {
  section: HomepageSection;
  hero?: HomepageResolvedHero | null;
  factsSection?: HomepageSection | null;
  partnershipSpotlights?: HomepagePartnershipSpotlight[];
  academicDatesSection?: HomepageSection | null;
  eventsSection?: HomepageSection | null;
  programmeFinderData?: ProgrammeFinderData;
  socialLinks?: HomeSocialLinks;
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
  factsSection,
  partnershipSpotlights,
  academicDatesSection,
  eventsSection,
  programmeFinderData,
  socialLinks,
}: {
  section: HomepageSection;
  hero?: HomepageResolvedHero | null;
  factsSection?: HomepageSection | null;
  partnershipSpotlights?: HomepagePartnershipSpotlight[];
  academicDatesSection?: HomepageSection | null;
  eventsSection?: HomepageSection | null;
  programmeFinderData?: ProgrammeFinderData;
  socialLinks?: HomeSocialLinks;
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
      socialLinks={socialLinks}
    />
  );
}

export function HomepageSections({
  sections,
  hero,
  partnershipSpotlights,
  programmeFinderData,
  socialLinks,
}: {
  sections: HomepageSection[];
  hero?: HomepageResolvedHero | null;
  partnershipSpotlights?: HomepagePartnershipSpotlight[];
  programmeFinderData?: ProgrammeFinderData;
  socialLinks?: HomeSocialLinks;
}) {
  const orderedSections = orderHomepageSections(sections);
  const factsSection = sections.find(
    (section) =>
      section.layout_variant === "facts_strip" ||
      section.section_key === "facts",
  );
  const hasMergedWhySection = sections.some(
    (section) =>
      section.layout_variant === "pillar_grid" &&
      section.section_key === "why-kisii",
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

  return (
    <>
      {orderedSections.map((section) => {
        if (hasMergedWhySection && section.layout_variant === "facts_strip") {
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
          <HomepageSectionRenderer
            key={section.id}
            section={section}
            hero={hero}
            factsSection={factsSection}
            partnershipSpotlights={partnershipSpotlights}
            academicDatesSection={academicDatesSection}
            eventsSection={eventsSection}
            programmeFinderData={programmeFinderData}
            socialLinks={socialLinks}
          />
        );
      })}
    </>
  );
}

function orderHomepageSections(sections: HomepageSection[]) {
  const nextSections = [...sections];
  const pulseIndex = nextSections.findIndex(
    (section) => section.layout_variant === "pulse_strip",
  );
  const partnershipIndex = nextSections.findIndex(
    (section) => section.layout_variant === "featured_partnership",
  );

  if (
    pulseIndex >= 0 &&
    partnershipIndex >= 0 &&
    partnershipIndex !== pulseIndex + 1
  ) {
    const [partnership] = nextSections.splice(partnershipIndex, 1);
    const nextPulseIndex = nextSections.findIndex(
      (section) => section.layout_variant === "pulse_strip",
    );
    nextSections.splice(nextPulseIndex + 1, 0, partnership);
  }

  const researchIndex = nextSections.findIndex(
    (section) => section.layout_variant === "research_cards",
  );
  const logoIndex = nextSections.findIndex(
    (section) => section.layout_variant === "logo_carousel",
  );
  if (researchIndex >= 0 && logoIndex >= 0 && logoIndex !== researchIndex + 1) {
    const [logoSection] = nextSections.splice(logoIndex, 1);
    const nextResearchIndex = nextSections.findIndex(
      (section) => section.layout_variant === "research_cards",
    );
    nextSections.splice(nextResearchIndex + 1, 0, logoSection);
  }

  return nextSections;
}

export const SUPPORTED_HOMEPAGE_SECTION_VARIANTS =
  HOMEPAGE_SECTION_LAYOUT_VARIANTS;
