import Link from "next/link";
import Image from "next/image";
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
import {
  LibraryHeroContentMotion,
  LibraryHeroMotion,
} from "./library-motion";

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
  imageSrc = "/images/library/library-hero-imagegen.webp",
  imageAlt = "Kisii University campus library and learning environment",
}: {
  eyebrow: string;
  title: string;
  body: string;
  actions?: ReactNode;
  breadcrumbs?: { label: string; href?: string }[];
  imageSrc?: string;
  imageAlt?: string;
}) {
  return (
    <LibraryHeroMotion>
      <Image
        src={imageSrc}
        alt={imageAlt}
        fill
        priority
        sizes="100vw"
        className="object-cover object-[48%_50%]"
      />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(2,20,49,0.94)_0%,rgba(2,20,49,0.82)_42%,rgba(2,20,49,0.32)_78%,rgba(2,20,49,0.12)_100%)]" />
      <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-brand-overlay/40 to-transparent" />
      <div className="relative mx-auto flex min-h-[70vh] max-w-[1680px] flex-col justify-center px-4 py-10 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
        <LibraryHeroContentMotion>
          {breadcrumbs?.length ? (
            <BreadcrumbTrail items={breadcrumbs} />
          ) : null}
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/80 sm:text-sm sm:tracking-[0.24em]">
            {eyebrow}
          </p>
          <h1 className="mt-4 max-w-3xl text-balance font-[family-name:var(--font-display)] text-3xl font-bold leading-tight sm:text-5xl lg:text-6xl">
            {title}
          </h1>
          <p className="mt-5 max-w-2xl text-pretty text-sm leading-7 text-white/85 sm:text-base sm:leading-8 lg:text-lg">
            {body}
          </p>
          {actions ? (
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">{actions}</div>
          ) : null}
        </LibraryHeroContentMotion>
      </div>
    </LibraryHeroMotion>
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
          ? "bg-white px-4 py-12 sm:px-6 lg:px-8 xl:px-10 2xl:px-12"
          : "border-y border-border bg-surface-subtle px-4 py-12 sm:px-6 lg:px-8 xl:px-10 2xl:px-12"
      }
    >
      <div className="mx-auto w-full max-w-[1680px]">
        <div className="mb-7 max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary sm:text-sm sm:tracking-[0.24em]">
            {eyebrow}
          </p>
          <h2 className="mt-3 text-balance font-[family-name:var(--font-display)] text-2xl font-semibold leading-tight text-foreground sm:text-4xl">
            {title}
          </h2>
          {body ? (
            <p className="mt-4 text-pretty text-base leading-7 text-foreground">
              {body}
            </p>
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
      <h3 className="mt-5 text-lg font-semibold leading-7 text-foreground">
        {title}
      </h3>
      <p className="mt-3 text-sm leading-7 text-muted-foreground">{body}</p>
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
    "group flex min-h-[230px] flex-col rounded-lg border border-border bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-primary/30 hover:shadow-[0_22px_60px_-42px_rgba(15,23,42,0.45)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20";

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
      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-secondary px-5 py-3 text-center text-sm font-semibold text-white shadow-sm transition hover:bg-secondary/90 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-secondary/30"
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
      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-white/40 bg-white/10 px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-white/20 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/30"
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
      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-primary/25 bg-white px-4 py-2 text-sm font-semibold text-primary transition hover:border-primary hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20"
    >
      {children}
      <ExternalLink aria-hidden className="h-4 w-4" />
    </a>
  );
}

export function LibraryActionLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-primary/25 bg-white px-4 py-2 text-sm font-semibold text-primary transition hover:border-primary hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20"
    >
      {children}
      <ArrowRight aria-hidden className="h-4 w-4" />
    </Link>
  );
}

