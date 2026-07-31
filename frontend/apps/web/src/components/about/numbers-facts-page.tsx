import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BookOpen, CheckCircle2, GraduationCap, Microscope } from "lucide-react";
import { RichTextRenderer } from "@ksu/ui/rich-text-renderer";
import type { PublicFactItem, PublicFactsData } from "@/lib/public-about-data";
import { AboutReveal } from "./about-reveal";
import { ImageCurtainReveal } from "./image-curtain-reveal";
import { createAboutImagePicker } from "./about-image-registry";

function factValue(item: PublicFactItem) {
  return `${item.prefix || ""}${item.display_value}${item.suffix || ""}${item.unit ? ` ${item.unit}` : ""}`;
}

function FactLine({ item }: { item: PublicFactItem }) {
  const value = factValue(item);

  return (
    <li className="grid grid-cols-[1fr_auto] gap-5 border-b border-primary/8 py-2.5 text-sm leading-6 last:border-b-0">
      {item.numeric_value !== null && item.numeric_value !== undefined ? (
        <>
          <span className="flex items-center gap-3 before:h-2 before:w-2 before:shrink-0 before:bg-primary">{item.label}</span>
          <strong className="font-bold tabular-nums text-foreground">{value}</strong>
        </>
      ) : (
        <>
          <span className="flex items-center gap-3 before:h-2 before:w-2 before:shrink-0 before:bg-primary">{item.label}</span>
          <strong className="font-semibold text-foreground">{value}</strong>
        </>
      )}
      {item.explanation ? <RichTextRenderer content={item.explanation} className="col-span-2 ml-5 mt-1 block prose-sm text-xs leading-5 text-muted-foreground" /> : null}
    </li>
  );
}

