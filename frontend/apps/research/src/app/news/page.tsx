import type { Metadata } from "next";
import Link from "next/link";
import { ScrollReveal, ScrollRevealGroup } from "@ksu/ui/components";
import {
  ArrowRight,
  CalendarDays,
  ImageIcon,
  Megaphone,
  Newspaper,
  Search,
  Sparkles,
} from "lucide-react";
import type { ResearchGenericRecord } from "@ksu/api-client";
import {
  Badge,
  FilledBadge,
  StatusMessage,
} from "../../components/research-ui";
import {
  compactText,
  formatDate,
  formatLabel,
  getAnnouncements,
  getArticles,
  getBlogs,
  getEvents,
} from "../../lib/research-public-data";
import {
  getRecordSummary,
  getRecordTitle,
} from "../../lib/research-page-model";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "News, Articles & Events",
  description:
    "Research news, articles, announcements, events, and gallery highlights.",
};

type NewsSearchParams = {
  q?: string;
};

type ContentKind = "news" | "article" | "blog" | "event" | "announcement";

type ContentItem = {
  kind: ContentKind;
  record: ResearchGenericRecord;
  href?: string;
};

const sectionLinks = [
  { id: "featured", label: "Featured stories", icon: Sparkles },
  { id: "latest", label: "Latest from research", icon: Newspaper },
  { id: "events", label: "Events calendar", icon: CalendarDays },
  { id: "announcements", label: "Announcements", icon: Megaphone },
  { id: "gallery", label: "Gallery", icon: ImageIcon },
];

