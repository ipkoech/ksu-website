import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const source = readFileSync(
  new URL("./page.tsx", import.meta.url),
  "utf8",
);

test("about hero uses the research image in a compact reference layout", () => {
  assert.match(source, /<section className="border-b border-slate-200 bg-white/);
  assert.match(source, /url\(\/images\/research\/research-demo-imagegen\.webp\)/);
  assert.match(source, /lg:grid-cols-\[minmax\(0,1fr\)_minmax\(420px,680px\)\]/);
  assert.match(source, /py-8 text-slate-950/);
});

test("about page keeps backend-backed stats and team data sources", () => {
  assert.match(source, /buildAboutMetricTiles/);
  assert.match(source, /getResearchStats/);
  assert.match(source, /getResearchStaff/);
  assert.match(source, /publicTeamApi\.get/);
  assert.match(source, /getResearchSiteContext/);
  assert.match(source, /buildTeamMembers/);
  assert.doesNotMatch(source, /personsApi\.list/);
  assert.doesNotMatch(source, /departmentsApi\.list/);
  assert.doesNotMatch(source, /wingsApi\.listByDivision/);
  assert.doesNotMatch(source, /NEXT_PUBLIC_RESEARCH_DIRECTORATE_ID/);
});

test("about page uses reveal animation without the removed about family band", () => {
  assert.match(source, /ScrollReveal/);
  assert.match(source, /ScrollRevealGroup/);
  assert.match(source, /LayeredAboutSections/);
  assert.match(source, /lg:sticky/);
  assert.match(source, /top-24 z-\[1\]/);
  assert.match(source, /top-28 z-\[2\]/);
  assert.match(source, /top-32 z-\[3\]/);
  assert.doesNotMatch(source, /Explore REIRM/);
  assert.doesNotMatch(source, /About pages that work together/);
  assert.doesNotMatch(source, /aboutFamilyCards/);
});

test("about page avoids old generic placeholder language", () => {
  assert.doesNotMatch(source, /public operating layer/i);
  assert.doesNotMatch(source, /without placeholder people/i);
  assert.doesNotMatch(source, /Move from About into the right task/);
  assert.match(source, /Coordinate\. Promote\. Mobilize\./);
  assert.match(source, /Coordinate research, extension, innovation and resource mobilization/);
});
