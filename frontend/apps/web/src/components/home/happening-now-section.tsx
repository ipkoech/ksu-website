"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, CalendarDays } from "lucide-react";
import { cn } from "@ksu/ui/lib/utils";
import { focusVisibleStyles } from "@ksu/ui/motion";
import { PublicImage } from "@/components/public/public-image";
import type { HomeCard } from "@/lib/homepage-data";

export interface HappeningNowSectionProps {
  newsItems: HomeCard[];
  events: HomeCard[];
  blog: HomeCard | null;
}

const revealTransition = {
  duration: 0.5,
  ease: [0.16, 1, 0.3, 1] as const,
};

export function HappeningNowSection({
  newsItems,
  events,
  blog,
}: HappeningNowSectionProps) {
  const reducedMotion = useReducedMotion();
  const news = newsItems.slice(0, 3);
  const upcoming = events.slice(0, 3);

  if (news.length === 0 && upcoming.length === 0 && !blog) return null;

  return (
    <section
      aria-labelledby="happening-heading"
      className="border-b border-border bg-accent/30 py-16 lg:py-24"
    >
      <div className="mx-auto max-w-[1680px] px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-secondary">
              Happening now
            </p>
            <h2
              id="happening-heading"
              className="mt-3 font-[family-name:var(--font-display)] text-3xl font-bold leading-tight text-primary sm:text-4xl"
            >
              The pulse of the university
            </h2>
          </div>
          <Link
            href="/news"
            className={cn(
              "group inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-primary transition hover:text-secondary",
              focusVisibleStyles.primary
            )}
          >
            All news
            <ArrowRight
              className="h-4 w-4 transition group-hover:translate-x-1"
              aria-hidden
            />
          </Link>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          {/* News */}
          {news.length > 0 && (
            <div className="grid gap-5 sm:grid-cols-2">
              {news.map((item, index) => (
                <motion.article
                  key={item.id ?? item.href}
                  className={cn(
                    "group overflow-hidden rounded-3xl border border-border bg-white transition-colors hover:border-primary",
                    index === 0 && "sm:col-span-2"
                  )}
                  initial={reducedMotion ? undefined : { opacity: 0, y: 16 }}
                  whileInView={reducedMotion ? undefined : { opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ ...revealTransition, delay: index * 0.08 }}
                >
                  <Link
                    href={item.href}
                    className={cn(
                      "flex h-full flex-col",
                      index === 0 && "sm:flex-row",
                      focusVisibleStyles.inset
                    )}
                  >
                    {item.imageUrl ? (
                      <div
                        className={cn(
                          "relative aspect-[16/9] overflow-hidden",
                          index === 0 && "sm:aspect-auto sm:w-1/2 sm:shrink-0"
                        )}
                      >
                        <PublicImage
                          src={item.imageUrl}
                          alt=""
                          ratio="fill"
                          className="absolute inset-0 h-full w-full"
                          imageClassName="object-cover transition-transform duration-700 ease-out motion-safe:group-hover:scale-[1.04]"
                          sizes="(min-width: 1024px) 33vw, 100vw"
                        />
                      </div>
                    ) : null}
                    <div className="flex flex-1 flex-col gap-2 p-5">
                      {item.eyebrow ? (
                        <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-secondary">
                          {item.eyebrow}
                        </p>
                      ) : null}
                      <h3
                        className={cn(
                          "font-semibold leading-snug text-primary",
                          index === 0 ? "text-lg sm:text-xl" : "text-base"
                        )}
                      >
                        {item.title}
                      </h3>
                      {index === 0 && item.body ? (
                        <p className="line-clamp-2 text-sm leading-6 text-muted-foreground">
                          {item.body}
                        </p>
                      ) : null}
                      {item.meta ? (
                        <p className="mt-auto pt-2 text-xs text-muted-foreground">
                          {item.meta}
                        </p>
                      ) : null}
                    </div>
                  </Link>
                </motion.article>
              ))}
            </div>
          )}

          {/* Events + blog rail */}
          <div className="flex flex-col gap-5">
            {upcoming.length > 0 && (
              <motion.div
                className="rounded-3xl border border-border bg-white p-5"
                initial={reducedMotion ? undefined : { opacity: 0, y: 16 }}
                whileInView={reducedMotion ? undefined : { opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={revealTransition}
              >
                <h3 className="text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">
                  Upcoming events
                </h3>
                <ul className="mt-3 divide-y divide-border">
                  {upcoming.map((event) => (
                    <li key={event.id ?? event.href}>
                      <Link
                        href={event.href}
                        className={cn(
                          "group flex min-h-11 items-start gap-3 py-3",
                          focusVisibleStyles.inset
                        )}
                      >
                        <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent text-primary">
                          <CalendarDays className="h-4 w-4" aria-hidden />
                        </span>
                        <span>
                          <span className="block text-sm font-semibold leading-snug text-primary transition group-hover:text-secondary">
                            {event.title}
                          </span>
                          {event.meta ? (
                            <span className="mt-0.5 block text-xs text-muted-foreground">
                              {event.meta}
                            </span>
                          ) : null}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/events"
                  className={cn(
                    "group mt-2 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-primary transition hover:text-secondary",
                    focusVisibleStyles.primary
                  )}
                >
                  All events
                  <ArrowRight
                    className="h-4 w-4 transition group-hover:translate-x-1"
                    aria-hidden
                  />
                </Link>
              </motion.div>
            )}

            {blog ? (
              <motion.div
                className="group overflow-hidden rounded-3xl border border-border bg-white transition-colors hover:border-primary"
                initial={reducedMotion ? undefined : { opacity: 0, y: 16 }}
                whileInView={reducedMotion ? undefined : { opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ ...revealTransition, delay: 0.08 }}
              >
                <Link
                  href={blog.href}
                  className={cn("block", focusVisibleStyles.inset)}
                >
                  {blog.imageUrl ? (
                    <div className="relative aspect-[16/9] overflow-hidden">
                      <PublicImage
                        src={blog.imageUrl}
                        alt=""
                        ratio="fill"
                        className="absolute inset-0 h-full w-full"
                        imageClassName="object-cover transition-transform duration-700 ease-out motion-safe:group-hover:scale-[1.04]"
                        sizes="(min-width: 1024px) 33vw, 100vw"
                      />
                    </div>
                  ) : null}
                  <div className="p-5">
                    <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-secondary">
                      Latest blog
                    </p>
                    <h3 className="mt-2 text-base font-semibold leading-snug text-primary">
                      {blog.title}
                    </h3>
                    {blog.body ? (
                      <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">
                        {blog.body}
                      </p>
                    ) : null}
                  </div>
                </Link>
              </motion.div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}

export default HappeningNowSection;
