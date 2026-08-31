import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight, ChevronRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { ResearchPageHero } from "./research-page-hero";

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
    <>
      <ResearchPageHero
        eyebrow={eyebrow}
        title={title}
        description={body}
        breadcrumbs={breadcrumbs}
        actions={primaryAction ? [{ label: primaryAction.label, href: primaryAction.href }] : []}
        imageSrc={imageSrc}
        imageAlt={imageAlt}
      >
        {stats.length > 0 ? (
            <dl className="grid max-w-3xl gap-2 sm:grid-cols-2 lg:grid-cols-4">
              {stats.slice(0, 4).map((stat) => (
                <div key={stat.label} className="rounded-md border border-white/20 bg-brand-overlay/55 px-3 py-2 backdrop-blur-sm">
                  <dt className="text-[11px] font-semibold uppercase text-white/70">
                    {stat.label}
                  </dt>
                  <dd className="mt-1 text-lg font-semibold text-white">
                    {stat.value}
                  </dd>
                </div>
              ))}
            </dl>
          ) : null}
      </ResearchPageHero>
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
    <section className="border-b border-border bg-white px-4 py-3 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
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
                className="group flex min-w-[220px] items-center gap-3 rounded-lg border border-border bg-card p-3 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary transition group-hover:bg-primary group-hover:text-white">
                  <Icon aria-hidden className="h-4 w-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center justify-between gap-2 text-sm font-semibold text-foreground">
                    {item.label}
                    <ChevronRight
                      aria-hidden
                      className="h-4 w-4 shrink-0 text-muted-foreground/70 transition group-hover:translate-x-0.5 group-hover:text-primary"
                    />
                  </span>
                  {item.description ? (
                    <span className="mt-0.5 block line-clamp-1 text-xs leading-5 text-muted-foreground">
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
      className="mb-4 flex flex-wrap items-center gap-2 text-xs font-semibold text-muted-foreground"
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
              <span className={isLast ? "text-foreground" : undefined}>{item.label}</span>
            )}
            {!isLast ? <span className="text-muted-foreground/60">/</span> : null}
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
    <section className="rounded-lg border border-border bg-card p-5 shadow-sm">
      <h2 className="font-display text-2xl font-semibold leading-tight text-foreground">
        {title}
      </h2>
      {body ? <p className="mt-2 text-sm leading-7 text-muted-foreground">{body}</p> : null}
      <div className="mt-5">{children}</div>
    </section>
  );
}
