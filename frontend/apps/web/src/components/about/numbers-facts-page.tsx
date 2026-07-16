import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BookOpen, CheckCircle2, GraduationCap, Microscope } from "lucide-react";
import { RichTextRenderer } from "@ksu/ui/rich-text-renderer";
import type { PublicFactItem, PublicFactsData } from "@/lib/public-about-data";
import { AboutReveal } from "./about-reveal";

function factValue(item: PublicFactItem) {
  return `${item.prefix || ""}${item.display_value}${item.suffix || ""}${item.unit ? ` ${item.unit}` : ""}`;
}

function FactLine({ item }: { item: PublicFactItem }) {
  const value = factValue(item);

  return (
    <li className="pl-1 text-[0.98rem] leading-7 text-slate-800 marker:text-slate-950">
      {item.numeric_value !== null && item.numeric_value !== undefined ? (
        <>
          <strong className="font-bold tabular-nums text-slate-950">{value}</strong>{" "}
          <span>{item.label}</span>
        </>
      ) : (
        <>
          <span>{item.label}</span>{" "}
          <strong className="font-semibold text-slate-950">{value}</strong>
        </>
      )}
      {item.explanation ? <RichTextRenderer content={item.explanation} className="mt-1 block prose-sm text-sm leading-6 text-slate-600" /> : null}
    </li>
  );
}

function FactGroupVisual({ heading }: { heading: string }) {
  return (
    <div className="relative flex aspect-[16/10] items-end overflow-hidden bg-primary px-6 py-5 text-white" aria-hidden="true">
      <div className="absolute inset-0 opacity-25 [background-image:radial-gradient(circle_at_20%_25%,white_0,white_1px,transparent_1.5px),radial-gradient(circle_at_80%_70%,white_0,white_1px,transparent_1.5px)] [background-size:28px_28px,36px_36px]" />
      <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full border border-white/20" />
      <div className="absolute -right-4 -top-4 h-32 w-32 rounded-full border border-secondary/50" />
      <p className="relative max-w-xs font-[family-name:var(--font-display)] text-2xl font-semibold leading-tight">{heading}</p>
    </div>
  );
}

