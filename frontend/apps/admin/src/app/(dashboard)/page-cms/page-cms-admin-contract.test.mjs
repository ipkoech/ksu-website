import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const appRoot = path.resolve(__dirname);
const adminRoot = path.resolve(__dirname, "../../..");

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function expectDefaultPageExport(relativePath) {
  const fullPath = path.join(appRoot, relativePath);
  assert(fs.existsSync(fullPath), `Expected route file to exist: ${relativePath}`);

  const source = fs.readFileSync(fullPath, "utf8");
  assert(
    /export\s+default\s+function\s+\w+Page\s*\(/.test(source) ||
      /export\s+default\s+function\s+\w+\s*\(/.test(source) ||
      /export\s+default\s+/.test(source),
    `Expected default page export in ${relativePath}`,
  );
}

expectDefaultPageExport("page.tsx");
expectDefaultPageExport("sections/page.tsx");
expectDefaultPageExport("sections/[id]/page.tsx");
expectDefaultPageExport("spotlights/page.tsx");

const sectionDetailSource = fs.readFileSync(path.join(appRoot, "sections/[id]/client-page.tsx"), "utf8");
for (const requiredSnippet of [
  "pageSectionsApi.get(",
  "Subtitle",
  "Description",
  "Settings",
  "\"page_sections.delete\"",
  "if (action === \"archive\") return canArchive;",
  "const creatableItems = items.filter((item) => item.id || !isEmptyItemDraft(item));",
  "await sectionItemsApi.create(savedSection.id, payload)",
]) {
  assert(
    sectionDetailSource.includes(requiredSnippet),
    `Expected section detail page to include: ${requiredSnippet}`,
  );
}

const dashboardSource = fs.readFileSync(path.join(appRoot, "page.tsx"), "utf8");
assert(
  dashboardSource.includes('redirect("/corporate-communication/page-cms")'),
  "Expected legacy /page-cms route to redirect to the canonical Page CMS route",
);

const sharedDashboardSource = fs.readFileSync(
  path.join(adminRoot, "components/page-cms/page-cms-dashboard.tsx"),
  "utf8",
);
for (const requiredSnippet of [
  "canViewSections ? (",
  "canManageSpotlights ? (",
  "href=\"/corporate-communication/page-cms/sections\"",
  "href=\"/corporate-communication/page-cms/spotlights\"",
]) {
  assert(
    sharedDashboardSource.includes(requiredSnippet),
    `Expected shared dashboard implementation to include: ${requiredSnippet}`,
  );
}

const spotlightsPageSource = fs.readFileSync(path.join(appRoot, "spotlights/page.tsx"), "utf8");
for (const requiredSnippet of [
  "partnershipSpotlightsApi.listAdmin(",
  "partnershipSpotlightsApi.get(",
  "partnershipSpotlightsApi.workflow(",
  "workflowButtonsForStatus(form.status)",
  "request_changes",
  "unpublish",
]) {
  assert(
    spotlightsPageSource.includes(requiredSnippet),
    `Expected spotlights page to include: ${requiredSnippet}`,
  );
}

const apiHelperPath = path.join(adminRoot, "lib/api/page-cms.ts");
assert(fs.existsSync(apiHelperPath), "Expected page CMS API helper to exist");

const apiSource = fs.readFileSync(apiHelperPath, "utf8");
for (const exportName of [
  "pageSectionsApi",
  "sectionItemsApi",
  "partnershipSpotlightsApi",
]) {
  assert(
    apiSource.includes(`export const ${exportName}`),
    `Expected ${exportName} export in lib/api/page-cms.ts`,
  );
}

const sidebarSource = fs.readFileSync(path.join(adminRoot, "components/layout/sidebar.tsx"), "utf8");
for (const requiredSidebarScope of [
  '"school_homepage.manage"',
  '"research_homepage.manage"',
  '"library_homepage.manage"',
]) {
  assert(
    sidebarSource.includes(requiredSidebarScope),
    `Expected sidebar Page CMS entry to include scope ${requiredSidebarScope}`,
  );
}

for (const expectedSnippet of [
  "get: (sectionId: string)",
  "listAdmin: (params?: PageSectionListParams)",
  "archive: (sectionId: string)",
  "disable: (itemId: string)",
  "listAdmin: (params?: ListParams)",
  "get: (spotlightId: string)",
  "workflow: (spotlightId: string, action: PartnershipSpotlightWorkflowAction)",
  "disable: (spotlightId: string)",
]) {
  assert(
    apiSource.includes(expectedSnippet),
    `Expected page CMS API helper to include: ${expectedSnippet}`,
  );
}

for (const forbiddenSnippet of [
  "delete: (sectionId: string)",
  "delete: (itemId: string)",
  "delete: (spotlightId: string)",
]) {
  assert(
    !apiSource.includes(forbiddenSnippet),
    `Expected page CMS API helper to avoid misleading alias: ${forbiddenSnippet}`,
  );
}
