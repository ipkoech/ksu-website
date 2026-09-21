export const RESEARCH_REVALIDATION_ALIASES: Record<string, string> = {
  projects: "projects",
  grants: "grants",
  profile: "profile",
  content: "content",
  events: "events",
  news: "news",
  blogs: "blogs",
  announcements: "announcements",
  sliders: "sliders",
  staff: "staff",
  activities: "activities",
  "sustainability-activities": "sustainability-activities",
  centers: "centers",
  facilities: "facilities",
  "expertise-tags": "expertise-tags",
  donations: "donations",
  training: "training",
  mentorship: "mentorship",
  scholarships: "scholarships",
  consultancies: "consultancies",
  outputs: "outputs",
  programs: "programs",
  partners: "partners",
  publications: "publications",
  journals: "publications",
  themes: "themes",
  "donation-settings": "donation-settings",
  guidelines: "guidelines",
  resources: "resources",
  services: "services",
  innovations: "innovations",
  incubation: "incubation",
  startups: "startups",
  competitions: "competitions",
  "technology-transfer": "technology-transfer",
  "incubation-records": "incubation",
  "competition-entries": "competitions",
  "technology-transfer-cases": "technology-transfer",
  sustainability: "sustainability",
  stories: "stories",
  "donation-stories": "donation-stories",
  "research-stories": "research-stories",
  "impact-metrics": "impact-metrics",
  farms: "farms",
  farm: "farms",
  "farm-focus-areas": "farms",
  "farm-impact-stories": "farms",
  "farm-projects": "farms",
  "farm-partnerships": "farms",
  "focus-areas": "farms",
  fundings: "grants",
  "grant-reviews": "grants",
  "grant-reports": "grants",
  "grant-applications": "grants",
  funders: "grants",
  endowments: "endowments",
  "grant-guidelines": "guidelines",
  "sustainability-partners": "sustainability",
  "mentorship-applications": "mentorship",
  "mentorship-matches": "mentorship",
  "scholarship-applications": "scholarships",
};

export function inferResearchRevalidationResource(queryKey: readonly unknown[]) {
  const parts = queryKey
    .filter((part): part is string => typeof part === "string")
    .map((part) => part.toLowerCase());

  if (parts.some((part) => part === "farm" || part.startsWith("farm-"))) {
    return "farms";
  }
  if (parts.some((part) => part === "sustainability" || part.startsWith("sustainability-"))) {
    return "sustainability";
  }
  if (parts.some((part) => part === "fundings" || part.startsWith("grant-"))) {
    return "grants";
  }
  if (parts.includes("donations") || parts.includes("donation-settings")) {
    return "donations";
  }

  for (const part of [...parts].reverse()) {
    const resource = RESEARCH_REVALIDATION_ALIASES[part];
    if (resource) return resource;
  }

  return undefined;
}
