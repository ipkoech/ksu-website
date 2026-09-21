import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
} from "lucide-react";
import type { ReactNode } from "react";
import { AmbientPageBackground } from "@ksu/ui";
import { cn } from "@ksu/ui/lib/utils";
import { focusVisibleStyles } from "@ksu/ui/motion";
import { PublicImage } from "@/components/public/public-image";
import { ImageCurtainReveal } from "@/components/about/image-curtain-reveal";
import {
  Reveal,
  RevealGroup,
  RevealItem,
} from "@/components/home/motion-primitives";
import { YouTubeFacade } from "@/components/home/youtube-facade";
import { EventsCalendar } from "@/components/home/events-calendar";
import { NewsletterSignupBand } from "@/components/home/newsletter-cta-section";
import { defaultUniversityImage } from "@/lib/default-imagery";
import type {
  HomeCard,
  HomeContactInfo,
  HomeEventCard,
  HomeSocialLinks,
} from "@/lib/homepage-data";
import type {
  HomepageSection,
  HomepageSectionItem,
} from "@/lib/homepage-sections";

const CAMPUS_FILM = {
  id: "tv2zAL4ry08",
  title: "Kisii University Students Social Life",
};

function contentText(item: HomepageSectionItem | undefined, key: string) {
  const value = item?.content?.[key];
  return typeof value === "string" && value.trim() ? value : undefined;
}

function imageForCard(item: HomeCard) {
  return item.imageUrl ?? defaultUniversityImage(item.id ?? item.href);
}

/**
 * The post-research homepage story: one editorial surface for stories,
 * campus life, news, events, blog posts and the subscription CTA. The data
 * stays in separate CMS/API collections; the visitor experiences one beat.
 */
