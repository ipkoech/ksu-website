import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  Download,
  ExternalLink,
  FileText,
  Image as ImageIcon,
  LinkIcon,
  MapPin,
  Newspaper,
} from "lucide-react";
import { RichTextRenderer } from "@ksu/ui/rich-text-renderer";
import { ScrollReveal, ScrollRevealGroup } from "@ksu/ui/components";
import { BreadcrumbTrail, PageShell } from "@/components/site-shell";
import {
  MediaGalleryBento,
  type MediaGalleryBentoItem,
} from "@/components/public/media-gallery-bento";
import { PublicImage } from "@/components/public/public-image";
import {
  PublicListFilterForm,
  type ListFilterOption,
} from "@/components/public/list-filter-form";
import { AboutPageLenis } from "@/components/ui/about-page-lenis";
import {
  categoryLabel,
  mediaUrl,
  present,
  recordDate,
  recordHref,
  recordTitle,
  summarize,
  type ContentDetailData,
  type ContentListingData,
  type ContentRecord,
  type EventRecord,
} from "@/lib/content-page-data";

function kindLabel(
  kind: ContentListingData["kind"] | ContentDetailData["kind"],
) {
  if (kind === "blogs") return "Articles";
  if (kind === "events") return "Events";
  if (kind === "announcements") return "Announcements";
  if (kind === "media") return "Media";
  return "News";
}

function SectionKicker({ children }: { children: string }) {
  return (
    <p className="text-xs font-bold uppercase tracking-[0.08em] text-primary">
      {children}
    </p>
  );
}

function ContentImage({
  record,
  large = false,
}: {
  record: ContentRecord;
  large?: boolean;
}) {
  const source = mediaUrl(record);
  const title = recordTitle(record);

  if (source) {
    return (
      <PublicImage
        src={source}
        alt={
          record.contentKind === "media" ? (record.alt_text ?? title) : title
        }
        ratio={large ? "news" : "card"}
        sizes={
          large
            ? "(min-width: 1024px) 50vw, 100vw"
            : "(min-width: 1024px) 24vw, (min-width: 640px) 50vw, 100vw"
        }
        className="h-full w-full"
      />
    );
  }

  return (
    <span className="flex h-full w-full items-center justify-center bg-primary/[0.08] text-primary">
      {record.contentKind === "media" ? (
        record.media_type === "image" ||
        record.mime_type?.startsWith("image/") ? (
          <ImageIcon aria-hidden className={large ? "h-16 w-16" : "h-9 w-9"} />
        ) : (
          <FileText aria-hidden className={large ? "h-16 w-16" : "h-9 w-9"} />
        )
      ) : (
        <Newspaper aria-hidden className={large ? "h-16 w-16" : "h-9 w-9"} />
      )}
    </span>
  );
}

function RecordCard({
  record,
  compact = false,
}: {
  record: ContentRecord;
  compact?: boolean;
}) {
  const date = recordDate(record);
  const href = recordHref(record);
  const summary = summarize(record, "");
  const actionLabel =
    record.contentKind === "media"
      ? "Open media"
      : record.contentKind === "events"
        ? "View event"
        : record.contentKind === "announcements"
          ? "Read notice"
          : record.contentKind === "blogs"
            ? "Read article"
            : "Read news";

  return (
    <Link
      href={href}
      className="group grid min-w-0 rounded-lg border border-slate-200 bg-white shadow-sm transition hover:border-primary/30 hover:shadow-[0_18px_50px_-38px_rgba(15,23,42,0.55)]"
    >
      <div
        className={
          compact
            ? "aspect-[16/9] overflow-hidden rounded-t-lg bg-slate-100"
            : "aspect-[4/3] overflow-hidden rounded-t-lg bg-slate-100"
        }
      >
        <ContentImage record={record} />
      </div>
      <div className="p-4">
        <div className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-[0.08em] text-primary">
          <span>{categoryLabel(record)}</span>
          {date ? <span className="text-slate-400">{date}</span> : null}
        </div>
        <h3 className="mt-2 line-clamp-2 text-base font-bold leading-6 text-slate-950 group-hover:text-primary">
          {recordTitle(record)}
        </h3>
        {summary ? (
          <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600">
            {summary}
          </p>
        ) : null}
        <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-primary">
          {actionLabel}
          <ArrowRight aria-hidden className="h-3.5 w-3.5" />
        </span>
      </div>
    </Link>
  );
}

