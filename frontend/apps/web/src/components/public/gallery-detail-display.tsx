"use client";

import Link from "next/link";
import { ArrowLeft, CalendarDays, Download } from "lucide-react";
import type { ReactNode } from "react";
import { PublicImage } from "./public-image";

export type GalleryDetailDto = {
  title: string;
  eyebrow: string;
  createdAt: string | null;
  summary: string | null;
  meta: Array<{ label: string; value: string | null }>;
  mediaSource: string | null;
  heroImage: string | null;
  isVideo: boolean;
  body: string | null;
};

export function GalleryDetailDisplay({
  data,
  breadcrumb,
}: {
  data: GalleryDetailDto;
  breadcrumb?: ReactNode;
}) {
  const hasMedia = Boolean(data.mediaSource || data.heroImage);

  return (
    <div data-server-data-display="web-gallery-detail">
      <article className="mx-auto max-w-[1680px] px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        {breadcrumb}
        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex min-h-8 items-center rounded-full bg-primary/10 px-3 text-xs font-bold uppercase tracking-[0.08em] text-primary">
                  {data.eyebrow}
                </span>
                {data.createdAt ? (
                  <span className="inline-flex min-h-8 items-center gap-2 rounded-full border border-primary/15 bg-primary/[0.03] px-3 text-xs font-bold uppercase tracking-[0.08em] text-muted-foreground">
                    <CalendarDays aria-hidden className="h-3.5 w-3.5 text-primary" />
                    {formatDate(data.createdAt)}
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
              <p className="text-xs font-semibold uppercase text-primary">Details</p>
              <dl className="mt-4 divide-y divide-slate-100 text-sm">
                {data.meta.map((item) =>
                  item.value ? (
                    <div key={item.label} className="flex justify-between gap-3 py-2">
                      <dt className="font-medium text-muted-foreground">{item.label}</dt>
                      <dd className="font-semibold text-foreground">{item.value}</dd>
                    </div>
                  ) : null,
                )}
              </dl>

              {data.mediaSource || data.heroImage ? (
                <a
                  href={data.mediaSource ?? data.heroImage ?? "#"}
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
                {data.isVideo && data.mediaSource ? (
                  <video
                    controls
                    preload="metadata"
                    poster={data.heroImage ?? undefined}
                    className="absolute inset-0 h-full w-full bg-brand-overlay object-contain"
                  >
                    <source src={data.mediaSource} />
                  </video>
                ) : data.heroImage ? (
                  <PublicImage
                    src={data.heroImage}
                    alt={data.title}
                    ratio="fill"
                    className="absolute inset-0 h-full w-full"
                    imageClassName="object-cover"
                  />
                ) : null}
              </div>
              <figcaption className="px-5 py-3 text-sm text-muted-foreground">{data.title}</figcaption>
            </figure>
          ) : null}

        {data.body ? (
            <div className="mt-6 rounded-xl border border-border bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold uppercase text-primary">Description</p>
              <div className="mt-3 text-sm leading-7 text-muted-foreground">{data.body}</div>
            </div>
        ) : null}
      </article>
    </div>
  );
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}
