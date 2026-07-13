import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = readFileSync(
  new URL("../../lib/utility-page-data.ts", import.meta.url),
  "utf8",
);

test("contact page loader consumes the aggregate contact directory", () => {
  assert.match(source, /contactDirectoryApi/);
  assert.match(source, /contactDirectoryApi\.get\(/);
  assert.match(source, /main_contacts/);
  assert.match(source, /contacts\.items/);
  assert.match(source, /campuses/);
  assert.match(source, /faqs/);
  assert.doesNotMatch(source, /contactsApi\.list\(\{\s*is_main:\s*true/);
});