function ListingHero({ data }: { data: ContentListingData }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm lg:p-6">
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_24rem] lg:items-end">
        <div>
          <BreadcrumbTrail
            items={[
              { label: "Home", href: "/" },
              { label: kindLabel(data.kind) },
            ]}
          />
          <SectionKicker>{data.eyebrow}</SectionKicker>
          <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl font-semibold leading-tight text-slate-950 sm:text-4xl">
            {data.title}
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-700">
            {data.body}
          </p>
        </div>
        <nav
          className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1"
          aria-label="Content sections"
        >
          {data.nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group flex min-h-11 items-center justify-between gap-3 rounded-lg border border-slate-200 px-3 text-sm font-semibold text-slate-700 transition hover:border-primary/30 hover:text-primary"
            >
              {item.label}
              <ArrowRight
                aria-hidden
                className="h-4 w-4 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-primary"
              />
            </Link>
          ))}
        </nav>
      </div>
    </section>
  );
}

function FeaturedRecord({ record }: { record: ContentRecord }) {
  return (
    <Link
      href={recordHref(record)}
      className="group grid overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition hover:border-primary/30 lg:grid-cols-[minmax(0,1fr)_22rem]"
    >
      <div className="p-5 lg:p-6">
        <SectionKicker>{categoryLabel(record)}</SectionKicker>
        <h2 className="mt-2 font-[family-name:var(--font-display)] text-2xl font-semibold leading-tight text-slate-950 group-hover:text-primary sm:text-3xl">
          {recordTitle(record)}
        </h2>
        {summarize(record, "") ? (
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-700">
            {summarize(record, "")}
          </p>
        ) : null}
        <div className="mt-5 flex flex-wrap gap-3 text-xs font-bold uppercase tracking-[0.08em] text-slate-500">
          {recordDate(record) ? <span>{recordDate(record)}</span> : null}
          <span>{kindLabel(record.contentKind)}</span>
        </div>
      </div>
      <div className="min-h-64 bg-slate-100">
        <ContentImage record={record} large />
      </div>
    </Link>
  );
}

const mediaDeskSections: Array<{
  id: string;
  title: string;
  body: string;
  kinds: ContentRecord["contentKind"][];
  href: string;
}> = [
  {
    id: "news",
    title: "News",
    body: "Official university news and institutional updates.",
    kinds: ["news"],
    href: "/media/news",
  },
  {
    id: "events",
    title: "Events",
    body: "Upcoming and recent university events.",
    kinds: ["events"],
    href: "/media/events",
  },
  {
    id: "articles",
    title: "Articles",
    body: "Feature articles, stories, and public explainers.",
    kinds: ["blogs"],
    href: "/media/articles",
  },
  {
    id: "announcements",
    title: "Announcements",
    body: "Official notices, calls, deadlines, and public announcements.",
    kinds: ["announcements"],
    href: "/media/announcements",
  },
  {
    id: "gallery",
    title: "Gallery",
    body: "Published photos and visual media records.",
    kinds: ["media"],
    href: "/media/gallery",
  },
];

function MediaDeskNav({
  activeSection = "overview",
}: {
  activeSection?: string;
}) {
  return (
    <nav
      aria-label="Media Desk"
      className="rounded-lg border border-slate-200 bg-white p-2 shadow-sm"
    >
      <div className="grid gap-1">
        <Link
          href="/media"
          className={`flex min-h-11 items-center justify-between rounded-md px-3 text-sm font-bold transition ${
            activeSection === "overview"
              ? "bg-primary text-white"
              : "text-slate-700 hover:bg-primary/5 hover:text-primary"
          }`}
        >
          Latest
          <ArrowRight aria-hidden className="h-4 w-4" />
        </Link>
        {mediaDeskSections.map((item) => (
          <Link
            key={item.id}
            href={item.href}
            className={`flex min-h-11 items-center justify-between rounded-md px-3 text-sm font-bold transition ${
              activeSection === item.id
                ? "bg-primary text-white"
                : "text-slate-700 hover:bg-primary/5 hover:text-primary"
            }`}
          >
            {item.title}
            <ArrowRight aria-hidden className="h-4 w-4" />
          </Link>
        ))}
      </div>
    </nav>
  );
}