export function NumbersFactsPage({ data }: { data: PublicFactsData }) {
  const edition = data.edition;

  return (
    <main className="bg-white">
      <header className="border-b border-slate-200 bg-[#f6f4ef] px-5 py-5 sm:px-8 lg:px-10">
        <nav aria-label="Breadcrumb" className="text-sm text-slate-600">
          <Link href="/" className="font-semibold text-primary underline-offset-4 hover:underline">Home</Link>
          <span className="mx-3 text-slate-400" aria-hidden>/</span>
          <Link href="/about" className="font-semibold text-primary underline-offset-4 hover:underline">About KSU</Link>
          <span className="mx-3 text-slate-400" aria-hidden>/</span>
          <span>Numbers &amp; Facts</span>
        </nav>
      </header>

      <section className="px-5 py-10 sm:px-8 lg:px-10 lg:py-14" aria-labelledby="facts-heading">
        <div className="mb-10 grid gap-7 border-b border-slate-200 pb-9 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
          <div>
            <h1 id="facts-heading" className="max-w-5xl font-[family-name:var(--font-display)] text-4xl font-semibold leading-[1.08] text-primary sm:text-5xl lg:text-[3.4rem]">
              {edition.title}
            </h1>
            {edition.introduction ? <RichTextRenderer content={edition.introduction} className="mt-4 max-w-4xl text-lg leading-8 text-slate-700" /> : null}
            {edition.verified_on ? (
              <p className="mt-5 flex items-center gap-2 text-sm font-medium text-slate-600">
                <CheckCircle2 className="h-4 w-4 text-primary" aria-hidden />
                Verified {new Date(edition.verified_on).toLocaleDateString("en-KE", { dateStyle: "medium" })}
              </p>
            ) : null}
          </div>

          <div className="justify-self-start md:justify-self-end">
            {data.available_years.length > 1 ? (
              <details className="group relative">
                <summary className="cursor-pointer list-none border border-primary/45 bg-white px-4 py-2.5 text-sm font-semibold text-primary transition hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">
                  Reporting year: {edition.reporting_year}
                </summary>
                <nav className="absolute right-0 z-20 mt-2 min-w-full border border-slate-200 bg-white p-1 shadow-xl" aria-label="Facts by reporting year">
                  {data.available_years.map((year) => (
                    <Link
                      key={year}
                      href={year === data.available_years[0] ? "/about/numbers-and-facts" : `/about/numbers-and-facts?year=${year}`}
                      aria-current={year === edition.reporting_year ? "page" : undefined}
                      className={`block px-4 py-2 text-sm font-semibold transition ${year === edition.reporting_year ? "bg-primary text-white" : "text-slate-700 hover:bg-slate-100"}`}
                    >
                      {year}
                    </Link>
                  ))}
                </nav>
              </details>
            ) : (
              <p className="border border-primary/45 px-4 py-2.5 text-sm font-semibold text-primary">
                Reporting year: {edition.reporting_year}
              </p>
            )}
          </div>
        </div>

        <div className="grid gap-x-8 gap-y-14 md:grid-cols-2 xl:grid-cols-3 xl:gap-y-16">
          {data.groups.map((group) => (
            <AboutReveal key={group.id} className="[content-visibility:auto] [contain-intrinsic-size:auto_34rem]">
              <article>
              {group.image?.url ? (
                <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
                  <Image
                    src={group.image.url}
                    alt={group.image.alt_text || group.image.alt || group.image_alt_text || group.heading}
                    fill
                    sizes="(min-width: 1280px) 32vw, (min-width: 768px) 50vw, 100vw"
                    className="object-cover transition duration-700 motion-safe:hover:scale-[1.025] motion-reduce:transition-none"
                  />
                </div>
              ) : <FactGroupVisual heading={group.heading} />}
              <h2 className="mt-5 font-[family-name:var(--font-display)] text-2xl font-semibold leading-tight text-primary">
                {group.heading}
              </h2>
              {group.summary ? <RichTextRenderer content={group.summary} className="mt-2 max-w-prose prose-sm text-[0.95rem] leading-6 text-slate-600" /> : null}
              <ul className="mt-5 list-square space-y-2.5 pl-5">
                {group.items.map((item) => (
                  <FactLine key={item.id} item={item} />
                ))}
              </ul>
              </article>
            </AboutReveal>
          ))}
        </div>
      </section>

      <section className="bg-primary px-5 py-12 text-white sm:px-8 lg:px-10 lg:py-16" aria-labelledby="facts-next-heading">
        <AboutReveal className="grid gap-8 lg:grid-cols-[minmax(0,.8fr)_minmax(0,1.2fr)] lg:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-secondary">Beyond the figures</p>
            <h2 id="facts-next-heading" className="mt-3 max-w-xl font-[family-name:var(--font-display)] text-3xl font-semibold leading-tight sm:text-4xl">Discover what these numbers make possible.</h2>
            <p className="mt-4 max-w-xl text-sm leading-7 text-white/75">Explore the learning, research and public purpose behind Kisii University’s institutional profile.</p>
          </div>
          <nav className="grid gap-3 sm:grid-cols-3" aria-label="Continue exploring Kisii University">
            {[
              { href: "/academics/programmes", label: "Explore Programmes", icon: GraduationCap },
              { href: "https://research.kisiiuniversity.ac.ke", label: "Discover Research", icon: Microscope },
              { href: "/about", label: "Our University Story", icon: BookOpen },
            ].map(({ href, label, icon: Icon }) => (
              <Link key={label} href={href} className="group flex min-h-28 flex-col justify-between border border-white/25 bg-white/[0.06] p-4 transition-colors hover:border-secondary hover:bg-white/[0.12] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary">
                <Icon className="h-6 w-6 text-secondary" aria-hidden />
                <span className="mt-5 flex items-end justify-between gap-3 text-sm font-bold"><span>{label}</span><ArrowRight className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-1 motion-reduce:transition-none" aria-hidden /></span>
              </Link>
            ))}
          </nav>
        </AboutReveal>
      </section>
    </main>
  );
}
