import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight, ChevronRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { ScrollReveal } from "@ksu/ui/components";

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
  imageSrc,
  imageAlt,
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
    <section className="relative overflow-hidden border-b border-slate-200 bg-[linear-gradient(135deg,#f8fbff_0%,#ffffff_48%,#eef4ff_100%)] px-4 py-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-[radial-gradient(circle_at_50%_0%,rgba(59,130,246,0.16),transparent_66%)]" />
      <div className="relative mx-auto w-full max-w-[1680px]">
        <BreadcrumbTrail items={breadcrumbs} />

        <div className="mt-4 grid gap-5 lg:grid-cols-[minmax(0,1fr)_440px] lg:items-stretch">
          <ScrollReveal className="rounded-[1.5rem] border border-slate-800 bg-slate-950 p-5 text-white shadow-[0_24px_70px_-44px_rgba(15,23,42,0.7)] sm:p-6 lg:p-7">
            <p className="text-sm font-semibold uppercase text-secondary">
              {eyebrow}
            </p>
            <h1 className="mt-3 max-w-5xl font-[family-name:var(--font-display)] text-3xl font-semibold leading-tight text-white sm:text-4xl lg:text-5xl">
              {title}
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-white/72 sm:text-base">
              {body}
            </p>
            {primaryAction ? (
              <Link
                href={primaryAction.href}
                className="mt-5 inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90"
              >
                {primaryAction.label}
                <ArrowRight aria-hidden className="h-4 w-4" />
              </Link>
            ) : null}

            {stats.length > 0 ? (
              <div className="mt-6 grid overflow-hidden rounded-lg border border-white/10 bg-white/5 sm:grid-cols-2 xl:grid-cols-4">
                {stats.map((stat) => (
                  <div
                    key={stat.label}
                    className="border-white/10 p-4 sm:border-l first:sm:border-l-0"
                  >
                    <p className="font-[family-name:var(--font-display)] text-3xl font-semibold text-white">
                      {stat.value}
                    </p>
                    <p className="mt-1 text-xs leading-5 text-white/70">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>
            ) : null}
          </ScrollReveal>

          <ScrollReveal className="overflow-hidden rounded-[1.25rem] border border-slate-200 bg-white shadow-sm">
            <div className="relative aspect-[4/3] min-h-[300px]">
              <Image
                src={imageSrc}
                alt={imageAlt}
                fill
                priority
                sizes="(min-width: 1024px) 440px, 100vw"
                className="object-cover"
              />
            </div>
          </ScrollReveal>
        </div>

        {links.length > 0 ? (
          <nav
            aria-label={`${eyebrow} pages`}
            className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-5"
          >
            {links.map((item) => {
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group flex min-h-[104px] items-start gap-3 rounded-lg border border-slate-200 bg-white/85 p-4 shadow-sm backdrop-blur transition hover:border-primary/25 hover:bg-white hover:shadow-[0_20px_50px_-42px_rgba(15,23,42,0.45)]"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition group-hover:bg-primary group-hover:text-white">
                    <Icon aria-hidden className="h-5 w-5" />
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
                      <span className="mt-1 block text-xs leading-5 text-slate-600">
                        {item.description}
                      </span>
                    ) : null}
                  </span>
                </Link>
              );
            })}
          </nav>
        ) : null}
      </div>
    </section>
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
