import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

const root = process.cwd();
const read = (path) => readFileSync(join(root, path), "utf8");

test("about data fetches university council from backend public endpoint", () => {
  const source = read("src/lib/about-data.ts");

  assert.match(source, /getUniversityCouncilPage/);
  assert.match(source, /governance\/public\/university-council/);
  assert.match(source, /getUniversityCouncilProfile/);
});

test("public council page does not hard-code member names or portraits", () => {
  const source = read("src/components/about/UniversityCouncilPage.tsx");

  for (const forbidden of ["Prof. Jane", "Hon. Mary", "Nathan Oyori", "jane-onyango.webp"]) {
    assert.doesNotMatch(source, new RegExp(forbidden, "i"));
  }

  for (const required of ["chairperson", "members", "secretary", "aria-label"]) {
    assert.match(source, new RegExp(required));
  }
});

test("public council page sanitizes document CTA URLs", () => {
  const source = read("src/components/about/UniversityCouncilPage.tsx");

  assert.match(source, /safeCouncilCtaHref/);
  assert.match(source, /url\.protocol === "https:" \|\| url\.protocol === "http:"/);
  assert.doesNotMatch(source, /href=\{mandate\.document_cta\.href\}/);
});

test("public council card is fully clickable and accessible", () => {
  const source = read("src/components/about/UniversityCouncilCard.tsx");

  assert.match(source, /href/);
  assert.match(source, /View profile of/);
  assert.match(source, /focus:/);
});

test("profile route consumes backend profile contract", () => {
  const source = read("src/app/about/university-council/[slug]/page.tsx");

  assert.match(source, /getUniversityCouncilProfile/);
  assert.match(source, /notFound/);
});
