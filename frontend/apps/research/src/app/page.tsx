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
  { label: "Our Impact", href: "/impact-metrics", variant: "impact" as const },
  { label: "Partner With Us", href: "/partners", variant: "glass" as const },
];

const quickLinks = [
  { label: "Projects", href: "/projects", description: "Explore active research projects", icon: FlaskConical, tone: "blue" },
  { label: "Publications", href: "/publications", description: "Browse our research output", icon: FileText, tone: "green" },
  { label: "Funding", href: "/funding", description: "Grants and funding opportunities", icon: Handshake, tone: "gold" },
  { label: "Partners", href: "/partners", description: "Collaborate with us for greater impact", icon: Users, tone: "blue" },
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
    news,
    blogs,
    announcements,
    events,
    heroSliders,
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
  const newsItems = buildNewsItems(
    news.data,
    blogs.data,
    announcements.data,
    events.data,
  );
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
  const hasHomepageRecords =
    [
      projects,
      publications,
      grants,
      innovations,
      partners,
      news,
      blogs,
      announcements,
      events,
      heroSliders,
      centers,
      facilities,
      expertiseTags,
      impactMetrics,
      stories,
      training,
      resources,
      services,
      guidelines,
    ].some((collection) => collection.total > 0 || collection.data.length > 0) ||
    Boolean(headProfile) ||
    Boolean(stats);

  return (
    <main id="research-main" className="min-h-screen bg-[#f4f6f4] text-slate-950">
      <ResearchLandingHero
        activeProjects={statsMap.research_projects || projects.total || projects.data.length}
        slides={heroSliders.data}
      />
      <PortfolioQuickAccessSection
        projects={statsMap.research_projects || projects.total || projects.data.length}
        publications={statsMap.publications || publications.total || publications.data.length}
        partners={statsMap.partner_count || partners.total || partners.data.length}
        grants={statsMap.grant_funding || grants.total || grants.data.length}
        innovations={statsMap.patents || innovations.total || innovations.data.length}
      />

      {errors.length > 0 && !hasHomepageRecords ? (
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
      <DirectorySection items={directoryItems} />
      <PartnersImpactSection
        impactMetrics={impactMetrics.data}
        story={story}
      />
      <NewsEventsArticlesSection items={newsItems} />
      <ResearchPartnersSection partners={partnerItems} />
      <FundingResourcesSection items={supportItems} />
      <ResearchConversationSection />
    </main>
  );
}

function ResearchLandingHero({
  activeProjects,
  slides,
}: {
  activeProjects: number;
  slides: ResearchGenericRecord[];
}) {
  const slide = slides
    .filter((item) => item.is_active !== false)
    .sort((a, b) => Number(a.display_order ?? 100) - Number(b.display_order ?? 100))[0];
  const heroTitle = compactText(slide?.title) || "Research. Innovation.";
  const heroAccent = compactText(slide?.subtitle) || "Impact for a Better Future.";
  const heroBody =
    compactText(slide?.plain_text ?? slide?.summary ?? slide?.description) ||
    "Advancing knowledge, solving real-world challenges, and building partnerships that create lasting impact for communities and the environment.";
  const heroImage = getRecordImage(slide, "desktop_media") || "/images/research/research-hero-imagegen.webp";
  const slideActionHref = compactText(slide?.external_url);
  const slideActionLabel = compactText(slide?.link_text) || "Explore Research";
  const actions = slideActionHref
    ? [{ label: slideActionLabel, href: slideActionHref, variant: "primary" as const }, ...heroActions.slice(1)]
    : heroActions;

  return (
    <section className="relative isolate min-h-[520px] overflow-hidden bg-primary">
      <Image
        src={heroImage}
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,35,80,0.98)_0%,rgba(0,53,99,0.88)_30%,rgba(0,62,73,0.45)_58%,rgba(0,27,54,0.12)_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_38%_20%,rgba(226,165,35,0.16)_0%,rgba(226,165,35,0)_32%)]" />
      <ResearchAnimatedBackdrop dark />
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#f4f6f4] via-[#f4f6f4]/60 to-transparent" />
      <div className="relative mx-auto grid min-h-[520px] max-w-[1920px] items-center gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[minmax(0,1fr)_520px] lg:px-8 xl:px-10 2xl:px-12">
        <div className="max-w-4xl">
          <ScrollReveal>
            <h1 className="max-w-4xl font-[family-name:var(--font-display)] text-4xl font-semibold leading-[1.03] text-white sm:text-5xl xl:text-6xl 2xl:text-7xl">
              {heroTitle}
              <span className="block text-secondary">{heroAccent}</span>
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-white/90 sm:text-lg">
              {heroBody}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              {actions.map((action) => (
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
          <div className="relative min-h-[360px]">
            <div className="absolute left-4 top-24 w-44 rounded-lg border border-white/35 bg-white/18 p-4 text-white shadow-[0_20px_70px_rgba(0,0,0,0.18)] backdrop-blur-md">
              <p className="text-xs font-semibold">Evidence to Impact</p>
              <p className="mt-2 text-xs leading-5 text-white/80">
                Turning discovery into solutions that matter.
              </p>
              <div className="mt-5 h-12 rounded-md border border-lime-200/30 bg-[linear-gradient(135deg,rgba(132,204,22,0.18),rgba(255,255,255,0.05))]" />
            </div>
            <Link
              href="/projects"
              className="absolute bottom-8 right-2 w-56 rounded-lg border border-white/35 bg-white/24 p-4 text-white shadow-[0_20px_70px_rgba(0,0,0,0.18)] backdrop-blur-md transition hover:bg-white/30"
            >
              <span className="block text-xs font-semibold">Active Projects</span>
              <span className="mt-3 block font-[family-name:var(--font-display)] text-4xl font-semibold">
                {activeProjects > 0 ? formatNumber(activeProjects) : "Explore"}
              </span>
              <span className="mt-1 block text-xs text-white/75">Across research themes</span>
            </Link>
            <div className="absolute right-28 top-6 h-3 w-3 rounded-full bg-lime-200 shadow-[0_0_0_12px_rgba(217,249,157,0.14),0_0_34px_rgba(217,249,157,0.9)]" />
            <div className="absolute left-10 top-2 h-2 w-2 rounded-full bg-blue-200 shadow-[0_0_0_10px_rgba(191,219,254,0.12),0_0_24px_rgba(191,219,254,0.9)]" />
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
      <div className="relative mx-auto max-w-[1680px] rounded-lg border border-slate-200 bg-white p-5 shadow-[0_20px_80px_rgba(15,23,42,0.08)] backdrop-blur lg:p-7">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:items-stretch lg:divide-x lg:divide-slate-200">
          <div className="hidden lg:block lg:pr-8">
            <SectionKicker>Direct access</SectionKicker>
            <nav aria-label="Research quick links" className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {quickLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link key={link.href + link.label} href={link.href} className="group block border-r border-slate-200 pr-5 last:border-r-0">
                    <span className={`inline-flex h-14 w-14 items-center justify-center rounded-md ${link.tone === "gold" ? "bg-secondary/12 text-secondary" : link.tone === "green" ? "bg-primary/10 text-primary" : "bg-blue-600/10 text-blue-700"}`}>
                      <Icon aria-hidden className="h-6 w-6" />
                    </span>
                    <span className="mt-4 block text-sm font-bold text-slate-950 transition group-hover:text-primary">
                      {link.label}
                    </span>
                    <span className="mt-1 block min-h-10 text-xs leading-5 text-slate-500">
                      {link.description}
                    </span>
                    <ArrowRight aria-hidden className="mt-3 h-4 w-4 text-primary transition group-hover:translate-x-1" />
                  </Link>
                );
              })}
            </nav>
          </div>
          <div className="lg:pl-8">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
              <div>
                <SectionKicker>Research portfolio at a glance</SectionKicker>
              </div>
            </div>
            <ScrollRevealGroup className="mt-5 grid grid-cols-3 gap-2 sm:grid-cols-4 lg:mt-6 xl:grid-cols-5" staggerDelay={55}>
              {metrics.map((metric) => {
                const Icon = metric.icon;
                const hasPublishedCount = metric.rawValue > 0;

                return (
                  <Link
                    key={metric.label}
                    href={metric.href}
                    className="group flex min-h-[56px] flex-col items-start justify-center rounded-full border border-slate-200 bg-slate-50 px-3 py-2 transition hover:border-primary/30 hover:bg-white sm:min-h-[74px] sm:rounded-md sm:gap-2"
                  >
                    <span className={`hidden h-7 w-7 shrink-0 items-center justify-center rounded-md sm:inline-flex ${metric.label === "Grants" ? "bg-secondary/10 text-secondary" : "bg-primary/10 text-primary"}`}>
                      <Icon aria-hidden className="h-3.5 w-3.5" />
                    </span>
                    <span className="block min-w-0">
                      <span className={`block font-[family-name:var(--font-display)] font-semibold leading-none text-slate-950 ${hasPublishedCount ? "text-sm sm:text-base" : "text-xs sm:text-sm"}`}>
                        {hasPublishedCount ? metric.value : "Explore"}
                      </span>
                      <span className="mt-0.5 block text-[9px] leading-3 text-slate-500 sm:mt-1 sm:text-[10px]">
                        {metric.label}
                      </span>
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
          <div className="research-image-fallback absolute right-5 top-5 h-[20%] min-h-24 w-[20%] min-w-24 overflow-hidden rounded-md border border-white shadow-sm">
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
      <div className="relative mx-auto max-w-[1680px] px-4 py-8 sm:px-6 lg:px-10">
        <div className="grid gap-8 lg:grid-cols-[360px_minmax(0,1fr)] lg:items-start">
          <div>
            <SectionKicker>Research in motion</SectionKicker>
            <h2 className="mt-4 font-[family-name:var(--font-display)] text-3xl font-semibold leading-tight text-slate-950 sm:text-4xl">
              Driving Discovery. Creating Solutions.
            </h2>
            <p className="mt-5 text-sm leading-7 text-slate-600">
              Our researchers are addressing pressing challenges through
              collaborative, interdisciplinary, and solution-oriented research.
            </p>
            <TextLink href="/projects">View all projects</TextLink>
          </div>
          <ScrollRevealGroup className="grid gap-5 md:grid-cols-2 xl:grid-cols-3" staggerDelay={65}>
            {items.slice(0, 3).map((item) => (
              <FeaturedWorkCard key={`${item.type}-${item.id}`} item={item} />
            ))}
          </ScrollRevealGroup>
        </div>
      </div>
    </ScrollReveal>
  );
}

function NewsEventsArticlesSection({ items }: { items: NewsItem[] }) {
  if (items.length === 0) {
    return null;
  }

  const groups = [
    {
      kind: "Event" as const,
      eyebrow: "Events",
      title: "Research events",
      href: "/events",
      items: items.filter((item) => item.kind === "Event").slice(0, 3),
    },
    {
      kind: "Article" as const,
      eyebrow: "Blogs",
      title: "Ideas & articles",
      href: "/news",
      items: items.filter((item) => item.kind === "Article").slice(0, 3),
    },
    {
      kind: "Announcement" as const,
      eyebrow: "Announcements",
      title: "Research notices",
      href: "/news",
      items: items.filter((item) => item.kind === "Announcement").slice(0, 3),
    },
    {
      kind: "News" as const,
      eyebrow: "News",
      title: "Latest news",
      href: "/news",
      items: items.filter((item) => item.kind === "News").slice(0, 3),
    },
  ].filter((group) => group.items.length > 0);

  if (groups.length === 0) {
    return null;
  }

  return (
    <ScrollReveal as="section" className="research-surface-grid relative isolate overflow-hidden bg-[#f4f6f4] px-3 py-3 sm:px-4">
      <ResearchAnimatedBackdrop />
      <div className="relative mx-auto max-w-[1680px] rounded-lg border border-white bg-white px-4 py-6 shadow-[0_14px_50px_rgba(15,23,42,0.05)] sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <SectionKicker>News, events & articles</SectionKicker>
            <h2 className="mt-2 font-[family-name:var(--font-display)] text-2xl font-semibold leading-tight text-slate-950 sm:text-3xl">
              Latest research updates.
            </h2>
          </div>
          <Link
            href="/news"
            className="inline-flex min-h-9 items-center gap-2 rounded-md border border-primary/20 px-3 py-2 text-sm font-semibold text-primary transition hover:border-primary hover:bg-primary/5"
          >
            All updates
            <ArrowRight aria-hidden className="h-4 w-4" />
          </Link>
        </div>
        <div className={`mt-5 grid gap-3 ${groups.length === 1 ? "lg:grid-cols-1" : groups.length === 2 ? "lg:grid-cols-2" : "lg:grid-cols-3"}`}>
          {groups.map((group) => (
            <UpdateGroupCard key={group.kind} group={group} wide={groups.length === 1} />
          ))}
        </div>
      </div>
    </ScrollReveal>
  );
}

function UpdateGroupCard({
  group,
  wide = false,
}: {
  group: {
    kind: NewsItem["kind"];
    eyebrow: string;
    title: string;
    href: string;
    items: NewsItem[];
  };
  wide?: boolean;
}) {
  return (
    <section className="rounded-md border border-slate-200 bg-slate-50 p-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-primary">
            {group.eyebrow}
          </p>
          <h3 className="mt-1 font-[family-name:var(--font-display)] text-lg font-semibold leading-6 text-slate-950">
            {group.title}
          </h3>
        </div>
        <Link
          href={group.href}
          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-primary/20 text-primary transition hover:border-primary hover:bg-primary/5"
          aria-label={`View all ${group.eyebrow.toLowerCase()}`}
        >
          <ArrowRight aria-hidden className="h-4 w-4" />
        </Link>
      </div>
      <div className={`mt-3 grid gap-2 ${wide ? "md:grid-cols-2 xl:grid-cols-3" : ""}`}>
        {group.items.map((item) => (
          <EditorialUpdateCard key={`${item.kind}-${item.id}`} item={item} compact />
        ))}
      </div>
    </section>
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
  impactMetrics,
  story,
}: {
  impactMetrics: ResearchGenericRecord[];
  story?: ResearchGenericRecord;
}) {
  const metrics = impactMetrics.slice(0, 4);
  const storyImage = story?.cover_image_url || story?.image_url || "/images/research/research-projects-hero.webp";

  return (
    <ScrollReveal as="section" className="research-surface-grid relative isolate overflow-hidden bg-[#f4f6f4] px-3 py-3 sm:px-4">
      <ResearchAnimatedBackdrop />
      <div className="relative mx-auto max-w-[1680px] space-y-5">
        <div className="relative overflow-hidden rounded-lg border border-primary/20 bg-white p-5 shadow-[0_20px_70px_rgba(15,23,42,0.06)] lg:p-6">
          <div className="grid gap-6 lg:grid-cols-[300px_minmax(280px,360px)_minmax(0,1fr)] lg:items-center">
            <div>
              <SectionKicker>Public impact</SectionKicker>
              <h2 className="mt-3 font-[family-name:var(--font-display)] text-2xl font-semibold leading-tight text-slate-950 sm:text-3xl">
                Research that improves lives and livelihoods
              </h2>
              <TextLink href="/community-impact">View all impact stories</TextLink>
            </div>
            <div className="research-image-fallback relative aspect-[16/7] overflow-hidden rounded-md lg:aspect-[16/8]">
              <Image
                src={storyImage}
                alt=""
                fill
                sizes="(min-width: 1024px) 360px, 100vw"
                className="object-cover"
              />
            </div>
            <div>
              <SectionKicker>Impact story</SectionKicker>
              {story ? (
                <>
                  <h3 className="mt-3 font-[family-name:var(--font-display)] text-xl font-semibold text-slate-950">
                    {compactText(story.title ?? story.name)}
                  </h3>
                  {compactText(story.summary ?? story.description ?? story.body) ? (
                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">
                      {compactText(story.summary ?? story.description ?? story.body)}
                    </p>
                  ) : null}
                  {story.slug ? <TextLink href={`/community-impact/${story.slug}`}>Read story</TextLink> : null}
                </>
              ) : (
                <Link href="/community-impact" className="mt-3 inline-flex items-center gap-2 font-[family-name:var(--font-display)] text-xl font-semibold text-slate-950 transition hover:text-primary">
                  Explore community impact
                  <ArrowRight aria-hidden className="h-4 w-4" />
                </Link>
              )}
            </div>
          </div>
          {metrics.length > 0 ? (
            <div className="mt-6 grid gap-3 border-t border-slate-200 pt-5 sm:grid-cols-2 lg:grid-cols-4">
              {metrics.map((metric) => (
                <div key={metric.id} className="border-slate-200 lg:border-r lg:pr-5 lg:last:border-r-0">
                  <p className="font-[family-name:var(--font-display)] text-2xl font-semibold text-slate-950">
                    {compactText(metric.value ?? metric.metric_value ?? metric.count ?? "—")}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {compactText(metric.title ?? metric.name ?? metric.label)}
                  </p>
                </div>
              ))}
            </div>
          ) : null}
          <Link
            href="/impact-metrics"
            aria-label="View impact metrics"
            className="absolute right-4 top-1/2 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white text-primary shadow-lg transition hover:translate-x-1 lg:flex"
          >
            <ArrowRight aria-hidden className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </ScrollReveal>
  );
}

function ResearchPartnersSection({ partners }: { partners: ResearchGenericRecord[] }) {
  if (partners.length === 0) {
    return null;
  }

  return (
    <ScrollReveal as="section" className="relative isolate overflow-hidden bg-[#f4f6f4] px-3 py-3 sm:px-4">
      <div className="relative mx-auto max-w-[1680px] rounded-lg border border-slate-200 bg-white py-5 shadow-[0_14px_50px_rgba(15,23,42,0.05)]">
        <div className="flex flex-col justify-between gap-3 px-4 sm:flex-row sm:items-end sm:px-6 lg:px-8">
          <div>
            <SectionKicker>Partners</SectionKicker>
            <h2 className="mt-2 font-[family-name:var(--font-display)] text-2xl font-semibold leading-tight text-slate-950 sm:text-3xl">
              Collaboration network.
            </h2>
          </div>
          <TextLink href="/partners">View all partners</TextLink>
        </div>
        <div className="research-marquee-frame relative mt-5 overflow-hidden border-y border-slate-100 bg-white py-4">
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-20 bg-gradient-to-r from-white to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-20 bg-gradient-to-l from-white to-transparent" />
          <PartnerMarquee partners={partners} />
          <PartnerMarquee partners={[...partners].reverse()} reverse />
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
    <Link
      href={item.href}
      className="group overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:border-primary/30 hover:shadow-md"
    >
      <div className="research-image-fallback relative aspect-[16/8.5]">
        <Image
          src={item.image}
          alt=""
          fill
          sizes="(min-width: 1536px) 25vw, (min-width: 1024px) 50vw, 100vw"
          className="object-cover"
        />
        <div className="absolute left-3 top-3">
          <FilledBadge>Featured {item.type}</FilledBadge>
        </div>
      </div>
      <div className="p-5">
        <h3 className="mt-4 font-[family-name:var(--font-display)] text-xl font-semibold leading-7 text-slate-950">
          {item.title}
        </h3>
        {item.summary ? (
          <p className="mt-3 line-clamp-3 text-sm leading-7 text-slate-600">
            {item.summary}
          </p>
        ) : null}
        <div className="mt-5 flex items-center justify-between gap-3">
          <div className="flex min-w-0 flex-wrap gap-2">
            {item.tags.slice(0, 2).map((tag) => <Badge key={tag}>{tag}</Badge>)}
          </div>
          <ArrowRight aria-hidden className="h-4 w-4 shrink-0 text-primary transition group-hover:translate-x-1" />
        </div>
      </div>
    </Link>
  );
}

function EditorialUpdateCard({
  item,
  compact = false,
}: {
  item: NewsItem;
  compact?: boolean;
}) {
  const label = item.kind === "Article" ? "Blog" : item.kind;
  const tone =
    item.kind === "Event"
      ? "border-secondary/20 bg-secondary/5"
        : item.kind === "Article"
        ? "border-primary/20 bg-primary/5"
        : item.kind === "Announcement"
          ? "border-amber-200 bg-amber-50/60"
          : "border-slate-200 bg-slate-50";

  return (
    <Link
      href={item.href}
      className={`group grid gap-3 rounded-md border p-3 transition hover:border-primary/30 hover:bg-white hover:shadow-sm ${
        compact
          ? `min-h-[88px] ${tone}`
          : "min-h-[92px] border-slate-200 bg-slate-50 sm:min-h-[118px] sm:grid-cols-[92px_minmax(0,1fr)] xl:block xl:min-h-[190px]"
      }`}
    >
      {!compact ? (
        <div className="research-image-fallback relative hidden min-h-24 overflow-hidden rounded-md sm:block xl:aspect-[16/7] xl:min-h-0">
          <Image
            src={item.image}
            alt=""
            fill
            sizes="(min-width: 1280px) 18vw, 92px"
            className="object-cover"
          />
        </div>
      ) : null}
      <div className="min-w-0 xl:mt-3">
        <div className="flex flex-wrap gap-1.5">
          <Badge>{label}</Badge>
          {item.date ? <Badge>{item.date}</Badge> : null}
        </div>
        <h3 className="mt-2 line-clamp-2 font-[family-name:var(--font-display)] text-base font-semibold leading-5 text-slate-950">
          {item.title}
        </h3>
        <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-primary">
          {item.kind === "Event"
            ? "View event"
            : item.kind === "Article"
              ? "Read blog"
              : item.kind === "Announcement"
                ? "Read notice"
                : "Read news"}
          <ArrowRight aria-hidden className="h-3.5 w-3.5 transition group-hover:translate-x-1" />
        </span>
      </div>
    </Link>
  );
}

function DirectoryRow({ item }: { item: DirectoryItem }) {
  return (
    <Link
      href={item.href}
      className="grid gap-4 border-b border-slate-200 p-4 transition last:border-b-0 hover:bg-primary/5 sm:grid-cols-[92px_minmax(0,1fr)_auto]"
    >
      <div className="research-image-fallback relative h-20 overflow-hidden rounded-md">
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
          <PartnerMarqueeItem
            key={`${partner.id}-${index}-${reverse ? "reverse" : "forward"}`}
            partner={partner}
          />
        ))}
      </div>
    </div>
  );
}

