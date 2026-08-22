import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  ChevronRight,
  Download,
  ExternalLink,
  FileText,
  Image as ImageIcon,
  LinkIcon,
  MapPin,
  Megaphone,
  Newspaper,
  PlayCircle,
} from "lucide-react";
import { RichTextRenderer } from "@ksu/ui/rich-text-renderer";
import {
  AmbientPageBackground,
  CampusPageHeader,
  ListPagination,
  ScrollReveal,
  ScrollRevealGroup,
} from "@ksu/ui/components";
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
import { NewsletterSubscribeForm } from "@/components/home/newsletter-subscribe-form";
import {
  categoryLabel,
  mediaPlaybackUrl,
  mediaUrl,
  present,
  recordDate,
  recordHref,
  recordTitle,
  summarize,
  type ContentDetailData,
  type ContentListingData,
  type ContentRecord,
} from "@/lib/content-page-data";

function kindLabel(
  kind: ContentListingData["kind"] | ContentDetailData["kind"],
) {
  if (kind === "blogs") return "Stories";
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

function listingBaseHref(data: ContentListingData) {
  const sp = new URLSearchParams();
  if (data.filters.q) sp.set("q", data.filters.q);
  if (data.filters.type) sp.set("type", data.filters.type);
  if (data.filters.entity_type) sp.set("entity_type", data.filters.entity_type);
  if (data.filters.entity_id) sp.set("entity_id", data.filters.entity_id);
  const search = sp.toString();
  return `${data.href}${search ? `?${search}` : ""}`;
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
      className="group grid min-w-0 overflow-hidden rounded-2xl bg-white ring-1 ring-primary/10 transition-transform hover:-translate-y-0.5"
    >
      <div
        className={
          compact
            ? "aspect-[16/9] overflow-hidden bg-surface-muted"
            : "aspect-[4/3] overflow-hidden bg-surface-muted"
        }
      >
        <ContentImage record={record} />
      </div>
      <div className="p-4">
        <div className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-[0.08em] text-primary">
          <span>{categoryLabel(record)}</span>
          {date ? <span className="text-muted-foreground/70">{date}</span> : null}
        </div>
        <h3 className="mt-2 line-clamp-2 font-[family-name:var(--font-display)] text-lg font-normal leading-6 tracking-tight text-primary group-hover:underline">
          {recordTitle(record)}
        </h3>
        {summary ? (
          <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted-foreground">
            {summary}
          </p>
        ) : null}
        <span className="mt-4 inline-flex min-h-11 items-center gap-1.5 text-sm font-bold text-primary">
          {actionLabel}
          <ArrowRight aria-hidden className="h-3.5 w-3.5" />
        </span>
      </div>
    </Link>
  );
}

