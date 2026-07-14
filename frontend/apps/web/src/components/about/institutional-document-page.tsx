import Link from "next/link";
import { ArrowRight, CheckCircle2, Download, FileText, ShieldCheck } from "lucide-react";

export type InstitutionalResource = {
  id: string;
  title: string;
  description?: string | null;
  href: string;
};

export function InstitutionalDocumentPage({
  eyebrow,
  title,
  introduction,
  heroImage,
  sectionTitle,
  points,
  resources,
}: {
  eyebrow: string;
  title: string;
  introduction: string;
  heroImage: string;
  sectionTitle: string;
  points: Array<{ title: string; body: string }>;
  resources: InstitutionalResource[];
}) {
  return (
    <div className="bg-[#fbfaf6]">
      <section className="relative isolate overflow-hidden bg-primary px-5 py-16 text-white sm:px-8 lg:px-10 lg:py-24">
        <div aria-hidden className="absolute inset-0 bg-cover bg-center opacity-40" style={{ backgroundImage: `url('${heroImage}')` }} />
        <div aria-hidden className="absolute inset-0 bg-gradient-to-r from-primary via-primary/90 to-primary/35" />
        <div className="relative mx-auto max-w-7xl">
          <nav aria-label="Breadcrumb" className="text-sm text-white/70"><Link href="/" className="hover:text-white">Home</Link><span className="mx-2">/</span><Link href="/about" className="hover:text-white">About KSU</Link><span className="mx-2">/</span><span>{eyebrow}</span></nav>
          <div className="mt-16 max-w-4xl"><p className="text-xs font-bold uppercase tracking-[0.22em] text-secondary">{eyebrow}</p><h1 className="mt-4 font-[family-name:var(--font-display)] text-5xl font-semibold leading-tight sm:text-6xl">{title}</h1><p className="mt-6 max-w-3xl text-lg leading-8 text-white/85">{introduction}</p></div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-12 px-5 py-16 sm:px-8 lg:grid-cols-[.8fr_1.2fr] lg:px-10 lg:py-20">
        <div><p className="text-xs font-bold uppercase tracking-[0.2em] text-secondary">Our commitment</p><h2 className="mt-3 font-[family-name:var(--font-display)] text-4xl font-semibold leading-tight text-primary">{sectionTitle}</h2><p className="mt-5 text-sm leading-7 text-slate-600">These commitments are maintained through the University’s published information and institutional documents.</p></div>
        <div className="grid gap-4 sm:grid-cols-2">{points.map((point) => <article key={point.title} className="rounded-2xl border border-primary/10 bg-white p-6 shadow-sm"><CheckCircle2 className="h-6 w-6 text-secondary" aria-hidden /><h3 className="mt-5 text-lg font-bold text-slate-950">{point.title}</h3><p className="mt-3 text-sm leading-7 text-slate-600">{point.body}</p></article>)}</div>
      </section>

      <section className="border-t border-primary/10 bg-white px-5 py-16 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-7xl"><div className="flex items-center gap-4"><span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-secondary"><ShieldCheck className="h-6 w-6" aria-hidden /></span><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-secondary">Published resources</p><h2 className="mt-1 font-[family-name:var(--font-display)] text-3xl font-semibold text-primary">Official documents</h2></div></div>
          {resources.length ? <div className="mt-8 grid gap-4 md:grid-cols-2">{resources.map((resource) => <article key={resource.id} className="flex gap-4 rounded-2xl border border-slate-200 p-6"><FileText className="h-7 w-7 shrink-0 text-primary" aria-hidden /><div className="min-w-0"><h3 className="font-bold text-slate-950">{resource.title}</h3>{resource.description ? <p className="mt-2 text-sm leading-6 text-slate-600">{resource.description}</p> : null}<Link href={resource.href} className="mt-4 inline-flex min-h-11 items-center gap-2 text-sm font-bold text-primary hover:underline"><Download className="h-4 w-4" aria-hidden /> Download document</Link></div></article>)}</div> : <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-[#fbfaf6] p-8 text-sm text-slate-600">No public document has been attached yet. The institutional summary above remains the current published reference.</div>}
          <Link href="/about/numbers-and-facts" className="mt-8 inline-flex min-h-11 items-center gap-2 font-bold text-primary hover:underline">Explore KSU Numbers & Facts <ArrowRight className="h-4 w-4" aria-hidden /></Link>
        </div>
      </section>
    </div>
  );
}

