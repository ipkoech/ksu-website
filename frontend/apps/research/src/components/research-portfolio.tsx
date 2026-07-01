import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight } from "lucide-react";

export type PortfolioQuickLink = {
  label: string;
  href: string;
  body?: string;
};

export function ResearchPortfolioHero({
  eyebrow,
  title,
  body,
  primary,
  secondary,
  image = "/images/research/research-hero-imagegen.webp",
}: {
  eyebrow: string;
  title: string;
  body: string;
  primary: PortfolioQuickLink;
  secondary?: PortfolioQuickLink;
  image?: string;
}) {
  return (
    <section className="relative isolate overflow-hidden bg-slate-950 px-4 py-7 text-white sm:px-6 lg:px-8 lg:py-8 xl:px-10 2xl:px-12">
      <div
        aria-hidden
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url('${image}')` }}
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-r from-slate-950/78 via-slate-950/42 to-slate-950/8"
      />
      <div aria-hidden className="absolute inset-x-0 bottom-0 h-px bg-white/20" />
      <div className="relative mx-auto max-w-[1680px] py-2">
        <span className="inline-flex rounded-md border border-white/25 bg-primary/80 px-3 py-1 text-xs font-semibold text-white shadow-sm backdrop-blur">
          {eyebrow}
        </span>
        <h1 className="mt-4 max-w-3xl font-[family-name:var(--font-display)] text-4xl font-semibold leading-none text-white sm:text-5xl lg:text-6xl">
          {title}
        </h1>
        <p className="mt-4 max-w-2xl text-pretty text-base leading-7 text-white/92 sm:text-lg">
          {body}
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <PortfolioHeroAction link={primary} primary />
          {secondary ? <PortfolioHeroAction link={secondary} /> : null}
        </div>
      </div>
    </section>
  );
}

export function ResearchPortfolioShell({
  id,
  title,
  body,
  controls,
  quickLinks,
  children,
}: {
  id: string;
  title: string;
  body: string;
  controls: ReactNode;
  quickLinks: PortfolioQuickLink[];
  children: ReactNode;
}) {
  return (
    <section id={id} className="bg-white px-4 py-6 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
      <div className="mx-auto grid max-w-[1680px] gap-6 xl:grid-cols-[minmax(0,1fr)_320px] xl:items-start">
        <div className="min-w-0">
          <div className="grid gap-4 lg:grid-cols-[320px_minmax(0,1fr)] lg:items-start">
            <div className="pt-1">
              <h2 className="font-[family-name:var(--font-display)] text-3xl font-semibold leading-tight text-slate-950 lg:whitespace-nowrap">
                {title}
              </h2>
              <p className="mt-2 max-w-md text-sm leading-6 text-slate-600">{body}</p>
            </div>
            <div className="w-full">{controls}</div>
          </div>
          {children}
        </div>
        <ResearchPortfolioQuickLinks links={quickLinks} />
      </div>
    </section>
  );
}

export function ResearchPortfolioQuickLinks({ links }: { links: PortfolioQuickLink[] }) {
  return (
    <aside className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm xl:sticky xl:top-24">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary">
        Quick links
      </p>
      <div className="mt-3 divide-y divide-slate-200">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="group flex items-start justify-between gap-4 py-3 text-sm transition first:pt-0 last:pb-0"
          >
            <span>
              <span className="block font-semibold text-primary group-hover:text-secondary">
                {link.label}
              </span>
              {link.body ? (
                <span className="mt-1 block text-xs leading-5 text-slate-500">{link.body}</span>
              ) : null}
            </span>
            <ArrowRight
              aria-hidden
              className="mt-1 h-4 w-4 shrink-0 text-slate-400 transition group-hover:translate-x-1 group-hover:text-secondary"
            />
          </Link>
        ))}
      </div>
    </aside>
  );
}

function PortfolioHeroAction({
  link,
  primary = false,
}: {
  link: PortfolioQuickLink;
  primary?: boolean;
}) {
  return (
    <Link
      href={link.href}
      className={
        primary
          ? "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-primary px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/30"
          : "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-white/40 bg-white/8 px-5 py-3 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/15 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/20"
      }
    >
      {link.label}
      <ArrowRight aria-hidden className="h-4 w-4" />
    </Link>
  );
}
