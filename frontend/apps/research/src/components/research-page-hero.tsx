import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight, ChevronRight } from "lucide-react";

import { ResearchImage } from "./research-image";
import { getResearchHeaderImage } from "../config/research-header-images";

export type ResearchPageHeroAction = {
  label: string;
  href: string;
  variant?: "primary" | "secondary";
};

export type ResearchPageHeroStat = {
  label: string;
  value: ReactNode;
};

export function ResearchPageSummary({ actions = [], facts = [], children }: {
  actions?: ResearchPageHeroAction[];
  facts?: ResearchPageHeroStat[];
  children?: ReactNode;
}) {
  if (!actions.length && !facts.length && !children) return null;
  return (
    <section aria-label="Page overview" className="border-b border-border bg-background px-4 py-4 text-foreground sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
      <div className="mx-auto max-w-[1680px] space-y-4">
        {actions.length ? <div className="flex flex-wrap gap-3">{actions.map(action => <HeroAction key={action.href} action={action} inverse={false} />)}</div> : null}
        {facts.length ? <dl className="grid grid-cols-2 gap-3 md:grid-cols-4">{facts.map(fact => <div key={fact.label} className="rounded-md border border-border bg-surface-subtle px-3 py-2"><dt className="text-xs text-muted-foreground">{fact.label}</dt><dd className="mt-1 text-lg font-semibold">{fact.value}</dd></div>)}</dl> : null}
        {children}
      </div>
    </section>
  );
}

export function ResearchPageHeroStats({ facts }: { facts: ResearchPageHeroStat[] }) {
  return (
    <dl className="grid max-w-3xl gap-2 sm:grid-cols-3">
      {facts.map((fact) => (
        <div
          key={fact.label}
          className="rounded-md border border-white/20 bg-white/10 px-3 py-2 text-white shadow-sm backdrop-blur-sm"
        >
          <dt className="text-[0.68rem] font-bold uppercase tracking-wider opacity-75">{fact.label}</dt>
          <dd className="mt-1 font-display text-lg font-semibold">{fact.value}</dd>
        </div>
      ))}
    </dl>
  );
}

export function ResearchPageHero({
  eyebrow,
  title,
  description,
  breadcrumbs = [],
  actions = [],
  imageSrc = "/images/research/headers/innovation-week-8197.jpg",
  imageAlt = "Kisii University research and innovation",
  imagePosition = "center",
  varyImage = true,
  clean = true,
  size = "standard",
  children,
}: {
  eyebrow: string;
  title: ReactNode;
  description?: string;
  breadcrumbs?: Array<{ label: string; href?: string }>;
  actions?: ResearchPageHeroAction[];
  imageSrc?: string;
  imageAlt?: string;
  imagePosition?: string;
  varyImage?: boolean;
  clean?: boolean;
  size?: "standard" | "immersive";
  children?: ReactNode;
}) {
  const photo = varyImage && imageSrc.startsWith("/images/research/headers/")
    ? getResearchHeaderImage(breadcrumbs.map(item => item.label).join("/") || (typeof title === "string" ? title : eyebrow))
    : { src: imageSrc, alt: imageAlt };
  return (
    <>
      <header data-research-page-hero className={`relative isolate overflow-hidden bg-brand-overlay ${size === "immersive" ? "min-h-[238px] md:min-h-[273px] lg:min-h-[329px]" : "min-h-[190px] lg:min-h-[226px]"}`}>
        <ResearchImage src={photo.src} alt={photo.alt} fill priority sizes="100vw" className="object-cover" style={{ objectPosition: imagePosition }} />
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-[linear-gradient(105deg,hsl(var(--brand-overlay)/0.96)_0%,hsl(var(--primary)/0.78)_46%,hsl(var(--primary)/0.24)_100%)] mix-blend-multiply" />
        <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-4/5 bg-[linear-gradient(180deg,transparent_0%,rgba(3,17,40,0.30)_40%,rgba(3,17,40,0.82)_100%)]" />
        <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-1 bg-[linear-gradient(90deg,hsl(var(--secondary))_0%,hsl(var(--secondary))_16%,hsl(var(--primary))_16%,hsl(var(--primary))_100%)]" />
        <div className={`relative mx-auto flex w-full max-w-[1680px] flex-col justify-end px-4 pb-[22px] pt-[34px] text-white sm:px-6 lg:px-8 xl:px-10 2xl:px-12 ${size === "immersive" ? "min-h-[238px] md:min-h-[273px] lg:min-h-[329px] lg:pb-[34px]" : "min-h-[190px] lg:min-h-[226px]"}`}>
          {clean ? <h1 className="max-w-4xl text-balance font-display text-3xl font-normal leading-tight text-white sm:text-4xl lg:text-[2.9rem]">{title}</h1> : <HeroContent eyebrow={eyebrow} title={title} description={description} breadcrumbs={breadcrumbs} actions={actions} inverse>{children}</HeroContent>}
        </div>
      </header>
      {clean && (description || actions.length || children) ? <ResearchPageSummary actions={actions}>
        {description ? <p className="max-w-3xl text-sm leading-7 text-muted-foreground">{description}</p> : null}
        {children ? <div className="rounded-md bg-brand-overlay p-4 text-white">{children}</div> : null}
      </ResearchPageSummary> : null}
    </>
  );
}

