import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import {
  ArrowRight,
  Award,
  BookOpen,
  ClipboardList,
  FileText,
  FlaskConical,
  Handshake,
  Sprout,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { ScrollReveal, ScrollRevealGroup } from "@ksu/ui/components";
import { richTextToPlainText } from "@ksu/ui/rich-text-renderer";
import type {
  FAQ,
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
import { getPartnerLogo } from "../lib/partner-logo";
import { getResearchSiteContext, type ResearchSiteContext } from "../lib/research-site-context";
import { Badge, FilledBadge, StatusMessage } from "../components/research-ui";
import { ResearchRichText } from "../components/research-rich-text";

export const revalidate = 300;

const heroActions = [
  { label: "Explore Research", href: "/projects", variant: "primary" as const },
  { label: "Our Impact", href: "/impact-metrics", variant: "impact" as const },
  { label: "Partner With Us", href: "/partners", variant: "glass" as const },
];

const quickLinks = [
  { label: "Projects", href: "/projects", description: "Explore active research projects", icon: FlaskConical, tone: "blue" },
  { label: "Publications", href: "/publications", description: "Browse our research output", icon: FileText, tone: "primary" },
  { label: "Funding", href: "/funding", description: "Grants and funding opportunities", icon: Handshake, tone: "secondary" },
  { label: "Partners", href: "/partners", description: "Collaborate with us for greater impact", icon: Users, tone: "blue" },
];

export default async function ResearchPage() {
  const overview = await getResearchOverviewData();
  const siteContext = await getResearchSiteContext();
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
    faqs,
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
  const focusItems = buildFocusItems(services.data);
  const resourceToolItems = buildResourceToolItems(resources.data, guidelines.data);
  const partnerItems = partners.data.slice(0, 16);
  const faqItems = buildFaqItems(faqs.data);
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
      faqs,
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
    <main id="research-main" className="min-h-screen bg-background text-foreground">
      <ResearchLandingHero
        slides={heroSliders.data}
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

      <AboutResearchSection headProfile={headProfile} siteContext={siteContext} />
      <ResearchFocusServicesSection items={focusItems} />
      <FeaturedWorkSection items={featuredWork} />
      <ResearchPartnersSection partners={partnerItems} />
      <ResourceToolsSection items={resourceToolItems} />
      <NewsEventsArticlesSection items={newsItems} />
      <ResearchFaqSection items={faqItems} />
    </main>
  );
}

function ResearchLandingHero({
  slides,
}: {
  slides: ResearchGenericRecord[];
}) {
  const activeSlides = slides
    .filter((item) => item.is_active !== false)
    .sort((a, b) => Number(a.display_order ?? 100) - Number(b.display_order ?? 100));
  const slide = activeSlides[0];
  const heroTitle = compactText(slide?.title) || "Research at Kisii University";
  const heroAccent = compactText(slide?.subtitle);
  const heroBody =
    compactText(slide?.plain_text ?? slide?.summary ?? slide?.description) ||
    "REIRM coordinates research, extension, innovation, partnerships, and resource mobilization for Kisii University.";
  const heroImage =
    getRecordImage(slide, "desktop_media") ||
    "/images/research/research-office-operations-hero.webp";
  const slideActionHref = compactText(slide?.external_url);
  const slideActionLabel = compactText(slide?.link_text) || "Explore Research";
  const actions = slideActionHref
    ? [{ label: slideActionLabel, href: slideActionHref, variant: "primary" as const }, ...heroActions.slice(1)]
    : heroActions;

  return (
    <section className="relative isolate min-h-[435px] overflow-hidden bg-brand-overlay sm:min-h-[475px] lg:min-h-[505px]">
      <Image
        src={heroImage}
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-brand-overlay/88 via-brand-overlay/38 to-brand-overlay/6" />
      <div className="absolute inset-0 bg-gradient-to-t from-brand-overlay/70 via-brand-overlay/8 to-brand-overlay/14" />
      <div className="absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-background via-background/40 to-transparent" />
      <div className="relative mx-auto flex min-h-[435px] max-w-[1920px] items-end px-4 pb-10 pt-24 sm:min-h-[475px] sm:px-6 sm:pb-12 lg:min-h-[505px] lg:px-8 lg:pb-14 xl:px-10 2xl:px-12">
        <ScrollReveal className="relative max-w-5xl">
          <div aria-hidden className="absolute -inset-x-5 -inset-y-8 -z-10 rounded-[2rem] bg-brand-overlay/24 blur-2xl sm:-inset-x-8 lg:-inset-x-12 lg:bg-brand-overlay/18" />
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-secondary drop-shadow-[0_2px_10px_rgba(0,0,0,0.65)] sm:mb-4">
            Research & Innovation
          </p>
          <h1 className="max-w-5xl font-[family-name:var(--font-display)] text-4xl font-semibold leading-[0.98] text-white drop-shadow-[0_6px_24px_rgba(0,0,0,0.55)] sm:text-5xl lg:text-6xl 2xl:text-7xl">
            {heroTitle}
            {heroAccent ? <span className="block text-secondary">{heroAccent}</span> : null}
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-white/88 drop-shadow-[0_2px_12px_rgba(0,0,0,0.72)] sm:mt-5 sm:text-base sm:leading-8 lg:max-w-3xl">
            {heroBody}
          </p>
          <div className="mt-6 flex flex-wrap gap-3 sm:mt-7">
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
          <div className="mt-6 flex items-center gap-2 sm:mt-7">
            {(activeSlides.length > 0 ? activeSlides : [{ id: "default" }]).slice(0, 5).map((item, index) => (
              <span
                key={String(item.id ?? index)}
                className={`h-2 rounded-full transition-all ${index === 0 ? "w-9 bg-secondary" : "w-2 bg-white/45"}`}
              />
            ))}
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

function AboutResearchSection({ headProfile, siteContext }: { headProfile: ResearchHeadProfile; siteContext: ResearchSiteContext }) {
  const researchEntity = getResearchContextEntity(siteContext);
  const aboutSource =
    stringish(researchEntity?.about) ??
      stringish(researchEntity?.description) ??
      stringish(researchEntity?.mandate);
  const about = truncateRichTextPreview(
    String(
      aboutSource ||
        "The Directorate of Research, Extension, Innovation and Resource Mobilization coordinates research, innovation, extension, partnerships, and resource mobilization at Kisii University.",
    ),
    500,
  );
  const headName = headProfile?.name || "Head of Research";
  const headTitle = headProfile?.title || "Head of Research, REIRM";
  const headMessage =
    headProfile?.message ||
    "Our mandate is to create an enabling environment where every scholar, student, and partner can turn knowledge into public value.";

  return (
    <ScrollReveal as="section" className="relative isolate overflow-hidden bg-background px-3 py-3 sm:px-4">
      <div className="relative mx-auto grid max-w-[1680px] gap-3 rounded-xl border border-white bg-white p-4 shadow-[0_20px_70px_rgba(15,23,42,0.06)] sm:p-5 lg:grid-cols-[minmax(0,1fr)_minmax(420px,0.78fr)] lg:p-8">
        <article className="rounded-lg bg-card p-6 lg:p-8">
          <SectionKicker>About Research</SectionKicker>
          <h2 className="mt-3 max-w-3xl font-[family-name:var(--font-display)] text-3xl font-semibold leading-tight text-foreground sm:text-4xl">
            {compactText(stringish(researchEntity?.name)) || "Research, Extension, Innovation and Resource Mobilization"}
          </h2>
          <div className="mt-5">
            <ResearchRichText
              content={about}
              className="text-sm leading-7 text-muted-foreground sm:text-base sm:leading-8 prose-p:my-0"
            />
            <Link
              href="/about"
              className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-primary transition hover:text-primary/80"
            >
              Read more
              <ArrowRight aria-hidden className="h-4 w-4" />
            </Link>
          </div>
          <nav aria-label="Research quick links" className="mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {quickLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link key={link.href} href={link.href} className="group rounded-md border border-border bg-white p-4 transition hover:border-primary/30 hover:shadow-sm">
                  <span className={`inline-flex h-10 w-10 items-center justify-center rounded-md ${link.tone === "secondary" ? "bg-secondary/10 text-secondary" : "bg-primary/10 text-primary"}`}>
                    <Icon aria-hidden className="h-5 w-5" />
                  </span>
                  <span className="mt-3 block text-sm font-bold text-foreground transition group-hover:text-primary">
                    {link.label}
                  </span>
                  <span className="mt-1 block text-xs leading-5 text-muted-foreground">
                    {link.description}
                  </span>
                </Link>
              );
            })}
          </nav>
        </article>

        <article className="research-glass-panel research-border-sheen relative rounded-lg p-6 lg:p-8">
          {headProfile?.photoUrl ? (
            <div className="research-image-fallback absolute right-5 top-5 h-[20%] min-h-24 w-[20%] min-w-24 overflow-hidden rounded-md border border-white shadow-sm">
              <Image
                src={headProfile.photoUrl}
                alt={headName}
                fill
                sizes="140px"
                className="object-cover"
              />
            </div>
          ) : null}
          <div className={headProfile?.photoUrl ? "max-w-[76%]" : "max-w-xl"}>
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-md bg-primary text-white">
              <Users aria-hidden className="h-5 w-5" />
            </span>
            <SectionKicker className="mt-5">Message from the Head</SectionKicker>
          </div>
          <blockquote className="mt-6 max-w-xl text-lg font-medium leading-8 text-foreground">
            “{headMessage}”
          </blockquote>
          <p className="mt-5 text-sm font-semibold text-foreground">
            {headTitle}
          </p>
          {headProfile?.name ? (
            <p className="mt-1 text-sm text-muted-foreground">{headProfile.name}</p>
          ) : null}
          <div className="mt-6 flex flex-wrap gap-3">
            <ActionLink href="/connect" variant="outline">Contact REIRM</ActionLink>
          </div>
        </article>
      </div>
    </ScrollReveal>
  );
}

