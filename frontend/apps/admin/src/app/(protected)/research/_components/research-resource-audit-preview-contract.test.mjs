import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const componentRoot = dirname(fileURLToPath(import.meta.url));
const componentPath = join(componentRoot, "research-resource-page.tsx");
const source = readFileSync(componentPath, "utf8");

assert(source.includes("auditLogsApi"), "Shared ResearchResourcePage must use the existing auditLogsApi.");
assert(source.includes("ResearchResourceAuditPreview"), "Shared ResearchResourcePage must render a compact audit preview.");
assert(source.includes("service_name: serviceName"), "Audit preview must query the real service_name filter.");
assert(source.includes("resource_type: resourceType"), "Audit preview must query the real resource_type filter.");
assert(source.includes("<ResearchResourceAuditPreview"), "Audit preview must be attached to ResearchResourcePage summary content.");
assert(source.includes("auditResourceType"), "List pages must be able to provide the backend audit resource_type.");
