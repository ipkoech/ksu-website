import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import { ResearchPageHero } from "./research-page-hero";

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
  imageSrc,
  immersive = false,
}: {
  eyebrow: string;
  title: string;
  body: string;
  primary?: PortfolioQuickLink;
  secondary?: PortfolioQuickLink;
  illustration?: PortfolioHeroIllustration;
  imageSrc?: string;
  immersive?: boolean;
}) {
  return (
    <ResearchPageHero
      eyebrow={eyebrow}
      title={title}
      description={body}
      breadcrumbs={[{ label: "Home", href: "/" }, { label: title }]}
      actions={[
        ...(primary ? [{ label: primary.label, href: primary.href }] : []),
        ...(secondary ? [{ label: secondary.label, href: secondary.href, variant: "secondary" as const }] : []),
      ]}
      imageSrc={imageSrc ?? getPortfolioHeroImage(illustration)}
      imageAlt={`Kisii University ${title}`}
      imagePosition="center 45%"
      size={immersive ? "immersive" : "standard"}
    />
  );
}

function getPortfolioHeroImage(illustration: PortfolioHeroIllustration) {
  if (illustration === "projects" || illustration === "programs" || illustration === "outputs") {
    return "/institutional-research-images/KSUInnovationWeek2025,April7,2026-8210.jpg";
  }
  if (illustration === "publications" || illustration === "expertise") {
    return "/institutional-research-images/KSUGreenLandscapingWithoutWMJuly2026-3944.jpg";
  }
  return "/institutional-research-images/KSUGreenLandscapingWithoutWMJuly2026-3942.jpg";
}

function HeroIllustration({ variant }: { variant: PortfolioHeroIllustration }) {
  const accent =
    variant === "outputs" || variant === "publications"
      ? "hsl(var(--secondary))"
      : variant === "centers"
        ? "hsl(var(--primary))"
        : "hsl(var(--success))";
  const secondary = variant === "facilities" ? "hsl(var(--success))" : "hsl(var(--secondary))";
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
    <section id={id} className="relative overflow-hidden border-b border-primary/10 bg-white/[0.82] px-4 py-10 backdrop-blur-[2px] sm:px-6 lg:px-8 lg:py-14 xl:px-10 2xl:px-12">
      <div aria-hidden className="pointer-events-none absolute -right-32 top-16 h-96 w-96 rounded-full bg-primary/[0.045] blur-3xl" />
      <div className={`relative mx-auto grid max-w-[1680px] gap-6 ${quickLinks.length ? "xl:grid-cols-[minmax(0,1fr)_320px]" : "grid-cols-1"} xl:items-start`}>
        <div className="min-w-0">
          <div className="grid gap-4 lg:grid-cols-[320px_minmax(0,1fr)] lg:items-start">
            <div className="pt-1">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-secondary">Explore the evidence</p>
              <h2 className="mt-2 font-display text-3xl font-semibold leading-tight text-foreground lg:whitespace-nowrap">
                {title}
              </h2>
              <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">{body}</p>
            </div>
            <div className="w-full">{controls}</div>
          </div>
          {children}
        </div>
        {quickLinks.length ? <ResearchPortfolioQuickLinks links={quickLinks} /> : null}
        {footer ? <div className={quickLinks.length ? "xl:col-span-2" : undefined}>{footer}</div> : null}
      </div>
    </section>
  );
}

export function ResearchPortfolioQuickLinks({ links }: { links: PortfolioQuickLink[] }) {
  return (
    <aside className="relative overflow-hidden rounded-xl bg-[hsl(var(--brand-overlay))] p-5 text-white shadow-[0_20px_50px_-30px_hsl(var(--primary)/0.8)] xl:sticky xl:top-24">
      <div aria-hidden className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-primary/35 blur-2xl" />
      <p className="relative text-xs font-bold uppercase tracking-[0.2em] text-secondary">Continue exploring</p>
      <p className="relative mt-2 font-display text-xl leading-tight text-white">Follow the research ecosystem</p>
      <div className="relative mt-4 divide-y divide-white/15">
        {links.map((link, index) => (
          <Link
            key={link.href}
            href={link.href}
            className="group grid grid-cols-[28px_minmax(0,1fr)_auto] items-start gap-3 py-4 text-sm transition first:pt-1 last:pb-1"
          >
            <span className="font-display text-lg text-secondary">{String(index + 1).padStart(2, "0")}</span>
            <span>
              <span className="block font-semibold text-white group-hover:text-secondary">
                {link.label}
              </span>
              {link.body ? (
                <span className="mt-1 block text-xs leading-5 text-white/65">{link.body}</span>
              ) : null}
            </span>
            <ArrowRight
              aria-hidden
              className="mt-1 h-4 w-4 shrink-0 text-white/50 transition group-hover:translate-x-1 group-hover:text-secondary"
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
          ? "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90"
          : "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-white/40 bg-white/10 px-5 py-3 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/15"
      }
    >
      {link.label}
      <ArrowRight aria-hidden className="h-4 w-4" />
    </Link>
  );
}
