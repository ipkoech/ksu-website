import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import {
  ArrowRight,
  Award,
  BookOpen,
  FileText,
  FlaskConical,
  GraduationCap,
  Handshake,
  Lightbulb,
  Search,
  Sprout,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { ScrollReveal, ScrollRevealGroup } from "@ksu/ui/components";
import type {
  ResearchGenericRecord,
  ResearchGrant,
  ResearchProject,
  ResearchPublication,
} from "@ksu/api-client";
import {
  compactText,
  formatDate,
  formatLabel,
  getResearchOverviewData,
  type ResearchHeadProfile,
} from "../lib/research-public-data";
import { Badge, FilledBadge, StatusMessage } from "../components/research-ui";

export const revalidate = 300;

const heroActions = [
  { label: "Explore Research", href: "/projects", variant: "primary" as const },
  { label: "Partner With Us", href: "/partners", variant: "outline" as const },
  { label: "Contact REIRM", href: "/connect", variant: "gold" as const },
];

const quickLinks = [
  { label: "Projects", href: "/projects" },
  { label: "Publications", href: "/publications" },
  { label: "Funding", href: "/funding" },
  { label: "Partners", href: "/partners" },
];

const pillars = [
  {
    index: "1",
    title: "Research, Innovation & Commercialisation",
    body: "Advance high-quality inquiry and translate discoveries into practical technologies, enterprises, and public value.",
    icon: FlaskConical,
  },
  {
    index: "2",
    title: "Extension & Community Engagement",
    body: "Co-create knowledge with communities, industry, and public partners through responsive outreach and sustainability work.",
    icon: Sprout,
  },
  {
    index: "3",
    title: "Strategic Partnerships & Collaborations",
    body: "Build local and international linkages that expand shared resources, exchanges, and joint research.",
    icon: Handshake,
  },
  {
    index: "4",
    title: "Capacity Building & Knowledge Dissemination",
    body: "Nurture researchers through training, mentorship, publications, seminars, and scholarly communication.",
    icon: GraduationCap,
  },
  {
    index: "5",
    title: "Grant Management & Resource Mobilization",
    body: "Secure and administer grants, endowments, infrastructure support, and data-driven proposals.",
    icon: Award,
  },
];

const directoryFilters = ["All", "Centers", "Facilities", "Expertise"];

export default async function ResearchPage() {
  const overview = await getResearchOverviewData();
  const {
    projects,
    publications,
    grants,
    innovations,
    partners,
    articles,
    events,
    centers,
    facilities,
    expertiseTags,
    impactMetrics,
    stories,
    training,
    resources,
    services,
    guidelines,
    headProfile,
    stats,
    errors,
  } = overview;

  const statsMap = mapStats(stats);
  const featuredWork = buildFeaturedWork(
    projects.data,
    publications.data,
    grants.data,
    innovations.data,
  );
  const newsItems = buildNewsItems(articles.data, events.data);
  const directoryItems = buildDirectoryItems(
    centers.data,
    facilities.data,
    expertiseTags.data,
  );
  const supportItems = buildSupportItems(
    grants.data,
    training.data,
    resources.data,
    services.data,
    guidelines.data,
  );
  const partnerItems = partners.data.slice(0, 16);
  const story = stories.data[0];

  return (
    <main id="research-main" className="min-h-screen bg-[#f4f6f4] text-slate-950">
      <ResearchLandingHero />
      <PortfolioQuickAccessSection
        projects={statsMap.research_projects || projects.total || projects.data.length}
        publications={statsMap.publications || publications.total || publications.data.length}
        partners={statsMap.partner_count || partners.total || partners.data.length}
        grants={statsMap.grant_funding || grants.total || grants.data.length}
        innovations={statsMap.patents || innovations.total || innovations.data.length}
      />

      {errors.length > 0 ? (
        <section className="px-4 pt-6 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
          <div className="mx-auto flex max-w-[1680px] flex-col gap-3">
            {errors.slice(0, 3).map((error, i) => (
              <StatusMessage key={`${error}-${i}`} tone="error">
                {error}
              </StatusMessage>
            ))}
          </div>
        </section>
      ) : null}

      <AboutResearchSection headProfile={headProfile} />
      <PillarsSection />
      <FeaturedWorkSection items={featuredWork} />
      <NewsEventsArticlesSection items={newsItems} />
      <DirectorySection items={directoryItems} />
      <PartnersImpactSection
        partners={partnerItems}
        impactMetrics={impactMetrics.data}
        story={story}
      />
      <FundingResourcesSection items={supportItems} />
      <ResearchConversationSection />
    </main>
  );
}

function ResearchLandingHero() {
  return (
    <section className="relative isolate min-h-[560px] overflow-hidden bg-slate-950">
      <Image
        src="/images/research/research-hero-imagegen.webp"
        alt="Kisii University researchers collaborating across laboratory, field, data, and community research"
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.78)_0%,rgba(255,255,255,0.52)_34%,rgba(255,255,255,0.1)_64%,rgba(255,255,255,0)_100%)]" />
      <div className="absolute inset-y-0 left-0 w-full bg-[radial-gradient(circle_at_18%_46%,rgba(255,255,255,0.22)_0%,rgba(255,255,255,0)_34%)]" />
      <ResearchAnimatedBackdrop />
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#f4f6f4] via-[#f4f6f4]/60 to-transparent" />
      <div className="relative mx-auto grid min-h-[560px] max-w-[1920px] items-center gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[minmax(0,1fr)_420px] lg:px-8 xl:px-10 2xl:px-12">
        <div className="max-w-4xl">
          <ScrollReveal>
            <p className="inline-flex rounded-full border border-primary/20 bg-white/75 px-3 py-1 text-sm font-semibold text-primary shadow-sm backdrop-blur">
              Kisii University Research Portal
            </p>
            <h1 className="mt-5 max-w-4xl font-[family-name:var(--font-display)] text-3xl font-semibold leading-[1.04] text-slate-950 sm:text-5xl xl:text-6xl 2xl:text-7xl">
              Research, Extension, Innovation and Resource Mobilization
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-slate-700 sm:text-lg">
              The engine of knowledge preservation, creation, innovation, and
              societal impact at Kisii University.
            </p>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
              Borderless, inclusive research connecting scholarly excellence to
              tangible global progress.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              {heroActions.map((action) => (
                <ActionLink
                  key={action.href}
                  href={action.href}
                  variant={action.variant}
                >
                  {action.label}
                </ActionLink>
              ))}
            </div>
          </ScrollReveal>
        </div>
        <ScrollReveal className="hidden lg:block">
          <div className="relative ml-auto w-full max-w-[420px] rounded-xl border border-white/55 bg-white/42 p-4 shadow-[0_30px_90px_rgba(15,23,42,0.16)] backdrop-blur-xl">
            <div className="rounded-lg border border-white/60 bg-white/78 p-5">
              <SectionKicker>Research pathways</SectionKicker>
              <div className="mt-5 space-y-3">
                {quickLinks.map((link) => (
                  <Link
                    key={`hero-${link.href}`}
                    href={link.href}
                    className="group flex items-center justify-between rounded-md border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 transition hover:border-primary/30 hover:text-primary"
                  >
                    {link.label}
                    <ArrowRight aria-hidden className="h-4 w-4 transition group-hover:translate-x-1" />
                  </Link>
                ))}
              </div>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <Link href="/impact-metrics" className="rounded-lg border border-white/60 bg-primary p-4 text-white shadow-sm transition hover:bg-primary/90">
                <span className="block text-xs font-semibold uppercase text-white/70">Impact</span>
                <span className="mt-2 block font-[family-name:var(--font-display)] text-2xl font-semibold">Metrics</span>
              </Link>
              <Link href="/centers" className="rounded-lg border border-white/60 bg-white/80 p-4 text-slate-950 shadow-sm transition hover:border-primary/30 hover:text-primary">
                <span className="block text-xs font-semibold uppercase text-slate-500">Find</span>
                <span className="mt-2 block font-[family-name:var(--font-display)] text-2xl font-semibold">Centers</span>
              </Link>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

