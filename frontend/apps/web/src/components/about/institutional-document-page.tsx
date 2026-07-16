import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  Check,
  Download,
  FileText,
  Quote,
} from "lucide-react";
import type {
  PublicInstitutionalPage,
  PublicInstitutionalSection,
} from "@/lib/public-about-data";
import { AboutReveal } from "./about-reveal";
import { InstitutionalIcon } from "./institutional-icon";

const heroFallbacks = {
  service_charter: "/images/about/about-service-charter-branded.webp",
  strategic_plan: "/images/about/about-strategic-plan-branded.webp",
  about: "/images/backgrounds/about-hero.jpg",
};

const narrativeFallbacks = {
  service_charter: "/images/about/about-service-charter.webp",
  strategic_plan: "/images/HERIAfricaLaunch.jpg",
  about: "/images/about/about-overview.webp",
};

const quoteFallbacks = {
  service_charter: "/images/about/about-quality-assurance.webp",
  strategic_plan: "/images/about/about-strategic-plan.webp",
  about: "/images/about/about-mission-vision.webp",
};

type PageType = PublicInstitutionalPage["page_type"];

function documentHref(document: PublicInstitutionalPage["primary_document"]) {
  return document?.file?.url || null;
}

function sectionImage(
  section: PublicInstitutionalSection,
  fallback: string,
) {
  return section.primary_media?.url || fallback;
}

function SectionHeading({
  section,
  centered = false,
  inverse = false,
}: {
  section: PublicInstitutionalSection;
  centered?: boolean;
  inverse?: boolean;
}) {
  return (
    <div className={centered ? "mx-auto max-w-3xl text-center" : "max-w-2xl"}>
      {section.eyebrow ? (
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-secondary">
          {section.eyebrow}
        </p>
      ) : null}
      <h2
        className={`mt-3 font-[family-name:var(--font-display)] text-3xl font-semibold leading-tight sm:text-4xl ${inverse ? "text-white" : "text-primary"}`}
      >
        {section.heading}
      </h2>
      {section.summary ? (
          <p className={`mt-4 leading-7 ${inverse ? "text-white/70" : "text-muted-foreground"}`}>
          {section.summary}
        </p>
      ) : null}
    </div>
  );
}

function NarrativeSection({
  section,
  type,
}: {
  section: PublicInstitutionalSection;
  type: PageType;
}) {
  return (
    <section className="overflow-hidden bg-[#f5f2ea]">
      <AboutReveal className="grid lg:grid-cols-2 lg:items-stretch">
        <div className="flex items-center px-5 py-14 sm:px-8 lg:px-10 lg:py-20 xl:px-16">
          <div>
            <SectionHeading section={section} />
            {section.body ? (
              <p className="mt-5 max-w-2xl whitespace-pre-line text-base leading-8 text-muted-foreground">
                {section.body}
              </p>
            ) : null}
          </div>
        </div>
        <div className="relative min-h-[320px] overflow-hidden lg:min-h-[470px]">
          <Image
            src={sectionImage(section, narrativeFallbacks[type])}
            alt={section.media_alt_text || section.primary_media?.alt_text || section.heading}
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover transition duration-1000 motion-safe:hover:scale-[1.03] motion-reduce:transition-none"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary/45 via-transparent to-transparent" />
        </div>
      </AboutReveal>
    </section>
  );
}

function CommitmentsSection({ section }: { section: PublicInstitutionalSection }) {
  return (
    <section className="bg-white px-5 py-14 sm:px-8 lg:px-10 lg:py-20">
      <AboutReveal>
        <SectionHeading section={section} centered />
        <div className="relative mt-11 grid gap-8 md:grid-cols-2 lg:grid-cols-4 lg:gap-4">
          <div className="absolute left-[12.5%] right-[12.5%] top-8 hidden h-px bg-secondary/70 lg:block" aria-hidden />
          {section.items.map((item, index) => (
            <article key={item.id} className="group relative text-center">
              <span className="relative z-10 mx-auto flex h-16 w-16 items-center justify-center rounded-full border-2 border-secondary bg-white text-primary shadow-[0_0_0_8px_white] transition duration-300 group-hover:-translate-y-1 group-hover:bg-primary group-hover:text-white motion-reduce:transform-none">
                <InstitutionalIcon name={item.icon_key} className="h-7 w-7" />
              </span>
              <p className="mt-5 text-[0.68rem] font-bold uppercase tracking-[0.2em] text-secondary">
                Commitment {String(index + 1).padStart(2, "0")}
              </p>
              <h3 className="mt-2 font-[family-name:var(--font-display)] text-xl font-semibold text-primary">
                {item.title}
              </h3>
              {item.description ? (
                <p className="mx-auto mt-3 max-w-xs text-sm leading-6 text-muted-foreground">
                  {item.description}
                </p>
              ) : null}
            </article>
          ))}
        </div>
      </AboutReveal>
    </section>
  );
}

