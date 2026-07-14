import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const variantsSource = readFileSync(
  new URL(
    "../components/home/sections/composed-section-variants.tsx",
    import.meta.url,
  ),
  "utf8",
);

test("composed homepage cards consume item-level imagery and metadata", () => {
  assert.match(variantsSource, /function itemImageUrl/);
  assert.match(variantsSource, /function itemContentText/);
  assert.match(variantsSource, /itemImageUrl\(item\)/);
  assert.match(variantsSource, /itemContentText\(item, "category"\)/);
  assert.match(variantsSource, /itemContentText\(item, "date"\)/);
});

test("programme finder separates pathways from the five-step joining journey", () => {
  assert.match(variantsSource, /const categories = .*"category"/s);
  assert.match(variantsSource, /const journey = .*"journey"/s);
  assert.match(variantsSource, /journey\.slice\(0, 5\)/);
  assert.match(variantsSource, /Search programmes/);
});

test("leadership, partner, alumni, and facts sections have complete fallbacks", () => {
  assert.match(variantsSource, /settingText\(section, "leaderName"\)/);
  assert.match(variantsSource, /settingText\(section, "leaderImage"\)/);
  assert.match(variantsSource, /Recent activities/);
  assert.match(variantsSource, /displayItems\(section\)\.slice\(0, 8\)/);
  assert.match(
    variantsSource,
    /itemImageUrl\(item\) \?\? settingText\(section, "imageUrl"\)/,
  );
  assert.match(variantsSource, /displayItems\(section\)\s*\.slice\(0, 7\)/);
});

test("campus and research sections render image-led cards from the homepage endpoint", () => {
  assert.match(variantsSource, /function ImageArticleCard/);
  assert.match(variantsSource, /Transforming Communities Through Research/);
  assert.match(variantsSource, /Explore campus life/);
});