function ResearchAnimatedBackdrop({ dark = false }: { dark?: boolean }) {
  const tone = dark ? "research-animated-backdrop-dark" : "";

  return (
    <div aria-hidden className={`research-animated-backdrop ${tone}`}>
      <span className="research-signal-dot left-[12%] top-[22%]" />
      <span className="research-signal-dot left-[42%] top-[16%]" style={{ animationDelay: "1.4s" }} />
      <span className="research-signal-dot right-[18%] top-[34%]" style={{ animationDelay: "2.1s" }} />
      <span className="research-signal-dot bottom-[22%] left-[32%]" style={{ animationDelay: "3s" }} />
      <span className="research-signal-dot bottom-[18%] right-[28%]" style={{ animationDelay: "4.2s" }} />
    </div>
  );
}

function PortfolioQuickAccessSection({
  projects,
  publications,
  partners,
  grants,
  innovations,
}: {
  projects: number;
  publications: number;
  partners: number;
  grants: number;
  innovations: number;
}) {
  const metrics = [
    { label: "Projects", value: formatNumber(projects), rawValue: projects, href: "/projects", icon: FlaskConical },
    { label: "Publications", value: formatNumber(publications), rawValue: publications, href: "/publications", icon: BookOpen },
    { label: "Partners", value: formatNumber(partners), rawValue: partners, href: "/partners", icon: Handshake },
    { label: "Grants", value: formatGrantValue(grants), rawValue: grants, href: "/funding", icon: Award },
    { label: "Innovations", value: formatNumber(innovations), rawValue: innovations, href: "/innovations", icon: Lightbulb },
  ];

  return (
    <ScrollReveal as="section" className="relative isolate overflow-hidden bg-[#f4f6f4] px-3 py-3 sm:px-4">
      <ResearchAnimatedBackdrop />
      <div className="relative mx-auto max-w-[1680px] rounded-xl border border-white bg-white/92 p-4 shadow-[0_20px_80px_rgba(15,23,42,0.08)] backdrop-blur sm:p-5 lg:p-6">
        <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)] lg:items-center">
          <div>
            <SectionKicker>Direct access</SectionKicker>
            <nav aria-label="Research quick links" className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
              {quickLinks.map((link) => (
                <Link
                  key={link.href + link.label}
                  href={link.href}
                  className="group flex items-center justify-between rounded-md border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-primary/30 hover:bg-white hover:text-primary"
                >
                  {link.label}
                  <ArrowRight aria-hidden className="h-4 w-4 text-slate-300 transition group-hover:translate-x-1 group-hover:text-primary" />
                </Link>
              ))}
            </nav>
          </div>
          <div>
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
              <div>
                <SectionKicker>Research portfolio</SectionKicker>
                <h2 className="mt-2 font-[family-name:var(--font-display)] text-2xl font-semibold leading-tight text-slate-950 sm:text-3xl">
                  Public proof of work
                </h2>
              </div>
              <TextLink href="/impact-metrics">View impact metrics</TextLink>
            </div>
            <ScrollRevealGroup className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-5" staggerDelay={55}>
              {metrics.map((metric) => {
                const Icon = metric.icon;
                const hasPublishedCount = metric.rawValue > 0;

                return (
                  <Link
                    key={metric.label}
                    href={metric.href}
                    className="group flex min-h-28 items-center gap-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:border-primary/30 hover:shadow-md"
                  >
                    <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                      <Icon aria-hidden className="h-5 w-5" />
                    </span>
                    <span>
                      <span className={`block font-[family-name:var(--font-display)] font-semibold text-slate-950 ${hasPublishedCount ? "text-3xl" : "text-xl"}`}>
                        {hasPublishedCount ? metric.value : "Explore"}
                      </span>
                      <span className="mt-1 block text-xs font-semibold uppercase text-slate-500">
                        {metric.label}
                      </span>
                      {!hasPublishedCount ? (
                        <span className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-primary">
                          Browse
                          <ArrowRight aria-hidden className="h-3.5 w-3.5 transition group-hover:translate-x-1" />
                        </span>
                      ) : null}
                    </span>
                  </Link>
                );
              })}
            </ScrollRevealGroup>
          </div>
        </div>
      </div>
    </ScrollReveal>
  );
}