function HeroContent({ eyebrow, title, description, breadcrumbs, actions, children, inverse = false }: {
  eyebrow: string;
  title: ReactNode;
  description?: string;
  breadcrumbs: Array<{ label: string; href?: string }>;
  actions: ResearchPageHeroAction[];
  children?: ReactNode;
  inverse?: boolean;
}) {
  return (
    <div className="w-full">
      {breadcrumbs.length ? <HeroBreadcrumbs items={breadcrumbs} inverse={inverse} /> : null}
      <p className={`inline-flex items-center rounded-full px-3 py-1 text-[0.72rem] font-bold uppercase tracking-[0.18em] ${inverse ? "bg-secondary text-white" : "bg-secondary/10 text-[hsl(var(--secondary-ink))]"}`}>{eyebrow}</p>
      <h1 className={`mt-3 max-w-4xl text-balance font-display text-3xl font-semibold leading-[1.08] tracking-tight sm:text-4xl lg:text-[2.9rem] ${inverse ? "text-white [text-shadow:0_2px_8px_rgba(3,17,40,0.9)]" : "text-foreground"}`}>{title}</h1>
      {description ? <p className={`mt-3 max-w-2xl text-sm leading-7 lg:text-base ${inverse ? "text-white/90 [text-shadow:0_1px_6px_rgba(3,17,40,0.95)]" : "text-muted-foreground"}`}>{description}</p> : null}
      {actions.length ? <div className="mt-5 flex flex-wrap gap-3">{actions.map((action) => <HeroAction key={`${action.label}-${action.href}`} action={action} inverse={inverse} />)}</div> : null}
      {children ? <div className="mt-5">{children}</div> : null}
    </div>
  );
}

function HeroAction({ action, inverse }: { action: ResearchPageHeroAction; inverse: boolean }) {
  const secondary = action.variant === "secondary";
  return <Link href={action.href} className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-md px-5 py-3 text-sm font-semibold transition ${secondary ? inverse ? "border border-white/40 bg-white/10 text-white hover:bg-white/20" : "border border-primary/25 bg-white text-primary hover:bg-primary/5" : "bg-secondary text-white hover:bg-secondary/90"}`}>{action.label}<ArrowRight aria-hidden className="h-4 w-4" /></Link>;
}

function HeroBreadcrumbs({ items, inverse }: { items: Array<{ label: string; href?: string }>; inverse: boolean }) {
  return <nav aria-label="Breadcrumb" className={`mb-4 flex flex-wrap items-center gap-2 text-xs font-semibold ${inverse ? "text-white/85" : "text-muted-foreground"}`}>{items.map((item, index) => { const last = index === items.length - 1; return <span key={`${item.label}-${index}`} className="inline-flex items-center gap-2">{item.href && !last ? <Link href={item.href} className="hover:underline">{item.label}</Link> : <span aria-current={last ? "page" : undefined}>{item.label}</span>}{!last ? <ChevronRight aria-hidden className="h-3.5 w-3.5 opacity-60" /> : null}</span>; })}</nav>;
}
