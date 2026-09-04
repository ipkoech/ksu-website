import type { Metadata } from "next";
import Image from "next/image";
import { Reveal, RevealItem } from "../../components/motion/reveal";
import { SiteShell } from "../../components/site-shell";
import { getProjects, getPublications, getResearchThemes } from "../../lib/api";
import { withBasePath } from "../../lib/base-path";

export const metadata: Metadata = {
  title: "Research",
  description: "Language education research themes, projects and publications from the HERI Africa Research Chair.",
};

export default async function ResearchPage() {
  const [themes, projects, publications] = await Promise.all([
    getResearchThemes().catch(() => []),
    getProjects().catch(() => []),
    getPublications().catch(() => []),
  ]);
  return (
    <SiteShell>
      <main className="bg-white">
        <section className="relative overflow-hidden bg-heri-ink text-white">
          <div className="absolute inset-0 bg-[linear-gradient(115deg,#003c39,#006b62_54%,#07302d)]" />
          <div className="relative mx-auto grid min-h-[360px] max-w-7xl items-center gap-8 px-6 py-16 lg:grid-cols-[.9fr_1.1fr] lg:px-10">
            <Reveal><p className="text-xs font-bold uppercase tracking-[.2em] text-heri-lime">Evidence and learning</p><h1 className="mt-4 text-5xl font-bold leading-tight sm:text-6xl">Research for language education impact.</h1><p className="mt-5 max-w-xl text-base leading-7 text-white/80">Explore the themes, projects and publications of the HERI Africa Language Education Research Chair.</p></Reveal>
            <div className="relative hidden h-64 overflow-hidden rounded-t-[5rem] rounded-bl-[5rem] lg:block"><Image src={withBasePath("/images/research/research-header.jpg")} alt="Language education researchers collaborating" fill sizes="55vw" className="object-cover" /></div>
          </div>
        </section>
        <section className="mx-auto max-w-7xl px-6 py-16 lg:px-10"><Reveal><p className="text-xs font-bold uppercase tracking-[.2em] text-heri-teal">Our focus</p><h2 className="mt-3 text-4xl font-bold text-heri-blue">Research themes</h2></Reveal><div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{themes.map((theme, index) => <RevealItem key={theme.id} index={index}><article className="h-full rounded-2xl border border-slate-200 p-6"><h3 className="text-xl font-bold text-heri-blue">{theme.title}</h3><p className="mt-3 text-sm leading-6 text-slate-600">{theme.summary}</p></article></RevealItem>)}</div><Reveal className="mt-16"><h2 className="text-4xl font-bold text-heri-blue">Projects and publications</h2></Reveal><div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">{[...projects, ...publications].map((item, index) => <RevealItem key={item.id} index={index}><article className="h-full rounded-2xl bg-heri-cream/60 p-6"><p className="text-xs font-bold uppercase tracking-[.16em] text-heri-teal">{projects.some((project) => project.id === item.id) ? "Research project" : "Publication"}</p><h3 className="mt-3 text-xl font-bold text-heri-blue">{item.title}</h3><p className="mt-3 text-sm leading-6 text-slate-600">{item.summary}</p></article></RevealItem>)}</div></section>
      </main>
    </SiteShell>
  );
}