function ResearchFocusServicesSection({ items }: { items: FocusItem[] }) {
  return (
    <ScrollReveal as="section" className="relative isolate overflow-hidden bg-background px-3 py-3 sm:px-4">
      <div className="relative mx-auto max-w-[1680px] border-t border-border bg-card px-4 py-8 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Research Focus / Services"
          title="Support pathways for research, innovation, extension, and resource mobilization."
        />
        <ScrollRevealGroup className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4" staggerDelay={70}>
          {items.map((item) => (
            <FocusServiceCard key={item.title} item={item} />
          ))}
        </ScrollRevealGroup>
      </div>
    </ScrollReveal>
  );
}

function FocusServiceCard({ item }: { item: FocusItem }) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      className="group flex min-h-[170px] flex-col rounded-lg border border-border bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-primary/30 hover:shadow-md"
    >
      <span className="inline-flex h-11 w-11 items-center justify-center rounded-md bg-primary/10 text-primary">
        <Icon aria-hidden className="h-5 w-5" />
      </span>
      <h3 className="mt-4 text-base font-semibold leading-6 text-foreground">
        {item.title}
      </h3>
      <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted-foreground">
        {item.summary}
      </p>
      <span className="mt-auto inline-flex items-center gap-2 pt-4 text-xs font-semibold text-primary">
        Learn more
        <ArrowRight aria-hidden className="h-3.5 w-3.5 transition group-hover:translate-x-1" />
      </span>
    </Link>
  );
}

