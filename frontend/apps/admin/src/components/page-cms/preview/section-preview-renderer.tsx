import type { PageCmsValidationIssue, PagePreviewSection } from "@/lib/api/page-cms";
import {
  AlumniStoryPreview,
  DateTimelinePreview,
  EmptyVariantPreview,
  EventsListPreview,
  FactsStripPreview,
  FeaturedPartnershipPreview,
  HeroAdmissionsPreview,
  LeadershipActivityPreview,
  LogoCarouselPreview,
  MediaMosaicPreview,
  NewsGridPreview,
  PillarGridPreview,
  ProgrammeFinderPreview,
  PulseStripPreview,
  ResearchCardsPreview,
  type PreviewViewport,
} from "./section-preview-shells";

export type SectionPreviewRendererProps = {
  section: PagePreviewSection;
  viewport: PreviewViewport;
  validationIssues?: PageCmsValidationIssue[];
};

export function SectionPreviewRenderer({ section, viewport, validationIssues = [] }: SectionPreviewRendererProps) {
  const issues = validationIssues.filter((issue) => issue.section_id === section.id);
  const shellProps = { section, viewport };
  let content;

  switch (section.layout_variant) {
    case "hero_admissions": content = <HeroAdmissionsPreview {...shellProps} />; break;
    case "pulse_strip": content = <PulseStripPreview {...shellProps} />; break;
    case "featured_partnership": content = <FeaturedPartnershipPreview {...shellProps} />; break;
    case "programme_finder": content = <ProgrammeFinderPreview {...shellProps} />; break;
    case "date_timeline": content = <DateTimelinePreview {...shellProps} />; break;
    case "pillar_grid": content = <PillarGridPreview {...shellProps} />; break;
    case "media_mosaic": content = <MediaMosaicPreview {...shellProps} />; break;
    case "leadership_activity": content = <LeadershipActivityPreview {...shellProps} />; break;
    case "research_cards": content = <ResearchCardsPreview {...shellProps} />; break;
    case "news_grid": content = <NewsGridPreview {...shellProps} />; break;
    case "events_list": content = <EventsListPreview {...shellProps} />; break;
    case "logo_carousel": content = <LogoCarouselPreview {...shellProps} />; break;
    case "alumni_story": content = <AlumniStoryPreview {...shellProps} />; break;
    case "facts_strip": content = <FactsStripPreview {...shellProps} />; break;
    default: content = <EmptyVariantPreview {...shellProps} />;
  }

  return (
    <div className="relative" data-layout-variant={section.layout_variant}>
      {content}
      {issues.length ? (
        <aside aria-label={`Validation issues for ${section.title || section.section_key}`} className="absolute right-3 top-3 max-w-64 space-y-1 border border-destructive bg-background p-2 text-xs shadow-sm">
          {issues.map((issue) => <p key={`${issue.code}-${issue.item_id ?? "section"}`} className={issue.severity === "error" ? "text-destructive" : "text-warning-foreground"}>{issue.message}</p>)}
        </aside>
      ) : null}
    </div>
  );
}
