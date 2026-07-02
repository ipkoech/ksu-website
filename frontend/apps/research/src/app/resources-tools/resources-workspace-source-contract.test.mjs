import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const pageSource = readFileSync(
  new URL("./_workspace.tsx", import.meta.url),
  "utf8",
);
const dataSource = readFileSync(
  new URL("../../lib/research-public-data.ts", import.meta.url),
  "utf8",
);

test("resources workspace renders the six backend-backed side panel sections", () => {
  [
    "Resource Library",
    "Policies",
    "Forms & Templates",
    "Research Services",
    "Outputs",
    "Downloads",
  ].forEach((label) => assert.match(pageSource, new RegExp(label)));

  assert.match(pageSource, /function ResourcesWorkspace/);
  assert.match(pageSource, /function WorkspaceSideNav/);
  assert.match(pageSource, /function DownloadsPanel/);
});

test("resources workspace uses resource-specific field selectors", () => {
  [
    "researchResourceListFields",
    "researchResourceDetailFields",
    "researchGuidelineListFields",
    "researchServiceListFields",
    "researchOutputListFields",
  ].forEach((selector) => assert.match(dataSource, new RegExp(selector)));

  assert.doesNotMatch(
    dataSource.match(/export function getResources\(\)[\s\S]*?\n}/)?.[0] ?? "",
    /researchPublicListFields/,
  );
  assert.doesNotMatch(
    dataSource.match(/export function getResourceBySlug[\s\S]*?\n}/)?.[0] ?? "",
    /researchPublicDetailFields/,
  );
});

test("downloads are derived only from backend records with file urls", () => {
  assert.match(pageSource, /collectDownloadRecords/);
  assert.match(pageSource, /getDownloadHref/);
  assert.match(pageSource, /getResearchRecordDirectFileHref/);
  assert.match(pageSource, /getResearchRecordDownloadHref/);
  assert.doesNotMatch(pageSource, /href="#"/);
});
