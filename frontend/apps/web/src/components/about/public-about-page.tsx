"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ArrowRight,
  BookOpen,
  Building2,
  CalendarDays,
  Check,
  ChevronDown,
  Download,
  Eye,
  GraduationCap,
  Handshake,
  HeartHandshake,
  Landmark,
  Lightbulb,
  MapPin,
  Play,
  Scale,
  School,
  Sparkles,
  Target,
  Users,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type {
  PublicAboutData,
  PublicHistoryMilestone,
} from "@/lib/public-about-data";
import { ImageComparison } from "./image-comparison";
import { AboutReveal } from "./about-reveal";

const heroFallback = "/images/backgrounds/KSUGreenLandscapingMay2026-3885.jpg";
const identityFallback = "/images/backgrounds/KSUGreenLandscapingMay2026-7456.jpg";

function paragraphs(value?: string | null) {
  return (value ?? "").split(/\n\s*\n/).map((item) => item.trim()).filter(Boolean);
}

function mediaUrl(media: { url?: string | null } | null | undefined, fallback: string) {
  return media?.url?.trim() || fallback;
}

const valueDetails = [
  { title: "Transformative Thinking", icon: Lightbulb, body: "We welcome creativity, inquiry and bold ideas that solve real-world challenges." },
  { title: "Respect", icon: HeartHandshake, body: "We value every person and nurture a culture of dignity and mutual regard." },
  { title: "Inclusivity", icon: Users, body: "We create opportunity across backgrounds, disciplines and borders." },
  { title: "Fairness", icon: Scale, body: "We uphold justice, transparency and equity in our decisions and relationships." },
];

const mandateDetails = [
  { title: "Teaching & Training", icon: GraduationCap, body: "Develop capable graduates through rigorous, relevant education." },
  { title: "Research & Innovation", icon: Lightbulb, body: "Generate and translate knowledge for social and economic progress." },
  { title: "Community Engagement", icon: Handshake, body: "Work with communities to create shared and sustainable impact." },
  { title: "Preservation of Knowledge", icon: BookOpen, body: "Protect, extend and share intellectual and cultural knowledge." },
  { title: "National & Regional Development", icon: Landmark, body: "Contribute expertise and talent to Kenya and the wider region." },
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
      <button type="button" aria-label="Close history" onClick={onClose} className="absolute inset-0 bg-slate-950/45 backdrop-blur-[2px]" />
      <aside className="absolute inset-x-0 bottom-0 max-h-[88dvh] overflow-y-auto rounded-t-3xl bg-[#fbfaf6] shadow-2xl motion-safe:animate-in motion-safe:slide-in-from-bottom md:inset-y-0 md:left-auto md:w-[60vw] md:max-w-3xl md:rounded-none md:motion-safe:slide-in-from-right xl:w-[44vw]">
        <div className="sticky top-0 z-10 border-b border-slate-200/80 bg-[#fbfaf6]/95 px-6 py-6 backdrop-blur sm:px-8">
          <div className="flex items-start justify-between gap-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-secondary">Our journey</p>
              <h2 id="history-title" className="mt-2 font-[family-name:var(--font-display)] text-3xl font-semibold text-primary sm:text-4xl">Our History</h2>
              <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600">Six decades of growth, public service and moments that shaped Kisii University.</p>
            </div>
            <button ref={closeRef} type="button" onClick={onClose} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-slate-200 text-slate-700 transition hover:bg-white focus:outline-none focus:ring-2 focus:ring-primary" aria-label="Close history drawer">
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
                <article className="relative rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <span aria-hidden className="absolute -left-[1.15rem] top-6 h-3 w-3 rounded-full border-2 border-[#fbfaf6] bg-secondary sm:-left-[1.15rem]" />
                  <div className="grid gap-4 sm:grid-cols-[1fr_7rem] sm:items-start">
                    <div>
                      <h3 className="font-semibold text-slate-950">{milestone.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-slate-600">{milestone.summary}</p>
                      {isExpanded && milestone.expanded_body ? <p className="mt-3 border-t border-slate-100 pt-3 text-sm leading-6 text-slate-700">{milestone.expanded_body}</p> : null}
                      {milestone.expanded_body ? (
                        <button type="button" onClick={() => setExpanded(isExpanded ? null : milestone.id)} aria-expanded={isExpanded} className="mt-3 inline-flex min-h-11 items-center gap-2 text-sm font-bold text-primary hover:underline">
                          {isExpanded ? "Show less" : "Read more"}<ChevronDown className={`h-4 w-4 transition ${isExpanded ? "rotate-180" : ""}`} aria-hidden />
                        </button>
                      ) : null}
                    </div>
                    <div className="relative hidden aspect-square overflow-hidden rounded-xl bg-slate-100 sm:block">
                      <Image src={mediaUrl(milestone.image, index < 3 ? "/images/backgrounds/bg-history.jpg" : identityFallback)} alt={milestone.image_alt_text || `${milestone.title} historical milestone`} fill sizes="112px" className="object-cover grayscale-[20%]" />
                    </div>
                  </div>
                </article>
              </li>
            );
          })}
        </ol>

        <div className="sticky bottom-0 border-t border-slate-200 bg-[#fbfaf6]/95 px-6 py-5 backdrop-blur sm:px-8">
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

