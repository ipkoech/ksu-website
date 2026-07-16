"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ArrowRight,
  Building2,
  CalendarDays,
  Check,
  ChevronDown,
  Download,
  Eye,
  Landmark,
  Lightbulb,
  MapPin,
  Play,
  School,
  Sparkles,
  Target,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type {
  PublicAboutData,
  PublicHistoryMilestone,
} from "@/lib/public-about-data";
import { ImageComparison } from "./image-comparison";
import { AboutReveal } from "./about-reveal";
import { InstitutionalIcon } from "./institutional-icon";

const heroFallback = "/images/backgrounds/about-hero.jpg";
const identityFallback = "/images/about/about-overview.webp";

function paragraphs(value?: string | null) {
  return (value ?? "").split(/\n\s*\n/).map((item) => item.trim()).filter(Boolean);
}

function mediaUrl(media: { url?: string | null } | null | undefined, fallback: string) {
  return media?.url?.trim() || fallback;
}

function mediaAlt(media: { alt?: string | null; alt_text?: string | null } | null | undefined, fallback: string) {
  return media?.alt_text?.trim() || media?.alt?.trim() || fallback;
}

const valueDetails = [
  { title: "Transformative Thinking", icon_key: "lightbulb", description: "We welcome creativity, inquiry and bold ideas that solve real-world challenges." },
  { title: "Respect", icon_key: "heart-handshake", description: "We value every person and nurture a culture of dignity and mutual regard." },
  { title: "Inclusivity", icon_key: "users", description: "We create opportunity across backgrounds, disciplines and borders." },
  { title: "Fairness", icon_key: "scale", description: "We uphold justice, transparency and equity in our decisions and relationships." },
];

const mandateDetails = [
  { title: "Teaching & Training", icon_key: "graduation-cap", description: "Develop capable graduates through rigorous, relevant education." },
  { title: "Research & Innovation", icon_key: "lightbulb", description: "Generate and translate knowledge for social and economic progress." },
  { title: "Community Engagement", icon_key: "handshake", description: "Work with communities to create shared and sustainable impact." },
  { title: "Preservation of Knowledge", icon_key: "book-open", description: "Protect, extend and share intellectual and cultural knowledge." },
  { title: "National & Regional Development", icon_key: "landmark", description: "Contribute expertise and talent to Kenya and the wider region." },
];