function PartnerMarqueeItem({ partner }: { partner: ResearchGenericRecord }) {
  const logo = compactText(
    partner.logo_url ??
      partner.logo ??
      partner.image_url ??
      partner.cover_image_url,
  );
  const name = compactText(partner.name ?? partner.title) || "Research partner";

  return (
    <Link
      href={partner.slug ? `/partners/${partner.slug}` : "/partners"}
      className="flex h-16 min-w-[210px] shrink-0 items-center justify-center gap-3 rounded-md border border-slate-200 bg-white px-5 text-center text-sm font-semibold text-slate-700 transition hover:border-primary/30 hover:text-primary"
    >
      {logo ? (
        <span className="relative h-9 w-16 shrink-0 overflow-hidden rounded bg-white">
          <Image
            src={logo}
            alt=""
            fill
            sizes="64px"
            className="object-contain"
          />
        </span>
      ) : null}
      <span className="line-clamp-2">{name}</span>
    </Link>
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
  variant?: "primary" | "outline" | "light" | "gold" | "impact" | "glass";
}) {
  const className =
    variant === "light"
      ? "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-white/40 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/20"
      : variant === "glass"
        ? "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-white/45 bg-white/10 px-5 py-3 text-sm font-semibold text-white shadow-sm backdrop-blur transition hover:bg-white/18"
        : variant === "impact"
          ? "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-secondary/60 bg-emerald-900/85 px-5 py-3 text-sm font-semibold text-white shadow-sm backdrop-blur transition hover:bg-emerald-900"
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
  kind: "News" | "Event" | "Article" | "Announcement";
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
  news: ResearchGenericRecord[],
  blogs: ResearchGenericRecord[],
  announcements: ResearchGenericRecord[],
  events: ResearchGenericRecord[],
): NewsItem[] {
  const newsItems = news.slice(0, 4).map((item) => ({
    id: item.id,
    kind: "News" as const,
    title: compactText(item.title ?? item.name),
    summary: compactText(item.summary ?? item.excerpt ?? item.description ?? item.plain_text ?? item.content),
    href: item.slug ? `/news/${item.slug}` : "/news",
    image: getRecordImage(item, "featured_media") || "/images/research/research-events-hero.webp",
    date: formatDate(item.published_at ?? item.created_at),
    timestamp: getTimestamp(item.published_at ?? item.created_at),
  }));
  const blogItems = blogs.slice(0, 4).map((item) => ({
    id: item.id,
    kind: "Article" as const,
    title: compactText(item.title ?? item.name),
    summary: compactText(item.summary ?? item.excerpt ?? item.description ?? item.plain_text ?? item.content),
    href: item.slug ? `/news/${item.slug}` : "/news",
    image: getRecordImage(item, "featured_media") || "/images/research/research-events-hero.webp",
    date: formatDate(item.published_at ?? item.created_at),
    timestamp: getTimestamp(item.published_at ?? item.created_at),
  }));
  const announcementItems = announcements.slice(0, 4).map((item) => ({
    id: item.id,
    kind: "Announcement" as const,
    title: compactText(item.title ?? item.name),
    summary: compactText(item.summary ?? item.description ?? item.plain_text ?? item.content),
    href: item.slug ? `/news/${item.slug}` : "/news",
    image: getRecordImage(item, "featured_media") || "/images/research/research-events-hero.webp",
    date: formatDate(item.published_at ?? item.valid_from ?? item.created_at),
    timestamp: getTimestamp(item.published_at ?? item.valid_from ?? item.created_at),
  }));
  const eventItems = events.slice(0, 3).map((item) => ({
    id: item.id,
    kind: "Event" as const,
    title: compactText(item.title ?? item.name),
    summary: compactText(item.summary ?? item.description ?? item.plain_text ?? item.content),
    href: item.slug ? `/events/${item.slug}` : "/events",
    image: getRecordImage(item, "featured_media") || "/images/research/research-events-hero.webp",
    date: formatDate(item.event_date ?? item.start_date ?? item.published_at ?? item.created_at),
    timestamp: getTimestamp(item.event_date ?? item.start_date ?? item.published_at ?? item.created_at),
  }));

  return [...eventItems, ...newsItems, ...blogItems, ...announcementItems]
    .filter((item) => item.title)
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 12);
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

function getRecordImage(record?: ResearchGenericRecord, mediaField?: string) {
  if (!record) return "";
  const direct = compactText(
    record.cover_image_url ??
      record.image_url ??
      record.logo_url ??
      record.thumbnail_url,
  );
  if (direct) return direct;

  const fields = mediaField
    ? [mediaField]
    : ["featured_media", "desktop_media", "mobile_media"];
  for (const field of fields) {
    const media = (record as Record<string, unknown>)[field];
    if (!media || typeof media !== "object") continue;
    const mediaRecord = media as Record<string, unknown>;
    const url = compactText(
      stringish(
        mediaRecord.public_url ??
          mediaRecord.cdn_url ??
          mediaRecord.url ??
          mediaRecord.thumbnail_url,
      ),
    );
    if (url) return url;
  }

  return "";
}

function stringish(value: unknown) {
  return typeof value === "string" || typeof value === "number" ? value : undefined;
}

function getTimestamp(value?: string | null) {
  if (!value) return 0;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 0 : date.getTime();
}
