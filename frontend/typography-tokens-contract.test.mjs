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
    ["--font-size-xs", "10pt"],
    ["--font-size-sm", "11pt"],
    ["--font-size-base", "12pt"],
    ["--font-size-lg", "14pt"],
    ["--font-size-xl", "16pt"],
    ["--font-size-2xl", "18pt"],
    ["--font-size-3xl", "20pt"],
    ["--font-size-4xl", "22pt"],
    ["--font-size-5xl", "24pt"],
    ["--font-size-6xl", "24pt"],
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
