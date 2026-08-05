"use client";

import { ArrowRight, FlaskConical } from "lucide-react";
import { cn } from "@ksu/ui/lib/utils";
import { focusVisibleStyles } from "@ksu/ui/motion";
import { PublicImage } from "@/components/public/public-image";
import { Reveal } from "@/components/home/reveal";
import { researchFrontendUrl } from "@/lib/service-urls";

export interface ResearchThemeDisplay {
  id: string;
  name: string;
  description?: string | null;
  imageUrl?: string | null;
  href: string;
}

export interface FeaturedProjectDisplay {
  title: string;
  summary?: string | null;
  status?: string | null;
  href: string;
}

/**
 * Research themes and the featured project on the ink ground: a centred
 * serif invitation, numbered theme tiles, and one elevated project panel.
 */
export function ResearchHighlightsSection({
  themes,
  featuredProject,
}: {
  themes: ResearchThemeDisplay[];
  featuredProject: FeaturedProjectDisplay | null;
}) {

  if (themes.length === 0 && !featuredProject) return null;

  return (
    <section
      id="research-highlights"
      aria-labelledby="research-highlights-heading"
      className="relative z-10 -mt-[28px] overflow-hidden rounded-t-[28px] text-white"
      style={{ backgroundColor: "hsl(var(--brand-overlay))" }}
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(55%_70%_at_80%_10%,hsl(var(--secondary)/0.14),transparent_65%)]"
        aria-hidden
      />
      <div className="relative mx-auto max-w-[1680px] px-4 pb-20 pt-12 sm:px-6 sm:pb-24 lg:px-8 lg:pb-28 lg:pt-16 xl:px-10 2xl:px-12">
        {/* Centred invitation */}
        <Reveal amount={0.3}
          className="mx-auto max-w-2xl text-center"
        >
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-secondary">
            Research &amp; innovation
          </p>
          <h2
            id="research-highlights-heading"
            className="mt-3 text-balance font-[family-name:var(--font-display)] text-3xl font-normal leading-tight sm:text-4xl lg:text-5xl"
          >
            Research that answers <em className="italic">real questions.</em>
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-sm leading-6 text-white/70 md:text-base md:leading-7">
            From food security to public health, our researchers work on the
            questions that matter to Kenya and the region.
          </p>
        </Reveal>

        <div className="mx-auto mt-10 grid max-w-6xl gap-6 lg:mt-12 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
          {/* Numbered theme tiles */}
          {themes.length > 0 && (
            <div className="grid gap-3 sm:grid-cols-2">
              {themes.slice(0, 4).map((theme, index) => (
                <Reveal key={theme.id} delay={index * 70} amount={0.35}><a
                  href={theme.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    "group relative flex min-h-[170px] flex-col justify-between overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-5 transition-colors duration-200 hover:border-white/35",
                    focusVisibleStyles.white,
                  )}
                >
                  {theme.imageUrl ? (
                    <>
                      <PublicImage
                        src={theme.imageUrl}
                        alt=""
                        ratio="fill"
                        className="absolute inset-0 h-full w-full"
                        imageClassName="object-cover opacity-50 transition-transform duration-500 ease-out motion-safe:group-hover:scale-[1.03]"
                        sizes="(min-width: 1024px) 30vw, 50vw"
                      />
                      <div
                        className="absolute inset-0 bg-[linear-gradient(to_top,hsl(var(--brand-overlay)/0.92)_10%,hsl(var(--brand-overlay)/0.45)_60%,hsl(var(--brand-overlay)/0.2)_100%)]"
                        aria-hidden
                      />
                    </>
                  ) : null}
                  <div className="relative flex items-start justify-between">
                    <span className="font-[family-name:var(--font-display)] text-sm font-medium text-secondary">
                      0{index + 1}
                    </span>
                    <ArrowRight
                      className="h-4 w-4 text-white/30 transition-transform duration-200 group-hover:translate-x-1 group-hover:text-white"
                      aria-hidden
                    />
                  </div>
                  <div className="relative">
                    <h3 className="font-[family-name:var(--font-display)] text-lg font-medium leading-snug md:text-xl">
                      {theme.name}
                    </h3>
                    {theme.description ? (
                      <p className="mt-1.5 line-clamp-2 text-sm leading-6 text-white/65">
                        {theme.description}
                      </p>
                    ) : null}
                  </div>
                </a></Reveal>
              ))}
            </div>
          )}

          {/* Featured project */}
          {featuredProject ? (
            <Reveal as="aside" delay={120} amount={0.35}
              className="flex flex-col rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm lg:p-8"
              aria-label="Featured research project"
            >
              <div className="flex items-center gap-2.5">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary/20 text-secondary">
                  <FlaskConical className="h-4 w-4" aria-hidden />
                </span>
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-white/70">
                  Featured project
                </p>
                {featuredProject.status ? (
                  <span className="ml-auto rounded-full border border-secondary/40 px-2.5 py-0.5 text-[11px] font-semibold capitalize text-secondary">
                    {featuredProject.status}
                  </span>
                ) : null}
              </div>
              <h3 className="mt-5 font-[family-name:var(--font-display)] text-xl font-medium leading-snug sm:text-2xl">
                {featuredProject.title}
              </h3>
              {featuredProject.summary ? (
                <p className="mt-3 text-sm leading-7 text-white/70">
                  {featuredProject.summary}
                </p>
              ) : null}
              <a
                href={featuredProject.href}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "group mt-auto inline-flex min-h-11 items-center gap-2 pt-6 text-sm font-semibold text-secondary transition-colors duration-200 hover:text-white",
                  focusVisibleStyles.white,
                )}
              >
                Explore the project
                <ArrowRight
                  className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1"
                  aria-hidden
                />
              </a>
            </Reveal>
          ) : null}
        </div>

        {/* Centred hub CTA */}
        <div className="mt-10 text-center lg:mt-12">
          <a
            href={researchFrontendUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-primary transition-[background-color,transform] duration-200 hover:bg-white/90 active:scale-[0.98]",
              focusVisibleStyles.white,
            )}
          >
            Visit the research hub
            <ArrowRight className="h-4 w-4" aria-hidden />
          </a>
        </div>
      </div>
    </section>
  );
}

export default ResearchHighlightsSection;
