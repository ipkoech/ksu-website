import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const appRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)));

function read(relativePath) {
  const fullPath = path.join(appRoot, relativePath);
  if (!fs.existsSync(fullPath)) throw new Error(`Missing ${relativePath}`);
  return fs.readFileSync(fullPath, "utf8");
}

function assertRedirect(relativePath, target) {
  const source = read(relativePath);
  if (!source.includes(`redirect("${target}`) && !source.includes(`redirect(\`${target}`)) {
    throw new Error(`Expected ${relativePath} to redirect to ${target}`);
  }
}

assertRedirect("cocms/page.tsx", "/corporate-communication");
assertRedirect("cocms/page-cms/page.tsx", "/corporate-communication/page-cms");
assertRedirect("publications/page.tsx", "/research/publications");
assertRedirect("governance/page.tsx", "/admin");
assertRedirect("institutional-administration/page.tsx", "/admin");
assertRedirect("student-clubs/page.tsx", "/corporate-communication/student-clubs");

for (const canonical of [
  "corporate-communication/page.tsx",
  "corporate-communication/page-cms/page.tsx",
  "corporate-communication/page-cms/sections/page.tsx",
  "corporate-communication/page-cms/spotlights/page.tsx",
  "research/publications/page.tsx",
]) {
  read(canonical);
}
