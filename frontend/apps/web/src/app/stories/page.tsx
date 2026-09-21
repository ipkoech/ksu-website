import Link from "next/link";
import { PenLine } from "lucide-react";
import { AmbientPageBackground } from "@ksu/ui/components";
import { MiniHeader, PublicFooter, PublicHeader } from "@ksu/ui/layout/public";
import { storiesApi } from "@ksu/api-client/server";
import { StoriesGrid } from "@/components/stories/stories-grid";
import { getSiteChromeData } from "@/lib/homepage-data";
import { getNavData } from "@/lib/nav-data";
import {
  heriAfricaFrontendUrl,
  libraryFrontendUrl,
  researchFrontendUrl,
} from "@/lib/service-urls";

export const revalidate = 300;

export default async function StoriesPage() {
  const [homepage, megaMenuData, storiesResponse] = await Promise.all([
    getSiteChromeData(),
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
          <StoriesGrid stories={stories} />
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
