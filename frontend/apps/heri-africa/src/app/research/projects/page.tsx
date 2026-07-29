import { SiteShell } from "../../../components/site-shell";
import { getProjects } from "../../../lib/api";

export default async function ProjectsPage() { const projects = await getProjects().catch(() => []); return <SiteShell><main className="mx-auto max-w-7xl px-6 py-20"><h1 className="text-5xl font-semibold text-heri-blue">Research projects</h1><div className="mt-12 grid gap-5 md:grid-cols-3">{projects.map((project) => <article className="rounded-3xl bg-white p-7 ring-1 ring-heri-teal/10" key={project.id}><h2 className="text-2xl font-semibold text-heri-blue">{project.title}</h2><p className="mt-3 text-sm leading-7 text-heri-ink/70">{project.summary}</p></article>)}</div></main></SiteShell>; }
