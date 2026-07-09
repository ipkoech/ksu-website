import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

const root = process.cwd();
const sharedGlobals = readFileSync(
  join(root, "frontend/packages/ui/src/globals.css"),
  "utf8",
);
const appGlobalsPaths = [
  "frontend/apps/web/src/app/globals.css",
  "frontend/apps/admin/src/app/globals.css",
  "frontend/apps/research/src/app/globals.css",
  "frontend/apps/library/src/app/globals.css",
];

function cssValuePattern(token, value) {
  const escapedValue = value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`${token}:\\s*${escapedValue};`);
}

test("shared UI globals define the canonical frontend typography scale", () => {
  const expectedTokens = [
    ["--font-sans", '"Bookman Old Style", Georgia, serif'],
    ["--font-display", '"Bookman Old Style", Georgia, serif'],
    ["--font-size-xs", "0.625rem"],
    ["--font-size-sm", "0.6875rem"],
    ["--font-size-base", "0.75rem"],
    ["--font-size-lg", "0.875rem"],
    ["--font-size-xl", "1rem"],
    ["--font-size-2xl", "1.125rem"],
    ["--font-size-3xl", "1.25rem"],
    ["--font-size-4xl", "1.375rem"],
    ["--font-size-5xl", "1.5rem"],
    ["--font-size-6xl", "1.5rem"],
  ];

  for (const [token, value] of expectedTokens) {
    assert.match(sharedGlobals, cssValuePattern(token, value));
  }

  assert.match(
    sharedGlobals,
    /font-family:\s*var\(--font-sans,\s*"Bookman Old Style", Georgia, serif\);/,
  );
});

test("frontend apps import shared globals without typography overrides", () => {
  for (const path of appGlobalsPaths) {
    const source = readFileSync(join(root, path), "utf8");

    assert.match(source, /@import "@ksu\/ui\/globals\.css";/);
    assert.doesNotMatch(source, /--font-sans\s*:/);
    assert.doesNotMatch(source, /--font-display\s*:/);
    assert.doesNotMatch(
      source,
      /--font-size-(xs|sm|base|lg|xl|2xl|3xl|4xl|5xl|6xl)\s*:/,
    );
    assert.doesNotMatch(source, /Inter|Playfair Display/);
  }
});
