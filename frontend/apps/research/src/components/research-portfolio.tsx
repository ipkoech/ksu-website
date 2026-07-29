import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight } from "lucide-react";

export type PortfolioQuickLink = {
  label: string;
  href: string;
  body?: string;
};

export type PortfolioHeroIllustration =
  | "programs"
  | "projects"
  | "centers"
  | "facilities"
  | "outputs"
  | "publications"
  | "expertise";

export function ResearchPortfolioHero({
  eyebrow,
  title,
  body,
  primary,
  secondary,
  illustration = "programs",
}: {
  eyebrow: string;
  title: string;
  body: string;
  primary?: PortfolioQuickLink;
  secondary?: PortfolioQuickLink;
  illustration?: PortfolioHeroIllustration;
}) {
  return (
    <section className="relative isolate overflow-hidden bg-[hsl(var(--brand-overlay))] px-4 py-7 text-white sm:px-6 lg:px-8 lg:py-8 xl:px-10 2xl:px-12">
      <div aria-hidden className="absolute inset-0 bg-[radial-gradient(circle_at_78%_18%,rgba(13,148,136,0.38),transparent_28%),radial-gradient(circle_at_50%_90%,rgba(245,158,11,0.24),transparent_24%),linear-gradient(120deg,hsl(var(--brand-overlay))_0%,#082B57_52%,hsl(var(--primary)/.62)_100%)]" />
      <div aria-hidden className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.045)_1px,transparent_1px)] bg-[size:48px_48px] opacity-55" />
      <HeroIllustration variant={illustration} />
      <div aria-hidden className="absolute inset-0 bg-gradient-to-r from-[hsl(var(--brand-overlay))]/92 via-[hsl(var(--brand-overlay))]/62 to-[hsl(var(--brand-overlay))]/10" />
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
        {primary || secondary ? (
          <div className="mt-6 flex flex-wrap gap-3">
            {primary ? <PortfolioHeroAction link={primary} primary /> : null}
            {secondary ? <PortfolioHeroAction link={secondary} /> : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}

function HeroIllustration({ variant }: { variant: PortfolioHeroIllustration }) {
  const accent = variant === "outputs" || variant === "publications" ? "#F59E0B" : variant === "centers" ? "#38BDF8" : "#10B981";
  const secondary = variant === "facilities" ? "#A7F3D0" : "#FDE68A";
  const nodes = getHeroNodes(variant);

  return (
    <svg
      aria-hidden
      viewBox="0 0 920 360"
      className="absolute right-[-90px] top-1/2 hidden h-[118%] w-[62%] -translate-y-1/2 opacity-95 lg:block"
      fill="none"
    >
      <defs>
        <linearGradient id={`hero-panel-${variant}`} x1="120" x2="820" y1="40" y2="320">
          <stop stopColor="white" stopOpacity="0.22" />
          <stop offset="1" stopColor="white" stopOpacity="0.04" />
        </linearGradient>
      </defs>
      <path
        d="M92 246C185 105 318 57 485 92c111 23 176-22 270-53 68-22 128-3 170 54v267H92V246Z"
        fill={`url(#hero-panel-${variant})`}
      />
      <path
        d="M158 262c92-89 183-133 274-132 135 2 183 86 320 18 48-24 89-60 123-108"
        stroke="white"
        strokeOpacity="0.24"
        strokeWidth="2"
      />
      {nodes.map((node) => (
        <g key={`${variant}-${node.x}-${node.y}`}>
          <circle cx={node.x} cy={node.y} r="24" fill="hsl(var(--brand-overlay))" fillOpacity="0.72" stroke="white" strokeOpacity="0.22" />
          <circle cx={node.x} cy={node.y} r="6" fill={node.hot ? accent : secondary} />
        </g>
      ))}
      <HeroVariantGlyph variant={variant} accent={accent} secondary={secondary} />
    </svg>
  );
}

function HeroVariantGlyph({
  variant,
  accent,
  secondary,
}: {
  variant: PortfolioHeroIllustration;
  accent: string;
  secondary: string;
}) {
  if (variant === "projects") {
    return (
      <g>
        <rect x="520" y="174" width="250" height="104" rx="14" fill="hsl(var(--brand-overlay))" fillOpacity="0.68" stroke="white" strokeOpacity="0.22" />
        <path d="M552 242h54l34-44 38 24 42-54" stroke={accent} strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M552 204h56M552 222h36" stroke="white" strokeOpacity="0.44" strokeWidth="6" strokeLinecap="round" />
      </g>
    );
  }
  if (variant === "centers") {
    return (
      <g>
        <circle cx="650" cy="216" r="82" fill="hsl(var(--brand-overlay))" fillOpacity="0.68" stroke="white" strokeOpacity="0.22" />
        <circle cx="650" cy="216" r="22" fill={accent} fillOpacity="0.9" />
        {[0, 60, 120, 180, 240, 300].map((angle) => {
          const rad = (angle * Math.PI) / 180;
          const x = 650 + Math.cos(rad) * 58;
          const y = 216 + Math.sin(rad) * 58;
          return (
            <g key={angle}>
              <path d={`M650 216L${x} ${y}`} stroke="white" strokeOpacity="0.28" strokeWidth="3" />
              <circle cx={x} cy={y} r="12" fill={secondary} />
            </g>
          );
        })}
      </g>
    );
  }
  if (variant === "facilities") {
    return (
      <g>
        <path d="M512 264h258v-78l-66-48-64 48-58-36-70 52v62Z" fill="hsl(var(--brand-overlay))" fillOpacity="0.7" stroke="white" strokeOpacity="0.22" />
        <path d="M544 264v-42h52v42M642 264v-62h62v62" stroke={accent} strokeWidth="8" strokeLinejoin="round" />
        <path d="M514 292c66-30 143-30 232 0" stroke={secondary} strokeWidth="8" strokeLinecap="round" />
      </g>
    );
  }
  if (variant === "outputs") {
    return (
      <g>
        <rect x="528" y="144" width="230" height="150" rx="16" fill="hsl(var(--brand-overlay))" fillOpacity="0.7" stroke="white" strokeOpacity="0.22" />
        <path d="M568 184h150M568 218h104M568 252h132" stroke="white" strokeOpacity="0.5" strokeWidth="8" strokeLinecap="round" />
        <path d="M716 244l28 28 54-70" stroke={accent} strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
      </g>
    );
  }
  if (variant === "publications") {
    return (
      <g>
        <rect x="520" y="126" width="212" height="164" rx="16" fill="hsl(var(--brand-overlay))" fillOpacity="0.72" stroke="white" strokeOpacity="0.22" />
        <path d="M560 166h126M560 198h146M560 230h104" stroke="white" strokeOpacity="0.52" strokeWidth="8" strokeLinecap="round" />
        <path d="M704 246l26 24 48-64" stroke={accent} strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="568" y="274" width="96" height="10" rx="5" fill={secondary} fillOpacity="0.85" />
      </g>
    );
  }
  if (variant === "expertise") {
    return (
      <g>
        <circle cx="628" cy="204" r="46" fill="hsl(var(--brand-overlay))" fillOpacity="0.74" stroke="white" strokeOpacity="0.22" />
        <circle cx="628" cy="188" r="16" fill={accent} />
        <path d="M588 238c12-24 66-24 80 0" stroke={secondary} strokeWidth="10" strokeLinecap="round" />
        {[540, 716, 650].map((x, index) => (
          <g key={x}>
            <path d={`M628 204L${x} ${index === 2 ? 116 : 254}`} stroke="white" strokeOpacity="0.28" strokeWidth="3" />
            <circle cx={x} cy={index === 2 ? 116 : 254} r="22" fill="hsl(var(--brand-overlay))" fillOpacity="0.7" stroke="white" strokeOpacity="0.22" />
            <circle cx={x} cy={index === 2 ? 116 : 254} r="7" fill={index === 1 ? secondary : accent} />
          </g>
        ))}
      </g>
    );
  }
  return (
    <g>
      <rect x="522" y="154" width="250" height="124" rx="18" fill="hsl(var(--brand-overlay))" fillOpacity="0.7" stroke="white" strokeOpacity="0.22" />
      <path d="M560 238c34-48 67-70 100-66 44 6 54 57 102 24" stroke={accent} strokeWidth="8" strokeLinecap="round" />
      <path d="M572 198h56M572 218h34M690 244h48" stroke="white" strokeOpacity="0.45" strokeWidth="7" strokeLinecap="round" />
      <circle cx="738" cy="182" r="20" fill={secondary} />
    </g>
  );
}

function getHeroNodes(variant: PortfolioHeroIllustration) {
  const base = [
    { x: 170, y: 256, hot: false },
    { x: 284, y: 176, hot: true },
    { x: 420, y: 132, hot: false },
    { x: 560, y: 160, hot: true },
    { x: 752, y: 118, hot: false },
  ];

  if (variant === "facilities") return base.map((node, index) => ({ ...node, y: node.y + (index % 2 ? 20 : -8) }));
  if (variant === "outputs") return base.map((node, index) => ({ ...node, x: node.x + index * 8 }));
  if (variant === "publications") return base.map((node, index) => ({ ...node, x: node.x + index * 10, hot: index % 2 === 0 }));
  if (variant === "expertise") return base.map((node, index) => ({ ...node, y: node.y + (index % 2 ? -16 : 16), hot: true }));
  if (variant === "centers") return base.map((node) => ({ ...node, hot: true }));
  return base;
}

export function ResearchPortfolioShell({
  id,
  title,
  body,
  controls,
  quickLinks,
  footer,
  children,
}: {
  id: string;
  title: string;
  body: string;
  controls: ReactNode;
  quickLinks: PortfolioQuickLink[];
  footer?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section id={id} className="bg-white px-4 py-6 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
      <div className="mx-auto grid max-w-[1680px] gap-6 xl:grid-cols-[minmax(0,1fr)_320px] xl:items-start">
        <div className="min-w-0">
          <div className="grid gap-4 lg:grid-cols-[320px_minmax(0,1fr)] lg:items-start">
            <div className="pt-1">
              <h2 className="font-[family-name:var(--font-display)] text-3xl font-semibold leading-tight text-foreground lg:whitespace-nowrap">
                {title}
              </h2>
              <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">{body}</p>
            </div>
            <div className="w-full">{controls}</div>
          </div>
          {children}
        </div>
        <ResearchPortfolioQuickLinks links={quickLinks} />
        {footer ? <div className="xl:col-span-2">{footer}</div> : null}
      </div>
    </section>
  );
}

export function ResearchPortfolioQuickLinks({ links }: { links: PortfolioQuickLink[] }) {
  return (
    <aside className="rounded-lg border border-border bg-white p-4 shadow-sm xl:sticky xl:top-24">
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
                <span className="mt-1 block text-xs leading-5 text-muted-foreground">{link.body}</span>
              ) : null}
            </span>
            <ArrowRight
              aria-hidden
              className="mt-1 h-4 w-4 shrink-0 text-muted-foreground/70 transition group-hover:translate-x-1 group-hover:text-secondary"
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
