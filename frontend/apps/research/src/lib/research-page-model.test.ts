import assert from "node:assert/strict";
import { test } from "node:test";

import {
  filterRecordsByMonth,
  getPublishedFactItems,
  getNarrativeSections,
  getRecordMonths,
  getRecordTimelineLabel,
  getRecordTitle,
  getRecordYears,
} from "./research-page-model";

const records = [
  {
    id: "a",
    name: "Climate Initiative",
    start_date: "2026-02-12",
    end_date: "2026-06-01",
    created_at: "2025-12-01",
  },
  {
    id: "b",
    title: "Food Systems",
    published_at: "2025-09-04",
  },
] as any[];

test("record year options are derived from backend date fields", () => {
  assert.deepEqual(getRecordYears(records), ["2026", "2025"]);
});

test("record month options respect the selected year", () => {
  assert.deepEqual(getRecordMonths(records, "2026"), [
    { value: "2", label: "February" },
    { value: "6", label: "June" },
  ]);
});

test("record month filtering uses backend dates", () => {
  assert.deepEqual(
    filterRecordsByMonth(records, "2025", "9").map((record) => record.id),
    ["b"],
  );
});

test("record titles and timeline labels do not invent content", () => {
  assert.equal(getRecordTitle(records[0], "Fallback"), "Climate Initiative");
  assert.equal(getRecordTimelineLabel(records[1]), "Sep 4, 2025");
});

test("published fact items omit missing backend values", () => {
  assert.deepEqual(
    getPublishedFactItems([
      { label: "Timeline", value: "2024 - 2028" },
      { label: "Center", value: "" },
      { label: "Outputs", value: null },
      { label: "Status", value: "Active" },
    ]),
    [
      { label: "Timeline", value: "2024 - 2028" },
      { label: "Status", value: "Active" },
    ],
  );
});

test("narrative sections use configured public labels", () => {
  const sections = getNarrativeSections(
    { summary: "Shared agenda", methodology: "Field labs" } as any,
    [
      { title: "Program focus", fields: ["summary"] },
      { title: "How the work moves", fields: ["methodology"] },
      { title: "Public impact", fields: ["impact"] },
    ],
  );

  assert.deepEqual(
    sections.map((section) => section.title),
    ["Program focus", "How the work moves"],
  );
});
