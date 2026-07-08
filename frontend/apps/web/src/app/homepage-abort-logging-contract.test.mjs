import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const homepageSource = readFileSync(
  new URL("../lib/homepage-data.ts", import.meta.url),
  "utf8",
);
const landingSource = readFileSync(
  new URL("../lib/landing-data.ts", import.meta.url),
  "utf8",
);
const apiClientSource = readFileSync(
  new URL("../../../../packages/api-client/src/client.ts", import.meta.url),
  "utf8",
);

test("homepage fallback logging ignores request aborts", () => {
  assert.match(homepageSource, /function isAbortError/);
  assert.match(homepageSource, /if \(logFailure && !isAbortError\(error\)\)/);
});

test("landing fallback logging ignores request aborts", () => {
  assert.match(landingSource, /function isAbortError/);
  assert.match(landingSource, /if \(!isAbortError\(error\)\)/);
});

test("api client supports a configurable public request timeout", () => {
  assert.match(apiClientSource, /resolveApiTimeoutMs/);
  assert.match(apiClientSource, /NEXT_PUBLIC_API_TIMEOUT_MS/);
});
