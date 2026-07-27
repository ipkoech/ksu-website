import Link from "next/link";
import { HeriDashboardClient } from "./heri-dashboard-client";

const modules = [
  ["Content & pages", "Draft, review, schedule, and publish HERI stories.", "/heri/content"],
  ["Research", "Manage themes, projects, publications, and resources.", "/heri/research"],
  ["Team & partners", "Keep leadership, researchers, and partner records current.", "/heri/people"],
  ["Submissions", "Review contact, partnership, and network applications.", "/heri/submissions"],
  ["Media library", "Manage approved images, documents, credits, and alt text.", "/heri/media"],
  ["Site settings", "Update navigation, footer, SEO, and contact details.", "/heri/settings"],
] as const;

export default function HeriWorkspacePage() {
  return <main className="space-y-8 p-6 md:p-10"><div><p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-700">HERI Africa workspace</p><h1 className="mt-2 text-3xl font-semibold text-slate-900">Research communication and publishing</h1><p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">Manage the HERI Africa public platform, publishing workflow, research records, partners, and enquiries from one operational workspace.</p></div><HeriDashboardClient /><div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{modules.map(([title, description, href]) => <Link className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md" href={href} key={href}><h2 className="text-lg font-semibold text-slate-900">{title}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{description}</p><span className="mt-5 inline-block text-sm font-semibold text-emerald-700">Open module <span aria-hidden="true">→</span></span></Link>)}</div></main>;
}
