import Image from "next/image";
import { InsightsFeed } from "../../components/news/insights-feed";
import { Reveal } from "../../components/motion/reveal";
import { SiteShell } from "../../components/site-shell";
import { getEvents, getNews, getOpportunities } from "../../lib/api";
import { withBasePath } from "../../lib/base-path";

export const revalidate = 300;

export default async function NewsInsightsPage() {
  const [newsResult, eventsResult, opportunitiesResult] =
    await Promise.allSettled([getNews(), getEvents(), getOpportunities()]);
  const news = newsResult.status === "fulfilled" ? newsResult.value : [];
  const events = eventsResult.status === "fulfilled" ? eventsResult.value : [];
  const opportunities =
    opportunitiesResult.status === "fulfilled" ? opportunitiesResult.value : [];

  return (
    <SiteShell>
      <main className="bg-white">
        <section className="relative overflow-hidden bg-heri-ink text-white">
          <div className="absolute inset-0 bg-[linear-gradient(115deg,#003c39,#006b62_54%,#07302d)]" />
          <div className="relative mx-auto grid min-h-[390px] max-w-7xl items-center gap-10 px-6 py-16 lg:grid-cols-[0.9fr_1.1fr] lg:px-10">
            <Reveal>
              <p className="text-sm text-white/70">
                Home <span className="mx-2">/</span> News &amp; Insights
              </p>
              <p className="mt-10 text-xs font-bold uppercase tracking-[0.2em] text-heri-lime">
                Research, events &amp; stories
              </p>
              <h1 className="mt-4 max-w-2xl text-5xl font-bold leading-[1.02] sm:text-6xl">
                Research, Events &amp; Stories
                <br />
                <span className="text-heri-lime">
                  Shaping Language Education
                </span>
              </h1>
              <p className="mt-5 max-w-xl text-base leading-7 text-white/85">
                Discover the latest research, events and stories from the HERI
                Africa Language Education Research Chair and our partners across
                Africa.
              </p>
            </Reveal>
            <div className="relative h-[250px] overflow-hidden rounded-t-[5rem] rounded-bl-[5rem]">
              <Image
                alt="HERI Africa researchers and learners"
                className="object-cover"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 55vw"
                src={withBasePath("/images/landing-page/why-kisii/pathway-2.jpg")}
              />
            </div>
          </div>
        </section>
        <InsightsFeed
          events={events}
          news={news}
          opportunities={opportunities}
        />
        <section className="bg-heri-cream/60 px-6 py-10">
          <Reveal className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-5 md:flex-row md:items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-heri-teal">
                Stay informed. Stay inspired.
              </p>
              <h2 className="mt-2 text-2xl font-bold text-heri-blue">
                Subscribe for the latest research and opportunities.
              </h2>
            </div>
            <a
              className="rounded-lg bg-heri-lime px-5 py-3 text-xs font-bold text-heri-ink"
              href="mailto:heri-language@kisiiuniversity.ac.ke?subject=HERI%20Africa%20newsletter"
            >
              JOIN THE NEWSLETTER →
            </a>
          </Reveal>
        </section>
      </main>
    </SiteShell>
  );
}
