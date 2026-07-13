import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const cocmsPageCmsRoot = __dirname;
const adminSrcRoot = path.resolve(__dirname, "../../../..");
const adminAppRoot = path.join(adminSrcRoot, "app");
const dashboardPageCmsRoot = path.join(adminAppRoot, "(dashboard)/page-cms");

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function read(relativePath, root = cocmsPageCmsRoot) {
  const fullPath = path.join(root, relativePath);
  assert(fs.existsSync(fullPath), `Expected file to exist: ${fullPath}`);
  return fs.readFileSync(fullPath, "utf8");
}

for (const routeFile of [
  "page.tsx",
  "sections/page.tsx",
  "sections/[id]/page.tsx",
  "spotlights/page.tsx",
]) {
  const source = read(routeFile);
  assert(
    source.includes("@/app/(dashboard)/page-cms"),
    `Expected /cocms/page-cms/${routeFile} to reuse the Page CMS implementation`,
  );
}

const cocmsDashboardSource = read("page.tsx");
assert(
  cocmsDashboardSource.includes("@/app/(dashboard)/page-cms/page"),
  "Expected /cocms/page-cms to render the Page CMS dashboard",
);

const sidebarSource = read("components/layout/sidebar.tsx", adminSrcRoot);
assert(
  sidebarSource.includes('href: "/cocms/page-cms"'),
  "Expected global sidebar Page CMS link to point at /cocms/page-cms",
);

const portalRegistrySource = read("lib/portals/registry.ts", adminSrcRoot);
for (const expectedSnippet of [
  'title: "Page CMS"',
  'href: "/cocms/page-cms"',
  'href: "/cocms/page-cms/sections"',
  'href: "/cocms/page-cms/spotlights"',
]) {
  assert(
    portalRegistrySource.includes(expectedSnippet),
    `Expected CoCMS portal registry to include ${expectedSnippet}`,
  );
}

const dashboardSource = read("page.tsx", dashboardPageCmsRoot);
for (const expectedHref of [
  'href="/cocms/page-cms/sections"',
  'href={`/cocms/page-cms/sections/${section.id}`}',
  'href="/cocms/page-cms/spotlights"',
]) {
  assert(
    dashboardSource.includes(expectedHref),
    `Expected Page CMS dashboard links to use CoCMS route: ${expectedHref}`,
  );
}

const sectionsListSource = read("sections/page.tsx", dashboardPageCmsRoot);
for (const expectedSnippet of [
  'href={`/cocms/page-cms/sections/${row.original.id}`}',
  'createHref={canCreateSections ? "/cocms/page-cms/sections/new" : undefined}',
  'backHref="/cocms/page-cms"',
]) {
  assert(
    sectionsListSource.includes(expectedSnippet),
    `Expected Page CMS sections list to use CoCMS route: ${expectedSnippet}`,
  );
}

const sectionDetailSource = read("sections/[id]/client-page.tsx", dashboardPageCmsRoot);
for (const expectedSnippet of [
  "router.replace(`/cocms/page-cms/sections/${savedSection.id}`)",
  'backHref="/cocms/page-cms/sections"',
]) {
  assert(
    sectionDetailSource.includes(expectedSnippet),
    `Expected Page CMS section detail to use CoCMS route: ${expectedSnippet}`,
  );
}

const spotlightsSource = read("spotlights/page.tsx", dashboardPageCmsRoot);
assert(
  spotlightsSource.includes('backHref="/cocms/page-cms"'),
  "Expected Page CMS spotlight page to return to /cocms/page-cms",
);

for (const legacyRoute of [
  "page.tsx",
  "sections/page.tsx",
  "sections/[id]/page.tsx",
  "spotlights/page.tsx",
]) {
  read(legacyRoute, dashboardPageCmsRoot);
}
