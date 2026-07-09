import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const headerSource = readFileSync(
  new URL("../../../../packages/ui/src/components/layout/public/public-header.tsx", import.meta.url),
  "utf8",
);
const miniHeaderSource = readFileSync(
  new URL("../../../../packages/ui/src/components/layout/public/mini-header.tsx", import.meta.url),
  "utf8",
);

test("public header renders the proposed uppercase main navigation", () => {
  assert.match(headerSource, /label: "ABOUT US"/);
  assert.match(headerSource, /label: "PROGRAMMES"/);
  assert.match(headerSource, /label: "RESEARCH"/);
  assert.match(headerSource, /label: "LIBRARY"/);
  assert.match(headerSource, /label: "CAMPUS LIFE"/);
  assert.match(headerSource, /label: "MEDIA DESK"/);
  assert.match(headerSource, /label: "CONTACT US"/);
  assert.match(headerSource, /APPLY NOW/);
  assert.match(headerSource, /SUPPORT KSU/);
  assert.match(headerSource, /aboutItem,\s*\n\s*programmesItem,\s*\n\s*researchItem,\s*\n\s*libraryItem,\s*\n\s*campusLifeItem,\s*\n\s*mediaDeskItem,\s*\n\s*contactItem/);
  assert.doesNotMatch(headerSource, /label: "Administration"/);
  assert.doesNotMatch(headerSource, /label: "Academics"/);
});

test("public header renders programmes as schools and admissions columns", () => {
  assert.match(headerSource, /const programmeQuickLinks: NavItem\[\]/);
  assert.match(headerSource, /const admissionsLinks: NavItem\[\]/);
  assert.match(headerSource, /label: "ALL PROGRAMMES"/);
  assert.match(headerSource, /label: "ACADEMIC CALENDAR"/);
  assert.match(headerSource, /label: "EXAMINATIONS"/);
  assert.match(headerSource, /group: "ADMISSIONS"/);
  assert.match(headerSource, /group: "SCHOOLS"/);
  assert.match(headerSource, /item\.label === "PROGRAMMES"/);
  assert.match(headerSource, /variant="two-column"/);
  assert.doesNotMatch(headerSource, /const admissionsItem: NavItem/);
  assert.doesNotMatch(headerSource, /admissionsItem,\s*\n\s*academicsItem/);
  assert.doesNotMatch(headerSource, /label: "All Schools"/);
});

test("public header includes a top-level contact us item after media desk", () => {
  assert.match(headerSource, /const contactItem: NavItem = \{/);
  assert.match(headerSource, /label: "CONTACT US"/);
  assert.match(headerSource, /href: "\/contact"/);
  assert.match(headerSource, /mediaDeskItem,\s*\n\s*contactItem/);
});

test("mini header uses the proposed uppercase utility links", () => {
  for (const label of [
    "HERI",
    "HUDUMA BORA",
    "STUDENT PORTAL",
    "CAREERS",
    "CONFERENCES",
  ]) {
    assert.match(miniHeaderSource, new RegExp(`label: "${label}"`));
  }

  for (const removed of ["Tenders", "Help Desk", "Visitors", "Downloads", "FAQ"]) {
    assert.doesNotMatch(miniHeaderSource, new RegExp(`label: "${removed}"`));
  }

  assert.match(miniHeaderSource, /<span>SEARCH<\/span>/);
});
