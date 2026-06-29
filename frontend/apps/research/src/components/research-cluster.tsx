import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight, ChevronRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type ClusterLink = {
  label: string;
  href: string;
  description?: string;
  icon: LucideIcon;
};

export type ClusterStat = {
  label: string;
  value: string | number;
};

export function ResearchClusterHero({
  eyebrow,
  title,
  body,
  breadcrumbs,
  links,
  stats,
  primaryAction,
}: {
  eyebrow: string;
  title: string;
  body: string;
  breadcrumbs: { label: string; href?: string }[];
  imageSrc: string;
  imageAlt: string;
  links: ClusterLink[];
  stats: ClusterStat[];
  primaryAction?: { label: string; href: string };
}) {
  return (
    <>
      <section className="border-b border-slate-200 bg-white px-4 py-6 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
        <div className="mx-auto grid w-full max-w-[1680px] gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(320px,520px)] lg:items-end">
          <div className="min-w-0">
            <ClusterBreadcrumbs items={breadcrumbs} />
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-secondary">
              {eyebrow}
            </p>
            <h1 className="mt-3 max-w-5xl text-balance font-[family-name:var(--font-display)] text-3xl font-semibold leading-tight text-slate-950 sm:text-4xl">
              {title}
            </h1>
            <p className="mt-3 max-w-4xl text-pretty text-sm leading-7 text-slate-700 sm:text-base">
              {body}
            </p>
            {primaryAction ? (
              <Link
                href={primaryAction.href}
                className="mt-4 inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20"
              >
                {primaryAction.label}
                <ArrowRight aria-hidden className="h-4 w-4" />
              </Link>
            ) : null}
          </div>
          {stats.length > 0 ? (
            <dl className="grid gap-2 sm:grid-cols-2">
              {stats.slice(0, 4).map((stat) => (
                <div key={stat.label} className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
                  <dt className="text-[11px] font-semibold uppercase text-slate-500">
                    {stat.label}
                  </dt>
                  <dd className="mt-1 text-lg font-semibold text-slate-950">
                    {stat.value}
                  </dd>
                </div>
              ))}
            </dl>
          ) : null}
        </div>
      </section>
      <ResearchPathwayNav eyebrow={eyebrow} links={links} />
    </>
  );
}

export function ResearchPathwayNav({
  eyebrow,
  links,
}: {
  eyebrow: string;
  links: ClusterLink[];
}) {
  if (links.length === 0) return null;

  return (
    <section className="border-b border-slate-200 bg-white px-4 py-3 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
      <div className="mx-auto w-full max-w-[1680px]">
        <nav
          aria-label={`${eyebrow} pages`}
          className="flex gap-2 overflow-x-auto pb-1"
        >
          {links.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className="group flex min-w-[220px] items-center gap-3 rounded-lg border border-slate-200 bg-white p-3 shadow-sm transition hover:border-primary/25 hover:shadow-[0_16px_45px_-38px_rgba(15,23,42,0.5)]"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary transition group-hover:bg-primary group-hover:text-white">
                  <Icon aria-hidden className="h-4 w-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center justify-between gap-2 text-sm font-semibold text-slate-950">
                    {item.label}
                    <ChevronRight
                      aria-hidden
                      className="h-4 w-4 shrink-0 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-primary"
                    />
                  </span>
                  {item.description ? (
                    <span className="mt-0.5 block line-clamp-1 text-xs leading-5 text-slate-600">
                      {item.description}
                    </span>
                  ) : null}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>
    </section>
  );
}

function ClusterBreadcrumbs({
  items,
}: {
  items: { label: string; href?: string }[];
}) {
  if (items.length === 0) return null;

  return (
    <nav
      aria-label="Breadcrumb"
      className="mb-4 flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500"
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
            {!isLast ? <span className="text-slate-300">/</span> : null}
          </span>
        );
      })}
    </nav>
  );
}

export function ClusterFeaturePanel({
  title,
  body,
  children,
}: {
  title: string;
  body?: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold leading-tight text-slate-950">
        {title}
      </h2>
      {body ? <p className="mt-2 text-sm leading-7 text-slate-600">{body}</p> : null}
      <div className="mt-5">{children}</div>
    </section>
  );
}
