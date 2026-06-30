"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowRight,
  CheckCircle2,
  HelpCircle,
  Info,
  ListChecks,
  Sparkles,
  X,
} from "lucide-react";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@ksu/ui/components";
import { cn } from "@ksu/ui/lib";
import { userPreferencesApi } from "@ksu/api-client";

const RESEARCH_TOUR_PREFERENCE_NAMESPACE = "onboarding";
const RESEARCH_TOUR_PREFERENCE_KEY = "research-admin:v1";

export interface ResearchGuidanceConfig {
  title: string;
  description: string;
  steps: string[];
  publicPortalNote?: string;
  emptyState: {
    title: string;
    description: string;
    primaryActionLabel?: string;
  };
}

export interface ResearchDetailGuidanceConfig {
  title: string;
  description: string;
  relationships: string[];
  publishChecklist: string[];
  publicPortalNote?: string;
}

export const researchFirstLoginTour = [
  "Use the dashboard to review activity, drafts, and high-priority research records.",
  "Start with core records: projects, grants, centers, publications, partners, and outputs.",
  "Keep records in draft while incomplete, then publish only content ready for the public portal.",
  "Preview the public research portal after publishing to confirm the update is visible.",
];

const defaultGuidance: ResearchGuidanceConfig = {
  title: "Research Section Guide",
  description: "Use this section to maintain research records and keep the public portal accurate.",
  steps: [
    "Create the core record with a clear title, summary, and owner.",
    "Link related records so dashboard and public pages stay connected.",
    "Set status and visibility before saving.",
    "Preview public-facing changes when publishing.",
  ],
  publicPortalNote: "Public or featured records may appear on the research portal after save.",
  emptyState: {
    title: "No records yet",
    description: "Create the first record, then link related research entities as they become available.",
    primaryActionLabel: "Create record",
  },
};

