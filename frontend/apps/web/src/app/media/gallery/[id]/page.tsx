import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, Download } from "lucide-react";
import { BreadcrumbTrail, PageShell } from "@/components/site-shell";
import { getContentDetailData } from "@/lib/content-page-data";
import { resolvePublicMediaUrl } from "@/lib/public-media";

export const metadata = {
  title: "Gallery",
};

function formatDate(value?: string | null) {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(d);
}

export default async function GalleryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getContentDetailData("media", id);
  if (!data) notFound();

  const isVideo =
    data.record.contentKind === "media" &&
    (data.record.media_type === "video" ||
      data.record.mime_type?.startsWith("video/"));
  const mediaSource =
    data.record.contentKind === "media"
      ? (resolvePublicMediaUrl(data.record.cdn_url) ??
        resolvePublicMediaUrl(data.record.public_url) ??
        resolvePublicMediaUrl(data.record.url))
      : data.heroImage;
  const hasMedia = Boolean(mediaSource || data.heroImage);

  return (
    <PageShell>
      <article className="mx-auto max-w-[1680px] px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <BreadcrumbTrail
          items={[
            { label: "Home", href: "/" },
            { label: "Media Desk", href: "/media" },
            { label: "Gallery", href: "/media/gallery" },
            { label: data.title },
          ]}
        />

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex min-h-8 items-center rounded-full bg-primary/10 px-3 text-xs font-bold uppercase tracking-[0.08em] text-primary">
                {data.eyebrow}
              </span>
              {data.record.contentKind === "media" && data.record.created_at ? (
                <span className="inline-flex min-h-8 items-center gap-2 rounded-full border border-primary/15 bg-primary/[0.03] px-3 text-xs font-bold uppercase tracking-[0.08em] text-muted-foreground">
                  <CalendarDays aria-hidden className="h-3.5 w-3.5 text-primary" />
                  {formatDate(data.record.created_at)}
                </span>
              ) : null}
            </div>

            <h1 className="mt-4 max-w-4xl font-[family-name:var(--font-display)] text-4xl font-semibold leading-[1.05] text-foreground sm:text-5xl">
              {data.title}
            </h1>

            {data.summary ? (
              <p className="mt-4 max-w-3xl text-base leading-8 text-muted-foreground">
                {data.summary}
              </p>
            ) : null}
          </div>

          <aside className="rounded-xl border border-border bg-white p-5 shadow-sm lg:sticky lg:top-28 lg:self-start">
            <p className="text-xs font-semibold uppercase text-primary">
              Details
            </p>
            <dl className="mt-4 divide-y divide-slate-100 text-sm">
              {data.meta.map((item) =>
                item.value ? (
                  <div
                    key={item.label}
                    className="flex justify-between gap-3 py-2"
                  >
                    <dt className="font-medium text-muted-foreground">
                      {item.label}
                    </dt>
                    <dd className="font-semibold text-foreground">
                      {item.value}
                    </dd>
                  </div>
                ) : null,
              )}
            </dl>

            {mediaSource || data.heroImage ? (
              <a
                href={mediaSource ?? data.heroImage ?? "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 flex min-h-11 w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/25"
              >
                <Download aria-hidden className="h-4 w-4" />
                Open media in new tab
              </a>
            ) : null}

            <Link
              href="/media/gallery"
              className="mt-2 flex min-h-11 w-full items-center justify-center gap-2 rounded-md border border-border bg-white px-4 py-2.5 text-sm font-semibold text-muted-foreground transition hover:bg-surface-subtle focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/25"
            >
              <ArrowLeft aria-hidden className="h-4 w-4" />
              Back to gallery
            </Link>
          </aside>
        </div>

        {hasMedia ? (
          <figure className="mt-6 overflow-hidden rounded-xl border border-border bg-surface-muted">
            <div className="relative min-h-[300px] sm:min-h-[420px] lg:min-h-[520px]">
              {isVideo && mediaSource ? (
                <video
                  controls
                  preload="metadata"
                  poster={data.heroImage ?? undefined}
                  className="absolute inset-0 h-full w-full bg-brand-overlay object-contain"
                >
                  <source src={mediaSource} />
                </video>
              ) : data.heroImage ? (
                <img
                  src={data.heroImage}
                  alt={data.title}
                  className="absolute inset-0 h-full w-full object-cover"
                />
              ) : null}
            </div>
            <figcaption className="px-5 py-3 text-sm text-muted-foreground">
              {data.title}
            </figcaption>
          </figure>
        ) : null}

        {data.body ? (
          <div className="mt-6 rounded-xl border border-border bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold uppercase text-primary">
              Description
            </p>
            <div className="mt-3 text-sm leading-7 text-muted-foreground">
              {data.body}
            </div>
          </div>
        ) : null}
      </article>
    </PageShell>
  );
}
