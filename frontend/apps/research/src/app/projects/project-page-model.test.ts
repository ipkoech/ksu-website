import { assert, test } from "vitest";

import {
  filterProjectsByMonth,
  getProjectMonths,
  getProjectYears,
  getVisibleProjectStorySections,
} from "./project-page-model";

const records = [
  {
    id: "a",
    title: "A",
    start_date: "2026-03-10",
    end_date: "2026-05-01",
    created_at: "2026-01-01",
  },
  {
    id: "b",
    title: "B",
    start_date: "2025-11-04",
    created_at: "2025-02-01",
  },
] as any[];

test("project year options are derived from backend dates", () => {
  assert.deepEqual(getProjectYears(records), ["2026", "2025"]);
});

test("project month options are derived for the selected year", () => {
  assert.deepEqual(getProjectMonths(records, "2026"), [
    { value: "1", label: "January" },
    { value: "3", label: "March" },
    { value: "5", label: "May" },
  ]);
});

test("month filtering uses backend date fields without inventing records", () => {
  assert.deepEqual(
    filterProjectsByMonth(records, "2026", "3").map((record) => record.id),
    ["a"],
  );
});

test("story sections follow the backend project narrative fields", () => {
  const sections = getVisibleProjectStorySections({
    background: "Low adoption",
    objectives: "Improve support",
    methodology: "Field trials",
    expected_outcomes: "Improved uptake",
    impact: "Better decisions",
    deliverables: "Field report",
  } as any);

  assert.deepEqual(
    sections.map((section) => section.title),
    ["Background", "Objectives", "Methodology", "Expected Outcomes", "Impact", "Deliverables"],
  );
});