function ListingHero({ data }: { data: ContentListingData }) {
  return (
    <section className="rounded-lg border border-border bg-white p-5 shadow-sm lg:p-6">
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_24rem] lg:items-end">
        <div>
          {/* Breadcrumb, title and body sit on the campus header band above. */}
          <SectionKicker>{data.eyebrow}</SectionKicker>
          <h2 className="mt-2 font-[family-name:var(--font-display)] text-2xl font-semibold leading-tight text-foreground sm:text-3xl">
            Browse {kindLabel(data.kind).toLowerCase()}
          </h2>
        </div>
        <nav
          className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1"
          aria-label="Content sections"
        >
          {data.nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group flex min-h-11 items-center justify-between gap-3 rounded-lg border border-border px-3 text-sm font-semibold text-muted-foreground transition-colors hover:border-primary/30 hover:text-primary"
            >
              {item.label}
              <ArrowRight
                aria-hidden
                className="h-4 w-4 text-muted-foreground/60 transition-transform duration-150 group-hover:translate-x-0.5 group-hover:text-primary"
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
      className="group grid overflow-hidden rounded-lg border border-border bg-white shadow-sm transition-colors hover:border-primary/30 lg:grid-cols-[minmax(0,1fr)_22rem]"
    >
      <div className="p-5 lg:p-6">
        <SectionKicker>{categoryLabel(record)}</SectionKicker>
        <h2 className="mt-2 font-[family-name:var(--font-display)] text-2xl font-semibold leading-tight text-foreground group-hover:text-primary sm:text-3xl">
          {recordTitle(record)}
        </h2>
        {summarize(record, "") ? (
          <p className="mt-3 max-w-3xl text-sm leading-7 text-muted-foreground">
            {summarize(record, "")}
          </p>
        ) : null}
        <div className="mt-5 flex flex-wrap gap-3 text-xs font-bold uppercase tracking-[0.08em] text-muted-foreground">
          {recordDate(record) ? <span>{recordDate(record)}</span> : null}
          <span>{kindLabel(record.contentKind)}</span>
        </div>
      </div>
      <div className="min-h-64 bg-surface-muted">
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
    title: "Stories",
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
      className="-mx-4 overflow-x-auto border-y border-primary/10 bg-white px-4 sm:mx-0 sm:overflow-visible sm:rounded-2xl sm:border sm:px-5"
    >
      <div className="flex min-w-max gap-2 sm:grid sm:min-w-0 sm:grid-cols-3 sm:gap-0 xl:grid-cols-6">
        <Link
          href="/media"
          className={`relative flex min-h-12 items-center justify-center rounded-2xl px-4 text-sm font-bold transition-colors sm:rounded-none ${
            activeSection === "overview"
              ? "bg-primary text-white sm:bg-transparent sm:text-primary sm:after:absolute sm:after:inset-x-4 sm:after:bottom-0 sm:after:h-0.5 sm:after:bg-secondary"
              : "text-muted-foreground hover:bg-primary/5 hover:text-primary sm:hover:bg-transparent"
          }`}
        >
          Latest
        </Link>
        {mediaDeskSections.map((item) => (
          <Link
            key={item.id}
            href={item.href}
            className={`relative flex min-h-12 items-center justify-center rounded-2xl px-4 text-sm font-bold transition-colors sm:rounded-none ${
              activeSection === item.id
                ? "bg-primary text-white sm:bg-transparent sm:text-primary sm:after:absolute sm:after:inset-x-4 sm:after:bottom-0 sm:after:h-0.5 sm:after:bg-secondary"
                : "text-muted-foreground hover:bg-primary/5 hover:text-primary sm:hover:bg-transparent"
            }`}
          >
            {item.title}
          </Link>
        ))}
      </div>
    </nav>
  );
}

function EventBrief({ record }: { record: ContentRecord }) {
  if (record.contentKind !== "events") return null;
  const date = record.start_date ? new Date(record.start_date) : null;
  const validDate = date && !Number.isNaN(date.getTime()) ? date : null;

  return (
    <Link href={recordHref(record)} className="group grid grid-cols-[3.25rem_1fr_auto] items-center gap-3 border-t border-primary/10 py-3 first:border-t-0">
      <span className="grid h-13 place-items-center rounded-2xl ring-1 ring-primary/15">
        <span className="text-[0.62rem] font-bold uppercase tracking-wider text-secondary">{validDate?.toLocaleDateString("en-KE", { month: "short" }) ?? "Date"}</span>
        <span className="-mt-2 font-[family-name:var(--font-display)] text-xl text-primary">{validDate?.getDate() ?? "—"}</span>
      </span>
      <span className="min-w-0">
        <span className="line-clamp-2 font-[family-name:var(--font-display)] text-sm leading-5 text-primary group-hover:underline">{recordTitle(record)}</span>
        {record.location ? <span className="mt-1 flex items-center gap-1 text-xs text-muted-foreground"><MapPin aria-hidden className="h-3 w-3" />{record.location}</span> : null}
      </span>
      <ChevronRight aria-hidden className="h-4 w-4 text-primary" />
    </Link>
  );
}

function MediaLead({ record }: { record: ContentRecord }) {
  return (
    <Link href={recordHref(record)} className="group grid min-w-0 overflow-hidden rounded-2xl bg-white ring-1 ring-primary/10 lg:grid-rows-[minmax(18rem,1fr)_auto]">
      <div className="aspect-[16/10] min-h-0 overflow-hidden bg-surface-muted lg:aspect-auto">
        <div className="h-full transition-transform duration-500 motion-safe:group-hover:scale-[1.03]"><ContentImage record={record} large /></div>
      </div>
      <div className="p-5 sm:p-6">
        <div className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary"><span>{categoryLabel(record)}</span>{recordDate(record) ? <span className="text-muted-foreground">{recordDate(record)}</span> : null}</div>
        <h2 className="mt-3 font-[family-name:var(--font-display)] text-2xl font-normal leading-tight tracking-tight text-primary sm:text-3xl">{recordTitle(record)}</h2>
        {summarize(record, "") ? <p className="mt-3 line-clamp-2 text-sm leading-6 text-muted-foreground">{summarize(record, "")}</p> : null}
        <span className="mt-4 inline-flex min-h-11 items-center gap-2 text-sm font-bold text-primary group-hover:underline">Read story <ArrowRight aria-hidden className="h-4 w-4" /></span>
      </div>
    </Link>
  );
}

