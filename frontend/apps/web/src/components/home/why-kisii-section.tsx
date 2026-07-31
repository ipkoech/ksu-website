"use client";

import Link from "next/link";
import { useMemo } from "react";
import {
  ArrowRight,
  Globe2,
  GraduationCap,
  Handshake,
  Lightbulb,
  Users,
  type LucideIcon,
} from "lucide-react";
import { Reveal } from "@/components/home/motion-reveal";
import { ImageCurtainReveal } from "@/components/about/image-curtain-reveal";
import { SectionFadeIn } from "@/components/home/section-fade-in";
import type {
  HomepageSection,
  HomepageSectionItem,
} from "@/lib/homepage-sections";
import { PublicImage } from "@/components/public/public-image";

type WhyKisiiSectionProps = {
  section: HomepageSection;
  factsSection?: HomepageSection | null;
};

const reasonIcons: Record<string, LucideIcon> = {
  academic: GraduationCap,
  excellence: GraduationCap,
  teaching: GraduationCap,
  partnership: Handshake,
  partnerships: Handshake,
  community: Handshake,
  research: Lightbulb,
  innovation: Lightbulb,
  student: Users,
  students: Users,
  inclusion: Globe2,
  inclusivity: Globe2,
};

export function WhyKisiiSection({ section }: WhyKisiiSectionProps) {
  const reasons = useMemo(
    () => displayItems(section).slice(0, 4),
    [section],
  );

  if (reasons.length === 0) return null;

  return (
    <section
      id={section.section_key}
      className="overflow-hidden border-b border-border bg-white py-12 lg:py-16"
    >
      <div className="mx-auto max-w-[1680px] px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
        {/* Story opening */}
        <SectionFadeIn className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-secondary">
            {section.subtitle ?? "Why choose KSU"}
          </p>
          <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-bold leading-tight text-primary sm:text-4xl">
            {section.title ?? "Why Kisii University?"}
          </h2>
          {section.description ? (
            <p className="mx-auto mt-3 max-w-2xl text-base leading-7 text-muted-foreground">
              {section.description}
            </p>
          ) : null}
        </SectionFadeIn>

        {/* The chapters — each driver unfolds as its own scene */}
        <div className="mt-10 space-y-10 lg:mt-12 lg:space-y-14">
          {reasons.map((item, index) => (
            <WhyChapter key={item.id} item={item} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}

function WhyChapter({
  item,
  index,
}: {
  item: HomepageSectionItem;
  index: number;
}) {
  const imageLeft = index % 2 === 0;
  const Icon = reasonIcon(item, index);
  const imageSrc = contentText(item, "imageUrl");
  const imageAlt =
    contentText(item, "imageAlt") ??
    item.media_alt_text ??
    item.title ??
    "Kisii University";

  return (
    <div className="grid items-center gap-6 lg:grid-cols-2 lg:gap-12">
      {/* The scene — symmetric image, curtain sweeps toward the words */}
      <div className={imageLeft ? "" : "lg:order-2"}>
        <ImageCurtainReveal
          className="aspect-[16/9] rounded-2xl"
          direction={imageLeft ? "right" : "left"}
        >
          <PublicImage
            src={imageSrc ?? "/logos/ksu-bck1.jpg"}
            alt={imageAlt}
            ratio="fill"
            priority={index === 0}
            className="absolute inset-0 h-full w-full"
            imageClassName="object-cover"
            sizes="(min-width: 1024px) 50vw, 100vw"
          />
        </ImageCurtainReveal>
      </div>

      {/* The words — arrive as the curtain settles */}
      <Reveal
        variant={imageLeft ? "fade-left" : "fade-right"}
        delay={300}
        className={imageLeft ? "" : "lg:order-1"}
      >
        <div className="flex items-center gap-3">
          <span className="font-[family-name:var(--font-display)] text-sm font-bold text-secondary">
            {String(index + 1).padStart(2, "0")}
          </span>
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent text-primary ring-1 ring-border">
            <Icon className="h-4 w-4" aria-hidden />
          </span>
        </div>
        <h3 className="mt-3 max-w-xl font-[family-name:var(--font-display)] text-xl font-bold leading-tight text-primary sm:text-2xl">
          {item.title ?? "Kisii University advantage"}
        </h3>
        <p className="mt-3 max-w-xl text-base leading-7 text-muted-foreground">
          {item.body_text ?? item.subtitle}
        </p>
        {item.cta_url ? (
          <Link
            href={item.cta_url}
            className="group mt-3 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-primary transition hover:text-secondary"
          >
            {item.cta_label ?? "Learn more"}
            <ArrowRight
              className="h-4 w-4 transition group-hover:translate-x-1"
              aria-hidden
            />
          </Link>
        ) : null}
      </Reveal>
    </div>
  );
}

function displayItems(section?: HomepageSection | null) {
  return (section?.items ?? [])
    .filter((item) => item.is_enabled !== false)
    .sort(
      (first, second) =>
        (first.display_order ?? 100) - (second.display_order ?? 100),
    );
}

function reasonIcon(item: HomepageSectionItem, index: number): LucideIcon {
  const key = contentText(item, "icon")?.toLowerCase();
  const fallbacks = [GraduationCap, Lightbulb, Handshake, Globe2];
  return (key && reasonIcons[key]) || fallbacks[index % fallbacks.length];
}

function contentText(item: HomepageSectionItem | undefined, key: string) {
  const value = item?.content?.[key];
  return typeof value === "string" && value.trim() ? value : undefined;
}
