import type { LucideIcon } from "lucide-react";
import {
  Award,
  BookOpen,
  Building2,
  CalendarDays,
  FileText,
  FlaskConical,
  GraduationCap,
  Handshake,
  Lightbulb,
  Newspaper,
  ScrollText,
  Target,
  Wrench,
} from "lucide-react";

export type ResearchSearchGroupKey =
  | "projects"
  | "publications"
  | "grants"
  | "innovations"
  | "partners"
  | "centers"
  | "facilities"
  | "outputs"
  | "resources"
  | "services"
  | "guidelines"
  | "training"
  | "scholarships"
  | "news"
  | "events";

export type SearchTabKey =
  | "all"
  | "projects"
  | "publications"
  | "funding"
  | "innovation"
  | "partners"
  | "resources"
  | "news-events";

export type ResearchSearchGroup = {
  key: ResearchSearchGroupKey;
  label: string;
  singular: string;
  route: string;
  tab: SearchTabKey;
  icon: LucideIcon;
  defaultImage: string;
  titleFields: string[];
  summaryFields: string[];
  dateFields: string[];
};

export type SearchRecord = Record<string, unknown> & {
  id?: string;
  slug?: string;
  is_featured?: boolean;
};

export type ResearchSearchResult = {
  id: string;
  groupKey: ResearchSearchGroupKey;
  tab: SearchTabKey;
  label: string;
  title: string;
  description: string;
  href: string;
  image: string;
  date: string;
  timestamp: number;
  status: string;
  isFeatured: boolean;
  isOpenAccess: boolean;
  chips: string[];
};

export type BackendResearchSearchResult = {
  id: string;
  type: string;
  title: string;
  description?: string | null;
  url?: string | null;
  date?: string | null;
  status?: string | null;
  is_featured?: boolean;
  metadata?: Record<string, unknown>;
};

