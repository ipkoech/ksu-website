"use client";

import Link from "next/link";
import { ArrowRight, CalendarDays } from "lucide-react";
import { cn } from "@ksu/ui/lib/utils";
import { focusVisibleStyles } from "@ksu/ui/motion";
import { PublicImage } from "@/components/public/public-image";
import { Reveal } from "@/components/home/reveal";
import type { HomeCard } from "@/lib/homepage-data";

interface EditorialShowcaseSectionProps {
  id: string;
  badge: string;
  headingLead: string;
  headingAccent: string;
  subtitle: string;
  viewAllHref: string;
  viewAllLabel: string;
  cards: HomeCard[];
  /** Shown in place of the cards when the feed is empty or unavailable. */
  emptyMessage?: string;
  /** Optional compact strip rendered under the grid (used for events). */
  events?: HomeCard[];
  eventsHref?: string;
  /** Ground tone — alternate consecutive showcases so they read as beats. */
  tone?: "white" | "wash";
}

/* Category badges rotate through brand shades — never a foreign hue.
   (Primary and navy only: white 11px text on the orange fails AA.) */
const badgeShades = ["bg-primary", "bg-brand-overlay"];

function categoryShade(label: string | undefined, index: number) {
  if (!label) return badgeShades[index % badgeShades.length];
  let hash = 0;
  for (const char of label) hash = (hash * 31 + char.charCodeAt(0)) % 997;
  return badgeShades[hash % badgeShades.length];
}

/**
 * Editorial showcase: badge + display heading + view-all pill, one large
 * two-column featured card, then a three-card grid. Media hover reveals a
 * gentle zoom and scrim.
 */
