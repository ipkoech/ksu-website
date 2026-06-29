import type { ResearchGenericRecord } from "@ksu/api-client";
import { compactText, formatDate } from "./research-public-data";

export type MonthOption = {
  value: string;
  label: string;
};

export type NarrativeSection = {
  title: string;
  body: string;
};

export type NarrativeSectionSpec = {
  title: string;
  fields: string[];
};

const monthFormatter = new Intl.DateTimeFormat("en", { month: "long" });

const recordDateFields = [
  "start_date",
  "end_date",
  "deadline",
  "event_date",
  "published_at",
  "publication_date",
  "created_at",
  "updated_at",
] as const;

export function getRecordYears(records: Array<Partial<ResearchGenericRecord>>) {
  const years = records
    .flatMap((record) => recordDateFields.map((field) => record[field]))
    .map((value) => toDate(value)?.getFullYear())
    .filter((year): year is number => Boolean(year) && !Number.isNaN(year));

  return Array.from(new Set(years))
    .sort((a, b) => b - a)
    .map(String);
}

export function getRecordMonths(
  records: Array<Partial<ResearchGenericRecord>>,
  selectedYear?: string,
): MonthOption[] {
  const months = records
    .flatMap((record) => recordDateFields.map((field) => record[field]))
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

export function filterRecordsByMonth<T extends Partial<ResearchGenericRecord>>(
  records: T[],
  selectedYear?: string,
  selectedMonth?: string,
) {
  if (!selectedMonth) return records;
  const month = Number(selectedMonth);
  if (!Number.isInteger(month) || month < 1 || month > 12) return records;

  return records.filter((record) =>
    recordDateFields.some((field) => {
      const date = toDate(record[field]);
      if (!date) return false;
      return (
        date.getMonth() + 1 === month &&
        (!selectedYear || String(date.getFullYear()) === selectedYear)
      );
    }),
  );
}

export function getRecordTitle(record: ResearchGenericRecord, fallback: string) {
  return (
    compactText(record.name) ||
    compactText(record.title) ||
    compactText(record.display_name) ||
    compactText(record.code) ||
    fallback
  );
}

export function getRecordSummary(record: ResearchGenericRecord) {
  return (
    compactText(record.summary) ||
    compactText(record.abstract) ||
    compactText(record.description) ||
    compactText(record.about)
  );
}

export function getRecordTimelineLabel(record: Partial<ResearchGenericRecord>) {
  const range = [formatDate(record.start_date), formatDate(record.end_date)]
    .filter(Boolean)
    .join(" - ");

  return (
    range ||
    formatDate(record.event_date) ||
    formatDate(record.deadline) ||
    formatDate(record.published_at) ||
    formatDate(record.updated_at) ||
    formatDate(record.created_at)
  );
}

export function getNarrativeSections(
  record: ResearchGenericRecord,
  specs: NarrativeSectionSpec[],
): NarrativeSection[] {
  return specs
    .map((spec) => ({
      title: spec.title,
      body: firstText(record, spec.fields),
    }))
    .filter((section) => section.body);
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
