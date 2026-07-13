import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const corporateCommunicationRoot = __dirname;
const cocmsRoot = path.join(__dirname, "../cocms");

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function read(root, relativePath) {
  const filePath = path.join(root, relativePath);
  assert(fs.existsSync(filePath), `Expected file to exist: ${filePath}`);
  return fs.readFileSync(filePath, "utf8");
}

const canonicalPage = read(corporateCommunicationRoot, "page.tsx");
assert(
  canonicalPage.includes('<PortalDashboard portalKey="corporate-communication" />'),
  "Expected /corporate-communication to render the Corporate Communication portal dashboard",
);
assert(
  !canonicalPage.includes("redirect("),
  "Expected /corporate-communication not to redirect to a legacy route",
);

const canonicalResourcePage = read(corporateCommunicationRoot, "[resource]/page.tsx");
assert(
  canonicalResourcePage.includes('portalKey="corporate-communication"'),
  "Expected /corporate-communication/[resource] to use the Corporate Communication portal",
);
assert(
  !canonicalResourcePage.includes("redirect("),
  "Expected /corporate-communication/[resource] not to redirect to a legacy route",
);

const canonicalLayout = read(corporateCommunicationRoot, "layout.tsx");
assert(
  canonicalLayout.includes('portalKey="corporate-communication"'),
  "Expected /corporate-communication to use the Corporate Communication portal shell",
);

const legacyPage = read(cocmsRoot, "page.tsx");
assert(
  legacyPage.includes('redirect("/corporate-communication")'),
  "Expected /cocms to redirect to /corporate-communication",
);

const legacyResourcePage = read(cocmsRoot, "[resource]/page.tsx");
assert(
  legacyResourcePage.includes("redirect(`/corporate-communication/${resource}`)"),
  "Expected /cocms/[resource] to redirect to /corporate-communication/[resource]",
);