function CalendarPanel({ events = [] }: { events?: EventRecord[] }) {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const leading = first.getDay();
  const days = Array.from({ length: leading + last.getDate() }, (_, index) => {
    const day = index - leading + 1;
    return day > 0 ? day : null;
  });
  const eventDays = new Set(
    events
      .filter((event) => event.start_date)
      .map((event) => new Date(event.start_date as string))
      .filter((date) => !Number.isNaN(date.getTime()))
      .map((date) => date.getDate()),
  );

  return (
    <aside className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2">
        <CalendarDays aria-hidden className="h-4 w-4 text-primary" />
        <div>
          <SectionKicker>Events Calendar</SectionKicker>
          <h2 className="mt-1 text-base font-bold text-slate-950">
            {new Intl.DateTimeFormat("en-KE", {
              month: "long",
              year: "numeric",
            }).format(today)}
          </h2>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-7 gap-1 text-center text-[11px] font-bold uppercase text-slate-400">
        {["S", "M", "T", "W", "T", "F", "S"].map((day, index) => (
          <span key={`${day}-${index}`}>{day}</span>
        ))}
      </div>
      <div className="mt-2 grid grid-cols-7 gap-1">
        {days.map((day, index) => {
          const hasEvent = day !== null && eventDays.has(day);
          return (
            <span
              key={`${day ?? "blank"}-${index}`}
              className={`grid h-9 place-items-center rounded-md text-xs font-bold ${
                day === null
                  ? "text-transparent"
                  : hasEvent
                    ? "bg-primary text-white"
                    : "bg-slate-50 text-slate-700"
              }`}
            >
              {day}
            </span>
          );
        })}
      </div>
      <div className="mt-4 grid gap-2">
        {events.length ? (
          events.slice(0, 5).map((event) => (
            <Link
              key={`${event.contentKind}-${event.id}`}
              href={recordHref(event)}
              className="group rounded-md border border-slate-200 p-3 transition hover:border-primary/30 hover:bg-primary/5"
            >
              <p className="text-xs font-bold uppercase tracking-[0.08em] text-primary">
                {recordDate(event)}
              </p>
              <p className="mt-1 line-clamp-2 text-sm font-bold leading-5 text-slate-900 group-hover:text-primary">
                {recordTitle(event)}
              </p>
            </Link>
          ))
        ) : (
          <p className="rounded-md border border-dashed border-slate-300 bg-slate-50 p-3 text-sm leading-6 text-slate-600">
            No events are published for this month yet.
          </p>
        )}
      </div>
    </aside>
  );
}

function MediaDeskSections({ records }: { records: ContentRecord[] }) {
  return (
    <div className="grid gap-5">
      {mediaDeskSections
        .filter((section) => section.id !== "gallery")
        .map((section) => {
        const sectionRecords = records
          .filter((record) => section.kinds.includes(record.contentKind))
          .slice(0, 3);

        return (
          <div key={section.id} id={section.id} className="scroll-mt-32">
            <ScrollReveal
              as="section"
              className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm lg:p-6"
            >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <SectionKicker>Media Desk</SectionKicker>
                <h2 className="mt-2 font-[family-name:var(--font-display)] text-2xl font-semibold leading-tight text-slate-950">
                  {section.title}
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-600">
                  {section.body}
                </p>
              </div>
              <Link
                href={section.href}
                className="inline-flex min-h-10 items-center gap-2 rounded-full border border-primary/20 px-4 text-sm font-bold text-primary transition hover:bg-primary hover:text-white"
              >
                View all
                <ArrowRight aria-hidden className="h-4 w-4" />
              </Link>
            </div>

            {sectionRecords.length ? (
              <ScrollRevealGroup
                className="mt-5 grid gap-4 md:grid-cols-3"
                staggerDelay={60}
              >
                {sectionRecords.map((record) => (
                  <RecordCard
                    key={`${section.id}-${record.contentKind}-${record.id}`}
                    record={record}
                    compact
                  />
                ))}
              </ScrollRevealGroup>
            ) : (
              <p className="mt-5 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-sm leading-6 text-slate-600">
                No {section.title.toLowerCase()} records are currently published.
              </p>
            )}
            </ScrollReveal>
          </div>
        );
      })}
    </div>
  );
}