export function PublicAboutPage({ data, historyInitiallyOpen = false }: { data: PublicAboutData; historyInitiallyOpen?: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const [historyOpen, setHistoryOpen] = useState(historyInitiallyOpen);
  const [videoOpen, setVideoOpen] = useState(false);
  const historyTriggerRef = useRef<HTMLButtonElement>(null);
  const content = data.content;
  const university = data.university;
  const heroParagraphs = paragraphs(content?.hero_introduction || university.overview).slice(0, 1);
  const coreValues = (university.core_values ?? "").split(/[;|\n]+/).map((item) => item.trim()).filter(Boolean);
  const quickFacts = university.quick_facts ?? {};

  const setHistory = (open: boolean) => {
    setHistoryOpen(open);
    router.replace(open ? `${pathname}?history=open` : pathname, { scroll: false });
    if (!open) window.setTimeout(() => historyTriggerRef.current?.focus(), 0);
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
    <div className="bg-[#fbfaf6] text-slate-950">
      <section className="relative isolate min-h-[440px] overflow-hidden bg-primary text-white">
        <Image src={mediaUrl(content?.hero_media, heroFallback)} alt={content?.hero_media?.alt || "Aerial view of Kisii University campus"} fill priority sizes="100vw" className="object-cover motion-safe:animate-[kenburns_24s_ease-in-out_infinite_alternate]" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,45,30,.96)_0%,rgba(0,45,30,.83)_42%,rgba(0,45,30,.18)_78%)]" />
        <div className="relative mx-auto flex min-h-[440px] w-full flex-col justify-center px-5 py-7 sm:px-8 lg:px-10">
          <nav aria-label="Breadcrumb" className="mb-7 text-xs font-semibold text-white/80"><Link href="/" className="hover:text-white">Home</Link><span className="mx-2">/</span><span>{content?.hero_eyebrow || "About Kisii University"}</span></nav>
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-secondary">{content?.hero_eyebrow || "About Kisii University"}</p>
            <h1 className="mt-3 whitespace-pre-line font-[family-name:var(--font-display)] text-4xl font-semibold leading-[1.04] sm:text-5xl lg:text-6xl">{(content?.hero_headline || "A Legacy of Excellence. A Future of Impact.").replace(". A Future", ".\nA Future")}</h1>
            <div className="mt-4 max-w-xl text-sm leading-6 text-white/88">{heroParagraphs.map((item) => <p key={item}>{item}</p>)}</div>
            <div className="mt-5 flex flex-wrap gap-3">
              <button ref={historyTriggerRef} type="button" onClick={() => setHistory(true)} className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-secondary px-4 py-2.5 text-xs font-bold uppercase text-slate-950 transition hover:-translate-y-0.5 hover:bg-amber-400 focus:outline-none focus:ring-2 focus:ring-white motion-reduce:transform-none">Discover Our Journey <ArrowRight className="h-4 w-4" aria-hidden /></button>
              {content?.video_url ? <button type="button" onClick={() => setVideoOpen(true)} className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-white/60 bg-white/5 px-4 py-2.5 text-xs font-bold uppercase text-white backdrop-blur transition hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-white"><Play className="h-4 w-4" aria-hidden /> Watch Our Story</button> : null}
            </div>
          </div>
        </div>
      </section>

      <AboutReveal className="mx-auto grid w-full gap-8 px-5 py-12 sm:px-8 lg:grid-cols-[.8fr_1.2fr] lg:items-center lg:px-10">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-secondary">Our identity</p>
          <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-semibold leading-tight text-primary sm:text-4xl">{content?.identity_heading || "More Than a University, A Force for Good."}</h2>
          <p className="mt-4 text-sm leading-7 text-slate-700">{content?.identity_narrative || university.overview}</p>
          <Link href="/about/numbers-and-facts" className="mt-4 inline-flex min-h-11 items-center gap-2 text-sm font-bold text-primary hover:underline">Read More About Kisii University <ArrowRight className="h-4 w-4" aria-hidden /></Link>
        </div>
        <div className="relative min-h-[320px] overflow-hidden rounded-xl bg-primary shadow-lg">
          <Image src={mediaUrl(content?.identity_media, identityFallback)} alt={content?.identity_media?.alt || "Kisii University campus and learning environment"} fill sizes="(min-width:1024px) 58vw, 100vw" className="object-cover transition duration-1000 hover:scale-[1.03] motion-reduce:transition-none" />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-primary via-primary/85 to-transparent px-6 pb-6 pt-20 text-white">
            <p className="font-[family-name:var(--font-display)] text-2xl font-semibold">Discover Kisii University</p>
            <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold"><span className="rounded-full bg-white/12 px-3 py-2">Chartered in 2013</span><span className="rounded-full bg-white/12 px-3 py-2">Public University</span><span className="rounded-full bg-white/12 px-3 py-2">Kisii County</span><span className="rounded-full bg-white/12 px-3 py-2">Serving Kenya and Beyond</span></div>
          </div>
        </div>
      </AboutReveal>

      <section className="border-y border-primary/10 bg-white px-5 py-10 sm:px-8 lg:px-10">
        <AboutReveal className="mx-auto w-full">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-secondary">Our beliefs</p>
          <div className="mt-7 grid gap-5 md:grid-cols-3">
            {[{ title: "Our Mission", body: university.mission, icon: Target }, { title: "Our Vision", body: university.vision, icon: Eye }, { title: "Our Philosophy", body: university.philosophy, icon: Sparkles }].map(({ title, body, icon: Icon }) => (
              <article key={title} className="rounded-xl border border-primary/10 bg-[#fbfaf6] p-5 transition hover:-translate-y-1 hover:shadow-lg motion-reduce:transform-none"><span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-secondary"><Icon className="h-5 w-5" aria-hidden /></span><h3 className="mt-4 font-[family-name:var(--font-display)] text-xl font-semibold text-primary">{title}</h3><p className="mt-3 text-sm leading-6 text-slate-700">{body || "This institutional statement will appear when published."}</p></article>
            ))}
          </div>
        </AboutReveal>
      </section>

      <AboutReveal className="mx-auto grid w-full gap-8 px-5 py-10 sm:px-8 lg:grid-cols-2 lg:px-10">
        <div><p className="text-xs font-bold uppercase tracking-[0.2em] text-secondary">Core values</p><h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-semibold text-primary">What guides how we work</h2><div className="mt-7 grid gap-5 sm:grid-cols-2">{valueDetails.filter((item) => !coreValues.length || coreValues.some((value) => value.toLowerCase().includes(item.title.toLowerCase()))).map(({ title, body, icon: Icon }) => <article key={title} className="flex gap-4"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-primary/20 text-primary"><Icon className="h-5 w-5" aria-hidden /></span><div><h3 className="font-bold text-slate-950">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{body}</p></div></article>)}</div></div>
        <div className="border-t border-primary/15 pt-10 lg:border-l lg:border-t-0 lg:pl-12 lg:pt-0"><p className="text-xs font-bold uppercase tracking-[0.2em] text-secondary">Our mandate</p><h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-semibold text-primary">Knowledge in service of society</h2><p className="mt-4 text-sm leading-7 text-slate-600">{content?.mandate_introduction}</p><div className="mt-7 grid gap-5 sm:grid-cols-2">{mandateDetails.map(({ title, body, icon: Icon }) => <article key={title} className="flex gap-4"><Icon className="mt-1 h-5 w-5 shrink-0 text-primary" aria-hidden /><div><h3 className="font-bold text-slate-950">{title}</h3><p className="mt-1 text-sm leading-6 text-slate-600">{body}</p></div></article>)}</div></div>
      </AboutReveal>

      <section className="bg-primary px-5 py-8 text-white sm:px-8 lg:px-10">
        <AboutReveal className="mx-auto grid w-full overflow-hidden rounded-xl border border-white/15 bg-white/5 lg:grid-cols-[.7fr_1.3fr]">
          <div className="p-6 lg:p-7"><p className="text-xs font-bold uppercase tracking-[0.2em] text-secondary">Campus transformation</p><h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-semibold leading-tight">From Our Roots.<br />To Our Future.</h2><p className="mt-3 text-sm leading-6 text-white/75">Our campus continues to evolve with our teaching, research and public mission.</p><button type="button" onClick={() => setHistory(true)} className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-lg bg-secondary px-4 py-2.5 text-xs font-bold uppercase text-slate-950">See the Transformation <ArrowRight className="h-4 w-4" aria-hidden /></button></div>
          {content?.old_campus_media?.url && content?.modern_campus_media?.url ? (
            <ImageComparison before={content.old_campus_media.url} after={content.modern_campus_media.url} beforeAlt={content.old_campus_media.alt || "Historic Kisii University campus"} afterAlt={content.modern_campus_media.alt || "Modern Kisii University campus"} />
          ) : (
            <div className="relative min-h-[280px]"><Image src={mediaUrl(content?.modern_campus_media, heroFallback)} alt={content?.modern_campus_media?.alt || "Modern Kisii University campus"} fill sizes="(min-width:1024px) 65vw, 100vw" className="object-cover" /><div className="absolute inset-0 bg-gradient-to-r from-primary/45 to-transparent" /><span className="absolute bottom-5 right-5 rounded-full bg-primary/85 px-4 py-2 text-xs font-bold uppercase tracking-wider">Today</span></div>
          )}
        </AboutReveal>
      </section>

      <section className="bg-white px-5 py-9 sm:px-8 lg:px-10">
        <AboutReveal className="mx-auto w-full"><div className="flex flex-col gap-5 border-b border-slate-200 pb-6 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-secondary">Institutional profile</p><h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-semibold text-primary">Kisii University at a glance</h2></div><Link href="/about/numbers-and-facts" className="inline-flex min-h-11 items-center gap-2 font-bold text-primary hover:underline">KSU Numbers & Facts <ArrowRight className="h-4 w-4" aria-hidden /></Link></div><div className="grid sm:grid-cols-2 lg:grid-cols-3">{profile.map(({ label, value, icon: Icon }) => <div key={label} className="flex min-h-28 items-center gap-4 border-b border-slate-200 py-6 sm:px-5 sm:first:pl-0 lg:border-r lg:last:border-r-0"><Icon className="h-7 w-7 shrink-0 text-primary" aria-hidden /><div><p className="text-xs font-bold uppercase tracking-wider text-slate-500">{label}</p><p className="mt-1 text-sm font-semibold text-slate-950">{value}</p></div></div>)}</div></AboutReveal>
      </section>

      <HistoryDrawer open={historyOpen} milestones={data.history.milestones} historyDocument={data.history.document} onClose={() => setHistory(false)} />
      {videoOpen && content?.video_url ? <div className="fixed inset-0 z-[90] grid place-items-center bg-slate-950/90 p-5" role="dialog" aria-modal="true" aria-label={content.video_title || "Kisii University video"}><button type="button" aria-label="Close video" onClick={() => setVideoOpen(false)} className="absolute right-5 top-5 flex h-11 w-11 items-center justify-center rounded-full bg-white text-slate-950"><X className="h-5 w-5" /></button><div className="w-full max-w-5xl"><iframe src={content.video_url} title={content.video_title || "Kisii University story"} className="aspect-video w-full rounded-2xl bg-black" allow="autoplay; fullscreen; picture-in-picture" allowFullScreen />{content.video_transcript_url ? <Link href={content.video_transcript_url} className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-white hover:underline"><Check className="h-4 w-4" /> Read video transcript</Link> : null}</div></div> : null}
    </div>
  );
}
