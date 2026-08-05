import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  GraduationCap,
  FileText,
  Languages,
} from "lucide-react";
import { SiteShell } from "../components/site-shell";
import { Hero } from "../components/home/hero";
import { PartnerMarquee } from "../components/home/partner-marquee";
import { Reveal, RevealItem } from "../components/motion/reveal";
import { withBasePath } from "../lib/base-path";
import {
  getEvents,
  getHeroSlides,
  getNews,
  getPartners,
  getSite,
  getTeam,
} from "../lib/api";

const pillars = [
  {
    title: "Foundational Literacy",
    description: "Strengthening early reading and writing for every learner.",
    icon: BookOpen,
    iconColor: "bg-heri-lime",
    image: withBasePath("/images/landing-page/tc-fore.png"),
  },
  {
    title: "African Languages",
    description: "Promoting and researching the teaching of African languages.",
    icon: Languages,
    iconColor: "bg-heri-teal",
    image: withBasePath("/images/landing-page/why-kisii/pathway-2.jpg"),
  },
  {
    title: "Research to Policy",
    description: "Generating evidence that informs language education policy.",
    icon: FileText,
    iconColor: "bg-heri-blue",
    image: withBasePath("/images/landing-page/why-kisii/sakgwa-academic-block.jpg"),
  },
  {
    title: "Capacity Strengthening",
    description:
      "Building skills and systems for sustainable research and practice.",
    icon: GraduationCap,
    iconColor: "bg-heri-lime",
    image: withBasePath("/images/landing-page/why-kisii/bg-3.jpg"),
  },
];

const commitments = [
  "Centre African perspectives in language education research.",
  "Turn evidence into policy and classroom practice.",
  "Grow the next generation of African researchers.",
];

const pathways = [
  {
    title: "Researchers",
    description: "Scholarships, fellowships and calls for research collaboration.",
    label: "View opportunities",
    href: "/news-insights",
    className: "bg-heri-teal text-white",
    labelClassName: "text-heri-lime",
    bodyClassName: "text-white/80",
  },
  {
    title: "Partners and funders",
    description: "Co-fund and co-create research that changes how Africa learns.",
    label: "Partner with us",
    href: "/partner-with-us",
    className: "bg-heri-lime text-heri-ink",
    labelClassName: "text-heri-ink",
    bodyClassName: "text-heri-ink/75",
  },
  {
    title: "Educators and policymakers",
    description: "Evidence, publications and resources for classrooms and policy.",
    label: "Browse publications",
    href: "/research/publications",
    className: "bg-heri-cream text-heri-ink ring-1 ring-heri-teal/10",
    labelClassName: "text-heri-teal",
    bodyClassName: "text-slate-600",
  },
];

const newsTints = [
  "from-heri-teal to-heri-ink",
  "from-heri-blue to-heri-ink",
  "from-heri-ink to-heri-teal",
];

