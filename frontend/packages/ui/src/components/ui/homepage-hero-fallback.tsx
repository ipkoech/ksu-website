"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "./button";
import { cn } from "../../lib/utils";

interface HeroAction {
  label: string;
  href: string;
}

interface HomepageHeroFallbackProps {
  tagline?: string;
  title: string;
  subtitle?: string;
  backgroundImageSrc?: string;
  primaryAction: HeroAction;
  secondaryAction?: HeroAction;
  className?: string;
}

export function HomepageHeroFallback({
  tagline,
  title,
  subtitle,
  backgroundImageSrc = "/logos/ksu-bck5.jpg",
  primaryAction,
  secondaryAction,
  className,
}: HomepageHeroFallbackProps) {
  return (
    <section
      className={cn(
        "relative h-[85vh] min-h-[600px] overflow-hidden",
        className,
      )}
    >
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={backgroundImageSrc}
          alt=""
          className="h-full w-full object-cover object-center"
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/70 via-slate-950/50 to-slate-950/30" />
      </div>

      {/* Content */}
      <div className="relative flex h-full items-center">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-16 2xl:px-24">
          <div className="max-w-4xl">
            {tagline && (
              <p className="animate-fade-up text-sm font-medium uppercase tracking-[0.25em] text-secondary sm:text-base">
                {tagline}
              </p>
            )}

            <h1 className="animate-fade-up animation-delay-100 mt-4 font-[family-name:var(--font-display)] text-5xl font-bold leading-[1.1] text-white sm:text-6xl lg:text-7xl xl:text-8xl">
              {title}
            </h1>

            {subtitle && (
              <p className="animate-fade-up animation-delay-200 mt-6 max-w-2xl text-lg leading-relaxed text-white/80 sm:text-xl">
                {subtitle}
              </p>
            )}

            <div className="animate-fade-up animation-delay-300 mt-10 flex flex-wrap gap-4">
              <Button
                size="lg"
                asChild
                className="group rounded-full bg-secondary px-8 py-6 text-base font-semibold text-white hover:bg-secondary/90"
              >
                <Link href={primaryAction.href}>
                  {primaryAction.label}
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              {secondaryAction && (
                <Button
                  size="lg"
                  variant="ghost"
                  asChild
                  className="rounded-full px-8 py-6 text-base font-semibold text-white hover:bg-white/10"
                >
                  <Link href={secondaryAction.href}>
                    {secondaryAction.label}
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="h-14 w-8 rounded-full border-2 border-white/30 p-2">
          <div className="h-3 w-1 mx-auto rounded-full bg-white/60 animate-pulse" />
        </div>
      </div>
    </section>
  );
}