function LatestEditorialCard({ record, wide = false }: { record: ContentRecord; wide?: boolean }) {
  return (
    <Link href={recordHref(record)} className={`group grid min-w-0 grid-cols-[7rem_minmax(0,1fr)] overflow-hidden rounded-2xl bg-white ring-1 ring-primary/10 transition-transform hover:-translate-y-0.5 ${wide ? "md:col-span-2 md:grid-cols-[1.15fr_.85fr]" : "md:block"}`}>
      <div className={`min-h-28 overflow-hidden bg-surface-muted ${wide ? "md:aspect-auto" : "md:aspect-[16/10] md:min-h-0"}`}><ContentImage record={record} large={wide} /></div>
      <div className="p-4 sm:p-5">
        <div className="flex flex-wrap gap-2 text-[0.68rem] font-bold uppercase tracking-wider text-primary"><span>{categoryLabel(record)}</span>{recordDate(record) ? <span className="text-muted-foreground">{recordDate(record)}</span> : null}</div>
        <h3 className={`mt-2 font-[family-name:var(--font-display)] font-normal leading-tight tracking-tight text-primary group-hover:underline ${wide ? "text-xl sm:text-2xl" : "text-lg"}`}>{recordTitle(record)}</h3>
        {wide && summarize(record, "") ? <p className="mt-3 line-clamp-3 text-sm leading-6 text-muted-foreground">{summarize(record, "")}</p> : null}
      </div>
    </Link>
  );
}

