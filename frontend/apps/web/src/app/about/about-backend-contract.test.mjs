import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const aboutDataSource = readFileSync(
  new URL("../../lib/about-data.ts", import.meta.url),
  "utf8",
);
const headerSource = readFileSync(
  new URL("../../../../../packages/ui/src/components/layout/public/public-header.tsx", import.meta.url),
  "utf8",
);
const aboutSource = readFileSync(new URL("./page.tsx", import.meta.url), "utf8");
const historySource = readFileSync(new URL("./history/page.tsx", import.meta.url), "utf8");
const governanceSource = readFileSync(new URL("./governance/page.tsx", import.meta.url), "utf8");
const managementSource = readFileSync(
  new URL("./university-management/page.tsx", import.meta.url),
  "utf8",
);
const qualitySource = readFileSync(
  new URL("./quality-assurance/page.tsx", import.meta.url),
  "utf8",
);

test("about data helpers do not expose static fallback records as page data", () => {
  assert.match(aboutDataSource, /universityInfoApi\.getCurrent/);
  assert.match(aboutDataSource, /governanceApi\.listBoards/);
  assert.match(aboutDataSource, /governanceApi\.getBoardMembersBySlug/);
  assert.match(aboutDataSource, /personsApi\.list/);
  assert.doesNotMatch(aboutDataSource, /export const governanceFallback/);
  assert.doesNotMatch(aboutDataSource, /export const leadershipFallback/);
  assert.doesNotMatch(aboutDataSource, /export const strategicDocuments/);
  assert.doesNotMatch(aboutDataSource, /export const accreditations/);
});

test("global about menu uses the reduced backend-backed IA", () => {
  assert.match(headerSource, /label: "About Us"/);
  assert.match(headerSource, /href: "\/about"/);
  assert.match(headerSource, /label: "History"/);
  assert.match(headerSource, /label: "Governance"/);
  assert.match(headerSource, /label: "Management"/);
  assert.match(headerSource, /label: "Quality Assurance"/);
  assert.doesNotMatch(headerSource, /Mission & Vision/);
  assert.doesNotMatch(headerSource, /University Management"/);
});

test("about pages source their content from backend helpers", () => {
  assert.match(aboutSource, /getOverviewData/);
  assert.match(historySource, /getOverviewData/);
  assert.match(governanceSource, /getGovernanceData/);
  assert.match(governanceSource, /GovernanceChart/);
  assert.match(managementSource, /getManagementData/);
  assert.match(managementSource, /GovernanceChart/);
  assert.match(qualitySource, /getQualityAssuranceData/);
  assert.doesNotMatch(qualitySource, /strategicDocuments/);
  assert.doesNotMatch(qualitySource, /accreditations/);
});
