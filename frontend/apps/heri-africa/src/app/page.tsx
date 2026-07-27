import Link from "next/link";
import { SiteShell } from "../components/site-shell";
import { getNews, getSite } from "../lib/api";

export default async function HeriHomePage() {
  const [site, news] = await Promise.allSettled([getSite(), getNews()]);
  const siteData = site.status === "fulfilled" ? site.value : null;
  const newsData = news.status === "fulfilled" ? news.value : [];
  return (
    <SiteShell>
    <main className="min-h-screen bg-heri-cream">
      <section className="bg-heri-teal px-6 py-24 text-white">
        <div className="mx-auto max-w-7xl">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.22em] text-heri-lime">Hosted by Kisii University</p>
          <h1 className="max-w-3xl text-5xl font-semibold leading-tight md:text-7xl">Africa-led language research for transformative education.</h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-white/85">{siteData?.tagline ?? "We advance policy-responsive and practice-oriented research in language education and foundational literacy across Africa."}</p>
          <Link className="mt-8 inline-flex rounded-full bg-heri-lime px-6 py-3 font-semibold text-heri-ink transition-colors hover:bg-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-heri-teal" href="/our-work">Explore Our Work <span aria-hidden="true" className="ml-2">→</span></Link>
        </div>
      </section>
      <section className="mx-auto grid max-w-7xl gap-5 px-6 py-16 md:grid-cols-3">
        {["Foundational Literacy", "African Languages", "Research to Policy"].map((title) => <article className="rounded-3xl bg-white p-7 shadow-sm ring-1 ring-heri-teal/10" key={title}><p className="text-sm font-semibold uppercase tracking-[0.16em] text-heri-teal">Our work</p><h2 className="mt-3 text-2xl font-semibold text-heri-blue">{title}</h2><p className="mt-3 text-sm leading-7 text-heri-ink/70">Evidence, partnerships, and capacity for equitable language education.</p></article>)}
      </section>
      <section className="mx-auto max-w-7xl px-6 pb-20"><div className="flex items-end justify-between gap-4"><div><p className="text-sm font-semibold uppercase tracking-[0.16em] text-heri-teal">Knowledge exchange</p><h2 className="mt-2 text-3xl font-semibold text-heri-blue">Latest insights</h2></div><Link className="text-sm font-semibold text-heri-teal" href="/news-insights">View all <span aria-hidden="true">→</span></Link></div><div className="mt-7 grid gap-5 md:grid-cols-3">{newsData.map((item) => <article className="rounded-3xl bg-white p-6 ring-1 ring-heri-teal/10" key={item.id}><p className="text-xs font-semibold uppercase tracking-[0.14em] text-heri-teal">News</p><h3 className="mt-3 text-xl font-semibold text-heri-blue">{item.title}</h3><p className="mt-3 text-sm leading-7 text-heri-ink/70">{item.excerpt}</p><Link className="mt-5 inline-block text-sm font-semibold text-heri-teal" href={`/news-insights/${item.slug}`}>Read more <span aria-hidden="true">→</span></Link></article>)}</div></section>
    </main>
    </SiteShell>
  );
}