export function NumbersFactsPage({ data }: { data: PublicFactsData }) {
  const edition = data.edition;
  const pickImage = createAboutImagePicker("numbersFacts");

  return (
    <main className="bg-white">
      <header className="border-b border-border bg-[#f6f4ef] px-5 py-5 sm:px-8 lg:px-10">
        <nav aria-label="Breadcrumb" className="mx-auto max-w-7xl text-sm text-muted-foreground">
          <Link href="/" className="font-semibold text-primary underline-offset-4 hover:underline">Home</Link>
          <span className="mx-3 text-muted-foreground/70" aria-hidden>/</span>
          <Link href="/about" className="font-semibold text-primary underline-offset-4 hover:underline">About KSU</Link>
          <span className="mx-3 text-muted-foreground/70" aria-hidden>/</span>
          <span>Numbers &amp; Facts</span>
        </nav>
      </header>

      <section className="px-5 py-12 sm:px-8 lg:px-10 lg:py-16" aria-labelledby="facts-heading">
        <div className="mx-auto mb-12 grid max-w-7xl gap-7 pb-8 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
          <div>
            <h1 id="facts-heading" className="max-w-5xl font-[family-name:var(--font-display)] text-4xl font-medium leading-[1.08] text-primary sm:text-5xl lg:text-[4rem]">
              {edition.title}
            </h1>
            {edition.introduction ? <RichTextRenderer content={edition.introduction} className="mt-4 max-w-4xl text-lg leading-8 text-muted-foreground" /> : null}
            {edition.verified_on ? (
              <p className="mt-5 flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 text-primary" aria-hidden />
                Verified {new Date(edition.verified_on).toLocaleDateString("en-KE", { dateStyle: "medium" })}
              </p>
            ) : null}
          </div>

          <div className="justify-self-start md:justify-self-end"><p className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">Reporting Year</p>
            {data.available_years.length > 1 ? (
              <details className="group relative">
                <summary className="min-w-32 cursor-pointer list-none border border-primary/45 bg-white px-4 py-2.5 text-sm font-semibold text-primary transition hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">
                  {edition.reporting_year}
                </summary>
                <nav className="absolute right-0 z-20 mt-2 min-w-full border border-border bg-white p-1 shadow-xl" aria-label="Facts by reporting year">
                  {data.available_years.map((year) => (
                    <Link
                      key={year}
                      href={year === data.available_years[0] ? "/about/numbers-and-facts" : `/about/numbers-and-facts?year=${year}`}
                      aria-current={year === edition.reporting_year ? "page" : undefined}
                      className={`block px-4 py-2 text-sm font-semibold transition ${year === edition.reporting_year ? "bg-primary text-white" : "text-muted-foreground hover:bg-surface-muted"}`}
                    >
                      {year}
                    </Link>
                  ))}
                </nav>
              </details>
            ) : (
              <p className="min-w-32 border border-primary/45 px-4 py-2.5 text-sm font-semibold text-primary">
                {edition.reporting_year}
              </p>
            )}
          </div>
        </div>

        <div className="mx-auto grid max-w-7xl gap-x-6 gap-y-14 md:grid-cols-2 xl:grid-cols-3 xl:gap-y-16">
          {data.groups.map((group) => (
            <AboutReveal key={group.id} className="[content-visibility:auto] [contain-intrinsic-size:auto_34rem]">
              <article>
              <ImageCurtainReveal className="aspect-[16/10]" direction={data.groups.indexOf(group) % 2 === 0 ? "right" : "left"}>
                <Image
                  src={pickImage(group.image?.url)}
                  alt={group.image?.alt_text || group.image?.alt || group.image_alt_text || `${group.heading} at Kisii University`}
                  fill
                  sizes="(min-width: 1280px) 32vw, (min-width: 768px) 50vw, 100vw"
                  className="object-cover transition duration-700 motion-safe:hover:scale-[1.025] motion-reduce:transition-none"
                />
                <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-primary/35 to-transparent" aria-hidden />
              </ImageCurtainReveal>
              <h2 className="mt-5 font-[family-name:var(--font-display)] text-2xl font-semibold leading-tight text-primary">
                {group.heading}
              </h2>
              {group.summary ? <RichTextRenderer content={group.summary} className="mt-2 max-w-prose prose-sm text-[0.95rem] leading-6 text-muted-foreground" /> : null}
              <ul className="mt-5">
                {group.items.map((item) => (
                  <FactLine key={item.id} item={item} />
                ))}
              </ul>
              </article>
            </AboutReveal>
          ))}
        </div>
      </section>

      <section className="bg-primary px-5 py-14 text-white sm:px-8 lg:px-10 lg:py-16" aria-labelledby="facts-next-heading">
        <AboutReveal className="mx-auto max-w-7xl" variant="scale">
          <h2 id="facts-next-heading" className="mx-auto max-w-4xl text-center font-[family-name:var(--font-display)] text-3xl font-semibold leading-tight sm:text-4xl">Discover what these numbers make possible.</h2>
          <div className="mx-auto mt-4 h-1 w-20 bg-secondary" aria-hidden />
          <nav className="mt-10 grid gap-6 sm:grid-cols-3 sm:gap-0" aria-label="Continue exploring Kisii University">
            {[
              { href: "/academics/programmes", label: "Explore Programmes", icon: GraduationCap },
              { href: "https://research.kisiiuniversity.ac.ke", label: "Discover Research", icon: Microscope },
              { href: "/about", label: "Our University Story", icon: BookOpen },
            ].map(({ href, label, icon: Icon }) => (
              <Link key={label} href={href} className="group flex min-h-32 items-center gap-5 border-white/25 px-5 transition-colors hover:bg-white/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary sm:border-l sm:first:border-l-0">
                <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border-2 border-secondary text-secondary"><Icon className="h-7 w-7" aria-hidden /></span>
                <span><span className="block font-[family-name:var(--font-display)] text-xl font-semibold">{label}</span><span className="mt-3 flex items-center gap-2 text-sm font-bold text-secondary">Explore <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1 motion-reduce:transition-none" aria-hidden /></span></span>
              </Link>
            ))}
          </nav>
        </AboutReveal>
      </section>
    </main>
  );
}
