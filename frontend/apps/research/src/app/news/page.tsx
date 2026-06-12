import type { Metadata } from "next";
import { GenericRecordGrid } from "../../components/research-listing";
import { ResearchPageIntro, ResearchSection } from "../../components/research-ui";
import { getArticles, getUpdates } from "../../lib/research-public-data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Research News",
  description: "Research news, updates, and articles.",
};

export default async function NewsPage() {
  const [news, articles] = await Promise.all([getUpdates(), getArticles()]);

  return (
    <main id="research-main" className="min-h-screen bg-white">
      <ResearchPageIntro
        eyebrow="News & Updates"
        title="Research news and feature articles."
        body="Published research news and articles are loaded from the Research content endpoints."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "News" }]}
      />
      <ResearchSection
        eyebrow="Latest"
        title="Research updates"
        body="News records are backed by the Research News endpoint."
        tone="white"
      >
        <GenericRecordGrid
          records={news}
          labelFields={["news_type", "category", "status"]}
          metaFields={["published_at", "created_at"]}
          hrefBase="/news"
        />
      </ResearchSection>
      <ResearchSection
        eyebrow="Articles"
        title="Research articles"
        body="Article records support feature stories and longer-form updates."
      >
        <GenericRecordGrid
          records={articles}
          labelFields={["article_type", "category", "status"]}
          metaFields={["published_at", "created_at"]}
          hrefBase="/news"
        />
      </ResearchSection>
    </main>
  );
}