export default async function HeriHomePage() {
  const [site, news, team, partners, events, heroSlides] =
    await Promise.allSettled([
      getSite(),
      getNews(),
      getTeam(),
      getPartners(),
      getEvents(),
      getHeroSlides(),
    ]);
  const siteData = site.status === "fulfilled" ? site.value : null;
  const newsData = news.status === "fulfilled" ? news.value.slice(0, 3) : [];
  const teamData = team.status === "fulfilled" ? team.value.slice(0, 4) : [];
  const partnerData =
    partners.status === "fulfilled" ? partners.value.slice(0, 12) : [];
  const eventData =
    events.status === "fulfilled" ? events.value.slice(0, 1) : [];
  const managedHeroSlides =
    heroSlides.status === "fulfilled"
      ? heroSlides.value
          .filter((slide) => slide.is_active)
          .sort((a, b) => a.position - b.position)
          .map((slide) => ({
            id: slide.id,
            eyebrow: slide.eyebrow,
            title: slide.title,
            description: slide.description,
            image: slide.image_url,
            alt: slide.title,
            buttonLabel: slide.button_label,
            buttonHref: slide.button_href,
          }))
      : [];

  return (
    <SiteShell>
      <main className="min-h-screen bg-white">
        <Hero slides={managedHeroSlides} />

        <section className="bg-heri-cream/70 px-6 py-8">
          <Reveal className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-4 md:flex-row md:items-center">
            <p className="max-w-3xl text-base leading-7 text-heri-ink">
              One of five university research chairs established under{" "}
              <strong>HERI Africa</strong>, the national initiative led by the
              Commission for University Education.
            </p>
            <a
              href="https://www.heriafrica.org"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex shrink-0 items-center gap-2 text-sm font-bold text-heri-teal transition hover:text-heri-blue"
            >
              About the initiative
              <ArrowUpRight className="size-4" />
              <span className="sr-only">(opens heriafrica.org in a new tab)</span>
            </a>
          </Reveal>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-14 lg:py-16">
          <Reveal>
            <h2 className="text-3xl font-bold text-heri-blue sm:text-4xl">
              What we research
            </h2>
            <div className="mt-3 h-1 w-10 bg-heri-lime" />
          </Reveal>
          <div className="mt-9 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {pillars.map((pillar, index) => (
              <RevealItem key={pillar.title} index={index}>
                <Link
                  href="/our-work"
                  className="group relative block h-full overflow-hidden rounded-t-[3rem] rounded-br-[3rem] border border-slate-100 bg-white pb-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-heri-teal"
                >
                  <div className="relative h-32 overflow-hidden bg-heri-cream">
                    <Image
                      src={pillar.image}
                      alt=""
                      fill
                      sizes="(max-width: 768px) 100vw, 25vw"
                      className="object-cover transition duration-500 group-hover:scale-105"
                    />
                    <span
                      className={`absolute -bottom-5 left-4 grid size-12 place-items-center rounded-full ${pillar.iconColor} text-white ring-4 ring-white`}
                    >
                      <pillar.icon className="size-6" />
                    </span>
                  </div>
                  <div className="px-5 pt-8">
                    <h3 className="text-xl font-bold leading-tight text-heri-blue">
                      {pillar.title}
                    </h3>
                    <p className="mt-3 text-sm leading-6 text-slate-600">
                      {pillar.description}
                    </p>
                    <span
                      aria-hidden
                      className="mt-4 inline-flex text-xl text-heri-lime transition group-hover:translate-x-1"
                    >
                      →
                    </span>
                  </div>
                </Link>
              </RevealItem>
            ))}
          </div>
        </section>

        <section className="bg-heri-ink px-6 py-16 text-white lg:py-20">
          <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[0.9fr_1.1fr]">
            <Reveal>
              <p className="text-7xl font-bold leading-none text-heri-lime sm:text-8xl">
                3%
              </p>
              <p className="mt-5 max-w-md text-2xl font-bold leading-snug sm:text-3xl">
                Only 3% of global education research is led by African scholars.
              </p>
              <p className="mt-4 max-w-md text-base leading-7 text-white/70">
                This Chair exists to change that, starting with how Africa
                reads, writes and learns in its own languages.
              </p>
            </Reveal>
            <div className="grid gap-px overflow-hidden rounded-2xl bg-white/15">
              {commitments.map((commitment, index) => (
                <RevealItem
                  key={commitment}
                  index={index}
                  className="bg-heri-ink"
                >
                  <div className="flex items-start gap-5 px-6 py-6">
                    <span className="text-3xl font-bold text-heri-lime">
                      {index + 1}
                    </span>
                    <p className="pt-1 text-lg font-semibold leading-7">
                      {commitment}
                    </p>
                  </div>
                </RevealItem>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-7xl items-center gap-10 px-6 py-16 lg:grid-cols-2 lg:py-20">
          <Reveal className="relative">
            <div className="relative h-72 overflow-hidden rounded-t-[4rem] rounded-bl-[4rem] lg:h-96">
              <Image
                src={withBasePath("/images/HERIAfricaLaunch.jpg")}
                alt="HERI Africa and Kisii University researchers at the Chair launch"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
            <div className="absolute -bottom-4 -right-2 hidden rounded-xl bg-heri-lime px-5 py-3 text-xs font-bold uppercase tracking-[0.14em] text-heri-ink sm:block">
              Hosted at Kisii University
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="max-w-xl text-3xl font-bold leading-tight text-heri-blue sm:text-4xl">
              A Chair with a home, and a continental mandate
            </h2>
            <div className="mt-4 h-1 w-10 bg-heri-lime" />
            <p className="mt-5 max-w-xl text-base leading-7 text-slate-600">
              {siteData?.tagline ??
                "Hosted by Kisii University, the Chair bridges research, policy and practice in language education and foundational literacy for Africa."}
            </p>
            <Link
              href="/about"
              className="mt-7 inline-flex items-center gap-3 rounded-xl bg-heri-blue px-6 py-3.5 text-sm font-bold text-white transition hover:bg-heri-teal active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-heri-teal focus:ring-offset-2"
            >
              About the Chair
              <ArrowRight className="size-4" />
            </Link>
          </Reveal>
        </section>

        <section className="bg-slate-50 px-6 py-16">
          <div className="mx-auto max-w-7xl">
            <Reveal>
              <h2 className="text-3xl font-bold text-heri-blue sm:text-4xl">
                Ways to engage
              </h2>
              <div className="mt-3 h-1 w-10 bg-heri-lime" />
            </Reveal>
            <div className="mt-9 grid gap-6 md:grid-cols-3">
              {pathways.map((pathway, index) => (
                <RevealItem key={pathway.title} index={index}>
                  <article
                    className={`flex h-full flex-col justify-between rounded-3xl p-8 ${pathway.className}`}
                  >
                    <div>
                      <h3 className="text-2xl font-bold leading-tight">
                        {pathway.title}
                      </h3>
                      <p
                        className={`mt-3 text-sm leading-6 ${pathway.bodyClassName}`}
                      >
                        {pathway.description}
                      </p>
                    </div>
                    <Link
                      href={pathway.href}
                      className={`mt-8 inline-flex items-center gap-2 text-sm font-bold ${pathway.labelClassName} transition hover:gap-3 focus:outline-none focus:underline`}
                    >
                      {pathway.label}
                      <ArrowRight className="size-4" />
                    </Link>
                  </article>
                </RevealItem>
              ))}
            </div>
          </div>
        </section>

        {teamData.length > 0 && (
          <section className="mx-auto max-w-7xl px-6 py-16">
            <Reveal className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2 className="text-3xl font-bold text-heri-blue sm:text-4xl">
                  The people behind the research
                </h2>
                <div className="mt-3 h-1 w-10 bg-heri-lime" />
              </div>
              <Link
                href="/team"
                className="text-sm font-bold text-heri-teal transition hover:text-heri-blue"
              >
                Meet the team →
              </Link>
            </Reveal>
            <div className="mt-9 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {teamData.map((member, index) => (
                <RevealItem key={member.id} index={index}>
                  <Link
                    href={`/team/${member.slug}`}
                    className="group block text-center focus:outline-none"
                  >
                    <div className="relative aspect-square overflow-hidden rounded-2xl bg-heri-cream ring-heri-teal transition group-focus:ring-2">
                      {member.photo_url ? (
                        <Image
                          src={member.photo_url}
                          alt={member.name}
                          fill
                          sizes="(max-width: 768px) 50vw, 25vw"
                          unoptimized
                          className="object-cover transition duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="grid size-full place-items-center text-6xl font-bold text-heri-teal">
                          {member.name.slice(0, 1)}
                        </div>
                      )}
                    </div>
                    <h3 className="mt-4 font-bold text-heri-blue">
                      {member.name}
                    </h3>
                    <p className="mt-1 text-xs text-heri-teal">{member.role}</p>
                  </Link>
                </RevealItem>
              ))}
            </div>
          </section>
        )}

        {(newsData.length > 0 || eventData.length > 0) && (
          <section className="border-t border-slate-100 px-6 py-16">
            <div className="mx-auto max-w-7xl">
              <Reveal className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <h2 className="text-3xl font-bold text-heri-blue sm:text-4xl">
                    Latest news, events and stories
                  </h2>
                  <div className="mt-3 h-1 w-10 bg-heri-lime" />
                </div>
                <Link
                  href="/news-insights"
                  className="text-sm font-bold text-heri-teal transition hover:text-heri-blue"
                >
                  View all →
                </Link>
              </Reveal>
              <div className="mt-9 grid gap-6 lg:grid-cols-3">
                {[...newsData, ...eventData].slice(0, 3).map((item, index) => (
                  <RevealItem key={item.id} index={index}>
                    <article className="h-full overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:-translate-y-1 hover:shadow-lg">
                      <div
                        className={`h-2 bg-gradient-to-r ${newsTints[index % newsTints.length]}`}
                      />
                      <div className="p-6">
                        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-heri-teal">
                          {"excerpt" in item ? "News" : "Event"}
                        </p>
                        <h3 className="mt-3 text-xl font-bold leading-tight text-heri-blue">
                          {item.title}
                        </h3>
                        <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-600">
                          {"excerpt" in item ? item.excerpt : item.summary}
                        </p>
                        <Link
                          href={
                            "excerpt" in item
                              ? `/news-insights/${item.slug}`
                              : "/events"
                          }
                          className="mt-5 inline-block text-sm font-bold text-heri-teal transition hover:text-heri-blue"
                        >
                          Read more →
                        </Link>
                      </div>
                    </article>
                  </RevealItem>
                ))}
              </div>
            </div>
          </section>
        )}

        <PartnerMarquee partners={partnerData} />

        <section className="bg-gradient-to-r from-heri-teal to-heri-ink px-6 py-14">
          <Reveal className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <h2 className="max-w-xl text-3xl font-bold leading-tight text-white">
              Advance language education research in Africa with us
            </h2>
            <Link
              href="/partner-with-us"
              className="inline-flex shrink-0 items-center gap-3 rounded-xl bg-heri-lime px-6 py-3.5 text-sm font-bold text-heri-ink shadow-lg transition hover:bg-white active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-heri-teal"
            >
              Partner with us
              <ArrowRight className="size-4" />
            </Link>
          </Reveal>
        </section>
      </main>
    </SiteShell>
  );
}
