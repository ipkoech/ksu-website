import { expect, test } from "vitest";

import {
  filterRecordsByMonth,
  getListPageSize,
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
  expect(getRecordYears(records)).toEqual(["2026", "2025"]);
});

test("record month options respect the selected year", () => {
  expect(getRecordMonths(records, "2026")).toEqual([
    { value: "2", label: "February" },
    { value: "6", label: "June" },
  ]);
});

test("record month filtering uses backend dates", () => {
  expect(
    filterRecordsByMonth(records, "2025", "9").map((record) => record.id),
  ).toEqual(["b"]);
});

test("record titles and timeline labels do not invent content", () => {
  expect(getRecordTitle(records[0], "Fallback")).toBe("Climate Initiative");
  expect(getRecordTimelineLabel(records[1])).toBe("4 Sept 2025");
});

test("published fact items omit missing backend values", () => {
  expect(
    getPublishedFactItems([
      { label: "Timeline", value: "2024 - 2028" },
      { label: "Center", value: "" },
      { label: "Outputs", value: null },
      { label: "Status", value: "Active" },
    ]),
  ).toEqual([
      { label: "Timeline", value: "2024 - 2028" },
      { label: "Status", value: "Active" },
  ]);
});

test("list page size uses valid request size and falls back safely", () => {
  expect(getListPageSize(12)).toBe(12);
  expect(getListPageSize(undefined)).toBe(12);
  expect(getListPageSize(0)).toBe(12);
  expect(getListPageSize(80)).toBe(50);
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

  expect(
    sections.map((section) => section.title),
  ).toEqual(["Program focus", "How the work moves"]);
});