function MediaDeskSections({ data }: { data: ContentListingData }) {
  const editorial = data.records.filter((record) => record.contentKind !== "media");
  const lead = data.featured ?? editorial[0] ?? null;
  const latest = editorial.filter((record) => record !== lead && record.contentKind !== "announcements" && record.contentKind !== "events").slice(0, 5);
  const events = (data.calendarEvents?.length ? data.calendarEvents : editorial.filter((record) => record.contentKind === "events")).slice(0, 2);
  const announcements = editorial.filter((record) => record.contentKind === "announcements").slice(0, 2);
  const compactGallerySpans = [
    "col-span-1 row-span-2 sm:col-span-1 sm:row-span-2",
    "col-span-1 row-span-1 sm:col-span-1 sm:row-span-1",
    "col-span-1 row-span-1 sm:col-span-1 sm:row-span-1",
    "col-span-1 row-span-1 sm:col-span-1 sm:row-span-1",
    "col-span-1 row-span-1 sm:col-span-1 sm:row-span-1",
  ];
  const galleryItems = galleryBentoItems(data.records.filter((record) => record.contentKind === "media").slice(0, 5)).map((item, index) => ({ ...item, span: compactGallerySpans[index] ?? compactGallerySpans[4]! }));

  return (
    <div className="grid gap-10 lg:gap-14">
      {(lead || events.length || announcements.length) ? <section className="grid min-w-0 gap-5 lg:grid-cols-[minmax(0,1.7fr)_minmax(19rem,.9fr)]">
        {lead ? <MediaLead record={lead} /> : null}
        <div className="grid min-w-0 content-start gap-4">
          {events.length ? <div className="rounded-2xl bg-white p-5 ring-1 ring-primary/10"><div className="flex items-center gap-3"><CalendarDays aria-hidden className="h-5 w-5 text-secondary" /><h2 className="font-[family-name:var(--font-display)] text-xl font-normal text-primary">Upcoming events</h2></div><div className="mt-3">{events.map((record) => <EventBrief key={`event-${record.id}`} record={record} />)}</div><Link href="/media/events" className="mt-2 inline-flex min-h-11 items-center gap-2 text-sm font-bold text-primary hover:underline">View all <ArrowRight aria-hidden className="h-4 w-4" /></Link></div> : null}
          {announcements.length ? <div className="rounded-2xl bg-white p-5 ring-1 ring-primary/10"><div className="flex items-center gap-3"><Megaphone aria-hidden className="h-5 w-5 text-secondary" /><h2 className="font-[family-name:var(--font-display)] text-xl font-normal text-primary">Official announcements</h2></div><div className="mt-3 divide-y divide-primary/10">{announcements.map((record) => <Link key={`notice-${record.id}`} href={recordHref(record)} className="block py-3 text-sm leading-6 text-primary hover:underline">{recordTitle(record)}{recordDate(record) ? <span className="mt-1 block text-xs text-muted-foreground">{recordDate(record)}</span> : null}</Link>)}</div><Link href="/media/announcements" className="mt-2 inline-flex min-h-11 items-center gap-2 text-sm font-bold text-primary hover:underline">View all <ArrowRight aria-hidden className="h-4 w-4" /></Link></div> : null}
        </div>
      </section> : null}

      {latest.length ? <ScrollReveal as="section"><div className="flex items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-secondary">University communications</p><h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-normal tracking-tight text-primary sm:text-4xl">Latest from <em className="italic">Kisii University.</em></h2></div><Link href="/media/news" className="hidden min-h-11 items-center gap-2 text-sm font-bold text-primary hover:underline sm:inline-flex">View all <ArrowRight aria-hidden className="h-4 w-4" /></Link></div><div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">{latest.map((record, index) => <LatestEditorialCard key={`latest-${record.contentKind}-${record.id}`} record={record} wide={index === 0} />)}</div></ScrollReveal> : null}

      {galleryItems.length ? <ScrollReveal as="section"><div className="mb-6 flex items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-secondary">In pictures</p><h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-normal tracking-tight text-primary sm:text-4xl">University <em className="italic">gallery.</em></h2></div><Link href="/media/gallery" className="inline-flex min-h-11 items-center gap-2 text-sm font-bold text-primary hover:underline">View gallery <ArrowRight aria-hidden className="h-4 w-4" /></Link></div><MediaGalleryBento compact items={galleryItems} title="University gallery" description="Published photographs and visual stories from Kisii University." /></ScrollReveal> : null}

      <section className="grid gap-6 overflow-hidden rounded-2xl bg-primary px-5 py-8 text-white sm:px-8 lg:grid-cols-[.8fr_1.2fr] lg:items-center lg:px-10"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-secondary">University updates</p><h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-normal tracking-tight sm:text-4xl">Stay <em className="italic">informed.</em></h2><p className="mt-3 max-w-xl text-sm leading-6 text-white/70">Receive the latest university news, events, stories, and official announcements.</p></div><div className="min-w-0"><NewsletterSubscribeForm variant="dark" /><Link href="/contact" className="mt-3 inline-flex min-h-11 items-center gap-2 text-sm font-bold text-white hover:underline">Media contacts <ArrowRight aria-hidden className="h-4 w-4" /></Link></div></section>
    </div>
  );
}

function MediaDeskStack({
  data,
  records,
}: {
  data: ContentListingData;
  records: ContentRecord[];
}) {
  const section = mediaDeskSections.find(
    (item) => item.id === data.mediaDeskSection,
  );
  const emptyLabel =
    section?.title.toLowerCase() ?? kindLabel(data.kind).toLowerCase();

  if (data.mediaDeskSection === "gallery") {
    return (
      <div className="grid gap-8">
        <ScrollReveal
          as="section"
          className="rounded-2xl bg-white p-5 ring-1 ring-primary/10 lg:p-6"
        >
          <div>
            {/* Title and body sit on the campus header band above. */}
            <SectionKicker>{`${data.total} records`}</SectionKicker>
            <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-normal leading-tight tracking-tight text-primary sm:text-4xl">
              Explore the <em className="italic">gallery.</em>
            </h2>
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

  const lead = records[0] ?? null;
  const remaining = records.slice(1);

  return (
    <div className="grid gap-8">
    <ScrollReveal as="section" className="rounded-2xl bg-white p-5 ring-1 ring-primary/10 lg:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          {/* The page title and body sit on the campus header band above, so
              this card carries only the record count and the filters. */}
          <SectionKicker>{`${data.total} records`}</SectionKicker>
          <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-normal leading-tight tracking-tight text-primary sm:text-4xl">
            Browse <em className="italic">{kindLabel(data.kind).toLowerCase()}.</em>
          </h2>
          {section?.body ? (
            <p className="mt-3 max-w-3xl text-sm leading-7 text-muted-foreground">
              {section.body}
            </p>
          ) : null}
        </div>
        {data.categories.length ? (
          <div className="flex flex-wrap gap-2">
            {data.categories.slice(0, 6).map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="inline-flex min-h-8 items-center rounded-full border border-primary/20 bg-white px-3 text-xs font-bold text-primary transition-colors hover:bg-primary hover:text-white"
              >
                {item.label}
              </Link>
            ))}
          </div>
        ) : null}
      </div>
      <ContentFilters data={data} visible={records.length} />

    </ScrollReveal>
      {lead ? <ScrollReveal><MediaLead record={lead} /></ScrollReveal> : (
        <article className="rounded-2xl border border-dashed border-border bg-surface-subtle p-5 text-sm text-muted-foreground">
          No {emptyLabel} records are currently published.
        </article>
      )}
      {remaining.length ? <ScrollRevealGroup className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" staggerDelay={60}>{remaining.map((record) => <RecordCard key={`${record.contentKind}-${record.id}`} record={record} />)}</ScrollRevealGroup> : null}
      <ListPagination
        page={data.page}
        totalPages={Math.ceil(data.total / data.perPage)}
        total={data.total}
        perPage={data.perPage}
        baseHref={listingBaseHref(data)}
      />
    </div>
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
      ? data.categories
          .map((item) => {
            const url = new URL(item.href, "https://kisiiuniversity.ac.ke");
            return {
              value: url.searchParams.get("type") ?? "",
              label: item.label,
            } satisfies ListFilterOption;
          })
          .filter((item) => item.value)
      : [];
  const entityTypeOptions: ListFilterOption[] = [
    { value: "school", label: "School" },
    { value: "department", label: "Department" },
  ];
  const entityOptions =
    data.filters.entity_type === "department"
      ? (data.entityOptions?.departments ?? [])
      : (data.entityOptions?.schools ?? []);
  const entitySelects: Array<{
    name: string;
    label: string;
    value?: string;
    allLabel: string;
    options: ListFilterOption[];
  }> =
    data.kind === "news" || data.kind === "events"
      ? [
          {
            name: "entity_type",
            label: "Entity",
            value: data.filters.entity_type,
            allLabel: "All entities",
            options: entityTypeOptions,
          },
          {
            name: "entity_id",
            label:
              data.filters.entity_type === "department"
                ? "Department"
                : "School",
            value: data.filters.entity_id,
            allLabel:
              data.filters.entity_type === "department"
                ? "All departments"
                : "All schools",
            options: entityOptions.map((item) => ({
              value: item.href,
              label: item.label,
            })),
          },
        ]
      : [];

  return (
    <PublicListFilterForm
      className="mt-5 rounded-2xl border border-primary/10 bg-surface-subtle p-3"
      searchValue={data.filters.q}
      searchPlaceholder={`Search ${kindLabel(data.kind).toLowerCase()}`}
      selects={[
        ...entitySelects,
        ...(typeOptions.length
          ? [
              {
                name: "type",
                label: "Type",
                value: data.filters.type,
                allLabel: "All types",
                options: typeOptions,
              },
            ]
          : []),
      ]}
      clearHref={data.href}
      total={data.total}
      visible={visible}
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
      if (!isVideo && !isImage) return null;

      return {
        id: record.id,
        type: isVideo ? "video" : "image",
        title: recordTitle(record),
        description: summarize(record, null),
        url: isVideo ? mediaPlaybackUrl(record) : url,
        href: recordHref(record),
        span: gallerySpanPattern[index % gallerySpanPattern.length]!,
      };
    })
    .filter(Boolean) as MediaGalleryBentoItem[];
}

function MediaDeskListingPage({ data }: { data: ContentListingData }) {
  const records = data.records;

  return (
    <PageShell>
      <AboutPageLenis>
        <CampusPageHeader
          variant="compact"
          eyebrow={
            data.mediaDeskSection === "overview"
              ? "University communications"
              : data.eyebrow
          }
          title={data.title}
          description={data.body}
          breadcrumbs={
            data.mediaDeskSection === "overview"
              ? [{ label: "Home", href: "/" }, { label: "Media Desk" }]
              : [
                  { label: "Home", href: "/" },
                  { label: "Media Desk", href: "/media" },
                  { label: data.title },
                ]
          }
          seed={data.href}
        />
        <AmbientPageBackground variant="academic" intensity="soft">
          <section className="w-full px-5 py-8 sm:px-8 lg:px-16 lg:py-12 xl:px-20">
            <div className="mx-auto grid w-full max-w-7xl gap-8">
              <MediaDeskNav activeSection={data.mediaDeskSection} />
              <div className="min-w-0">
                <div className="min-w-0">
                  {data.mediaDeskSection === "overview" ? (
                    <MediaDeskSections data={data} />
                  ) : (
                    <MediaDeskStack data={data} records={records} />
                  )}
                </div>
              </div>
            </div>
          </section>
        </AmbientPageBackground>
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
        <CampusPageHeader
          variant="compact"
          eyebrow={data.eyebrow}
          title={data.title}
          description={data.body}
          breadcrumbs={[
            { label: "Home", href: "/" },
            { label: kindLabel(data.kind) },
          ]}
          seed={data.href}
        />
        <section className="w-full bg-[linear-gradient(180deg,hsl(var(--surface-subtle))_0%,#ffffff_70%,hsl(var(--surface-muted))_100%)] px-4 py-5 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
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
                  <h2 className="mt-2 font-[family-name:var(--font-display)] text-2xl font-semibold text-foreground">
                    {data.kind === "media" ? "Gallery" : "Latest records"}
                  </h2>
                </div>
                {data.categories.length ? (
                  <div className="flex flex-wrap gap-2">
                    {data.categories.slice(0, 6).map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="inline-flex min-h-8 items-center rounded-full border border-primary/20 bg-white px-3 text-xs font-bold text-primary transition-colors hover:bg-primary hover:text-white"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                ) : null}
              </div>

              {records.length ? (
                <ScrollRevealGroup
                  className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
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
                <article className="rounded-lg border border-dashed border-border bg-white p-6 text-sm text-muted-foreground">
                  No records are currently published in this section.
                </article>
              )}
              <ListPagination
                page={data.page}
                totalPages={Math.ceil(data.total / data.perPage)}
                total={data.total}
                perPage={data.perPage}
                baseHref={listingBaseHref(data)}
              />
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
      className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-secondary px-5 text-xs font-bold uppercase text-foreground transition-transform hover:-translate-y-0.5"
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
      className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-primary px-5 text-xs font-bold uppercase text-white transition-transform hover:-translate-y-0.5"
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
            className="rounded-lg bg-surface-subtle px-3 py-2 text-sm leading-6 text-muted-foreground"
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
    <p className="mt-1 text-sm leading-6 text-muted-foreground">{String(value)}</p>
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
            <dt className="text-xs font-bold uppercase tracking-[0.08em] text-muted-foreground">
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
  if (
    !data.structuredContent ||
    !visibleStructuredEntries(data.structuredContent).length
  ) {
    return null;
  }

  return (
    <ScrollReveal
      as="section"
      className="rounded-2xl bg-white p-5 ring-1 ring-primary/10"
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

function GallerySection({ data }: { data: ContentDetailData }) {
  if (data.galleryImages.length === 0) return null;

  return (
    <ScrollReveal
      as="section"
      className="rounded-2xl bg-white p-5 ring-1 ring-primary/10"
    >
      <SectionKicker>Gallery</SectionKicker>
      <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {data.galleryImages.map((image, index) => (
          <a
            key={index}
            href={image.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative overflow-hidden rounded-2xl bg-surface-muted ring-1 ring-primary/10"
          >
            <img
              src={image.url}
              alt={image.alt || image.title || `Gallery image ${index + 1}`}
              className="aspect-[4/3] w-full object-cover transition-transform duration-500 motion-safe:group-hover:scale-[1.03]"
            />
            {image.title ? (
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-brand-overlay/70 to-transparent p-3">
                <p className="line-clamp-1 text-xs font-semibold text-white">
                  {image.title}
                </p>
              </div>
            ) : null}
          </a>
        ))}
      </div>
    </ScrollReveal>
  );
}

function SupportingMediaSection({ data }: { data: ContentDetailData }) {
  const videos = data.mediaAssets.filter(
    (asset) => asset.role === "video" && asset.id !== data.coverVideo?.id,
  );
  const downloads = data.mediaAssets.filter((asset) =>
    ["document", "attachment"].includes(asset.role),
  );
  if (!videos.length && !downloads.length) return null;

  return (
    <ScrollReveal as="section" className="grid gap-5">
      {videos.length ? (
        <div>
          <SectionKicker>Videos</SectionKicker>
          <div className="mt-3 grid gap-4 md:grid-cols-2">
            {videos.map((asset) => (
              <figure
                key={asset.id}
                className="overflow-hidden rounded-lg border border-border bg-brand-overlay"
              >
                <video
                  controls
                  preload="metadata"
                  className="aspect-video w-full"
                  src={asset.url}
                >
                  Your browser does not support embedded video.
                </video>
                <figcaption className="flex items-center gap-2 bg-white px-4 py-3 text-sm font-semibold text-foreground">
                  <PlayCircle aria-hidden className="h-4 w-4 text-primary" />
                  {asset.title || asset.filename || "Supporting video"}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      ) : null}
      {downloads.length ? (
        <div>
          <SectionKicker>Downloads and attachments</SectionKicker>
          <div className="mt-3 divide-y divide-slate-200 border-y border-border">
            {downloads.map((asset) => (
              <a
                key={asset.id}
                href={asset.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex min-h-14 items-center gap-3 py-3 text-sm font-semibold text-foreground transition-colors hover:text-primary"
              >
                <FileText aria-hidden className="h-5 w-5 text-primary" />
                <span className="min-w-0 flex-1 truncate">
                  {asset.title || asset.filename || "Download attachment"}
                </span>
                <Download aria-hidden className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>
      ) : null}
    </ScrollReveal>
  );
}

function DetailBody({ data }: { data: ContentDetailData }) {
  if (data.record.contentKind === "media") {
    return (
      <ScrollReveal
        as="section"
        className="rounded-2xl bg-white p-5 ring-1 ring-primary/10"
      >
        <SectionKicker>Media Details</SectionKicker>
        {data.body ? (
          <p className="mt-3 text-sm leading-7 text-muted-foreground">{data.body}</p>
        ) : null}
      </ScrollReveal>
    );
  }

  return (
    <ScrollReveal
      as="article"
      className="rounded-2xl bg-white px-5 py-6 ring-1 ring-primary/10 sm:px-7 lg:px-9 lg:py-8"
    >
      <RichTextRenderer
        content={data.body}
        className="prose-slate max-w-none prose-p:text-base prose-p:leading-8 prose-headings:font-[family-name:var(--font-display)] prose-a:text-primary"
        emptyFallback={
          <p className="text-base leading-8 text-muted-foreground">{data.summary}</p>
        }
      />
    </ScrollReveal>
  );
}

function DetailHero({ data }: { data: ContentDetailData }) {
  return (
    <section className="overflow-hidden rounded-2xl bg-white ring-1 ring-primary/10">
      <div className="px-5 py-6 sm:px-7 lg:px-9 lg:py-8">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex min-h-8 items-center rounded-full bg-primary/10 px-3 text-xs font-bold uppercase tracking-[0.08em] text-primary">
            {data.eyebrow}
          </span>
          {recordDate(data.record) ? (
            <span className="inline-flex min-h-8 items-center gap-2 rounded-full border border-primary/15 bg-primary/[0.03] px-3 text-xs font-bold uppercase tracking-[0.08em] text-muted-foreground">
              <CalendarDays aria-hidden className="h-3.5 w-3.5 text-primary" />
              {recordDate(data.record)}
            </span>
          ) : null}
        </div>
        <h1 className="mt-4 max-w-5xl font-[family-name:var(--font-display)] text-4xl font-normal leading-[1.05] tracking-tight text-primary sm:text-5xl xl:text-6xl">
          {data.title}
        </h1>
        {data.summary ? (
          <p className="mt-5 max-w-4xl text-base leading-8 text-muted-foreground sm:text-lg">
            {data.summary}
          </p>
        ) : null}
        <div className="mt-6 flex flex-wrap items-center gap-3 text-sm font-semibold text-muted-foreground">
          {data.record.contentKind === "events" &&
          present(data.record.location) ? (
            <span className="inline-flex min-h-10 items-center gap-2 rounded-full border border-border px-3">
              <MapPin aria-hidden className="h-4 w-4 text-primary" />
              {data.record.location}
            </span>
          ) : null}
          <EventAccess data={data} />
          <MediaDownload data={data} />
        </div>
      </div>

      <figure className="relative min-h-[300px] border-t border-primary/10 bg-surface-muted sm:min-h-[420px] lg:min-h-[520px]">
        <div className="absolute inset-0">
          {data.coverVideo ? (
            <video
              controls
              preload="metadata"
              poster={data.videoPoster?.url ?? data.heroImage ?? undefined}
              className="h-full w-full bg-brand-overlay object-contain"
              src={data.coverVideo.url}
            >
              Your browser does not support embedded video.
            </video>
          ) : (
            <ContentImage record={data.record} large />
          )}
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-brand-overlay/35 to-transparent" />
        {data.heroImage ? (
          <figcaption className="absolute bottom-3 left-3 rounded-md bg-white/90 px-3 py-2 text-xs font-semibold leading-5 text-muted-foreground shadow-sm backdrop-blur">
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
      <section className="rounded-2xl bg-white p-4 ring-1 ring-primary/10">
        <SectionKicker>Continue</SectionKicker>
        <div className="mt-3 grid gap-2">
          <Link
            href={data.href}
            className="inline-flex min-h-11 items-center justify-between gap-3 rounded-2xl border border-primary/15 px-3 text-sm font-bold text-primary transition-colors hover:bg-primary hover:text-white"
          >
            More {kindLabel(data.kind).toLowerCase()}
            <ArrowRight aria-hidden className="h-4 w-4" />
          </Link>
          <Link
            href="/media"
            className="inline-flex min-h-11 items-center justify-between gap-3 rounded-2xl border border-border px-3 text-sm font-bold text-muted-foreground transition-colors hover:border-primary/30 hover:text-primary"
          >
            Media Desk
            <ArrowRight aria-hidden className="h-4 w-4" />
          </Link>
        </div>
      </section>
      {data.relatedLinks.length ? (
        <section className="rounded-2xl bg-white p-4 ring-1 ring-primary/10">
          <SectionKicker>Related Links</SectionKicker>
          <div className="mt-3 grid gap-2">
            {data.relatedLinks.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="group flex min-h-11 items-center gap-2 rounded-2xl border border-border px-3 text-sm font-semibold text-muted-foreground transition-colors hover:border-primary/30 hover:text-primary"
              >
                <LinkIcon
                  aria-hidden
                  className="h-4 w-4 shrink-0 text-primary"
                />
                <span className="min-w-0 flex-1">{item.label}</span>
                <ExternalLink
                  aria-hidden
                  className="h-3.5 w-3.5 shrink-0 text-muted-foreground/60 transition-colors group-hover:text-primary"
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
          <h2 className="mt-2 font-[family-name:var(--font-display)] text-2xl font-semibold text-foreground">
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
        className="grid gap-4 md:grid-cols-2 xl:grid-cols-3"
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
        <AmbientPageBackground variant="academic" intensity="soft">
        <section className="w-full px-5 py-8 sm:px-8 lg:px-16 lg:py-12 xl:px-20">
          <div className="mx-auto grid w-full max-w-7xl gap-8">
            <BreadcrumbTrail
              items={[
                { label: "Home", href: "/" },
                { label: "Media Desk", href: "/media" },
                { label: kindLabel(data.kind), href: data.href },
                { label: data.title },
              ]}
            />

            <MediaDeskNav activeSection={data.mediaDeskSection} />
            <div className="grid w-full min-w-0 gap-8 xl:grid-cols-[minmax(0,1fr)_19rem]">
              <div className="grid min-w-0 gap-8">
                <DetailHero data={data} />
                <div className="grid min-w-0 gap-5">
                  <DetailBody data={data} />
                  <GallerySection data={data} />
                  <SupportingMediaSection data={data} />
                  <StructuredContentSection data={data} />
                  <RelatedContentSection data={data} />
                </div>
              </div>

              <DetailSidebar data={data} />
            </div>
          </div>
        </section>
        </AmbientPageBackground>
      </AboutPageLenis>
    </PageShell>
  );
}
