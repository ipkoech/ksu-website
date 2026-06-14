import Link from "next/link";
import type { ReactNode } from "react";
import {
  ArrowRight,
  BookOpen,
  Building2,
  ChevronRight,
  Clock3,
  Database,
  ExternalLink,
  FileText,
  HelpCircle,
  Library,
  Mail,
  MapPin,
  Phone,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

type IconName =
  | "book"
  | "building"
  | "clock"
  | "database"
  | "file"
  | "help"
  | "library"
  | "mail"
  | "map"
  | "phone"
  | "search"
  | "sliders"
  | "shield"
  | "users";

const iconMap: Record<IconName, LucideIcon> = {
  book: BookOpen,
  building: Building2,
  clock: Clock3,
  database: Database,
  file: FileText,
  help: HelpCircle,
  library: Library,
  mail: Mail,
  map: MapPin,
  phone: Phone,
  search: Search,
  sliders: SlidersHorizontal,
  shield: ShieldCheck,
  users: Users,
};

export function LibraryHero({
  eyebrow,
  title,
  body,
  actions,
  breadcrumbs,
  children,
}: {
  eyebrow: string;
  title: string;
  body: string;
  actions?: ReactNode;
  breadcrumbs?: { label: string; href?: string }[];
  children?: ReactNode;
}) {
  return (
    <section className="relative overflow-hidden border-b border-slate-200 bg-primary px-4 py-10 text-white sm:px-6 sm:py-12 lg:px-8">
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(2,20,49,0.9)_0%,rgba(2,20,49,0.75)_42%,rgba(16,67,177,0.35)_74%,rgba(193,81,6,0.22)_100%)]" />
      <div className="absolute inset-0 opacity-25 [background-image:linear-gradient(120deg,rgba(255,255,255,0.16)_0_1px,transparent_1px_100%),linear-gradient(30deg,rgba(255,255,255,0.08)_0_1px,transparent_1px_100%)] [background-size:64px_64px]" />
      <div className="relative mx-auto grid max-w-[1320px] gap-8 lg:grid-cols-[minmax(0,1fr)_390px] lg:items-end lg:gap-10">
        <div className="min-w-0 max-w-4xl">
          {breadcrumbs?.length ? (
            <BreadcrumbTrail items={breadcrumbs} />
          ) : null}
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/80 sm:text-sm sm:tracking-[0.24em]">
            {eyebrow}
          </p>
          <h1 className="mt-4 max-w-3xl text-wrap font-[family-name:var(--font-display)] text-3xl font-bold leading-tight sm:text-5xl lg:text-6xl">
            {title}
          </h1>
          <p className="mt-5 max-w-2xl text-sm leading-7 text-white/80 sm:text-base sm:leading-8 lg:text-lg">
            {body}
          </p>
          {actions ? (
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">{actions}</div>
          ) : null}
        </div>
        {children ? (
          <div className="min-w-0 rounded-lg border border-white/20 bg-white/10 p-4 shadow-2xl backdrop-blur sm:p-5">
            {children}
          </div>
        ) : null}
      </div>
    </section>
  );
}

function BreadcrumbTrail({
  items,
}: {
  items: { label: string; href?: string }[];
}) {
  return (
    <nav
      aria-label="Breadcrumb"
      className="mb-5 flex flex-wrap items-center gap-2 text-xs font-semibold text-white/75"
    >
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <span key={`${item.label}-${index}`} className="inline-flex items-center gap-2">
            {item.href && !isLast ? (
              <Link href={item.href} className="transition hover:text-white">
                {item.label}
              </Link>
            ) : (
              <span className={isLast ? "text-white" : undefined}>{item.label}</span>
            )}
            {!isLast ? <ChevronRight aria-hidden className="h-3.5 w-3.5" /> : null}
          </span>
        );
      })}
    </nav>
  );
}

export function LibrarySection({
  eyebrow,
  title,
  body,
  children,
  tone = "light",
}: {
  eyebrow: string;
  title: string;
  body?: string;
  children: ReactNode;
  tone?: "light" | "white";
}) {
  return (
    <section
      className={
        tone === "white"
          ? "bg-white px-4 py-12 sm:px-6 lg:px-8"
          : "border-y border-slate-200 bg-slate-50 px-4 py-12 sm:px-6 lg:px-8"
      }
    >
      <div className="mx-auto max-w-[1320px]">
        <div className="mb-7 max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary sm:text-sm sm:tracking-[0.24em]">
            {eyebrow}
          </p>
          <h2 className="mt-3 text-wrap font-[family-name:var(--font-display)] text-2xl font-semibold leading-tight text-slate-950 sm:text-4xl">
            {title}
          </h2>
          {body ? (
            <p className="mt-4 text-base leading-7 text-slate-600">{body}</p>
          ) : null}
        </div>
        {children}
      </div>
    </section>
  );
}

