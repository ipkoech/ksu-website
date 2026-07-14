import Link from "next/link";
import { ArrowRight, CheckCircle2, FileText } from "lucide-react";
import { PublicImage } from "@/components/public/public-image";
import type { PublicFactItem, PublicFactsData } from "@/lib/public-about-data";
import { AboutReveal } from "./about-reveal";

const figureFallbackImages = [
  "/images/backgrounds/KSUGreenLandscapingMay2026-3885.jpg",
  "/images/backgrounds/KSUB-RollPhotos2025-122.jpg",
  "/images/backgrounds/KSUGreenLandscapingMay2026-3810.jpg",
  "/images/backgrounds/KSUGreenLandscapingMay2026-7456.jpg",
  "/images/backgrounds/KSUMessengersofPeaceTrainingJune27,2026-4440.jpg",
  "/images/backgrounds/bg-history.jpg",
];

function factValue(item: PublicFactItem) {
  return `${item.prefix || ""}${item.display_value}${item.suffix || ""}${item.unit ? ` ${item.unit}` : ""}`;
}

function FactFigure({
  group,
  items,
  index,
}: {
  group: PublicFactsData["groups"][number];
  items: PublicFactItem[];
  index: number;
}) {
  const image = (index === 0 ? group.image?.url : null) || figureFallbackImages[index % figureFallbackImages.length];
  const sources = Array.from(
    new Map(
      items
        .filter((item) => item.source_title)
        .map((item) => [item.source_title, { title: item.source_title!, url: item.source_url }]),
    ).values(),
  );

  return (
    <article className="group h-full">
      <PublicImage
        src={image}
        alt={group.image?.alt || group.image_alt_text || `${group.heading} at Kisii University`}
        ratio="news"
        className="overflow-hidden bg-slate-100"
        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
        unoptimized
        imageClassName="object-cover transition duration-700 group-hover:scale-[1.025]"
      />
      <h3 className="sr-only">{group.heading}</h3>
      <ul className="mt-5 list-square space-y-3 pl-5 marker:text-primary">
        {items.map((item) => (
          <li key={item.id} className="pl-1 text-base leading-7 text-slate-900">
            <span className="font-semibold">{item.label}:</span>{" "}
            <span>{factValue(item)}</span>
            {item.explanation ? <span className="mt-1 block text-sm leading-6 text-slate-600">{item.explanation}</span> : null}
            {item.link_url ? (
              <Link href={item.link_url} className="mt-1 inline-flex items-center gap-1.5 text-sm font-semibold text-primary underline-offset-4 hover:underline">
                {item.link_label || "Learn more"}<ArrowRight className="h-3.5 w-3.5" aria-hidden />
              </Link>
            ) : null}
          </li>
        ))}
      </ul>
      {sources.length ? (
        <p className="mt-4 text-xs leading-5 text-slate-500">
          Source: {sources.map((source, sourceIndex) => (
            <span key={source.title}>
              {sourceIndex ? ", " : null}
              {source.url ? <Link href={source.url} className="underline-offset-4 hover:text-primary hover:underline">{source.title}</Link> : source.title}
            </span>
          ))}
        </p>
      ) : null}
    </article>
  );
}