function FeaturedWorkSection({ items }: { items: FeaturedWorkItem[] }) {
  if (items.length === 0) {
    return null;
  }

  return (
    <ScrollReveal as="section" className="relative isolate overflow-hidden bg-background px-3 py-3 sm:px-4">
      <div className="relative mx-auto max-w-[1680px] px-4 py-8 sm:px-6 lg:px-10">
        <div className="grid gap-8 lg:grid-cols-[360px_minmax(0,1fr)] lg:items-start">
          <div>
            <SectionKicker>Featured Projects / Grants</SectionKicker>
            <h2 className="mt-4 font-[family-name:var(--font-display)] text-3xl font-semibold leading-tight text-foreground sm:text-4xl">
              Research work and funding records.
            </h2>
            <p className="mt-5 text-sm leading-7 text-muted-foreground">
              Active projects, published outputs, innovations, and grants from
              the research portfolio.
            </p>
            <TextLink href="/projects">View all projects</TextLink>
          </div>
          <ScrollRevealGroup className="grid gap-5 md:grid-cols-2 xl:grid-cols-4" staggerDelay={65}>
            {items.slice(0, 4).map((item) => (
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
      kind: "News" as const,
      eyebrow: "Latest News",
      title: "Latest News",
      href: "/news",
      items: items.filter((item) => item.kind === "News").slice(0, 3),
    },
    {
      kind: "Event" as const,
      eyebrow: "Upcoming Events",
      title: "Upcoming Events",
      href: "/events",
      items: items.filter((item) => item.kind === "Event").slice(0, 3),
    },
    {
      kind: "Article" as const,
      eyebrow: "Research Articles",
      title: "Research Articles",
      href: "/news",
      items: items.filter((item) => item.kind === "Article").slice(0, 3),
    },
  ].filter((group) => group.items.length > 0);

  if (groups.length === 0) {
    return null;
  }

  return (
    <ScrollReveal as="section" className="research-surface-grid relative isolate overflow-hidden bg-background px-3 py-3 sm:px-4">
      <ResearchAnimatedBackdrop />
      <div className="relative mx-auto max-w-[1680px] rounded-lg border border-white bg-white px-4 py-6 shadow-[0_14px_50px_rgba(15,23,42,0.05)] sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <SectionKicker>News, events & articles</SectionKicker>
            <h2 className="mt-2 font-[family-name:var(--font-display)] text-2xl font-semibold leading-tight text-foreground sm:text-3xl">
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
        <ScrollRevealGroup className={`mt-5 grid gap-3 ${groups.length === 1 ? "lg:grid-cols-1" : groups.length === 2 ? "lg:grid-cols-2" : "lg:grid-cols-3"}`} staggerDelay={80}>
          {groups.map((group) => (
            <UpdateGroupCard key={group.kind} group={group} wide={groups.length === 1} />
          ))}
        </ScrollRevealGroup>
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
    <section className="rounded-md border border-border bg-surface-subtle p-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-primary">
            {group.eyebrow}
          </p>
          <h3 className="mt-1 font-[family-name:var(--font-display)] text-lg font-semibold leading-6 text-foreground">
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
      <ScrollRevealGroup className={`mt-3 grid gap-2 ${wide ? "md:grid-cols-2 xl:grid-cols-3" : ""}`} staggerDelay={55}>
        {group.items.map((item) => (
          <EditorialUpdateCard key={`${item.kind}-${item.id}`} item={item} compact />
        ))}
      </ScrollRevealGroup>
    </section>
  );
}

function ResearchPartnersSection({ partners }: { partners: ResearchGenericRecord[] }) {
  if (partners.length === 0) {
    return null;
  }

  return (
    <ScrollReveal as="section" className="relative isolate overflow-hidden bg-background px-3 py-3 sm:px-4">
      <div className="relative mx-auto max-w-[1680px] border-t border-border bg-card px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-3 px-4 sm:flex-row sm:items-end sm:px-6 lg:px-8">
          <div>
            <SectionKicker>Partners</SectionKicker>
            <h2 className="mt-2 font-[family-name:var(--font-display)] text-2xl font-semibold leading-tight text-foreground sm:text-3xl">
              Our Partners
            </h2>
          </div>
          <TextLink href="/partners">View all partners</TextLink>
        </div>
        <ScrollRevealGroup className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6" staggerDelay={60}>
          {partners.slice(0, 12).map((partner) => (
            <PartnerLogoCard key={partner.id} partner={partner} />
          ))}
        </ScrollRevealGroup>
      </div>
    </ScrollReveal>
  );
}

function PartnerLogoCard({ partner }: { partner: ResearchGenericRecord }) {
  const logo = getPartnerLogo(partner);
  const name = compactText(partner.name ?? partner.title) || "Research partner";

  return (
    <Link
      href={partner.slug ? `/partners/${partner.slug}` : "/partners"}
      className="group flex min-h-24 flex-col items-center justify-center rounded-lg border border-border bg-white p-4 text-center text-sm font-semibold text-muted-foreground shadow-sm transition hover:-translate-y-0.5 hover:border-primary/30 hover:text-primary hover:shadow-md"
    >
      {logo ? (
        <span className="relative mb-3 h-10 w-28 shrink-0 overflow-hidden bg-white">
          <Image
            src={logo}
            alt=""
            fill
            sizes="112px"
            className="object-contain"
          />
        </span>
      ) : null}
      <span className="line-clamp-2">{name}</span>
    </Link>
  );
}

function ResourceToolsSection({ items }: { items: ResourceToolItem[] }) {
  if (items.length === 0) {
    return null;
  }

  return (
    <ScrollReveal as="section" className="relative isolate overflow-hidden bg-background px-3 py-3 sm:px-4">
      <div className="relative mx-auto max-w-[1680px] border-t border-border bg-card px-4 py-8 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Resources & Tools"
          title="Policies, forms, downloads, and services for research work."
          action={{ href: "/resources-tools", label: "View all resources" }}
        />
        <ScrollRevealGroup className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4" staggerDelay={70}>
          {items.map((item) => (
            <ResourceToolCard key={item.href} item={item} />
          ))}
        </ScrollRevealGroup>
      </div>
    </ScrollReveal>
  );
}

function ResourceToolCard({ item }: { item: ResourceToolItem }) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      className="group flex min-h-[165px] flex-col rounded-lg border border-border bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-primary/30 hover:shadow-md"
    >
      <span className="inline-flex h-11 w-11 items-center justify-center rounded-md bg-primary/10 text-primary">
        <Icon aria-hidden className="h-5 w-5" />
      </span>
      <h3 className="mt-4 text-base font-semibold leading-6 text-foreground">
        {item.title}
      </h3>
      <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted-foreground">
        {item.summary}
      </p>
      <span className="mt-auto inline-flex items-center gap-2 pt-4 text-xs font-semibold text-primary">
        {item.action}
        <ArrowRight aria-hidden className="h-3.5 w-3.5 transition group-hover:translate-x-1" />
      </span>
    </Link>
  );
}