function ProcessSection({ section }: { section: PublicInstitutionalSection }) {
  const inverse = section.theme === "blue" || section.theme === "green";

  return (
    <section className={`${inverse ? "bg-primary text-white" : "bg-[#f5f2ea] text-foreground"} px-5 py-14 sm:px-8 lg:px-10 lg:py-20`}>
      <AboutReveal>
        <SectionHeading section={section} centered inverse={inverse} />
        <ol className="relative mt-12 grid gap-9 md:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          <div className={`absolute left-[12.5%] right-[12.5%] top-7 hidden h-px lg:block ${inverse ? "bg-white/25" : "bg-primary/20"}`} aria-hidden />
          {section.items.map((item, index) => (
            <li key={item.id} className="group relative text-center">
              <span className={`relative z-10 mx-auto flex h-14 w-14 items-center justify-center rounded-full border-2 font-[family-name:var(--font-display)] text-lg font-semibold shadow-[0_0_0_7px_var(--step-ring)] transition duration-300 group-hover:-translate-y-1 motion-reduce:transform-none ${inverse ? "[--step-ring:var(--primary)] border-secondary bg-primary text-secondary" : "[--step-ring:#f5f2ea] border-primary/30 bg-white text-primary"}`}>
                {String(index + 1).padStart(2, "0")}
              </span>
              <InstitutionalIcon name={item.icon_key} className={`mx-auto mt-5 h-6 w-6 ${inverse ? "text-secondary" : "text-primary"}`} />
              <h3 className="mt-3 font-[family-name:var(--font-display)] text-xl font-semibold">
                {item.title}
              </h3>
              {item.description ? (
                <p className={`mx-auto mt-2 max-w-xs text-sm leading-6 ${inverse ? "text-white/70" : "text-muted-foreground"}`}>
                  {item.description}
                </p>
              ) : null}
            </li>
          ))}
        </ol>
      </AboutReveal>
    </section>
  );
}

function PrioritiesSection({ section }: { section: PublicInstitutionalSection }) {
  return (
    <section className="overflow-hidden bg-white px-5 py-14 sm:px-8 lg:px-10 lg:py-20">
      <AboutReveal>
        <SectionHeading section={section} centered />
        <div className="relative mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-5 lg:gap-0">
          <div className="absolute left-[10%] right-[10%] top-9 hidden h-0.5 bg-secondary lg:block" aria-hidden />
          {section.items.map((item, index) => (
            <article key={item.id} className="group relative border border-primary/10 bg-white p-5 transition duration-300 hover:-translate-y-1 hover:border-secondary hover:shadow-xl motion-reduce:transform-none lg:border-y-0 lg:border-l-0 lg:border-r lg:px-5 lg:last:border-r-0">
              <span className="relative z-10 mx-auto flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-full border-2 border-secondary bg-white text-primary shadow-[0_0_0_8px_white] transition group-hover:bg-primary group-hover:text-white">
                <InstitutionalIcon name={item.icon_key} className="h-7 w-7" />
              </span>
              <p className="mt-5 text-center text-[0.68rem] font-bold uppercase tracking-[0.18em] text-secondary">
                Priority {String(index + 1).padStart(2, "0")}
              </p>
              <h3 className="mt-2 text-center font-[family-name:var(--font-display)] text-lg font-semibold leading-snug text-primary">
                {item.title}
              </h3>
              {item.description ? (
                <p className="mt-3 text-center text-sm leading-6 text-muted-foreground">
                  {item.description}
                </p>
              ) : null}
            </article>
          ))}
        </div>
      </AboutReveal>
    </section>
  );
}

function OutcomesSection({ section }: { section: PublicInstitutionalSection }) {
  return (
    <section className="bg-[#f5f2ea] px-5 py-14 sm:px-8 lg:px-10 lg:py-20">
      <AboutReveal className="grid gap-10 lg:grid-cols-[0.68fr_1.32fr] lg:items-start">
        <SectionHeading section={section} />
        <div className="grid gap-px overflow-hidden border border-primary/15 bg-primary/15 sm:grid-cols-3">
          {section.items.map((item, index) => (
            <article key={item.id} className="group bg-white p-6 transition-colors hover:bg-primary hover:text-white">
              <div className="flex items-center justify-between gap-4">
                <InstitutionalIcon name={item.icon_key} className="h-7 w-7 text-secondary" />
                <span className="font-[family-name:var(--font-display)] text-3xl text-primary/20 group-hover:text-white/25">
                  {String(index + 1).padStart(2, "0")}
                </span>
              </div>
              <h3 className="mt-8 font-[family-name:var(--font-display)] text-xl font-semibold text-primary group-hover:text-white">
                {item.title}
              </h3>
              {item.description ? (
                <p className="mt-3 text-sm leading-6 text-muted-foreground group-hover:text-white/70">
                  {item.description}
                </p>
              ) : null}
            </article>
          ))}
        </div>
      </AboutReveal>
    </section>
  );
}

