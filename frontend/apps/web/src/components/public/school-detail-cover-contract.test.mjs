import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const overview = readFileSync(
  new URL("./school-detail-overview.tsx", import.meta.url),
  "utf8",
);
const data = readFileSync(
  new URL("../../lib/school-detail-data.ts", import.meta.url),
  "utf8",
);

test("school overview requests and renders the managed cover image", () => {
  assert.match(data, /"cover_image_id"/);
  assert.match(overview, /publicFileUrl\(school\.cover_image_id\)/);
  assert.match(overview, /<SchoolCoverBanner/);
  assert.match(overview, /ratio="fill"/);
  assert.match(overview, /aspect-\[16\/7\]/);
});

test("school cover remains optional and has descriptive alternative text", () => {
  assert.match(overview, /if \(!imageUrl\) return null/);
  assert.match(overview, /alt=\{`\$\{schoolName\} academic panorama`\}/);
});

test("school long-form profile content uses the sanitized rich-text renderer", () => {
  assert.match(overview, /import \{ RichTextRenderer \}/);
  assert.match(overview, /<RichTextRenderer[\s\S]*content=\{deanMessage\}/);
  assert.match(overview, /<RichTextRenderer[\s\S]*content=\{overview\}/);
  assert.match(overview, /<RichTextRenderer[\s\S]*content=\{item\.body\}/);
  assert.match(overview, /school\.core_values/);
});
