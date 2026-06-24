import Link from "next/link";
import type { ReactNode } from "react";
import {
  ArrowRight,
  Award,
  BookOpen,
  CalendarDays,
  ChevronRight,
  FlaskConical,
  Handshake,
  Lightbulb,
  Menu,
  Newspaper,
  Search,
  Target,
  Users,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

type IconName =
  | "award"
  | "book"
  | "calendar"
  | "flask"
  | "handshake"
  | "lightbulb"
  | "menu"
  | "news"
  | "search"
  | "target"
  | "users"
  | "x";

const iconMap: Record<IconName, LucideIcon> = {
  award: Award,
  book: BookOpen,
  calendar: CalendarDays,
  flask: FlaskConical,
  handshake: Handshake,
  lightbulb: Lightbulb,
  menu: Menu,
  news: Newspaper,
  search: Search,
  target: Target,
  users: Users,
  x: X,
};

export function ResearchPageIntro({
  eyebrow,
  title,
  body,
  breadcrumbs,
}: {
  eyebrow: string;
  title: string;
  body?: string;
  breadcrumbs?: { label: string; href?: string }[];
}) {
  return (
    <section className="bg-white px-4 pb-5 pt-7 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
      <div className="mx-auto w-full max-w-[1680px] border-b border-slate-200 pb-6">
        {breadcrumbs?.length ? <BreadcrumbTrail items={breadcrumbs} /> : null}
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-secondary">
          {eyebrow}
        </p>
        <h1 className="mt-3 max-w-5xl font-[family-name:var(--font-display)] text-3xl font-semibold leading-tight text-slate-950 sm:text-4xl">
          {title}
        </h1>
        {body ? (
          <p className="mt-3 max-w-4xl text-sm leading-7 text-slate-700 sm:text-base">
            {body}
          </p>
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
      className="mb-5 flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500"
    >
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <span key={`${item.label}-${index}`} className="inline-flex items-center gap-2">
            {item.href && !isLast ? (
              <Link href={item.href} className="transition hover:text-primary">
                {item.label}
              </Link>
            ) : (
              <span className={isLast ? "text-slate-900" : undefined}>{item.label}</span>
            )}
            {!isLast ? <ChevronRight aria-hidden className="h-3.5 w-3.5 text-slate-300" /> : null}
          </span>
        );
      })}
    </nav>
  );
}

export function ResearchSection({
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
          : "border-y border-slate-200 bg-slate-50 px-4 py-12 sm:px-6 lg:px-8 xl:px-10 2xl:px-12"
      }
    >
      <div className="mx-auto w-full max-w-[1680px]">
        <div className="mb-7 max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-secondary">
            {eyebrow}
          </p>
          <h2 className="mt-3 text-balance font-[family-name:var(--font-display)] text-3xl font-semibold leading-tight text-slate-950 sm:text-4xl">
            {title}
          </h2>
          {body ? (
            <p className="mt-4 text-pretty text-base leading-7 text-slate-600">{body}</p>
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
      <h3 className="mt-5 font-[family-name:var(--font-display)] text-xl font-semibold leading-7 text-slate-950">
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
    "group flex min-h-[230px] flex-col rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-primary/30 hover:shadow-[0_22px_60px_-42px_rgba(15,23,42,0.45)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20";

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
      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-primary px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20"
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
      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-primary/25 bg-white px-5 py-3 text-sm font-semibold text-primary transition hover:border-primary hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20"
    >
      {children}
      <ArrowRight aria-hidden className="h-4 w-4" />
    </Link>
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

export function Badge({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-md border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700">
      {children}
    </span>
  );
}

export function FilledBadge({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-md bg-primary px-3 py-1 text-xs font-semibold text-white">
      {children}
    </span>
  );
}
