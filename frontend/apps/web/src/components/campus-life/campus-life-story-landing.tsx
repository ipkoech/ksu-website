"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, ChevronDown } from "lucide-react";
import { cn } from "@ksu/ui/lib/utils";
import { ImageCurtainReveal } from "@/components/about/image-curtain-reveal";
import { SectionFadeIn } from "@/components/home/section-fade-in";
import { Reveal, RevealGroup } from "@/components/home/motion-reveal";
import { PublicImage } from "@/components/public/public-image";
import {
  studentLifeCategories,
  studentLifeClosingGallery,
  studentLifeHero,
  type StudentLifeCategory,
  type StudentLifeStoryCard,
} from "@/components/campus-life/student-life-content";

export function CampusLifeStoryLanding() {
  return (
    <div className="bg-white">
      <StoryHero />
      <CategoryNav />
      <div>
        {studentLifeCategories.map((category, index) => (
          <StoryChapter key={category.id} category={category} index={index} />
        ))}
      </div>
      <ClosingGallery />
    </div>
  );
}

/* ------------------------------ Hero ------------------------------ */

function StoryHero() {
  return (
    <section className="relative isolate h-[55vh] min-h-[420px] max-h-[640px] overflow-hidden bg-primary text-white">
      <PublicImage
        src={studentLifeHero.image}
        alt={studentLifeHero.imageAlt}
        ratio="fill"
        priority
        className="absolute inset-0 h-full w-full"
        imageClassName="object-cover"
        sizes="100vw"
      />
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent"
        aria-hidden
      />
      <div className="relative z-10 mx-auto flex h-full max-w-[1680px] items-end px-4 pb-14 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
        <div className="max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-secondary">
            Campus Life
          </p>
          <h1 className="mt-3 text-balance font-[family-name:var(--font-display)] text-4xl font-bold leading-[1.05] sm:text-5xl lg:text-6xl">
            {studentLifeHero.title}
          </h1>
          <p className="mt-4 max-w-xl text-base leading-7 text-white/90">
            {studentLifeHero.intro}
          </p>
          <Link
            href={`/stories/${studentLifeHero.storySlug}`}
            className="group mt-5 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-secondary transition hover:text-white"
          >
            Read the semester story
            <ArrowRight
              className="h-4 w-4 transition group-hover:translate-x-1"
              aria-hidden
            />
          </Link>
        </div>
      </div>
      <div
        className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 text-white/70 motion-safe:animate-bounce"
        aria-hidden
      >
        <ChevronDown className="h-6 w-6" />
      </div>
    </section>
  );
}

/* --------------------------- Category nav ------------------------- */