export function LifeAndUpdatesSection({
  section,
  stories,
  news,
  events,
  blogs,
  contactInfo,
  socialLinks,
  todayIso,
}: {
  section?: HomepageSection | null;
  stories: HomeCard[];
  news: HomeCard[];
  events: HomeEventCard[];
  blogs: HomeCard[];
  contactInfo: HomeContactInfo;
  socialLinks: HomeSocialLinks;
  todayIso: string;
}) {
  const lifeItems = (section?.items ?? [])
    .filter((item) => item.is_enabled !== false)
    .sort(
      (first, second) =>
        (first.display_order ?? 100) - (second.display_order ?? 100),
    )
    .slice(0, 6);
  const [leadStory, ...supportingStories] = stories;
  const hasTopContent =
    Boolean(leadStory) ||
    Boolean(section) ||
    news.length > 0 ||
    supportingStories.length > 0;

  const lifeTitle = section?.title?.trim() || "Life at Kisii";
  const lifeDescription = section?.description?.trim();

  return (
    <AmbientPageBackground
      as="section"
      variant="poster"
      intensity="soft"
      id="life-and-updates"
      aria-labelledby="life-and-updates-heading"
      className="ksu-band-tight overflow-hidden text-brand-overlay"
    >
      <div className="ksu-shell">
        <Reveal className="flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-[48rem]">
            <p className="ksu-l-small font-semibold uppercase tracking-[0.18em] text-[hsl(var(--gold-dark))]">
              Life &amp; updates
            </p>
            <h2
              id="life-and-updates-heading"
              className="ksu-l-h2 mt-2 font-normal"
            >
              The people and moments shaping Kisii.
            </h2>
            <p className="mt-3 max-w-[58ch] text-brand-overlay/65">
              {lifeDescription ||
                "See the stories, experiences and opportunities that make university life matter beyond the classroom."}
            </p>
          </div>
          <Link
            href="/campus-life"
            className={cn(
              "group inline-flex min-h-11 items-center gap-2 font-medium text-secondary",
              focusVisibleStyles.primary,
            )}
          >
            Explore campus life
            <ArrowRight
              className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
              aria-hidden
            />
          </Link>
        </Reveal>

        {hasTopContent ? (
          <div className="mt-8 grid gap-4 lg:grid-cols-[minmax(0,1.25fr)_minmax(20rem,0.75fr)]">
            {leadStory ? <LeadStoryCard story={leadStory} /> : null}

            {section || news.length > 0 || supportingStories.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                {section ? <CampusFilmTile /> : null}
                {news.length > 0 ? (
                  <LatestNewsPanel news={news.slice(0, 3)} />
                ) : supportingStories.length > 0 ? (
                  <StoryListPanel stories={supportingStories.slice(0, 3)} />
                ) : null}
              </div>
            ) : null}
          </div>
        ) : null}

        {supportingStories.length > 0 && news.length > 0 ? (
          <div className="mt-8">
            <SectionHeading title="More stories" href="/stories" label="View all stories" />
            <RevealGroup
              as="ul"
              className="mt-4 grid gap-4 sm:grid-cols-3"
            >
              {supportingStories.slice(0, 3).map((story) => (
                <RevealItem as="li" key={story.id ?? story.href}>
                  <StoryCard story={story} />
                </RevealItem>
              ))}
            </RevealGroup>
          </div>
        ) : null}

        {lifeItems.length > 0 ? (
          <div className="mt-8">
            <SectionHeading
              title={lifeTitle}
              href="/campus-life"
              label="View campus life"
            />
            <RevealGroup
              as="ul"
              className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
            >
              {lifeItems.map((item) => (
                <RevealItem as="li" key={item.id} className="min-w-0">
                  <LifeCard item={item} />
                </RevealItem>
              ))}
            </RevealGroup>
          </div>
        ) : null}

        {events.length > 0 || blogs.length > 0 ? (
          <div className="mt-8 grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(18rem,0.8fr)]">
            {events.length > 0 ? (
              <Reveal className="rounded-3xl bg-white p-5 shadow-[0_1px_2px_hsl(var(--brand-overlay)/0.05),0_18px_44px_-28px_hsl(var(--brand-overlay)/0.4)] ring-1 ring-brand-overlay/8 sm:p-7">
                <SectionHeading
                  title="Events calendar"
                  href="/events"
                  label="All events"
                  icon={<CalendarDays className="h-5 w-5 text-secondary" aria-hidden />}
                />
                <div className="mt-5">
                  <EventsCalendar events={events} todayIso={todayIso} />
                </div>
              </Reveal>
            ) : null}

            {blogs.length > 0 ? (
              <Reveal
                delay={0.05}
                className="rounded-3xl bg-[hsl(var(--primary-soft))]/65 p-5 ring-1 ring-brand-overlay/8 sm:p-7"
              >
                <SectionHeading
                  title="From the blog"
                  href="/blogs"
                  label="All posts"
                />
                <ul className="mt-2 divide-y divide-brand-overlay/10">
                  {blogs.slice(0, 3).map((post) => (
                    <li key={post.id ?? post.href}>
                      <Link
                        href={post.href}
                        className={cn(
                          "group flex min-h-11 items-start gap-4 py-5",
                          focusVisibleStyles.primary,
                        )}
                      >
                        <span className="min-w-0 flex-1">
                          <span className="ksu-l-small block font-medium transition-colors duration-300 group-hover:text-primary">
                            {post.title}
                          </span>
                          {post.body ? (
                            <span className="ksu-l-small mt-2 line-clamp-2 block text-brand-overlay/60">
                              {post.body}
                            </span>
                          ) : null}
                          {post.meta ? (
                            <span className="ksu-l-small mt-2 block text-brand-overlay/50">
                              {post.meta}
                            </span>
                          ) : null}
                        </span>
                        <ArrowUpRight
                          className="mt-0.5 h-4 w-4 shrink-0 text-brand-overlay/25 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-secondary"
                          aria-hidden
                        />
                      </Link>
                    </li>
                  ))}
                </ul>
              </Reveal>
            ) : null}
          </div>
        ) : null}

        <div className="mt-8">
          <NewsletterSignupBand
            contactInfo={contactInfo}
            socialLinks={socialLinks}
          />
        </div>
      </div>
    </AmbientPageBackground>
  );
}