function AboutResearchSection({ headProfile }: { headProfile: ResearchHeadProfile }) {
  const headName = headProfile?.name || "Head of Research";
  const headTitle = headProfile?.title || "Head of Research, REIRM";
  const headMessage =
    headProfile?.message ||
    "Our mandate is to create an enabling environment where every scholar, student, and partner can turn knowledge into public value.";
  const headHref = headProfile?.href || "/about";

  return (
    <ScrollReveal as="section" className="relative isolate overflow-hidden bg-[#f4f6f4] px-3 py-3 sm:px-4">
      <div className="relative mx-auto grid max-w-[1680px] gap-3 rounded-xl border border-white bg-white p-4 shadow-[0_20px_70px_rgba(15,23,42,0.06)] sm:p-5 lg:grid-cols-[minmax(0,1fr)_minmax(420px,0.78fr)] lg:p-8">
        <article className="rounded-lg bg-[linear-gradient(135deg,#f7faf8_0%,#ffffff_100%)] p-6 lg:p-8">
          <SectionKicker>About research at Kisii University</SectionKicker>
          <h2 className="mt-3 max-w-3xl font-[family-name:var(--font-display)] text-3xl font-semibold leading-tight text-slate-950 sm:text-4xl">
            An inclusive engine for knowledge, innovation, and societal impact.
          </h2>
          <div className="mt-5 space-y-4 text-sm leading-7 text-slate-600 sm:text-base">
            <p>
              The Department of Research, Extension, Innovation, and Resource
              Mobilization is the engine of knowledge preservation, creation,
              and societal impact at Kisii University.
            </p>
            <p>
              Our identity is borderless and inclusive. We connect scholarly
              excellence to tangible global progress by empowering scholars,
              students, and partners to generate and apply high-impact
              knowledge.
            </p>
            <p>
              We are committed to creating an enabling environment where staff,
              students, and partners can excel in discovery, innovation,
              consultancy, extension, and resource mobilization while
              benchmarking against leading global universities.
            </p>
          </div>
        </article>

        <article className="research-glass-panel research-border-sheen rounded-lg p-6 lg:p-8">
          <div className="absolute right-5 top-5 h-[20%] min-h-24 w-[20%] min-w-24 overflow-hidden rounded-md border border-white bg-slate-100 shadow-sm">
            <Image
              src={headProfile?.photoUrl || "/images/research/registrar-reirm-imagegen.webp"}
              alt={headName}
              fill
              sizes="140px"
              className="object-cover"
            />
          </div>
          <div className="max-w-[76%]">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-md bg-primary text-white">
              <Users aria-hidden className="h-5 w-5" />
            </span>
            <SectionKicker className="mt-5">Message from the Head of Research</SectionKicker>
          </div>
          <blockquote className="mt-6 max-w-xl text-lg font-medium leading-8 text-slate-950">
            “{headMessage}”
          </blockquote>
          <p className="mt-5 text-sm font-semibold text-slate-950">
            {headTitle}
          </p>
          {headProfile?.name ? (
            <p className="mt-1 text-sm text-slate-600">{headProfile.name}</p>
          ) : null}
          <div className="mt-6 flex flex-wrap gap-3">
            <ActionLink href={headHref} variant="primary">Read full message</ActionLink>
            <ActionLink href="/connect" variant="outline">Contact REIRM</ActionLink>
          </div>
        </article>
      </div>
    </ScrollReveal>
  );
}

function PillarsSection() {
  return (
    <ScrollReveal as="section" className="research-surface-grid relative isolate overflow-hidden bg-[#f4f6f4] px-3 py-3 sm:px-4">
      <ResearchAnimatedBackdrop />
      <div className="relative mx-auto max-w-[1680px] rounded-xl border border-white bg-white px-4 py-12 shadow-[0_20px_70px_rgba(15,23,42,0.06)] sm:px-6 lg:px-10">
        <div className="mx-auto max-w-4xl text-center">
            <SectionKicker>Our five pillars</SectionKicker>
            <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-semibold leading-tight text-slate-950 sm:text-5xl">
              The REIRM model for research that reaches people.
            </h2>
            <div className="mt-6 flex justify-center">
              <ActionLink href="/about" variant="outline">How REIRM works</ActionLink>
            </div>
        </div>
        <ScrollRevealGroup className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-5" staggerDelay={70}>
          {pillars.map((pillar) => (
            <PillarCard key={pillar.title} {...pillar} />
          ))}
        </ScrollRevealGroup>
      </div>
    </ScrollReveal>
  );
}

