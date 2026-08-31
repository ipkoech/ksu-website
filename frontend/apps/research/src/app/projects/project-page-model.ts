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
      title: "Background",
      body: compactText(project.background),
    },
    {
      title: "Objectives",
      body: compactText(project.objectives),
    },
    {
      title: "Methodology",
      body: compactText(project.methodology),
    },
    {
      title: "Expected Outcomes",
      body: compactText(project.expected_outcomes),
    },
    {
      title: "Impact",
      body: compactText(project.impact),
    },
    {
      title: "Deliverables",
      body: compactText(project.deliverables),
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

function toDate(value: unknown) {
  if (!value) return null;
  const date = new Date(String(value));
  return Number.isNaN(date.getTime()) ? null : date;
}