function LeadStoryCard({ story }: { story: HomeCard }) {
  return (
    <Reveal className="min-w-0">
      <Link
        href={story.href}
        className={cn("group relative block h-full overflow-hidden rounded-3xl", focusVisibleStyles.primary)}
      >
        <ImageCurtainReveal className="relative min-h-[19rem] h-full w-full overflow-hidden sm:min-h-[21rem]">
          <PublicImage
            src={imageForCard(story)}
            alt=""
            ratio="fill"
            className="absolute inset-0 h-full w-full bg-transparent"
            imageClassName="object-cover transition-transform [transition-duration:900ms] [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] motion-safe:group-hover:scale-[1.04]"
            sizes="(min-width: 1024px) 62vw, 100vw"
            priority={false}
          />
          <div
            className="absolute inset-0 bg-[linear-gradient(to_top,hsl(var(--brand-overlay)/0.94)_0%,hsl(var(--brand-overlay)/0.55)_42%,hsl(var(--brand-overlay)/0.08)_78%)]"
            aria-hidden
          />
        </ImageCurtainReveal>
        <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
          {story.eyebrow ? (
            <p className="ksu-l-small font-semibold uppercase tracking-[0.15em] text-[hsl(var(--gold-light))]">
              {story.eyebrow}
            </p>
          ) : null}
          <h3 className="mt-2 text-balance text-[clamp(1.6rem,2.4vw,2.7rem)] font-normal leading-[1.08] text-white">
            {story.title}
          </h3>
          <p className="mt-3 line-clamp-2 max-w-[58ch] text-sm leading-6 text-white/75">
            {story.body}
          </p>
          <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[hsl(var(--gold-light))]">
            Read story
            <ArrowUpRight
              className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              aria-hidden
            />
          </span>
        </div>
      </Link>
    </Reveal>
  );
}

