import Link from "next/link";
import { ArrowRight, Newspaper, PenLine } from "lucide-react";
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

export default async function StoriesPage() {
  const [homepage, megaMenuData, storiesResponse] = await Promise.all([
    getHomepageData(),
    getNavData(),
    storiesApi.list({
      per_page: 12,
      fields:
        "id,title,slug,summary,plain_text,story_type,category,reading_minutes,published_at,featured_media_id,featured_media,contributor_name_snapshot,created_at",
      include:
        "featured_media(id,url,public_url,cdn_url,thumbnail_url,alt_text,title)",
    }),
  ]);
  const stories = storiesResponse.data ?? [];

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
        <section className="border-b border-primary/10 py-14 lg:py-18">
          <div className="mx-auto grid max-w-[1680px] gap-8 px-4 sm:px-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end lg:px-8 xl:px-10 2xl:px-12">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-primary">
                Kisii University Stories
              </p>
              <h1 className="mt-4 max-w-4xl font-[family-name:var(--font-display)] text-5xl font-bold leading-[0.95] text-primary sm:text-6xl">
                Stories from our students, staff, partners and community.
              </h1>
              <p className="mt-5 max-w-3xl text-base leading-7 text-muted-foreground">
                Every published story is reviewed by Corporate Communication for
                accuracy, relevance and institutional fit.
              </p>
            </div>
            <Link
              href="/stories/request-account"
              className="inline-flex min-h-12 items-center gap-3 rounded-full bg-primary px-6 text-sm font-bold text-white transition-colors duration-200 hover:bg-primary/90 active:scale-[0.98]"
            >
              Request contributor account
              <PenLine className="h-4 w-4" />
            </Link>
          </div>
        </section>

        <section className="py-12 lg:py-16">
          <div className="mx-auto grid max-w-[1680px] gap-6 px-4 sm:px-6 md:grid-cols-2 lg:grid-cols-3 lg:px-8 xl:px-10 2xl:px-12">
            {stories.map((story) => (
              <Link
                key={story.id}
                href={`/stories/${story.slug}`}
                className="group overflow-hidden rounded-[1.4rem] border border-primary/10 bg-white/80 shadow-[0_18px_60px_rgba(0,53,37,.08)] transition-transform duration-200 hover:-translate-y-1 hover:shadow-[0_26px_76px_rgba(0,53,37,.14)] motion-reduce:transform-none"
              >
                <div className="relative h-56 overflow-hidden bg-primary/10">
                  <PublicImage
                    src={
                      publicMediaUrl(
                        story.featured_media as Partial<Media> | null,
                      ) ?? publicFileUrl(story.featured_media_id)
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
                    <span>
                      {formatDate(story.published_at ?? story.created_at)}
                    </span>
                    {story.reading_minutes ? (
                      <span>{story.reading_minutes} min read</span>
                    ) : null}
                  </div>
                  <h2 className="mt-3 font-[family-name:var(--font-display)] text-2xl font-bold leading-tight text-primary">
                    {story.title}
                  </h2>
                  <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted-foreground">
                    {story.summary || story.plain_text}
                  </p>
                  <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-secondary">
                    Read story
                    <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
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
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}
