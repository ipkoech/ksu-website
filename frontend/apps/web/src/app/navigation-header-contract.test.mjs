import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const headerSource = readFileSync(
  new URL("../../../../packages/ui/src/components/layout/public/public-header.tsx", import.meta.url),
  "utf8",
);
const navDataSource = readFileSync(new URL("../lib/nav-data.ts", import.meta.url), "utf8");

test("public header renders academics as schools and admissions columns", () => {
  assert.match(headerSource, /const admissionsLinks: NavItem\[\]/);
  assert.match(headerSource, /group: "Admissions"/);
  assert.match(headerSource, /group: "Schools"/);
  assert.match(headerSource, /item\.label === "Academics"/);
  assert.match(headerSource, /variant="two-column"/);
  assert.doesNotMatch(headerSource, /const admissionsItem: NavItem/);
  assert.doesNotMatch(headerSource, /admissionsItem,\s*\n\s*academicsItem/);
  assert.doesNotMatch(headerSource, /label: "All Schools"/);
  assert.doesNotMatch(headerSource, /href: "\/academics\/programmes"/);
  assert.doesNotMatch(headerSource, /href: "\/academics\/calendar"/);
  assert.doesNotMatch(headerSource, /href: "\/academics\/examinations"/);
});

test("public header administration groups divisions registrars and departments", () => {
  assert.match(headerSource, /wings\?: NavAdminUnit\[\]/);
  assert.match(headerSource, /const wings = megaMenuData\?\.wings \|\| \[\]/);
  assert.match(headerSource, /const registrarWings = wings\.filter\(isRegistrarUnit\)/);
  assert.match(headerSource, /const administrativeDepartments = \(departments\.length \? departments : adminUnits\)\.filter/);
  assert.match(headerSource, /group: "Divisions"/);
  assert.match(headerSource, /group: "Registrars"/);
  assert.match(headerSource, /group: "Departments"/);
  assert.match(headerSource, /variant="administration"/);
  assert.match(headerSource, /topSections = sections\.filter/);
  assert.match(headerSource, /bottomSections = sections\.filter/);
  assert.doesNotMatch(headerSource, /group: "Wings"/);
});

test("web nav data fetches public wings for the administration menu", () => {
  assert.match(navDataSource, /wingsApi/);
  assert.match(navDataSource, /wingsResult/);
  assert.match(navDataSource, /fields: "id,name,slug,code,wing_type"/);
  assert.match(navDataSource, /fields: "id,name,slug,code,school_id,department_type"/);
  assert.match(navDataSource, /uniqueNavUnits/);
  assert.match(navDataSource, /wings,/);
});