export function IconCard({
  icon,
  title,
  body,
  href,
  action = "Open",
  children,
}: {
  icon: IconName;
  title: string;
  body: string;
  href?: string;
  action?: string;
  children?: ReactNode;
}) {
  const Icon = iconMap[icon];
  const content = (
    <>
      <span className="inline-flex h-11 w-11 items-center justify-center rounded-md bg-primary text-white shadow-sm">
        <Icon aria-hidden className="h-5 w-5" />
      </span>
      <h3 className="mt-5 text-lg font-semibold leading-7 text-slate-950">
        {title}
      </h3>
      <p className="mt-3 text-sm leading-7 text-slate-600">{body}</p>
      {children}
      {href ? (
        <span className="mt-auto inline-flex items-center gap-2 pt-6 text-sm font-semibold text-primary">
          {action}
          <ArrowRight aria-hidden className="h-4 w-4 transition group-hover:translate-x-1" />
        </span>
      ) : null}
    </>
  );

  const className =
    "group flex min-h-[230px] flex-col rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:border-primary/30 hover:shadow-[0_22px_60px_-42px_rgba(15,23,42,0.45)]";

  return href ? (
    <Link href={href} className={className}>
      {content}
    </Link>
  ) : (
    <article className={className}>{content}</article>
  );
}

export function PrimaryLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-center text-sm font-semibold text-primary shadow-sm transition hover:bg-white/90"
    >
      {children}
      <ArrowRight aria-hidden className="h-4 w-4" />
    </Link>
  );
}

export function SecondaryLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-white/40 bg-white/10 px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-white/20"
    >
      {children}
      <ArrowRight aria-hidden className="h-4 w-4" />
    </Link>
  );
}

export function ExternalAnchor({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-primary/25 bg-white px-4 py-2 text-sm font-semibold text-primary transition hover:border-primary hover:bg-primary/5"
    >
      {children}
      <ExternalLink aria-hidden className="h-4 w-4" />
    </a>
  );
}

export function StatusMessage({
  tone = "neutral",
  children,
}: {
  tone?: "neutral" | "error";
  children: ReactNode;
}) {
  return (
    <p
      role="status"
      className={
        tone === "error"
          ? "rounded-md border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive"
          : "rounded-md border border-slate-200 bg-white p-4 text-sm leading-6 text-slate-600"
      }
    >
      {children}
    </p>
  );
}

export function LibraryShell({
  children,
}: {
  children: ReactNode;
}) {
  return <main id="library-main" className="min-h-screen overflow-hidden bg-white">{children}</main>;
}

export function MockupBand({
  children,
  tone = "white",
}: {
  children: ReactNode;
  tone?: "white" | "soft";
}) {
  return (
    <section
      className={
        tone === "soft"
          ? "border-y border-slate-200 bg-slate-50 px-4 py-10 sm:px-6 lg:px-8"
          : "bg-white px-4 py-10 sm:px-6 lg:px-8"
      }
    >
      <div className="mx-auto max-w-[1320px]">{children}</div>
    </section>
  );
}

export function MockupHeading({
  eyebrow,
  title,
  body,
}: {
  eyebrow: string;
  title: string;
  body?: string | null;
}) {
  return (
    <div className="mb-6 max-w-3xl">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary sm:text-sm sm:tracking-[0.22em]">
        {eyebrow}
      </p>
      <h2 className="mt-3 text-wrap font-[family-name:var(--font-display)] text-2xl font-semibold leading-tight text-slate-950 sm:text-4xl">
        {title}
      </h2>
      {body ? <p className="mt-4 text-base leading-7 text-slate-600">{body}</p> : null}
    </div>
  );
}

export function SearchPanel({ children }: { children: ReactNode }) {
  return (
    <div className="-mt-4 min-w-0 rounded-lg border border-slate-200 bg-white p-4 shadow-[0_24px_70px_-48px_rgba(15,23,42,0.55)] sm:-mt-8 sm:p-5">
      {children}
    </div>
  );
}

export function SidePanel({
  eyebrow,
  title,
  children,
}: {
  eyebrow?: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <aside className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      {eyebrow ? (
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary">
          {eyebrow}
        </p>
      ) : null}
      <h3 className={eyebrow ? "mt-3 text-lg font-semibold text-slate-950 sm:text-xl" : "text-lg font-semibold text-slate-950 sm:text-xl"}>
        {title}
      </h3>
      <div className="mt-4">{children}</div>
    </aside>
  );
}

