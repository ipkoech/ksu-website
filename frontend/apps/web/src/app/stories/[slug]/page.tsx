import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Clock3,
  ExternalLink,
  ImageIcon,
  Newspaper,
  UserRound,
} from "lucide-react";
import { AmbientPageBackground } from "@ksu/ui/components";
import { MiniHeader, PublicFooter, PublicHeader } from "@ksu/ui/layout/public";
import { RichTextRenderer } from "@ksu/ui/rich-text-renderer";
import { mainApi, storiesApi, type Media } from "@ksu/api-client";
import { PublicImage } from "@/components/public/public-image";
import { getHomepageData } from "@/lib/homepage-data";
import { getNavData } from "@/lib/nav-data";
import {
  heriAfricaFrontendUrl,
  libraryFrontendUrl,
  researchFrontendUrl,
} from "@/lib/service-urls";
import { publicFileUrl, publicMediaUrl } from "@/lib/public-media";

export const revalidate = 300;

export default async function StoryDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [homepage, megaMenuData, storyResponse] = await Promise.all([
    getHomepageData(),
    getNavData(),
    storiesApi
      .getBySlug(slug, {
        fields:
          "id,title,slug,summary,plain_text,rich_text,story_type,category,published_at,created_at,reading_minutes,contributor_name_snapshot,show_contributor_name,featured_media_id,related_links",
        include:
          "featured_media(id,url,public_url,cdn_url,thumbnail_url,alt_text,title)",
      })
      .catch(() => null),
  ]);
  const story = storyResponse?.data;
  if (!story) notFound();

  const [relatedResponse, mediaResponse] = await Promise.all([
    storiesApi
      .list({
        per_page: 5,
        category: story.category || undefined,
        story_type: story.category ? undefined : story.story_type,
        fields:
          "id,title,slug,summary,plain_text,story_type,category,published_at,featured_media_id,featured_media,created_at",
        include:
          "featured_media(id,url,public_url,cdn_url,thumbnail_url,alt_text,title)",
      })
      .catch(() => ({ data: [] })),
    mainApi
      .get<{
        data: Array<{
          id: string;
          role: string;
          media?: {
            id: string;
            title?: string | null;
            alt_text?: string | null;
            filename?: string | null;
            mime_type?: string | null;
            media_type?: string | null;
            url?: string | null;
            public_url?: string | null;
            cdn_url?: string | null;
            thumbnail_url?: string | null;
          } | null;
        }>;
      }>("/api/v1/public/media/links", {
        entity_type: "story",
        entity_id: story.id,
        per_page: 50,
      })
      .catch(() => ({ data: [] })),
  ]);

  const imageUrl =
    publicMediaUrl(story.featured_media as Partial<Media> | null) ??
    publicFileUrl(story.featured_media_id);
  const mediaAssets = (mediaResponse.data ?? [])
    .filter((item) => item.media)
    .map((item) => ({
      ...item,
      url: publicMediaUrl(item.media),
      title: item.media?.title || item.media?.filename || "Story image",
      alt: item.media?.alt_text || item.media?.title || story.title,
      isImage:
        item.media?.media_type === "image" ||
        item.media?.mime_type?.startsWith("image/"),
    }))
    .filter((item) => item.url);
  const galleryImages = mediaAssets.filter(
    (item) => item.role === "gallery" && item.isImage,
  );
  const relatedStories = (relatedResponse.data ?? [])
    .filter((item) => item.id !== story.id)
    .slice(0, 4);
  const ctas = normalizeCtas(story.related_links);
  const readingMinutes =
    story.reading_minutes ??
    estimateReadingMinutes(story.rich_text || story.plain_text);

  return (
    <div className="min-h-screen text-foreground">
      <MiniHeader
        contactInfo={homepage.contactInfo}
        quickLinks={homepage.miniQuickLinks}
        socialLinks={homepage.socialLinks}
      />
      <PublicHeader
        megaMenuData={megaMenuData}
        researchHref={researchFrontendUrl}
        libraryHref={libraryFrontendUrl}
        heriHref={heriAfricaFrontendUrl}
      />
      <AmbientPageBackground
        as="main"
        variant="academic"
        intensity="soft"
        className="overflow-x-clip"
      >
        <article>
          <header className="mx-auto max-w-[1180px] px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
            <Link
              href="/stories"
              className="inline-flex items-center gap-2 text-sm font-bold text-primary"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to stories
            </Link>
            <div className="mt-8 flex flex-wrap items-center gap-4 text-sm font-semibold text-muted-foreground">
              <span className="rounded-full bg-primary px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-white">
                {story.category || story.story_type}
              </span>
              <span className="inline-flex items-center gap-2">
                <CalendarDays className="h-4 w-4" />
                {formatDate(story.published_at ?? story.created_at)}
              </span>
              {readingMinutes ? (
                <span className="inline-flex items-center gap-2">
                  <Clock3 className="h-4 w-4" />
                  {readingMinutes} min read
                </span>
              ) : null}
              {story.show_contributor_name &&
              story.contributor_name_snapshot ? (
                <span className="inline-flex items-center gap-2">
                  <UserRound className="h-4 w-4" />
                  {story.contributor_name_snapshot}
                </span>
              ) : null}
            </div>
            <h1 className="mt-5 font-[family-name:var(--font-display)] text-5xl font-bold leading-[0.95] text-primary sm:text-6xl">
              {story.title}
            </h1>
            {story.summary ? (
              <p className="mt-5 max-w-4xl text-lg leading-8 text-muted-foreground">
                {story.summary}
              </p>
            ) : null}
          </header>

          <div className="mx-auto max-w-[1380px] px-4 sm:px-6 lg:px-8">
            <div className="relative min-h-[320px] overflow-hidden rounded-[2rem] bg-primary/10 shadow-[0_24px_90px_rgba(0,53,37,.12)] sm:min-h-[460px]">
              <PublicImage
                src={imageUrl}
                alt={story.title}
                ratio="fill"
                fallbackContent={<Newspaper className="h-12 w-12" />}
                sizes="100vw"
                className="absolute inset-0 h-full w-full"
                imageClassName="object-cover"
              />
            </div>
          </div>

          <div className="mx-auto max-w-[900px] px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
            <RichTextRenderer
              content={story.rich_text || story.plain_text}
              className="prose-lg prose-headings:font-[family-name:var(--font-display)] prose-headings:text-primary prose-a:text-secondary"
              emptyFallback={
                <p className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-base leading-7 text-amber-900">
                  Story content is temporarily unavailable. Please check back
                  later or contact Corporate Communication.
                </p>
              }
            />
          </div>

          {galleryImages.length ? (
            <section className="mx-auto max-w-[1180px] px-4 pb-12 sm:px-6 lg:px-8 lg:pb-16">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
                    More from the story
                  </p>
                  <h2 className="mt-2 font-[family-name:var(--font-display)] text-3xl font-bold text-primary">
                    In pictures
                  </h2>
                </div>
                <ImageIcon className="hidden h-7 w-7 text-secondary sm:block" />
              </div>
              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {galleryImages.map((image) => (
                  <a
                    key={image.id}
                    href={image.url ?? undefined}
                    target="_blank"
                    rel="noreferrer"
                    className="group overflow-hidden rounded-2xl bg-primary/10 shadow-[0_16px_48px_rgba(0,53,37,.1)]"
                  >
                    <div className="aspect-[4/3] overflow-hidden">
                      <PublicImage
                        src={image.url}
                        alt={image.alt}
                        ratio="fill"
                        sizes="(min-width: 1024px) 33vw, 50vw"
                        className="h-full w-full"
                        imageClassName="transition-transform duration-500 motion-safe:group-hover:scale-[1.03]"
                      />
                    </div>
                    {image.title ? (
                      <p className="px-4 py-3 text-sm font-semibold text-primary">
                        {image.title}
                      </p>
                    ) : null}
                  </a>
                ))}
              </div>
            </section>
          ) : null}

          {ctas.length ? (
            <section className="mx-auto max-w-[1180px] px-4 pb-12 sm:px-6 lg:px-8 lg:pb-16">
              <div className="rounded-[2rem] bg-primary p-7 text-white sm:p-10">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/65">
                  Continue the conversation
                </p>
                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  {ctas.map((cta) => (
                    <a
                      key={`${cta.href}-${cta.label}`}
                      href={cta.href}
                      target={
                        cta.href.startsWith("http") ? "_blank" : undefined
                      }
                      rel={
                        cta.href.startsWith("http") ? "noreferrer" : undefined
                      }
                      className="group rounded-2xl border border-white/15 bg-white/10 p-5 transition-colors duration-200 hover:bg-white/15"
                    >
                      <span className="flex items-center justify-between gap-4">
                        <span className="font-[family-name:var(--font-display)] text-xl font-bold">
                          {cta.label}
                        </span>
                        {cta.href.startsWith("http") ? (
                          <ExternalLink className="h-4 w-4 shrink-0" />
                        ) : (
                          <ArrowRight className="h-4 w-4 shrink-0 transition-transform duration-200 group-hover:translate-x-1" />
                        )}
                      </span>
                      {cta.description ? (
                        <span className="mt-2 block text-sm leading-6 text-white/70">
                          {cta.description}
                        </span>
                      ) : null}
                    </a>
                  ))}
                </div>
              </div>
            </section>
          ) : null}

          {relatedStories.length ? (
            <section className="mx-auto max-w-[1180px] px-4 pb-16 sm:px-6 lg:px-8 lg:pb-20">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
                    Keep reading
                  </p>
                  <h2 className="mt-2 font-[family-name:var(--font-display)] text-3xl font-bold text-primary">
                    Related stories
                  </h2>
                </div>
                <Link
                  href="/stories"
                  className="hidden items-center gap-2 text-sm font-bold text-secondary sm:inline-flex"
                >
                  View all stories <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
              <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
                {relatedStories.map((related) => (
                  <Link
                    key={related.id}
                    href={`/stories/${related.slug}`}
                    className="group overflow-hidden rounded-2xl border border-primary/10 bg-white/80 shadow-[0_16px_48px_rgba(0,53,37,.08)] transition-transform duration-200 hover:-translate-y-1 hover:shadow-[0_22px_60px_rgba(0,53,37,.13)]"
                  >
                    <div className="relative h-40 overflow-hidden bg-primary/10">
                      <PublicImage
                        src={
                          publicMediaUrl(
                            related.featured_media as Partial<Media> | null,
                          ) ?? publicFileUrl(related.featured_media_id)
                        }
                        alt={related.title}
                        ratio="fill"
                        fallbackContent={<Newspaper className="h-8 w-8" />}
                        sizes="(min-width: 1024px) 25vw, 50vw"
                        className="absolute inset-0 h-full w-full"
                        imageClassName="object-cover transition-transform duration-500 motion-safe:group-hover:scale-[1.03]"
                      />
                    </div>
                    <div className="p-4">
                      <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-primary/60">
                        {related.category || related.story_type}
                      </p>
                      <h3 className="mt-2 font-[family-name:var(--font-display)] text-xl font-bold leading-tight text-primary">
                        {related.title}
                      </h3>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          ) : null}
        </article>
      </AmbientPageBackground>
      <PublicFooter
        contactInfo={homepage.contactInfo}
        socialLinks={homepage.socialLinks}
        researchHref={researchFrontendUrl}
        libraryHref={libraryFrontendUrl}
      />
    </div>
  );
}

function formatDate(value?: string | null) {
  if (!value) return "";
  return new Intl.DateTimeFormat("en-KE", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function normalizeCtas(value?: Array<Record<string, unknown>> | null) {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      const label = item.title ?? item.label ?? item.name;
      const href = item.href ?? item.url ?? item.link;
      const description = item.description ?? item.summary;
      return typeof label === "string" && typeof href === "string"
        ? {
            label,
            href,
            description: typeof description === "string" ? description : null,
          }
        : null;
    })
    .filter(
      (
        item,
      ): item is { label: string; href: string; description: string | null } =>
        item !== null,
    );
}

function estimateReadingMinutes(content?: string | null) {
  const wordCount = (content ?? "")
    .replace(/<[^>]+>/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
  return wordCount ? Math.max(1, Math.ceil(wordCount / 200)) : null;
}
