"use client";

import type { ComponentType } from "react";
import { Alert, AlertDescription, AlertTitle } from "@ksu/ui/components";
import type { PageCmsSectionDefinition, PageSection, PageSectionLayoutVariant, PageSectionPayload } from "@/lib/api/page-cms";
import { AcademicDatesEditor } from "./editors/academic-dates-editor";
import { AlumniEditor } from "./editors/alumni-editor";
import { EventsEditor } from "./editors/events-editor";
import { FactsEditor } from "./editors/facts-editor";
import { HeroAdmissionsEditor } from "./editors/hero-admissions-editor";
import { LeadershipEditor } from "./editors/leadership-editor";
import { MediaMosaicEditor } from "./editors/media-mosaic-editor";
import { NewsEditor } from "./editors/news-editor";
import { PartnerCarouselEditor } from "./editors/partner-carousel-editor";
import { PartnershipEditor } from "./editors/partnership-editor";
import { PillarGridEditor } from "./editors/pillar-grid-editor";
import { ProgrammePathwayEditor } from "./editors/programme-pathway-editor";
import { PulseEditor } from "./editors/pulse-editor";
import { ResearchEditor } from "./editors/research-editor";

export type SectionInspectorProps = {
  section: PageSection;
  definition: PageCmsSectionDefinition;
  onSave: (payload: PageSectionPayload) => void | Promise<void>;
  onDirtyChange: (dirty: boolean) => void;
  readOnly?: boolean;
};

type SectionEditor = ComponentType<SectionInspectorProps>;

const SECTION_EDITORS = {
  hero_admissions: HeroAdmissionsEditor,
  pulse_strip: PulseEditor,
  featured_partnership: PartnershipEditor,
  programme_finder: ProgrammePathwayEditor,
  date_timeline: AcademicDatesEditor,
  pillar_grid: PillarGridEditor,
  media_mosaic: MediaMosaicEditor,
  leadership_activity: LeadershipEditor,
  research_cards: ResearchEditor,
  news_grid: NewsEditor,
  events_list: EventsEditor,
  logo_carousel: PartnerCarouselEditor,
  alumni_story: AlumniEditor,
  facts_strip: FactsEditor,
} satisfies Record<PageSectionLayoutVariant, SectionEditor>;

export function SectionInspector(props: SectionInspectorProps) {
  const Editor = SECTION_EDITORS[props.section.layout_variant];
  if (props.definition.key !== props.section.layout_variant) return <Alert><AlertTitle>Template definition mismatch</AlertTitle><AlertDescription>The selected section does not match its definition. No changes will be made to this section.</AlertDescription></Alert>;
  return <Editor {...props} />;
}
