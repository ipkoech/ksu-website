import type { Metadata } from "next";
import Link from "next/link";
import { ResearchPageShell } from "../../components/research-page-primitives";
import { ScrollReveal, ScrollRevealGroup } from "@ksu/ui/components";
import {
  ArrowRight,
  CalendarDays,
  ChevronRight,
  ImageIcon,
  Mail,
  Megaphone,
  Search,
  TrendingUp,
} from "lucide-react";
import { researchNewsFallbackImages as fallbackImages, researchNewsTabs as navButtons } from "../../config/research-page-content";
import type { ResearchGenericRecord } from "@ksu/api-client";
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
  tab?: string;
};

type ContentKind = "news" | "article" | "event" | "announcement";
type NewsTab = "news" | "articles" | "events" | "announcements" | "gallery";

type ContentItem = {
  kind: ContentKind;
  record: ResearchGenericRecord;
  href?: string;
};

type NewsTabLink = (typeof navButtons)[number];

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

  const editorialItems = filterItems(
    [
      ...articles.data.map((record) => ({
        kind: normalizeArticleKind(record),
        record,
        href: record.slug ? `/news/${record.slug}` : undefined,
      })),
      ...blogs.data.map((record) => ({
        kind: "article" as const,
        record,
      })),
    ],
    query,
  ).sort(sortNewest);
  const newsItems = editorialItems.filter((item) => item.kind === "news");
  const articleItems = editorialItems.filter((item) => item.kind === "article");

  const eventItems = filterItems(
    events.data.map((record) => ({
      kind: "event" as const,
      record,
      href: record.slug ? `/events/${record.slug}` : undefined,
    })),
    query,
  ).sort(sortEventDate);

  const announcementItems = filterItems(
    announcements.data.map((record) => ({
      kind: "announcement" as const,
      record,
    })),
    query,
  ).sort(sortNewest);

  const combined = [...editorialItems, ...eventItems, ...announcementItems].sort(sortNewest);
  const gallery = combined.filter((item) => getRecordImage(item.record)).slice(0, 8);
  const availableTabs = navButtons.filter((button) => {
    if (button.id === "news") return newsItems.length > 0;
    if (button.id === "articles") return articleItems.length > 0;
    if (button.id === "events") return eventItems.length > 0;
    if (button.id === "announcements") return announcementItems.length > 0;
    return gallery.length > 0;
  });
  const requestedTab = normalizeTab(params.tab);
  const activeTab = requestedTab && availableTabs.some((button) => button.id === requestedTab)
    ? requestedTab
    : undefined;
  const showAll = !activeTab;
  const featuredSource = activeTab === "news"
    ? newsItems
    : activeTab === "articles"
      ? articleItems
      : activeTab === "events"
        ? eventItems
        : combined;
  const featured = pickFeatured(featuredSource).slice(0, 3);
  const latest = (activeTab === "news" ? newsItems : activeTab === "articles" ? articleItems : editorialItems).slice(0, 5);
  const calendarItems = eventItems.slice(0, 6);
  const noticeItems = announcementItems.slice(0, 3);
  const heroImage = getRecordImage(featured[0]?.record) || getRecordImage(gallery[0]?.record) || fallbackImages[0];

  return (
    <ResearchPageShell>
      <NewsHero
        activeTab={activeTab}
        image={heroImage}
        query={compactText(params.q)}
        tabs={availableTabs}
      />

      <section className="px-4 py-8 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
        <div className="mx-auto max-w-[1680px]">
          {showAll ? (
            <div className="grid gap-8 lg:grid-cols-[minmax(0,1.9fr)_minmax(360px,0.95fr)]">
              <div className="min-w-0 space-y-8">
                {featured.length > 0 ? <FeaturedStories items={featured} /> : null}
                {latest.length > 0 ? <LatestResearch items={latest} /> : null}
              </div>

              <aside className="min-w-0 space-y-8">
                {calendarItems.length > 0 ? <EventsCalendar items={calendarItems} /> : null}
                {noticeItems.length > 0 ? <AnnouncementsPanel items={noticeItems} /> : null}
              </aside>
            </div>
          ) : (
            <div className="space-y-8">
              {activeTab === "news" && newsItems.length > 0 ? <LatestResearch items={newsItems.slice(0, 9)} title="Research news" /> : null}
              {activeTab === "articles" && articleItems.length > 0 ? <LatestResearch items={articleItems.slice(0, 9)} title="Articles" /> : null}
              {activeTab === "events" && calendarItems.length > 0 ? <EventsCalendar items={calendarItems} /> : null}
              {activeTab === "announcements" && noticeItems.length > 0 ? <AnnouncementsPanel items={noticeItems} /> : null}
              {activeTab === "gallery" && gallery.length > 0 ? <ResearchGallery items={gallery} flush /> : null}
            </div>
          )}

          {showAll && gallery.length > 0 ? <ResearchGallery items={gallery} /> : null}
          <ResearchUpdatesBand />
        </div>
      </section>
    </ResearchPageShell>
  );
}

