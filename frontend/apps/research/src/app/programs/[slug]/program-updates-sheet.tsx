"use client";

import {
  CalendarDays,
  ExternalLink,
  MapPin,
  Newspaper,
  Sparkles,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@ksu/ui/components";
import type { ResearchGenericRecord } from "@ksu/api-client";
import { ResearchRichText } from "../../../components/research-rich-text";

type ProgramUpdateGroup = {
  title: string;
  label: string;
  hrefBase: string;
  appendSlug?: boolean;
  records: ResearchGenericRecord[];
};

export function ProgramUpdatesSheet({ groups }: { groups: ProgramUpdateGroup[] }) {
  const visibleGroups = groups.filter((group) => group.records.length > 0);
  if (!visibleGroups.length) return null;

  return (
    <section className="overflow-hidden rounded-lg border border-border bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4">
        <div>
          <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-foreground">
            Program updates
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Stories, news, and activities connected to this program.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {visibleGroups.map((group) => (
            <span
              key={group.title}
              className="rounded-md border border-border bg-surface-subtle px-3 py-1.5 text-xs font-semibold text-primary"
            >
              {group.label} {group.records.length}
            </span>
          ))}
        </div>
      </div>
      <div className="grid gap-4 p-5 lg:grid-cols-3">
        {visibleGroups.map((group) => (
          <div key={group.title} className="min-w-0">
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              {group.title}
            </h3>
            <div className="grid gap-2">
              {group.records.slice(0, 4).map((record) => (
                <ProgramUpdateSheetItem
                  key={`${group.title}-${record.id ?? record.slug ?? getRecordTitle(record)}`}
                  record={record}
                  label={group.label}
                  hrefBase={group.hrefBase}
                  appendSlug={group.appendSlug ?? true}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function ProgramUpdateSheetItem({
  record,
  label,
  hrefBase,
  appendSlug,
}: {
  record: ResearchGenericRecord;
  label: string;
  hrefBase: string;
  appendSlug: boolean;
}) {
  const title = getRecordTitle(record);
  const summary = getRecordSummary(record);
  const date = formatRecordDate(record);
  const location = getText(record.location) || getText(record.venue) || getText(record.county);
  const href = appendSlug && record.slug ? `${hrefBase}/${record.slug}` : hrefBase;
  const Icon = label === "Story" ? Sparkles : label === "Event" ? CalendarDays : Newspaper;

  return (
    <Sheet>
      <SheetTrigger asChild>
        <button
          type="button"
          className="group w-full rounded-lg border border-border bg-white p-4 text-left transition hover:border-primary/30 hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/15"
        >
          <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-primary">
            <Icon aria-hidden className="h-4 w-4" />
            {label}
          </span>
          <span className="mt-2 line-clamp-2 block text-sm font-semibold leading-6 text-foreground">
            {title}
          </span>
          {summary ? (
            <span className="mt-1 line-clamp-2 block text-xs leading-5 text-muted-foreground">
              {summary}
            </span>
          ) : null}
          <span className="mt-3 flex flex-wrap gap-3 text-xs font-medium text-muted-foreground">
            {date ? <span>{date}</span> : null}
            {location ? <span>{location}</span> : null}
          </span>
        </button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full overflow-y-auto bg-white p-0 sm:max-w-xl">
        <SheetHeader className="border-b border-border px-6 py-5 text-left">
          <span className="mb-2 w-fit rounded-md bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
            {label}
          </span>
          <SheetTitle className="text-2xl font-semibold leading-tight text-foreground">
            {title}
          </SheetTitle>
          {summary ? (
            <SheetDescription className="text-sm leading-6 text-muted-foreground">
              {summary}
            </SheetDescription>
          ) : null}
        </SheetHeader>
        <div className="grid gap-5 px-6 py-5">
          <dl className="grid gap-3 rounded-lg border border-border bg-surface-subtle p-4 text-sm">
            {date ? <MetaRow icon={CalendarDays} label="Date" value={date} /> : null}
            {location ? <MetaRow icon={MapPin} label="Location" value={location} /> : null}
          </dl>
          <RecordNarrative record={record} />
          <a
            href={href}
            className="inline-flex min-h-10 w-fit items-center gap-2 rounded-md border border-primary px-4 py-2 text-sm font-semibold text-primary transition hover:bg-primary/5"
          >
            Open full page
            <ExternalLink aria-hidden className="h-4 w-4" />
          </a>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function RecordNarrative({ record }: { record: ResearchGenericRecord }) {
  const sections = [
    { label: "Challenge", value: record.challenge },
    { label: "Approach", value: record.approach || record.solution },
    { label: "Outcomes", value: record.outcomes || record.impact },
    { label: "Details", value: record.rich_text || record.plain_text || record.content || record.body || record.description },
    { label: "What comes next", value: record.future_directions },
  ]
    .map((section) => ({ ...section, value: getText(section.value) }))
    .filter((section) => section.value);

  if (!sections.length) return null;

  return (
    <div className="grid gap-4">
      {sections.map((section) => (
        <section key={section.label}>
          <h3 className="text-sm font-semibold text-foreground">{section.label}</h3>
          <ResearchRichText content={section.value} className="mt-2 text-sm leading-7 text-muted-foreground" />
        </section>
      ))}
    </div>
  );
}

function MetaRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof CalendarDays;
  label: string;
  value: string;
}) {
  return (
    <div className="grid grid-cols-[20px_90px_minmax(0,1fr)] gap-2">
      <Icon aria-hidden className="mt-0.5 h-4 w-4 text-primary" />
      <dt className="font-semibold text-muted-foreground">{label}</dt>
      <dd className="min-w-0 break-words text-foreground [overflow-wrap:anywhere]">{value}</dd>
    </div>
  );
}

function getRecordTitle(record: ResearchGenericRecord) {
  return getText(record.title) || getText(record.name) || "Program update";
}

function getRecordSummary(record: ResearchGenericRecord) {
  return (
    cleanText(record.summary) ||
    cleanText(record.excerpt) ||
    cleanText(record.abstract) ||
    cleanText(record.description)
  );
}

function formatRecordDate(record: ResearchGenericRecord) {
  const value =
    getText(record.story_date) ||
    getText(record.event_date) ||
    getText(record.start_date) ||
    getText(record.published_at) ||
    getText(record.created_at);
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-KE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function cleanText(value: unknown) {
  return getText(value)
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getText(value: unknown) {
  if (typeof value === "string") return value.trim();
  if (typeof value === "number") return String(value);
  return "";
}
