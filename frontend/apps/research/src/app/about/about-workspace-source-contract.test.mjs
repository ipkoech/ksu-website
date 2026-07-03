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

test("about section navigation links to real page anchors without all sections item", () => {
  assert.match(source, /href=\{`#\$\{section\.anchor\}`\}/);
  assert.match(source, /anchor: "about-overview"/);
  assert.match(source, /anchor: "about-contact"/);
  assert.doesNotMatch(source, /href=\{`\/about\?section=/);
  assert.doesNotMatch(source, /All sections/);
});

test("about page renders backend text through the shared rich text renderer", () => {
  assert.match(source, /ResearchRichText/);
  assert.match(source, /content=\{overview\}/);
  assert.match(source, /content=\{message\}/);
  assert.match(source, /content=\{item\.value\}/);
  assert.match(source, /content=\{row\.value\}/);
});

test("about page uses motion-safe illustrative backgrounds for plain sections", () => {
  assert.match(source, /function SectionBackdrop/);
  assert.match(source, /variant="network"/);
  assert.match(source, /variant="checklist"/);
  assert.match(source, /variant="leadership"/);
  assert.match(source, /variant="hierarchy"/);
  assert.match(source, /variant="governance"/);
  assert.match(source, /variant="contact"/);
  assert.match(source, /motion-safe:animate-pulse/);
});

test("leadership section renders the lead profile image from backend staff data", () => {
  assert.match(source, /function LeadershipPortrait/);
  assert.match(source, /photo_url/);
  assert.match(source, /style=\{photoUrl \? \{ backgroundImage: `url\(\$\{photoUrl\}\)` \} : undefined\}/);
});
