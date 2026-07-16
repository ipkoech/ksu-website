import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Download, FileText, Quote } from "lucide-react";
import type { PublicInstitutionalPage, PublicInstitutionalSection } from "@/lib/public-about-data";
import { AboutReveal } from "./about-reveal";
import { InstitutionalIcon } from "./institutional-icon";

const fallbacks = {
  service_charter: "/images/backgrounds/KSUGreenLandscapingMay2026-7466.jpg",
  strategic_plan: "/images/backgrounds/KSUB-RollPhotos2025-123.jpg",
  about: "/images/backgrounds/KSUGreenLandscapingMay2026-3885.jpg",
};

function documentHref(document: PublicInstitutionalPage["primary_document"]) {
  return document?.file?.url || null;
}

function themeClass(section: PublicInstitutionalSection) {
  if (section.theme === "blue") return "bg-primary text-white";
  if (section.theme === "green") return "bg-primary text-white";
  if (section.theme === "ivory") return "bg-surface-subtle text-foreground";
  return "bg-white text-foreground";
}

function StructuredSection({ section }: { section: PublicInstitutionalSection }) {
  if (section.section_type === "quote") {
    return <section className={`${themeClass(section)} px-5 py-12 sm:px-8 lg:px-10 lg:py-16`}><AboutReveal className="mx-auto grid gap-6 lg:grid-cols-[auto_1fr] lg:items-start"><Quote className="h-12 w-12 text-secondary" aria-hidden /><div><h2 className="max-w-4xl font-[family-name:var(--font-display)] text-3xl font-semibold leading-tight sm:text-4xl">{section.heading}</h2>{section.body ? <p className="mt-4 max-w-3xl text-lg leading-8 text-white/80">{section.body}</p> : null}</div></AboutReveal></section>;
  }

  if (section.section_type === "process") {
    return <section className={`${themeClass(section)} px-5 py-14 sm:px-8 lg:px-10 lg:py-20`}><AboutReveal className="mx-auto"><SectionHeading section={section} centered /><ol className={`relative mt-10 grid gap-8 md:gap-5 ${section.items.length >= 4 ? "md:grid-cols-4" : section.items.length === 3 ? "md:grid-cols-3" : "md:grid-cols-2"}`}>{section.items.map((item, index) => <li key={item.id} className="relative text-center"><div className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full border-2 ${section.theme === "blue" ? "border-secondary bg-primary" : "border-primary/30 bg-white"}`}><InstitutionalIcon name={item.icon_key} className={`h-7 w-7 ${section.theme === "blue" ? "text-secondary" : "text-primary"}`} /></div><p className="mt-4 text-xs font-bold uppercase tracking-[0.18em] text-secondary">{String(index + 1).padStart(2, "0")}</p><h3 className="mt-2 font-[family-name:var(--font-display)] text-xl font-semibold">{item.title}</h3>{item.description ? <p className={`mx-auto mt-2 max-w-xs text-sm leading-6 ${section.theme === "blue" ? "text-white/75" : "text-muted-foreground"}`}>{item.description}</p> : null}</li>)}</ol></AboutReveal></section>;
  }

  if (section.section_type === "document_collection") {
    return <section className={`${themeClass(section)} px-5 py-14 sm:px-8 lg:px-10 lg:py-20`}><AboutReveal className="mx-auto"><SectionHeading section={section} centered />{section.documents.length ? <div className="mt-9 grid gap-4 md:grid-cols-2 lg:grid-cols-3">{section.documents.map((document) => document.file?.url ? <article key={document.id} className="flex min-h-48 flex-col border border-primary/15 bg-white p-5 text-foreground"><FileText className="h-8 w-8 text-primary" aria-hidden /><h3 className="mt-5 font-[family-name:var(--font-display)] text-xl font-semibold text-primary">{document.public_label || document.title}</h3>{document.description ? <p className="mt-2 text-sm leading-6 text-muted-foreground">{document.description}</p> : null}<Link href={document.file.url} className="mt-auto inline-flex min-h-11 items-center gap-2 pt-5 text-sm font-bold text-primary hover:underline"><Download className="h-4 w-4" aria-hidden />Download document</Link></article> : null)}</div> : <p className="mt-8 border border-dashed border-primary/20 p-6 text-center text-sm opacity-70">No public document is currently attached to this section.</p>}</AboutReveal></section>;
  }

  if (section.section_type === "narrative") {
    return <section className={`${themeClass(section)} px-5 py-14 sm:px-8 lg:px-10 lg:py-20`}><AboutReveal className={`mx-auto grid gap-10 ${section.primary_media?.url ? "lg:grid-cols-[.85fr_1.15fr] lg:items-center" : "lg:grid-cols-[.7fr_1.3fr]"}`}><SectionHeading section={section} />{section.primary_media?.url ? <div className="relative min-h-80 overflow-hidden"><Image src={section.primary_media.url} alt={section.media_alt_text || section.primary_media.alt_text || section.heading} fill sizes="(min-width:1024px) 58vw, 100vw" className="object-cover transition duration-700 hover:scale-[1.025] motion-reduce:transition-none" /></div> : <div className={`border-l-2 pl-7 text-lg leading-8 ${section.theme === "blue" || section.theme === "green" ? "border-secondary text-white/80" : "border-secondary text-muted-foreground"}`}>{section.body || section.summary}</div>}</AboutReveal></section>;
  }

  const columns = section.section_type === "priorities" ? "lg:grid-cols-5" : section.items.length === 4 ? "md:grid-cols-2 lg:grid-cols-4" : "md:grid-cols-2 lg:grid-cols-3";
  return <section className={`${themeClass(section)} px-5 py-14 sm:px-8 lg:px-10 lg:py-20`}><AboutReveal className="mx-auto"><SectionHeading section={section} centered /><div className={`mt-10 grid gap-px overflow-hidden border ${section.theme === "blue" || section.theme === "green" ? "border-white/20 bg-white/20" : "border-primary/15 bg-primary/15"} ${columns}`}>{section.items.map((item, index) => <article key={item.id} className={`${section.theme === "blue" ? "bg-primary" : section.theme === "green" ? "bg-primary" : "bg-white"} p-5`}><div className="flex items-center justify-between gap-4"><span className={`flex h-12 w-12 items-center justify-center rounded-full ${section.theme === "blue" || section.theme === "green" ? "border border-white/30" : "bg-primary/5"}`}><InstitutionalIcon name={item.icon_key} className={`h-6 w-6 ${section.theme === "blue" || section.theme === "green" ? "text-secondary" : "text-primary"}`} /></span>{section.section_type === "priorities" ? <span className="font-[family-name:var(--font-display)] text-2xl text-secondary">{String(index + 1).padStart(2, "0")}</span> : null}</div><h3 className="mt-5 font-[family-name:var(--font-display)] text-xl font-semibold">{item.title}</h3>{item.description ? <p className={`mt-3 text-sm leading-6 ${section.theme === "blue" || section.theme === "green" ? "text-white/75" : "text-muted-foreground"}`}>{item.description}</p> : null}{item.link_url && item.link_label ? <Link href={item.link_url} className="mt-4 inline-flex min-h-11 items-center gap-2 text-sm font-bold text-secondary hover:underline">{item.link_label}<ArrowRight className="h-4 w-4" aria-hidden /></Link> : null}</article>)}</div></AboutReveal></section>;
}

function SectionHeading({ section, centered = false }: { section: PublicInstitutionalSection; centered?: boolean }) {
  const dark = section.theme === "blue" || section.theme === "green";
  return <div className={centered ? "mx-auto max-w-3xl text-center" : "max-w-2xl"}>{section.eyebrow ? <p className="text-xs font-bold uppercase tracking-[0.2em] text-secondary">{section.eyebrow}</p> : null}<h2 className={`mt-2 font-[family-name:var(--font-display)] text-3xl font-semibold leading-tight sm:text-4xl ${dark ? "text-white" : "text-primary"}`}>{section.heading}</h2>{section.summary ? <p className={`mt-4 text-sm leading-7 ${dark ? "text-white/75" : "text-muted-foreground"}`}>{section.summary}</p> : null}{section.body && section.section_type !== "narrative" ? <p className={`mt-4 text-sm leading-7 ${dark ? "text-white/75" : "text-muted-foreground"}`}>{section.body}</p> : null}</div>;
}

function ClosingCta({ type }: { type: PublicInstitutionalPage["page_type"] }) {
  const charter = type === "service_charter";
  const heading = charter ? "Help us improve every service experience" : "Building the university Kenya’s future needs";
  const links = charter
    ? [{ href: "/contact?subject=service-feedback", label: "Share Feedback" }, { href: "/contact", label: "Contact the University" }]
    : [{ href: "https://research.kisiiuniversity.ac.ke", label: "Explore Our Research" }, { href: "/academics/programmes", label: "Discover Our Programmes" }];
  return <section className="bg-primary px-5 py-12 text-white sm:px-8 lg:px-10"><AboutReveal className="mx-auto flex flex-col gap-7 lg:flex-row lg:items-center lg:justify-between"><div><h2 className="font-[family-name:var(--font-display)] text-3xl font-semibold sm:text-4xl">{heading}</h2><p className="mt-3 max-w-2xl text-sm leading-7 text-white/75">{charter ? "Your feedback helps Kisii University serve its community better." : "Explore the teaching and research through which this strategy becomes public impact."}</p></div><div className="flex flex-wrap gap-3">{links.map((link, index) => <Link key={link.href} href={link.href} className={`inline-flex min-h-12 items-center gap-2 px-5 py-3 text-sm font-bold ${index === 0 ? "bg-secondary text-foreground" : "border border-white/60 text-white"}`}>{link.label}<ArrowRight className="h-4 w-4" aria-hidden /></Link>)}</div></AboutReveal></section>;
}

export function InstitutionalDocumentPage({ page }: { page: PublicInstitutionalPage }) {
  const hero = page.hero_media?.url || fallbacks[page.page_type];
  const primaryHref = documentHref(page.primary_document);
  return <div className="bg-white"><section className="relative isolate min-h-[360px] overflow-hidden bg-primary text-white"><Image src={hero} alt={page.hero_alt_text || page.hero_media?.alt_text || page.title} fill priority sizes="100vw" className="object-cover" /><div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/90 to-primary/25" /><div className="relative flex min-h-[360px] flex-col justify-center px-5 py-8 sm:px-8 lg:px-10"><nav aria-label="Breadcrumb" className="text-sm text-white/70"><Link href="/" className="hover:text-white">Home</Link><span className="mx-2">/</span><Link href="/about" className="hover:text-white">About KSU</Link><span className="mx-2">/</span><span>{page.eyebrow || page.title}</span></nav><div className="mt-10 max-w-3xl"><p className="text-xs font-bold uppercase tracking-[0.22em] text-secondary">{page.eyebrow}</p><h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl font-semibold leading-tight sm:text-5xl lg:text-6xl">{page.title}</h1><p className="mt-5 max-w-2xl text-base leading-8 text-white/85">{page.introduction}</p>{primaryHref ? <Link href={primaryHref} className="mt-6 inline-flex min-h-12 items-center gap-2 bg-secondary px-5 py-3 text-sm font-bold uppercase text-foreground"><Download className="h-4 w-4" aria-hidden />Download {page.page_type === "strategic_plan" ? "the Strategic Plan" : "the Current Charter"}</Link> : null}</div></div></section>{page.sections.map((section) => <StructuredSection key={section.id} section={section} />)}<ClosingCta type={page.page_type} /></div>;
}
