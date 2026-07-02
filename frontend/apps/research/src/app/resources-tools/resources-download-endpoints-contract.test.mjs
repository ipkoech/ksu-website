import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const pageSource = readFileSync(new URL("./page.tsx", import.meta.url), "utf8");
const dataSource = readFileSync(
  new URL("../../lib/research-public-data.ts", import.meta.url),
  "utf8",
);
const guidelineDetailSource = readFileSync(
  new URL("../guidelines/[slug]/page.tsx", import.meta.url),
  "utf8",
);
const resourceDetailSource = readFileSync(
  new URL("./[slug]/page.tsx", import.meta.url),
  "utf8",
);
const downloadsSource = readFileSync(
  new URL("../../lib/research-downloads.ts", import.meta.url),
  "utf8",
);

test("resources workspace prefers backend download endpoints for resources and guidelines", () => {
  assert.match(pageSource, /getBackendDownloadHref/);
  assert.match(pageSource, /getResearchRecordDownloadHref/);
  assert.match(downloadsSource, /\/api\/v1\/resources\/\$\{record\.id\}\/download/);
  assert.match(downloadsSource, /\/api\/v1\/guidelines\/\$\{record\.id\}\/download/);
  assert.match(downloadsSource, /getResearchApiBaseUrl/);
});

test("resource and guideline detail pages use backend download endpoints", () => {
  assert.match(resourceDetailSource, /getResearchRecordDownloadHref/);
  assert.match(resourceDetailSource, /"resource"/);
  assert.match(guidelineDetailSource, /getResearchRecordDownloadHref/);
  assert.match(guidelineDetailSource, /"guideline"/);
});

test("field selectors request media id fields required by backend download resolver", () => {
  assert.match(dataSource, /attachment_media_ids/);
  assert.match(dataSource, /document_media_ids/);
  assert.match(dataSource, /document_id/);
});
