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
  assert.match(aboutDataSource, /schoolsApi\.list/);
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

test("about us page follows the compact handbook-backed layout", () => {
  assert.match(aboutSource, /AboutHeroPanel/);
  assert.match(aboutSource, /IdentityCard/);
  assert.match(aboutSource, /ExploreCard/);
  assert.match(aboutSource, /getAboutSchools/);
  assert.match(aboutSource, /getPhilosophy/);
  assert.match(aboutSource, /\/images\/backgrounds\/about-hero\.jpg/);
  assert.match(aboutSource, /lg:grid-cols-\[minmax\(0,1fr\)_minmax\(420px,680px\)\]/);
  assert.doesNotMatch(aboutSource, /Cover image has not been published/);
});

test("about pages use full-width design sections instead of centered card pages", () => {
  for (const source of [
    historySource,
    governanceSource,
    managementSource,
    qualitySource,
  ]) {
    assert.match(source, /max-w-none/);
    assert.doesNotMatch(source, /max-w-\[1440px\]/);
  }
});

test("about subpages expose strategic-plan guided page-specific layouts", () => {
  assert.match(historySource, /HistoryTimeline/);
  assert.match(historySource, /AtAGlancePanel/);
  assert.match(historySource, /about-history-hero-branded\.webp/);

  assert.match(governanceSource, /GovernanceMandateCard/);
  assert.match(governanceSource, /CouncilPreviewTable/);
  assert.match(governanceSource, /MessagePanel/);

  assert.match(managementSource, /ManagementMetric/);
  assert.match(managementSource, /LeadershipDirectoryTable/);
  assert.match(managementSource, /ManagementLegend/);

  assert.match(qualitySource, /QualityResourceCard/);
  assert.match(qualitySource, /StrategicHighlightCard/);
  assert.match(qualitySource, /ServiceCommitmentStep/);
  assert.match(qualitySource, /about-quality-assurance-branded\.webp/);
});

test("university seed uses revised handbook institutional statements", () => {
  const seedSource = readFileSync(
    new URL("../../../../../../services/main/app/seeders/seed_university_info.py", import.meta.url),
    "utf8",
  );
  const handbookSource = readFileSync(
    new URL("../../../../../../services/main/app/seeders/seed_handbook.py", import.meta.url),
    "utf8",
  );

  assert.match(seedSource, /World Class University in the advancement of academic excellence/);
  assert.match(seedSource, /premier public institution of higher learning in Kenya/);
  assert.match(seedSource, /undergraduate, postgraduate, and doctoral programmes/);
  assert.match(seedSource, /HANDBOOK_INSTITUTIONAL_FACTS\["mission"\]/);
  assert.match(handbookSource, /training high level human resource/);
  assert.match(seedSource, /Integrity; Diligence; Hard work; Professionalism/);
  assert.match(seedSource, /academic freedom, civility, social responsiveness, integrity and accountability/);
});
