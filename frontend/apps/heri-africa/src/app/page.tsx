import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Eye, Goal, UsersRound } from "lucide-react";
import { SiteShell } from "../components/site-shell";
import { HeroCarousel } from "../components/home/hero-carousel";
import { getEvents, getNews, getPartners, getSite, getTeam } from "../lib/api";

const pillars = [
  [
    "Foundational Literacy",
    "Strengthening early reading and writing for every learner.",
    "bg-heri-lime",
  ],
  [
    "African Languages",
    "Promoting and researching the teaching of African languages.",
    "bg-heri-teal",
  ],
  [
    "Research to Policy",
    "Generating evidence that informs language education policy.",
    "bg-heri-blue",
  ],
  [
    "Capacity Strengthening",
    "Building skills and systems for sustainable research and practice.",
    "bg-heri-lime",
  ],
] as const;
const ambition = [
  [
    "Elevate African Voice",
    "Center African perspectives in language education research.",
  ],
  [
    "Inform Better Policy",
    "Generate evidence that shapes inclusive, equitable policies.",
  ],
  [
    "Improve Learning Outcomes",
    "Advance teaching and learning so all learners can read and succeed.",
  ],
  [
    "Build Research Capacity",
    "Strengthen skills, mentorship, and research systems across Africa.",
  ],
  [
    "Promote Inclusion",
    "Uplift marginalised languages and learners in education systems.",
  ],
  [
    "Drive Lasting Impact",
    "Turn research into action for transformative change.",
  ],
] as const;

