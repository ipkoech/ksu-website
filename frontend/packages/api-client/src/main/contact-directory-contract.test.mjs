import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const typesSource = readFileSync(
  new URL("./types.ts", import.meta.url),
  "utf8",
);
const apiSource = readFileSync(new URL("./api.ts", import.meta.url), "utf8");

test("contact directory client targets the public aggregate route", () => {
  assert.match(apiSource, /export const contactDirectoryApi/);
  assert.match(apiSource, /"\/api\/v1\/contact-directory"/);
  assert.match(typesSource, /export type PublicContactDirectoryParams/);
});
