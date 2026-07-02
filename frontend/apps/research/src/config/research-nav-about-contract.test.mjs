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

test("news and events navigation item is a direct link without a dropdown menu", () => {
  const newsBlock = source.match(/title: "News & Events"[\s\S]*?\n  \},\n  \{[\s\S]*?title: "About"/)?.[0] ?? "";
  assert.match(newsBlock, /href: "\/news"/);
  assert.match(newsBlock, /activePaths: \["\/news"\]/);
  assert.match(newsBlock, /columns: \[\]/);
  assert.doesNotMatch(newsBlock, /heading:/);
  assert.doesNotMatch(newsBlock, /href: "\/news#events"/);
  assert.doesNotMatch(newsBlock, /href: "\/news#gallery"/);
});

test("news and events navigation item sits immediately before about", () => {
  assert.match(
    source,
    /title: "Funding"[\s\S]*?title: "News & Events"[\s\S]*?columns: \[\],[\s\S]*?\},\n  \{\n    title: "About"/,
  );
});
