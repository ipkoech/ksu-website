"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ArrowRight,
  Award,
  Building2,
  Check,
  ChevronDown,
  Download,
  Eye,
  Landmark,
  Lightbulb,
  Play,
  School,
  Sparkles,
  Target,
  Users,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type {
  PublicAboutData,
  PublicFactItem,
  PublicFactsData,
  PublicHistoryMilestone,
} from "@/lib/public-about-data";
import { ImageComparison } from "./image-comparison";
import { AboutReveal } from "./about-reveal";
import { InstitutionalIcon } from "./institutional-icon";

const heroFallback = "/images/about/about-overview-branded.webp";
const identityFallback = "/images/about/about-mission-vision.webp";

function paragraphs(value?: string | null) {
  return (value ?? "").split(/\n\s*\n/).map((item) => item.trim()).filter(Boolean);
}

function mediaUrl(media: { url?: string | null } | null | undefined, fallback: string) {
  return media?.url?.trim() || fallback;
}

function mediaAlt(media: { alt?: string | null; alt_text?: string | null } | null | undefined, fallback: string) {
  return media?.alt_text?.trim() || media?.alt?.trim() || fallback;
}

function findFact(items: PublicFactItem[], terms: string[]) {
  return items.find((item) => terms.some((term) => item.label.toLowerCase().includes(term)));
}