const guidanceByTitle: Record<string, ResearchGuidanceConfig> = {
  "Research Dashboard": {
    title: "Research Office Workflow",
    description: "Use the dashboard to decide what needs attention before editing individual records.",
    steps: [
      "Check activity and metrics to understand recent changes.",
      "Open quick actions for projects, grants, news, and events.",
      "Review drafts and incomplete records in each section.",
      "Preview the public portal after publishing visible updates.",
    ],
    publicPortalNote: "The dashboard is the control point; section pages are where records are created and published.",
    emptyState: {
      title: "No research activity yet",
      description: "Start by adding projects, grants, publications, or content records.",
      primaryActionLabel: "Create record",
    },
  },
  Projects: {
    title: "Projects Guide",
    description: "Manage institutional research projects from proposal through completion.",
    steps: [
      "Add project basics: title, code, summary, dates, and project type.",
      "Link the project to a research program, center, principal investigator, and grant where applicable.",
      "Attach outputs, publications, partners, and impact records from their related sections.",
      "Publish only records with complete summaries, visibility settings, and public-ready images.",
    ],
    publicPortalNote: "Public projects can surface on project listings and related center, grant, and output pages.",
    emptyState: {
      title: "No draft projects",
      description: "Create a project or import records, then link grants, centers, outputs, and partners.",
      primaryActionLabel: "Create project",
    },
  },
  Grants: {
    title: "Grants Guide",
    description: "Manage funding calls, award details, deadlines, and grant visibility.",
    steps: [
      "Create the grant with funder, category, budget range, and deadline.",
      "Use status to separate draft, open, reviewing, awarded, and archived grants.",
      "Link projects through applications, reports, and project funding relationships.",
      "Publish open or awarded opportunities only when dates and eligibility are ready.",
    ],
    publicPortalNote: "Open and featured grants can appear in public funding areas.",
    emptyState: {
      title: "No grants available",
      description: "Add an internal or external grant, then connect applications, reviews, reports, and linked projects.",
      primaryActionLabel: "Create grant",
    },
  },
  Publications: {
    title: "Publications Guide",
    description: "Track publications, journals, open access details, and research outputs.",
    steps: [
      "Capture citation basics: title, authors, publication type, date, DOI, and journal.",
      "Link publications to projects, centers, and researchers where possible.",
      "Mark open access and public visibility only when the external link is valid.",
      "Use featured status for priority outputs that should stand out publicly.",
    ],
    publicPortalNote: "Public publications and open-access metadata help visitors discover research outputs.",
    emptyState: {
      title: "No publications yet",
      description: "Add publications manually or import records, then link them to projects, centers, and authors.",
      primaryActionLabel: "Create publication",
    },
  },
  "Research Reports": {
    title: "Reports Guide",
    description: "Use reports to export research data, prepare standard summaries, and stage future AI-assisted reporting.",
    steps: [
      "Start with standard report categories: portfolio, funding, publications, impact, capacity, and donations.",
      "Use data exports when you need auditable CSV datasets for analysis or sharing.",
      "Manage report-type outputs separately when publishing formal research reports to the portal.",
      "Keep AI-assisted reporting grounded in exported or retrieved backend records when that phase is introduced.",
    ],
    publicPortalNote: "Exported admin datasets stay private; published report outputs can appear on the public research portal.",
    emptyState: {
      title: "No generated reports yet",
      description: "Use exports and report outputs first. AI-generated reports will be added as a separate workflow.",
      primaryActionLabel: "Open exports",
    },
  },
  "Research Content": {
    title: "Content Guide",
    description: "Maintain public research news, events, staff profiles, sliders, boards, and gallery items.",
    steps: [
      "Create content in draft while copy, dates, media, and links are still being prepared.",
      "Use events for time-bound activities and news or blogs for announcements and stories.",
      "Attach strong images and short summaries for public listing pages.",
      "Publish after checking dates, visibility, and public portal placement.",
    ],
    publicPortalNote: "Published content can appear immediately on the public research portal after revalidation.",
    emptyState: {
      title: "No content records",
      description: "Create news, events, sliders, gallery items, staff records, or board members for the research portal.",
      primaryActionLabel: "Create content",
    },
  },
  "Research Capacity": {
    title: "Capacity Guide",
    description: "Coordinate training, scholarships, mentorship, consultancies, and applications.",
    steps: [
      "Create programs or opportunities before collecting related applications.",
      "Use status fields to separate open, pending, matched, approved, and closed work.",
      "Link applicants, mentors, scholarships, and training records where available.",
      "Publish opportunities only when eligibility, timelines, and contact paths are clear.",
    ],
    emptyState: {
      title: "No capacity records",
      description: "Start by adding a training program, scholarship, mentorship program, or consultancy opportunity.",
      primaryActionLabel: "Create record",
    },
  },
  Donations: {
    title: "Donations Guide",
    description: "Manage donors, donations, campaigns, impact stories, and giving settings.",
    steps: [
      "Create donors and donation records with clear campaign or purpose details.",
      "Connect donation impact stories to projects, centers, or supported activities.",
      "Keep financial records accurate before marking public-facing impact content visible.",
      "Review giving settings before promoting campaigns publicly.",
    ],
    emptyState: {
      title: "No donation records",
      description: "Create donors, donation records, campaigns, or impact stories to show how research support is used.",
      primaryActionLabel: "Create donation record",
    },
  },
  "University Farm": {
    title: "Farm Guide",
    description: "Manage farm projects, farms, activities, partnerships, focus areas, and impact stories.",
    steps: [
      "Create farms and focus areas before adding related activities or projects.",
      "Link activities to projects and partnerships so farm work is traceable.",
      "Use impact stories for public-ready outcomes and field updates.",
      "Publish records only when images, summaries, and dates are complete.",
    ],
    emptyState: {
      title: "No farm records",
      description: "Start with farms or focus areas, then add projects, activities, partners, and impact stories.",
      primaryActionLabel: "Create farm record",
    },
  },
  Sustainability: {
    title: "Sustainability Guide",
    description: "Coordinate sustainability projects, partners, activities, and public outcomes.",
    steps: [
      "Create sustainability projects with clear goals, timelines, and responsible teams.",
      "Link activities and partners so progress can be tracked by initiative.",
      "Use public visibility for complete activities and outcomes.",
      "Feature priority initiatives that should appear prominently on the public portal.",
    ],
    emptyState: {
      title: "No sustainability records",
      description: "Add projects, activities, or partners, then publish complete sustainability outcomes.",
      primaryActionLabel: "Create record",
    },
  },
  "Research Settings": {
    title: "Settings Guide",
    description: "Configure research services, guidelines, resources, sliders, and office-level portal settings.",
    steps: [
      "Keep service and guideline copy concise because it often appears on public-facing pages.",
      "Use resources for downloadable or linked materials that support researchers.",
      "Check slider and media records for complete image URLs and accessible summaries.",
      "Review settings after large content changes to keep navigation and public copy aligned.",
    ],
    emptyState: {
      title: "No settings records",
      description: "Create services, guidelines, resources, or sliders to configure the research portal experience.",
      primaryActionLabel: "Create setting",
    },
  },
};