export function LibraryBadge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "primary" | "secondary" | "muted";
}) {
  const toneClass = {
    neutral: "border-border bg-surface-subtle text-muted-foreground",
    primary: "border-primary/15 bg-primary/10 text-primary",
    secondary: "border-secondary/20 bg-secondary text-white",
    muted: "border-border bg-surface-muted text-muted-foreground",
  }[tone];

  return (
    <span className={`inline-flex items-center rounded-md border px-3 py-1 text-xs font-semibold ${toneClass}`}>
      {children}
    </span>
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
          : "rounded-md border border-border bg-white p-4 text-sm leading-6 text-muted-foreground"
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

export function LibraryContentBand({
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
          ? "border-y border-border bg-surface-subtle px-4 py-10 sm:px-6 lg:px-8 xl:px-10 2xl:px-12"
          : "bg-white px-4 py-10 sm:px-6 lg:px-8 xl:px-10 2xl:px-12"
      }
    >
      <div className="mx-auto w-full max-w-[1680px]">{children}</div>
    </section>
  );
}

export function LibrarySectionHeading({
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
      <h2 className="mt-3 text-balance font-[family-name:var(--font-display)] text-2xl font-semibold leading-tight text-foreground sm:text-4xl">
        {title}
      </h2>
      {body ? <p className="mt-4 text-pretty text-base leading-7 text-muted-foreground">{body}</p> : null}
    </div>
  );
}

export function SearchPanel({ children }: { children: ReactNode }) {
  return (
    <div className="-mt-4 min-w-0 rounded-lg border border-border bg-white p-4 shadow-[0_24px_70px_-48px_rgba(15,23,42,0.55)] sm:-mt-8 sm:p-5">
      {children}
    </div>
  );
}

type LibraryFilterOption = {
  value: string;
  label: string;
};

export function LibraryFilterTextInput({
  name,
  label,
  value,
  placeholder,
  className = "",
}: {
  name: string;
  label: string;
  value?: string | null;
  placeholder: string;
  className?: string;
}) {
  return (
    <label className={`block min-w-0 ${className}`}>
      <span className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
        {label}
      </span>
      <span className="relative mt-2 block">
        <Search
          aria-hidden
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/70"
        />
        <input
          type="search"
          name={name}
          defaultValue={value?.trim() ?? ""}
          placeholder={placeholder}
          autoComplete="off"
          className="h-11 w-full rounded-md border border-border bg-white pl-9 pr-3 text-sm font-medium text-foreground outline-none ring-primary/20 transition placeholder:text-muted-foreground/70 focus:border-primary focus:ring-4"
        />
      </span>
    </label>
  );
}

export function LibraryFilterSelect({
  name,
  label,
  value,
  options,
  allLabel,
  includeAllOption = true,
  className = "",
}: {
  name: string;
  label: string;
  value?: string | null;
  options: LibraryFilterOption[];
  allLabel?: string;
  includeAllOption?: boolean;
  className?: string;
}) {
  const normalizedOptions = normalizeFilterOptions(options);

  return (
    <label className={`block min-w-0 ${className}`}>
      <span className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
        {label}
      </span>
      <select
        name={name}
        defaultValue={value?.trim() ?? ""}
        className="mt-2 h-11 w-full rounded-md border border-border bg-white px-3 text-sm font-semibold text-foreground outline-none ring-primary/20 transition focus:border-primary focus:ring-4"
      >
        {includeAllOption ? <option value="">{allLabel ?? `All ${label.toLowerCase()}`}</option> : null}
        {normalizedOptions.map((option) => (
          <option key={`${name}-${option.value}-${option.label}`} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function LibraryFilterCheckbox({
  name,
  value,
  checked,
  children,
}: {
  name: string;
  value: string;
  checked?: boolean;
  children: ReactNode;
}) {
  return (
    <label className="inline-flex min-h-11 items-center gap-2 rounded-md border border-border bg-white px-3 py-2 text-sm font-semibold text-muted-foreground transition focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/20">
      <input
        type="checkbox"
        name={name}
        value={value}
        defaultChecked={checked}
        className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
      />
      {children}
    </label>
  );
}

export function LibraryFilterSubmit({ children }: { children: ReactNode }) {
  return (
    <button
      type="submit"
      className="inline-flex min-h-11 items-center justify-center rounded-md bg-primary px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20"
    >
      {children}
    </button>
  );
}

export function LibraryFilterClearLink({
  href,
  children = "Clear Filters",
}: {
  href: string;
  children?: ReactNode;
}) {
  return (
    <Link
      href={href}
      className="inline-flex min-h-11 items-center justify-center rounded-md border border-border bg-white px-4 py-2 text-sm font-semibold text-muted-foreground transition hover:border-primary/25 hover:bg-primary/5 hover:text-primary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20"
    >
      {children}
    </Link>
  );
}

function normalizeFilterOptions(options: LibraryFilterOption[]) {
  const seen = new Set<string>();

  return options.filter((option) => {
    const key = `${option.value}-${option.label}`;
    if (!option.value || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
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
    <aside className="h-fit min-w-0 rounded-lg border border-border bg-white p-5 shadow-sm">
      {eyebrow ? (
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary">
          {eyebrow}
        </p>
      ) : null}
      <h3 className={eyebrow ? "mt-3 text-lg font-semibold text-foreground sm:text-xl" : "text-lg font-semibold text-foreground sm:text-xl"}>
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
          className="rounded-lg border border-border bg-white p-5 shadow-sm"
        >
          <p className="text-3xl font-bold text-foreground">{item.value}</p>
          <p className="mt-2 text-xs font-semibold uppercase tracking-[0.18em] text-secondary">
            {item.label}
          </p>
          {item.detail ? (
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.detail}</p>
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
          className="inline-flex min-h-11 shrink-0 items-center rounded-md border border-border bg-white px-4 py-2 text-sm font-semibold text-muted-foreground shadow-sm transition hover:border-primary/30 hover:bg-primary/5 hover:text-primary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20"
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
        <h3 className="mt-1 text-base font-semibold leading-7 text-foreground sm:text-lg">
          {title}
        </h3>
        {body ? <p className="mt-2 text-sm leading-7 text-muted-foreground">{body}</p> : null}
        {details.length > 0 ? (
          <p className="mt-3 text-xs leading-5 text-muted-foreground">
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
      className="block rounded-lg border border-border bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20"
    >
      {content}
    </Link>
  ) : (
    <article className="rounded-lg border border-border bg-white p-5 shadow-sm">
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
    <div className="rounded-md border border-border bg-white p-4 shadow-sm">
      <p className="text-2xl font-bold text-foreground">{value}</p>
      <p className="mt-1 text-xs font-semibold uppercase tracking-[0.16em] text-secondary">
        {label}
      </p>
      {detail ? <p className="mt-2 text-sm leading-6 text-muted-foreground">{detail}</p> : null}
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
    <SidePanel eyebrow={eyebrow} title={title}>
      {children}
    </SidePanel>
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
      <h3 className="mt-2 text-lg font-semibold leading-7 text-foreground">{title}</h3>
      {body ? <p className="mt-2 text-sm leading-7 text-muted-foreground">{body}</p> : null}
      {details.length > 0 ? (
        <p className="mt-3 text-xs leading-5 text-muted-foreground">{details.join(" · ")}</p>
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
      className="block rounded-lg border border-border bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20"
    >
      {content}
    </Link>
  ) : (
    <article className="rounded-lg border border-border bg-white p-5 shadow-sm">
      {content}
    </article>
  );
}