function StoryCard({ story }: { story: HomeCard }) {
  return (
    <Link
      href={story.href}
      className={cn("group block h-full", focusVisibleStyles.primary)}
    >
      <article className="flex h-full flex-col overflow-hidden rounded-2xl bg-white shadow-[0_1px_2px_hsl(var(--brand-overlay)/0.05),0_14px_34px_-22px_hsl(var(--brand-overlay)/0.45)] ring-1 ring-brand-overlay/8 transition-[transform,box-shadow] duration-500 motion-safe:group-hover:-translate-y-1 motion-safe:group-hover:shadow-[0_1px_2px_hsl(var(--brand-overlay)/0.06),0_26px_50px_-24px_hsl(var(--brand-overlay)/0.55)]">
        <ImageCurtainReveal className="relative aspect-[16/9] w-full overflow-hidden">
          <PublicImage
            src={imageForCard(story)}
            alt=""
            ratio="fill"
            className="absolute inset-0 h-full w-full bg-transparent"
            imageClassName="object-cover transition-transform [transition-duration:900ms] [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] motion-safe:group-hover:scale-[1.05]"
            sizes="(min-width: 1024px) 31vw, (min-width: 640px) 46vw, 100vw"
          />
        </ImageCurtainReveal>
        <div className="flex flex-1 items-start gap-3 p-4">
          <span className="min-w-0 flex-1">
            <span className="ksu-l-small block font-medium transition-colors duration-300 group-hover:text-primary">
              {story.title}
            </span>
            {story.meta ? (
              <span className="ksu-l-small mt-2 block text-brand-overlay/55">
                {story.meta}
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

function CampusFilmTile() {
  return (
    <Reveal className="overflow-hidden rounded-3xl bg-brand-overlay text-white shadow-[0_18px_45px_hsl(var(--brand-overlay)/0.14)]">
      <YouTubeFacade
        id={CAMPUS_FILM.id}
        title={CAMPUS_FILM.title}
        className="aspect-[16/9] w-full rounded-none"
        sizes="(min-width: 1024px) 38vw, 100vw"
      />
      <div className="p-5">
        <p className="ksu-l-small font-semibold uppercase tracking-[0.15em] text-[hsl(var(--gold-light))]">
          Life at Kisii
        </p>
        <h3 className="mt-2 text-xl font-normal">Find your place here.</h3>
        <Link
          href="/campus-life"
          className={cn(
            "group mt-3 inline-flex items-center gap-2 text-sm font-semibold text-white",
            focusVisibleStyles.white,
          )}
        >
          Explore campus life
          <ArrowRight
            className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
            aria-hidden
          />
        </Link>
      </div>
    </Reveal>
  );
}

function LatestNewsPanel({ news }: { news: HomeCard[] }) {
  return (
    <Reveal className="rounded-3xl bg-white p-5 ring-1 ring-brand-overlay/8">
      <SectionHeading title="Latest news" href="/news" label="All news" />
      <ul className="mt-1 divide-y divide-brand-overlay/10">
        {news.map((item) => (
          <li key={item.id ?? item.href}>
            <Link
              href={item.href}
              className={cn(
                "group flex items-start gap-3 py-4",
                focusVisibleStyles.primary,
              )}
            >
              <span className="min-w-0 flex-1">
                <span className="ksu-l-small block font-medium transition-colors duration-300 group-hover:text-primary">
                  {item.title}
                </span>
                {item.meta ? (
                  <span className="ksu-l-small mt-1 block text-brand-overlay/50">
                    {item.meta}
                  </span>
                ) : null}
              </span>
              <ArrowUpRight
                className="mt-0.5 h-4 w-4 shrink-0 text-brand-overlay/25 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-secondary"
                aria-hidden
              />
            </Link>
          </li>
        ))}
      </ul>
    </Reveal>
  );
}

function StoryListPanel({ stories }: { stories: HomeCard[] }) {
  return (
    <Reveal className="rounded-3xl bg-white p-5 ring-1 ring-brand-overlay/8">
      <SectionHeading title="More from Kisii" href="/stories" label="All stories" />
      <ul className="mt-1 divide-y divide-brand-overlay/10">
        {stories.map((story) => (
          <li key={story.id ?? story.href}>
            <Link
              href={story.href}
              className={cn("group flex items-start gap-3 py-4", focusVisibleStyles.primary)}
            >
              <span className="min-w-0 flex-1">
                <span className="ksu-l-small block font-medium transition-colors duration-300 group-hover:text-primary">
                  {story.title}
                </span>
                {story.meta ? (
                  <span className="ksu-l-small mt-1 block text-brand-overlay/50">
                    {story.meta}
                  </span>
                ) : null}
              </span>
              <ArrowUpRight className="mt-0.5 h-4 w-4 shrink-0 text-brand-overlay/25" aria-hidden />
            </Link>
          </li>
        ))}
      </ul>
    </Reveal>
  );
}

function LifeCard({ item }: { item: HomepageSectionItem }) {
  const title = item.title?.trim() || "Campus life";
  const description = item.subtitle?.trim() || item.body_text?.trim();
  const imageSrc =
    contentText(item, "imageUrl") ??
    "/images/student-life/Life-around-studies/culture.jpg";

  const card = (
    <article className="group flex h-full w-full flex-col overflow-hidden rounded-2xl bg-white shadow-[0_1px_2px_hsl(var(--brand-overlay)/0.05),0_14px_34px_-22px_hsl(var(--brand-overlay)/0.45)] ring-1 ring-brand-overlay/8 transition-[transform,box-shadow] duration-500 motion-safe:group-hover:-translate-y-1">
      <ImageCurtainReveal className="relative aspect-[16/9] w-full overflow-hidden">
        <PublicImage
          src={imageSrc}
          alt={item.media_alt_text ?? ""}
          ratio="fill"
          className="absolute inset-0 h-full w-full bg-transparent"
          imageClassName="object-cover transition-transform [transition-duration:900ms] [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] motion-safe:group-hover:scale-[1.06]"
          sizes="(min-width: 1024px) 31vw, (min-width: 640px) 46vw, 100vw"
        />
      </ImageCurtainReveal>
      <div className="flex items-start gap-3 p-4">
        <span className="min-w-0 flex-1">
          <span className="ksu-l-small block font-medium transition-colors duration-300 group-hover:text-primary">
            {title}
          </span>
          {description ? (
            <span className="ksu-l-small mt-1 line-clamp-2 block text-brand-overlay/60">
              {description}
            </span>
          ) : null}
        </span>
        <ArrowUpRight className="mt-0.5 h-4 w-4 shrink-0 text-brand-overlay/25" aria-hidden />
      </div>
    </article>
  );

  return item.cta_url ? (
    <Link
      href={item.cta_url}
      className={cn("block h-full rounded-2xl", focusVisibleStyles.primary)}
      aria-label={title}
    >
      {card}
    </Link>
  ) : (
    card
  );
}

function SectionHeading({
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
    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-brand-overlay/12 pb-3">
      <h3 className="ksu-l-card flex items-center gap-3 font-normal">
        {icon}
        {title}
      </h3>
      <Link
        href={href}
        className={cn(
          "group ksu-l-small inline-flex min-h-10 items-center gap-1.5 font-medium text-secondary",
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

export default LifeAndUpdatesSection;