function HistoryDrawer({
  open,
  milestones,
  historyDocument,
  onClose,
}: {
  open: boolean;
  milestones: PublicHistoryMilestone[];
  historyDocument?: { url?: string | null; title?: string | null } | null;
  onClose: () => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose, open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80]" role="dialog" aria-modal="true" aria-labelledby="history-title">
      <button type="button" aria-label="Close history" onClick={onClose} className="absolute inset-0 bg-brand-overlay/45 backdrop-blur-[2px]" />
      <aside className="absolute inset-x-0 bottom-0 max-h-[88dvh] overflow-y-auto rounded-t-3xl bg-surface shadow-2xl motion-safe:animate-in motion-safe:slide-in-from-bottom md:inset-y-0 md:left-auto md:w-[60vw] md:max-w-3xl md:rounded-none md:motion-safe:slide-in-from-right xl:w-[44vw]">
        <div className="sticky top-0 z-10 border-b border-border/80 bg-surface/95 px-6 py-6 backdrop-blur sm:px-8">
          <div className="flex items-start justify-between gap-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-secondary">Our journey</p>
              <h2 id="history-title" className="mt-2 font-[family-name:var(--font-display)] text-3xl font-semibold text-primary sm:text-4xl">Our History</h2>
              <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">Six decades of growth, public service and moments that shaped Kisii University.</p>
            </div>
            <button ref={closeRef} type="button" onClick={onClose} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-border text-muted-foreground transition hover:bg-white focus:outline-none focus:ring-2 focus:ring-primary" aria-label="Close history drawer">
              <X className="h-5 w-5" aria-hidden />
            </button>
          </div>
        </div>

        <ol className="relative space-y-0 px-6 py-4 sm:px-8">
          {milestones.map((milestone, index) => {
            const isExpanded = expanded === milestone.id;
            return (
              <li key={milestone.id} className="relative grid grid-cols-[3.5rem_1fr] gap-4 pb-7 sm:grid-cols-[4rem_1fr]">
                {index < milestones.length - 1 ? <span aria-hidden className="absolute bottom-0 left-[4.25rem] top-7 w-px bg-primary/25 sm:left-[4.75rem]" /> : null}
                <p className="pt-1 text-sm font-bold text-primary">{milestone.year_label}</p>
                <article className="relative rounded-2xl border border-border bg-white p-4 shadow-sm">
                  <span aria-hidden className="absolute -left-[1.15rem] top-6 h-3 w-3 rounded-full border-2 border-[hsl(var(--surface))] bg-secondary sm:-left-[1.15rem]" />
                  <div className="grid gap-4 sm:grid-cols-[1fr_7rem] sm:items-start">
                    <div>
                      <h3 className="font-semibold text-foreground">{milestone.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">{milestone.summary}</p>
                      {isExpanded && milestone.expanded_body ? <p className="mt-3 border-t border-border pt-3 text-sm leading-6 text-muted-foreground">{milestone.expanded_body}</p> : null}
                      {milestone.expanded_body ? (
                        <button type="button" onClick={() => setExpanded(isExpanded ? null : milestone.id)} aria-expanded={isExpanded} className="mt-3 inline-flex min-h-11 items-center gap-2 text-sm font-bold text-primary hover:underline">
                          {isExpanded ? "Show less" : "Read more"}<ChevronDown className={`h-4 w-4 transition ${isExpanded ? "rotate-180" : ""}`} aria-hidden />
                        </button>
                      ) : null}
                    </div>
                    <div className="relative hidden aspect-square overflow-hidden rounded-xl bg-surface-muted sm:block">
                      <Image src={mediaUrl(milestone.image, index < 3 ? "/images/backgrounds/bg-history.jpg" : identityFallback)} alt={milestone.image_alt_text || `${milestone.title} historical milestone`} fill sizes="112px" className="object-cover grayscale-[20%]" />
                    </div>
                  </div>
                </article>
              </li>
            );
          })}
        </ol>

        <div className="sticky bottom-0 border-t border-border bg-surface/95 px-6 py-5 backdrop-blur sm:px-8">
          {historyDocument?.url ? (
            <Link href={historyDocument.url} className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white transition hover:bg-primary/90">
              <Download className="h-4 w-4" aria-hidden /> Download Full History
            </Link>
          ) : (
            <button type="button" onClick={onClose} className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white transition hover:bg-primary/90">Return to About KSU <ArrowRight className="h-4 w-4" aria-hidden /></button>
          )}
        </div>
      </aside>
    </div>
  );
}

function VirtualTourDialog({
  open,
  title,
  provider,
  type,
  source,
  mimeType,
  poster,
  accessibilityUrl,
  onClose,
}: {
  open: boolean;
  title: string;
  provider?: string | null;
  type: "embed" | "video";
  source: string;
  mimeType?: string | null;
  poster?: string | null;
  accessibilityUrl?: string | null;
  onClose: () => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose, open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[90] grid place-items-center bg-brand-overlay/92 p-4 sm:p-6" role="dialog" aria-modal="true" aria-labelledby="virtual-tour-title">
      <button type="button" tabIndex={-1} aria-label="Close virtual tour" onClick={onClose} className="absolute inset-0" />
      <section className="relative z-10 w-full max-w-6xl overflow-hidden rounded-2xl bg-brand-overlay shadow-2xl ring-1 ring-white/20">
        <header className="flex items-start justify-between gap-5 border-b border-white/15 px-5 py-4 text-white sm:px-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-secondary">Virtual campus tour</p>
            <h2 id="virtual-tour-title" className="mt-1 font-[family-name:var(--font-display)] text-2xl font-semibold sm:text-3xl">{title}</h2>
            {provider ? <p className="mt-1 text-xs text-white/60">Presented by {provider}</p> : null}
          </div>
          <button ref={closeRef} type="button" onClick={onClose} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-foreground transition hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-secondary" aria-label="Close virtual tour">
            <X className="h-5 w-5" aria-hidden />
          </button>
        </header>
        <div className="bg-black">
          {type === "embed" ? (
            <iframe src={source} title={title} className="aspect-video max-h-[72dvh] w-full" allow="accelerometer; autoplay; fullscreen; gyroscope; picture-in-picture; xr-spatial-tracking" allowFullScreen />
          ) : (
            <video className="aspect-video max-h-[72dvh] w-full bg-black" controls playsInline preload="metadata" poster={poster || undefined}>
              <source src={source} type={mimeType || undefined} />
              Your browser does not support embedded video.
            </video>
          )}
        </div>
        {accessibilityUrl ? (
          <div className="border-t border-white/15 px-5 py-4 sm:px-6">
            <Link href={accessibilityUrl} className="inline-flex min-h-11 items-center gap-2 text-sm font-bold text-white hover:text-secondary hover:underline">
              Open the accessible tour alternative <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        ) : null}
      </section>
    </div>
  );
}

