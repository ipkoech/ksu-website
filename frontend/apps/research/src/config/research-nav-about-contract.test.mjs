import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const source = readFileSync(
  new URL("./research-nav.ts", import.meta.url),
  "utf8",
);

test("about navigation item is a direct link without a dropdown menu", () => {
  const aboutBlock = source.match(/title: "About"[\s\S]*?\n  \},\n\];/)?.[0] ?? "";
  assert.match(aboutBlock, /href: "\/about"/);
  assert.match(aboutBlock, /activePaths: \["\/about"\]/);
  assert.match(aboutBlock, /columns: \[\]/);
  assert.doesNotMatch(aboutBlock, /heading:/);
  assert.doesNotMatch(aboutBlock, /href: "\/team"/);
  assert.doesNotMatch(aboutBlock, /href: "\/connect"/);
  assert.doesNotMatch(aboutBlock, /href: "\/donate"/);
});
