import type { Metadata } from "next";
import Link from "next/link";
import type { ResearchGenericRecord } from "@ksu/api-client";
import { Badge, ResearchPageIntro, ResearchSection, StatusMessage } from "../../components/research-ui";
import { compactText, formatDate, formatLabel, getGuidelinesFiltered, getResourcesFiltered } from "../../lib/research-public-data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Forms & Templates",
  description: "Research forms, templates, and practical resource documents.",
};

type FormsParams = { q?: string; category?: string };

export default async function FormsPage({ searchParams }: { searchParams?: Promise<FormsParams> }) {
  const params = (await searchParams) ?? {};
  const [forms, templates, guidance] = await Promise.all([
    getResourcesFiltered({ search: params.q, resourceType: "form", category: params.category, sort: "name", order: "asc" }),
    getResourcesFiltered({ search: params.q, resourceType: "template", category: params.category, sort: "name", order: "asc" }),
    getGuidelinesFiltered({ search: params.q, guidelineType: "template", category: params.category, sort: "effective_date", order: "desc" }),
  ]);
  return (
    <main id="research-main" className="min-h-screen bg-white">
      <ResearchPageIntro eyebrow="Funding / Support" title="Forms, templates, and practical research resources." body="Forms and templates are pulled from the resource and guideline modules, with direct links to access or download the published files." breadcrumbs={[{ label: "Home", href: "/" }, { label: "Funding", href: "/funding" }, { label: "Forms" }]} />
      <ResearchSection eyebrow="Forms Library" title="Downloadable forms and templates" body="Use keyword and category filters to narrow backend-backed form and template resources." tone="white">
        <form className="rounded-lg border border-slate-200 bg-slate-50 p-4" action="/forms"><div className="grid gap-3 md:grid-cols-[1fr_260px_auto_auto]"><label><span className="text-xs font-semibold uppercase text-slate-500">Search</span><input name="q" defaultValue={params.q ?? ""} placeholder="Form, template, category" className="mt-2 h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-primary" /></label><label><span className="text-xs font-semibold uppercase text-slate-500">Category</span><input name="category" defaultValue={params.category ?? ""} placeholder="Category" className="mt-2 h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-primary" /></label><button className="mt-6 inline-flex h-11 items-center justify-center rounded-full bg-primary px-5 text-sm font-semibold text-white transition hover:bg-primary/90">Apply</button><Link href="/forms" className="mt-6 inline-flex h-11 items-center justify-center rounded-full border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:border-primary/40 hover:text-primary">Reset</Link></div></form>
        {[forms.error, templates.error, guidance.error].filter(Boolean).map((error) => <div key={error} className="mt-5"><StatusMessage tone="error">{error}</StatusMessage></div>)}
        <div className="mt-7 grid gap-5 lg:grid-cols-3"><ResourceColumn title="Forms" records={forms.data} /><ResourceColumn title="Templates" records={templates.data} /><ResourceColumn title="Related guidance" records={guidance.data} /></div>
      </ResearchSection>
    </main>
  );
}

function ResourceColumn({ title, records }: { title: string; records: ResearchGenericRecord[] }) {
  return <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"><h2 className="text-xl font-semibold text-slate-950">{title}</h2><div className="mt-4 divide-y divide-slate-200">{records.map((record) => <article key={record.id} className="py-4 first:pt-0 last:pb-0"><Badge>{formatLabel(record.resource_type ?? record.guideline_type ?? record.category ?? "document")}</Badge><h3 className="mt-3 text-base font-semibold leading-6 text-slate-950">{record.name ?? record.title}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{compactText(record.description) || compactText(record.summary) || compactText(record.scope) || "Document details are not published yet."}</p><p className="mt-2 text-xs font-semibold uppercase text-slate-500">{formatDate(record.effective_date) || formatLabel(record.status)}</p>{record.slug ? <Link href={record.resource_type ? `/resources-tools/${record.slug}` : `/guidelines/${record.slug}`} className="mt-3 inline-flex text-sm font-semibold text-primary">Open details</Link> : null}</article>)}{records.length === 0 ? <p className="py-4 text-sm text-slate-600">No records are published yet.</p> : null}</div></section>;
}
