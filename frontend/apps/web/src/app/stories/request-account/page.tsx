import Link from "next/link";
import { ArrowLeft, CheckCircle2, ShieldCheck } from "lucide-react";
import { AmbientPageBackground } from "@ksu/ui/components";
import { MiniHeader, PublicFooter, PublicHeader } from "@ksu/ui/layout/public";
import { StoryAccountRequestForm } from "@/components/stories/story-account-request-form";
import { getHomepageData } from "@/lib/homepage-data";
import { getNavData } from "@/lib/nav-data";
import {
  heriAfricaFrontendUrl,
  libraryFrontendUrl,
  researchFrontendUrl,
} from "@/lib/service-urls";

export const revalidate = 300;

export default async function StoryContributorRequestPage() {
  const [homepage, megaMenuData] = await Promise.all([
    getHomepageData(),
    getNavData(),
  ]);

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
        <section className="mx-auto grid max-w-[1380px] gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[minmax(0,0.75fr)_minmax(420px,0.55fr)] lg:px-8 lg:py-16">
          <div>
            <Link
              href="/stories"
              className="inline-flex items-center gap-2 text-sm font-bold text-primary"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to stories
            </Link>
            <p className="mt-8 text-xs font-bold uppercase tracking-[0.24em] text-primary">
              Contributor access
            </p>
            <h1 className="mt-4 max-w-3xl font-[family-name:var(--font-display)] text-5xl font-bold leading-[0.95] text-primary sm:text-6xl">
              Request an account to submit a Kisii University story.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground">
              External contributors must request access first. Corporate
              Communication reviews requests, creates approved accounts, and
              reviews every submitted story before publication.
            </p>
            <div className="mt-8 grid gap-4">
              {[
                "Request contributor access with your official details.",
                "Submit story drafts from your approved account.",
                "Corporate Communication reviews, edits, approves, schedules or rejects content.",
              ].map((item) => (
                <div key={item} className="flex gap-3 text-sm leading-6">
                  <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-secondary" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
            <div className="mt-8 rounded-2xl border border-primary/10 bg-primary/5 p-5">
              <div className="flex items-start gap-3">
                <ShieldCheck className="mt-1 h-5 w-5 shrink-0 text-primary" />
                <p className="text-sm leading-6 text-muted-foreground">
                  Submissions should be accurate, respectful, non-confidential,
                  and connected to Kisii University learning, research,
                  community impact, partnerships or student life.
                </p>
              </div>
            </div>
          </div>
          <StoryAccountRequestForm />
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