function FeaturedWorkSection({ items }: { items: FeaturedWorkItem[] }) {
  if (items.length === 0) {
    return null;
  }

  return (
    <ScrollReveal as="section" className="relative isolate overflow-hidden bg-[#f4f6f4] px-3 py-3 sm:px-4">
      <div className="relative mx-auto max-w-[1680px] rounded-xl border border-white bg-white px-4 py-12 shadow-[0_20px_70px_rgba(15,23,42,0.06)] sm:px-6 lg:px-10">
        <SectionHeader
          eyebrow="Featured research work"
          title="Selected projects, publications, grants, and innovations."
          action={{ href: "/projects", label: "View all" }}
        />
        <ScrollRevealGroup className="mt-8 grid gap-5 lg:grid-cols-2 2xl:grid-cols-4" staggerDelay={65}>
          {items.map((item) => (
            <FeaturedWorkCard key={`${item.type}-${item.id}`} item={item} />
          ))}
        </ScrollRevealGroup>
      </div>
    </ScrollReveal>
  );
}

function NewsEventsArticlesSection({ items }: { items: NewsItem[] }) {
  if (items.length === 0) {
    return null;
  }

  const [featured, ...rest] = items;
  const medium = rest.slice(0, 2);
  const compact = rest.slice(2, 5);

  return (
    <ScrollReveal as="section" className="research-surface-grid relative isolate overflow-hidden bg-[#f4f6f4] px-3 py-3 sm:px-4">
      <ResearchAnimatedBackdrop />
      <div className="relative mx-auto max-w-[1680px] rounded-xl border border-white bg-white px-4 py-12 shadow-[0_20px_70px_rgba(15,23,42,0.06)] sm:px-6 lg:px-10">
        <SectionHeader
          eyebrow="News, events & articles"
          title="Latest updates from the research ecosystem."
          action={{ href: "/news", label: "All news & events" }}
        />
        <div className="mt-8 grid gap-5 xl:grid-cols-[minmax(0,1.05fr)_minmax(420px,0.95fr)]">
          {featured ? <EditorialFeature item={featured} /> : null}
          <div className="grid gap-5">
            <div className="grid gap-5 md:grid-cols-2">
              {medium.map((item) => (
                <EditorialCard key={`${item.kind}-${item.id}`} item={item} />
              ))}
            </div>
            <div className="grid gap-3">
              {compact.map((item) => (
                <EditorialRow key={`${item.kind}-${item.id}`} item={item} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </ScrollReveal>
  );
}

function DirectorySection({ items }: { items: DirectoryItem[] }) {
  return (
    <ScrollReveal as="section" className="relative isolate overflow-hidden bg-[#f4f6f4] px-3 py-3 sm:px-4">
      <div className="relative mx-auto max-w-[1680px] rounded-xl border border-white bg-white px-4 py-12 shadow-[0_20px_70px_rgba(15,23,42,0.06)] sm:px-6 lg:px-10">
        <SectionHeader
          eyebrow="Centers, facilities & expertise"
          title="Find capabilities, infrastructure, and research contacts."
          action={{ href: "/expertise", label: "View all centers, facilities & expertise" }}
        />
        <div className="mt-8 grid gap-5 lg:grid-cols-[300px_minmax(0,1fr)]">
          <aside className="rounded-lg border border-slate-200 bg-slate-50 p-5">
            <form action="/search" className="block">
              <label className="text-xs font-semibold uppercase text-slate-500" htmlFor="research-directory-search">
                Search directory
              </label>
              <div className="relative mt-3">
                <Search aria-hidden className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="research-directory-search"
                  name="q"
                  className="h-11 w-full rounded-md border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-900"
                  placeholder="Search centers, facilities..."
                />
              </div>
              <button className="mt-3 inline-flex min-h-10 w-full items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white">
                Search directory
              </button>
            </form>
            <div className="mt-5 flex flex-wrap gap-2">
              {directoryFilters.map((filter) => {
                const href =
                  filter === "Centers"
                    ? "/centers"
                    : filter === "Facilities"
                      ? "/facilities"
                      : filter === "Expertise"
                        ? "/expertise"
                        : "/search";
                return (
                  <Link
                    key={filter}
                    href={href}
                    className="rounded-md border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600 transition hover:border-primary/30 hover:text-primary"
                  >
                    {filter}
                  </Link>
                );
              })}
            </div>
          </aside>
          {items.length > 0 ? (
            <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
              {items.slice(0, 6).map((item) => (
                <DirectoryRow key={`${item.kind}-${item.id}`} item={item} />
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </ScrollReveal>
  );
}

function PartnersImpactSection({
  partners,
  impactMetrics,
  story,
}: {
  partners: ResearchGenericRecord[];
  impactMetrics: ResearchGenericRecord[];
  story?: ResearchGenericRecord;
}) {
  const metrics = impactMetrics.slice(0, 4);

  return (
    <ScrollReveal as="section" className="research-surface-grid relative isolate overflow-hidden bg-[#f4f6f4] px-3 py-3 sm:px-4">
      <ResearchAnimatedBackdrop />
      <div className="relative mx-auto max-w-[1680px] rounded-xl border border-white bg-white px-4 py-12 shadow-[0_20px_70px_rgba(15,23,42,0.06)] sm:px-6 lg:px-10">
        <SectionHeader
          eyebrow="Partners & public impact"
          title="Collaboration that translates knowledge into shared value."
          action={{ href: "/partners", label: "Partner with Kisii University" }}
        />

        {partners.length > 0 ? (
          <div className="research-marquee-frame relative mt-8 overflow-hidden rounded-lg border border-slate-200 bg-white py-5">
            <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-20 bg-gradient-to-r from-white to-transparent" />
            <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-20 bg-gradient-to-l from-white to-transparent" />
            <PartnerMarquee partners={partners} />
            <PartnerMarquee partners={[...partners].reverse()} reverse />
          </div>
        ) : null}

        <div className="mt-6 grid gap-5 lg:grid-cols-3">
          <article className="rounded-lg border border-slate-200 bg-slate-50 p-5 shadow-sm">
            <SectionKicker>Impact at a glance</SectionKicker>
            {metrics.length > 0 ? (
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {metrics.map((metric) => (
                  <div key={metric.id} className="rounded-md border border-slate-200 bg-slate-50 p-4">
                    <p className="font-[family-name:var(--font-display)] text-2xl font-semibold text-slate-950">
                      {compactText(metric.value ?? metric.metric_value ?? metric.count ?? "—")}
                    </p>
                    <p className="mt-1 text-xs font-semibold uppercase text-slate-500">
                      {compactText(metric.title ?? metric.name ?? metric.label)}
                    </p>
                  </div>
                ))}
              </div>
            ) : null}
          </article>
          {story ? (
            <article className="rounded-lg border border-slate-200 bg-slate-50 p-5 shadow-sm">
              <SectionKicker>Community story</SectionKicker>
              <h3 className="mt-3 font-[family-name:var(--font-display)] text-xl font-semibold text-slate-950">
                {compactText(story.title ?? story.name)}
              </h3>
              {compactText(story.summary ?? story.description ?? story.body) ? (
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  {compactText(story.summary ?? story.description ?? story.body)}
                </p>
              ) : null}
              {story.slug ? <TextLink href={`/community-impact/${story.slug}`}>Read more stories</TextLink> : null}
            </article>
          ) : null}
          <article className="rounded-lg border border-primary/20 bg-primary p-5 text-white shadow-sm">
            <Handshake aria-hidden className="h-9 w-9 text-secondary" />
            <h3 className="mt-4 font-[family-name:var(--font-display)] text-2xl font-semibold">
              Let’s build impact together
            </h3>
            <p className="mt-3 text-sm leading-7 text-white/80">
              We collaborate with governments, industry, NGOs, communities, and
              scholars to create sustainable solutions and lasting impact.
            </p>
            <Link
              href="/connect"
              className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-secondary px-5 py-3 text-sm font-semibold text-white transition hover:bg-secondary/90"
            >
              Partner with Kisii University
              <ArrowRight aria-hidden className="h-4 w-4" />
            </Link>
            <a
              href="mailto:research@kisiiuniversity.ac.ke"
              className="mt-4 inline-flex text-xs font-semibold text-white/80 transition hover:text-white"
            >
              research@kisiiuniversity.ac.ke
            </a>
          </article>
        </div>
      </div>
    </ScrollReveal>
  );
}

function FundingResourcesSection({ items }: { items: SupportItem[] }) {
  if (items.length === 0) {
    return null;
  }

  return (
    <ScrollReveal as="section" className="relative isolate overflow-hidden bg-[#f4f6f4] px-3 py-3 sm:px-4">
      <div className="relative mx-auto max-w-[1680px] rounded-xl border border-white bg-white px-4 py-12 shadow-[0_20px_70px_rgba(15,23,42,0.06)] sm:px-6 lg:px-10">
        <SectionHeader
          eyebrow="Funding, training & resources"
          title="Support for proposals, grants, mentorship, publications, and resource mobilization."
          action={{ href: "/resources-tools", label: "View all resources" }}
        />
        <ScrollRevealGroup className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3" staggerDelay={70}>
          {items.slice(0, 6).map((item) => (
            <SupportCard key={`${item.kind}-${item.id}`} item={item} />
          ))}
        </ScrollRevealGroup>
      </div>
    </ScrollReveal>
  );
}

function ResearchConversationSection() {
  return (
    <ScrollReveal as="section" className="relative isolate overflow-hidden bg-[#f4f6f4] px-3 pb-3 pt-3 text-white sm:px-4">
      <ResearchAnimatedBackdrop dark />
      <div className="relative mx-auto max-w-[1680px] overflow-hidden rounded-xl bg-primary px-4 py-14 text-center shadow-[0_20px_70px_rgba(15,23,42,0.16)] sm:px-6 lg:px-10">
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.14),transparent,rgba(0,0,0,0.1))]" />
        <div className="relative">
        <h2 className="font-[family-name:var(--font-display)] text-3xl font-semibold leading-tight sm:text-4xl">
          Join us in advancing humanity through knowledge, innovation, and collaboration.
        </h2>
        <p className="mx-auto mt-3 max-w-3xl text-sm leading-7 text-white/80 sm:text-base">
          To partner with us or sponsor a research initiative, contact the REIRM
          office and we will connect you to the right pathway.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <ActionLink href="/connect" variant="light">Contact REIRM</ActionLink>
          <ActionLink href="/partners" variant="light">Explore partnerships</ActionLink>
          <ActionLink href="/funding" variant="light">Support research</ActionLink>
        </div>
        </div>
      </div>
    </ScrollReveal>
  );
}

function PillarCard({
  index,
  title,
  body,
  icon: Icon,
}: {
  index: string;
  title: string;
  body: string;
  icon: LucideIcon;
}) {
  return (
    <article className="flex min-h-[270px] flex-col rounded-lg border border-slate-200 bg-[linear-gradient(135deg,#ffffff_0%,#f5faf7_100%)] p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-md bg-primary/10 text-primary">
          <Icon aria-hidden className="h-5 w-5" />
        </span>
        <span className="font-[family-name:var(--font-display)] text-4xl font-semibold text-slate-200">
          {index}
        </span>
      </div>
      <h3 className="mt-5 font-[family-name:var(--font-display)] text-lg font-semibold leading-7 text-slate-950">
        {title}
      </h3>
      <p className="mt-3 text-sm leading-7 text-slate-600">{body}</p>
    </article>
  );
}

function FeaturedWorkCard({ item }: { item: FeaturedWorkItem }) {
  return (
    <article className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:border-primary/30 hover:shadow-md">
      <div className="relative aspect-[16/9] bg-slate-100">
        <Image
          src={item.image}
          alt=""
          fill
          sizes="(min-width: 1536px) 25vw, (min-width: 1024px) 50vw, 100vw"
          className="object-cover"
        />
        <div className="absolute left-3 top-3">
          <FilledBadge>{item.type}</FilledBadge>
        </div>
      </div>
      <div className="p-5">
        <div className="flex flex-wrap gap-2">
          {item.tags.map((tag) => <Badge key={tag}>{tag}</Badge>)}
        </div>
        <h3 className="mt-4 font-[family-name:var(--font-display)] text-xl font-semibold leading-7 text-slate-950">
          {item.title}
        </h3>
        {item.summary ? (
          <p className="mt-3 line-clamp-3 text-sm leading-7 text-slate-600">
            {item.summary}
          </p>
        ) : null}
        <TextLink href={item.href}>{item.action}</TextLink>
      </div>
    </article>
  );
}

function EditorialFeature({ item }: { item: NewsItem }) {
  return (
    <article className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="relative aspect-[16/10] bg-slate-100">
        <Image src={item.image} alt="" fill sizes="(min-width: 1280px) 52vw, 100vw" className="object-cover" />
      </div>
      <div className="p-5 lg:p-6">
        <div className="flex flex-wrap gap-2">
          <Badge>{item.kind}</Badge>
          {item.date ? <Badge>{item.date}</Badge> : null}
        </div>
        <h3 className="mt-4 font-[family-name:var(--font-display)] text-2xl font-semibold leading-tight text-slate-950 sm:text-3xl">
          {item.title}
        </h3>
        {item.summary ? (
          <p className="mt-3 line-clamp-3 text-sm leading-7 text-slate-600">
            {item.summary}
          </p>
        ) : null}
        <TextLink href={item.href}>{item.kind === "Event" ? "View event" : "Read article"}</TextLink>
      </div>
    </article>
  );
}

function EditorialCard({ item }: { item: NewsItem }) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap gap-2">
        <Badge>{item.kind}</Badge>
        {item.date ? <Badge>{item.date}</Badge> : null}
      </div>
      <h3 className="mt-4 font-[family-name:var(--font-display)] text-xl font-semibold leading-7 text-slate-950">
        {item.title}
      </h3>
      <p className="mt-3 line-clamp-3 text-sm leading-7 text-slate-600">{item.summary}</p>
      <TextLink href={item.href}>{item.kind === "Event" ? "View event" : "Read article"}</TextLink>
    </article>
  );
}

function EditorialRow({ item }: { item: NewsItem }) {
  return (
    <article className="grid gap-4 rounded-lg border border-slate-200 bg-white p-3 shadow-sm sm:grid-cols-[148px_minmax(0,1fr)]">
      <div className="relative min-h-28 overflow-hidden rounded-md bg-slate-100">
        <Image src={item.image} alt="" fill sizes="148px" className="object-cover" />
      </div>
      <div className="min-w-0 py-1">
        <div className="flex flex-wrap gap-2">
          <Badge>{item.kind}</Badge>
          {item.date ? <Badge>{item.date}</Badge> : null}
        </div>
        <h3 className="mt-2 line-clamp-2 font-[family-name:var(--font-display)] text-lg font-semibold leading-6 text-slate-950">
          {item.title}
        </h3>
        <TextLink href={item.href}>{item.kind === "Event" ? "View event" : "Read article"}</TextLink>
      </div>
    </article>
  );
}

function DirectoryRow({ item }: { item: DirectoryItem }) {
  return (
    <Link
      href={item.href}
      className="grid gap-4 border-b border-slate-200 p-4 transition last:border-b-0 hover:bg-primary/5 sm:grid-cols-[92px_minmax(0,1fr)_auto]"
    >
      <div className="relative h-20 overflow-hidden rounded-md bg-slate-100">
        <Image src={item.image} alt="" fill sizes="92px" className="object-cover" />
      </div>
      <div className="min-w-0">
        <h3 className="font-semibold text-slate-950">{item.title}</h3>
        <p className="mt-1 line-clamp-2 text-sm leading-6 text-slate-600">{item.summary}</p>
      </div>
      <div className="flex items-center gap-2 sm:justify-end">
        <Badge>{item.kind}</Badge>
        <ArrowRight aria-hidden className="h-4 w-4 text-primary" />
      </div>
    </Link>
  );
}

function PartnerMarquee({
  partners,
  reverse = false,
}: {
  partners: ResearchGenericRecord[];
  reverse?: boolean;
}) {
  const row = [...partners, ...partners];
  return (
    <div className="flex overflow-hidden py-2">
      <div className={`flex min-w-full shrink-0 gap-3 ${reverse ? "animate-research-marquee-reverse" : "animate-research-marquee"}`}>
        {row.map((partner, index) => (
          <Link
            key={`${partner.id}-${index}-${reverse ? "reverse" : "forward"}`}
            href={partner.slug ? `/partners/${partner.slug}` : "/partners"}
            className="flex h-16 min-w-[210px] shrink-0 items-center justify-center rounded-md border border-slate-200 bg-white px-5 text-center text-sm font-semibold text-slate-700 transition hover:border-primary/30 hover:text-primary"
          >
            {compactText(partner.name ?? partner.title) || "Research partner"}
          </Link>
        ))}
      </div>
    </div>
  );
}

function SupportCard({ item }: { item: SupportItem }) {
  return (
    <Link
      href={item.href}
      className="group flex min-h-[210px] flex-col rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-primary/30 hover:shadow-md"
    >
      <div className="flex items-center justify-between gap-3">
        <span className="inline-flex h-11 w-11 items-center justify-center rounded-md bg-primary/10 text-primary">
          <item.icon aria-hidden className="h-5 w-5" />
        </span>
        <Badge>{item.kind}</Badge>
      </div>
      <h3 className="mt-5 font-[family-name:var(--font-display)] text-xl font-semibold leading-7 text-slate-950">
        {item.title}
      </h3>
      <p className="mt-3 line-clamp-3 text-sm leading-7 text-slate-600">{item.summary}</p>
      <span className="mt-auto inline-flex items-center gap-2 pt-5 text-sm font-semibold text-primary">
        Open resource
        <ArrowRight aria-hidden className="h-4 w-4 transition group-hover:translate-x-1" />
      </span>
    </Link>
  );
}

function SectionHeader({
  eyebrow,
  title,
  action,
}: {
  eyebrow: string;
  title: string;
  action?: { href: string; label: string };
}) {
  return (
    <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
      <div className="max-w-4xl">
        <SectionKicker>{eyebrow}</SectionKicker>
        <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-semibold leading-tight text-slate-950 sm:text-4xl">
          {title}
        </h2>
      </div>
      {action ? <ActionLink href={action.href} variant="outline">{action.label}</ActionLink> : null}
    </div>
  );
}

function SectionKicker({
  children,
  className = "",
}: {
  children: string;
  className?: string;
}) {
  return (
    <p className={`text-xs font-bold uppercase tracking-[0.08em] text-primary ${className}`}>
      {children}
    </p>
  );
}

function ActionLink({
  href,
  children,
  variant = "primary",
}: {
  href: string;
  children: ReactNode;
  variant?: "primary" | "outline" | "light" | "gold";
}) {
  const className =
    variant === "light"
      ? "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-white/40 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/20"
      : variant === "gold"
        ? "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-secondary/20 bg-white px-5 py-3 text-sm font-semibold text-secondary transition hover:border-secondary hover:bg-secondary/5"
        : variant === "outline"
          ? "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-primary/25 bg-white px-5 py-3 text-sm font-semibold text-primary transition hover:border-primary hover:bg-primary/5"
          : "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-primary px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90";

  return (
    <Link href={href} className={className}>
      {children}
      <ArrowRight aria-hidden className="h-4 w-4" />
    </Link>
  );
}

function TextLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary transition hover:text-secondary">
      {children}
      <ArrowRight aria-hidden className="h-4 w-4" />
    </Link>
  );
}

type FeaturedWorkItem = {
  id: string;
  type: string;
  title: string;
  summary: string;
  href: string;
  image: string;
  tags: string[];
  action: string;
};

type NewsItem = {
  id: string;
  kind: "News" | "Event" | "Article";
  title: string;
  summary: string;
  href: string;
  image: string;
  date: string;
  timestamp: number;
};

type DirectoryItem = {
  id: string;
  kind: string;
  title: string;
  summary: string;
  href: string;
  image: string;
};

type SupportItem = {
  id: string;
  kind: string;
  title: string;
  summary: string;
  href: string;
  icon: LucideIcon;
};

function buildFeaturedWork(
  projects: ResearchProject[],
  publications: ResearchPublication[],
  grants: ResearchGrant[],
  innovations: ResearchGenericRecord[],
): FeaturedWorkItem[] {
  const projectItems = preferFeatured(projects).slice(0, 1).map((item) => ({
    id: item.id,
    type: "Project",
    title: item.title,
    summary: compactText(item.summary ?? item.abstract ?? item.impact),
    href: item.slug ? `/projects/${item.slug}` : "/projects",
    image: item.cover_image_url || "/images/research/research-projects-hero.webp",
    tags: [formatLabel(item.project_type), formatLabel(item.status)].filter(Boolean),
    action: "View project details",
  }));
  const publicationItems = preferFeatured(publications).slice(0, 1).map((item) => ({
    id: item.id,
    type: "Publication",
    title: item.title,
    summary: compactText(item.abstract ?? item.journal_name),
    href: item.slug ? `/publications/${item.slug}` : "/publications",
    image: item.cover_image_url || "/images/research/research-demo-imagegen.webp",
    tags: [formatLabel(item.publication_type), item.year ? String(item.year) : ""].filter(Boolean),
    action: "View publication",
  }));
  const grantItems = preferFeatured(grants).slice(0, 1).map((item) => ({
    id: item.id,
    type: "Grant",
    title: item.title,
    summary: compactText(item.summary ?? item.description ?? item.eligibility),
    href: item.slug ? `/funding/${item.slug}` : "/funding",
    image: "/images/research/sustainability-hero-imagegen.webp",
    tags: [formatLabel(item.category), formatLabel(item.status)].filter(Boolean),
    action: "View grant details",
  }));
  const innovationItems = preferFeatured(innovations).slice(0, 1).map((item) => ({
    id: item.id,
    type: "Innovation",
    title: compactText(item.title ?? item.name),
    summary: compactText(item.summary ?? item.description ?? item.about),
    href: item.slug ? `/innovations/${item.slug}` : "/innovations",
    image: item.cover_image_url || "/images/research/research-innovation-hero.webp",
    tags: [formatLabel(item.innovation_type), formatLabel(item.status)].filter(Boolean),
    action: "View innovation",
  }));

  return [...projectItems, ...publicationItems, ...grantItems, ...innovationItems].filter((item) => item.title);
}

function buildNewsItems(
  articles: ResearchGenericRecord[],
  events: ResearchGenericRecord[],
): NewsItem[] {
  const articleItems = articles.slice(0, 4).map((item) => ({
    id: item.id,
    kind: (compactText(item.article_type ?? item.news_type).toLowerCase() === "article" ? "Article" : "News") as "News" | "Article",
    title: compactText(item.title ?? item.name),
    summary: compactText(item.summary ?? item.excerpt ?? item.description ?? item.body),
    href: item.slug ? `/news/${item.slug}` : "/news",
    image: item.cover_image_url || item.image_url || "/images/research/research-events-hero.webp",
    date: formatDate(item.published_at ?? item.created_at),
    timestamp: getTimestamp(item.published_at ?? item.created_at),
  }));
  const eventItems = events.slice(0, 3).map((item) => ({
    id: item.id,
    kind: "Event" as const,
    title: compactText(item.title ?? item.name),
    summary: compactText(item.summary ?? item.description ?? item.about),
    href: item.slug ? `/events/${item.slug}` : "/events",
    image: item.cover_image_url || item.image_url || "/images/research/research-events-hero.webp",
    date: formatDate(item.event_date ?? item.start_date ?? item.published_at ?? item.created_at),
    timestamp: getTimestamp(item.event_date ?? item.start_date ?? item.published_at ?? item.created_at),
  }));

  return [...articleItems, ...eventItems]
    .filter((item) => item.title)
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 6);
}

