"use client";

import { Alert, AlertDescription, AlertTitle } from "@ksu/ui/components";
import type { PageCmsSectionDefinition, PageSection, PageSectionPayload } from "@/lib/api/page-cms";
import { AcademicDatesEditor } from "./editors/academic-dates-editor";
import { HeroAdmissionsEditor } from "./editors/hero-admissions-editor";
import { PartnershipEditor } from "./editors/partnership-editor";
import { PillarGridEditor } from "./editors/pillar-grid-editor";
import { ProgrammePathwayEditor } from "./editors/programme-pathway-editor";
import { PulseEditor } from "./editors/pulse-editor";

export type SectionInspectorProps = {
  section: PageSection;
  definition: PageCmsSectionDefinition;
  onSave: (payload: PageSectionPayload) => void | Promise<void>;
  onDirtyChange: (dirty: boolean) => void;
  readOnly?: boolean;
};

export function SectionInspector(props: SectionInspectorProps) {
  switch (props.section.layout_variant) {
    case "hero_admissions": return <HeroAdmissionsEditor {...props} />;
    case "pulse_strip": return <PulseEditor {...props} />;
    case "featured_partnership": return <PartnershipEditor {...props} />;
    case "programme_finder": return <ProgrammePathwayEditor {...props} />;
    case "date_timeline": return <AcademicDatesEditor {...props} />;
    case "pillar_grid": return <PillarGridEditor {...props} />;
    case "media_mosaic":
    case "leadership_activity":
    case "research_cards":
    case "news_grid":
    case "events_list":
    case "logo_carousel":
    case "alumni_story":
    case "facts_strip":
      return <Alert><AlertTitle>Unsupported section template</AlertTitle><AlertDescription>{props.definition.label} is scheduled for the remaining domain editor work. No changes will be made to this section.</AlertDescription></Alert>;
    default:
      return <Alert><AlertTitle>Unsupported section template</AlertTitle><AlertDescription>This section cannot be edited here. No changes will be made to this section.</AlertDescription></Alert>;
  }
}