function QuoteSection({
  section,
  type,
}: {
  section: PublicInstitutionalSection;
  type: PageType;
}) {
  return (
    <section className="grid bg-primary text-white lg:grid-cols-[0.85fr_1.15fr]">
      <div className="relative min-h-[300px] overflow-hidden lg:min-h-[430px]">
        <Image
          src={sectionImage(section, quoteFallbacks[type])}
          alt={section.media_alt_text || section.primary_media?.alt_text || "Kisii University community"}
          fill
          sizes="(min-width: 1024px) 46vw, 100vw"
          className="object-cover transition duration-1000 motion-safe:hover:scale-[1.03] motion-reduce:transition-none"
        />
        <div className="absolute inset-0 bg-primary/20" />
      </div>
      <AboutReveal className="flex items-center px-5 py-14 sm:px-8 lg:px-12 xl:px-16">
        <div>
          <Quote className="h-11 w-11 text-secondary" aria-hidden />
          <blockquote className="mt-6 max-w-3xl font-[family-name:var(--font-display)] text-3xl font-semibold leading-tight sm:text-4xl">
            {section.heading}
          </blockquote>
          {section.body ? (
            <p className="mt-5 max-w-2xl text-base leading-8 text-white/70">
              {section.body}
            </p>
          ) : null}
        </div>
      </AboutReveal>
    </section>
  );
}

function DocumentsSection({
  section,
  page,
}: {
  section: PublicInstitutionalSection;
  page: PublicInstitutionalPage;
}) {
  const documents = section.documents.filter((document) => document.file?.url);
  const primaryHref = documentHref(page.primary_document);

  if (!documents.length && !primaryHref) return null;

  return (
    <section className="bg-white px-5 py-14 sm:px-8 lg:px-10 lg:py-20">
      <AboutReveal>
        <SectionHeading section={section} centered />
        <div className="mx-auto mt-10 grid max-w-5xl gap-4 md:grid-cols-2">
          {documents.map((document) => (
            <article key={document.id} className="group flex min-h-52 flex-col border border-primary/15 bg-[#f8f6f0] p-6 transition hover:border-secondary hover:shadow-lg">
              <div className="flex items-start justify-between gap-4">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-secondary">
                  <FileText className="h-6 w-6" aria-hidden />
                </span>
                {document.is_featured ? <span className="text-[0.65rem] font-bold uppercase tracking-[0.18em] text-secondary">Featured</span> : null}
              </div>
              <h3 className="mt-6 font-[family-name:var(--font-display)] text-xl font-semibold text-primary">
                {document.public_label || document.title}
              </h3>
              {document.description ? <p className="mt-2 text-sm leading-6 text-muted-foreground">{document.description}</p> : null}
              <Link href={document.file!.url!} className="mt-auto inline-flex min-h-11 items-end gap-2 pt-5 text-sm font-bold text-primary hover:underline">
                <Download className="h-4 w-4" aria-hidden /> Download document
              </Link>
            </article>
          ))}
        </div>
      </AboutReveal>
    </section>
  );
}

function StructuredSection({
  section,
  page,
}: {
  section: PublicInstitutionalSection;
  page: PublicInstitutionalPage;
}) {
  switch (section.section_type) {
    case "narrative":
      return <NarrativeSection section={section} type={page.page_type} />;
    case "commitments":
      return <CommitmentsSection section={section} />;
    case "process":
      return <ProcessSection section={section} />;
    case "priorities":
      return <PrioritiesSection section={section} />;
    case "outcomes":
      return <OutcomesSection section={section} />;
    case "quote":
      return <QuoteSection section={section} type={page.page_type} />;
    case "document_collection":
      return <DocumentsSection section={section} page={page} />;
    default:
      return null;
  }
}

