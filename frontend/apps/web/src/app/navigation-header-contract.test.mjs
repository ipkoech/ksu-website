import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const headerSource = readFileSync(
  new URL("../../../../packages/ui/src/components/layout/public/public-header.tsx", import.meta.url),
  "utf8",
);
const navDataSource = readFileSync(new URL("../lib/nav-data.ts", import.meta.url), "utf8");

test("public header combines admissions into academics grouped mega menu", () => {
  assert.match(headerSource, /const admissionsLinks: NavItem\[\]/);
  assert.match(headerSource, /group: "Admissions"/);
  assert.match(headerSource, /group: "Schools"/);
  assert.doesNotMatch(headerSource, /const admissionsItem: NavItem/);
  assert.doesNotMatch(headerSource, /admissionsItem,\s*\n\s*academicsItem/);
});

test("public header administration groups divisions wings and departments", () => {
  assert.match(headerSource, /wings\?: NavAdminUnit\[\]/);
  assert.match(headerSource, /const wings = megaMenuData\?\.wings \|\| \[\]/);
  assert.match(headerSource, /group: "Divisions"/);
  assert.match(headerSource, /group: "Wings"/);
  assert.match(headerSource, /group: "Departments"/);
});

test("web nav data fetches public wings for the administration menu", () => {
  assert.match(navDataSource, /wingsApi/);
  assert.match(navDataSource, /wingsResult/);
  assert.match(navDataSource, /fields: "id,name,slug,wing_type"/);
  assert.match(navDataSource, /wings,/);
});