export const RESEARCH_SEARCH_GROUPS: ResearchSearchGroup[] = [
  {
    key: "projects",
    label: "Projects",
    singular: "Project",
    route: "/projects",
    tab: "projects",
    icon: FlaskConical,
    defaultImage: "/images/research/research-projects-hero.webp",
    titleFields: ["title", "name"],
    summaryFields: ["summary", "abstract", "description", "impact"],
    dateFields: ["start_date", "published_at", "created_at"],
  },
  {
    key: "publications",
    label: "Publications",
    singular: "Publication",
    route: "/publications",
    tab: "publications",
    icon: BookOpen,
    defaultImage: "/images/research/research-demo-imagegen.webp",
    titleFields: ["title", "name"],
    summaryFields: ["abstract", "summary", "journal_name", "description"],
    dateFields: ["publication_date", "published_at", "created_at"],
  },
  {
    key: "grants",
    label: "Funding",
    singular: "Grant",
    route: "/funding",
    tab: "funding",
    icon: Award,
    defaultImage: "/images/research/sustainability-hero-imagegen.webp",
    titleFields: ["title", "name"],
    summaryFields: ["summary", "description", "eligibility"],
    dateFields: ["deadline", "published_at", "created_at"],
  },
  {
    key: "innovations",
    label: "Innovations",
    singular: "Innovation",
    route: "/innovations",
    tab: "innovation",
    icon: Lightbulb,
    defaultImage: "/images/research/research-innovation-hero.webp",
    titleFields: ["title", "name"],
    summaryFields: ["summary", "description", "about"],
    dateFields: ["published_at", "created_at", "updated_at"],
  },
  {
    key: "partners",
    label: "Partners",
    singular: "Partner",
    route: "/partners",
    tab: "partners",
    icon: Handshake,
    defaultImage: "/images/research/innovation-partnerships.png",
    titleFields: ["name", "title"],
    summaryFields: ["about", "summary", "description", "collaboration_areas"],
    dateFields: ["published_at", "created_at", "updated_at"],
  },
  {
    key: "centers",
    label: "Centers",
    singular: "Center",
    route: "/centers",
    tab: "projects",
    icon: Building2,
    defaultImage: "/images/research/research-home-hero.webp",
    titleFields: ["name", "title"],
    summaryFields: ["summary", "about", "description", "mandate"],
    dateFields: ["published_at", "created_at", "updated_at"],
  },
  {
    key: "facilities",
    label: "Facilities",
    singular: "Facility",
    route: "/facilities",
    tab: "projects",
    icon: Target,
    defaultImage: "/images/research/university-farm-hero-imagegen.webp",
    titleFields: ["name", "title"],
    summaryFields: ["summary", "about", "description"],
    dateFields: ["published_at", "created_at", "updated_at"],
  },
  {
    key: "outputs",
    label: "Outputs",
    singular: "Output",
    route: "/outputs",
    tab: "resources",
    icon: ScrollText,
    defaultImage: "/images/research/research-about-hero.webp",
    titleFields: ["title", "name"],
    summaryFields: ["summary", "abstract", "description"],
    dateFields: ["published_at", "publication_date", "created_at"],
  },
  {
    key: "resources",
    label: "Resources",
    singular: "Resource",
    route: "/resources-tools",
    tab: "resources",
    icon: FileText,
    defaultImage: "/images/research/research-about-hero.webp",
    titleFields: ["title", "name"],
    summaryFields: ["summary", "description", "content"],
    dateFields: ["published_at", "created_at", "updated_at"],
  },
  {
    key: "services",
    label: "Services",
    singular: "Service",
    route: "/services",
    tab: "resources",
    icon: Wrench,
    defaultImage: "/images/research/research-about-hero.webp",
    titleFields: ["title", "name"],
    summaryFields: ["summary", "description", "services_summary"],
    dateFields: ["published_at", "created_at", "updated_at"],
  },
  {
    key: "guidelines",
    label: "Guidelines",
    singular: "Guideline",
    route: "/guidelines",
    tab: "resources",
    icon: FileText,
    defaultImage: "/images/research/research-about-hero.webp",
    titleFields: ["title", "name"],
    summaryFields: ["summary", "description", "content"],
    dateFields: ["effective_date", "published_at", "created_at"],
  },
  {
    key: "training",
    label: "Training",
    singular: "Training",
    route: "/training",
    tab: "resources",
    icon: GraduationCap,
    defaultImage: "/images/research/research-events-hero.webp",
    titleFields: ["title", "name"],
    summaryFields: ["summary", "description", "about"],
    dateFields: ["start_date", "published_at", "created_at"],
  },
  {
    key: "scholarships",
    label: "Scholarships",
    singular: "Scholarship",
    route: "/scholarships",
    tab: "funding",
    icon: Award,
    defaultImage: "/images/research/research-events-hero.webp",
    titleFields: ["title", "name"],
    summaryFields: ["summary", "description", "eligibility"],
    dateFields: ["deadline", "published_at", "created_at"],
  },
  {
    key: "news",
    label: "News",
    singular: "News",
    route: "/news",
    tab: "news-events",
    icon: Newspaper,
    defaultImage: "/images/research/research-events-hero.webp",
    titleFields: ["title", "name"],
    summaryFields: ["summary", "excerpt", "description", "body"],
    dateFields: ["published_at", "created_at", "updated_at"],
  },
  {
    key: "events",
    label: "Events",
    singular: "Event",
    route: "/events",
    tab: "news-events",
    icon: CalendarDays,
    defaultImage: "/images/research/research-events-hero.webp",
    titleFields: ["title", "name"],
    summaryFields: ["summary", "description", "agenda", "body"],
    dateFields: ["event_date", "start_date", "published_at", "created_at"],
  },
];

export const SEARCH_TABS: Array<{ key: SearchTabKey; label: string }> = [
  { key: "all", label: "All" },
  { key: "projects", label: "Projects" },
  { key: "publications", label: "Publications" },
  { key: "funding", label: "Funding" },
  { key: "innovation", label: "Innovation" },
  { key: "partners", label: "Partners" },
  { key: "resources", label: "Resources" },
  { key: "news-events", label: "News & Events" },
];

export const relatedResearchAreas = [
  "Environmental Conservation",
  "Agriculture",
  "Public Health",
  "ICT",
  "Socio-Economics",
];

export const popularSearches = [
  "water quality",
  "climate change",
  "food security",
  "sustainable agriculture",
  "public health",
  "renewable energy",
];

export const suggestedSearches = [
  "Climate-smart agriculture",
  "Public health",
  "Water quality",
  "Innovation",
  "Grants",
  "Publications",
];

const groupByKey = new Map(RESEARCH_SEARCH_GROUPS.map((group) => [group.key, group]));

export function getSelectedSearchGroups(selected?: string | string[]) {
  const values = Array.isArray(selected)
    ? selected
    : selected
      ? selected.split(",")
      : [];
  const selectedKeys = new Set(values);

  if (selectedKeys.size === 0) return RESEARCH_SEARCH_GROUPS;

  return RESEARCH_SEARCH_GROUPS.filter((group) => selectedKeys.has(group.key));
}