export function PublicAboutPage({ data, historyInitiallyOpen = false }: { data: PublicAboutData; historyInitiallyOpen?: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const [historyOpen, setHistoryOpen] = useState(historyInitiallyOpen);
  const [videoOpen, setVideoOpen] = useState(false);
  const [tourOpen, setTourOpen] = useState(false);
  const historyTriggerRef = useRef<HTMLButtonElement>(null);
  const tourTriggerRef = useRef<HTMLButtonElement>(null);
  const content = data.content;
  const university = data.university;
  const heroParagraphs = paragraphs(content?.hero_introduction || university.overview).slice(0, 1);
  const coreValues = (university.core_values ?? "").split(/[;|\n]+/).map((item) => item.trim()).filter(Boolean);
  const quickFacts = university.quick_facts ?? {};
  const institutionalSections = data.institutional_page?.sections ?? [];
  const coreValuesSection = institutionalSections.find((section) => section.slug === "core-values");
  const mandateSection = institutionalSections.find((section) => section.slug === "university-mandate");
  const governanceSection = institutionalSections.find((section) => section.slug === "governance");
  const strategySection = institutionalSections.find((section) => section.slug === "strategic-direction");
  const displayedValues = coreValuesSection?.items.length ? coreValuesSection.items : valueDetails;
  const displayedMandate = mandateSection?.items.length ? mandateSection.items : mandateDetails;
  const virtualTourType = content?.virtual_tour_type;
  const virtualTourSource = virtualTourType === "embed"
    ? content?.virtual_tour_url?.trim()
    : content?.virtual_tour_media?.url?.trim();
  const hasVirtualTour = Boolean(virtualTourType && virtualTourSource);

  const setHistory = (open: boolean) => {
    setHistoryOpen(open);
    router.replace(open ? `${pathname}?history=open` : pathname, { scroll: false });
    if (!open) window.setTimeout(() => historyTriggerRef.current?.focus(), 0);
  };

  const setTour = (open: boolean) => {
    setTourOpen(open);
    if (!open) window.setTimeout(() => tourTriggerRef.current?.focus(), 0);
  };

  const profile = [
    { label: "Established", value: String(university.founding_year || quickFacts.founding_year || "1965"), icon: CalendarDays },
    { label: "Chartered", value: String(quickFacts.charter_year || "2013"), icon: Landmark },
    { label: "Schools", value: String(quickFacts.schools || "8"), icon: School },
    { label: "Research Centres", value: "13+", icon: Lightbulb },
    { label: "Campuses", value: String(quickFacts.main_campus || university.physical_address || "Main Campus, Kisii County"), icon: MapPin },
    { label: "Legal Status", value: "Public University", icon: Building2 },
  ];

  return (
    <div className="bg-surface text-foreground">
      <section className="relative isolate min-h-[440px] overflow-hidden bg-primary text-white">
        <Image src={mediaUrl(content?.hero_media, heroFallback)} alt={mediaAlt(content?.hero_media, "Aerial view of Kisii University campus")} fill priority sizes="100vw" className="object-cover motion-safe:animate-[kenburns_24s_ease-in-out_infinite_alternate]" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,45,30,.96)_0%,rgba(0,45,30,.83)_42%,rgba(0,45,30,.18)_78%)]" />
        <div className="relative mx-auto flex min-h-[440px] w-full flex-col justify-center px-5 py-7 sm:px-8 lg:px-10">
          <nav aria-label="Breadcrumb" className="mb-7 text-xs font-semibold text-white/80"><Link href="/" className="hover:text-white">Home</Link><span className="mx-2">/</span><span>{content?.hero_eyebrow || "About Kisii University"}</span></nav>
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-secondary">{content?.hero_eyebrow || "About Kisii University"}</p>
            <h1 className="mt-3 whitespace-pre-line font-[family-name:var(--font-display)] text-4xl font-semibold leading-[1.04] sm:text-5xl lg:text-6xl">{(content?.hero_headline || "A Legacy of Excellence. A Future of Impact.").replace(". A Future", ".\nA Future")}</h1>
            <div className="mt-4 max-w-xl text-sm leading-6 text-white/88">{heroParagraphs.map((item) => <p key={item}>{item}</p>)}</div>
            <div className="mt-5 flex flex-wrap gap-3">
              <button ref={historyTriggerRef} type="button" onClick={() => setHistory(true)} className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-secondary px-4 py-2.5 text-xs font-bold uppercase text-foreground transition hover:-translate-y-0.5 hover:bg-amber-400 focus:outline-none focus:ring-2 focus:ring-white motion-reduce:transform-none">Discover Our Journey <ArrowRight className="h-4 w-4" aria-hidden /></button>
              {content?.video_url ? <button type="button" onClick={() => setVideoOpen(true)} className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-white/60 bg-white/5 px-4 py-2.5 text-xs font-bold uppercase text-white backdrop-blur transition hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-white"><Play className="h-4 w-4" aria-hidden /> Watch Our Story</button> : null}
            </div>
          </div>
        </div>
      </section>

      <AboutReveal className="mx-auto grid w-full gap-8 px-5 py-12 sm:px-8 lg:grid-cols-[.8fr_1.2fr] lg:items-center lg:px-10">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-secondary">Our identity</p>
          <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-semibold leading-tight text-primary sm:text-4xl">{content?.identity_heading || "More Than a University, A Force for Good."}</h2>
          <p className="mt-4 text-sm leading-7 text-muted-foreground">{content?.identity_narrative || university.overview}</p>
          <Link href="/about/numbers-and-facts" className="mt-4 inline-flex min-h-11 items-center gap-2 text-sm font-bold text-primary hover:underline">Read More About Kisii University <ArrowRight className="h-4 w-4" aria-hidden /></Link>
        </div>
        <div className="relative min-h-[320px] overflow-hidden rounded-xl bg-primary shadow-lg">
          <Image src={mediaUrl(content?.identity_media, identityFallback)} alt={mediaAlt(content?.identity_media, "Kisii University campus and learning environment")} fill sizes="(min-width:1024px) 58vw, 100vw" className="object-cover transition duration-1000 hover:scale-[1.03] motion-reduce:transition-none" />
          {hasVirtualTour ? (
            <button ref={tourTriggerRef} type="button" onClick={() => setTour(true)} className="absolute left-1/2 top-1/2 z-10 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-4 border-white/80 bg-white text-primary shadow-xl transition hover:scale-105 hover:bg-secondary focus:outline-none focus:ring-4 focus:ring-white/70 motion-reduce:transition-none" aria-label={`Open ${content?.virtual_tour_title || "Kisii University virtual campus tour"}`}>
              <Play className="ml-1 h-6 w-6 fill-current" aria-hidden />
            </button>
          ) : null}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-primary via-primary/85 to-transparent px-6 pb-6 pt-20 text-white">
            <p className="font-[family-name:var(--font-display)] text-2xl font-semibold">Discover Kisii University</p>
            <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold"><span className="rounded-full bg-white/12 px-3 py-2">Chartered in 2013</span><span className="rounded-full bg-white/12 px-3 py-2">Public University</span><span className="rounded-full bg-white/12 px-3 py-2">Kisii County</span><span className="rounded-full bg-white/12 px-3 py-2">Serving Kenya and Beyond</span></div>
          </div>
        </div>
      </AboutReveal>

      <section className="border-y border-primary/10 bg-[#f8f6f0] px-5 py-12 sm:px-8 lg:px-10 lg:py-16">
        <AboutReveal className="mx-auto w-full">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-secondary">Our beliefs</p>
          <div className="mt-8 grid gap-8 md:grid-cols-3 md:gap-0">
            {[{ title: "Our Mission", body: university.mission, icon: Target }, { title: "Our Vision", body: university.vision, icon: Eye }, { title: "Our Philosophy", body: university.philosophy, icon: Sparkles }].map(({ title, body, icon: Icon }) => (
              <article key={title} className="group border-primary/15 py-2 transition hover:-translate-y-1 motion-reduce:transform-none md:border-l md:px-8 md:first:border-l-0 md:first:pl-0"><span className="flex h-12 w-12 items-center justify-center rounded-full border border-primary/20 text-primary transition group-hover:border-secondary group-hover:bg-primary group-hover:text-secondary"><Icon className="h-5 w-5" aria-hidden /></span><h3 className="mt-5 font-[family-name:var(--font-display)] text-2xl font-semibold text-primary">{title}</h3><p className="mt-3 max-w-sm text-sm leading-7 text-muted-foreground">{body || "This institutional statement will appear when published."}</p></article>
            ))}
          </div>
        </AboutReveal>
      </section>

      <section className="relative overflow-hidden bg-primary px-5 py-14 text-white sm:px-8 lg:px-10 lg:py-20">
        <div className="absolute -left-20 top-0 h-full w-80 opacity-[0.06] [background-image:radial-gradient(circle_at_center,white_0,white_1px,transparent_1.5px)] [background-size:18px_18px]" aria-hidden />
        <AboutReveal className="relative mx-auto grid w-full gap-12 lg:grid-cols-2">
          <div><p className="text-xs font-bold uppercase tracking-[0.2em] text-secondary">{coreValuesSection?.eyebrow || "Core values"}</p><h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-semibold text-white">{coreValuesSection?.heading || "What guides how we work"}</h2><div className="mt-8 grid gap-6 sm:grid-cols-2">{displayedValues.filter((item) => Boolean(coreValuesSection) || !coreValues.length || coreValues.some((value) => value.toLowerCase().includes(item.title.toLowerCase()))).map((item) => <article key={item.title} className="group flex gap-4"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/30 text-secondary transition group-hover:border-secondary group-hover:bg-white/10"><InstitutionalIcon name={item.icon_key} className="h-5 w-5" /></span><div><h3 className="font-bold text-white">{item.title}</h3><p className="mt-2 text-sm leading-6 text-white/70">{item.description}</p></div></article>)}</div></div>
          <div className="border-t border-white/20 pt-10 lg:border-l lg:border-t-0 lg:pl-12 lg:pt-0"><p className="text-xs font-bold uppercase tracking-[0.2em] text-secondary">{mandateSection?.eyebrow || "Our mandate"}</p><h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-semibold text-white">{mandateSection?.heading || "Knowledge in service of society"}</h2><p className="mt-4 text-sm leading-7 text-white/70">{mandateSection?.summary || content?.mandate_introduction}</p><div className="mt-8 grid gap-6 sm:grid-cols-2">{displayedMandate.map((item) => <article key={item.title} className="flex gap-4"><InstitutionalIcon name={item.icon_key} className="mt-1 h-5 w-5 shrink-0 text-secondary" /><div><h3 className="font-bold text-white">{item.title}</h3><p className="mt-1 text-sm leading-6 text-white/70">{item.description}</p></div></article>)}</div></div>
        </AboutReveal>
      </section>

      {governanceSection ? <section className="border-y border-primary/10 bg-[#f6f4ef] px-5 py-12 sm:px-8 lg:px-10"><AboutReveal className="mx-auto"><p className="text-xs font-bold uppercase tracking-[0.2em] text-secondary">{governanceSection.eyebrow}</p><div className="mt-3 grid gap-8 lg:grid-cols-[.75fr_1.25fr]"><div><h2 className="font-[family-name:var(--font-display)] text-3xl font-semibold text-primary">{governanceSection.heading}</h2><p className="mt-4 text-sm leading-7 text-muted-foreground">{governanceSection.summary}</p></div><div className="grid gap-4 sm:grid-cols-2">{governanceSection.items.map((item) => <Link key={item.id} href={item.link_url || "/about"} className="group border border-primary/15 bg-white p-5"><InstitutionalIcon name={item.icon_key} className="h-7 w-7 text-primary" /><h3 className="mt-5 font-[family-name:var(--font-display)] text-xl font-semibold text-primary">{item.title}</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">{item.description}</p><span className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-primary">{item.link_label}<ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1 motion-reduce:transition-none" aria-hidden /></span></Link>)}</div></div></AboutReveal></section> : null}

      <section className="bg-primary px-5 py-8 text-white sm:px-8 lg:px-10">
        <AboutReveal className="mx-auto grid w-full overflow-hidden rounded-xl border border-white/15 bg-white/5 lg:grid-cols-[.7fr_1.3fr]">
          <div className="p-6 lg:p-7"><p className="text-xs font-bold uppercase tracking-[0.2em] text-secondary">Campus transformation</p><h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-semibold leading-tight">From Our Roots.<br />To Our Future.</h2><p className="mt-3 text-sm leading-6 text-white/75">Our campus continues to evolve with our teaching, research and public mission.</p><button type="button" onClick={() => setHistory(true)} className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-lg bg-secondary px-4 py-2.5 text-xs font-bold uppercase text-foreground">See the Transformation <ArrowRight className="h-4 w-4" aria-hidden /></button></div>
          {content?.old_campus_media?.url && content?.modern_campus_media?.url ? (
            <ImageComparison before={content.old_campus_media.url} after={content.modern_campus_media.url} beforeAlt={content.old_campus_media.alt || "Historic Kisii University campus"} afterAlt={content.modern_campus_media.alt || "Modern Kisii University campus"} />
          ) : (
            <div className="relative min-h-[280px]"><Image src={mediaUrl(content?.modern_campus_media, heroFallback)} alt={content?.modern_campus_media?.alt || "Modern Kisii University campus"} fill sizes="(min-width:1024px) 65vw, 100vw" className="object-cover" /><div className="absolute inset-0 bg-gradient-to-r from-primary/45 to-transparent" /><span className="absolute bottom-5 right-5 rounded-full bg-primary/85 px-4 py-2 text-xs font-bold uppercase tracking-wider">Today</span></div>
          )}
        </AboutReveal>
      </section>

      <section className="bg-white px-5 py-9 sm:px-8 lg:px-10">
        <AboutReveal className="mx-auto w-full"><div className="flex flex-col gap-5 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-secondary">Institutional profile</p><h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-semibold text-primary">Kisii University at a glance</h2></div><Link href="/about/numbers-and-facts" className="inline-flex min-h-11 items-center gap-2 font-bold text-primary hover:underline">KSU Numbers & Facts <ArrowRight className="h-4 w-4" aria-hidden /></Link></div><div className="grid sm:grid-cols-2 lg:grid-cols-3">{profile.map(({ label, value, icon: Icon }) => <div key={label} className="flex min-h-28 items-center gap-4 border-b border-border py-6 sm:px-5 sm:first:pl-0 lg:border-r lg:last:border-r-0"><Icon className="h-7 w-7 shrink-0 text-primary" aria-hidden /><div><p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{label}</p><p className="mt-1 text-sm font-semibold text-foreground">{value}</p></div></div>)}</div></AboutReveal>
      </section>

      {strategySection ? <section className="bg-[#f6f4ef] px-5 py-12 sm:px-8 lg:px-10"><AboutReveal className="mx-auto flex flex-col gap-6 border-l-4 border-secondary pl-6 lg:flex-row lg:items-end lg:justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-secondary">{strategySection.eyebrow}</p><h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-semibold text-primary">{strategySection.heading}</h2><p className="mt-3 max-w-3xl text-sm leading-7 text-muted-foreground">{strategySection.summary || strategySection.body}</p></div><Link href="/about/strategic-plan" className="inline-flex min-h-11 shrink-0 items-center gap-2 font-bold text-primary hover:underline">Explore the Strategic Plan<ArrowRight className="h-4 w-4" aria-hidden /></Link></AboutReveal></section> : null}

      <HistoryDrawer open={historyOpen} milestones={data.history.milestones} historyDocument={data.history.document} onClose={() => setHistory(false)} />
      {virtualTourType && virtualTourSource ? (
        <VirtualTourDialog
          open={tourOpen}
          title={content?.virtual_tour_title || "Explore Kisii University"}
          provider={content?.virtual_tour_provider}
          type={virtualTourType}
          source={virtualTourSource}
          mimeType={content?.virtual_tour_media?.mime_type}
          poster={content?.virtual_tour_poster_media?.url}
          accessibilityUrl={content?.virtual_tour_accessibility_url}
          onClose={() => setTour(false)}
        />
      ) : null}
      {videoOpen && content?.video_url ? <div className="fixed inset-0 z-[90] grid place-items-center bg-brand-overlay/90 p-5" role="dialog" aria-modal="true" aria-label={content.video_title || "Kisii University video"}><button type="button" aria-label="Close video" onClick={() => setVideoOpen(false)} className="absolute right-5 top-5 flex h-11 w-11 items-center justify-center rounded-full bg-white text-foreground"><X className="h-5 w-5" /></button><div className="w-full max-w-5xl"><iframe src={content.video_url} title={content.video_title || "Kisii University story"} className="aspect-video w-full rounded-2xl bg-black" allow="autoplay; fullscreen; picture-in-picture" allowFullScreen />{content.video_transcript_url ? <Link href={content.video_transcript_url} className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-white hover:underline"><Check className="h-4 w-4" /> Read video transcript</Link> : null}</div></div> : null}
    </div>
  );
}
