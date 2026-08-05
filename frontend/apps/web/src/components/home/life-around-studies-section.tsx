"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@ksu/ui/lib/utils";
import { focusVisibleStyles } from "@ksu/ui/motion";
import { PublicImage } from "@/components/public/public-image";
import { Reveal } from "@/components/home/reveal";
import type {
  HomepageSection,
  HomepageSectionItem,
} from "@/lib/homepage-sections";

/**
 * The campus-life CMS section as a panoramic gallery: a centred display
 * heading, a full-bleed band of five images, and a white arc sweeping
 * across the band's lower edge with the description and CTA beneath it.
 */
export function LifeAroundStudiesSection({
  section,
}: {
  section: HomepageSection;
}) {

  const items = (section.items ?? [])
    .filter((item) => item.is_enabled !== false)
    .sort(
      (first, second) =>
        (first.display_order ?? 100) - (second.display_order ?? 100),
    )
    .slice(0, 5);

  if (items.length === 0) return null;

  const title = section.title ?? "Life around studies";
  const titleWords = title.split(" ");
  const titleLead = titleWords.slice(0, -1).join(" ");
  const titleAccent = titleWords[titleWords.length - 1];

  return (
    <section
      id={section.section_key}
      aria-labelledby="life-heading"
      className="relative z-10 -mt-[28px] overflow-clip rounded-t-[28px] bg-white pt-12 lg:pt-16"
    >
      {/* Centred header */}
      <div className="mx-auto max-w-2xl px-4 text-center sm:px-6">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-secondary">
          {section.subtitle ?? "Campus life"}
        </p>
        <h2
          id="life-heading"
          className="mt-3 text-balance font-[family-name:var(--font-display)] text-3xl font-normal leading-tight text-primary sm:text-4xl lg:text-5xl"
        >
          {titleLead} <em className="italic">{titleAccent}</em>
        </h2>
      </div>

      {/* Full-bleed image band with a white arc over its lower edge */}
      <Reveal amount={0.2}
        className="relative mt-10 lg:mt-14"
      >
        <ul className="grid grid-cols-2 gap-2 px-2 sm:grid-cols-3 sm:gap-3 sm:px-3 lg:grid-cols-5">
          {items.map((item, index) => (
            <li
              key={item.id}
              className={cn(
                // On smaller grids the trailing tiles hide rather than wrap unevenly.
                index >= 2 && "hidden sm:block",
                index >= 3 && "sm:hidden lg:block",
              )}
            >
              <LifeTile item={item} />
            </li>
          ))}
        </ul>
        {/* The arc: a white curve sweeping across the bottom of the band */}
        <svg
          className="pointer-events-none absolute inset-x-0 bottom-0 h-16 w-full sm:h-24 lg:h-32"
          viewBox="0 0 1440 120"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path d="M0,120 L0,86 Q720,-28 1440,86 L1440,120 Z" fill="#fff" />
        </svg>
      </Reveal>

      {/* Description + CTA beneath the arc */}
      <div className="mx-auto max-w-xl px-4 pb-16 pt-4 text-center sm:px-6 lg:pb-20">
        {section.description ? (
          <p className="text-sm leading-6 text-muted-foreground md:text-base md:leading-7">
            {section.description}
          </p>
        ) : null}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/campus-life"
            className={cn(
              "inline-flex min-h-11 items-center justify-center rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-white transition-[background-color,transform] duration-200 hover:bg-primary/90 active:scale-[0.98]",
              focusVisibleStyles.primary,
            )}
          >
            Explore campus life
          </Link>
          <Link
            href="/admissions/how-to-apply"
            className={cn(
              "group inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-primary transition-colors duration-200 hover:text-secondary",
              focusVisibleStyles.primary,
            )}
          >
            Study with us
            <ArrowRight
              className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1"
              aria-hidden
            />
          </Link>
        </div>
      </div>
    </section>
  );
}

function LifeTile({ item }: { item: HomepageSectionItem }) {
  const imageSrc = contentText(item, "imageUrl") ?? "/logos/ksu-bck1.jpg";
  const title = item.title ?? "Campus life";

  const tile = (
    <article className="group relative aspect-[3/4] overflow-hidden rounded-xl sm:aspect-[4/5]">
      <PublicImage
        src={imageSrc}
        alt={item.media_alt_text ?? title}
        ratio="fill"
        className="absolute inset-0 h-full w-full"
        imageClassName="object-cover transition-transform duration-500 ease-out motion-safe:group-hover:scale-[1.03]"
        sizes="(min-width: 1024px) 20vw, (min-width: 640px) 33vw, 50vw"
      />
      <span className="sr-only">{title}</span>
    </article>
  );

  return item.cta_url ? (
    <Link
      href={item.cta_url}
      className={cn("block rounded-xl", focusVisibleStyles.primary)}
      aria-label={title}
    >
      {tile}
    </Link>
  ) : (
    tile
  );
}

function contentText(item: HomepageSectionItem | undefined, key: string) {
  const value = item?.content?.[key];
  return typeof value === "string" && value.trim() ? value : undefined;
}

export default LifeAroundStudiesSection;
