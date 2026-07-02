import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const source = readFileSync(
  new URL("./page.tsx", import.meta.url),
  "utf8",
);

test("about page is a compact content workspace without hero or stats strip", () => {
  assert.match(source, /AboutWorkspace/);
  assert.match(source, /AboutSectionNav/);
  assert.doesNotMatch(source, /function AboutHero/);
  assert.doesNotMatch(source, /buildAboutMetricTiles/);
  assert.doesNotMatch(source, /Research Support Pathways/);
  assert.doesNotMatch(source, /People Behind the Work/);
});

test("about page uses backend research context for real about content", () => {
  assert.match(source, /getResearchSiteContext/);
  assert.match(source, /researchContext\?\.entity/);
  assert.match(source, /mission/);
  assert.match(source, /vision/);
  assert.match(source, /mandate/);
  assert.match(source, /leadership/);
  assert.match(source, /researchContext\?\.team/);
});

test("about page exposes one-page about sections instead of nested about routes", () => {
  assert.match(source, /Overview/);
  assert.match(source, /Mandate/);
  assert.match(source, /Leadership/);
  assert.match(source, /Team/);
  assert.match(source, /Governance/);
  assert.match(source, /Contact/);
  assert.match(source, /href=\{`#\$\{section\.id\}`\}/);
  assert.match(source, /id="about-overview"/);
  assert.match(source, /id="about-contact"/);
});
