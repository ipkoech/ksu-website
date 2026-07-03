import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const source = readFileSync(
  new URL("./page.tsx", import.meta.url),
  "utf8",
);

test("about page is a compact content workspace without hero or stats strip", () => {
  assert.match(source, /AboutWorkspace/);
  assert.doesNotMatch(source, /AboutSectionNav/);
  assert.doesNotMatch(source, /function AboutHero/);
  assert.doesNotMatch(source, /buildAboutMetricTiles/);
  assert.doesNotMatch(source, /Research Support Pathways/);
  assert.doesNotMatch(source, /People Behind the Work/);
  assert.doesNotMatch(source, /section=\$\{section\.id\}/);
  assert.doesNotMatch(source, /All sections/);
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
  assert.match(source, /id="about-overview"/);
  assert.match(source, /id="about-mandate"/);
  assert.match(source, /id="about-leadership"/);
  assert.match(source, /id="about-team"/);
  assert.match(source, /id="about-governance"/);
  assert.match(source, /id="about-contact"/);
});

test("about page renders backend text through the shared rich text renderer", () => {
  assert.match(source, /ResearchRichText/);
  assert.match(source, /content=\{overview\}/);
  assert.match(source, /content=\{message\}/);
  assert.match(source, /content=\{item\.value\}/);
  assert.match(source, /content=\{row\.value\}/);
});
