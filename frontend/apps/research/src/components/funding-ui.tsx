import Link from "next/link";
import type { ReactNode } from "react";
import {
  ArrowRight,
  Banknote,
  CalendarClock,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  ExternalLink,
  FileText,
  Landmark,
  Search,
  ShieldCheck,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { compactText, formatDate, formatLabel } from "../lib/research-public-data";
import { getResearchRecordDownloadHref } from "../lib/research-downloads";

export type FundingAction = {
  label: string;
  href: string;
  variant?: "primary" | "secondary";
};

export type FundingFact = {
  label: string;
  value?: string | number | null;
  icon?: LucideIcon;
};

export type DeadlineState = {
  label: string;
  value: string;
  tone: "open" | "soon" | "urgent" | "closed";
  days?: number;
};

export function FundingIllustratedHero({
  eyebrow,
  title,
  body,
  actions = [],
  facts = [],
  tone = "grant",
}: {
  eyebrow: string;
  title: string;
  body?: string;
  actions?: FundingAction[];
  facts?: FundingFact[];
  tone?: "grant" | "scholarship" | "endowment" | "donate";
}) {
  const visibleFacts = facts.filter((fact) => compactText(fact.value));

  return (
    <section className="relative isolate overflow-hidden border-b border-border bg-[hsl(var(--brand-overlay))] px-4 py-6 text-white sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
      <FundingHeroArtwork tone={tone} />
      <div className="relative mx-auto grid max-w-[1680px] gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(360px,520px)] lg:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-secondary">
            {eyebrow}
          </p>
          <h1 className="mt-3 max-w-5xl text-balance font-[family-name:var(--font-display)] text-3xl font-semibold leading-tight sm:text-4xl">
            {title}
          </h1>
          {body ? (
            <p className="mt-3 max-w-3xl text-sm leading-7 text-white/82 sm:text-base">
              {body}
            </p>
          ) : null}
          {actions.length > 0 ? (
            <div className="mt-5 flex flex-wrap gap-3">
              {actions.map((action) => (
                <Link
                  key={action.label}
                  href={action.href}
                  className={
                    action.variant === "secondary"
                      ? "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-white/35 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                      : "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-primary px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90"
                  }
                >
                  {action.label}
                  <ArrowRight aria-hidden className="h-4 w-4" />
                </Link>
              ))}
            </div>
          ) : null}
        </div>
        {visibleFacts.length > 0 ? (
          <dl className="grid gap-2 rounded-lg border border-white/15 bg-white/10 p-3 shadow-2xl backdrop-blur sm:grid-cols-2">
            {visibleFacts.slice(0, 4).map((fact) => {
              const Icon = fact.icon ?? CircleDollarSign;
              return (
                <div key={fact.label} className="rounded-md border border-white/10 bg-white/10 p-3">
                  <dt className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-white/65">
                    <Icon aria-hidden className="h-3.5 w-3.5 text-secondary" />
                    {fact.label}
                  </dt>
                  <dd className="mt-1 text-sm font-semibold text-white">{compactText(fact.value)}</dd>
                </div>
              );
            })}
          </dl>
        ) : null}
      </div>
    </section>
  );
}

export function FundingHeroArtwork({ tone }: { tone: "grant" | "scholarship" | "endowment" | "donate" }) {
  const accent = tone === "scholarship" ? "#0f56b3" : tone === "endowment" ? "#b77900" : tone === "donate" ? "#0f766e" : "hsl(var(--primary)/.62)";
  return (
    <div aria-hidden className="absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(105deg,rgba(6,26,54,0.98)_0%,rgba(6,26,54,0.88)_48%,rgba(0,88,61,0.5)_100%)]" />
      <svg className="absolute right-0 top-0 h-full w-[58%] min-w-[720px] opacity-45" viewBox="0 0 900 360" fill="none">
        <defs>
          <linearGradient id={`funding-${tone}`} x1="0" x2="900" y1="0" y2="360">
            <stop stopColor={accent} stopOpacity="0.82" />
            <stop offset="1" stopColor="#f59e0b" stopOpacity="0.68" />
          </linearGradient>
        </defs>
        <path d="M55 290C180 180 250 244 350 142C462 28 590 78 690 148C768 203 815 192 875 136" stroke={`url(#funding-${tone})`} strokeWidth="2" />
        <g stroke="#fff" strokeOpacity=".38" strokeWidth="1.5">
          <rect x="520" y="92" width="118" height="158" rx="10" />
          <path d="M548 126h62M548 154h70M548 182h50M548 210h72" />
          <circle cx="710" cy="146" r="56" />
          <path d="M680 146h60M710 116v60" />
          <path d="M150 238h150M190 238V132h68v106M206 162h36M206 190h36" />
          <path d="M330 238v-82h86v82M350 184h46M350 210h46" />
          <path d="M90 108c45 13 77 45 94 95C126 194 92 160 90 108Z" />
          <path d="M185 204c17-56 55-92 113-108-4 62-43 98-113 108Z" />
        </g>
        <g fill="#fff" fillOpacity=".32">
          <circle cx="428" cy="72" r="5" />
          <circle cx="772" cy="74" r="6" />
          <circle cx="328" cy="276" r="4" />
          <circle cx="846" cy="238" r="5" />
        </g>
      </svg>
    </div>
  );
}

export function FundingToolbar({
  action,
  resetHref,
  searchValue,
  placeholder,
  children,
}: {
  action: string;
  resetHref: string;
  searchValue?: string;
  placeholder: string;
  children?: ReactNode;
}) {
  return (
    <div className="rounded-lg border border-border bg-white p-3 shadow-sm">
      <form action={action} className="flex flex-col gap-2 lg:flex-row">
        <label className="relative min-w-0 flex-1">
          <span className="sr-only">Search</span>
          <Search aria-hidden className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/70" />
          <input
            name="q"
            defaultValue={searchValue}
            placeholder={placeholder}
            className="h-11 w-full rounded-md border border-border bg-white pl-10 pr-3 text-sm outline-none ring-primary/20 transition focus:border-primary focus:ring-4"
          />
        </label>
        <button className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-5 text-sm font-semibold text-white transition hover:bg-primary/90">
          Search
        </button>
        {children}
        <Link
          href={resetHref}
          className="inline-flex h-11 items-center justify-center rounded-md border border-border px-4 text-sm font-semibold text-muted-foreground transition hover:bg-surface-subtle"
        >
          Reset
        </Link>
      </form>
    </div>
  );
}

export function DeadlineStatusBadge({ deadline, large = false }: { deadline: DeadlineState; large?: boolean }) {
  const toneClass =
    deadline.tone === "closed"
      ? "border-border bg-surface-muted text-muted-foreground"
      : deadline.tone === "urgent"
        ? "border-red-300 bg-red-50 text-red-700"
        : deadline.tone === "soon"
          ? "border-amber-300 bg-amber-50 text-amber-800"
          : "border-primary/30 bg-primary/[0.08] text-primary";
  return (
    <span className={`inline-flex shrink-0 items-center gap-2 rounded-md border font-semibold ${toneClass} ${large ? "px-4 py-2 text-sm" : "px-2.5 py-1 text-xs"}`}>
      <Clock3 aria-hidden className={large ? "h-4 w-4" : "h-3.5 w-3.5"} />
      {deadline.label}
    </span>
  );
}

export function getDeadlineState(deadline?: string | null, status?: string | null): DeadlineState {
  if (!deadline) {
    return { label: "Deadline", value: "", tone: "open" };
  }
  const date = new Date(deadline);
  const now = new Date();
  const days = Math.ceil((date.getTime() - now.getTime()) / 86_400_000);
  if (status === "closed" || days < 0) {
    return { label: "Closed", value: formatDate(deadline), tone: "closed", days };
  }
  if (days === 0) {
    return { label: "Due today", value: formatDate(deadline), tone: "urgent", days };
  }
  if (days <= 14) {
    return { label: "Closing soon", value: `${formatDate(deadline)} · ${days} days left`, tone: "soon", days };
  }
  return { label: "Open", value: `${formatDate(deadline)} · ${days} days left`, tone: "open", days };
}

export function CompactFactGrid({ facts }: { facts: FundingFact[] }) {
  const visibleFacts = facts.filter((fact) => compactText(fact.value));
  if (visibleFacts.length === 0) return null;
  return (
    <dl className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {visibleFacts.map((fact) => {
        const Icon = fact.icon ?? FileText;
        return (
          <div key={fact.label} className="rounded-lg border border-border bg-white p-4 shadow-sm">
            <dt className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              <Icon aria-hidden className="h-4 w-4 text-primary" />
              {fact.label}
            </dt>
            <dd className="mt-2 text-sm font-semibold text-foreground">{compactText(fact.value)}</dd>
          </div>
        );
      })}
    </dl>
  );
}

export function FundingInfoSection({
  title,
  fields,
}: {
  title: string;
  fields: Array<[string, unknown]>;
}) {
  const entries = fields
    .map(([label, value]) => ({ label, value: compactText(value as string | number | null | undefined) }))
    .filter((entry) => entry.value);
  if (entries.length === 0) return null;
  return (
    <section className="rounded-lg border border-border bg-white p-5 shadow-sm">
      <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold text-foreground">{title}</h2>
      <div className="mt-4 divide-y divide-slate-200">
        {entries.map((entry) => (
          <div key={entry.label} className="py-4 first:pt-0 last:pb-0">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">{entry.label}</p>
            <p className="mt-2 whitespace-pre-line text-sm leading-7 text-muted-foreground">{entry.value}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function DocumentListPanel({
  title,
  records,
}: {
  title: string;
  records: Array<Record<string, unknown>>;
}) {
  const visibleRecords = records.filter((record) => textValue(record.title) || textValue(record.name) || textValue(record.document_name));
  if (visibleRecords.length === 0) return null;
  return (
    <section className="rounded-lg border border-border bg-white p-5 shadow-sm">
      <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold text-foreground">{title}</h2>
      <div className="mt-4 divide-y divide-slate-200">
        {visibleRecords.map((record, index) => {
          const href = getResearchRecordDownloadHref(record);
          return (
            <article key={textValue(record.id) || `${title}-${index}`} className="py-4 first:pt-0 last:pb-0">
              <p className="text-sm font-semibold text-foreground">
                {textValue(record.title) || textValue(record.document_name) || textValue(record.name)}
              </p>
              <p className="mt-1 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                {formatLabel(textValue(record.guideline_type) || textValue(record.type) || textValue(record.category) || "document")}
              </p>
              {href ? (
                <a href={href} className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-primary">
                  Download <ExternalLink aria-hidden className="h-3.5 w-3.5" />
                </a>
              ) : null}
            </article>
          );
        })}
      </div>
    </section>
  );
}

export function FundingSidebar({
  title = "Details",
  labels = [],
  facts = [],
  actions = [],
  children,
}: {
  title?: string;
  labels?: Array<string | null | undefined>;
  facts?: FundingFact[];
  actions?: FundingAction[];
  children?: ReactNode;
}) {
  const visibleLabels = labels.map((label) => compactText(label)).filter(Boolean);
  const visibleFacts = facts.filter((fact) => compactText(fact.value));
  if (visibleLabels.length === 0 && visibleFacts.length === 0 && actions.length === 0 && !children) return null;

  return (
    <aside className="h-fit rounded-lg border border-border bg-white p-5 shadow-sm lg:sticky lg:top-24">
      <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold text-foreground">{title}</h2>
      {visibleLabels.length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {visibleLabels.map((label) => (
            <span key={label} className="rounded-md border border-primary/15 bg-primary/[0.05] px-2.5 py-1 text-xs font-semibold text-primary">
              {formatLabel(label)}
            </span>
          ))}
        </div>
      ) : null}
      {visibleFacts.length > 0 ? (
        <dl className="mt-5 divide-y divide-slate-200">
          {visibleFacts.map((fact) => (
            <div key={fact.label} className="py-3 first:pt-0 last:pb-0">
              <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">{fact.label}</dt>
              <dd className="mt-1 break-words text-sm font-semibold text-foreground">{compactText(fact.value)}</dd>
            </div>
          ))}
        </dl>
      ) : null}
      {actions.length > 0 ? (
        <div className="mt-5 grid gap-2">
          {actions.map((action) => (
            <Link
              key={action.label}
              href={action.href}
              className={
                action.variant === "secondary"
                  ? "inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-primary/25 px-4 text-sm font-semibold text-primary transition hover:bg-primary/5"
                  : "inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-white transition hover:bg-primary/90"
              }
            >
              {action.label}
              <ArrowRight aria-hidden className="h-4 w-4" />
            </Link>
          ))}
        </div>
      ) : null}
      {children ? <div className="mt-5">{children}</div> : null}
    </aside>
  );
}

export function formatMoney(value?: string | number | null, currency?: string | null) {
  if (value === null || value === undefined || value === "") return "";
  const amount = Number(value);
  if (Number.isNaN(amount)) return compactText(value);
  return `${currency ?? "KES"} ${new Intl.NumberFormat("en-KE").format(amount)}`;
}

function textValue(value: unknown) {
  return typeof value === "string" || typeof value === "number" ? compactText(value) : "";
}

export const fundingIcons = {
  award: ShieldCheck,
  bank: Landmark,
  calendar: CalendarClock,
  check: CheckCircle2,
  money: Banknote,
};
