import Link from "next/link";
import {
  ArrowRight,
  Award,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  FileText,
  Landmark,
  MapPin,
  School,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { PublicFactsData } from "@/lib/public-about-data";

const iconMap: Record<string, LucideIcon> = {
  award: Award,
  calendar: CalendarDays,
  landmark: Landmark,
  "map-pin": MapPin,
  school: School,
  "book-open": BookOpen,
};

export function NumbersFactsPage({ data }: { data: PublicFactsData }) {
  const edition = data.edition;
  return (
    <div className="bg-[#fbfaf6]">
      <section className="relative overflow-hidden bg-primary px-5 py-16 text-white sm:px-8 lg:px-10 lg:py-24">
        <div aria-hidden className="absolute inset-0 bg-[radial-gradient(circle_at_85%_30%,rgba(245,158,11,.23),transparent_35%)]" />
        <div className="relative mx-auto max-w-7xl">
          <nav aria-label="Breadcrumb" className="text-sm text-white/70"><Link href="/" className="hover:text-white">Home</Link><span className="mx-2">/</span><Link href="/about" className="hover:text-white">About KSU</Link><span className="mx-2">/</span><span>Numbers & Facts</span></nav>
          <div className="mt-14 grid gap-10 lg:grid-cols-[1fr_auto] lg:items-end">
            <div className="max-w-4xl"><p className="text-xs font-bold uppercase tracking-[0.22em] text-secondary">Institutional profile</p><h1 className="mt-4 font-[family-name:var(--font-display)] text-5xl font-semibold leading-tight sm:text-6xl">{edition.title}</h1><p className="mt-6 max-w-3xl text-lg leading-8 text-white/80">{edition.introduction || "Verified facts about Kisii University, published with clear reporting context."}</p></div>
            <div className="rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur"><p className="text-xs font-bold uppercase tracking-wider text-white/60">Reporting year</p><p className="mt-2 font-[family-name:var(--font-display)] text-4xl font-semibold text-secondary">{edition.reporting_year}</p>{edition.verified_on ? <p className="mt-2 flex items-center gap-2 text-xs text-white/70"><CheckCircle2 className="h-4 w-4" aria-hidden /> Verified {new Date(edition.verified_on).toLocaleDateString("en-KE", { dateStyle: "medium" })}</p> : null}</div>
          </div>
        </div>
      </section>

      {data.available_years.length ? <section className="border-b border-slate-200 bg-white px-5 py-4 sm:px-8 lg:px-10"><div className="mx-auto flex max-w-7xl items-center gap-3 overflow-x-auto"><span className="shrink-0 text-xs font-bold uppercase tracking-wider text-slate-500">View year</span>{data.available_years.map((year) => <Link key={year} href={year === data.available_years[0] ? "/about/numbers-and-facts" : `/about/numbers-and-facts?year=${year}`} aria-current={year === edition.reporting_year ? "page" : undefined} className={`shrink-0 rounded-full px-4 py-2 text-sm font-bold ${year === edition.reporting_year ? "bg-primary text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`}>{year}</Link>)}</div></section> : null}

      <div className="mx-auto max-w-7xl space-y-16 px-5 py-16 sm:px-8 lg:px-10 lg:py-20">
        {data.groups.map((group, groupIndex) => (
          <section key={group.id} aria-labelledby={`facts-${group.slug}`}>
            <div className="grid gap-6 border-b border-primary/15 pb-6 md:grid-cols-[5rem_1fr]"><p className="font-[family-name:var(--font-display)] text-5xl text-secondary/60">{String(groupIndex + 1).padStart(2, "0")}</p><div><h2 id={`facts-${group.slug}`} className="font-[family-name:var(--font-display)] text-3xl font-semibold text-primary sm:text-4xl">{group.heading}</h2>{group.summary ? <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">{group.summary}</p> : null}</div></div>
            <div className="mt-7 grid gap-px overflow-hidden rounded-2xl border border-slate-200 bg-slate-200 sm:grid-cols-2 lg:grid-cols-3">
              {group.items.map((item) => { const Icon = iconMap[item.icon_key || ""] || FileText; return <article key={item.id} className="min-h-52 bg-white p-7"><Icon className="h-7 w-7 text-primary" aria-hidden /><p className="mt-8 text-xs font-bold uppercase tracking-[0.16em] text-slate-500">{item.label}</p><p className="mt-2 font-[family-name:var(--font-display)] text-3xl font-semibold leading-tight text-slate-950">{item.prefix}{item.display_value}{item.suffix} {item.unit}</p>{item.explanation ? <p className="mt-4 text-sm leading-6 text-slate-600">{item.explanation}</p> : null}{item.source_title ? <p className="mt-5 border-t border-slate-100 pt-4 text-xs leading-5 text-slate-500">Source: {item.source_url ? <Link href={item.source_url} className="font-semibold text-primary hover:underline">{item.source_title}</Link> : item.source_title}</p> : null}{item.link_url ? <Link href={item.link_url} className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline">{item.link_label || "Learn more"}<ArrowRight className="h-4 w-4" /></Link> : null}</article>; })}
            </div>
          </section>
        ))}

        {edition.methodology_note ? <aside className="rounded-2xl border border-primary/15 bg-white p-7"><p className="text-xs font-bold uppercase tracking-[0.18em] text-secondary">How to read these facts</p><p className="mt-3 max-w-4xl text-sm leading-7 text-slate-600">{edition.methodology_note}</p></aside> : null}
      </div>
    </div>
  );
}

