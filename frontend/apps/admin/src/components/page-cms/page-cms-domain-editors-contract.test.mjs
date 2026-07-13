import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function read(relativePath) {
  const filePath = path.join(__dirname, relativePath);
  assert(fs.existsSync(filePath), `Expected Page CMS domain editor: ${relativePath}`);
  return fs.readFileSync(filePath, "utf8");
}

function expectSnippets(source, fileName, snippets) {
  for (const snippet of snippets) {
    assert(source.includes(snippet), `Expected ${fileName} to include: ${snippet}`);
  }
}

const editors = [
  ["editors/media-mosaic-editor.tsx", ["MediaMosaicEditor", "SectionMediaRoles", "media_alt_text", "media_caption", "media_links", "definition.max_items", "itemLimitError", "Attachment roles"]],
  ["editors/leadership-editor.tsx", ["LeadershipEditor", "\"person\"", "\"staff_assignment\"", "\"club_activity\"", "Leadership activity", "definition.max_items", "itemLimitError"]],
  ["editors/research-editor.tsx", ["ResearchEditor", "\"research_project\"", "\"publication\"", "Research projects", "Publications", "definition.max_items", "itemLimitError"]],
  ["editors/news-editor.tsx", ["NewsEditor", "sourceType=\"news\"", "News sources", "definition.max_items", "itemLimitError"]],
  ["editors/events-editor.tsx", ["EventsEditor", "sourceType=\"event\"", "Event sources", "definition.max_items", "itemLimitError"]],
  ["editors/partner-carousel-editor.tsx", ["PartnerCarouselEditor", "sourceType=\"research_partner\"", "Active research partners", "Logo order", "Move partner up", "definition.max_items", "itemLimitError"]],
  ["editors/alumni-editor.tsx", ["AlumniEditor", "\"alumni\"", "\"testimonial\"", "Alumni profiles", "Testimonials", "definition.max_items", "itemLimitError"]],
  ["editors/facts-editor.tsx", ["FactsEditor", "sourceType=\"public_stat\"", "Verified public statistics", "Source date", "Verification state", "definition.max_items", "itemLimitError"]],
];

for (const [fileName, snippets] of editors) {
  const source = read(fileName);
  expectSnippets(source, fileName, snippets);
  for (const forbidden of ["JSON", "Source ID", "source_id\""]) {
    assert(!source.includes(forbidden), `${fileName} must not expose raw source or JSON editing: ${forbidden}`);
  }
}

const mediaMosaic = read("editors/media-mosaic-editor.tsx");
assert(mediaMosaic.includes("staged and linked only when this section is saved"), "Media mosaic must stage media before save");

const facts = read("editors/facts-editor.tsx");
assert(facts.includes("selectable"), "Facts editor must explain an unavailable public statistic");
assert(facts.includes("verified"), "Facts editor must require verified public statistics");

const inspector = read("section-inspector.tsx");
expectSnippets(inspector, "section-inspector.tsx", [
  "const SECTION_EDITORS",
  "satisfies Record<PageSectionLayoutVariant",
  "media_mosaic: MediaMosaicEditor",
  "leadership_activity: LeadershipEditor",
  "research_cards: ResearchEditor",
  "news_grid: NewsEditor",
  "events_list: EventsEditor",
  "logo_carousel: PartnerCarouselEditor",
  "alumni_story: AlumniEditor",
  "facts_strip: FactsEditor",
]);

console.log("Page CMS domain editor contract passed.");