export function NumbersFactsPage({ data }: { data: PublicFactsData }) {
  const edition = data.edition;
  const figures = data.groups.flatMap((group) => {
    const chunks: Array<{ group: typeof group; items: PublicFactItem[] }> = [];
    for (let index = 0; index < group.items.length; index += 2) {
      chunks.push({ group, items: group.items.slice(index, index + 2) });
    }
    return chunks;
  });

  return (
    <main className="bg-white">
      <header className="border-b border-slate-200 bg-[#f6f4ef] px-5 py-10 sm:px-8 lg:px-10 lg:py-14">
        <div className="w-full">
          <nav aria-label="Breadcrumb" className="text-sm text-slate-600">
            <Link href="/" className="font-semibold text-primary hover:underline">Home</Link>
            <span className="mx-2" aria-hidden>/</span>
            <Link href="/about" className="font-semibold text-primary hover:underline">About KSU</Link>
            <span className="mx-2" aria-hidden>/</span>
            <span>Numbers &amp; Facts</span>
          </nav>
          <div className="mt-8 max-w-5xl">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-secondary">About Kisii University</p>
            <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl font-semibold leading-tight text-primary sm:text-5xl lg:text-6xl">
              {edition.title}
            </h1>
            <p className="mt-5 max-w-4xl text-base leading-7 text-slate-700 sm:text-lg sm:leading-8">
              {edition.introduction || "Kisii University at a glance: verified institutional figures, academic organisation and public reporting context."}
            </p>
          </div>
        </div>
      </header>

      {data.available_years.length ? (
        <section className="border-b border-slate-200 bg-white px-5 py-4 sm:px-8 lg:px-10" aria-label="Facts by reporting year">
          <div className="flex w-full items-center gap-3 overflow-x-auto pb-1">
            <span className="shrink-0 text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Reporting year</span>
            {data.available_years.map((year) => (
              <Link
                key={year}
                href={year === data.available_years[0] ? "/about/numbers-and-facts" : `/about/numbers-and-facts?year=${year}`}
                aria-current={year === edition.reporting_year ? "page" : undefined}
                className={`shrink-0 border px-4 py-2 text-sm font-bold transition ${year === edition.reporting_year ? "border-primary bg-primary text-white" : "border-slate-300 text-slate-700 hover:border-primary hover:text-primary"}`}
              >
                {year}
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <section className="px-5 py-12 sm:px-8 lg:px-10 lg:py-16" aria-labelledby="facts-heading">
        <div className="w-full">
          <AboutReveal>
            <div className="mb-8 grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
              <h2 id="facts-heading" className="font-[family-name:var(--font-display)] text-3xl font-semibold text-primary sm:text-4xl">
                KSU in numbers — {edition.reporting_year}
              </h2>
              {edition.verified_on ? (
                <p className="flex items-center gap-2 text-sm font-semibold text-slate-600">
                  <CheckCircle2 className="h-4 w-4 text-primary" aria-hidden />
                  Verified {new Date(edition.verified_on).toLocaleDateString("en-KE", { dateStyle: "medium" })}
                </p>
              ) : null}
            </div>
          </AboutReveal>

          <div className="grid gap-x-8 gap-y-16 md:grid-cols-2 lg:grid-cols-3">
            {figures.map((figure, index) => (
              <AboutReveal key={`${figure.group.id}-${index}`} className="h-full">
                <FactFigure group={figure.group} items={figure.items} index={index} />
              </AboutReveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-primary px-5 py-12 text-white sm:px-8 lg:px-10" aria-labelledby="context-heading">
        <AboutReveal className="grid w-full gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,.8fr)] lg:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-secondary">Reporting context</p>
            <h2 id="context-heading" className="mt-3 font-[family-name:var(--font-display)] text-3xl font-semibold sm:text-4xl">Facts with clear context</h2>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-white/80">
              {edition.methodology_note || "Figures are published by reporting year and reviewed against the University’s institutional records."}
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            {edition.source_document?.url ? (
              <Link href={edition.source_document.url} className="inline-flex min-h-12 items-center justify-between gap-4 border border-white/30 px-4 py-3 text-sm font-bold transition hover:border-secondary hover:bg-white/10">
                <span className="inline-flex items-center gap-2"><FileText className="h-4 w-4" aria-hidden />{edition.source_document.title || "Source document"}</span><ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            ) : null}
            <Link href="/about/strategic-plan" className="inline-flex min-h-12 items-center justify-between gap-4 border border-white/30 px-4 py-3 text-sm font-bold transition hover:border-secondary hover:bg-white/10">
              Strategy and institutional direction<ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        </AboutReveal>
      </section>
    </main>
  );
}
