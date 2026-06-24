import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight, ChevronRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { ScrollReveal } from "@ksu/ui/components";

export type InstitutionalLink = {
  label: string;
  href: string;
  description?: string;
  icon: LucideIcon;
};

export type InstitutionalFact = {
  label: string;
  value: string | number;
};

export function ResearchInstitutionalHero({
  eyebrow,
  title,
  body,
  breadcrumbs,
  localLinks,
  relatedLinks,
  facts,
  imageSrc,
  imageAlt,
  primaryAction,
  secondaryAction,
}: {
  eyebrow: string;
  title: string;
  body: string;
  breadcrumbs: { label: string; href?: string }[];
  localLinks: InstitutionalLink[];
  relatedLinks: InstitutionalLink[];
  facts: InstitutionalFact[];
  imageSrc: string;
  imageAlt: string;
  primaryAction?: { label: string; href: string };
  secondaryAction?: { label: string; href: string };
}) {
  return (
    <section className="relative overflow-hidden border-b border-slate-200 bg-[linear-gradient(135deg,#f8fbff_0%,#ffffff_46%,#eef4ff_100%)] px-4 py-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-[radial-gradient(circle_at_50%_0%,rgba(59,130,246,0.16),transparent_66%)]" />
      <div className="relative mx-auto w-full max-w-[1680px]">
        <BreadcrumbTrail items={breadcrumbs} />

        <div className="mt-4 grid gap-4 lg:grid-cols-[220px_minmax(0,1fr)_300px] lg:items-start">
          <InstitutionalNav title="Research" links={localLinks} />

          <ScrollReveal className="overflow-hidden rounded-[1.5rem] border border-slate-800 bg-slate-950 text-white shadow-[0_24px_70px_-44px_rgba(15,23,42,0.7)]">
            <div className="px-5 py-5 sm:px-6 lg:px-7 lg:py-6">
              <p className="text-sm font-semibold uppercase text-secondary">
                {eyebrow}
              </p>
              <h1 className="mt-3 max-w-5xl font-[family-name:var(--font-display)] text-3xl font-semibold leading-tight text-white sm:text-4xl lg:text-5xl">
                {title}
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-white/75 sm:text-base">
                {body}
              </p>

              <div className="mt-5 flex flex-wrap gap-2">
                {primaryAction ? (
                  <Link
                    href={primaryAction.href}
                    className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90"
                  >
                    {primaryAction.label}
                    <ArrowRight aria-hidden className="h-4 w-4" />
                  </Link>
                ) : null}
                {secondaryAction ? (
                  <Link
                    href={secondaryAction.href}
                    className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-white/25 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20"
                  >
                    {secondaryAction.label}
                    <ArrowRight aria-hidden className="h-4 w-4" />
                  </Link>
                ) : null}
              </div>

              <div className="mt-5 overflow-hidden rounded-lg border border-white/10 bg-white/5">
                <div className="relative aspect-[16/9] min-h-[190px] sm:min-h-[260px]">
                  <Image
                    src={imageSrc}
                    alt={imageAlt}
                    fill
                    priority
                    sizes="(min-width: 1024px) 54vw, 100vw"
                    className="object-cover"
                  />
                </div>
              </div>

              {facts.length > 0 ? (
                <div className="mt-5 grid overflow-hidden rounded-lg border border-white/10 bg-white/5 sm:grid-cols-2 xl:grid-cols-4">
                  {facts.map((fact) => (
                    <div
                      key={fact.label}
                      className="border-white/10 p-4 sm:border-l first:sm:border-l-0"
                    >
                      <p className="font-[family-name:var(--font-display)] text-3xl font-semibold text-white">
                        {fact.value}
                      </p>
                      <p className="mt-1 text-xs leading-5 text-white/70">
                        {fact.label}
                      </p>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          </ScrollReveal>

          <InstitutionalRelated links={relatedLinks} />
        </div>
      </div>
    </section>
  );
}

export function InstitutionalPanel({
  children,
  id,
  className = "",
}: {
  children: ReactNode;
  id?: string;
  className?: string;
}) {
  return (
    <article
      id={id}
      className={`min-w-0 rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:border-primary/30 hover:shadow-[0_22px_60px_-42px_rgba(15,23,42,0.45)] ${className}`}
    >
      {children}
    </article>
  );
}

export function InstitutionalEmpty({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6 text-sm leading-7 text-slate-600">
      {children}
    </div>
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
      className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500"
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
              <span className={isLast ? "text-slate-900" : undefined}>
                {item.label}
              </span>
            )}
            {!isLast ? (
              <ChevronRight aria-hidden className="h-3.5 w-3.5 text-slate-300" />
            ) : null}
          </span>
        );
      })}
    </nav>
  );
}

function InstitutionalNav({
  title,
  links,
}: {
  title: string;
  links: InstitutionalLink[];
}) {
  return (
    <nav
      aria-label={`${title} section links`}
      className="rounded-[1rem] border border-slate-200 bg-white/80 p-3 shadow-sm backdrop-blur lg:sticky lg:top-28"
    >
      <p className="px-2 text-xs font-semibold uppercase text-secondary">
        Explore {title}
      </p>
      <ul className="mt-3 flex flex-col gap-2">
        {links.map((item) => {
          const Icon = item.icon;

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className="group flex items-center gap-3 rounded-md border border-transparent px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-primary/20 hover:bg-primary/5 hover:text-slate-950"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-primary transition group-hover:bg-primary group-hover:text-white">
                  <Icon aria-hidden className="h-4 w-4" />
                </span>
                <span className="min-w-0 flex-1">{item.label}</span>
                <ChevronRight
                  aria-hidden
                  className="h-4 w-4 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-primary"
                />
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function InstitutionalRelated({ links }: { links: InstitutionalLink[] }) {
  return (
    <aside className="h-fit min-w-0">
      <nav
        aria-label="Related research pages"
        className="rounded-[1rem] border border-slate-200 bg-white/80 p-3 shadow-sm backdrop-blur"
      >
        <p className="px-2 text-xs font-semibold uppercase text-secondary">
          Related Pages
        </p>
        <ul className="mt-3 flex flex-col gap-2">
          {links.map((item) => {
            const Icon = item.icon;

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="group flex items-start gap-2 rounded-md border border-transparent px-2 py-2 text-sm font-semibold text-slate-700 transition hover:border-primary/20 hover:bg-primary/5 hover:text-slate-950"
                >
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-primary transition group-hover:bg-primary group-hover:text-white">
                    <Icon aria-hidden className="h-4 w-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block">{item.label}</span>
                    {item.description ? (
                      <span className="mt-1 block text-xs font-normal leading-5 text-slate-500">
                        {item.description}
                      </span>
                    ) : null}
                  </span>
                  <ChevronRight
                    aria-hidden
                    className="mt-1 h-4 w-4 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-primary"
                  />
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
