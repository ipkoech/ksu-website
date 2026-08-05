import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight, ChevronRight } from "lucide-react";
import { ScrollReveal } from "../ui/scroll-reveal";

/* ============================================================
   Shared public-site primitives — the single visual grammar for
   all KSU public frontends.

   Conventions (decided 2026-08):
   - Focus: rely on the global `:focus-visible` style from
     globals.css (ring-2 ring-ring ring-offset-2). Components must
     NOT override it with their own focus rings.
   - Cards: `rounded-lg border border-border bg-card p-5 shadow-sm`;
     interactive cards add the hover treatment from `cardInteractive`.
   - Eyebrows: `text-sm font-semibold uppercase tracking-eyebrow
     text-secondary` (tracking-eyebrow = 0.24em, from the preset).
   - Headings: display face via the `font-display` utility.
   - Buttons: `rounded-md min-h-11 px-5 py-3 text-sm font-semibold`.
   ============================================================ */

export const cardSurface =
  "rounded-lg border border-border bg-card p-5 shadow-sm";

export const cardInteractive =
  `${cardSurface} transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md`;

const sectionPadding = "px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12";
const defaultWidth = "max-w-[1680px]";

export function Eyebrow({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <p
      className={`text-sm font-semibold uppercase tracking-eyebrow text-secondary ${className}`.trim()}
    >
      {children}
    </p>
  );
}

export type BreadcrumbItem = { label: string; href?: string };

export function BreadcrumbTrail({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav
      aria-label="Breadcrumb"
      className="mb-5 flex flex-wrap items-center gap-2 text-xs font-semibold text-muted-foreground"
    >
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <span
            key={`${item.label}-${index}`}
            className="inline-flex items-center gap-2"
          >
            {item.href && !isLast ? (
              <Link href={item.href} className="transition hover:text-primary">
                {item.label}
              </Link>
            ) : (
              <span
                aria-current={isLast ? "page" : undefined}
                className={isLast ? "text-foreground" : undefined}
              >
                {item.label}
              </span>
            )}
            {!isLast ? (
              <ChevronRight
                aria-hidden
                className="h-3.5 w-3.5 text-muted-foreground/60"
              />
            ) : null}
          </span>
        );
      })}
    </nav>
  );
}

export function PageIntro({
  eyebrow,
  title,
  body,
  breadcrumbs,
  widthClassName = defaultWidth,
}: {
  eyebrow: string;
  title: string;
  body?: string;
  breadcrumbs?: BreadcrumbItem[];
  widthClassName?: string;
}) {
  return (
    <section className={`border-b border-border bg-background py-6 ${sectionPadding}`}>
      <div className={`mx-auto w-full ${widthClassName}`}>
        {breadcrumbs?.length ? <BreadcrumbTrail items={breadcrumbs} /> : null}
        <Eyebrow>{eyebrow}</Eyebrow>
        <h1 className="mt-3 max-w-5xl font-display text-3xl font-semibold leading-tight text-foreground sm:text-4xl">
          {title}
        </h1>
        {body ? (
          <p className="mt-3 max-w-4xl text-sm leading-7 text-muted-foreground sm:text-base">
            {body}
          </p>
        ) : null}
      </div>
    </section>
  );
}

export type SectionDensity = "compact" | "spacious";

export function Section({
  id,
  eyebrow,
  title,
  body,
  children,
  tone = "light",
  density = "compact",
  widthClassName = defaultWidth,
}: {
  id?: string;
  eyebrow: string;
  title: string;
  body?: string;
  children: ReactNode;
  tone?: "light" | "white";
  density?: SectionDensity;
  widthClassName?: string;
}) {
  const spacing = density === "spacious" ? "py-12" : "py-8";
  return (
    <section
      id={id}
      className={
        tone === "white"
          ? `bg-background ${spacing} ${sectionPadding}`
          : `border-y border-border bg-surface-subtle ${spacing} ${sectionPadding}`
      }
    >
      <ScrollReveal className={`mx-auto w-full ${widthClassName}`}>
        <div className="mb-5 max-w-3xl">
          <Eyebrow>{eyebrow}</Eyebrow>
          <h2 className="mt-2 text-balance font-display text-2xl font-semibold leading-tight text-foreground sm:text-3xl">
            {title}
          </h2>
          {body ? (
            <p className="mt-3 text-pretty text-sm leading-7 text-muted-foreground sm:text-base">
              {body}
            </p>
          ) : null}
        </div>
        {children}
      </ScrollReveal>
    </section>
  );
}

export function Card({
  href,
  children,
  className = "",
}: {
  href?: string;
  children: ReactNode;
  className?: string;
}) {
  const classes = `${href ? `group ${cardInteractive}` : cardSurface} ${className}`.trim();
  return href ? (
    <Link href={href} className={`flex flex-col ${classes}`}>
      {children}
    </Link>
  ) : (
    <article className={classes}>{children}</article>
  );
}

export function CardTitle({ children }: { children: ReactNode }) {
  return (
    <h3 className="font-display text-xl font-semibold leading-7 text-foreground">
      {children}
    </h3>
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
      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90"
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
      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-primary/25 bg-background px-5 py-3 text-sm font-semibold text-primary transition hover:border-primary hover:bg-primary/5"
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
          : "rounded-md border border-border bg-card p-4 text-sm leading-6 text-muted-foreground"
      }
    >
      {children}
    </p>
  );
}

export function Badge({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-md border border-border bg-surface-subtle px-3 py-1 text-xs font-semibold text-muted-foreground">
      {children}
    </span>
  );
}

export function FilledBadge({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-md bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
      {children}
    </span>
  );
}

export type StatusTone = "success" | "warning" | "destructive" | "info" | "neutral";

const statusToneClasses: Record<StatusTone, string> = {
  success: "border-success/30 bg-success/10 text-success",
  warning: "border-warning/40 bg-warning/10 text-warning",
  destructive: "border-destructive/30 bg-destructive/10 text-destructive",
  info: "border-info/30 bg-info/10 text-info",
  neutral: "border-border bg-surface-subtle text-muted-foreground",
};

export function StatusBadge({
  tone = "neutral",
  children,
}: {
  tone?: StatusTone;
  children: ReactNode;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-md border px-3 py-1 text-xs font-semibold ${statusToneClasses[tone]}`}
    >
      {children}
    </span>
  );
}
