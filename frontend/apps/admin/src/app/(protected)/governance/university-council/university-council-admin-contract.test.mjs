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

test("member editor uses readable relationship and media controls", () => {
  const source = read("src/app/(protected)/governance/university-council/_components/council-member-editor.tsx");

  for (const fragment of [
    "PersonPicker",
    "MediaPicker",
    "Public role label",
    "Appointment category",
    "Represented institution",
    "Publish without approved portrait",
    "submit-review",
    "Select a governance role before saving",
  ]) {
    assert.match(source, new RegExp(fragment));
  }

  assert.doesNotMatch(source, /photo_id: values\.photo_id/);
});

test("order manager persists explicit backend order and supports keyboard users", () => {
  const source = read("src/app/(protected)/governance/university-council/_components/council-order-manager.tsx");

  for (const fragment of [
    "updateCouncilOrder",
    "Move up",
    "Move down",
    "Chairperson",
    "Council Members",
    "Secretary to Council",
    "Loading Council order",
    "could not be loaded",
  ]) {
    assert.match(source, new RegExp(fragment));
  }
});

test("page content editor manages hero and mandate content", () => {
  const source = read("src/app/(protected)/governance/university-council/_components/council-page-content-editor.tsx");

  for (const fragment of [
    "Hero background image",
    "Overlay intensity",
    "Our Mandate",
    "Council Charter",
    "updateCouncilPageContent",
    "Loading Council page content",
    "could not be loaded",
  ]) {
    assert.match(source, new RegExp(fragment));
  }
});

test("preview shows clickable public-style member cards", () => {
  const source = read("src/app/(protected)/governance/university-council/_components/council-preview.tsx");

  assert.match(source, /Preview Public Page/);
  assert.match(source, /View profile of/);
  assert.match(source, /chairperson/i);
  assert.match(source, /secretary/i);
  assert.match(source, /Loading Council preview/);
  assert.match(source, /could not be loaded/);
});
