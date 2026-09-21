import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { InsightDetailDisplay } from "../../../components/data/insight-detail-display";
import { SiteShell } from "../../../components/site-shell";
import { getEvents, getNewsDetail, getOpportunities } from "../../../lib/api";
import { uncachedFallback } from "../../../lib/server-fallback";

export const revalidate = 300;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const news = await getNewsDetail(slug).catch(() => uncachedFallback(null));
  if (!news) return { title: "News & Insights" };
  return {
    title: news.title,
    description:
      news.excerpt ??
      "News from the HERI Africa Language Education Research Chair.",
    openGraph: news.featured_image_url
      ? { images: [{ url: news.featured_image_url }] }
      : undefined,
  };
}

export default async function InsightDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const news = await getNewsDetail(slug).catch(() => uncachedFallback(null));
  if (news) {
    return (
      <InsightLayout
        eyebrow="News & Insights"
        title={news.title}
        excerpt={news.excerpt}
        image={news.featured_image_url}
        date={news.published_at}
        body={news.body}
      />
    );
  }
  const [events, opportunities] = await Promise.all([
    getEvents().catch(() => uncachedFallback([])),
    getOpportunities().catch(() => uncachedFallback([])),
  ]);
  const event = events.find((item) => item.slug === slug);
  if (event) {
    return (
      <InsightLayout
        eyebrow="Upcoming Event"
        title={event.title}
        excerpt={event.summary}
        date={event.starts_at}
        meta={event.location ? [{ label: event.location }] : undefined}
      />
    );
  }
  const opportunity = opportunities.find((item) => item.slug === slug);
  if (opportunity) {
    return (
      <InsightLayout
        eyebrow="Opportunity"
        title={opportunity.title}
        excerpt={opportunity.summary}
        date={opportunity.closing_at}
        meta={opportunity.application_url ? [{ label: "Apply for this opportunity ->", href: opportunity.application_url }] : undefined}
      />
    );
  }
  notFound();
}

function InsightLayout({
  eyebrow,
  title,
  excerpt,
  date,
  body,
  image,
  meta = [],
}: {
  eyebrow: string;
  title: string;
  excerpt: string | null;
  date: string | null;
  body?: string;
  image?: string | null;
  meta?: Array<{ label: string; href?: string }>;
}) {
  return (
    <SiteShell>
      <main className="bg-white">
        <div className="bg-heri-ink px-6 py-5 text-sm text-white/80">
          <div className="mx-auto max-w-4xl">
            <Link className="inline-flex items-center gap-2 hover:text-heri-lime" href="/news-insights">
              <ArrowLeft className="size-4" /> Back to News &amp; Insights
            </Link>
          </div>
        </div>
        <InsightDetailDisplay eyebrow={eyebrow} title={title} excerpt={excerpt} date={date} body={body} image={image} meta={meta} />
      </main>
    </SiteShell>
  );
}
