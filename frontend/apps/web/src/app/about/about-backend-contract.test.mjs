import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
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
const chancellorUrl = new URL("./chancellor/page.tsx", import.meta.url);
const chancellorSource = existsSync(chancellorUrl)
  ? readFileSync(chancellorUrl, "utf8")
  : "";
const viceChancellorUrl = new URL("./vice-chancellor/page.tsx", import.meta.url);
const viceChancellorSource = existsSync(viceChancellorUrl)
  ? readFileSync(viceChancellorUrl, "utf8")
  : "";
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
  assert.match(headerSource, /label: "The Chancellor"/);
  assert.match(headerSource, /href: "\/about\/chancellor"/);
  assert.match(headerSource, /label: "The Vice Chancellor"/);
  assert.match(headerSource, /href: "\/about\/vice-chancellor"/);
  assert.match(
    headerSource,
    /label: "History"[\s\S]*label: "The Chancellor"[\s\S]*label: "The Vice Chancellor"[\s\S]*label: "Governance"/,
  );
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

test("about us page follows the full-width handbook-backed layout", () => {
  assert.match(aboutSource, /AboutHeroPanel/);
  assert.match(aboutSource, /IdentityCard/);
  assert.match(aboutSource, /ExploreCard/);
  assert.match(aboutSource, /getAboutSchools/);
  assert.match(aboutSource, /getPhilosophy/);
  assert.match(aboutSource, /\/images\/backgrounds\/about-hero\.jpg/);
  assert.match(aboutSource, /max-w-none/);
  assert.doesNotMatch(aboutSource, /max-w-\[1500px\]/);
  assert.match(aboutSource, /lg:grid-cols-\[minmax\(0,1fr\)_minmax\(420px,680px\)\]/);
  assert.doesNotMatch(aboutSource, /Cover image has not been published/);
});

test("about pages use full-width design sections instead of centered card pages", () => {
  for (const source of [
    aboutSource,
    historySource,
    chancellorSource,
    viceChancellorSource,
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
  assert.match(historySource, /InteractiveMilestoneCard/);
  assert.match(historySource, /ScrollRevealSection/);
  assert.match(historySource, /sticky top-24/);
  assert.match(historySource, /AtAGlancePanel/);
  assert.match(historySource, /HistoryCtaBand/);
  assert.match(historySource, /StrategicDirectionCard/);
  assert.match(historySource, /bg-history\.jpg/);
  assert.match(historySource, /motion-safe:/);
  assert.match(historySource, /Apply Now/);
  assert.match(historySource, /Contact Us/);
  assert.doesNotMatch(historySource, /HistoryImageMosaic/);
  assert.doesNotMatch(historySource, /handbook/i);
  assert.doesNotMatch(historySource, /Source of this page/);
  assert.doesNotMatch(historySource, /Related institutional pages/);
  assert.doesNotMatch(historySource, /Institutional context/);

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

test("chancellor and vice chancellor pages use backend messages and supplied imagery", () => {
  assert.match(chancellorSource, /getOverviewData/);
  assert.match(chancellorSource, /LeadershipMessagePage/);
  assert.match(chancellorSource, /FALLBACK_CHANCELLOR_MESSAGE/);
  assert.match(chancellorSource, /fallbackParagraphs/);
  assert.match(chancellorSource, /overview\?\.chancellor_message/);
  assert.match(chancellorSource, /Dr\.SaraJ\.Ruto-Chairperson-Edited\.png/);
  assert.match(chancellorSource, /Message from the Chancellor/);
  assert.match(chancellorSource, /confers degrees/);
  assert.match(chancellorSource, /LeadershipMandateCard/);
  assert.match(chancellorSource, /max-w-\[340px\]/);
  assert.match(chancellorSource, /text-primary\/10/);
  assert.match(chancellorSource, /max-w-none/);
  assert.match(chancellorSource, /motion-safe:/);
  assert.doesNotMatch(chancellorSource, /has not been published yet/);
  assert.doesNotMatch(chancellorSource, /SourcePanel/);
  assert.doesNotMatch(chancellorSource, /Source reference/);
  assert.doesNotMatch(chancellorSource, /Open handbook section/);

  assert.match(viceChancellorSource, /getOverviewData/);
  assert.match(viceChancellorSource, /LeadershipMessagePage/);
  assert.match(viceChancellorSource, /FALLBACK_VC_MESSAGE/);
  assert.match(viceChancellorSource, /fallbackParagraphs/);
  assert.match(viceChancellorSource, /overview\?\.vc_message/);
  assert.match(viceChancellorSource, /KSUB-RollPhotos2025-123\.jpg/);
  assert.match(viceChancellorSource, /Message from the Vice Chancellor/);
  assert.match(viceChancellorSource, /chief executive officer/);
  assert.match(viceChancellorSource, /LeadershipMandateCard/);
  assert.match(viceChancellorSource, /max-w-\[340px\]/);
  assert.match(viceChancellorSource, /text-primary\/10/);
  assert.match(viceChancellorSource, /max-w-none/);
  assert.match(viceChancellorSource, /motion-safe:/);
  assert.doesNotMatch(viceChancellorSource, /has not been published yet/);
  assert.doesNotMatch(viceChancellorSource, /SourcePanel/);
  assert.doesNotMatch(viceChancellorSource, /Source reference/);
  assert.doesNotMatch(viceChancellorSource, /Open handbook section/);
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
