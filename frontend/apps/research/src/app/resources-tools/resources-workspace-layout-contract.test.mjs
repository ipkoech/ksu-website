import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const pageSource = readFileSync(new URL("./page.tsx", import.meta.url), "utf8");

test("resources workspace keeps a compact hero with animated illustration", () => {
  assert.match(pageSource, /function WorkspaceHero/);
  assert.match(pageSource, /function ResourceIllustration/);
  assert.match(pageSource, /animate-/);
  assert.match(pageSource, /Public Downloads/);
});

test("resources side navigation points to section pages and anchors", () => {
  assert.match(pageSource, /href: "\/resources-tools"/);
  assert.match(pageSource, /href: "\/guidelines"/);
  assert.match(pageSource, /href: "\/forms"/);
  assert.match(pageSource, /href: "\/services"/);
  assert.match(pageSource, /href: "\/outputs"/);
  assert.match(pageSource, /href: "\/resources-tools#downloads"/);
});

test("resources workspace uses the full page width for content", () => {
  assert.match(pageSource, /w-full max-w-none/);
  assert.doesNotMatch(pageSource, /max-w-\[1680px\]/);
});
