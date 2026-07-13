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

test("governance admin api matches backend dashboard and transition contracts", () => {
  const source = read("src/lib/api/organization.ts");

  for (const fragment of [
    "total_active_members",
    "published_profile_count",
    "last_updated_at",
    "params: data?.comment",
  ]) {
    assert.match(source, new RegExp(fragment.replaceAll("?", "\\?")));
  }

  assert.doesNotMatch(source, /active_members_count/);
  assert.doesNotMatch(source, /published_profiles_count/);
  assert.doesNotMatch(source, /last_update_date/);
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

test("university council primary actions control workspace tabs", () => {
  const source = read("src/app/(protected)/governance/university-council/_components/council-dashboard.tsx");

  assert.match(source, /useState\("members"\)/);
  assert.match(source, /setActiveTab\(item\.tab\)/);
  assert.match(source, /<Tabs value=\{activeTab\} onValueChange=\{setActiveTab\}/);
});

test("portal registry links to university council workspace", () => {
  const source = read("src/lib/portals/registry.ts");

  assert.match(source, /University Council/);
  assert.match(source, /\/governance\/university-council/);
});