export default async function HeriHomePage() {
  const [site, news, team, partners, events] = await Promise.allSettled([
    getSite(),
    getNews(),
    getTeam(),
    getPartners(),
    getEvents(),
  ]);
  const siteData = site.status === "fulfilled" ? site.value : null;
  const newsData = news.status === "fulfilled" ? news.value.slice(0, 3) : [];
  const teamData = team.status === "fulfilled" ? team.value.slice(0, 4) : [];
  const partnerData =
    partners.status === "fulfilled" ? partners.value.slice(0, 6) : [];
  const eventData =
    events.status === "fulfilled" ? events.value.slice(0, 1) : [];
  return (
    <SiteShell>
      <main className="min-h-screen bg-white">
        <HeroCarousel />
        <section className="mx-auto grid max-w-7xl gap-6 px-6 py-8 sm:grid-cols-2 lg:grid-cols-4 lg:py-10">
          {pillars.map(([title, description, iconColor], index) => (
            <article
              key={title}
              className="group relative overflow-hidden rounded-t-[3rem] rounded-br-[3rem] border border-slate-100 bg-white pb-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="relative h-32 overflow-hidden bg-heri-cream">
                <Image
                  src={
                    [
                      "/images/landing-page/tc-fore.png",
                      "/images/landing-page/why-kisii/pathway-2.jpg",
                      "/images/landing-page/why-kisii/sakgwa-academic-block.jpg",
                      "/images/landing-page/why-kisii/bg-3.jpg",
                    ][index]
                  }
                  alt=""
                  fill
                  sizes="(max-width: 768px) 100vw, 25vw"
                  className="object-cover"
                />
                <span
                  className={`absolute -bottom-5 left-4 grid size-12 place-items-center rounded-full ${iconColor} text-white ring-4 ring-white`}
                >
                  <UsersRound className="size-6" />
                </span>
              </div>
              <div className="px-5 pt-8">
                <h2 className="text-xl font-bold leading-tight text-heri-blue">
                  {title}
                </h2>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  {description}
                </p>
                <span className="mt-4 inline-flex text-xl text-heri-lime transition group-hover:translate-x-1">
                  →
                </span>
              </div>
            </article>
          ))}
        </section>
        <section className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-16 lg:grid-cols-2 lg:py-20">
          <div className="relative mx-auto size-[300px] sm:size-[380px]">
            <div className="absolute inset-0 rounded-full border border-dashed border-heri-lime" />
            <div className="absolute inset-8 overflow-hidden rounded-full border-8 border-white shadow-xl">
              <Image
                src="/images/backgrounds/about-hero.jpg"
                alt="African researchers collaborating"
                fill
                sizes="380px"
                className="object-cover"
              />
            </div>
            <div className="absolute inset-0 grid place-items-center">
              <span className="rounded-full bg-white/90 px-5 py-3 text-4xl text-heri-lime shadow">
                ⌁
              </span>
            </div>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-heri-teal">
              HERI Africa Language Education Research Chair
            </p>
            <h2 className="mt-3 max-w-2xl text-4xl font-bold leading-tight text-heri-blue sm:text-5xl">
              Investing in African Knowledge and the Researchers Who Drive It
            </h2>
            <div className="mt-5 h-1 w-10 bg-heri-lime" />
            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600">
              {siteData?.tagline ??
                "We champion rigorous, contextually relevant research and support the next generation of African researchers."}
            </p>
          </div>
        </section>
        <section className="bg-heri-ink px-6 py-12 text-white">
          <div className="mx-auto max-w-6xl">
            <h2 className="text-center text-2xl font-bold">
              Our Research Ambition
            </h2>
            <div className="mt-8 grid md:grid-cols-3">
              {ambition.map(([title, description], index) => (
                <article
                  key={title}
                  className="border-heri-lime/60 px-5 py-5 md:border-r md:border-b last:border-r-0"
                >
                  <div className="flex gap-4">
                    <span className="text-4xl font-bold text-heri-lime">
                      {index + 1}
                    </span>
                    <div>
                      <h3 className="text-lg font-bold leading-tight">
                        {title}
                      </h3>
                      <p className="mt-2 text-xs leading-5 text-white/70">
                        {description}
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
        <section className="mx-auto grid max-w-7xl items-center gap-8 px-6 py-12 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <h2 className="text-3xl font-bold text-heri-blue">
              About the Research Chair
            </h2>
            <div className="mt-3 h-1 w-10 bg-heri-lime" />
            <p className="mt-4 text-sm leading-6 text-slate-600">
              The HERI Africa Language Education Research Chair at Kisii
              University advances Africa-led research in language education and
              foundational literacy.
            </p>
            <Link
              href="/about"
              className="mt-5 inline-flex items-center gap-4 rounded-lg bg-heri-lime px-4 py-2 text-xs font-bold text-heri-ink"
            >
              EXPLORE MORE <ArrowRight className="size-4" />
            </Link>
          </div>
          <div className="relative h-56 overflow-hidden rounded-xl">
            <Image
              src="/images/HERIAfricaLaunch.jpg"
              alt="HERI Africa and Kisii University researchers"
              fill
              sizes="(max-width: 1024px) 100vw, 65vw"
              className="object-cover"
            />
          </div>
        </section>
        <section className="border-y border-slate-100 bg-heri-cream/30 px-6 py-12">
          <div className="mx-auto max-w-5xl">
            <h2 className="text-center text-3xl font-bold text-heri-blue">
              Our Vision &amp; Mission
            </h2>
            <div className="mx-auto mt-3 h-1 w-10 bg-heri-lime" />
            <div className="mt-8 grid gap-8 md:grid-cols-2">
              <article className="flex gap-4 border-slate-200 md:border-r md:pr-8">
                <Eye className="mt-1 size-9 shrink-0 text-heri-teal" />
                <div>
                  <h3 className="font-bold text-heri-teal">Our Vision</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    To be a leading Africa-led Centre of Excellence in language
                    education research, advancing foundational literacy and
                    educational transformation.
                  </p>
                </div>
              </article>
              <article className="flex gap-4">
                <Goal className="mt-1 size-9 shrink-0 text-heri-teal" />
                <div>
                  <h3 className="font-bold text-heri-teal">Our Mission</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    To advance impactful, policy-responsive, and
                    practice-oriented research in language education and
                    foundational literacy for Africa and beyond.
                  </p>
                </div>
              </article>
            </div>
          </div>
        </section>
        <section className="mx-auto max-w-7xl px-6 py-12">
          <div className="flex items-end justify-between">
            <h2 className="text-3xl font-bold text-heri-blue">Meet Our Team</h2>
            <Link href="/team" className="text-sm font-bold text-heri-teal">
              Meet the research team →
            </Link>
          </div>
          <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {teamData.map((member) => (
              <article key={member.id} className="text-center">
                <div className="relative aspect-square overflow-hidden rounded-xl bg-heri-cream">
                  <Image
                    src={
                      member.photo_url ?? "/images/backgrounds/about-hero.jpg"
                    }
                    alt={member.name}
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                    className="object-cover"
                  />
                </div>
                <h3 className="mt-3 font-bold text-heri-blue">{member.name}</h3>
                <p className="text-xs text-heri-teal">{member.role}</p>
              </article>
            ))}
          </div>
        </section>
        <section className="mx-auto max-w-7xl px-6 py-10">
          <div className="flex items-end justify-between">
            <h2 className="text-3xl font-bold text-heri-blue">
              Latest News, Events &amp; Stories
            </h2>
            <Link
              href="/news-insights"
              className="text-sm font-bold text-heri-teal"
            >
              View all →
            </Link>
          </div>
          <div className="mt-6 grid gap-5 lg:grid-cols-3">
            {[...newsData, ...eventData].slice(0, 3).map((item) => (
              <article
                key={item.id}
                className="overflow-hidden rounded-xl border border-slate-200 bg-white"
              >
                <div className="relative h-32 bg-heri-cream">
                  <Image
                    src="/images/landing-page/tc-fore.png"
                    alt=""
                    fill
                    sizes="(max-width: 1024px) 100vw, 33vw"
                    className="object-cover"
                  />
                </div>
                <div className="p-5">
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-heri-teal">
                    News &amp; Insights
                  </p>
                  <h3 className="mt-2 font-bold text-heri-blue">
                    {"title" in item ? item.title : "Latest HERI Africa story"}
                  </h3>
                  <Link
                    href={
                      "slug" in item ? `/news-insights/${item.slug}` : "/events"
                    }
                    className="mt-4 inline-block text-sm font-bold text-heri-teal"
                  >
                    Read more →
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>
        <section className="border-y border-slate-100 px-6 py-8">
          <h2 className="text-center text-2xl font-bold text-heri-blue">
            Who We Work With
          </h2>
          <div className="mx-auto mt-6 flex max-w-6xl flex-wrap items-center justify-center gap-8 text-center text-sm font-bold text-heri-teal">
            {partnerData.length
              ? partnerData.map((partner) => (
                  <span key={partner.id}>{partner.name}</span>
                ))
              : [
                  "Kisii University",
                  "HERI Africa",
                  "Kenyatta University",
                  "Maseno University",
                  "UNICEF",
                ].map((name) => <span key={name}>{name}</span>)}
          </div>
        </section>
        <section className="bg-gradient-to-r from-heri-lime to-heri-teal px-6 py-8">
          <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-5 md:flex-row md:items-center">
            <h2 className="max-w-xl text-3xl font-bold leading-tight text-heri-blue">
              Partner with us to advance language education research in Africa
            </h2>
            <Link
              href="/partner-with-us"
              className="inline-flex items-center gap-5 rounded-xl bg-heri-lime px-5 py-3 text-sm font-bold text-heri-ink shadow-lg"
            >
              PARTNER WITH US <ArrowRight className="size-4" />
            </Link>
          </div>
        </section>
      </main>
    </SiteShell>
  );
}
