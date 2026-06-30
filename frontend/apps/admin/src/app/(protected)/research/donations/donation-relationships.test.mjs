import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const base = dirname(fileURLToPath(import.meta.url));
const donorDetail = readFileSync(
  join(base, "donors/[id]/page.tsx"),
  "utf8",
);
const impactDetail = readFileSync(
  join(base, "impacts/[id]/page.tsx"),
  "utf8",
);

assert(
  donorDetail.includes("/api/v1/donors/id/${donorId}/impacts"),
  "Donor detail must use the explicit donor impact relationship endpoint.",
);
assert(
  !donorDetail.includes("display_name") || !donorDetail.includes("search:"),
  "Donor detail must not infer impact records with donor-name search.",
);
assert(
  impactDetail.includes("/api/v1/donation-impacts/id/${impactId}/donations"),
  "Impact detail must use the explicit impact donations relationship endpoint.",
);
