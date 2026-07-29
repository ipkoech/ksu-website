import Link from "next/link";
import { SiteShell } from "../../components/site-shell";

export default function ResearchPage() {
  return <SiteShell><main className="mx-auto max-w-7xl px-6 py-20"><p className="text-sm font-semibold uppercase tracking-[0.16em] text-heri-teal">Research & Insights</p><h1 className="mt-4 max-w-3xl text-5xl font-semibold text-heri-blue">Evidence that shapes better language education.</h1><div className="mt-12 grid gap-5 md:grid-cols-3">{[["Themes", "/research/themes", "Explore the questions guiding our work."], ["Projects", "/research/projects", "See research in action across Africa."], ["Publications", "/research/publications", "Read the evidence and recommendations."]].map(([title, href, description]) => <Link className="rounded-3xl bg-white p-7 ring-1 ring-heri-teal/10 transition-shadow hover:shadow-lg" href={href} key={href}><h2 className="text-2xl font-semibold text-heri-blue">{title}</h2><p className="mt-3 text-sm leading-7 text-heri-ink/70">{description}</p><span className="mt-6 inline-block text-sm font-semibold text-heri-teal">Explore <span aria-hidden="true">→</span></span></Link>)}</div></main></SiteShell>;
}