function ResearchFaqSection({ items }: { items: FaqItem[] }) {
  if (items.length === 0) {
    return null;
  }

  return (
    <ScrollReveal as="section" className="relative isolate overflow-hidden bg-background px-3 py-3 sm:px-4">
      <div className="relative mx-auto grid max-w-[1680px] gap-6 rounded-xl border border-white bg-white px-4 py-12 shadow-[0_20px_70px_rgba(15,23,42,0.06)] sm:px-6 lg:grid-cols-[360px_minmax(0,1fr)] lg:px-10">
        <div>
          <SectionKicker>Research FAQs</SectionKicker>
          <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-semibold leading-tight text-foreground sm:text-4xl">
            Common research support questions.
          </h2>
          <p className="mt-4 text-sm leading-7 text-muted-foreground">
            Quick answers for research office contacts, policies, approvals, projects, and funding support.
          </p>
          <TextLink href="/resources-tools">Open resources and policies</TextLink>
        </div>
        <ScrollRevealGroup className="divide-y divide-slate-200 overflow-hidden rounded-lg border border-border" staggerDelay={60}>
          {items.slice(0, 6).map((item, index) => (
            <details key={item.id} className="group bg-white open:bg-surface-subtle" open={index === 0}>
              <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-left text-sm font-semibold text-foreground marker:hidden">
                <span>{item.question}</span>
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-primary/20 text-primary transition group-open:rotate-45 group-open:bg-primary group-open:text-white">
                  +
                </span>
              </summary>
              <div className="px-5 pb-5 text-sm leading-7 text-muted-foreground">
                {item.answer}
              </div>
            </details>
          ))}
        </ScrollRevealGroup>
      </div>
    </ScrollReveal>
  );
}