export default async function NewsPage({
  searchParams,
}: {
  searchParams?: Promise<NewsSearchParams>;
}) {
  const params = (await searchParams) ?? {};
  const query = compactText(params.q).toLowerCase();
  const [articles, blogs, events, announcements] = await Promise.all([
    getArticles(),
    getBlogs(),
    getEvents(),
    getAnnouncements(),
  ]);

  const articleItems = filterItems(
    articles.data.map((record) => ({
      kind: normalizeArticleKind(record),
      record,
      href: record.slug ? `/news/${record.slug}` : undefined,
    })),
    query,
  );
  const blogItems = filterItems(
    blogs.data.map((record) => ({ kind: "blog" as const, record })),
    query,
  );
  const eventItems = filterItems(
    events.data.map((record) => ({
      kind: "event" as const,
      record,
      href: record.slug ? `/events/${record.slug}` : undefined,
    })),
    query,
  );
  const announcementItems = filterItems(
    announcements.data.map((record) => ({ kind: "announcement" as const, record })),
    query,
  );

  const allEditorialItems = [...articleItems, ...blogItems].sort(sortByPublished);
  const allContentItems = [
    ...allEditorialItems,
    ...eventItems,
    ...announcementItems,
  ].sort(sortByPublished);
  const featuredItems = pickFeatured(allContentItems).slice(0, 3);
  const galleryItems = allContentItems.filter((item) => getRecordImage(item.record)).slice(0, 8);
  const errors = [articles.error, blogs.error, events.error, announcements.error].filter(Boolean);

  return (
    <main id="research-main" className="min-h-screen bg-slate-50">
      <section className="px-4 py-5 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
        <div className="mx-auto max-w-[1680px]">
          <Breadcrumbs />

          <div className="grid gap-5 lg:grid-cols-[280px_minmax(0,1fr)]">
            <NewsSectionNav />

            <div className="min-w-0 space-y-5">
              <NewsHero
                query={compactText(params.q)}
                totals={{
                  articles: articleItems.length,
                  blogs: blogItems.length,
                  events: eventItems.length,
                  announcements: announcementItems.length,
                }}
                image={getRecordImage(featuredItems[0]?.record) || getRecordImage(allContentItems[0]?.record)}
              />

              {errors.length > 0 ? (
                <StatusMessage tone="error">{errors[0]}</StatusMessage>
              ) : null}

              {featuredItems.length > 0 ? (
                <FeaturedStories items={featuredItems} />
              ) : null}

              {allEditorialItems.length > 0 ? (
                <LatestFromResearch items={allEditorialItems.slice(0, 9)} />
              ) : null}

              {eventItems.length > 0 ? (
                <EventsCalendar items={eventItems.slice(0, 8)} />
              ) : null}

              {announcementItems.length > 0 ? (
                <AnnouncementsPanel items={announcementItems.slice(0, 6)} />
              ) : null}

              {galleryItems.length > 0 ? (
                <ResearchGallery items={galleryItems} />
              ) : null}

              <ResearchUpdatesBand />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function Breadcrumbs() {
  return (
    <nav className="mb-4 flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500" aria-label="Breadcrumb">
      <Link href="/" className="transition hover:text-primary">Home</Link>
      <span className="text-slate-300">/</span>
      <span className="text-slate-900">News, Articles & Events</span>
    </nav>
  );
}

function NewsSectionNav() {
  return (
    <aside className="lg:sticky lg:top-24 lg:self-start">
      <nav
        aria-label="News sections"
        className="overflow-x-auto rounded-lg border border-slate-200 bg-white p-2 shadow-sm"
      >
        <div className="flex min-w-max gap-1 lg:min-w-0 lg:flex-col">
          {sectionLinks.map((section) => {
            const Icon = section.icon;
            return (
              <a
                key={section.id}
                href={`#${section.id}`}
                className="inline-flex min-h-11 items-center gap-3 rounded-md px-3 text-sm font-semibold text-slate-700 transition hover:bg-primary/5 hover:text-primary"
              >
                <Icon aria-hidden className="h-4 w-4 shrink-0 text-primary" />
                {section.label}
              </a>
            );
          })}
        </div>
      </nav>
    </aside>
  );
}

function NewsHero({
  query,
  totals,
  image,
}: {
  query: string;
  totals: {
    articles: number;
    blogs: number;
    events: number;
    announcements: number;
  };
  image: string;
}) {
  const chips = [
    { label: "News", href: "#latest", value: totals.articles },
    { label: "Articles", href: "#latest", value: totals.articles },
    { label: "Events", href: "#events", value: totals.events },
    { label: "Announcements", href: "#announcements", value: totals.announcements },
    { label: "Gallery", href: "#gallery", value: totals.articles + totals.events },
  ];

  return (
    <ScrollReveal
      className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm"
      variant="fade-up"
    >
      <div className="grid min-h-[320px] lg:grid-cols-[minmax(0,0.95fr)_minmax(360px,0.75fr)]">
        <div className="flex flex-col justify-center p-5 sm:p-6 lg:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-secondary">
            Research updates
          </p>
          <h1 className="mt-3 max-w-3xl font-[family-name:var(--font-display)] text-3xl font-semibold leading-tight text-slate-950 sm:text-4xl">
            News, Articles & Events
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-700 sm:text-base">
            Follow research stories, field notes, public events, announcements, and gallery highlights from published university records.
          </p>

          <form action="/news" className="mt-5 flex max-w-2xl flex-col gap-2 sm:flex-row">
            <label className="relative min-w-0 flex-1">
              <span className="sr-only">Search updates</span>
              <Search aria-hidden className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                name="q"
                defaultValue={query}
                placeholder="Search updates..."
                className="h-11 w-full rounded-md border border-slate-200 bg-white pl-10 pr-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-primary focus:ring-4 focus:ring-primary/10"
              />
            </label>
            <button className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-5 text-sm font-semibold text-white transition hover:bg-primary/90">
              Search
            </button>
          </form>

          <div className="mt-5 flex flex-wrap gap-2">
            {chips.filter((chip) => chip.value > 0 || chip.label === "Gallery").map((chip) => (
              <a
                key={chip.label}
                href={chip.href}
                className="rounded-full border border-primary/15 bg-primary/5 px-3 py-1.5 text-xs font-semibold text-primary transition hover:bg-primary hover:text-white"
              >
                {chip.label}
              </a>
            ))}
          </div>
        </div>
        <div className="relative min-h-[260px] overflow-hidden bg-primary">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${image || "/images/research/research-events-hero.webp"})` }}
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,35,76,0.82),rgba(0,88,61,0.36),rgba(255,255,255,0.04))]" />
          <div className="absolute inset-x-5 bottom-5 rounded-lg border border-white/20 bg-white/14 p-4 text-white shadow-2xl backdrop-blur-md">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/75">
              Featured stories
            </p>
            <p className="mt-2 max-w-sm font-[family-name:var(--font-display)] text-xl font-semibold leading-7">
              Image-led research updates, events, and public announcements.
            </p>
          </div>
        </div>
      </div>
    </ScrollReveal>
  );
}

function FeaturedStories({ items }: { items: ContentItem[] }) {
  const [lead, ...side] = items;
  return (
    <div id="featured">
      <ScrollRevealGroup
        className="grid gap-5 xl:grid-cols-[minmax(0,1.25fr)_minmax(340px,0.75fr)]"
        duration={620}
        staggerDelay={80}
      >
        <StoryFeature item={lead} />
        {side.length > 0 ? (
          <div className="grid gap-5">
            {side.map((item) => (
              <CompactStoryCard key={item.record.id} item={item} />
            ))}
          </div>
        ) : null}
      </ScrollRevealGroup>
    </div>
  );
}

function StoryFeature({ item }: { item: ContentItem }) {
  const image = getRecordImage(item.record) || "/images/research/research-hero-imagegen.webp";
  return (
    <article className="group overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl">
      <div className="grid min-h-[360px] lg:grid-cols-[minmax(0,0.9fr)_minmax(360px,0.7fr)]">
        <div className="relative min-h-[260px] overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center transition duration-700 group-hover:scale-105"
            style={{ backgroundImage: `url(${image})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/55 via-slate-950/10 to-transparent" />
          <span className="absolute left-4 top-4 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-primary">
            Featured update
          </span>
        </div>
        <div className="flex flex-col justify-center p-5 sm:p-6">
          <ContentBadges item={item} />
          <h2 className="mt-4 font-[family-name:var(--font-display)] text-2xl font-semibold leading-tight text-slate-950">
            {getRecordTitle(item.record, "Research update")}
          </h2>
          {summaryFor(item.record) ? (
            <p className="mt-3 line-clamp-4 text-sm leading-7 text-slate-600">
              {summaryFor(item.record)}
            </p>
          ) : null}
          <div className="mt-5 flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-500">
            <span>{formatDate(recordDate(item.record))}</span>
            {compactText(item.record.venue ?? item.record.location) ? (
              <span>{compactText(item.record.venue ?? item.record.location)}</span>
            ) : null}
          </div>
          {item.href ? (
            <Link href={item.href} className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-primary transition hover:text-secondary">
              Read story <ArrowRight aria-hidden className="h-4 w-4" />
            </Link>
          ) : null}
        </div>
      </div>
    </article>
  );
}

function CompactStoryCard({ item }: { item: ContentItem }) {
  const image = getRecordImage(item.record) || "/images/research/research-demo-imagegen.webp";
  const content = (
    <article className="group grid gap-4 overflow-hidden rounded-lg border border-slate-200 bg-white p-3 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg sm:grid-cols-[150px_minmax(0,1fr)]">
      <div className="relative min-h-[140px] overflow-hidden rounded-md bg-primary/10">
        <div
          className="absolute inset-0 bg-cover bg-center transition duration-700 group-hover:scale-105"
          style={{ backgroundImage: `url(${image})` }}
        />
      </div>
      <div className="min-w-0 py-1">
        <ContentBadges item={item} compact />
        <h3 className="mt-3 line-clamp-2 font-[family-name:var(--font-display)] text-lg font-semibold leading-6 text-slate-950">
          {getRecordTitle(item.record, "Research update")}
        </h3>
        {summaryFor(item.record) ? (
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">{summaryFor(item.record)}</p>
        ) : null}
      </div>
    </article>
  );

  return item.href ? <Link href={item.href}>{content}</Link> : content;
}

function LatestFromResearch({ items }: { items: ContentItem[] }) {
  return (
    <div id="latest">
      <ScrollReveal className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6" variant="fade-up">
        <SectionHeader
          eyebrow="Latest from research"
          title="Latest from research"
          href="/news"
        />
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {items.map((item, index) => (
            <EditorialCard key={`${item.kind}-${item.record.id}`} item={item} raised={index % 3 === 1} />
          ))}
        </div>
      </ScrollReveal>
    </div>
  );
}

function EditorialCard({ item, raised }: { item: ContentItem; raised?: boolean }) {
  const image = getRecordImage(item.record);
  const content = (
    <article className={`group overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl ${raised ? "xl:-mt-3" : ""}`}>
      <div className="relative h-36 overflow-hidden bg-[linear-gradient(135deg,#00234c,#00583d)]">
        {image ? (
          <div
            className="absolute inset-0 bg-cover bg-center transition duration-700 group-hover:scale-105"
            style={{ backgroundImage: `url(${image})` }}
          />
        ) : (
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(245,166,35,0.45),transparent_32%),linear-gradient(135deg,#00234c,#00583d)]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/62 via-transparent to-transparent" />
        <div className="absolute bottom-3 left-3">
          <ContentBadges item={item} compact inverted />
        </div>
      </div>
      <div className="p-4">
        <h3 className="line-clamp-2 min-h-[3rem] font-[family-name:var(--font-display)] text-lg font-semibold leading-6 text-slate-950">
          {getRecordTitle(item.record, "Research update")}
        </h3>
        {summaryFor(item.record) ? (
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">{summaryFor(item.record)}</p>
        ) : null}
        <div className="mt-4 flex items-center justify-between gap-3 text-xs font-semibold text-slate-500">
          <span>{formatDate(recordDate(item.record))}</span>
          {item.href ? <span className="text-primary">Read story</span> : null}
        </div>
      </div>
    </article>
  );

  return item.href ? <Link href={item.href}>{content}</Link> : content;
}

function EventsCalendar({ items }: { items: ContentItem[] }) {
  const sorted = [...items].sort(sortByEventDate);
  const selected = sorted[0];
  const dateTiles = sorted.slice(0, 6);

  return (
    <div id="events">
      <ScrollReveal className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6" variant="fade-up">
        <SectionHeader
          eyebrow="Events calendar"
          title="Events calendar"
          href="/news#events"
        />
        <div className="mt-5 grid gap-5 xl:grid-cols-[320px_minmax(0,1fr)]">
          <div className="rounded-lg border border-primary/10 bg-primary/[0.03] p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-950">
                {formatMonth(recordDate(selected.record))}
              </p>
              <CalendarDays aria-hidden className="h-5 w-5 text-primary" />
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2">
              {dateTiles.map((item) => (
                <a
                  key={item.record.id}
                  href={item.href || "#events"}
                  className="rounded-md border border-slate-200 bg-white p-3 text-center transition hover:border-primary/35 hover:bg-primary/5"
                >
                  <span className="block text-[10px] font-semibold uppercase text-slate-500">
                    {formatWeekday(recordDate(item.record))}
                  </span>
                  <span className="mt-1 block font-[family-name:var(--font-display)] text-2xl font-semibold text-slate-950">
                    {formatDay(recordDate(item.record))}
                  </span>
                </a>
              ))}
            </div>
          </div>

          <div className="grid gap-3">
            {sorted.slice(0, 4).map((item) => (
              <EventAgendaRow key={item.record.id} item={item} />
            ))}
          </div>
        </div>
      </ScrollReveal>
    </div>
  );
}

function EventAgendaRow({ item }: { item: ContentItem }) {
  const content = (
    <article className="group grid gap-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md sm:grid-cols-[76px_minmax(0,1fr)_auto] sm:items-center">
      <div className="rounded-md border border-primary/15 bg-primary/5 px-3 py-2 text-center">
        <span className="block text-[10px] font-semibold uppercase text-primary">
          {formatWeekday(recordDate(item.record))}
        </span>
        <span className="block font-[family-name:var(--font-display)] text-2xl font-semibold text-slate-950">
          {formatDay(recordDate(item.record))}
        </span>
      </div>
      <div className="min-w-0">
        <ContentBadges item={item} compact />
        <h3 className="mt-2 line-clamp-1 font-semibold text-slate-950">
          {getRecordTitle(item.record, "Research event")}
        </h3>
        <p className="mt-1 text-sm text-slate-600">
          {compactText(item.record.venue ?? item.record.location) || formatDate(recordDate(item.record))}
        </p>
      </div>
      {item.href ? (
        <span className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
          View <ArrowRight aria-hidden className="h-4 w-4" />
        </span>
      ) : null}
    </article>
  );

  return item.href ? <Link href={item.href}>{content}</Link> : content;
}

function AnnouncementsPanel({ items }: { items: ContentItem[] }) {
  return (
    <div id="announcements">
      <ScrollReveal className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6" variant="fade-up">
        <SectionHeader
          eyebrow="Announcements"
          title="Announcements"
          href="/news#announcements"
        />
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {items.map((item) => (
            <article key={item.record.id} className="rounded-lg border border-slate-200 bg-slate-50 p-4 transition hover:border-secondary/40 hover:bg-white hover:shadow-sm">
              <div className="flex flex-wrap gap-2">
                <Badge>{formatLabel(compactText(item.record.category) || "Notice")}</Badge>
                {compactText(item.record.priority) ? <FilledBadge>{formatLabel(item.record.priority)}</FilledBadge> : null}
              </div>
              <h3 className="mt-3 line-clamp-2 font-semibold text-slate-950">
                {getRecordTitle(item.record, "Research announcement")}
              </h3>
              <div className="mt-3 flex flex-wrap gap-3 text-xs font-semibold text-slate-500">
                {formatDate(recordDate(item.record)) ? <span>{formatDate(recordDate(item.record))}</span> : null}
                {formatDate(item.record.valid_to) ? <span>Until {formatDate(item.record.valid_to)}</span> : null}
              </div>
            </article>
          ))}
        </div>
      </ScrollReveal>
    </div>
  );
}

function ResearchGallery({ items }: { items: ContentItem[] }) {
  return (
    <div id="gallery">
      <ScrollReveal className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6" variant="fade-up">
        <SectionHeader
          eyebrow="Research gallery"
          title="Research gallery"
          href="/news#gallery"
        />
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {items.slice(0, 4).map((item) => (
            <GalleryTile key={`${item.kind}-${item.record.id}`} item={item} />
          ))}
        </div>
      </ScrollReveal>
    </div>
  );
}

function GalleryTile({ item }: { item: ContentItem }) {
  const image = getRecordImage(item.record);
  return (
    <article className="group overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="relative h-36 overflow-hidden bg-primary/10">
        <div
          className="absolute inset-0 bg-cover bg-center transition duration-700 group-hover:scale-105"
          style={{ backgroundImage: `url(${image})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 to-transparent" />
        <div className="absolute bottom-3 left-3">
          <span className="rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-primary">{formatLabel(item.kind)}</span>
        </div>
      </div>
      <p className="line-clamp-2 p-3 text-sm font-semibold leading-6 text-slate-950">
        {getRecordTitle(item.record, "Research media")}
      </p>
    </article>
  );
}

function ResearchUpdatesBand() {
  return (
    <ScrollReveal className="overflow-hidden rounded-lg border border-primary/15 bg-primary text-white shadow-sm" variant="fade-up">
      <div className="grid gap-5 p-5 sm:p-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/70">
            Research updates
          </p>
          <h2 className="mt-2 font-[family-name:var(--font-display)] text-2xl font-semibold">
            Connect with the research office
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-white/78">
            Send media, collaboration, event, and public communication inquiries through the research contact desk.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/connect#media"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-white px-5 py-3 text-sm font-semibold text-primary shadow-sm transition hover:bg-white/90 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/20"
          >
            Media inquiry
            <ArrowRight aria-hidden className="h-4 w-4" />
          </Link>
          <Link
            href="/connect"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-white/30 bg-transparent px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/20"
          >
            Contact research
            <ArrowRight aria-hidden className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </ScrollReveal>
  );
}

function SectionHeader({
  eyebrow,
  title,
  href,
}: {
  eyebrow: string;
  title: string;
  href: string;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary">
          {eyebrow}
        </p>
        <h2 className="mt-1 font-[family-name:var(--font-display)] text-2xl font-semibold text-slate-950">
          {title}
        </h2>
      </div>
      <Link href={href} className="inline-flex items-center gap-2 text-sm font-semibold text-primary transition hover:text-secondary">
        View all <ArrowRight aria-hidden className="h-4 w-4" />
      </Link>
    </div>
  );
}

function ContentBadges({
  item,
  compact = false,
  inverted = false,
}: {
  item: ContentItem;
  compact?: boolean;
  inverted?: boolean;
}) {
  const label =
    item.kind === "blog"
      ? "Article"
      : item.kind === "event"
        ? "Event"
        : item.kind === "announcement"
          ? "Announcement"
          : "News";
  const type = compactText(
    item.record.article_type ??
      item.record.news_type ??
      item.record.event_type ??
      item.record.category,
  );

  return (
    <div className="flex flex-wrap gap-2">
      <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] ${inverted ? "bg-white/90 text-primary" : "bg-primary/10 text-primary"}`}>
        {label}
      </span>
      {type && !compact ? (
        <span className="rounded-full bg-secondary/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-secondary">
          {formatLabel(type)}
        </span>
      ) : null}
      {item.record.is_featured ? (
        <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-amber-700">
          Featured
        </span>
      ) : null}
    </div>
  );
}

function filterItems(items: ContentItem[], query: string) {
  if (!query) return items;
  return items.filter((item) => {
    const searchable = [
      item.record.title,
      item.record.name,
      item.record.summary,
      item.record.excerpt,
      item.record.description,
      item.record.category,
      item.record.event_type,
      item.record.venue,
      item.record.location,
    ].map((value) => compactText(value).toLowerCase());
    return searchable.some((value) => value.includes(query));
  });
}

function pickFeatured(items: ContentItem[]) {
  const featured = items.filter((item) => item.record.is_featured);
  return featured.length > 0 ? featured : items;
}

function normalizeArticleKind(record: ResearchGenericRecord): ContentKind {
  const type = compactText(record.article_type ?? record.news_type).toLowerCase();
  return type.includes("article") || type.includes("opinion") || type.includes("case")
    ? "article"
    : "news";
}

function summaryFor(record: ResearchGenericRecord) {
  return getRecordSummary(record) || compactText(record.excerpt);
}

function recordDate(record: ResearchGenericRecord) {
  return compactText(
    record.published_at ??
      record.start_date ??
      record.event_date ??
      record.valid_from ??
      record.created_at,
  );
}

function sortByPublished(a: ContentItem, b: ContentItem) {
  return toTime(recordDate(b.record)) - toTime(recordDate(a.record));
}

function sortByEventDate(a: ContentItem, b: ContentItem) {
  return toTime(recordDate(a.record)) - toTime(recordDate(b.record));
}

function toTime(value: string) {
  const time = Date.parse(value);
  return Number.isFinite(time) ? time : 0;
}

function getRecordImage(record?: ResearchGenericRecord) {
  if (!record) return "";
  const direct = compactText(
    record.cover_image_url ??
      record.image_url ??
      record.logo_url ??
      record.thumbnail_url,
  );
  if (direct) return direct;

  for (const field of ["featured_media", "cover_image", "desktop_media", "mobile_media"]) {
    const media = (record as Record<string, unknown>)[field];
    if (!media || typeof media !== "object") continue;
    const mediaRecord = media as Record<string, unknown>;
    const url = compactText(
      stringish(
        mediaRecord.public_url ??
          mediaRecord.cdn_url ??
          mediaRecord.url ??
          mediaRecord.thumbnail_url,
      ),
    );
    if (url) return url;
  }

  return "";
}

function stringish(value: unknown) {
  return typeof value === "string" || typeof value === "number" ? value : undefined;
}

function formatMonth(value: string) {
  const date = parseDate(value);
  return date
    ? new Intl.DateTimeFormat("en-GB", { month: "long", year: "numeric" }).format(date)
    : "Events calendar";
}

function formatWeekday(value: string) {
  const date = parseDate(value);
  return date ? new Intl.DateTimeFormat("en-GB", { weekday: "short" }).format(date) : "Date";
}

function formatDay(value: string) {
  const date = parseDate(value);
  return date ? new Intl.DateTimeFormat("en-GB", { day: "2-digit" }).format(date) : "--";
}

function parseDate(value: string) {
  const time = Date.parse(value);
  return Number.isFinite(time) ? new Date(time) : null;
}
