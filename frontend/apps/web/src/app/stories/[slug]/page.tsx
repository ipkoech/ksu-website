import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, Newspaper, UserRound } from "lucide-react";
import { AmbientPageBackground } from "@ksu/ui/components";
import { MiniHeader, PublicFooter, PublicHeader } from "@ksu/ui/layout/public";
import { storiesApi, type Media } from "@ksu/api-client";
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
        include:
          "featured_media(id,url,public_url,cdn_url,thumbnail_url,alt_text,title)",
      })
      .catch(() => null),
  ]);
  const story = storyResponse?.data;
  if (!story) notFound();

  const imageUrl =
    publicMediaUrl(story.featured_media as Partial<Media> | null) ??
    publicFileUrl(story.featured_media_id);

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
            {story.rich_text ? (
              <div
                className="prose prose-lg max-w-none prose-headings:font-[family-name:var(--font-display)] prose-headings:text-primary prose-a:text-secondary"
                dangerouslySetInnerHTML={{ __html: story.rich_text }}
              />
            ) : (
              <div className="whitespace-pre-line text-lg leading-9 text-foreground/86">
                {story.plain_text}
              </div>
            )}
          </div>
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
