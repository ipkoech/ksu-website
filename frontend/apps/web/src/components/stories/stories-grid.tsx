"use client";

import Link from "next/link";
import { ArrowRight, Newspaper } from "lucide-react";
import type { Media, Story } from "@ksu/api-client";
import { PublicImage } from "@/components/public/public-image";
import { publicFileUrl, publicMediaUrl } from "@/lib/public-media";

function formatDate(value?: string | null) {
  if (!value) return "";
  return new Intl.DateTimeFormat("en-KE", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

export function StoriesGrid({ stories }: { stories: Story[] }) {
  return (
    <div
      className="mx-auto grid max-w-[1680px] gap-6 px-4 sm:px-6 md:grid-cols-2 lg:grid-cols-3 lg:px-8 xl:px-10 2xl:px-12"
      data-server-data-display="web-stories"
    >
      {stories.length === 0 ? (
        <p className="text-sm text-muted-foreground">No published stories are available.</p>
      ) : (
        stories.map((story) => (
          <Link
            key={story.id}
            href={`/stories/${story.slug}`}
            className="group overflow-hidden rounded-[1.4rem] border border-primary/10 bg-white/80 shadow-[0_18px_60px_rgba(0,53,37,.08)] transition-transform duration-200 hover:-translate-y-1 hover:shadow-[0_26px_76px_rgba(0,53,37,.14)] motion-reduce:transform-none"
          >
            <div className="relative h-56 overflow-hidden bg-primary/10">
              <PublicImage
                src={
                  publicMediaUrl(story.featured_media as Partial<Media> | null) ??
                  publicFileUrl(story.featured_media_id)
                }
                alt={story.title}
                ratio="fill"
                fallbackContent={<Newspaper className="h-8 w-8" />}
                sizes="(min-width: 1024px) 33vw, 100vw"
                className="absolute inset-0 h-full w-full"
                imageClassName="object-cover transition-transform duration-500 motion-safe:group-hover:scale-[1.03]"
              />
            </div>
            <div className="p-5">
              <div className="flex flex-wrap items-center gap-3 text-[11px] font-bold uppercase tracking-[0.14em] text-primary/65">
                <span>{story.category || story.story_type}</span>
                <span>{formatDate(story.published_at ?? story.created_at)}</span>
                {story.reading_minutes ? <span>{story.reading_minutes} min read</span> : null}
              </div>
              <h2 className="mt-3 font-[family-name:var(--font-display)] text-2xl font-bold leading-tight text-primary">
                {story.title}
              </h2>
              <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted-foreground">
                {story.summary || story.plain_text}
              </p>
              <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-secondary">
                Read story <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
              </span>
            </div>
          </Link>
        ))
      )}
    </div>
  );
}
