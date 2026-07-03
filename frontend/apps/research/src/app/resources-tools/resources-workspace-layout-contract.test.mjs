import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const pageSource = readFileSync(new URL("./_workspace.tsx", import.meta.url), "utf8");
const librarySource = readFileSync(new URL("./library/page.tsx", import.meta.url), "utf8");
const policiesSource = readFileSync(new URL("./policies/page.tsx", import.meta.url), "utf8");
const downloadsSource = readFileSync(new URL("./downloads/page.tsx", import.meta.url), "utf8");

test("resources workspace keeps a compact hero with animated illustration", () => {
  assert.match(pageSource, /function WorkspaceHero/);
  assert.match(pageSource, /ResearchPortfolioHero/);
  assert.match(pageSource, /illustration="projects"/);
  assert.match(pageSource, /Published resource workspace/);
  assert.doesNotMatch(pageSource, /function ResourceIllustration/);
});

test("resources side navigation points to section pages and anchors", () => {
  assert.match(pageSource, /href: "\/resources-tools\/library"/);
  assert.match(pageSource, /href: "\/resources-tools\/policies"/);
  assert.match(pageSource, /href: "\/resources-tools\/forms"/);
  assert.match(pageSource, /href: "\/resources-tools\/services"/);
  assert.match(pageSource, /href: "\/resources-tools\/outputs"/);
  assert.match(pageSource, /href: "\/resources-tools\/downloads"/);
  assert.doesNotMatch(pageSource, /resources-tools#downloads/);
});

test("resources workspace uses the full page width for content", () => {
  assert.match(pageSource, /w-full max-w-none/);
  assert.doesNotMatch(pageSource, /max-w-\[1680px\]/);
});

test("resources workspace no longer renders a stats strip", () => {
  assert.doesNotMatch(pageSource, /WorkspaceMetricGrid/);
});

test("resource section pages render standalone workspace sections", () => {
  assert.match(librarySource, /visibleSections=\{\["resources"\]\}/);
  assert.match(policiesSource, /visibleSections=\{\["policies"\]\}/);
  assert.match(downloadsSource, /visibleSections=\{\["downloads"\]\}/);
});
