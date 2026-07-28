import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowLeft, CalendarDays, MapPin } from "lucide-react";
import { notFound } from "next/navigation";
import { SiteShell } from "../../../components/site-shell";
import { getEvents, getNewsDetail, getOpportunities } from "../../../lib/api";

const fallbackStories = [
  {
    slug: "reading-in-kisii",
    title: "New study explores early grade reading",
    excerpt: "Evidence for better classroom practice.",
    body: "HERI Africa researchers are working with communities and schools to strengthen early grade reading.",
  },
];

export const revalidate = 300;

export default async function InsightDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const news = await getNewsDetail(slug).catch(() => null);
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
  const fallback = fallbackStories.find((item) => item.slug === slug);
  if (fallback) {
    return (
      <InsightLayout
        eyebrow="News & Insights"
        title={fallback.title}
        excerpt={fallback.excerpt}
        body={fallback.body}
        date={null}
      />
    );
  }
  const [events, opportunities] = await Promise.all([
    getEvents().catch(() => []),
    getOpportunities().catch(() => []),
  ]);
  const event = events.find((item) => item.slug === slug);
  if (event) {
    return (
      <InsightLayout
        eyebrow="Upcoming Event"
        title={event.title}
        excerpt={event.summary}
        date={event.starts_at}
        meta={[
          event.location ? (
            <span className="inline-flex items-center gap-2" key="location">
              <MapPin className="size-4" />
              {event.location}
            </span>
          ) : null,
        ]}
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
        meta={[
          opportunity.application_url ? (
            <a
              className="font-bold text-heri-teal underline"
              href={opportunity.application_url}
              key="apply"
            >
              Apply for this opportunity →
            </a>
          ) : null,
        ]}
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
  meta?: (ReactNode | null)[];
}) {
  return (
    <SiteShell>
      <main className="bg-white">
        <div className="bg-heri-ink px-6 py-5 text-sm text-white/80">
          <div className="mx-auto max-w-4xl">
            <Link
              className="inline-flex items-center gap-2 hover:text-heri-lime"
              href="/news-insights"
            >
              <ArrowLeft className="size-4" /> Back to News &amp; Insights
            </Link>
          </div>
        </div>
        <article className="mx-auto max-w-4xl px-6 py-14 lg:py-20">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-heri-teal">
            {eyebrow}
          </p>
          <h1 className="mt-4 text-4xl font-bold leading-tight text-heri-blue sm:text-5xl">
            {title}
          </h1>
          <div className="mt-5 flex flex-wrap items-center gap-5 text-sm text-slate-500">
            {date ? (
              <span className="inline-flex items-center gap-2">
                <CalendarDays className="size-4 text-heri-teal" />
                {new Date(date).toLocaleDateString()}
              </span>
            ) : null}
            {meta}
          </div>
          {image ? (
            <div className="relative mt-10 aspect-[16/8] overflow-hidden rounded-3xl">
              <Image
                alt=""
                className="object-cover"
                fill
                sizes="(max-width: 1024px) 100vw, 900px"
                src={image}
                unoptimized
              />
            </div>
          ) : null}
          {excerpt ? (
            <p className="mt-10 text-xl leading-8 text-slate-600">{excerpt}</p>
          ) : null}
          {body ? (
            <div className="prose prose-slate mt-8 max-w-none whitespace-pre-line text-base leading-8">
              {body}
            </div>
          ) : null}
        </article>
      </main>
    </SiteShell>
  );
}
