import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const directory = path.dirname(fileURLToPath(import.meta.url));
const client = await readFile(path.join(directory, "school-portal.ts"), "utf8");
const types = await readFile(path.join(directory, "types.ts"), "utf8");
const index = await readFile(path.join(directory, "index.ts"), "utf8");

assert.match(
  client,
  /context:\s*\(\)\s*=>\s*mainApi\.get<\{\s*data:\s*SchoolPortalContextResponse\s*\}>\(\s*"\/api\/v1\/school-portal\/context"/s,
  "The client must fetch server-derived school context without a caller-provided school ID.",
);
assert.match(
  client,
  /root:\s*\(schoolId:\s*string\)\s*=>\s*\["school-portal",\s*schoolId\]\s*as const/,
  "All scoped query keys must be rooted at school-portal and the resolved school ID.",
);
assert.doesNotMatch(
  client,
  /(schoolId|school_id)\s*:\s*string[\s\S]{0,100}mainApi\.(get|post|put|patch|delete)/,
  "School Portal requests must not accept a caller-provided school ID.",
);
assert.match(
  types,
  /export interface SchoolPortalContextResponse[\s\S]*allowed_navigation:\s*SchoolPortalNavigationKey\[\]/,
  "Context must expose typed server-authorized navigation.",
);
assert.match(
  types,
  /export type SchoolPortalNavigationKey[\s\S]*"dashboard"[\s\S]*"audit"/,
  "All server navigation keys must be represented by a strict union.",
);
assert.match(
  index,
  /export \* from "\.\/school-portal";/,
  "The School Portal API must be exported from the Main client.",
);
