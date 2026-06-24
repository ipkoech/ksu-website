import Link from "next/link";
import type { ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { ResearchImmersiveHero } from "./research-immersive-hero";

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
      <ResearchImmersiveHero
        size="compact"
        breadcrumbs={breadcrumbs}
        showControls={false}
        slides={[
          {
            id: "cluster",
            eyebrow,
            title,
            body,
            imageSrc,
            imageAlt,
            primaryAction,
            stats,
          },
        ]}
      />
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
    <section className="border-b border-slate-200 bg-white px-4 py-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
      <div className="mx-auto w-full max-w-[1680px]">
        <nav
          aria-label={`${eyebrow} pages`}
          className="grid gap-3 md:grid-cols-2 xl:grid-cols-4"
        >
          {links.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className="group flex min-h-[112px] items-start gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-[0_20px_55px_-42px_rgba(15,23,42,0.5)]"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary transition group-hover:bg-primary group-hover:text-white">
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
