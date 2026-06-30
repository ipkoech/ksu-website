import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const settingsRoot = dirname(fileURLToPath(import.meta.url));
const componentPath = join(settingsRoot, "_components/settings-operational-detail.tsx");
const detailRoutes = [
  "services/[id]/page.tsx",
  "resources/[id]/page.tsx",
  "guidelines/[id]/page.tsx",
  "sliders/[id]/page.tsx",
];

assert(existsSync(componentPath), "Missing shared settings operational detail component.");

const componentSource = readFileSync(componentPath, "utf8");
assert(componentSource.includes("ResearchDetailRelationshipTabs"), "Settings detail must use the reusable tab pattern.");
assert(componentSource.includes("Operational Status"), "Settings detail must include operational status.");
assert(componentSource.includes("Access And Ownership"), "Settings detail must include access and ownership context.");
assert(componentSource.includes("Publication And Review"), "Settings detail must include publication/review context.");

for (const route of detailRoutes) {
  const routePath = join(settingsRoot, route);
  assert(existsSync(routePath), `Missing settings detail route: ${route}`);
  const source = readFileSync(routePath, "utf8");
  assert(source.includes("SettingsOperationalDetail"), `${route} must render settings operational tabs.`);
  assert(source.includes("renderAfter"), `${route} must attach operational tabs through the detail page pattern.`);
}
