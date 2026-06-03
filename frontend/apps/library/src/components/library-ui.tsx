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
    <section className="border-b border-slate-200 bg-[linear-gradient(135deg,#0f2d5c_0%,#174a8b_48%,#f57c00_100%)] px-4 py-12 text-white sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-[1320px] gap-10 lg:grid-cols-[minmax(0,1fr)_390px] lg:items-end">
        <div className="max-w-4xl">
          {breadcrumbs?.length ? (
            <BreadcrumbTrail items={breadcrumbs} />
          ) : null}
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-white/80">
            {eyebrow}
          </p>
          <h1 className="mt-4 max-w-3xl text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
            {title}
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-white/80 sm:text-lg">
            {body}
          </p>
          {actions ? (
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">{actions}</div>
          ) : null}
        </div>
        {children ? (
          <div className="rounded-lg border border-white/20 bg-white/10 p-5 shadow-2xl backdrop-blur">
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
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-secondary">
            {eyebrow}
          </p>
          <h2 className="mt-3 text-3xl font-semibold leading-tight text-slate-950 sm:text-4xl">
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
      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-primary shadow-sm transition hover:bg-white/90"
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
      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-white/40 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/20"
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