const fieldHelp: Record<string, string> = {
  slug: "The URL-friendly identifier. Leave blank to generate it from the title when possible.",
  status: "Use status to separate drafts, review work, published records, and archived items.",
  is_public: "Visible on the public research portal after save when the record is otherwise eligible.",
  is_featured: "Highlights this record in priority lists or featured public sections.",
  is_active: "Keeps the record available for admin workflows and relationship pickers.",
  is_open_access: "Marks the publication or output as freely accessible through its public link.",
  center_id: "Connects the record to a research center for filtering, reporting, and public relationships.",
  program_id: "Connects the record to a research program or initiative.",
  project_id: "Connects this record to the project it supports or describes.",
  grant_id: "Connects this record to a funding source or opportunity.",
  pi_id: "Identifies the principal investigator responsible for the project.",
};

const detailGuidanceByTitle: Record<string, ResearchDetailGuidanceConfig> = {
  "Research Project": {
    title: "Project Detail Guide",
    description: "Verify the project story, ownership, funding, progress, and public readiness.",
    relationships: ["Center", "Program", "Principal investigator", "Grant", "Publications", "Outputs", "Partners", "Impact"],
    publishChecklist: [
      "Confirm the summary, objectives, methods, outcomes, and impact are public-ready.",
      "Check project status, progress, dates, public visibility, and featured settings.",
      "Verify center, program, PI, grant, and public visibility before publishing.",
    ],
    publicPortalNote: "Public projects can appear on project listings and related center, grant, output, and partner pages.",
  },
  Grant: {
    title: "Grant Detail Guide",
    description: "Review the funding call, eligibility, deadlines, applications, and linked research work.",
    relationships: ["Applications", "Reports", "Projects", "Guidelines", "Endowments"],
    publishChecklist: [
      "Confirm funder, budget range, deadline, eligibility, and application instructions.",
      "Use status to distinguish draft, open, reviewing, awarded, and archived grants.",
      "Publish only when dates, application links, and public copy are accurate.",
    ],
    publicPortalNote: "Open or featured grants can appear in public funding areas.",
  },
  Publication: {
    title: "Publication Detail Guide",
    description: "Check publication metadata, access links, identifiers, authors, and linked research records.",
    relationships: ["Project", "Center", "Journal", "Authors", "Grant reports"],
    publishChecklist: [
      "Confirm title, type, journal or publisher, year, DOI, URL, and PDF link.",
      "Check open-access status and public visibility before publishing.",
      "Link the publication to its project, center, authors, and grant reports where applicable.",
    ],
    publicPortalNote: "Public and open-access publication metadata helps visitors discover research outputs.",
  },
  "Research Center": {
    title: "Center Detail Guide",
    description: "Review the center profile, mandate, contact details, programs, projects, and publications.",
    relationships: ["Projects", "Publications", "Programs", "Training", "Staff"],
    publishChecklist: [
      "Confirm profile copy, mandate, contact details, and public images.",
      "Check active status and public visibility before publishing.",
      "Review linked projects, publications, programs, and training records.",
    ],
    publicPortalNote: "Public centers anchor related project, publication, program, and staff discovery.",
  },
  "Research Partner": {
    title: "Partner Detail Guide",
    description: "Review partner profile, collaboration areas, public contact details, and linked outcomes.",
    relationships: ["Projects", "Farm sites", "Activities", "Impact stories", "Metrics", "Consultancies", "Sustainability"],
    publishChecklist: [
      "Confirm partner identity, collaboration level, country, and summary.",
      "Check public visibility and featured settings before publishing.",
      "Review linked projects, activities, impact stories, metrics, and consultancies.",
    ],
    publicPortalNote: "Public partners can appear on partner listings and related project or impact pages.",
  },
  "Farm Profile": {
    title: "Farm Detail Guide",
    description: "Review farm facilities, operations, projects, activities, partnerships, and impact stories.",
    relationships: ["Projects", "Partners", "Activities", "Impact stories"],
    publishChecklist: [
      "Confirm farm profile, location, operations, capacity, products, and contact details.",
      "Check public visibility and profile image readiness.",
      "Review farm projects, partners, activities, and impact stories.",
    ],
    publicPortalNote: "Public farm records support farm project, activity, and impact pages.",
  },
  "Sustainability Initiative": {
    title: "Sustainability Detail Guide",
    description: "Review objectives, activities, partners, metrics, training, and public outcomes.",
    relationships: ["Projects", "Partners", "Activities", "Environmental metrics", "Training", "Impact stories"],
    publishChecklist: [
      "Confirm objectives, approach, contact details, and public summary.",
      "Check active status, public visibility, and featured settings.",
      "Review linked projects, partners, activities, metrics, training, and stories.",
    ],
    publicPortalNote: "Public sustainability records can appear on sustainability and related impact pages.",
  },
  "Donation Record": {
    title: "Donation Detail Guide",
    description: "Review donation value, designation, donor linkage, purpose, status, and impact evidence.",
    relationships: ["Donor", "Other donations", "Stories", "Impact records"],
    publishChecklist: [
      "Confirm amount, currency, donor, designation, purpose, and received date.",
      "Keep financial and donor details accurate before linking public impact content.",
      "Review related stories and impact records before promoting outcomes publicly.",
    ],
    publicPortalNote: "Donation records may support public impact stories after review.",
  },
  "Research Donor": {
    title: "Donor Detail Guide",
    description: "Review donor profile, giving history, stories, and impact relationships.",
    relationships: ["Donation records", "Donor stories", "Impact records"],
    publishChecklist: [
      "Confirm donor identity, recognition preferences, and status.",
      "Review donations, stories, and impact records before public recognition.",
      "Check public visibility only after donor consent and profile readiness.",
    ],
    publicPortalNote: "Only consented, public-ready donor recognition should appear publicly.",
  },
  "Donation Impact": {
    title: "Donation Impact Guide",
    description: "Review impact evidence, source linkage, public story readiness, and related giving records.",
    relationships: ["Donations", "Published stories", "Related impact records"],
    publishChecklist: [
      "Confirm impact title, metric, source, reporting date, and supporting summary.",
      "Check public visibility only when the outcome is verified.",
      "Link donations and published stories that support the impact claim.",
    ],
    publicPortalNote: "Public impact records should be supported by accurate donation or project evidence.",
  },
  "Donation Story": {
    title: "Donation Story Guide",
    description: "Review story copy, donor context, images, impact linkage, and publication readiness.",
    relationships: ["Donor donations", "Other stories", "Impact records"],
    publishChecklist: [
      "Confirm headline, story body, image, date, and donor recognition details.",
      "Check related donations and impact records before publishing.",
      "Publish only complete, consented, public-ready stories.",
    ],
    publicPortalNote: "Published donation stories shape how public audiences understand research support.",
  },
};