function MediaDeskStack({ data, records }: { data: ContentListingData; records: ContentRecord[] }) {
  const section = mediaDeskSections.find((item) => item.id === data.mediaDeskSection);
  const emptyLabel = section?.title.toLowerCase() ?? kindLabel(data.kind).toLowerCase();

  if (data.mediaDeskSection === "gallery") {
    return (
      <div className="grid gap-5">
        <ScrollReveal
          as="section"
          className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm lg:p-6"
        >
          <div>
            <SectionKicker>{`${data.total} records`}</SectionKicker>
            <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl font-semibold leading-tight text-slate-950 sm:text-4xl">
              {data.title}
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-700">
              {section?.body ?? data.body}
            </p>
          </div>
          <ContentFilters data={data} visible={records.length} />
        </ScrollReveal>
        <MediaGalleryBento
          items={galleryBentoItems(records)}
          title="Published gallery"
          description="Image, video, and file records from the public media library."
        />
      </div>
    );
  }

  return (
    <ScrollReveal as="section" className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm lg:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <SectionKicker>{`${data.total} records`}</SectionKicker>
          <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl font-semibold leading-tight text-slate-950 sm:text-4xl">
            {data.title}
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-700">
            {section?.body ?? data.body}
          </p>
        </div>
        {data.categories.length ? (
          <div className="flex flex-wrap gap-2">
            {data.categories.slice(0, 6).map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="inline-flex min-h-8 items-center rounded-full border border-primary/20 bg-white px-3 text-xs font-bold text-primary transition hover:bg-primary hover:text-white"
              >
                {item.label}
              </Link>
            ))}
          </div>
        ) : null}
      </div>
      <ContentFilters data={data} visible={records.length} />

      {records.length ? (
        <ScrollRevealGroup className="mt-5 grid gap-3" staggerDelay={55}>
          {records.map((record) => (
            <Link
              key={`${record.contentKind}-${record.id}`}
              href={recordHref(record)}
              className="group grid gap-4 rounded-lg border border-slate-200 bg-white p-3 transition hover:border-primary/30 hover:bg-slate-50 sm:grid-cols-[180px_minmax(0,1fr)]"
            >
              <div className="aspect-[16/10] overflow-hidden rounded-md bg-slate-100">
                <ContentImage record={record} />
              </div>
              <div className="min-w-0 py-1">
                <div className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-[0.08em] text-primary">
                  <span>{categoryLabel(record)}</span>
                  {recordDate(record) ? (
                    <span className="text-slate-400">{recordDate(record)}</span>
                  ) : null}
                </div>
                <h2 className="mt-2 line-clamp-2 text-lg font-bold leading-6 text-slate-950 group-hover:text-primary">
                  {recordTitle(record)}
                </h2>
                {summarize(record, "") ? (
                  <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">
                    {summarize(record, "")}
                  </p>
                ) : null}
              </div>
            </Link>
          ))}
        </ScrollRevealGroup>
      ) : (
        <article className="mt-5 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-5 text-sm text-slate-600">
          No {emptyLabel} records are currently published.
        </article>
      )}
    </ScrollReveal>
  );
}

