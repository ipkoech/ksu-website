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