function FeaturedWorkCard({ item }: { item: FeaturedWorkItem }) {
  return (
    <Link
      href={item.href}
      className="group overflow-hidden rounded-lg border border-border bg-white shadow-sm transition hover:-translate-y-1 hover:border-primary/30 hover:shadow-md"
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
        <h3 className="mt-4 font-[family-name:var(--font-display)] text-xl font-semibold leading-7 text-foreground">
          {item.title}
        </h3>
        {item.summary ? (
          <p className="mt-3 line-clamp-3 text-sm leading-7 text-muted-foreground">
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
          : "border-border bg-surface-subtle";

  return (
    <Link
      href={item.href}
      className={`group grid gap-3 rounded-md border p-3 transition hover:border-primary/30 hover:bg-white hover:shadow-sm ${
        compact
          ? `min-h-[88px] ${tone}`
          : "min-h-[92px] border-border bg-surface-subtle sm:min-h-[118px] sm:grid-cols-[92px_minmax(0,1fr)] xl:block xl:min-h-[190px]"
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
        <h3 className="mt-2 line-clamp-2 font-[family-name:var(--font-display)] text-base font-semibold leading-5 text-foreground">
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
        <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-semibold leading-tight text-foreground sm:text-4xl">
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
  variant?: "primary" | "outline" | "light" | "secondary" | "impact" | "glass";
}) {
  const className =
    variant === "light"
      ? "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-white/40 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/20"
      : variant === "glass"
        ? "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-white/45 bg-white/10 px-5 py-3 text-sm font-semibold text-white shadow-sm backdrop-blur transition hover:bg-white/18"
        : variant === "impact"
          ? "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-white/35 bg-primary/80 px-5 py-3 text-sm font-semibold text-white shadow-sm backdrop-blur transition hover:bg-primary"
      : variant === "secondary"
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

type FocusItem = {
  title: string;
  summary: string;
  href: string;
  icon: LucideIcon;
};

type ResourceToolItem = {
  title: string;
  summary: string;
  href: string;
  action: string;
  icon: LucideIcon;
};

type FaqItem = {
  id: string;
  question: string;
  answer: string;
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

function buildFocusItems(services: ResearchGenericRecord[]): FocusItem[] {
  const backendItems = preferFeatured(services)
    .slice(0, 4)
    .map((item) => ({
      title: compactText(item.title ?? item.name),
      summary: compactText(item.summary ?? item.description ?? item.scope ?? item.how_to_access),
      href: item.slug ? `/services/${item.slug}` : "/services",
      icon: Handshake,
    }))
    .filter((item) => item.title && item.summary);

  if (backendItems.length >= 4) {
    return backendItems.slice(0, 4);
  }

  return [
    ...backendItems,
    {
      title: "Research Support",
      summary: "Grants management, ethical review, research administration, and capacity building.",
      href: "/services",
      icon: Users,
    },
    {
      title: "Extension",
      summary: "Community engagement, knowledge transfer, and societal impact initiatives.",
      href: "/community-impact",
      icon: Sprout,
    },
    {
      title: "Innovation",
      summary: "Technology development, incubation, startups, and commercialization support.",
      href: "/innovations",
      icon: FlaskConical,
    },
    {
      title: "Resource Mobilization",
      summary: "Partnership development, proposal support, and fundraising for sustainable research.",
      href: "/funding",
      icon: Handshake,
    },
  ].slice(0, 4);
}

function buildResourceToolItems(
  resources: ResearchGenericRecord[],
  guidelines: ResearchGenericRecord[],
): ResourceToolItem[] {
  const resource = preferFeatured(resources)[0];
  const guideline = preferFeatured(guidelines)[0];

  return [
    {
      title: compactText(resource?.title ?? resource?.name) || "Research Library",
      summary: compactText(resource?.summary ?? resource?.description) || "Access publications, journals, books, and datasets.",
      href: resource?.slug ? `/resources-tools/${resource.slug}` : "/resources-tools/library",
      action: "Go to library",
      icon: BookOpen,
    },
    {
      title: compactText(guideline?.title ?? guideline?.name) || "Policies & Guidelines",
      summary: compactText(guideline?.summary ?? guideline?.content) || "University research policies, guidelines, and procedures.",
      href: guideline?.slug ? `/guidelines/${guideline.slug}` : "/resources-tools/policies",
      action: "View policies",
      icon: FileText,
    },
    {
      title: "Downloads",
      summary: "Templates, toolkits, reports, and useful documents.",
      href: "/resources-tools/downloads",
      action: "Browse downloads",
      icon: Award,
    },
    {
      title: "Forms & Templates",
      summary: "Research forms, applications, reporting templates, and submission documents.",
      href: "/resources-tools/forms",
      action: "View forms",
      icon: ClipboardList,
    },
  ];
}

function buildFaqItems(items: FAQ[]): FaqItem[] {
  const backendItems = items
    .map((item) => ({
      id: item.id,
      question: compactText(item.question),
      answer: compactText(item.answer_plain_text ?? item.answer ?? item.answer_rich_text),
    }))
    .filter((item) => item.question && item.answer);

  if (backendItems.length > 0) {
    return backendItems;
  }

  return [
    {
      id: "default-contact",
      question: "How do I contact REIRM?",
      answer: "Use the Contact REIRM page or email research@kisiiuniversity.ac.ke for research, innovation, extension, partnership, and resource mobilization support.",
    },
    {
      id: "default-policies",
      question: "Where do I find research policies and guidelines?",
      answer: "Use Resources & Tools to access public research policies, guidelines, forms, templates, services, outputs, and downloads.",
    },
    {
      id: "default-nacosti",
      question: "How do I apply for NACOSTI approval?",
      answer: "Use the Apply NACOSTI link in the research portal header or visit the NACOSTI research portal directly at research-portal.nacosti.go.ke.",
    },
    {
      id: "default-partnership",
      question: "How can an external organization partner with Kisii University research?",
      answer: "Use Partners or Contact REIRM so the office can route the request to the relevant research, extension, innovation, or resource mobilization pathway.",
    },
  ];
}

function preferFeatured<T extends { is_featured?: boolean }>(items: T[]) {
  return [...items].sort((a, b) => Number(Boolean(b.is_featured)) - Number(Boolean(a.is_featured)));
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

function truncateRichTextPreview(content: string, maxLength: number) {
  const text = richTextToPlainText(content);
  if (text.length <= maxLength) return content;

  const preview = text.slice(0, maxLength).trimEnd();
  const lastSpace = preview.lastIndexOf(" ");
  return `${preview.slice(0, lastSpace > 360 ? lastSpace : preview.length)}...`;
}

function getResearchContextEntity(siteContext: ResearchSiteContext) {
  return (
    siteContext.researchContext?.entity ??
    siteContext.researchContext?.department ??
    siteContext.researchContext?.wing ??
    siteContext.researchContext?.division ??
    {}
  ) as Record<string, unknown>;
}

function getTimestamp(value?: string | null) {
  if (!value) return 0;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 0 : date.getTime();
}
