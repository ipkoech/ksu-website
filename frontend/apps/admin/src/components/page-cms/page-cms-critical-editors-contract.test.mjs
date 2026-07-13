import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const editorRoot = path.join(here, "editors");

function read(relativePath) {
  const filePath = path.join(here, relativePath);
  assert.ok(fs.existsSync(filePath), `Expected Task 10 editor file: ${relativePath}`);
  return fs.readFileSync(filePath, "utf8");
}

function expectSnippets(source, relativePath, snippets) {
  for (const snippet of snippets) {
    assert.ok(source.includes(snippet), `Expected ${relativePath} to include: ${snippet}`);
  }
}

const sharedSource = read("editors/shared-section-fields.tsx");
expectSnippets(sharedSource, "editors/shared-section-fields.tsx", [
  "export function mergeSectionSettings",
  "export function toDateTimeInput",
  "export function fromDateTimeInput",
  "export function itemLimitError",
  "AttachmentManager",
  "Published changes reset approval",
  "onDirtyChange",
  "Save changes",
  "Reset",
]);

// Exercise the source adapter itself. The exported functions deliberately use
// simple object and string operations so this test can execute their source
// without a browser or the React module graph.
const adapterSource = sharedSource
  .match(/export function mergeSectionSettings[\s\S]*?\n}\n\nexport function toDateTimeInput[\s\S]*?\n}\n\nexport function fromDateTimeInput[\s\S]*?\n}\n\nexport function itemLimitError[\s\S]*?\n}/)?.[0]
  .replaceAll("export function", "function")
  .replace(/: SectionSettings \| null \| undefined/g, "")
  .replace(/: readonly string\[\]/g, "")
  .replace(/: SectionSettings/g, "")
  .replace(/: string \| null \| undefined/g, "")
  .replace(/: string \| null/g, "")
  .replace(/: string/g, "")
  .replace(/: number/g, "")
  .replace(/ as SectionSettings/g, "");
assert.ok(adapterSource, "Expected executable shared settings adapters");
const adapters = Function(`${adapterSource}; return { mergeSectionSettings, toDateTimeInput, fromDateTimeInput, itemLimitError };`)();

const roundTrip = adapters.mergeSectionSettings(
  { legacy_flag: true, priority: 1, nested_legacy: { retained: true } },
  ["priority", "expires_at"],
  { priority: 4, expires_at: "2026-07-13T09:00:00.000Z" },
);
assert.deepEqual(roundTrip, {
  legacy_flag: true,
  nested_legacy: { retained: true },
  priority: 4,
  expires_at: "2026-07-13T09:00:00.000Z",
});
assert.equal(adapters.fromDateTimeInput("2026-07-13T12:00"), "2026-07-13T12:00:00.000Z");
assert.equal(adapters.toDateTimeInput("2026-07-13T12:00:00.000Z"), "2026-07-13T12:00");
assert.equal(adapters.itemLimitError(1, 2, 6, "Pillars"), "Pillars requires at least 2 items.");
assert.equal(adapters.itemLimitError(7, 2, 6, "Pillars"), "Pillars supports no more than 6 items.");
assert.equal(adapters.itemLimitError(4, 2, 6, "Pillars"), null);

const inspectorSource = read("section-inspector.tsx");
expectSnippets(inspectorSource, "section-inspector.tsx", [
  "hero_admissions",
  "pulse_strip",
  "featured_partnership",
  "programme_finder",
  "date_timeline",
  "pillar_grid",
  "Unsupported section template",
  "No changes will be made to this section",
]);

const heroSource = read("editors/hero-admissions-editor.tsx");
expectSnippets(heroSource, "editors/hero-admissions-editor.tsx", [
  "SourceRecordPicker",
  "sourceType=\"intake\"",
  "admissions_state",
  "open",
  "closed",
  "override",
  "late",
  "hero_image",
  "mobile_image",
  "video",
  "poster",
  "Array.from({ length: 3 }",
  "Hero CTA ${index + 1}",
]);

const pulseSource = read("editors/pulse-editor.tsx");
expectSnippets(pulseSource, "editors/pulse-editor.tsx", [
  "MAX_PULSE_SOURCES",
  "definition.max_items",
  "news",
  "event",
  "research_project",
  "club_activity",
  "priority",
  "expires_at",
  "icon_key",
  "Move source up",
]);

const partnershipSource = read("editors/partnership-editor.tsx");
expectSnippets(partnershipSource, "editors/partnership-editor.tsx", [
  "sourceType=\"research_partner\"",
  "CTA source",
  "CTA label",
  "CTA URL",
  "pillars",
  "opportunities",
  "Move ${name} up",
  "name=\"pillar\"",
  "name=\"opportunity\"",
]);

const programmeSource = read("editors/programme-pathway-editor.tsx");
expectSnippets(programmeSource, "editors/programme-pathway-editor.tsx", [
  "qualification",
  "school",
  "department",
  "mode",
  "campus",
  "intake",
  "PATHWAY_STEP_COUNT",
  "pathway_steps",
  "Move pathway step up",
]);

const datesSource = read("editors/academic-dates-editor.tsx");
expectSnippets(datesSource, "editors/academic-dates-editor.tsx", [
  "sourceType=\"intake\"",
  "sourceType=\"academic_calendar\"",
  "timezone",
  "display_format",
  "toDateTimeInput",
]);

const pillarsSource = read("editors/pillar-grid-editor.tsx");
expectSnippets(pillarsSource, "editors/pillar-grid-editor.tsx", [
  "RECOMMENDED_PILLARS",
  "MIN_PILLARS",
  "MAX_PILLARS",
  "Add pillar",
  "Remove pillar",
  "Move pillar up",
  "import type { SectionItemPayload } from \"@/lib/api/page-cms\"",
  "function defaultPillars(): SectionItemPayload[]",
  "const visiblePillars: SectionItemPayload[]",
  "const updatePillars = (next: SectionItemPayload[])",
]);

for (const source of [heroSource, pulseSource, partnershipSource, programmeSource, datesSource, pillarsSource]) {
  assert.ok(!source.includes("JSON"), "Typed critical editors must not expose raw JSON controls");
}

assert.ok(fs.existsSync(editorRoot), "Expected critical editor directory");
console.log("Page CMS critical editor contract passed.");
