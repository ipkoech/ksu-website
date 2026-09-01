export type ResearchDetailKind =
  | "project"
  | "program"
  | "center"
  | "innovation"
  | "publication"
  | "document"
  | "event"
  | "default";

export type ResearchSectionDensity = "compact" | "spacious";

export const publicStoryLabels = [
  "Research Story",
  "At a Glance",
  "Background",
  "Objectives",
  "Methodology",
  "Expected Outcomes",
  "Impact",
  "Deliverables",
  "Evidence & Outputs",
  "Impact Stories",
  "Milestones",
  "Partners in the Work",
  "In the Public Eye",
  "Explore Next",
] as const;

const detailSections: Record<ResearchDetailKind, string[]> = {
  project: [
    "Background",
    "Objectives",
    "Methodology",
    "Expected Outcomes",
    "Impact",
    "Deliverables",
  ],
  program: [
    "Programme Purpose",
    "Focus Areas",
    "Active Project Streams",
    "Evidence & Outputs",
    "Public Impact",
  ],
  center: [
    "Mandate",
    "Research Focus",
    "Current Work",
    "Evidence & Outputs",
    "Opportunities to Collaborate",
  ],
  innovation: [
    "The Problem",
    "The Solution",
    "Evidence So Far",
    "Path to Market",
    "Explore Collaboration",
  ],
  publication: [
    "Abstract",
    "Publication Details",
    "Citation",
    "Files & Links",
    "More Evidence from This Theme",
  ],
  document: [
    "Purpose",
    "Scope",
    "Key Requirements",
    "Downloads",
    "Need Clarification",
  ],
  event: [
    "Why This Event Matters",
    "Agenda",
    "Speakers",
    "Resources",
    "Contact",
  ],
  default: [
    "Overview",
    "Evidence & Outputs",
    "Impact Stories",
    "Milestones",
    "Explore Next",
  ],
};

export function getDetailStorySections(kind: ResearchDetailKind = "default") {
  return detailSections[kind];
}

export function getResearchSectionSpacing(density: ResearchSectionDensity = "compact") {
  return density === "spacious" ? "py-12" : "py-8";
}