function CategoryNav() {
  const [active, setActive] = useState<string>(studentLifeCategories[0].id);

  useEffect(() => {
    const sections = studentLifeCategories
      .map((category) => document.getElementById(category.id))
      .filter((el): el is HTMLElement => el !== null);
    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActive(visible.target.id);
      },
      { rootMargin: "-30% 0px -55% 0px", threshold: [0, 0.2, 0.5] },
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  return (
    <nav
      aria-label="Student life categories"
      className="sticky top-[var(--public-header-offset,96px)] z-30 border-b border-border bg-white/95 backdrop-blur"
    >
      <div className="mx-auto max-w-[1680px] px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
        <div className="-mx-1 flex snap-x items-center gap-1 overflow-x-auto px-1 py-3">
          {studentLifeCategories.map((category) => (
            <a
              key={category.id}
              href={`#${category.id}`}
              className={cn(
                "inline-flex min-h-9 shrink-0 snap-start items-center rounded-full px-4 text-xs font-semibold transition sm:text-sm",
                active === category.id
                  ? "bg-primary text-white"
                  : "text-muted-foreground hover:bg-accent hover:text-primary",
              )}
            >
              {category.label}
            </a>
          ))}
        </div>
      </div>
    </nav>
  );
}

/* ----------------------------- Chapters ---------------------------- */

function StoryChapter({
  category,
  index,
}: {
  category: StudentLifeCategory;
  index: number;
}) {
  const imageLeft = index % 2 === 0;
  const gallery = category.stories.flatMap((story) => story.gallery ?? []);

  return (
    <section
      id={category.id}
      className={cn(
        "scroll-mt-36 border-b border-border py-12 lg:py-16",
        index % 2 === 0 ? "bg-white" : "bg-surface-subtle",
      )}
    >
      <SectionFadeIn className="mx-auto max-w-[1680px] px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
        {/* Chapter scene */}
        <div className="grid items-center gap-6 lg:grid-cols-2 lg:gap-12">
          <div className={imageLeft ? "" : "lg:order-2"}>
            <ImageCurtainReveal
              className="aspect-[16/9] rounded-2xl"
              direction="down"
            >
              <PublicImage
                src={category.image}
                alt={category.imageAlt}
                ratio="fill"
                className="absolute inset-0 h-full w-full"
                imageClassName="object-cover"
                sizes="(min-width: 1024px) 50vw, 100vw"
              />
            </ImageCurtainReveal>
          </div>
          <Reveal
            variant={imageLeft ? "fade-left" : "fade-right"}
            delay={250}
            className={imageLeft ? "" : "lg:order-1"}
          >
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-secondary">
              {String(index + 1).padStart(2, "0")} · {category.label}
            </p>
            <h2 className="mt-3 max-w-xl font-[family-name:var(--font-display)] text-2xl font-bold leading-tight text-primary sm:text-3xl">
              {category.title}
            </h2>
            <p className="mt-3 max-w-xl text-base leading-7 text-muted-foreground">
              {category.narrative}
            </p>
            {category.exploreHref ? (
              <Link
                href={category.exploreHref}
                className="group mt-4 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-primary transition hover:text-secondary"
              >
                {category.exploreLabel ?? "Explore"}
                <ArrowRight
                  className="h-4 w-4 transition group-hover:translate-x-1"
                  aria-hidden
                />
              </Link>
            ) : null}
          </Reveal>
        </div>

        {/* Chapter stories */}
        {category.stories.length ? (
          <RevealGroup
            variant="fade-up"
            staggerDelay={120}
            className={cn(
              "mt-10 grid gap-6",
              category.stories.length > 1 ? "sm:grid-cols-2" : "sm:max-w-2xl",
            )}
          >
            {category.stories.map((story) => (
              <StoryCard key={story.slug} story={story} label={category.label} />
            ))}
          </RevealGroup>
        ) : null}

        {/* Activity strip */}
        {gallery.length ? (
          <Reveal variant="fade-up" delay={150} className="mt-8">
            <div className="-mx-1 flex snap-x gap-4 overflow-x-auto px-1 pb-2">
              {gallery.map((src) => (
                <div
                  key={src}
                  className="relative h-40 w-64 shrink-0 snap-start overflow-hidden rounded-xl bg-accent sm:h-44 sm:w-72"
                >
                  <PublicImage
                    src={src}
                    alt={`${category.label} at Kisii University`}
                    ratio="fill"
                    className="absolute inset-0 h-full w-full"
                    imageClassName="object-cover transition duration-500 hover:scale-105"
                    sizes="288px"
                  />
                </div>
              ))}
            </div>
          </Reveal>
        ) : null}
      </SectionFadeIn>
    </section>
  );
}

function StoryCard({
  story,
  label,
}: {
  story: StudentLifeStoryCard;
  label: string;
}) {
  return (
    <Link href={`/stories/${story.slug}`} className="group block">
      <div className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-accent">
        <PublicImage
          src={story.cover}
          alt={story.title}
          ratio="fill"
          className="absolute inset-0 h-full w-full"
          imageClassName="object-cover transition duration-500 group-hover:scale-105"
          sizes="(min-width: 640px) 50vw, 100vw"
        />
        <span className="absolute left-4 top-4 rounded-full bg-secondary px-3 py-1 text-[11px] font-bold uppercase tracking-[0.08em] text-white">
          {label}
        </span>
      </div>
      <h3 className="mt-4 font-[family-name:var(--font-display)] text-lg font-semibold leading-tight text-foreground group-hover:text-primary">
        {story.title}
      </h3>
      <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">
        {story.excerpt}
      </p>
      <span className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-secondary">
        Read story
        <ArrowRight
          className="h-4 w-4 transition group-hover:translate-x-1"
          aria-hidden
        />
      </span>
    </Link>
  );
}

/* -------------------------- Closing gallery ------------------------ */

function ClosingGallery() {
  return (
    <section className="bg-primary py-12 text-white lg:py-16">
      <SectionFadeIn className="mx-auto max-w-[1680px] px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold sm:text-3xl">
            {studentLifeClosingGallery.title}
          </h2>
          <Link
            href="/stories"
            className="group inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-secondary transition hover:text-white"
          >
            Explore all stories
            <ArrowRight
              className="h-4 w-4 transition group-hover:translate-x-1"
              aria-hidden
            />
          </Link>
        </div>
        <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {studentLifeClosingGallery.images.map((src) => (
            <div
              key={src}
              className="relative aspect-[4/3] overflow-hidden rounded-xl bg-white/10"
            >
              <PublicImage
                src={src}
                alt="Student life at Kisii University"
                ratio="fill"
                className="absolute inset-0 h-full w-full"
                imageClassName="object-cover transition duration-500 hover:scale-105"
                sizes="(min-width: 1024px) 25vw, 50vw"
              />
            </div>
          ))}
        </div>
      </SectionFadeIn>
    </section>
  );
}