function factValue(item?: PublicFactItem | null) {
  if (!item) return null;
  return `${item.prefix || ""}${item.display_value}${item.suffix || ""}${item.unit ? ` ${item.unit}` : ""}`;
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

export function PublicAboutPage({ data, facts, historyInitiallyOpen = false }: { data: PublicAboutData; facts?: PublicFactsData | null; historyInitiallyOpen?: boolean }) {
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
  const publishedFacts = facts?.groups.flatMap((group) => group.items) ?? [];
  const institutionalSections = data.institutional_page?.sections ?? [];
  const coreValuesSection = institutionalSections.find((section) => section.slug === "core-values");
  const mandateSection = institutionalSections.find((section) => section.slug === "university-mandate");
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

  const totalStudents = findFact(publishedFacts, ["total student enrolment", "total enrolment"]);
  const undergraduate = findFact(publishedFacts, ["undergraduate students", "undergraduate"]);
  const postgraduate = findFact(publishedFacts, ["postgraduate students", "postgraduate"]);
  const teachingDepartments = findFact(publishedFacts, ["teaching departments", "departments"]);
  const researchOutput = findFact(publishedFacts, ["peer-reviewed journal articles", "publications"]);
  const graduates = findFact(publishedFacts, ["graduates"]);
  const profile = [
    { label: totalStudents?.label || "Established", value: factValue(totalStudents) || String(university.founding_year || quickFacts.founding_year), icon: Users },
    { label: undergraduate?.label || "Chartered", value: factValue(undergraduate) || String(quickFacts.charter_year), icon: Award },
    { label: postgraduate?.label || "Schools", value: factValue(postgraduate) || String(quickFacts.schools), icon: School },
    { label: teachingDepartments?.label || "Main Campus", value: factValue(teachingDepartments) || String(quickFacts.main_campus), icon: Building2 },
    { label: researchOutput?.label || "County", value: factValue(researchOutput) || String(university.county), icon: Lightbulb },
    { label: graduates?.label || "Legal Status", value: factValue(graduates) || "Public University", icon: Landmark },
  ].filter((item) => item.value && item.value !== "undefined");
  const identityFacts = [
    { label: "Year Chartered", value: String(quickFacts.charter_year || university.founding_year), icon: Landmark },
    { label: totalStudents?.label || "Students", value: factValue(totalStudents), icon: Users },
    { label: "Schools", value: quickFacts.schools ? String(quickFacts.schools) : null, icon: School },
    { label: teachingDepartments?.label || "Teaching Departments", value: factValue(teachingDepartments), icon: Award },
  ].filter((item): item is { label: string; value: string; icon: typeof Landmark } => Boolean(item.value));

  return (
    <div className="bg-surface text-foreground">
      <section className="relative isolate min-h-[610px] overflow-hidden bg-[#062d62] text-white lg:min-h-[640px]">
        <Image src={mediaUrl(content?.hero_media, heroFallback)} alt={mediaAlt(content?.hero_media, "Aerial view of Kisii University campus")} fill priority sizes="100vw" className="object-cover motion-safe:animate-[kenburns_24s_ease-in-out_infinite_alternate]" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(4,28,68,.96)_0%,rgba(4,38,83,.84)_43%,rgba(4,38,83,.16)_80%)]" />
        <div className="relative mx-auto flex min-h-[610px] w-full flex-col justify-center px-5 py-10 sm:px-8 lg:min-h-[640px] lg:px-16 xl:px-20">
          <nav aria-label="Breadcrumb" className="mb-10 text-sm font-semibold text-white/80"><Link href="/" className="hover:text-white">Home</Link><span className="mx-3">/</span><span>{content?.hero_eyebrow || "About Kisii University"}</span></nav>
          <div className="max-w-[46rem]">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-secondary">{content?.hero_eyebrow || "About Kisii University"}</p>
            <h1 className="mt-4 whitespace-pre-line font-[family-name:var(--font-display)] text-[2.8rem] font-medium leading-[1.02] sm:text-6xl lg:text-[4.6rem]">{(content?.hero_headline || "A Legacy of Excellence. A Future of Impact.").replace(". A Future", ".\nA Future")}</h1>
            <p className="mt-7 text-base font-bold text-secondary">More Than a University. A Force for Good.</p>
            <div className="mt-3 max-w-[36rem] text-base leading-7 text-white/85">{heroParagraphs.map((item) => <p key={item}>{item}</p>)}</div>
            <div className="mt-8 flex flex-wrap gap-4">
              <button ref={historyTriggerRef} type="button" onClick={() => setHistory(true)} className="inline-flex min-h-12 items-center gap-3 rounded-md bg-secondary px-6 py-3 text-xs font-bold uppercase text-foreground transition hover:-translate-y-0.5 hover:bg-amber-400 focus:outline-none focus:ring-2 focus:ring-white motion-reduce:transform-none">Discover Our Journey <ArrowRight className="h-4 w-4" aria-hidden /></button>
              {content?.video_url ? <button type="button" onClick={() => setVideoOpen(true)} className="inline-flex min-h-12 items-center gap-3 rounded-md border border-white/70 bg-white/5 px-6 py-3 text-xs font-bold uppercase text-white backdrop-blur transition hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-white"><Play className="h-4 w-4" aria-hidden /> Watch Our Story</button> : null}
            </div>
          </div>
        </div>
      </section>

      <AboutReveal className="mx-auto grid w-full gap-10 border-b border-primary/10 px-5 py-14 sm:px-8 lg:grid-cols-[.78fr_1.22fr] lg:items-center lg:px-16 lg:py-16 xl:px-20">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-secondary">Our identity</p>
          <h2 className="mt-3 font-[family-name:var(--font-display)] text-4xl font-medium leading-tight text-primary sm:text-5xl">Who We Are</h2>
          <p className="mt-5 max-w-xl text-base leading-8 text-muted-foreground">{content?.identity_narrative || university.overview}</p>
          <div className="mt-8 grid grid-cols-2 border-t border-primary/15 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
            {identityFacts.map(({ label, value, icon: Icon }) => <div key={label} className="border-b border-primary/15 px-3 py-5 first:pl-0 sm:border-r sm:last:border-r-0 lg:border-r-0 xl:border-r"><Icon className="h-6 w-6 text-primary" aria-hidden /><p className="mt-3 font-[family-name:var(--font-display)] text-xl font-semibold text-primary">{value}</p><p className="mt-1 text-[0.68rem] font-bold uppercase tracking-wider text-muted-foreground">{label}</p></div>)}
          </div>
        </div>
        <div className="relative min-h-[390px] overflow-hidden rounded-sm bg-primary shadow-lg lg:min-h-[440px]">
          <Image src={mediaUrl(content?.identity_media, identityFallback)} alt={mediaAlt(content?.identity_media, "Kisii University research and learning environment")} fill sizes="(min-width:1024px) 58vw, 100vw" className={`object-cover transition duration-1000 motion-reduce:transition-none ${content?.identity_media?.url ? "hover:scale-[1.03]" : "origin-top-right scale-[2.35] object-right-top"}`} />
          {hasVirtualTour ? (
            <button ref={tourTriggerRef} type="button" onClick={() => setTour(true)} className="absolute left-1/2 top-1/2 z-10 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-4 border-white/80 bg-white text-primary shadow-xl transition hover:scale-105 hover:bg-secondary focus:outline-none focus:ring-4 focus:ring-white/70 motion-reduce:transition-none" aria-label={`Open ${content?.virtual_tour_title || "Kisii University virtual campus tour"}`}>
              <Play className="ml-1 h-6 w-6 fill-current" aria-hidden />
            </button>
          ) : null}
        </div>
      </AboutReveal>

      <section className="border-y border-primary/10 bg-white px-5 py-14 sm:px-8 lg:px-16 lg:py-16 xl:px-20">
        <AboutReveal className="mx-auto w-full">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-secondary">Our beliefs</p>
          <div className="mt-8 grid gap-8 md:grid-cols-3 md:gap-0">
            {[{ title: "Mission", body: university.mission, icon: Target }, { title: "Vision", body: university.vision, icon: Eye }, { title: "Philosophy", body: university.philosophy, icon: Sparkles }].map(({ title, body, icon: Icon }) => (
              <article key={title} className="group border-primary/15 py-2 transition hover:-translate-y-1 motion-reduce:transform-none md:border-l md:px-10 md:first:border-l-0 md:first:pl-0"><span className="flex h-14 w-14 items-center justify-center rounded-full border border-[#225b35]/30 text-[#225b35] transition group-hover:bg-[#225b35] group-hover:text-white"><Icon className="h-6 w-6" aria-hidden /></span><h3 className="mt-5 font-[family-name:var(--font-display)] text-3xl font-medium text-[#225b35]">{title}</h3><p className="mt-3 max-w-sm text-base leading-7 text-muted-foreground">{body || "This institutional statement will appear when published."}</p></article>
            ))}
          </div>
        </AboutReveal>
      </section>

      <section className="relative overflow-hidden bg-[linear-gradient(110deg,#052e63_0%,#074387_100%)] px-5 py-14 text-white sm:px-8 lg:px-16 lg:py-20 xl:px-20">
        <div className="absolute -left-20 top-0 h-full w-80 opacity-[0.06] [background-image:radial-gradient(circle_at_center,white_0,white_1px,transparent_1.5px)] [background-size:18px_18px]" aria-hidden />
        <AboutReveal className="relative mx-auto grid w-full gap-12 lg:grid-cols-2">
          <div><p className="text-xs font-bold uppercase tracking-[0.2em] text-secondary">{coreValuesSection?.eyebrow || "Core values"}</p><h2 className="mt-3 font-[family-name:var(--font-display)] text-4xl font-medium text-white">What Guides Us</h2><div className="mt-9 grid gap-x-8 gap-y-7 sm:grid-cols-2">{displayedValues.filter((item) => Boolean(coreValuesSection) || !coreValues.length || coreValues.some((value) => value.toLowerCase().includes(item.title.toLowerCase()))).map((item) => <article key={item.title} className="group flex gap-4"><span className="flex h-12 w-12 shrink-0 items-center justify-center text-white"><InstitutionalIcon name={item.icon_key} className="h-8 w-8" /></span><div><h3 className="font-[family-name:var(--font-display)] text-xl font-semibold text-white">{item.title}</h3><p className="mt-2 text-sm leading-6 text-white/72">{item.description}</p></div></article>)}</div></div>
          <div className="border-t border-white/20 pt-10 lg:border-l lg:border-t-0 lg:pl-14 lg:pt-0"><p className="text-xs font-bold uppercase tracking-[0.2em] text-secondary">{mandateSection?.eyebrow || "Our mandate"}</p><h2 className="mt-3 font-[family-name:var(--font-display)] text-4xl font-medium text-white">Why We Exist</h2><p className="mt-5 max-w-xl text-base leading-8 text-white/75">{mandateSection?.summary || content?.mandate_introduction}</p><ul className="mt-8 space-y-4">{displayedMandate.map((item) => <li key={item.title} className="flex items-center gap-3 text-sm font-semibold text-white"><span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-lime-400 text-lime-400"><Check className="h-3 w-3" aria-hidden /></span>{item.title}</li>)}</ul></div>
        </AboutReveal>
      </section>

      <section className="bg-white px-5 py-14 sm:px-8 lg:px-16 lg:py-16 xl:px-20">
        <AboutReveal className="mx-auto w-full">
          <div className="grid gap-5 lg:grid-cols-2 lg:items-end"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-secondary">From Our Roots. To Our Future.</p><h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-semibold text-primary sm:text-4xl">A Campus in Transformation</h2></div><p className="text-sm leading-7 text-muted-foreground">Our journey is one of growth, vision and impact. From humble beginnings to a modern university, we continue to invest in people, infrastructure and innovation for a better tomorrow.</p></div>
          <div className="mt-8 min-h-[260px] overflow-hidden rounded-sm border border-primary/10"><ImageComparison before={mediaUrl(content?.old_campus_media, "/images/history/KSUGreenLandscapingMay2026-3810.jpg")} after={mediaUrl(content?.modern_campus_media, heroFallback)} beforeAlt={content?.old_campus_media?.alt || "Historic Kisii University campus"} afterAlt={content?.modern_campus_media?.alt || "Modern Kisii University campus"} /></div>
        </AboutReveal>
      </section>

      <section className="bg-white px-5 pb-10 sm:px-8 lg:px-16 xl:px-20">
        <AboutReveal className="mx-auto w-full"><div className="flex flex-col gap-5 border-b border-border pb-5 sm:flex-row sm:items-end sm:justify-between"><h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-primary">Kisii University at a glance</h2><Link href="/about/numbers-and-facts" className="inline-flex min-h-11 items-center gap-2 text-sm font-bold text-primary hover:underline">KSU Numbers & Facts <ArrowRight className="h-4 w-4" aria-hidden /></Link></div><div className="grid grid-cols-2 lg:grid-cols-6">{profile.map(({ label, value, icon: Icon }) => <div key={label} className="border-b border-border px-3 py-6 text-center lg:border-r lg:last:border-r-0"><Icon className="mx-auto h-7 w-7 text-primary" aria-hidden /><p className="mt-3 font-[family-name:var(--font-display)] text-lg font-semibold text-primary">{value}</p><p className="mt-1 text-[0.68rem] font-bold uppercase tracking-wider text-muted-foreground">{label}</p></div>)}</div></AboutReveal>
      </section>

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