export function MetricStrip({
  items,
}: {
  items: Array<{ label: string; value: string | number; detail?: string | null }>;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
        >
          <p className="text-3xl font-bold text-slate-950">{item.value}</p>
          <p className="mt-2 text-xs font-semibold uppercase tracking-[0.18em] text-secondary">
            {item.label}
          </p>
          {item.detail ? (
            <p className="mt-2 text-sm leading-6 text-slate-600">{item.detail}</p>
          ) : null}
        </div>
      ))}
    </div>
  );
}

export function PillNav({
  items,
}: {
  items: Array<{ label: string; href: string }>;
}) {
  return (
    <nav className="flex max-w-full gap-2 overflow-x-auto pb-2" aria-label="Library page sections">
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="inline-flex min-h-11 shrink-0 items-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-primary/30 hover:bg-primary/5 hover:text-primary"
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}

export function CompactRecord({
  icon = "file",
  eyebrow,
  title,
  body,
  meta,
  href,
  action = "Open",
}: {
  icon?: IconName;
  eyebrow?: string | null;
  title: string;
  body?: string | null;
  meta?: Array<string | number | null | undefined>;
  href?: string | null;
  action?: string;
}) {
  const Icon = iconMap[icon];
  const details = meta?.filter((item) => item !== null && item !== undefined && String(item).trim()) ?? [];
  const content = (
    <div className="flex gap-4">
      <span className="mt-1 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
        <Icon aria-hidden className="h-5 w-5" />
      </span>
      <div className="min-w-0 flex-1">
        {eyebrow ? (
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary">
            {eyebrow}
          </p>
        ) : null}
        <h3 className="mt-1 text-base font-semibold leading-7 text-slate-950 sm:text-lg">
          {title}
        </h3>
        {body ? <p className="mt-2 text-sm leading-7 text-slate-600">{body}</p> : null}
        {details.length > 0 ? (
          <p className="mt-3 text-xs leading-5 text-slate-500">
            {details.join(" · ")}
          </p>
        ) : null}
        {href ? (
          <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary">
            {action}
            <ArrowRight aria-hidden className="h-4 w-4" />
          </span>
        ) : null}
      </div>
    </div>
  );

  return href ? (
    <Link
      href={href}
      className="block rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:border-primary/30 hover:shadow-md"
    >
      {content}
    </Link>
  ) : (
    <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      {content}
    </article>
  );
}

export function QuickStat({
  label,
  value,
  detail,
}: {
  label: string;
  value: string | number;
  detail?: string | null;
}) {
  return (
    <div className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-2xl font-bold text-slate-950">{value}</p>
      <p className="mt-1 text-xs font-semibold uppercase tracking-[0.16em] text-secondary">
        {label}
      </p>
      {detail ? <p className="mt-2 text-sm leading-6 text-slate-600">{detail}</p> : null}
    </div>
  );
}

export function InfoPanel({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <aside className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary">
        {eyebrow}
      </p>
      <h3 className="mt-3 text-xl font-semibold text-slate-950">{title}</h3>
      <div className="mt-4">{children}</div>
    </aside>
  );
}

export function RecordListItem({
  eyebrow,
  title,
  body,
  meta,
  href,
  action = "Open",
}: {
  eyebrow?: string | null;
  title: string;
  body?: string | null;
  meta?: Array<string | number | null | undefined>;
  href?: string | null;
  action?: string;
}) {
  const details = meta?.filter((item) => item !== null && item !== undefined && String(item).trim()) ?? [];
  const content = (
    <>
      {eyebrow ? (
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary">
          {eyebrow}
        </p>
      ) : null}
      <h3 className="mt-2 text-lg font-semibold leading-7 text-slate-950">{title}</h3>
      {body ? <p className="mt-2 text-sm leading-7 text-slate-600">{body}</p> : null}
      {details.length > 0 ? (
        <p className="mt-3 text-xs leading-5 text-slate-500">{details.join(" · ")}</p>
      ) : null}
      {href ? (
        <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary">
          {action}
          <ArrowRight aria-hidden className="h-4 w-4" />
        </span>
      ) : null}
    </>
  );

  return href ? (
    <Link
      href={href}
      className="block rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:border-primary/30 hover:shadow-md"
    >
      {content}
    </Link>
  ) : (
    <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      {content}
    </article>
  );
}
