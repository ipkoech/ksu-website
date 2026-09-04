import { HeriDashboardClient } from "../heri/heri-dashboard-client";

const modules = [
  ["Content & pages", "Draft, review, schedule, and publish HERI stories.", "/heri/content"],
  ["Research", "Manage themes, projects, publications, and resources.", "/heri/research"],
  ["Team & partners", "Keep leadership, researchers, and partner records current.", "/heri/people"],
  ["Submissions", "Review contact, partnership, and network applications.", "/heri/submissions"],
  ["Media library", "Manage approved images, documents, credits, and alt text.", "/heri/media"],
  ["Site settings", "Update navigation, footer, SEO, and contact details.", "/heri/settings"],
] as const;

export default function HeriPortalPage() {
  return (
    <main className="space-y-5 p-4 md:p-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">HERI Africa portal</p>
        <h1 className="mt-1 text-2xl font-semibold text-slate-900">Research communication and publishing</h1>
        <p className="mt-1 max-w-2xl text-sm text-slate-600">Manage the public platform, research records, partners, and enquiries from one operational workspace.</p>
      </div>
      <HeriDashboardClient />
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {modules.map(([title, description, href]) => (
          <a className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md" href={href} key={href}>
            <h2 className="text-base font-semibold text-slate-900">{title}</h2>
            <p className="mt-1 text-sm leading-5 text-slate-600">{description}</p>
            <span className="mt-3 inline-block text-xs font-semibold text-emerald-700">Open module <span aria-hidden="true">→</span></span>
          </a>
        ))}
      </div>
    </main>
  );
}
