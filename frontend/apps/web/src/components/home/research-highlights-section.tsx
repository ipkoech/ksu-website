import { ArrowRight, ArrowUpRight } from "lucide-react";
import { cn } from "@ksu/ui/lib/utils";
import { focusVisibleStyles } from "@ksu/ui/motion";
import { PublicImage } from "@/components/public/public-image";
import { CountUp, Reveal } from "@/components/home/motion-primitives";
import { PartnerLogoRail } from "@/components/home/partners-marquee";
import type { HomePartner } from "@/lib/homepage-data";

export interface ResearchMeasure {
  id: string;
  value: string;
  label: string;
  href?: string | null;
}

export interface ResearchProjectCard {
  id: string;
  title: string;
  summary?: string | null;
  impact?: string | null;
  status?: string | null;
  imageUrl?: string | null;
  imageAlt?: string | null;
  href: string;
}

export interface ResearchThemeCard {
  id: string;
  title: string;
  summary?: string | null;
  href: string;
  kind?: "theme" | "project";
}

export interface ResearchSpotlightContent {
  /** Section heading copy, describing the University's research as a whole. */
  title: string;
  summary?: string | null;
  imageUrl?: string | null;
  imageAlt?: string;
  /** University-wide figures from the public research stats endpoint. */
  measures?: ResearchMeasure[];
  /** Active research themes, used for the compact discovery row. */
  themes?: ResearchThemeCard[];
  /** The research office's featured projects, in its own order. */
  projects?: ResearchProjectCard[];
  /** Strategic partners displayed as the closing rail of this section. */
  partners?: HomePartner[];
  /** Goes to the research portal's index, not to a single project. */
  cta: { label: string; href: string };
}

function isExternalHref(href: string) {
  return /^https?:\/\//i.test(href);
}

function linkTarget(href: string) {
  return isExternalHref(href)
    ? { target: "_blank" as const, rel: "noopener noreferrer" }
    : {};
}

function statLinkLabel(label: string) {
  const normalized = label.toLowerCase();
  if (normalized.includes("centre")) return "View centres";
  if (normalized.includes("project")) return "View projects";
  if (normalized.includes("publication")) return "View publications";
  return "View details";
}

/**
 * The University's research, on the homepage.
 *
 * The layout is intentionally height-conscious: one fixed-height featured
 * project row carries the story, three compact metric cards carry the scale,
 * and a short discovery row carries themes or additional projects.
 */