export function EditorialShowcaseSection({
  id,
  badge,
  headingLead,
  headingAccent,
  subtitle,
  viewAllHref,
  viewAllLabel,
  cards,
  emptyMessage = "New items are being published. Check back soon.",
  events,
  eventsHref,
  tone = "white",
}: EditorialShowcaseSectionProps) {
  const [featured, ...rest] = cards;
  const gridCards = rest.slice(0, 3);

  return (
    <section
      id={id}
      aria-labelledby={`${id}-heading`}
      className={cn(
        "ksu-band",
        tone === "wash"
          ? "bg-[hsl(var(--surface-band))]"
          : "bg-white",
      )}
    >
      <div className="mx-auto max-w-[1680px] px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
        {/* Header */}
        <Reveal amount={0.3}
        >
          <span className="inline-flex items-center rounded-lg bg-primary/5 px-3 py-1 text-xs font-semibold text-brand-overlay">
            {badge}
          </span>
          <div className="mt-4 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <h2
                id={`${id}-heading`}
                className="ksu-d2 text-balance font-[family-name:var(--font-display)] font-normal text-brand-overlay"
              >
                {headingLead} <em className="italic">{headingAccent}</em>
              </h2>
              <p className="mt-4 max-w-[480px] text-base font-medium leading-7 text-muted-foreground md:text-lg">
                {subtitle}
              </p>
            </div>
            <Link
              href={viewAllHref}
              className={cn(
                "inline-flex min-h-11 w-fit shrink-0 items-center gap-2 rounded-full bg-brand-overlay px-6 py-2.5 text-sm font-semibold text-white transition-[background-color,transform] duration-200 hover:bg-brand-overlay/90 active:scale-[0.98] motion-safe:hover:scale-[1.02]",
                focusVisibleStyles.primary,
              )}
            >
              {viewAllLabel}
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        </Reveal>

        {/* Featured card, or a clear empty state when the feed has nothing */}
        {featured ? (
        <Reveal as="article" delay={80} amount={0.2}
          className="mt-10 grid overflow-hidden rounded-3xl border border-border bg-[color-mix(in_srgb,hsl(var(--primary))_3%,white)] lg:min-h-[480px] lg:grid-cols-2"
        >
          <Link
            href={featured.href}
            className={cn("group relative block min-h-[260px]", focusVisibleStyles.primary)}
            aria-label={featured.title}
            tabIndex={-1}
          >
            <ShowcaseMedia
              imageUrl={featured.imageUrl}
              alt=""
              sizes="(min-width: 1024px) 50vw, 100vw"
              fill
            />
          </Link>
          <div className="flex flex-col p-8 lg:p-14">
            <span className="w-fit rounded-full bg-brand-overlay px-3.5 py-1 text-xs font-semibold text-white">
              Featured
            </span>
            <h3 className="mt-5 text-balance font-[family-name:var(--font-display)] text-3xl font-normal leading-[1.1] tracking-tight text-brand-overlay sm:text-4xl lg:text-[44px]">
              <Link
                href={featured.href}
                className={cn("transition-colors duration-200 hover:text-primary", focusVisibleStyles.primary)}
              >
                {featured.title}
              </Link>
            </h3>
            <p className="mt-4 line-clamp-4 text-base leading-7 text-muted-foreground md:text-[17px]">
              {featured.body}
            </p>
            <div className="mt-auto flex items-center justify-between gap-4 pt-8">
              <span className="text-sm font-medium text-muted-foreground">
                {featured.meta ?? ""}
              </span>
              {featured.eyebrow ? (
                <span
                  className={cn(
                    "rounded-full px-3 py-1 text-[11px] font-semibold capitalize text-white",
                    categoryShade(featured.eyebrow, 0),
                  )}
                >
                  {featured.eyebrow}
                </span>
              ) : null}
            </div>
          </div>
        </Reveal>
        ) : (
          <div className="mt-10 rounded-3xl border border-dashed border-border bg-[color-mix(in_srgb,hsl(var(--primary))_3%,white)] px-8 py-14 text-center">
            <p className="text-base font-medium text-muted-foreground">
              {emptyMessage}
            </p>
          </div>
        )}

        {/* Grid */}
        {gridCards.length > 0 && (
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {gridCards.map((card, index) => (
              <Reveal as="article" key={card.id ?? card.href} delay={index * 70}>
                <Link
                  href={card.href}
                  className={cn("group block", focusVisibleStyles.primary)}
                >
                  <div className="relative aspect-[16/10] overflow-hidden rounded-3xl">
                    <ShowcaseMedia
                      imageUrl={card.imageUrl}
                      alt=""
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                      fill
                    />
                  </div>
                  <div className="mt-4 flex items-start justify-between gap-3">
                    <h3 className="line-clamp-2 font-[family-name:var(--font-display)] text-lg font-medium leading-snug text-brand-overlay transition-colors duration-200 group-hover:text-primary">
                      {card.title}
                    </h3>
                    {card.eyebrow ? (
                      <span
                        className={cn(
                          "mt-0.5 shrink-0 rounded-full px-3 py-1 text-[11px] font-semibold capitalize text-white",
                          categoryShade(card.eyebrow, index + 1),
                        )}
                      >
                        {card.eyebrow}
                      </span>
                    ) : null}
                  </div>
                  {card.meta ? (
                    <p className="mt-1 text-xs font-medium text-muted-foreground">
                      {card.meta}
                    </p>
                  ) : null}
                </Link>
              </Reveal>
            ))}
          </div>
        )}

        {/* Optional events strip */}
        {events && events.length > 0 && (
          <div className="mt-10 rounded-3xl border border-border bg-[color-mix(in_srgb,hsl(var(--primary))_3%,white)] p-6 lg:p-8">
            <div className="flex items-center justify-between gap-4">
              <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-brand-overlay/70">
                <CalendarDays className="h-4 w-4 text-secondary" aria-hidden />
                Upcoming events
              </h3>
              {eventsHref ? (
                <Link
                  href={eventsHref}
                  className={cn(
                    "group inline-flex min-h-10 items-center gap-1.5 text-sm font-semibold text-secondary transition-colors duration-200 hover:opacity-80",
                    focusVisibleStyles.primary,
                  )}
                >
                  All events
                  <ArrowRight
                    className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1"
                    aria-hidden
                  />
                </Link>
              ) : null}
            </div>
            <ul className="mt-4 divide-y divide-primary/10">
              {events.slice(0, 3).map((event) => (
                <li key={event.id ?? event.href}>
                  <Link
                    href={event.href}
                    className={cn(
                      "group flex min-h-12 items-center gap-4 py-3",
                      focusVisibleStyles.primary,
                    )}
                  >
                    <span className="w-28 shrink-0 text-xs font-semibold uppercase tracking-wide text-secondary">
                      {event.meta ?? ""}
                    </span>
                    <span className="min-w-0 truncate text-sm font-semibold text-brand-overlay">
                      {event.title}
                    </span>
                    <ArrowRight
                      className="ml-auto h-4 w-4 shrink-0 text-brand-overlay/30 transition-transform duration-200 group-hover:translate-x-1 group-hover:text-brand-overlay"
                      aria-hidden
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}

/**
 * Media block with the standard hover treatment: gentle zoom + scrim fade.
 */
function ShowcaseMedia({
  imageUrl,
  alt,
  sizes,
  fill,
}: {
  imageUrl?: string | null;
  alt: string;
  sizes: string;
  fill?: boolean;
}) {
  return (
    <div className={cn("overflow-hidden", fill && "absolute inset-0")}>
      <PublicImage
        src={imageUrl ?? "/logos/ksu-bck1.jpg"}
        alt={alt}
        ratio="fill"
        className="absolute inset-0 h-full w-full"
        imageClassName="object-cover transition-transform duration-500 ease-[cubic-bezier(0.33,1,0.68,1)] motion-safe:group-hover:scale-[1.05]"
        sizes={sizes}
      />
      {/* Hover scrim */}
      <div
        className="absolute inset-0 bg-brand-overlay/25 opacity-0 transition-opacity duration-[400ms] group-hover:opacity-100"
        aria-hidden
      />
    </div>
  );
}

export default EditorialShowcaseSection;