function ContentFilters({
  data,
  visible,
}: {
  data: ContentListingData;
  visible: number;
}) {
  const typeOptions =
    data.kind === "media"
      ? data.categories.map((item) => {
          const url = new URL(item.href, "https://kisiiuniversity.ac.ke");
          return {
            value: url.searchParams.get("type") ?? "",
            label: item.label,
          } satisfies ListFilterOption;
        }).filter((item) => item.value)
      : [];

  return (
    <PublicListFilterForm
      className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-3"
      gridClassName={
        typeOptions.length
          ? "grid gap-3 md:grid-cols-[minmax(220px,1fr)_auto] xl:grid-cols-[minmax(220px,1fr)_12rem_auto] xl:items-end"
          : "grid gap-3 md:grid-cols-[minmax(220px,1fr)_auto] md:items-end"
      }
      searchValue={data.filters.q}
      searchPlaceholder={`Search ${kindLabel(data.kind).toLowerCase()}`}
      selects={
        typeOptions.length
          ? [
              {
                name: "type",
                label: "Type",
                value: data.filters.type,
                allLabel: "All types",
                options: typeOptions,
              },
            ]
          : []
      }
      clearHref={data.href}
      total={data.total}
      visible={visible}
      buttonHeightClassName="h-10"
    />
  );
}

const gallerySpanPattern = [
  "sm:col-span-1 sm:row-span-2 md:col-span-1 md:row-span-3",
  "sm:col-span-2 sm:row-span-2 md:col-span-2 md:row-span-2",
  "sm:col-span-2 sm:row-span-2 md:col-span-1 md:row-span-3",
  "sm:col-span-1 sm:row-span-2 md:col-span-2 md:row-span-2",
  "sm:col-span-1 sm:row-span-2 md:col-span-1 md:row-span-3",
  "sm:col-span-2 sm:row-span-2 md:col-span-2 md:row-span-2",
];

function galleryBentoItems(records: ContentRecord[]): MediaGalleryBentoItem[] {
  return records
    .filter((record) => record.contentKind === "media")
    .map((record, index) => {
      const url = mediaUrl(record);
      const isVideo =
        record.media_type === "video" || record.mime_type?.startsWith("video/");
      const isImage =
        record.media_type === "image" || record.mime_type?.startsWith("image/");

      return {
        id: record.id,
        type: isVideo ? "video" : isImage ? "image" : "file",
        title: recordTitle(record),
        description: summarize(record, null),
        url,
        href: recordHref(record),
        span: gallerySpanPattern[index % gallerySpanPattern.length]!,
      };
    });
}

function MediaDeskListingPage({ data }: { data: ContentListingData }) {
  const records = data.featured
    ? data.records.filter((record) =>
        record.contentKind === "media"
          ? record.id !== data.featured?.id
          : record.slug !==
            (data.featured as Exclude<ContentRecord, { contentKind: "media" }>)
              .slug,
      )
    : data.records;

  return (
    <PageShell>
      <AboutPageLenis>
        <section className="w-full bg-[linear-gradient(180deg,#f8fbff_0%,#ffffff_70%,#f6f8fc_100%)] px-4 py-5 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
          <div className="grid w-full gap-5">
            <BreadcrumbTrail
              items={[{ label: "Home", href: "/" }, { label: "Media Desk" }]}
            />
            <div className="grid gap-5 xl:grid-cols-[240px_minmax(0,1fr)_320px] 2xl:grid-cols-[260px_minmax(0,1fr)_360px]">
              <aside className="xl:sticky xl:top-28 xl:self-start">
                <MediaDeskNav activeSection={data.mediaDeskSection} />
              </aside>
              <main className="min-w-0">
                {data.mediaDeskSection === "overview" ? (
                  <MediaDeskSections records={data.records} />
                ) : (
                  <MediaDeskStack data={data} records={records} />
                )}
              </main>
              <aside className="xl:sticky xl:top-28 xl:self-start">
                <CalendarPanel events={data.calendarEvents} />
              </aside>
            </div>
          </div>
        </section>
      </AboutPageLenis>
    </PageShell>
  );
}