export function ResearchHighlightsSection({
  spotlight,
}: {
  spotlight: ResearchSpotlightContent | null;
}) {
  if (!spotlight) return null;

  const measures = (spotlight.measures ?? []).slice(0, 3);
  const projects = spotlight.projects ?? [];
  const featuredProject = projects[0] ?? null;
  const themeCards =
    spotlight.themes?.slice(0, 3).map((theme) => ({
      ...theme,
      kind: theme.kind ?? ("theme" as const),
    })) ?? [];
  const discoveryCards =
    themeCards.length > 0
      ? themeCards
      : projects.slice(1, 4).map((project) => ({
          id: project.id,
          title: project.title,
          summary: project.impact ?? project.summary,
          href: project.href,
          kind: "project" as const,
        }));

  const featureHref = featuredProject?.href ?? spotlight.cta.href;
  const featureImage =
    featuredProject?.imageUrl ??
    spotlight.imageUrl ??
    "/images/research/research-impact-bg.png";
  const featureAlt =
    featuredProject?.imageAlt ??
    spotlight.imageAlt ??
    "Kisii University research in the field";
  const featureTitle = featuredProject?.title ?? "Research at Kisii University";
  const featureSummary =
    featuredProject?.impact ??
    featuredProject?.summary ??
    spotlight.summary ??
    "Research that turns local knowledge into practical solutions for communities.";

  return (
    <section
      id="research-spotlight"
      aria-labelledby="research-spotlight-heading"
      className="ksu-band-tight relative isolate overflow-hidden bg-[hsl(var(--surface-page))] text-foreground"
    >
      <div
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_88%_8%,hsl(var(--gold)/0.13),transparent_24%),linear-gradient(135deg,hsl(var(--surface-page))_0%,hsl(var(--surface-page))_68%,hsl(var(--accent)/0.24)_100%)]"
        aria-hidden
      />

      <div className="ksu-shell relative">
        <Reveal
          as="header"
          className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"
        >
          <div className="max-w-[48rem]">
            <p className="ksu-l-small font-semibold uppercase tracking-[0.18em] text-[hsl(var(--gold-dark))]">
              Research &amp; Innovation
            </p>
            <h2
              id="research-spotlight-heading"
              className="ksu-l-h2 mt-2 max-w-[44rem] font-normal text-brand-overlay"
            >
              {spotlight.title}
            </h2>
            {spotlight.summary ? (
              <p className="mt-3 line-clamp-2 max-w-[58ch] text-sm leading-6 text-muted-foreground">
                {spotlight.summary}
              </p>
            ) : null}
          </div>

          <a
            href={spotlight.cta.href}
            {...linkTarget(spotlight.cta.href)}
            className={cn(
              "group inline-flex min-h-10 w-fit shrink-0 items-center gap-2 rounded-lg bg-secondary px-5 py-2.5 text-sm font-semibold text-white transition-[background-color,transform] duration-200 hover:-translate-y-0.5 hover:bg-[hsl(var(--secondary))]/90",
              focusVisibleStyles.primary,
            )}
          >
            {spotlight.cta.label}
            <ArrowUpRight
              className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              aria-hidden
            />
          </a>
        </Reveal>

        <div className="mt-7 grid gap-3 lg:grid-cols-[minmax(0,1.42fr)_minmax(17rem,0.58fr)]">
          <Reveal className="min-w-0">
            <a
              href={featureHref}
              {...linkTarget(featureHref)}
              className={cn(
                "group grid min-h-[17.5rem] overflow-hidden rounded-2xl bg-brand-overlay text-white shadow-[0_18px_45px_hsl(var(--brand-overlay)/0.12)] transition-[transform,box-shadow] duration-300 hover:-translate-y-0.5 hover:shadow-[0_22px_55px_hsl(var(--brand-overlay)/0.2)] sm:h-[18rem] sm:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:h-[19rem]",
                focusVisibleStyles.primary,
              )}
            >
              <div className="relative min-h-[12rem] overflow-hidden sm:min-h-0">
                <PublicImage
                  src={featureImage}
                  alt={featureAlt}
                  ratio="fill"
                  className="absolute inset-0 h-full w-full bg-brand-overlay"
                  imageClassName="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                  sizes="(min-width: 1024px) 32vw, (min-width: 640px) 42vw, 100vw"
                  /* Research sits below the hero; lazy loading avoids a
                     preload hint for an image the visitor may not reach. */
                  priority={false}
                />
                <div
                  className="absolute inset-0 bg-[linear-gradient(180deg,transparent_45%,hsl(var(--brand-overlay)/0.38)_100%)]"
                  aria-hidden
                />
              </div>

              <div className="flex min-h-0 flex-col p-5 sm:p-6">
                <span className="ksu-l-small inline-flex w-fit rounded-full bg-[hsl(var(--gold))] px-3 py-1 font-semibold text-brand-overlay">
                  Featured project
                </span>
                <h3 className="mt-4 line-clamp-2 text-[clamp(1.35rem,1.8vw,2rem)] font-medium leading-[1.1] tracking-[-0.02em]">
                  {featureTitle}
                </h3>
                <p className="mt-3 line-clamp-4 text-sm leading-6 text-white/75">
                  {featureSummary}
                </p>
                <span className="mt-auto inline-flex items-center gap-2 pt-4 text-sm font-semibold text-[hsl(var(--gold-light))]">
                  View project
                  <ArrowRight
                    className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1"
                    aria-hidden
                  />
                </span>
              </div>
            </a>
          </Reveal>

          <dl className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            {measures.map((measure, index) => {
              const href = measure.href || spotlight.cta.href;
              return (
                <Reveal key={measure.id} delay={0.06 + index * 0.05} as="div">
                  <dt className="sr-only">{measure.label}</dt>
                  <dd className="h-full">
                    <a
                      href={href}
                      {...linkTarget(href)}
                      className={cn(
                        "group flex min-h-[6.25rem] h-full items-center justify-between gap-4 rounded-2xl border border-border/70 bg-white/90 px-4 py-4 shadow-[0_10px_28px_hsl(var(--brand-overlay)/0.06)] transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:border-[hsl(var(--gold-dark))]/55 hover:shadow-[0_14px_30px_hsl(var(--brand-overlay)/0.1)] sm:min-h-[7.25rem] lg:min-h-0",
                        focusVisibleStyles.primary,
                      )}
                    >
                      <span className="min-w-0">
                        <span className="block text-[clamp(1.7rem,3vw,2.45rem)] font-medium leading-none tracking-[-0.03em] text-brand-overlay">
                          <CountUp value={measure.value} />
                        </span>
                        <span className="mt-2 block text-sm font-medium text-muted-foreground">
                          {measure.label}
                        </span>
                      </span>
                      <span className="hidden shrink-0 items-center gap-1 text-right text-xs font-semibold text-brand-overlay/75 sm:flex lg:flex">
                        {statLinkLabel(measure.label)}
                        <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
                      </span>
                    </a>
                  </dd>
                </Reveal>
              );
            })}
          </dl>
        </div>

        {discoveryCards.length > 0 ? (
          <div className="mt-8">
            <Reveal
              as="header"
              className="flex items-end justify-between gap-4 border-b border-border/70 pb-3"
            >
              <h3 className="ksu-l-card font-medium text-brand-overlay">
                Research themes
              </h3>
              <span className="hidden text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground sm:block">
                Different disciplines. Brighter communities.
              </span>
            </Reveal>

            <ul className="mt-3 grid gap-3 md:grid-cols-3">
              {discoveryCards.map((card, index) => (
                <Reveal key={card.id} as="li" delay={0.08 + index * 0.05}>
                  <a
                    href={card.href}
                    {...linkTarget(card.href)}
                    className={cn(
                      "group flex min-h-[8.5rem] h-full flex-col rounded-2xl border border-border/70 bg-white/75 p-5 transition-[border-color,background-color,transform] duration-200 hover:-translate-y-0.5 hover:border-[hsl(var(--gold-dark))]/55 hover:bg-white",
                      focusVisibleStyles.primary,
                    )}
                  >
                    <span className="ksu-l-small font-semibold uppercase tracking-[0.14em] text-[hsl(var(--gold-dark))]">
                      {card.kind === "project" ? "Featured project" : "Research theme"}
                    </span>
                    <span className="mt-2 line-clamp-2 text-lg font-medium leading-tight text-brand-overlay">
                      {card.title}
                    </span>
                    {card.summary ? (
                      <span className="mt-2 line-clamp-2 text-sm leading-5 text-muted-foreground">
                        {card.summary}
                      </span>
                    ) : null}
                    <span className="mt-auto inline-flex items-center gap-1 pt-3 text-xs font-semibold text-brand-overlay">
                      {card.kind === "project" ? "View project" : "Explore theme"}
                      <ArrowRight
                        className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1"
                        aria-hidden
                      />
                    </span>
                  </a>
                </Reveal>
              ))}
            </ul>
          </div>
        ) : null}

        {spotlight.partners && spotlight.partners.length > 0 ? (
          <div className="mt-8 border-t border-border/70 pt-5">
            <Reveal
              as="div"
              className="flex flex-wrap items-center justify-between gap-3"
            >
              <div>
                <p className="ksu-l-small font-semibold uppercase tracking-[0.16em] text-[hsl(var(--gold-dark))]">
                  Strategic partners
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Research and learning, shared across borders.
                </p>
              </div>
              <a
                href="/contact"
                className={cn(
                  "group inline-flex min-h-10 items-center gap-1.5 text-sm font-semibold text-brand-overlay",
                  focusVisibleStyles.primary,
                )}
              >
                Partner with Kisii
                <ArrowUpRight
                  className="h-3.5 w-3.5 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  aria-hidden
                />
              </a>
            </Reveal>
            <PartnerLogoRail partners={spotlight.partners} compact />
          </div>
        ) : null}
      </div>
    </section>
  );
}

export default ResearchHighlightsSection;
