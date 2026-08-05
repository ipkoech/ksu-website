"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@ksu/ui/lib/utils";
import { focusVisibleStyles } from "@ksu/ui/motion";
import { PublicImage } from "@/components/public/public-image";
import { Reveal } from "@/components/home/reveal";
import type { HomeLeader } from "@/lib/homepage-data";

const speechImage = "/images/Home/vc-speech.jpg";

/** First sentence becomes the pull-quote; the rest supports it. */
function splitMessage(message: string): [string, string | null] {
  const match = message.match(/^(.+?[.!?])\s+([\s\S]+)$/);
  if (!match) return [message, null];
  return [match[1], match[2]];
}

/**
 * The Vice-Chancellor's message as a premium editorial moment: an oversized
 * serif pull-quote beside the address photograph, with the portrait held in
 * a floating caption card.
 */
export function VcWelcomeSection({ leader }: { leader: HomeLeader | null }) {

  if (!leader?.message) return null;
  const [pullQuote, supporting] = splitMessage(leader.message);

  return (
    <section
      aria-labelledby="vc-welcome-heading"
      className="relative z-10 -mt-[28px] overflow-hidden rounded-t-[28px] bg-white py-12 lg:py-20"
    >
      <h2 id="vc-welcome-heading" className="sr-only">
        A message from the Vice-Chancellor
      </h2>
      <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
        <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-20">
          {/* The words */}
          <Reveal amount={0.3}
          >
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-secondary">
              From the Vice-Chancellor
            </p>
            <div
              className="mt-6 font-[family-name:var(--font-display)] text-[80px] leading-[0] text-primary/20 lg:text-[110px]"
              aria-hidden
            >
              &ldquo;
            </div>
            <blockquote className="mt-8">
              <p className="text-balance font-[family-name:var(--font-display)] text-2xl font-normal italic leading-[1.25] text-brand-overlay sm:text-3xl lg:text-4xl">
                {pullQuote}
              </p>
              {supporting ? (
                <p className="mt-6 line-clamp-4 max-w-xl text-base leading-7 text-muted-foreground md:text-[17px] md:leading-8">
                  {supporting}
                </p>
              ) : null}
            </blockquote>

            <div className="mt-8 flex items-center gap-4">
              <span className="h-px w-12 bg-secondary" aria-hidden />
              <div>
                <p className="font-[family-name:var(--font-display)] text-lg font-medium text-brand-overlay">
                  {leader.name}
                </p>
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  {leader.title}
                </p>
              </div>
            </div>

            <Link
              href={leader.href ?? "/about/vice-chancellor"}
              className={cn(
                "group mt-8 inline-flex min-h-11 items-center gap-2 rounded-full bg-brand-overlay px-6 py-2.5 text-sm font-semibold text-white transition-[background-color,transform] duration-200 hover:bg-brand-overlay/90 active:scale-[0.98]",
                focusVisibleStyles.primary,
              )}
            >
              Read the full message
              <ArrowRight
                className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1"
                aria-hidden
              />
            </Link>
          </Reveal>

          {/* The address */}
          <Reveal as="figure" delay={120} amount={0.3}
            className="relative"
          >
            <div className="relative aspect-[4/5] overflow-hidden rounded-2xl sm:aspect-[5/6]">
              <PublicImage
                src={speechImage}
                alt={`${leader.name} addressing the university`}
                ratio="fill"
                className="absolute inset-0 h-full w-full"
                imageClassName="object-cover"
                sizes="(min-width: 1024px) 45vw, 100vw"
              />
              <div
                className="absolute inset-0 bg-[linear-gradient(to_top,hsl(var(--brand-overlay)/0.55)_0%,transparent_40%)]"
                aria-hidden
              />
            </div>

            {/* Floating portrait caption card */}
            <figcaption className="absolute -bottom-6 left-5 right-5 sm:left-8 sm:right-auto">
              <div className="flex items-center gap-4 rounded-2xl bg-white p-3 pr-6 shadow-xl shadow-primary/15 ring-1 ring-primary/10">
                <span className="relative block h-14 w-14 shrink-0 overflow-hidden rounded-xl">
                  <PublicImage
                    src={leader.image ?? "/images/Home/VCProfSUKUBA.jpg"}
                    alt=""
                    ratio="fill"
                    className="absolute inset-0 h-full w-full"
                    imageClassName="object-cover object-top"
                    sizes="56px"
                  />
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold text-brand-overlay">
                    {leader.name}
                  </span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {leader.title}
                  </span>
                </span>
              </div>
            </figcaption>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

export default VcWelcomeSection;