export function getSearchGroup(key: ResearchSearchGroupKey) {
  return groupByKey.get(key);
}

export function buildSearchResult(
  record: SearchRecord,
  group: ResearchSearchGroup,
): ResearchSearchResult {
  const id = compactText(record.id) || `${group.key}-${compactText(record.slug)}`;
  const title = firstText(record, group.titleFields) || id || group.singular;
  const description = firstText(record, group.summaryFields);
  const rawDate = firstText(record, group.dateFields);
  const status = firstText(record, ["status"]);
  const year = firstText(record, ["year"]) || yearFromDate(rawDate);
  const center = firstText(record, ["center_name", "center", "location", "venue"]);
  const image = firstText(record, ["cover_image_url", "image_url", "logo_url"]) || group.defaultImage;
  const href = `${group.route}/${compactText(record.slug) || id}`;
  const isOpenAccess = Boolean(record.is_open_access) || firstText(record, ["access_type"]).toLowerCase() === "open";

  return {
    id,
    groupKey: group.key,
    tab: group.tab,
    label: group.singular,
    title,
    description,
    href,
    image,
    date: formatDate(rawDate),
    timestamp: timestampFromDate(rawDate),
    status,
    isFeatured: Boolean(record.is_featured),
    isOpenAccess,
    chips: [formatLabel(status), year, center].filter(Boolean).slice(0, 4),
  };
}

export function buildBackendSearchResult(
  record: BackendResearchSearchResult,
): ResearchSearchResult | null {
  const group = groupByKey.get(record.type as ResearchSearchGroupKey);
  if (!group) return null;

  const title = compactText(record.title) || group.singular;
  const description = compactText(record.description);
  const rawDate = compactText(record.date);
  const status = compactText(record.status);
  const metadata = record.metadata ?? {};
  const metadataChips = ["year", "center_id", "category", "publication_type", "grant_type"]
    .map((field) => formatLabel(compactText(metadata[field])))
    .filter(Boolean);

  return {
    id: compactText(record.id) || `${group.key}-${title}`,
    groupKey: group.key,
    tab: group.tab,
    label: compactText(metadata.label) || group.singular,
    title,
    description,
    href: compactText(record.url) || group.route,
    image: group.defaultImage,
    date: formatDate(rawDate),
    timestamp: timestampFromDate(rawDate),
    status,
    isFeatured: Boolean(record.is_featured),
    isOpenAccess:
      Boolean(metadata.is_open_access) ||
      compactText(metadata.access_type).toLowerCase() === "open",
    chips: [formatLabel(status), ...metadataChips].filter(Boolean).slice(0, 4),
  };
}

export function filterResultsByTab(results: ResearchSearchResult[], tab: SearchTabKey) {
  if (tab === "all") return results;
  return results.filter((result) => result.tab === tab);
}

export function sortSearchResults(
  results: ResearchSearchResult[],
  sort: string = "relevance",
) {
  return [...results].sort((a, b) => {
    if (sort === "newest") return b.timestamp - a.timestamp;
    if (sort === "title") return a.title.localeCompare(b.title);
    return Number(b.isFeatured) - Number(a.isFeatured) || b.timestamp - a.timestamp;
  });
}

export function pickTopMatch(results: ResearchSearchResult[]) {
  return sortSearchResults(results)[0] ?? null;
}

export function highlightSnippet(text: string, query: string) {
  const cleanText = compactText(text);
  const cleanQuery = compactText(query);
  if (!cleanText || !cleanQuery) return cleanText;
  const index = cleanText.toLowerCase().indexOf(cleanQuery.toLowerCase());
  if (index < 0) return cleanText;
  const before = cleanText.slice(Math.max(0, index - 80), index);
  const match = cleanText.slice(index, index + cleanQuery.length);
  const after = cleanText.slice(index + cleanQuery.length, index + cleanQuery.length + 140);
  return `${before ? "..." : ""}${before}<mark>${match}</mark>${after}${after.length === 140 ? "..." : ""}`;
}

export function compactText(value: unknown) {
  if (value === null || value === undefined) return "";
  if (typeof value === "object") return "";
  return String(value).replace(/\s+/g, " ").trim();
}

export function formatLabel(value: string) {
  return compactText(value)
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function firstText(record: SearchRecord, fields: string[]) {
  for (const field of fields) {
    const value = compactText(record[field]);
    if (value) return value;
  }
  return "";
}

function yearFromDate(value: string) {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : String(date.getFullYear());
}

function timestampFromDate(value: string) {
  if (!value) return 0;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 0 : date.getTime();
}

function formatDate(value: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}
