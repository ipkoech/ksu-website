import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const source = fs.readFileSync(path.join(__dirname, "research-dashboard-client.tsx"), "utf8");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

assert(
  source.includes("<AttentionStrip items={data?.attention} loading={analytics.isLoading} compact />"),
  "attention needed should render as a compact right-sidebar panel",
);
assert(
  !source.includes("<AttentionStrip items={data?.attention} loading={analytics.isLoading} />"),
  "attention needed should no longer render in the main dashboard column",
);
assert(
  !source.includes("Public research portal"),
  "the right-sidebar public portal card should be replaced by attention needed",
);
assert(
  source.includes("compact = false"),
  "attention needed should keep the full-width layout available through a default compact prop",
);
