import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const cocmsPageCmsRoot = __dirname;
const cocmsRoot = path.join(__dirname, "..");
const adminSrcRoot = path.resolve(__dirname, "../../../..");
const adminAppRoot = path.join(adminSrcRoot, "app");
const dashboardPageCmsRoot = path.join(adminAppRoot, "(dashboard)/page-cms");
const corporateCommunicationPageCmsRoot = path.join(adminAppRoot, "(protected)/corporate-communication/page-cms");

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

for (const [routeFile, target] of [
  ["page-cms/page.tsx", "/corporate-communication/page-cms"],
  ["page-cms/sections/page.tsx", "/corporate-communication/page-cms/sections"],
  ["page-cms/sections/[id]/page.tsx", "/corporate-communication/page-cms/sections/${id}"],
  ["page-cms/spotlights/page.tsx", "/corporate-communication/page-cms/spotlights"],
  ["review-queue/page.tsx", "/corporate-communication/review-queue"],
]) {
  const source = read(routeFile, cocmsRoot);
  assert(
    source.includes(`redirect(\`${target}`) || source.includes(`redirect("${target}`),
    `Expected /cocms/${routeFile} to redirect to ${target}`,
  );
}

const sidebarSource = read("components/layout/sidebar.tsx", adminSrcRoot);
assert(
  sidebarSource.includes('href: "/corporate-communication/page-cms"'),
  "Expected global sidebar Page CMS link to point at /corporate-communication/page-cms",
);

const portalRegistrySource = read("lib/portals/registry.ts", adminSrcRoot);
for (const expectedSnippet of [
  'title: "Page CMS"',
  'href: "/corporate-communication/page-cms"',
  'href: "/corporate-communication/page-cms/sections"',
  'href: "/corporate-communication/page-cms/spotlights"',
]) {
  assert(
    portalRegistrySource.includes(expectedSnippet),
    `Expected Corporate Communication portal registry to include ${expectedSnippet}`,
  );
}

const dashboardSource = read("page.tsx", dashboardPageCmsRoot);
assert(
  dashboardSource.includes('redirect("/corporate-communication/page-cms")'),
  "Expected /page-cms to redirect to /corporate-communication/page-cms",
);

const canonicalDashboardSource = read("page.tsx", corporateCommunicationPageCmsRoot);
assert(
  canonicalDashboardSource.includes("@/components/page-cms/page-cms-dashboard"),
  "Expected canonical Page CMS route to render the shared dashboard implementation",
);

const legacyDetailSource = read("page-cms/sections/[id]/page.tsx", cocmsRoot);
assert(
  legacyDetailSource.includes("generateStaticParams"),
  "Expected legacy dynamic Page CMS redirect to export static params",
);
assert(
  legacyDetailSource.includes("@/app/(protected)/corporate-communication/page-cms/sections/[id]/page"),
  "Expected legacy dynamic Page CMS redirect to share canonical static params",
);

const sectionsListSource = read("sections/page.tsx", dashboardPageCmsRoot);
for (const expectedSnippet of [
  'href={`/corporate-communication/page-cms/sections/${row.original.id}`}',
  'createHref={canCreateSections ? "/corporate-communication/page-cms/sections/new" : undefined}',
  'backHref="/corporate-communication/page-cms"',
]) {
  assert(
    sectionsListSource.includes(expectedSnippet),
    `Expected Page CMS sections list to use Corporate Communication route: ${expectedSnippet}`,
  );
}

const sectionDetailSource = read("sections/[id]/client-page.tsx", dashboardPageCmsRoot);
for (const expectedSnippet of [
  "router.replace(`/corporate-communication/page-cms/sections/${savedSection.id}`)",
  'backHref="/corporate-communication/page-cms/sections"',
]) {
  assert(
    sectionDetailSource.includes(expectedSnippet),
    `Expected Page CMS section detail to use Corporate Communication route: ${expectedSnippet}`,
  );
}

const spotlightsSource = read("spotlights/page.tsx", dashboardPageCmsRoot);
assert(
  spotlightsSource.includes('backHref="/corporate-communication/page-cms"'),
  "Expected Page CMS spotlight page to return to /corporate-communication/page-cms",
);

for (const legacyRoute of [
  "page.tsx",
  "sections/page.tsx",
  "sections/[id]/page.tsx",
  "spotlights/page.tsx",
]) {
  read(legacyRoute, dashboardPageCmsRoot);
}