export function ContentListingPage({ data }: { data: ContentListingData }) {
  if (data.mediaDeskSection) return <MediaDeskListingPage data={data} />;

  const records = data.featured
    ? data.records.filter((record) =>
        record.contentKind === "media"
          ? record.id !== data.featured?.id
          : record.slug !==
            (data.featured as Exclude<ContentRecord, { contentKind: "media" }>)
              .slug,
      )
    : data.records;

  return (
    <PageShell>
      <AboutPageLenis>
        <section className="w-full bg-[linear-gradient(180deg,#f8fbff_0%,#ffffff_70%,#f6f8fc_100%)] px-4 py-5 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
          <div className="mx-auto grid w-full max-w-[1680px] gap-5">
            <ListingHero data={data} />
            {data.featured ? (
              <ScrollReveal>
                <FeaturedRecord record={data.featured} />
              </ScrollReveal>
            ) : null}

            <ScrollReveal as="section" className="grid gap-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <SectionKicker>{`${data.total} records`}</SectionKicker>
                  <h2 className="mt-2 font-[family-name:var(--font-display)] text-2xl font-semibold text-slate-950">
                    {data.kind === "media" ? "Gallery" : "Latest records"}
                  </h2>
                </div>
                {data.categories.length ? (
                  <div className="flex flex-wrap gap-2">
                    {data.categories.slice(0, 6).map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="inline-flex min-h-8 items-center rounded-full border border-primary/20 bg-white px-3 text-xs font-bold text-primary transition hover:bg-primary hover:text-white"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                ) : null}
              </div>

              {records.length ? (
                <ScrollRevealGroup
                  className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4"
                  staggerDelay={70}
                >
                  {records.map((record) => (
                    <RecordCard
                      key={`${record.contentKind}-${record.id}`}
                      record={record}
                    />
                  ))}
                </ScrollRevealGroup>
              ) : data.featured ? null : (
                <article className="rounded-lg border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-600">
                  No records are currently published in this section.
                </article>
              )}
            </ScrollReveal>
          </div>
        </section>
      </AboutPageLenis>
    </PageShell>
  );
}

function EventAccess({ data }: { data: ContentDetailData }) {
  const record = data.record;
  if (record.contentKind !== "events" || !record.meeting_link) return null;

  return (
    <a
      href={record.meeting_link}
      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-bold text-white transition hover:bg-primary/90"
    >
      Open event link
      <ExternalLink aria-hidden className="h-4 w-4" />
    </a>
  );
}

function MediaDownload({ data }: { data: ContentDetailData }) {
  const record = data.record;
  if (record.contentKind !== "media") return null;
  const source = mediaUrl(record);
  if (!source) return null;

  return (
    <a
      href={source}
      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-bold text-white transition hover:bg-primary/90"
    >
      Open media
      <Download aria-hidden className="h-4 w-4" />
    </a>
  );
}

function StructuredValue({ value }: { value: unknown }) {
  if (value === null || value === undefined || value === "") return null;
  if (Array.isArray(value)) {
    return (
      <ul className="mt-2 grid gap-1.5">
        {value.map((item, index) => (
          <li
            key={index}
            className="rounded-lg bg-slate-50 px-3 py-2 text-sm leading-6 text-slate-700"
          >
            {typeof item === "object" && item !== null ? (
              <StructuredObject value={item as Record<string, unknown>} />
            ) : (
              String(item)
            )}
          </li>
        ))}
      </ul>
    );
  }
  if (typeof value === "object")
    return <StructuredObject value={value as Record<string, unknown>} />;
  return (
    <p className="mt-1 text-sm leading-6 text-slate-700">{String(value)}</p>
  );
}

function StructuredObject({ value }: { value: Record<string, unknown> }) {
  const hiddenKeys = new Set([
    "source",
    "source_url",
    "source_channel",
    "seed_asset",
    "legacy_id",
    "legacy_url",
    "migration_note",
  ]);

  return (
    <dl className="grid gap-2">
      {Object.entries(value)
        .filter(
          ([key, item]) =>
            !hiddenKeys.has(key) &&
            item !== null &&
            item !== undefined &&
            item !== "",
        )
        .map(([key, item]) => (
          <div key={key}>
            <dt className="text-xs font-bold uppercase tracking-[0.08em] text-slate-500">
              {key.replace(/_/g, " ")}
            </dt>
            <dd>
              <StructuredValue value={item} />
            </dd>
          </div>
        ))}
    </dl>
  );
}

function StructuredContentSection({ data }: { data: ContentDetailData }) {
  if (!data.structuredContent || !visibleStructuredEntries(data.structuredContent).length) {
    return null;
  }

  return (
    <ScrollReveal
      as="section"
      className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
    >
      <SectionKicker>Structured Details</SectionKicker>
      <div className="mt-4">
        <StructuredObject value={data.structuredContent} />
      </div>
    </ScrollReveal>
  );
}

const hiddenStructuredKeys = new Set([
  "source",
  "source_url",
  "source_channel",
  "seed_asset",
  "legacy_id",
  "legacy_url",
  "migration_note",
]);

function visibleStructuredEntries(value: Record<string, unknown>) {
  return Object.entries(value).filter(
    ([key, item]) =>
      !hiddenStructuredKeys.has(key) &&
      item !== null &&
      item !== undefined &&
      item !== "",
  );
}

function DetailBody({ data }: { data: ContentDetailData }) {
  if (data.record.contentKind === "media") {
    return (
      <ScrollReveal
        as="section"
        className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
      >
        <SectionKicker>Media Details</SectionKicker>
        {data.body ? (
          <p className="mt-3 text-sm leading-7 text-slate-700">{data.body}</p>
        ) : null}
      </ScrollReveal>
    );
  }

  return (
    <ScrollReveal
      as="article"
      className="rounded-lg border border-slate-200 bg-white px-5 py-6 shadow-sm sm:px-7 lg:px-9 lg:py-8"
    >
      <RichTextRenderer
        content={data.body}
        className="prose-slate max-w-none prose-p:text-base prose-p:leading-8 prose-headings:font-[family-name:var(--font-display)] prose-a:text-primary"
        emptyFallback={
          <p className="text-base leading-8 text-slate-700">{data.summary}</p>
        }
      />
    </ScrollReveal>
  );
}

function DetailHero({ data }: { data: ContentDetailData }) {
  return (
    <section className="overflow-hidden rounded-lg border border-primary/10 bg-white shadow-[0_20px_70px_-52px_rgba(30,64,175,0.65)]">
      <div className="px-5 py-6 sm:px-7 lg:px-9 lg:py-8">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex min-h-8 items-center rounded-full bg-primary/10 px-3 text-xs font-bold uppercase tracking-[0.08em] text-primary">
            {data.eyebrow}
          </span>
          {recordDate(data.record) ? (
            <span className="inline-flex min-h-8 items-center gap-2 rounded-full border border-primary/15 bg-primary/[0.03] px-3 text-xs font-bold uppercase tracking-[0.08em] text-slate-600">
              <CalendarDays aria-hidden className="h-3.5 w-3.5 text-primary" />
              {recordDate(data.record)}
            </span>
          ) : null}
        </div>
        <h1 className="mt-4 max-w-5xl font-[family-name:var(--font-display)] text-4xl font-semibold leading-[1.05] text-slate-950 sm:text-5xl xl:text-6xl">
          {data.title}
        </h1>
        {data.summary ? (
          <p className="mt-5 max-w-4xl text-base leading-8 text-slate-700 sm:text-lg">
            {data.summary}
          </p>
        ) : null}
        <div className="mt-6 flex flex-wrap items-center gap-3 text-sm font-semibold text-slate-600">
          {data.record.contentKind === "events" && present(data.record.location) ? (
            <span className="inline-flex min-h-10 items-center gap-2 rounded-full border border-slate-200 px-3">
              <MapPin aria-hidden className="h-4 w-4 text-primary" />
              {data.record.location}
            </span>
          ) : null}
          <EventAccess data={data} />
          <MediaDownload data={data} />
        </div>
      </div>

      <figure className="relative min-h-[300px] border-t border-primary/10 bg-slate-100 sm:min-h-[420px] lg:min-h-[520px]">
        <div className="absolute inset-0">
          <ContentImage record={data.record} large />
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-slate-950/35 to-transparent" />
        {data.heroImage ? (
          <figcaption className="absolute bottom-3 left-3 rounded-md bg-white/90 px-3 py-2 text-xs font-semibold leading-5 text-slate-600 shadow-sm backdrop-blur">
            {recordTitle(data.record)}
          </figcaption>
        ) : null}
      </figure>
    </section>
  );
}

function DetailSidebar({ data }: { data: ContentDetailData }) {
  return (
    <aside className="grid gap-4 xl:sticky xl:top-28 xl:self-start">
      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <SectionKicker>Continue</SectionKicker>
        <div className="mt-3 grid gap-2">
          <Link
            href={data.href}
            className="inline-flex min-h-11 items-center justify-between gap-3 rounded-md border border-primary/15 px-3 text-sm font-bold text-primary transition hover:bg-primary hover:text-white"
          >
            More {kindLabel(data.kind).toLowerCase()}
            <ArrowRight aria-hidden className="h-4 w-4" />
          </Link>
          <Link
            href="/media"
            className="inline-flex min-h-11 items-center justify-between gap-3 rounded-md border border-slate-200 px-3 text-sm font-bold text-slate-700 transition hover:border-primary/30 hover:text-primary"
          >
            Media Desk
            <ArrowRight aria-hidden className="h-4 w-4" />
          </Link>
        </div>
      </section>
      {data.relatedLinks.length ? (
        <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <SectionKicker>Related Links</SectionKicker>
          <div className="mt-3 grid gap-2">
            {data.relatedLinks.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="group flex min-h-11 items-center gap-2 rounded-md border border-slate-200 px-3 text-sm font-semibold text-slate-700 transition hover:border-primary/30 hover:text-primary"
              >
                <LinkIcon
                  aria-hidden
                  className="h-4 w-4 shrink-0 text-primary"
                />
                <span className="min-w-0 flex-1">{item.label}</span>
                <ExternalLink
                  aria-hidden
                  className="h-3.5 w-3.5 shrink-0 text-slate-300 group-hover:text-primary"
                />
              </a>
            ))}
          </div>
        </section>
      ) : null}
    </aside>
  );
}

