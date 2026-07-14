import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { PublicImage } from "@/components/public/public-image";
import type { PublicFactItem, PublicFactsData } from "@/lib/public-about-data";

const fallbackImages = [
  "/images/backgrounds/KSUGreenLandscapingMay2026-3885.jpg",
  "/images/backgrounds/KSUGreenLandscapingMay2026-3810.jpg",
  "/images/backgrounds/KSUGreenLandscapingMay2026-7456.jpg",
];

function factValue(item: PublicFactItem) {
  return `${item.prefix || ""}${item.display_value}${item.suffix || ""}${item.unit ? ` ${item.unit}` : ""}`;
}

export function NumbersFactsPage({ data }: { data: PublicFactsData }) {
  const edition = data.edition;

  return (
    <main className="bg-white">
      <header className="border-b border-slate-200 bg-[#f6f4ef] px-5 py-6 sm:px-8 lg:px-10">
        <nav aria-label="Breadcrumb" className="text-sm text-slate-600">
          <Link href="/" className="font-semibold text-primary hover:underline">Home</Link>
          <span className="mx-2" aria-hidden>/</span>
          <Link href="/about" className="font-semibold text-primary hover:underline">About KSU</Link>
          <span className="mx-2" aria-hidden>/</span>
          <span>Numbers &amp; Facts</span>
        </nav>
      </header>

      {data.available_years.length > 1 ? (
        <nav className="flex gap-3 overflow-x-auto border-b border-slate-200 px-5 py-4 sm:px-8 lg:px-10" aria-label="Facts by reporting year">
          {data.available_years.map((year) => (
            <Link
              key={year}
              href={year === data.available_years[0] ? "/about/numbers-and-facts" : `/about/numbers-and-facts?year=${year}`}
              aria-current={year === edition.reporting_year ? "page" : undefined}
              className={`shrink-0 px-4 py-2 text-sm font-bold ${year === edition.reporting_year ? "bg-primary text-white" : "border border-slate-300 text-slate-700"}`}
            >
              {year}
            </Link>
          ))}
        </nav>
      ) : null}

      <section className="px-5 py-12 sm:px-8 lg:px-10 lg:py-16" aria-labelledby="facts-heading">
        <div className="mb-8 grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
          <div>
            <h1 id="facts-heading" className="font-[family-name:var(--font-display)] text-4xl font-semibold leading-tight text-primary sm:text-5xl">
              {edition.title}
            </h1>
            {edition.introduction ? <p className="mt-4 max-w-4xl text-lg leading-8 text-slate-700">{edition.introduction}</p> : null}
          </div>
          {edition.verified_on ? (
            <p className="flex items-center gap-2 text-sm text-slate-600">
              <CheckCircle2 className="h-4 w-4 text-primary" aria-hidden />
              Verified {new Date(edition.verified_on).toLocaleDateString("en-KE", { dateStyle: "medium" })}
            </p>
          ) : null}
        </div>

        <div className="grid gap-x-8 gap-y-14 [grid-template-columns:repeat(auto-fit,minmax(min(100%,24rem),1fr))]">
          {data.groups.map((group, index) => (
            <article key={group.id}>
              <PublicImage
                src={group.image?.url || fallbackImages[index % fallbackImages.length]}
                alt={group.image?.alt || group.image_alt_text || group.heading}
                ratio="news"
                sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                unoptimized
              />
              <h3 className="mt-5 font-[family-name:var(--font-display)] text-xl font-semibold text-primary">{group.heading}</h3>
              {group.summary ? <p className="mt-2 text-sm leading-6 text-slate-600">{group.summary}</p> : null}
              <ul className="mt-4 list-square space-y-3 pl-5 marker:text-primary">
                {group.items.map((item) => (
                  <li key={item.id} className="pl-1 text-base leading-7 text-slate-900">
                    <span className="font-semibold">{item.label}:</span>{" "}{factValue(item)}
                    {item.explanation ? <span className="mt-1 block text-sm text-slate-600">{item.explanation}</span> : null}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>

        {edition.methodology_note ? <p className="mt-14 border-t border-slate-200 pt-5 text-sm leading-6 text-slate-600">{edition.methodology_note}</p> : null}
      </section>
    </main>
  );
}
