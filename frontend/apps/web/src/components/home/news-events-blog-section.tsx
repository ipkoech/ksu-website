import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowUpRight, CalendarDays } from "lucide-react";
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
import { EventsCalendar } from "@/components/home/events-calendar";
import { defaultUniversityImage } from "@/lib/default-imagery";
import type { HomeCard, HomeEventCard } from "@/lib/homepage-data";

/**
 * What is happening at Kisii: events, news and the blog.
 *
 * Every block is conditional on its own records, and the section itself
 * disappears when all three are empty. A homepage that announces "no news
 * has been published yet" is telling visitors about the CMS rather than
 * about the university; better to say nothing than to hold space for
 * nothing.
 */
export function NewsEventsBlogSection({
  news,
  events,
  blogs,
  todayIso,
}: {
  news: HomeCard[];
  events: HomeEventCard[];
  blogs: HomeCard[];
  todayIso: string;
}) {
  const hasEvents = events.length > 0;
  const hasNews = news.length > 0;
  const hasBlogs = blogs.length > 0;

  if (!hasEvents && !hasNews && !hasBlogs) return null;

  return (
    <AmbientPageBackground
      as="section"
      variant="poster"
      intensity="soft"
      id="news-events"
      aria-labelledby="news-events-heading"
      className="overflow-hidden py-16 text-brand-overlay lg:py-24"
    >
      <div className="ksu-shell">
        <Reveal>
          <h2 id="news-events-heading" className="ksu-l-h2 font-normal">
            What is happening at Kisii
          </h2>
        </Reveal>

        {hasEvents ? (
          <Reveal delay={0.05} className="mt-10">
            <div className="rounded-3xl bg-white p-6 shadow-[0_1px_2px_hsl(var(--brand-overlay)/0.05),0_18px_44px_-28px_hsl(var(--brand-overlay)/0.4)] ring-1 ring-brand-overlay/8 lg:p-8">
              <BlockHeading
                title="Events calendar"
                href="/events"
                label="All events"
                icon={
                  <CalendarDays
                    className="h-5 w-5 text-secondary"
                    strokeWidth={1.5}
                    aria-hidden
                  />
                }
              />
              <div className="mt-6">
                <EventsCalendar events={events} todayIso={todayIso} />
              </div>
            </div>
          </Reveal>
        ) : null}

        {hasNews ? (
          <div className={cn(hasEvents ? "mt-14" : "mt-10")}>
            <Reveal>
              <BlockHeading title="Latest news" href="/news" label="All news" />
            </Reveal>
            <RevealGroup
              as="ul"
              className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
            >
              {news.slice(0, 3).map((item) => (
                <RevealItem
                  as="li"
                  key={item.id ?? item.href}
                  className="min-w-0"
                >
                  <NewsCard item={item} />
                </RevealItem>
              ))}
            </RevealGroup>
          </div>
        ) : null}

        {hasBlogs ? (
          <div className={cn(hasNews || hasEvents ? "mt-14" : "mt-10")}>
            <Reveal>
              <BlockHeading
                title="From the blog"
                href="/blogs"
                label="All posts"
              />
            </Reveal>
            <RevealGroup
              as="ul"
              className="mt-2 grid gap-x-10 sm:grid-cols-2 lg:grid-cols-3"
            >
              {blogs.slice(0, 3).map((post) => (
                <RevealItem
                  as="li"
                  key={post.id ?? post.href}
                  className="min-w-0"
                >
                  <Link
                    href={post.href}
                    className={cn(
                      "group flex min-h-11 items-start gap-4 border-b border-brand-overlay/10 py-5",
                      focusVisibleStyles.primary,
                    )}
                  >
                    <span className="min-w-0 flex-1">
                      <span className="ksu-l-small block font-medium transition-colors duration-300 group-hover:text-primary">
                        {post.title}
                      </span>
                      {post.meta ? (
                        <span className="ksu-l-small mt-1 block text-brand-overlay/55">
                          {post.meta}
                        </span>
                      ) : null}
                    </span>
                    <ArrowUpRight
                      className="mt-0.5 h-4 w-4 shrink-0 text-brand-overlay/25 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-secondary"
                      aria-hidden
                    />
                  </Link>
                </RevealItem>
              ))}
            </RevealGroup>
          </div>
        ) : null}
      </div>
    </AmbientPageBackground>
  );
}

/** Photograph on top, words in a footer beneath, matching the campus cards. */
function NewsCard({ item }: { item: HomeCard }) {
  return (
    <Link
      href={item.href}
      className={cn(
        "group block h-full rounded-3xl",
        focusVisibleStyles.primary,
      )}
    >
      <article className="flex h-full flex-col overflow-hidden rounded-3xl bg-white shadow-[0_1px_2px_hsl(var(--brand-overlay)/0.05),0_14px_34px_-22px_hsl(var(--brand-overlay)/0.45)] ring-1 ring-brand-overlay/8 transition-[transform,box-shadow] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] motion-safe:group-hover:-translate-y-1 motion-safe:group-hover:shadow-[0_1px_2px_hsl(var(--brand-overlay)/0.06),0_26px_50px_-24px_hsl(var(--brand-overlay)/0.55)]">
        <ImageCurtainReveal className="relative aspect-[16/10] w-full overflow-hidden">
          <PublicImage
            src={item.imageUrl ?? defaultUniversityImage(item.id ?? item.href)}
            alt=""
            ratio="fill"
            className="absolute inset-0 h-full w-full bg-transparent"
            imageClassName="object-cover transition-transform [transition-duration:900ms] [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] motion-safe:group-hover:scale-[1.06]"
            sizes="(min-width: 1024px) 31vw, (min-width: 640px) 46vw, 100vw"
          />
        </ImageCurtainReveal>
        <div className="flex flex-1 items-start gap-3 border-t border-brand-overlay/8 p-5">
          <span className="min-w-0 flex-1">
            <span className="ksu-l-small block font-medium transition-colors duration-300 group-hover:text-primary">
              {item.title}
            </span>
            {item.meta ? (
              <span className="ksu-l-small mt-1 block text-brand-overlay/55">
                {item.meta}
              </span>
            ) : null}
          </span>
          <ArrowUpRight
            className="mt-0.5 h-4 w-4 shrink-0 text-brand-overlay/25 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-secondary"
            aria-hidden
          />
        </div>
      </article>
    </Link>
  );
}

function BlockHeading({
  title,
  href,
  label,
  icon,
}: {
  title: string;
  href: string;
  label: string;
  icon?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-brand-overlay/12 pb-4">
      <h3 className="ksu-l-card flex items-center gap-3 font-normal">
        {icon}
        {title}
      </h3>
      <Link
        href={href}
        className={cn(
          "group ksu-l-small inline-flex min-h-11 items-center gap-1.5 font-medium text-secondary",
          focusVisibleStyles.primary,
        )}
      >
        {label}
        <ArrowUpRight
          className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
          aria-hidden
        />
      </Link>
    </div>
  );
}

export default NewsEventsBlogSection;
