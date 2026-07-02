import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const helperSource = readFileSync(new URL("./research-downloads.ts", import.meta.url), "utf8");
const formsSource = readFileSync(new URL("../app/forms/page.tsx", import.meta.url), "utf8");
const guidelinesSource = readFileSync(new URL("../app/guidelines/page.tsx", import.meta.url), "utf8");
const fundingSource = readFileSync(new URL("../app/funding/page.tsx", import.meta.url), "utf8");
const detailSource = readFileSync(new URL("../components/research-detail.tsx", import.meta.url), "utf8");
const resourceWorkspaceSource = readFileSync(new URL("../app/resources-tools/page.tsx", import.meta.url), "utf8");
const resourceDetailSource = readFileSync(new URL("../app/resources-tools/[slug]/page.tsx", import.meta.url), "utf8");
const guidelineDetailSource = readFileSync(new URL("../app/guidelines/[slug]/page.tsx", import.meta.url), "utf8");

test("research download helper centralizes public file endpoint resolution", () => {
  assert.match(helperSource, /getResearchRecordDownloadHref/);
  assert.match(helperSource, /getResearchRecordDirectFileHref/);
  assert.match(helperSource, /\/api\/v1\/resources\/\$\{record\.id\}\/download/);
  assert.match(helperSource, /\/api\/v1\/guidelines\/\$\{record\.id\}\/download/);
  assert.match(helperSource, /is_public/);
  assert.match(helperSource, /document_media_ids/);
  assert.match(helperSource, /attachment_media_ids/);
  assert.match(helperSource, /document_id/);
});

test("resource and guideline pages use the shared download helper", () => {
  for (const source of [resourceWorkspaceSource, resourceDetailSource, guidelineDetailSource]) {
    assert.match(source, /getResearchRecordDownloadHref/);
  }
});

test("forms, guideline cards, and funding support surfaces use backend downloads when available", () => {
  for (const source of [formsSource, guidelinesSource, fundingSource, detailSource]) {
    assert.match(source, /getResearchRecordDownloadHref/);
  }
});