function RelatedContentSection({ data }: { data: ContentDetailData }) {
  if (!data.related.length) return null;

  return (
    <ScrollReveal as="section" className="grid gap-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <SectionKicker>Related Content</SectionKicker>
          <h2 className="mt-2 font-[family-name:var(--font-display)] text-2xl font-semibold text-slate-950">
            More from {kindLabel(data.kind)}
          </h2>
        </div>
        <Link
          href={data.href}
          className="inline-flex min-h-10 items-center gap-2 text-sm font-bold text-primary"
        >
          View all
          <ArrowRight aria-hidden className="h-4 w-4" />
        </Link>
      </div>
      <ScrollRevealGroup
        className="grid gap-4 md:grid-cols-2 xl:grid-cols-4"
        staggerDelay={70}
      >
        {data.related.map((record) => (
          <RecordCard
            key={`${record.contentKind}-${record.id}`}
            record={record}
            compact
          />
        ))}
      </ScrollRevealGroup>
    </ScrollReveal>
  );
}

export function ContentDetailPage({ data }: { data: ContentDetailData }) {
  return (
    <PageShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(data.jsonLd) }}
      />
      <AboutPageLenis>
        <section className="w-full bg-[linear-gradient(180deg,#f8fbff_0%,#ffffff_58%,#f6f8fc_100%)] px-4 py-5 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
          <div className="mx-auto grid w-full max-w-[1680px] gap-5">
            <BreadcrumbTrail
              items={[
                { label: "Home", href: "/" },
                { label: "Media Desk", href: "/media" },
                { label: kindLabel(data.kind), href: data.href },
                { label: data.title },
              ]}
            />

            <div className="grid w-full gap-5 xl:grid-cols-[240px_minmax(0,1fr)_320px] 2xl:grid-cols-[260px_minmax(0,1fr)_360px]">
              <aside className="xl:sticky xl:top-28 xl:self-start">
                <MediaDeskNav activeSection={data.mediaDeskSection} />
              </aside>

              <div className="grid min-w-0 gap-5">
                <DetailHero data={data} />
                <main className="grid min-w-0 gap-5">
                  <DetailBody data={data} />
                  <StructuredContentSection data={data} />
                  <RelatedContentSection data={data} />
                </main>
              </div>

              <DetailSidebar data={data} />
            </div>
          </div>
        </section>
      </AboutPageLenis>
    </PageShell>
  );
}