function buildDirectoryItems(
  centers: ResearchGenericRecord[],
  facilities: ResearchGenericRecord[],
  expertiseTags: ResearchGenericRecord[],
): DirectoryItem[] {
  return [
    ...centers.slice(0, 3).map((item) => ({
      id: item.id,
      kind: "Research Center",
      title: compactText(item.title ?? item.name),
      summary: compactText(item.summary ?? item.description ?? item.about ?? item.mandate),
      href: item.slug ? `/centers/${item.slug}` : "/centers",
      image: item.cover_image_url || "/images/research/research-home-hero.webp",
    })),
    ...facilities.slice(0, 2).map((item) => ({
      id: item.id,
      kind: "Facility",
      title: compactText(item.title ?? item.name),
      summary: compactText(item.summary ?? item.description ?? item.about),
      href: item.slug ? `/facilities/${item.slug}` : "/facilities",
      image: item.cover_image_url || "/images/research/research-farm-hero.svg",
    })),
    ...expertiseTags.slice(0, 2).map((item) => ({
      id: item.id,
      kind: "Expertise",
      title: compactText(item.title ?? item.name),
      summary: compactText(item.summary ?? item.description),
      href: "/expertise",
      image: "/images/research/research-about-hero.webp",
    })),
  ].filter((item) => item.title);
}

