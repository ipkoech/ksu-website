import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

const root = process.cwd();
const read = (path) => readFileSync(join(root, path), "utf8");

test("governance admin api exposes council workspace endpoints", () => {
  const source = read("src/lib/api/organization.ts");

  for (const fragment of [
    "governanceAdminApi",
    "/governance/admin/council/dashboard",
    "/governance/admin/council/members",
    "/governance/admin/council/order",
    "/governance/admin/council/page-content",
    "/governance/admin/council/preview",
  ]) {
    assert.match(source, new RegExp(fragment.replaceAll("/", "\\/")));
  }
});

test("university council workspace route renders seamless primary actions", () => {
  const source = read("src/app/(protected)/governance/university-council/_components/council-dashboard.tsx");

  for (const label of [
    "Add Council Member",
    "Manage Display Order",
    "Preview Public Page",
    "Publish Changes",
    "View Archived Members",
  ]) {
    assert.match(source, new RegExp(label));
  }

  assert.doesNotMatch(source, /raw uuid/i);
});

test("portal registry links to university council workspace", () => {
  const source = read("src/lib/portals/registry.ts");

  assert.match(source, /University Council/);
  assert.match(source, /\/governance\/university-council/);
});
