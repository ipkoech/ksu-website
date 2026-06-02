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
  Megaphone,
  Newspaper,
  Tag,
} from "lucide-react";
import { RichTextRenderer } from "@ksu/ui/rich-text-renderer";
import { ScrollReveal, ScrollRevealGroup } from "@ksu/ui/components";
import { BreadcrumbTrail, PageShell } from "@/components/site-shell";
import { PublicImage } from "@/components/public/public-image";
import { AboutPageLenis } from "@/components/ui/about-page-lenis";
import {
  categoryLabel,
  formatDate,
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
  if (kind === "blogs") return "Blogs";
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
            ? "Read blog"
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

export function ContentListingPage({ data }: { data: ContentListingData }) {
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
          <div className="grid gap-5">
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

function MetaPanel({ data }: { data: ContentDetailData }) {
  return (
    <aside className="grid gap-4">
      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <SectionKicker>At a Glance</SectionKicker>
        <dl className="mt-3 grid gap-2">
          {data.meta.map((item) => (
            <div
              key={item.label}
              className="flex gap-3 rounded-lg bg-slate-50 p-3"
            >
              <Tag
                aria-hidden
                className="mt-0.5 h-4 w-4 shrink-0 text-primary"
              />
              <div>
                <dt className="text-xs font-bold uppercase tracking-[0.08em] text-slate-500">
                  {item.label}
                </dt>
                <dd className="mt-1 text-sm font-semibold text-slate-950">
                  {item.value}
                </dd>
              </div>
            </div>
          ))}
        </dl>
      </section>
      {data.relatedLinks.length ? (
        <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <SectionKicker>Related Links</SectionKicker>
          <div className="mt-3 grid gap-2">
            {data.relatedLinks.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="group flex min-h-10 items-center gap-2 text-sm font-semibold text-slate-700 transition hover:text-primary"
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
  if (!data.structuredContent) return null;

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
        <MediaDownload data={data} />
      </ScrollReveal>
    );
  }

  return (
    <ScrollReveal
      as="section"
      className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
    >
      <RichTextRenderer
        content={data.body}
        className="prose-slate prose-headings:font-[family-name:var(--font-display)] prose-a:text-primary"
        emptyFallback={
          <p className="text-sm leading-7 text-slate-600">{data.summary}</p>
        }
      />
      <div className="mt-5">
        <EventAccess data={data} />
      </div>
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
        <section className="w-full bg-[linear-gradient(180deg,#f8fbff_0%,#ffffff_70%,#f6f8fc_100%)] px-4 py-5 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
          <div className="grid gap-5">
            <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
              <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_28rem]">
                <div className="p-5 lg:p-6">
                  <BreadcrumbTrail
                    items={[
                      { label: "Home", href: "/" },
                      { label: kindLabel(data.kind), href: `/${data.kind}` },
                      { label: data.title },
                    ]}
                  />
                  <SectionKicker>{data.eyebrow}</SectionKicker>
                  <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl font-semibold leading-tight text-slate-950 sm:text-4xl">
                    {data.title}
                  </h1>
                  {data.summary ? (
                    <p className="mt-4 max-w-4xl text-base leading-8 text-slate-700">
                      {data.summary}
                    </p>
                  ) : null}
                  <div className="mt-5 flex flex-wrap items-center gap-4 text-sm font-semibold text-slate-600">
                    {recordDate(data.record) ? (
                      <span className="inline-flex items-center gap-2">
                        <CalendarDays
                          aria-hidden
                          className="h-4 w-4 text-primary"
                        />
                        {recordDate(data.record)}
                      </span>
                    ) : null}
                    {data.record.contentKind === "events" &&
                    present(data.record.location) ? (
                      <span className="inline-flex items-center gap-2">
                        <MapPin aria-hidden className="h-4 w-4 text-primary" />
                        {data.record.location}
                      </span>
                    ) : null}
                  </div>
                </div>
                <div className="min-h-72 bg-slate-100">
                  <ContentImage record={data.record} large />
                </div>
              </div>
            </section>

            <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px] 2xl:grid-cols-[minmax(0,1fr)_360px]">
              <main className="grid min-w-0 gap-5">
                <DetailBody data={data} />
                <StructuredContentSection data={data} />
                {data.related.length ? (
                  <ScrollReveal as="section" className="grid gap-4">
                    <div>
                      <SectionKicker>Related Content</SectionKicker>
                      <h2 className="mt-2 font-[family-name:var(--font-display)] text-2xl font-semibold text-slate-950">
                        More from {kindLabel(data.kind)}
                      </h2>
                    </div>
                    <ScrollRevealGroup
                      className="grid gap-4 md:grid-cols-2 2xl:grid-cols-4"
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
                ) : null}
              </main>
              <MetaPanel data={data} />
            </div>
          </div>
        </section>
      </AboutPageLenis>
    </PageShell>
  );
}