function DocumentSummary({ page }: { page: PublicInstitutionalPage }) {
  const href = documentHref(page.primary_document);
  const charter = page.page_type === "service_charter";

  return (
    <section className="relative z-10 -mt-6 px-5 sm:px-8 lg:px-10">
      <AboutReveal className="grid overflow-hidden border border-primary/10 bg-white shadow-xl md:grid-cols-[auto_1fr_auto] md:items-center">
        <div className="flex min-h-28 items-center justify-center bg-secondary px-7 text-primary">
          {charter ? <Check className="h-11 w-11" aria-hidden /> : <CalendarDays className="h-10 w-10" aria-hidden />}
        </div>
        <div className="px-6 py-6 lg:px-8">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-secondary">
            {charter ? "Our public promise" : "Planning horizon"}
          </p>
          <h2 className="mt-2 font-[family-name:var(--font-display)] text-2xl font-semibold text-primary">
            {charter ? "Clear standards. Respectful service. Public accountability." : page.reporting_period_label || "Our current strategic direction"}
          </h2>
          {(page.effective_date || page.review_date) ? (
            <p className="mt-2 text-sm text-muted-foreground">
              {page.effective_date ? `Effective ${page.effective_date}` : ""}
              {page.effective_date && page.review_date ? " · " : ""}
              {page.review_date ? `Review ${page.review_date}` : ""}
            </p>
          ) : null}
        </div>
        {href ? (
          <div className="px-6 pb-6 md:pb-0 md:pr-8">
            <Link href={href} className="inline-flex min-h-12 items-center gap-2 border border-primary bg-white px-5 py-3 text-sm font-bold text-primary transition hover:bg-primary hover:text-white">
              <Download className="h-4 w-4" aria-hidden />
              Download document
            </Link>
          </div>
        ) : null}
      </AboutReveal>
    </section>
  );
}

function ClosingCta({ type }: { type: PageType }) {
  const charter = type === "service_charter";
  const heading = charter
    ? "Help us improve every service experience."
    : "Together, we are building the university Kenya’s future needs.";
  const description = charter
    ? "Your feedback helps Kisii University strengthen its standards and serve its community better."
    : "Explore the teaching, research and partnerships through which this strategy becomes public impact.";
  const links = charter
    ? [
        { href: "/contact?subject=service-feedback", label: "Share Feedback" },
        { href: "/contact", label: "Contact the University" },
      ]
    : [
        { href: "https://research.kisiiuniversity.ac.ke", label: "Explore Our Research" },
        { href: "/academics/programmes", label: "Discover Our Programmes" },
      ];

  return (
    <section className="relative overflow-hidden bg-primary px-5 py-14 text-white sm:px-8 lg:px-10 lg:py-16">
      <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full border border-white/10" aria-hidden />
      <div className="absolute -bottom-20 right-24 h-48 w-48 rounded-full border border-secondary/20" aria-hidden />
      <AboutReveal className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-secondary">Continue the journey</p>
          <h2 className="mt-3 max-w-3xl font-[family-name:var(--font-display)] text-3xl font-semibold leading-tight sm:text-4xl">
            {heading}
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-white/70">{description}</p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-3">
          {links.map((link, index) => (
            <Link key={link.href} href={link.href} className={`inline-flex min-h-12 items-center gap-2 px-5 py-3 text-sm font-bold transition hover:-translate-y-0.5 motion-reduce:transform-none ${index === 0 ? "bg-secondary text-foreground hover:bg-amber-400" : "border border-white/60 text-white hover:bg-white/10"}`}>
              {link.label} <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          ))}
        </div>
      </AboutReveal>
    </section>
  );
}

export function InstitutionalDocumentPage({ page }: { page: PublicInstitutionalPage }) {
  const hero = page.hero_media?.url || heroFallbacks[page.page_type];

  return (
    <main className="bg-white">
      <section className="relative isolate min-h-[370px] overflow-hidden bg-primary text-white">
        <Image
          src={hero}
          alt={page.hero_alt_text || page.hero_media?.alt_text || page.title}
          fill
          priority
          sizes="100vw"
          className="object-cover motion-safe:animate-[kenburns_28s_ease-in-out_infinite_alternate]"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,41,33,.97)_0%,rgba(0,41,33,.85)_44%,rgba(0,41,33,.22)_82%)]" />
        <div className="relative flex min-h-[370px] flex-col justify-center px-5 py-8 sm:px-8 lg:px-10">
          <nav aria-label="Breadcrumb" className="text-xs font-semibold text-white/72">
            <Link href="/" className="hover:text-white">Home</Link>
            <span className="mx-2" aria-hidden>/</span>
            <Link href="/about" className="hover:text-white">About KSU</Link>
            <span className="mx-2" aria-hidden>/</span>
            <span>{page.eyebrow || page.title}</span>
          </nav>
          <div className="mt-8 max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-secondary">{page.eyebrow}</p>
            <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl font-semibold leading-[1.06] sm:text-5xl lg:text-[3.6rem]">
              {page.title}
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-white/80">{page.introduction}</p>
          </div>
        </div>
      </section>

      <DocumentSummary page={page} />
      {page.sections.map((section) => (
        <StructuredSection key={section.id} section={section} page={page} />
      ))}
      <ClosingCta type={page.page_type} />
    </main>
  );
}
