import { assert, test } from "vitest";

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
    "Background",
    "Objectives",
    "Methodology",
    "Expected Outcomes",
    "Impact",
    "Deliverables",
  ]);
});

test("research sections default to compact spacing", () => {
  assert.equal(getResearchSectionSpacing("compact"), "py-8");
  assert.equal(getResearchSectionSpacing(undefined), "py-8");
  assert.equal(getResearchSectionSpacing("spacious"), "py-12");
});
