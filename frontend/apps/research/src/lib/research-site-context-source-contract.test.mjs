import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { test } from "node:test";

const helperUrl = new URL("./research-site-context.ts", import.meta.url);
const layoutSource = readFileSync(
  new URL("../app/layout.tsx", import.meta.url),
  "utf8",
);

test("research site context caches the backend REIRM entity lookup", () => {
  assert.equal(existsSync(helperUrl), true);
  const source = readFileSync(helperUrl, "utf8");

  assert.match(source, /unstable_cache/);
  assert.match(source, /getResearchSiteContext/);
  assert.match(source, /publicResearchContextApi\.get/);
  assert.match(source, /researchContext/);
  assert.match(source, /include:/);
  assert.match(source, /mission,vision/);
  assert.match(source, /team,leadership/);
  assert.match(source, /research-site-context/);
});

test("research layout warms cached site context when the portal launches", () => {
  assert.match(layoutSource, /getResearchSiteContext/);
  assert.match(layoutSource, /Promise\.all/);
});