function NewsHero({
  activeTab,
  image,
  query,
  tabs,
}: {
  activeTab?: NewsTab;
  image: string;
  query: string;
  tabs: NewsTabLink[];
}) {
  return (
    <section className="relative overflow-hidden bg-primary text-white">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${image})` }}
      />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,hsl(var(--brand-overlay)/0.94)_0%,hsl(var(--brand-overlay)/0.78)_36%,hsl(var(--primary)/0.32)_70%,rgba(0,0,0,0.14)_100%)]" />
      <div className="relative px-4 py-7 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
        <div className="mx-auto max-w-[1680px]">
          <div className="max-w-3xl">
            <h1 className="font-display text-4xl font-semibold leading-tight sm:text-5xl">
              News, Articles & Events
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-white/88 sm:text-base">
              Discover the latest research news, insights, upcoming events, and announcements from Kisii University.
            </p>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(360px,520px)] lg:items-center">
            <div className="flex flex-wrap gap-3">
              {tabs.map((button) => {
                const Icon = button.icon;
                const active = activeTab === button.id || (!activeTab && button.id === tabs[0]?.id);
                return (
                  <Link
                    key={button.label}
                    href={`/news?tab=${button.id}`}
                    aria-current={active ? "page" : undefined}
                    className={`inline-flex min-h-11 items-center gap-3 rounded-md border px-5 text-sm font-semibold transition ${
                      active
                        ? "border-white/20 bg-primary text-white shadow-lg"
                        : "border-white/55 bg-brand-overlay/20 text-white hover:bg-white/10"
                    }`}
                  >
                    <Icon aria-hidden className="h-4 w-4" />
                    {button.label}
                  </Link>
                );
              })}
            </div>

            <form action="/news" className="flex rounded-md border border-white/20 bg-white/95 p-1 shadow-xl">
              {activeTab ? <input type="hidden" name="tab" value={activeTab} /> : null}
              <label className="relative min-w-0 flex-1">
                <span className="sr-only">Search updates</span>
                <Search aria-hidden className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/70" />
                <input
                  name="q"
                  defaultValue={query}
                  placeholder="Search updates..."
                  className="h-11 w-full rounded-md bg-transparent pl-11 pr-3 text-sm text-foreground outline-none placeholder:text-muted-foreground"
                />
              </label>
              <button className="inline-flex min-h-11 items-center justify-center rounded-md bg-primary px-5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90">
                Search
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

function FeaturedStories({ items }: { items: ContentItem[] }) {
  return (
    <div id="featured">
      <ScrollRevealGroup className="space-y-4" duration={620} staggerDelay={80}>
        <SectionHeader title="Featured stories" href="/news" />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-[minmax(0,1.45fr)_minmax(260px,0.75fr)_minmax(260px,0.75fr)]">
          {items.map((item, index) => (
            <StoryCard key={`${item.kind}-${item.record.id}`} item={item} priority={index === 0} index={index} />
          ))}
        </div>
      </ScrollRevealGroup>
    </div>
  );
}

function StoryCard({
  item,
  priority,
  index,
}: {
  item: ContentItem;
  priority?: boolean;
  index: number;
}) {
  const image = getRecordImage(item.record) || fallbackImages[index % fallbackImages.length];
  const content = (
    <article className="group overflow-hidden rounded-lg border border-border bg-card shadow-sm transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md">
      <div className={`relative overflow-hidden ${priority ? "h-56" : "h-40"}`}>
        <div
          className="absolute inset-0 bg-cover bg-center transition duration-700 group-hover:scale-105 motion-reduce:transform-none"
          style={{ backgroundImage: `url(${image})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-overlay/42 to-transparent" />
        <KindBadge item={item} className="absolute left-3 top-3" />
      </div>
      <div className="p-4">
        <h2 className={`${priority ? "text-xl" : "text-lg"} line-clamp-2 font-display font-semibold leading-7 text-foreground`}>
          {getRecordTitle(item.record, "Research update")}
        </h2>
        <MetaLine record={item.record} className="mt-2" />
        {summaryFor(item.record) ? (
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">
            {summaryFor(item.record)}
          </p>
        ) : null}
        {item.href ? (
          <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary">
            Read story <ArrowRight aria-hidden className="h-4 w-4" />
          </span>
        ) : null}
      </div>
    </article>
  );
  return item.href ? <Link href={item.href}>{content}</Link> : content;
}

