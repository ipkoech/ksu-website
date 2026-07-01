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
  assert.match(source, /personsApi\.list/);
});

test("about page uses reveal animation without the removed about family band", () => {
  assert.match(source, /ScrollReveal/);
  assert.match(source, /ScrollRevealGroup/);
  assert.doesNotMatch(source, /Explore REIRM/);
  assert.doesNotMatch(source, /About pages that work together/);
  assert.doesNotMatch(source, /aboutFamilyCards/);
});

test("about page avoids old generic placeholder language", () => {
  assert.doesNotMatch(source, /public operating layer/i);
  assert.doesNotMatch(source, /without placeholder people/i);
  assert.doesNotMatch(source, /Move from About into the right task/);
  assert.match(source, /To coordinate and promote research, extension, innovation/);
});
