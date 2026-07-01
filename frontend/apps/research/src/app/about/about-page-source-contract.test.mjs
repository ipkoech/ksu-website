import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const source = readFileSync(
  new URL("./page.tsx", import.meta.url),
  "utf8",
);

test("about hero uses the research image as the section background", () => {
  assert.match(source, /<section className="relative isolate overflow-hidden/);
  assert.match(source, /src="\/images\/research\/research-about-hero\.webp"/);
  assert.match(source, /className="object-cover"/);
  assert.match(source, /absolute inset-0/);
});

test("about page keeps backend-backed stats and team data sources", () => {
  assert.match(source, /buildAboutMetricTiles/);
  assert.match(source, /getResearchStats/);
  assert.match(source, /getResearchStaff/);
  assert.match(source, /personsApi\.list/);
});

test("about page uses reveal animation and exposes the REIRM about family", () => {
  assert.match(source, /ScrollReveal/);
  assert.match(source, /ScrollRevealGroup/);
  assert.match(source, /Explore REIRM/);
  assert.match(source, /href: "\/team"/);
  assert.match(source, /href: "\/connect"/);
  assert.match(source, /href: "\/donate"/);
});
