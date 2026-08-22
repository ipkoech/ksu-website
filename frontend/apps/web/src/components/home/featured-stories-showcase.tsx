import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@ksu/ui/lib/utils";
import { AmbientPageBackground } from "@ksu/ui";
import { focusVisibleStyles } from "@ksu/ui/motion";
import { PublicImage } from "@/components/public/public-image";
import { ImageCurtainReveal } from "@/components/about/image-curtain-reveal";
import {
  Reveal,
  RevealGroup,
  RevealItem,
} from "@/components/home/motion-primitives";
import type { HomeCard } from "@/lib/homepage-data";

/**
 * Featured stories: the lead story runs the full width as a single image-led
 * banner, with the supporting stories in a row beneath it.
 *
 * Giving the lead its own full-bleed moment is what separates it from the
 * others. Side by side at 55/45 the four read as one grid with a slightly
 * bigger first cell, which is not hierarchy.
 */
export function FeaturedStoriesShowcase({
  stories,
  viewAllHref = "/stories",
}: {
  stories: HomeCard[];
  viewAllHref?: string;
}) {
  const [lead, ...rest] = stories;
  if (!lead) return null;
  const supporting = rest.slice(0, 3);

  return (
    <AmbientPageBackground
      as="section"
      variant="poster"
      intensity="soft"
      id="featured-stories"
      aria-labelledby="featured-stories-heading"
      className="overflow-hidden py-16 text-brand-overlay lg:py-24"
    >
      <div className="ksu-shell">
        <Reveal className="flex flex-wrap items-end justify-between gap-4">
          <h2 id="featured-stories-heading" className="ksu-l-h2 font-normal">
            Featured stories
          </h2>
          <Link
            href={viewAllHref}
            className={cn(
              "group inline-flex min-h-11 items-center gap-2 font-medium text-secondary",
              focusVisibleStyles.primary,
            )}
          >
            View all stories
            <span
              className="transition-transform duration-300 group-hover:translate-x-1"
              aria-hidden
            >
              →
            </span>
          </Link>
        </Reveal>

        {/* Lead story: full width, copy sitting on the photograph. */}
        <Reveal delay={0.05} className="mt-8">
          <Link
            href={lead.href}
            className={cn(
              "group relative block overflow-hidden rounded-3xl",
              focusVisibleStyles.primary,
            )}
          >
            <ImageCurtainReveal className="relative aspect-[16/10] w-full sm:aspect-[21/9] lg:aspect-[2.6/1]">
              <PublicImage
                src={lead.imageUrl}
                alt=""
                ratio="fill"
                className="absolute inset-0 h-full w-full bg-transparent"
                imageClassName="object-cover transition-transform [transition-duration:900ms] [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] motion-safe:group-hover:scale-[1.04]"
                sizes="100vw"
              />
              <div
                className="absolute inset-0 bg-[linear-gradient(to_top,hsl(var(--brand-overlay)/0.92)_0%,hsl(var(--brand-overlay)/0.55)_38%,hsl(var(--brand-overlay)/0.1)_72%)]"
                aria-hidden
              />
            </ImageCurtainReveal>

            <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8 lg:p-12">
              <div className="max-w-[46rem]">
                <h3 className="ksu-l-h2 font-normal text-white">
                  {lead.title}
                </h3>
                <p className="ksu-l-small mt-3 line-clamp-2 max-w-[58ch] text-white/75">
                  {lead.body}
                </p>
                <div className="mt-5 flex items-center gap-4">
                  {lead.meta ? (
                    <span className="ksu-l-small text-white/60">
                      {lead.meta}
                    </span>
                  ) : null}
                  <span className="ksu-l-small inline-flex items-center gap-1.5 font-medium text-secondary">
                    Read more
                    <ArrowUpRight
                      className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                      aria-hidden
                    />
                  </span>
                </div>
              </div>
            </div>
          </Link>
        </Reveal>

        {/* Supporting stories */}
        {supporting.length > 0 ? (
          <RevealGroup
            as="ul"
            className="mt-6 grid gap-6 sm:grid-cols-3 lg:gap-8"
          >
            {supporting.map((story) => (
              <RevealItem
                as="li"
                key={story.id ?? story.href}
                className="min-w-0"
              >
                <Link
                  href={story.href}
                  className={cn(
                    "group flex h-full min-w-0 flex-col",
                    focusVisibleStyles.primary,
                  )}
                >
                  <ImageCurtainReveal className="relative block aspect-[16/10] w-full overflow-hidden rounded-lg">
                    <PublicImage
                      src={story.imageUrl}
                      alt=""
                      ratio="fill"
                      className="absolute inset-0 h-full w-full bg-transparent"
                      imageClassName="object-cover transition-transform [transition-duration:900ms] [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] motion-safe:group-hover:scale-[1.05]"
                      sizes="(min-width: 640px) 30vw, 100vw"
                    />
                  </ImageCurtainReveal>
                  <span className="mt-4 flex min-w-0 flex-1 flex-col">
                    <h3 className="ksu-l-small line-clamp-3 font-medium transition-colors duration-300 group-hover:text-primary">
                      {story.title}
                    </h3>
                    {story.meta ? (
                      <span className="ksu-l-small mt-2 block text-brand-overlay/55">
                        {story.meta}
                      </span>
                    ) : null}
                  </span>
                </Link>
              </RevealItem>
            ))}
          </RevealGroup>
        ) : null}
      </div>
    </AmbientPageBackground>
  );
}

export default FeaturedStoriesShowcase;
