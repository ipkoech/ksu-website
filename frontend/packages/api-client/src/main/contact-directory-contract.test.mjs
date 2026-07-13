import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const typesSource = readFileSync(
  new URL("./types.ts", import.meta.url),
  "utf8",
);
const apiSource = readFileSync(new URL("./api.ts", import.meta.url), "utf8");

test("contact directory client exposes aggregate and search contracts", () => {
  assert.match(typesSource, /export interface ContactDirectoryListParams/);
  assert.match(typesSource, /export interface PublicUniversityContactSummary/);
  assert.match(typesSource, /export interface PublicContactDirectoryPage/);
  assert.match(typesSource, /export interface PublicContactDirectory/);
  assert.match(typesSource, /q\?: string/);
  assert.match(typesSource, /contact_type\?: string/);
  assert.match(typesSource, /sort\?: "name_asc" \| "name_desc"/);
  assert.match(apiSource, /export const contactDirectoryApi/);
  assert.match(apiSource, /"\/api\/v1\/contact-directory"/);
  assert.match(apiSource, /ListParams<ContactDirectoryListParams>/);
  assert.match(
    apiSource,
    /Omit<ContactDirectoryListParams, "is_main" \| "sort">/,
  );
});
