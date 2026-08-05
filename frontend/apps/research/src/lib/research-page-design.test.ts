import assert from "node:assert/strict";
import { test } from "node:test";

import {
  getDetailStorySections,
  getResearchSectionSpacing,
  publicStoryLabels,
} from "./research-page-design";

test("public story labels avoid internal data language", () => {
  const forbidden = /\b(relationship|relationships|database|record dump|related records)\b/i;

  for (const label of publicStoryLabels) {
    assert.equal(forbidden.test(label), false, label);
  }
});

test("project details use story-led section labels", () => {
  assert.deepEqual(getDetailStorySections("project"), [
    "The Challenge",
    "The Idea",
    "Work in the Field",
    "What Changed",
    "What Comes Next",
  ]);
});

test("research sections default to compact spacing", () => {
  assert.equal(getResearchSectionSpacing("compact"), "py-8");
  assert.equal(getResearchSectionSpacing(undefined), "py-8");
  assert.equal(getResearchSectionSpacing("spacious"), "py-12");
});