function LatestResearch({ items, title = "Latest from research" }: { items: ContentItem[]; title?: string }) {
  if (items.length === 0) return null;
  const [a, b, c, ...compact] = items;
  return (
    <div id="latest">
      <ScrollReveal className="space-y-4" variant="fade-up">
        <SectionHeader title={title} href="/news" />
        <div className="grid gap-4 xl:grid-cols-[repeat(3,minmax(0,1fr))_minmax(220px,0.9fr)]">
          {[a, b, c].filter(Boolean).map((item, index) => (
            <LatestCard key={`${item.kind}-${item.record.id}`} item={item} index={index + 3} />
          ))}
          {compact.length > 0 ? (
            <div className="grid gap-4">
              {compact.slice(0, 2).map((item, index) => (
                <MiniLatestCard key={`${item.kind}-${item.record.id}`} item={item} index={index + 6} />
              ))}
            </div>
          ) : null}
        </div>
      </ScrollReveal>
    </div>
  );
}

function LatestCard({ item, index }: { item: ContentItem; index: number }) {
  const image = getRecordImage(item.record) || fallbackImages[index % fallbackImages.length];
  const content = (
    <article className="group overflow-hidden rounded-lg border border-border bg-card shadow-sm transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md">
      <div className="relative h-40 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center transition duration-700 group-hover:scale-105 motion-reduce:transform-none"
          style={{ backgroundImage: `url(${image})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-overlay/42 to-transparent" />
        <KindBadge item={item} className="absolute left-3 top-3" />
      </div>
      <div className="p-4">
        <h3 className="line-clamp-2 font-display text-lg font-semibold leading-6 text-foreground">
          {getRecordTitle(item.record, "Research update")}
        </h3>
        <MetaLine record={item.record} className="mt-2" />
        {summaryFor(item.record) ? (
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">{summaryFor(item.record)}</p>
        ) : null}
      </div>
    </article>
  );
  return item.href ? <Link href={item.href}>{content}</Link> : content;
}

function MiniLatestCard({ item, index }: { item: ContentItem; index: number }) {
  const image = getRecordImage(item.record) || fallbackImages[index % fallbackImages.length];
  const content = (
    <article className="group overflow-hidden rounded-lg border border-border bg-card shadow-sm transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md">
      <div className="relative h-20 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center transition duration-700 group-hover:scale-105 motion-reduce:transform-none"
          style={{ backgroundImage: `url(${image})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-brand-overlay/55 to-transparent" />
        <KindBadge item={item} className="absolute left-3 top-3" compact />
      </div>
      <div className="p-3">
        <h3 className="line-clamp-2 text-sm font-semibold leading-5 text-foreground">
          {getRecordTitle(item.record, "Research update")}
        </h3>
        <MetaLine record={item.record} className="mt-2" />
      </div>
    </article>
  );
  return item.href ? <Link href={item.href}>{content}</Link> : content;
}

function EventsCalendar({ items }: { items: ContentItem[] }) {
  if (items.length === 0) return null;
  const sorted = [...items].sort(sortEventDate);
  const anchor = parseDate(recordDate(sorted[0].record));
  const monthLabel = formatMonth(recordDate(sorted[0].record));
  const year = anchor?.getFullYear();
  const month = anchor?.getMonth();
  const daysInMonth =
    year !== undefined && month !== undefined
      ? new Date(year, month + 1, 0).getDate()
      : 0;
  const firstWeekday =
    year !== undefined && month !== undefined
      ? new Date(year, month, 1).getDay()
      : 0;
  const eventDays = new Set(
    sorted
      .map((item) => parseDate(recordDate(item.record)))
      .filter(
        (date): date is Date =>
          date !== null &&
          date.getFullYear() === year &&
          date.getMonth() === month,
      )
      .map((date) => date.getDate()),
  );

  return (
    <div id="events">
      <ScrollReveal className="space-y-4" variant="fade-up">
        <SectionHeader title="Events calendar" href="/news#events" />
        <div className="grid gap-4 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
          {anchor ? (
            <div className="rounded-lg border border-border bg-white p-4 shadow-sm">
              <h3 className="text-center text-sm font-semibold text-foreground">{monthLabel}</h3>
              <div className="mt-4 grid grid-cols-7 gap-1 text-center text-[10px] font-semibold uppercase text-muted-foreground">
                {["S", "M", "T", "W", "T", "F", "S"].map((day, index) => <span key={`${day}-${index}`}>{day}</span>)}
              </div>
              <div className="mt-2 grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground">
                {Array.from({ length: firstWeekday }, (_, index) => (
                  <span key={`pad-${index}`} aria-hidden />
                ))}
                {Array.from({ length: daysInMonth }, (_, index) => index + 1).map((day) => {
                  const active = eventDays.has(day);
                  return (
                    <span
                      key={day}
                      className={`flex aspect-square items-center justify-center rounded-full ${active ? "bg-primary text-white" : "text-muted-foreground"}`}
                    >
                      {day}
                    </span>
                  );
                })}
              </div>
              <div className="mt-4 flex flex-wrap gap-3 text-[10px] font-semibold text-muted-foreground">
                <LegendDot label="Event day" className="bg-primary" />
              </div>
            </div>
          ) : null}
          <div className="grid gap-3">
            {sorted.slice(0, 3).map((item) => <EventRow key={item.record.id} item={item} />)}
          </div>
        </div>
      </ScrollReveal>
    </div>
  );
}

function EventRow({ item }: { item: ContentItem }) {
  const month = formatMonthShort(recordDate(item.record));
  const day = formatDay(recordDate(item.record));
  const eventDate = parseDate(recordDate(item.record));
  const now = new Date();
  const ongoing =
    eventDate !== null && eventDate.toDateString() === now.toDateString();
  const past = eventDate !== null && !ongoing && eventDate.getTime() < now.getTime();
  const content = (
    <article className="group grid grid-cols-[64px_minmax(0,1fr)_auto] items-center gap-3 rounded-lg border border-border bg-white p-3 shadow-sm transition hover:border-primary/30 hover:shadow-md">
      <div className="overflow-hidden rounded-md border border-primary/15 text-center">
        <div className={`${ongoing ? "bg-secondary" : "bg-primary"} py-1 text-[10px] font-semibold uppercase text-white`}>
          {month}
        </div>
        <div className="bg-white py-2 font-display text-2xl font-semibold text-foreground">{day}</div>
      </div>
      <div className="min-w-0">
        <h3 className="line-clamp-1 font-display text-lg font-semibold leading-6 text-foreground">
          {getRecordTitle(item.record, "Research event")}
        </h3>
        <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">
          {compactText(item.record.venue ?? item.record.location) || formatDate(recordDate(item.record))}
        </p>
      </div>
      <span
        className={`rounded-md px-2 py-1 text-[10px] font-semibold ${
          ongoing
            ? "bg-secondary/10 text-secondary"
            : past
              ? "bg-surface-muted text-muted-foreground"
              : "bg-primary/10 text-primary"
        }`}
      >
        {ongoing ? "Today" : past ? "Past" : "Upcoming"}
      </span>
    </article>
  );
  return item.href ? <Link href={item.href}>{content}</Link> : content;
}

function AnnouncementsPanel({ items }: { items: ContentItem[] }) {
  if (items.length === 0) return null;
  return (
    <div id="announcements">
      <ScrollReveal className="space-y-4 rounded-lg bg-surface-subtle/80 p-5" variant="fade-up">
        <SectionHeader title="Announcements" href="/news#announcements" />
        <div className="overflow-hidden rounded-lg border border-border bg-white shadow-sm">
          {items.map((item) => (
            <article key={item.record.id} className="grid grid-cols-[48px_minmax(0,1fr)_auto] items-center gap-3 border-b border-border p-4 last:border-b-0">
              <PriorityBadge priority={compactText(item.record.priority)} />
              <div className="min-w-0">
                <h3 className="line-clamp-1 font-display text-base font-semibold text-foreground">
                  {getRecordTitle(item.record, "Research announcement")}
                </h3>
                <p className="mt-1 text-xs font-semibold text-muted-foreground">
                  {compactText(item.record.category) || "Research"} {formatDate(item.record.valid_to) ? ` • Due ${formatDate(item.record.valid_to)}` : ""}
                </p>
              </div>
              <ChevronRight aria-hidden className="h-4 w-4 text-primary" />
            </article>
          ))}
        </div>
      </ScrollReveal>
    </div>
  );
}

function ResearchGallery({ items, flush = false }: { items: ContentItem[]; flush?: boolean }) {
  if (items.length === 0) return null;
  return (
    <div id="gallery">
      <ScrollReveal className={`${flush ? "" : "mt-8"} space-y-4`} variant="fade-up">
        <SectionHeader title="Research gallery" href="/news#gallery" />
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4 xl:grid-cols-7">
          {items.slice(0, 7).map((item, index) => (
            <GalleryTile key={`${item.kind}-${item.record.id}`} item={item} index={index} />
          ))}
        </div>
      </ScrollReveal>
    </div>
  );
}

function GalleryTile({ item, index }: { item: ContentItem; index: number }) {
  const image = getRecordImage(item.record) || fallbackImages[index % fallbackImages.length];
  return (
    <article className="group h-24 overflow-hidden rounded-lg border border-border bg-primary/10 shadow-sm">
      <div
        className="h-full bg-cover bg-center transition duration-700 group-hover:scale-105 motion-reduce:transform-none"
        style={{ backgroundImage: `url(${image})` }}
      />
    </article>
  );
}

function ResearchUpdatesBand() {
  return (
    <ScrollReveal className="mt-8 overflow-hidden rounded-lg border border-primary/15 bg-[linear-gradient(135deg,hsl(var(--brand-overlay)),hsl(var(--primary)/.62))] text-white shadow-sm" variant="fade-up">
      <div className="grid gap-5 p-6 lg:grid-cols-[minmax(260px,0.9fr)_minmax(320px,0.9fr)_minmax(420px,1.2fr)] lg:items-center">
        <div className="flex items-center gap-4">
          <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border border-secondary text-secondary">
            <Mail aria-hidden className="h-7 w-7" />
          </span>
          <div>
            <h2 className="font-display text-2xl font-semibold">
              Research updates
            </h2>
            <p className="mt-1 text-sm leading-6 text-white/80">
              Subscribe to receive the latest research news, articles, events and announcements from Kisii University.
            </p>
          </div>
        </div>

        <form className="flex rounded-md border border-white/20 bg-white p-1">
          <input
            type="email"
            aria-label="Email address"
            placeholder="Enter your email address"
            className="h-11 min-w-0 flex-1 rounded-md px-4 text-sm text-foreground outline-none placeholder:text-muted-foreground"
          />
          <button className="inline-flex min-h-11 items-center justify-center rounded-md bg-primary px-5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90">
            Subscribe
          </button>
        </form>

        <div className="grid gap-4 sm:grid-cols-3">
          <UpdateBenefit icon={Megaphone} title="Timely updates" body="Be the first to know" />
          <UpdateBenefit icon={TrendingUp} title="Curated insights" body="Research that matters" />
          <UpdateBenefit icon={SparkIcon} title="Make an impact" body="Support our mission" />
        </div>
      </div>
    </ScrollReveal>
  );
}

function UpdateBenefit({
  icon: Icon,
  title,
  body,
}: {
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  title: string;
  body: string;
}) {
  return (
    <div className="flex items-center gap-3 border-l border-white/15 pl-4">
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/10 text-secondary">
        <Icon aria-hidden className="h-5 w-5" />
      </span>
      <div>
        <p className="text-sm font-semibold">{title}</p>
        <p className="mt-1 text-xs text-white/70">{body}</p>
      </div>
    </div>
  );
}

function SparkIcon({ className }: { className?: string }) {
  return <ImageIcon aria-hidden className={className} />;
}

function SectionHeader({ title, href }: { title: string; href: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <h2 className="font-display text-2xl font-semibold text-foreground">
          {title}
        </h2>
        <span className="h-px w-7 bg-secondary" />
      </div>
      <Link href={href} className="inline-flex items-center gap-2 text-sm font-semibold text-primary transition hover:text-secondary">
        View all <ArrowRight aria-hidden className="h-4 w-4" />
      </Link>
    </div>
  );
}

function KindBadge({ item, className = "", compact = false }: { item: ContentItem; className?: string; compact?: boolean }) {
  const label = item.kind === "event" ? "Event" : item.kind === "article" ? "Article" : item.kind === "announcement" ? "Notice" : "News";
  const tone = item.kind === "event" ? "bg-secondary text-white" : item.kind === "article" ? "bg-primary/85 text-white" : "bg-primary text-white";
  return (
    <span className={`${className} rounded-md px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider ${tone}`}>
      {compact ? label.toUpperCase() : label}
    </span>
  );
}

function MetaLine({ record, className = "" }: { record: ResearchGenericRecord; className?: string }) {
  const date = formatDate(recordDate(record));
  return (
    <div className={`${className} flex flex-wrap items-center gap-2 text-xs font-semibold text-muted-foreground`}>
      {date ? (
        <>
          <CalendarDays aria-hidden className="h-3.5 w-3.5" />
          <span>{date}</span>
        </>
      ) : null}
    </div>
  );
}

function PriorityBadge({ priority }: { priority: string }) {
  if (!priority) {
    return (
      <span className="rounded-md bg-surface-muted px-2 py-1 text-[10px] font-semibold text-muted-foreground">
        Notice
      </span>
    );
  }
  const value = priority.toLowerCase();
  const tone = value.includes("high")
    ? "bg-secondary text-white"
    : value.includes("medium")
      ? "bg-secondary/20 text-secondary"
      : "bg-primary text-white";
  return <span className={`rounded-md px-2 py-1 text-[10px] font-semibold ${tone}`}>{formatLabel(priority)}</span>;
}

function LegendDot({ label, className }: { label: string; className: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`h-2 w-2 rounded-full ${className}`} />
      {label}
    </span>
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

function normalizeTab(value?: string) {
  const normalized = compactText(value).replace(/^-+/, "").toLowerCase();
  return navButtons.some((button) => button.id === normalized) ? (normalized as NewsTab) : undefined;
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

function sortNewest(a: ContentItem, b: ContentItem) {
  return toTime(recordDate(b.record)) - toTime(recordDate(a.record));
}

function sortEventDate(a: ContentItem, b: ContentItem) {
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

function formatMonthShort(value: string) {
  const date = parseDate(value);
  return date ? new Intl.DateTimeFormat("en-GB", { month: "short" }).format(date) : "Date";
}

function formatDay(value: string) {
  const date = parseDate(value);
  return date ? new Intl.DateTimeFormat("en-GB", { day: "2-digit" }).format(date) : "--";
}

function parseDate(value: string) {
  const time = Date.parse(value);
  return Number.isFinite(time) ? new Date(time) : null;
}
