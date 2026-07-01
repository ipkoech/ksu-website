import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const base = process.cwd();
const requiredRoutes = [
  "src/app/(protected)/research/centers/[slug]/page.tsx",
  "src/app/(protected)/research/programs/[id]/page.tsx",
  "src/app/(protected)/research/themes/[id]/page.tsx",
  "src/app/(protected)/research/expertise-tags/[id]/page.tsx",
  "src/app/(protected)/research/outputs/[id]/page.tsx",
  "src/app/(protected)/research/innovations/[id]/page.tsx",
  "src/app/(protected)/research/impact/[id]/page.tsx",
];

for (const route of requiredRoutes) {
  assert(existsSync(join(base, route)), `Missing core research detail route: ${route}`);
}

const detailShellSource = readFileSync(join(base, "src/app/(protected)/research/_components/research-admin-detail-page.tsx"), "utf8");
assert(detailShellSource.includes("hideHeader?: boolean"), "Research detail shell should expose hideHeader.");
assert(detailShellSource.includes("showBackAction?: boolean"), "Research detail shell should expose showBackAction.");
assert(detailShellSource.includes("!hideHeader ? <PageHeader"), "Research detail shell should allow routes to hide the duplicate page header.");
assert(detailShellSource.includes("showBackAction ? ("), "Research detail shell should allow routes to hide the duplicate back action.");

for (const route of [
  "src/app/(protected)/research/centers/[slug]/page.tsx",
  "src/app/(protected)/research/programs/[id]/page.tsx",
  "src/app/(protected)/research/themes/[id]/page.tsx",
]) {
  const source = readFileSync(join(base, route), "utf8");
  assert(source.includes("hideHeader"), `${route} should hide the duplicate detail page header.`);
  assert(source.includes("showBackAction={false}"), `${route} should rely on breadcrumbs instead of a duplicate back action.`);
  assert(source.includes("fields:"), `${route} related-record queries should request only display fields.`);
}