function buildSupportItems(
  grants: ResearchGrant[],
  training: ResearchGenericRecord[],
  resources: ResearchGenericRecord[],
  services: ResearchGenericRecord[],
  guidelines: ResearchGenericRecord[],
): SupportItem[] {
  return [
    ...grants.slice(0, 1).map((item) => ({
      id: item.id,
      kind: "Grant support",
      title: item.title,
      summary: compactText(item.summary ?? item.description ?? item.eligibility),
      href: item.slug ? `/funding/${item.slug}` : "/funding",
      icon: Award,
    })),
    ...training.slice(0, 1).map((item) => ({
      id: item.id,
      kind: "Training",
      title: compactText(item.title ?? item.name),
      summary: compactText(item.summary ?? item.description ?? item.about),
      href: item.slug ? `/training/${item.slug}` : "/training",
      icon: GraduationCap,
    })),
    ...resources.slice(0, 2).map((item) => ({
      id: item.id,
      kind: formatLabel(item.resource_type ?? "Resource"),
      title: compactText(item.title ?? item.name),
      summary: compactText(item.summary ?? item.description ?? item.about),
      href: item.slug ? `/resources-tools/${item.slug}` : "/resources-tools",
      icon: FileText,
    })),
    ...services.slice(0, 1).map((item) => ({
      id: item.id,
      kind: "Service",
      title: compactText(item.title ?? item.name),
      summary: compactText(item.summary ?? item.description ?? item.services_summary),
      href: item.slug ? `/services/${item.slug}` : "/services",
      icon: Handshake,
    })),
    ...guidelines.slice(0, 1).map((item) => ({
      id: item.id,
      kind: "Guideline",
      title: compactText(item.title ?? item.name),
      summary: compactText(item.summary ?? item.description ?? item.content),
      href: item.slug ? `/guidelines/${item.slug}` : "/guidelines",
      icon: BookOpen,
    })),
  ].filter((item) => item.title);
}

function preferFeatured<T extends { is_featured?: boolean }>(items: T[]) {
  return [...items].sort((a, b) => Number(Boolean(b.is_featured)) - Number(Boolean(a.is_featured)));
}

function mapStats(stats: unknown) {
  const values: Record<string, number> = {};
  const arr = ((stats as any)?.stats ?? []) as Array<{ key: string; value: number }>;
  for (const item of arr) {
    values[item.key] = Number(item.value) || 0;
  }
  return values;
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-GB", { maximumFractionDigits: 0 }).format(value);
}

function formatGrantValue(value: number) {
  if (value >= 1_000_000) {
    return `KES ${Math.round(value / 1_000_000)}M`;
  }
  return formatNumber(value);
}

function getTimestamp(value?: string | null) {
  if (!value) return 0;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 0 : date.getTime();
}
