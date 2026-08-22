"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { cn } from "@ksu/ui/lib/utils";
import { Section, SectionHeader, focusVisibleStyles } from "@ksu/ui/motion";
import { PublicImage } from "@/components/public/public-image";
import type { HomeCard } from "@/lib/homepage-data";

export interface FeaturedStoriesGridProps {
  stories: HomeCard[];
  className?: string;
}

const gridVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: [0, 0, 0.2, 1] as const },
  },
};

export function FeaturedStoriesGrid({
  stories,
  className,
}: FeaturedStoriesGridProps) {
  const reducedMotion = useReducedMotion();
  const displayStories = stories.slice(0, 7);

  if (displayStories.length === 0) return null;

  const heroStory = displayStories[0];
  const secondaryStories = displayStories.slice(1, 3);
  const tertiaryStories = displayStories.slice(3, 7);

  return (
    <Section
      className={cn(
        "border-b border-border bg-gradient-to-b from-accent/40 to-background py-14 lg:py-20",
        className
      )}
    >
      <div className="mx-auto max-w-[1680px] px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
        <SectionHeader
          title="Featured Stories"
          description="Discover the achievements, partnerships, and moments shaping our community"
          align="left"
          actions={
            <Link
              href="/media/stories"
              className={cn(
                "inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-secondary",
                focusVisibleStyles.default
              )}
            >
              View all stories
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          }
        />

        <motion.div
          variants={reducedMotion ? undefined : gridVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          className="mt-10 grid gap-5 lg:grid-cols-12"
        >
          {/* Hero Story - Large */}
          {heroStory && (
            <motion.article
              variants={reducedMotion ? undefined : itemVariants}
              className="group lg:col-span-7 lg:row-span-2"
            >
              <Link
                href={heroStory.href}
                className={cn(
                  "relative block h-full min-h-[400px] overflow-hidden rounded-3xl bg-primary",
                  focusVisibleStyles.default
                )}
              >
                <PublicImage
                  src={heroStory.imageUrl}
                  alt=""
                  ratio="fill"
                  fallbackSrc="/logos/ksu-bck1.jpg"
                  sizes="(min-width: 1024px) 58vw, 100vw"
                  className="absolute inset-0 h-full w-full"
                  imageClassName="object-cover transition-transform duration-500 motion-safe:group-hover:scale-[1.03]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
                  <span className="inline-block rounded-full bg-secondary px-3 py-1 text-xs font-bold text-white">
                    {heroStory.eyebrow ?? "Featured"}
                  </span>
                  <h3 className="mt-4 font-[family-name:var(--font-display)] text-2xl font-bold leading-tight text-white sm:text-3xl lg:text-4xl">
                    {heroStory.title}
                  </h3>
                  <p className="mt-3 line-clamp-2 max-w-xl text-sm leading-relaxed text-white/85 sm:text-base">
                    {heroStory.body}
                  </p>
                  <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-secondary transition group-hover:gap-3">
                    Read story
                    <ArrowRight className="h-4 w-4" aria-hidden />
                  </span>
                </div>
              </Link>
            </motion.article>
          )}

          {/* Secondary Stories */}
          {secondaryStories.map((story) => (
            <motion.article
              key={story.href}
              variants={reducedMotion ? undefined : itemVariants}
              className="group lg:col-span-5"
            >
              <Link
                href={story.href}
                className={cn(
                  "relative block h-full min-h-[220px] overflow-hidden rounded-3xl bg-primary",
                  focusVisibleStyles.default
                )}
              >
                <PublicImage
                  src={story.imageUrl}
                  alt=""
                  ratio="fill"
                  fallbackSrc="/logos/ksu-bck5.jpg"
                  sizes="(min-width: 1024px) 42vw, 100vw"
                  className="absolute inset-0 h-full w-full"
                  imageClassName="object-cover transition-transform duration-500 motion-safe:group-hover:scale-[1.03]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-5">
                  <span className="inline-block rounded-full bg-white/20 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-white backdrop-blur-sm">
                    {story.eyebrow ?? "Story"}
                  </span>
                  <h3 className="mt-3 line-clamp-2 font-[family-name:var(--font-display)] text-lg font-bold leading-tight text-white sm:text-xl">
                    {story.title}
                  </h3>
                  <span className="mt-3 inline-flex items-center gap-2 text-xs font-bold text-secondary">
                    Read more
                    <ArrowRight className="h-3 w-3" aria-hidden />
                  </span>
                </div>
              </Link>
            </motion.article>
          ))}

          {/* Tertiary Stories Grid */}
          {tertiaryStories.length > 0 && (
            <div className="grid gap-5 sm:grid-cols-2 lg:col-span-12 lg:grid-cols-4">
              {tertiaryStories.map((story) => (
                <motion.article
                  key={story.href}
                  variants={reducedMotion ? undefined : itemVariants}
                  className="group"
                >
                  <Link
                    href={story.href}
                    className={cn(
                      "block overflow-hidden rounded-3xl border border-border bg-white shadow-sm transition-shadow duration-200 hover:shadow-md active:scale-[0.98]",
                      focusVisibleStyles.default
                    )}
                  >
                    <PublicImage
                      src={story.imageUrl}
                      alt=""
                      ratio="card"
                      fallbackSrc="/logos/ksu-bck1.jpg"
                      sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                      className="h-36"
                      imageClassName="object-cover transition-transform duration-500 motion-safe:group-hover:scale-[1.03]"
                    />
                    <div className="p-4">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-secondary">
                        {story.eyebrow ?? "Story"}
                      </span>
                      <h3 className="mt-2 line-clamp-2 font-[family-name:var(--font-display)] text-base font-bold leading-tight text-foreground transition group-hover:text-primary">
                        {story.title}
                      </h3>
                      {story.meta && (
                        <p className="mt-2 text-xs text-muted-foreground">
                          {story.meta}
                        </p>
                      )}
                    </div>
                  </Link>
                </motion.article>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </Section>
  );
}

export default FeaturedStoriesGrid;