const defaultDetailGuidance: ResearchDetailGuidanceConfig = {
  title: "Detail Guide",
  description: "Review this record before publishing or linking it from other research pages.",
  relationships: ["Owner", "Related records", "Public links"],
  publishChecklist: [
    "Confirm title, summary, status, and public visibility.",
    "Check related records so public pages and reports stay connected.",
    "Preview public-facing pages when visibility changes.",
  ],
  publicPortalNote: "Records marked public or featured may appear on the public research portal.",
};

export function getResearchGuidance(title?: string): ResearchGuidanceConfig | undefined {
  if (!title) return defaultGuidance;
  return guidanceByTitle[title] ?? defaultGuidance;
}

export function getResearchDetailGuidance(title?: string): ResearchDetailGuidanceConfig | undefined {
  if (!title) return defaultDetailGuidance;
  return detailGuidanceByTitle[title] ?? defaultDetailGuidance;
}

export function getResearchFieldHelp(fieldName: string) {
  return fieldHelp[fieldName];
}

export function ResearchFirstLoginTour({
  className,
  storageKey = "ksu.researchAdmin.firstLoginTour.dismissed",
}: {
  className?: string;
  storageKey?: string;
}) {
  const [visible, setVisible] = useState(false);
  const queryClient = useQueryClient();

  const preferencesQuery = useQuery({
    queryKey: ["me", "preferences"],
    queryFn: () => userPreferencesApi.get(),
    retry: false,
  });

  const dismissPreference = useMutation({
    mutationFn: () =>
      userPreferencesApi.update({
        preferences: [
          {
            namespace: RESEARCH_TOUR_PREFERENCE_NAMESPACE,
            key: RESEARCH_TOUR_PREFERENCE_KEY,
            value: {
              completed: true,
              completed_at: new Date().toISOString(),
            },
          },
        ],
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["me", "preferences"] });
    },
  });

  useEffect(() => {
    if (preferencesQuery.isLoading) return;

    const storedDismissed = window.localStorage.getItem(storageKey) === "true";
    if (preferencesQuery.isError) {
      setVisible(!storedDismissed);
      return;
    }

    const completed = preferencesQuery.data?.data.preferences.some(
      (preference) =>
        preference.namespace === RESEARCH_TOUR_PREFERENCE_NAMESPACE &&
        preference.key === RESEARCH_TOUR_PREFERENCE_KEY &&
        isCompletedPreference(preference.value),
    );

    if (completed) {
      window.localStorage.setItem(storageKey, "true");
      setVisible(false);
      return;
    }

    setVisible(!storedDismissed);
  }, [preferencesQuery.data, preferencesQuery.isError, preferencesQuery.isLoading, storageKey]);

  const dismiss = () => {
    window.localStorage.setItem(storageKey, "true");
    setVisible(false);
    dismissPreference.mutate();
  };

  if (!visible) return null;

  return (
    <Card className={cn("border-primary/25 bg-primary/5 shadow-sm", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex gap-3">
            <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Sparkles className="size-4" />
            </div>
            <div>
              <CardTitle className="text-base">Start here</CardTitle>
              <CardDescription>
                Review drafts, publish updates, and preview the public portal.
              </CardDescription>
            </div>
          </div>
          <Button type="button" variant="ghost" size="icon" aria-label="Skip research guide" onClick={dismiss}>
            <X className="size-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <ol className="grid gap-2 sm:grid-cols-2">
          {researchFirstLoginTour.map((step, index) => (
            <li key={step} className="flex gap-2 rounded-md border bg-background/80 p-3 text-sm">
              <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                {index + 1}
              </span>
              <span className="text-muted-foreground">{step}</span>
            </li>
          ))}
        </ol>
        <div className="flex flex-wrap gap-2">
          <Button type="button" size="sm" onClick={dismiss}>
            Next
            <ArrowRight className="ml-2 size-4" />
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={dismiss}>
            Skip
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function isCompletedPreference(value: unknown) {
  return Boolean(
    value &&
      typeof value === "object" &&
      "completed" in value &&
      (value as { completed?: unknown }).completed === true,
  );
}

export function ResearchSectionGuide({
  title,
  className,
  actions,
}: {
  title?: string;
  className?: string;
  actions?: ReactNode;
}) {
  const guide = getResearchGuidance(title);
  if (!guide) return null;

  return (
    <ResearchGuideTrigger
      title={guide.title}
      description={guide.description}
      tooltip={`${guide.title}: ${guide.description}`}
      className={className}
    >
      <div className="space-y-5">
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase text-muted-foreground">What to do here</p>
          <div className="grid gap-2">
            {guide.steps.map((step) => (
              <div key={step} className="flex gap-2 text-sm">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                <span className="text-muted-foreground">{step}</span>
              </div>
            ))}
          </div>
        </div>

        {guide.publicPortalNote ? (
          <div className="flex gap-2 rounded-md border bg-background p-3 text-sm text-muted-foreground">
            <Info className="mt-0.5 size-4 shrink-0 text-primary" />
            <span>{guide.publicPortalNote}</span>
          </div>
        ) : null}
        {actions}
      </div>
    </ResearchGuideTrigger>
  );
}

export function ResearchDetailGuide({
  title,
  status,
  isPublic,
  className,
}: {
  title?: string;
  status?: unknown;
  isPublic?: unknown;
  className?: string;
}) {
  const guide = getResearchDetailGuidance(title);
  if (!guide) return null;
  const statusLabel = typeof status === "string" && status ? status.replace(/_/g, " ") : "Status not set";
  const visibility =
    typeof isPublic === "boolean" ? (isPublic ? "Public" : "Private") : "Visibility not set";

  return (
    <ResearchGuideTrigger
      title={guide.title}
      description={guide.description}
      tooltip={`${guide.title}: ${guide.description}`}
      className={className}
    >
      <div className="space-y-5">
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="rounded-md border bg-background px-2 py-1 capitalize text-muted-foreground">
            {statusLabel}
          </span>
          <span className="rounded-md border bg-background px-2 py-1 text-muted-foreground">
            {visibility}
          </span>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase text-muted-foreground">Before publishing</p>
          {guide.publishChecklist.map((step) => (
            <div key={step} className="flex gap-2 text-sm">
              <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
              <span className="text-muted-foreground">{step}</span>
            </div>
          ))}
        </div>

        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase text-muted-foreground">Review relationships</p>
          <div className="flex flex-wrap gap-2">
            {guide.relationships.map((relationship) => (
              <span
                key={relationship}
                className="rounded-md border bg-background px-2 py-1 text-xs text-muted-foreground"
              >
                {relationship}
              </span>
            ))}
          </div>
        </div>

        {guide.publicPortalNote ? (
          <div className="flex gap-2 rounded-md border bg-background p-3 text-sm text-muted-foreground">
            <Info className="mt-0.5 size-4 shrink-0 text-primary" />
            <span>{guide.publicPortalNote}</span>
          </div>
        ) : null}
      </div>
    </ResearchGuideTrigger>
  );
}

function ResearchGuideTrigger({
  title,
  description,
  tooltip,
  className,
  children,
}: {
  title: string;
  description: string;
  tooltip: string;
  className?: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <TooltipProvider delayDuration={150}>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              className={cn(
                "inline-flex size-9 items-center justify-center rounded-md border bg-background text-primary shadow-sm transition-colors hover:bg-primary/10 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                className,
              )}
              aria-label={`Open ${title} guidance`}
              onClick={() => setOpen(true)}
            >
              <Info className="size-4" />
            </button>
          </TooltipTrigger>
          <TooltipContent className="max-w-72 text-sm" side="top" align="start">
            {tooltip}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <SheetContent className="flex w-full flex-col gap-0 overflow-y-auto p-0 sm:max-w-md">
        <SheetHeader className="border-b px-6 py-5">
          <div className="flex items-start gap-3 pr-8">
            <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-md border bg-primary/10 text-primary">
              <ListChecks className="size-4" />
            </div>
            <div className="min-w-0">
              <SheetTitle>{title}</SheetTitle>
              <SheetDescription>{description}</SheetDescription>
            </div>
          </div>
        </SheetHeader>
        <div className="px-6 py-5">{children}</div>
      </SheetContent>
    </Sheet>
  );
}

export function ResearchFieldHelp({ fieldName, help }: { fieldName: string; help?: string }) {
  const text = help ?? getResearchFieldHelp(fieldName);
  if (!text) return null;

  return (
    <TooltipProvider delayDuration={150}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            className="inline-flex size-5 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label={`Help for ${fieldName.replace(/_/g, " ")}`}
          >
            <HelpCircle className="size-3.5" />
          </button>
        </TooltipTrigger>
        <TooltipContent className="max-w-64 text-sm" side="top" align="start">
          {text}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
