import type { ResearchGenericRecord, ResearchProject } from "@ksu/api-client";
import { compactText, formatDate } from "../../lib/research-public-data";

type MonthOption = {
  value: string;
  label: string;
};

type StorySection = {
  title: string;
  body: string;
};

const monthFormatter = new Intl.DateTimeFormat("en", { month: "long" });

const projectDateFields = [
  "start_date",
  "end_date",
  "published_at",
  "created_at",
  "updated_at",
] as const;

export function getProjectYears(projects: Array<Partial<ResearchProject>>) {
  const years = projects
    .flatMap((project) => projectDateFields.map((field) => project[field]))
    .map((value) => toDate(value)?.getFullYear())
    .filter((year): year is number => Boolean(year) && !Number.isNaN(year));

  return Array.from(new Set(years))
    .sort((a, b) => b - a)
    .map(String);
}

export function getProjectMonths(
  projects: Array<Partial<ResearchProject>>,
  selectedYear?: string,
): MonthOption[] {
  const months = projects
    .flatMap((project) => projectDateFields.map((field) => project[field]))
    .map(toDate)
    .filter((date): date is Date => Boolean(date))
    .filter((date) => !selectedYear || String(date.getFullYear()) === selectedYear)
    .map((date) => date.getMonth() + 1);

  return Array.from(new Set(months))
    .sort((a, b) => a - b)
    .map((month) => ({
      value: String(month),
      label: monthFormatter.format(new Date(2026, month - 1, 1)),
    }));
}

export function filterProjectsByMonth<T extends Partial<ResearchProject>>(
  projects: T[],
  selectedYear?: string,
  selectedMonth?: string,
) {
  if (!selectedMonth) return projects;
  const month = Number(selectedMonth);
  if (!Number.isInteger(month) || month < 1 || month > 12) return projects;

  return projects.filter((project) =>
    projectDateFields.some((field) => {
      const date = toDate(project[field]);
      if (!date) return false;
      return (
        date.getMonth() + 1 === month &&
        (!selectedYear || String(date.getFullYear()) === selectedYear)
      );
    }),
  );
}

export function getVisibleProjectStorySections(
  project: ResearchProject & ResearchGenericRecord,
): StorySection[] {
  return [
    {
      title: "The Challenge",
      body: firstText(project, ["background", "problem", "need", "abstract"]),
    },
    {
      title: "The Idea",
      body: firstText(project, ["objectives", "summary", "abstract"]),
    },
    {
      title: "Work in the Field",
      body: firstText(project, ["methodology", "activities", "description"]),
    },
    {
      title: "What Changed",
      body: firstText(project, ["impact", "expected_outcomes", "deliverables"]),
    },
    {
      title: "What Comes Next",
      body: firstText(project, ["next_steps", "future_work", "expected_outcomes"]),
    },
  ].filter((section) => section.body);
}

export function getProjectTimelineLabel(project: Partial<ResearchProject>) {
  const range = [formatDate(project.start_date), formatDate(project.end_date)]
    .filter(Boolean)
    .join(" - ");

  return range || formatDate(project.updated_at) || formatDate(project.created_at);
}

export function getProjectDisplayTitle(project: Partial<ResearchProject>) {
  return compactText(project.title) || compactText(project.name) || "Research project";
}

function firstText(record: ResearchGenericRecord, fields: string[]) {
  for (const field of fields) {
    const value = compactText(record[field]);
    if (value) return value;
  }
  return "";
}

function toDate(value: unknown) {
  if (!value) return null;
  const date = new Date(String(value));
  return Number.isNaN(date.getTime()) ? null : date;
}
