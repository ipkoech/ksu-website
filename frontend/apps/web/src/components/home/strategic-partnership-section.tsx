"use client";

import Link from "next/link";
import { ArrowUpRight, GraduationCap } from "lucide-react";
import { cn } from "@ksu/ui/lib/utils";
import { AmbientPageBackground } from "@ksu/ui";
import { focusVisibleStyles } from "@ksu/ui/motion";
import { PublicImage } from "@/components/public/public-image";
import { Reveal } from "@/components/home/motion-primitives";
import { ImageCurtainReveal } from "@/components/about/image-curtain-reveal";

export interface PartnershipOpportunity {
  id: string;
  title: string;
  summary?: string | null;
  href: string;
  closesAt?: string | null;
}

export interface PartnershipSpotlightContent {
  headline?: string;
  statement?: string;
  summary?: string;
  imageUrl?: string;
  imageAlt?: string;
  cta?: { label: string; href: string };
  /** Open scholarships and calls published by the Chair. */
  opportunities?: PartnershipOpportunity[];
}

/**
 * Fallbacks describing what HERI Africa actually is.
 *
 * The Chair is a Language Education Research Centre of Excellence, so the
 * copy here mirrors the vision and mission published on the HERI About page
 * rather than the generic innovation-and-entrepreneurship line this section
 * carried before, which described a different organisation entirely.
 */
const defaults = {
  headline: "Kisii University × HERI Africa",
  statement: "Language Education Research Chair",
  summary:
    "HERI Africa Language Education Research Chair advances foundational literacy and policy-responsive research: an Africa-led Centre of Excellence working for educational transformation across the continent and beyond.",
  imageAlt:
    "The HERI Africa Language Education Research Chair at Kisii University",
  imageUrl: "/images/landing-page/heri-africa-landing.jpg",
};

/**
 * The signature institutional partnership.
 *
 * Copy on the warm poster ground at the left, one photograph running to the
 * right edge behind a curtain that clears from top to bottom as the section
 * arrives. Deliberately
 * the only partnership given a full section: the general partner logos are a
 * validation rail much further down the page.
 */
export function StrategicPartnershipSection({
  spotlight,
}: {
  spotlight?: PartnershipSpotlightContent;
}) {
  /* Field-level fallback: CMS fields arrive explicitly undefined, and a bare
     spread would let them clobber the defaults. */
  const content = {
    headline: spotlight?.headline?.trim() || defaults.headline,
    statement: spotlight?.statement?.trim() || defaults.statement,
    summary: spotlight?.summary?.trim() || defaults.summary,
    imageUrl: spotlight?.imageUrl || defaults.imageUrl,
    imageAlt: spotlight?.imageAlt?.trim() || defaults.imageAlt,
  };
  const cta = spotlight?.cta;
  const opportunities = (spotlight?.opportunities ?? []).slice(0, 2);

  return (
    <AmbientPageBackground
      as="section"
      variant="poster"
      intensity="soft"
      id="strategic-partnership"
      aria-labelledby="partnership-heading"
      className="overflow-hidden"
    >
      <div className="mx-auto grid max-w-[1680px] items-stretch lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        {/* Copy */}
        <div className="min-w-0 px-5 pb-14 pt-14 sm:px-8 lg:py-24 lg:pl-12 lg:pr-16 xl:pl-16">
          <Reveal>
            <h2
              id="partnership-heading"
              className="text-balance text-[clamp(1.625rem,1rem+1.6vw,2.35rem)] font-normal leading-[1.15] tracking-[-0.01em] text-brand-overlay"
            >
              {content.headline}
            </h2>
            <p className="ksu-l-card mt-3 text-[hsl(var(--secondary-ink))]">
              {content.statement}
            </p>
            <p className="mt-6 max-w-[54ch] text-brand-overlay/80">
              {content.summary}
            </p>
          </Reveal>

          {/* Open calls from the Chair, when there are any. */}
          {opportunities.length > 0 ? (
            <Reveal delay={0.08} className="mt-8">
              <h3 className="ksu-l-small font-medium text-brand-overlay/70">
                Open scholarships and calls
              </h3>
              <ul className="mt-3 space-y-2">
                {opportunities.map((item) => (
                  <li key={item.id} className="min-w-0">
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn(
                        "group flex min-h-11 items-start gap-3 rounded-lg border border-brand-overlay/12 bg-white/70 p-4 transition-colors duration-300 hover:border-[hsl(var(--secondary))]/50 hover:bg-white",
                        focusVisibleStyles.primary,
                      )}
                    >
                      <GraduationCap
                        className="mt-0.5 h-4 w-4 shrink-0 text-[hsl(var(--secondary-ink))]"
                        aria-hidden
                      />
                      <span className="min-w-0 flex-1">
                        <span className="ksu-l-small block font-medium transition-colors duration-300 group-hover:text-primary">
                          {item.title}
                        </span>
                        {item.closesAt ? (
                          <span className="ksu-l-small mt-0.5 block text-brand-overlay/55">
                            Closes {item.closesAt}
                          </span>
                        ) : null}
                      </span>
                      <ArrowUpRight
                        className="mt-0.5 h-4 w-4 shrink-0 text-brand-overlay/25 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[hsl(var(--secondary-ink))]"
                        aria-hidden
                      />
                    </a>
                  </li>
                ))}
              </ul>
            </Reveal>
          ) : null}

          {cta ? (
            <Reveal delay={0.12}>
              <ExternalCta {...cta} />
            </Reveal>
          ) : null}
        </div>

        {/* Photograph, revealed from top to bottom as it enters the viewport. */}
        <ImageCurtainReveal className="min-h-[18rem] sm:min-h-[24rem] lg:min-h-[34rem]">
          <PublicImage
            src={content.imageUrl}
            alt={content.imageAlt}
            ratio="fill"
            className="absolute inset-0 h-full w-full bg-transparent"
            imageClassName="object-cover"
            sizes="(min-width: 1024px) 55vw, 100vw"
          />
        </ImageCurtainReveal>
      </div>
    </AmbientPageBackground>
  );
}

/** The one CTA. External, and says so. */
function ExternalCta({ label, href }: { label: string; href: string }) {
  const external = /^https?:\/\//.test(href);
  const className = cn(
    "group mt-10 inline-flex min-h-11 items-center gap-2 rounded-lg bg-secondary px-7 py-3 font-medium text-white transition-[background-color,transform] duration-200 hover:bg-[hsl(var(--secondary))]/90 active:scale-[0.99]",
    focusVisibleStyles.primary,
  );
  const inner = (
    <>
      {label}
      <ArrowUpRight
        className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
        aria-hidden
      />
    </>
  );

  return external ? (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
    >
      {inner}
      <span className="sr-only">(opens in a new tab)</span>
    </a>
  ) : (
    <Link href={href} className={className}>
      {inner}
    </Link>
  );
}

export default StrategicPartnershipSection;
