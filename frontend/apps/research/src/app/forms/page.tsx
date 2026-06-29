import type { Metadata } from "next";
import Link from "next/link";
import type { ResearchGenericRecord } from "@ksu/api-client";
import { Banknote, ClipboardList, FileText, GraduationCap, LifeBuoy, Wrench } from "lucide-react";
import { ResearchClusterHero } from "../../components/research-cluster";
import { ResearchFilterForm } from "../../components/research-listing";
import { Badge, ResearchSection, StatusMessage } from "../../components/research-ui";
import { compactText, formatDate, formatLabel, getGuidelinesFiltered, getResourcesFiltered } from "../../lib/research-public-data";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Forms & Templates",
  description: "Research forms, templates, and practical resource documents.",
};

type FormsParams = { q?: string; category?: string };

const supportLinks = [
  { label: "Funding", href: "/funding", description: "Grant calls, internal funding, and deadlines.", icon: Banknote },
  { label: "Scholarships", href: "/scholarships", description: "Student research funding and fellowship calls.", icon: GraduationCap },
  { label: "Guidelines", href: "/guidelines", description: "Policies, procedures, templates, and grant guidance.", icon: FileText },
  { label: "Forms", href: "/forms", description: "Downloadable forms and research templates.", icon: ClipboardList },
  { label: "Resources", href: "/resources-tools", description: "Tools, platforms, equipment, and access routes.", icon: Wrench },
  { label: "Services", href: "/services", description: "Support services and request pathways.", icon: LifeBuoy },
];

export default async function FormsPage({ searchParams }: { searchParams?: Promise<FormsParams> }) {
  const params = (await searchParams) ?? {};
  const [forms, templates, guidance] = await Promise.all([
    getResourcesFiltered({ search: params.q, resourceType: "form", category: params.category, sort: "name", order: "asc" }),
    getResourcesFiltered({ search: params.q, resourceType: "template", category: params.category, sort: "name", order: "asc" }),
    getGuidelinesFiltered({ search: params.q, guidelineType: "template", category: params.category, sort: "effective_date", order: "desc" }),
  ]);
  return (
    <main id="research-main" className="min-h-screen bg-white">
      <ResearchClusterHero eyebrow="Funding / Support" title="Forms, templates, and practical research resources." body="Forms and templates are grouped with direct links to access or download published files." breadcrumbs={[{ label: "Home", href: "/" }, { label: "Funding", href: "/funding" }, { label: "Forms" }]} imageSrc="/images/research/research-events-hero.svg" imageAlt="Research forms, templates, and support documents for application workflows" links={supportLinks} primaryAction={{ label: "Open resources", href: "/resources-tools" }} stats={[{ label: "Forms", value: forms.data.length }, { label: "Templates", value: templates.data.length }, { label: "Related guidance", value: guidance.data.length }, { label: "Support routes", value: supportLinks.length }]} />
      <ResearchSection eyebrow="Forms Library" title="Downloadable forms and templates" body="Use keyword and category filters to narrow form and template resources." tone="white">
        <ResearchFilterForm
          action="/forms"
          resetHref="/forms"
          searchValue={params.q}
          searchPlaceholder="Form, template, category"
          textFilters={[
            { name: "category", label: "Category", value: params.category, placeholder: "Category" },
          ]}
        />
        {[forms.error, templates.error, guidance.error].filter(Boolean).map((error) => <div key={error} className="mt-5"><StatusMessage tone="error">{error}</StatusMessage></div>)}
        <div className="mt-7 grid gap-5 lg:grid-cols-3"><ResourceColumn title="Forms" records={forms.data} /><ResourceColumn title="Templates" records={templates.data} /><ResourceColumn title="Related guidance" records={guidance.data} /></div>
      </ResearchSection>
    </main>
  );
}

function ResourceColumn({ title, records }: { title: string; records: ResearchGenericRecord[] }) {
  return <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"><h2 className="text-xl font-semibold text-slate-950">{title}</h2><div className="mt-4 divide-y divide-slate-200">{records.map((record) => <article key={record.id} className="py-4 first:pt-0 last:pb-0"><Badge>{formatLabel(record.resource_type ?? record.guideline_type ?? record.category ?? "document")}</Badge><h3 className="mt-3 text-base font-semibold leading-6 text-slate-950">{record.name ?? record.title}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{compactText(record.description) || compactText(record.summary) || compactText(record.scope) || "Document details are not published yet."}</p><p className="mt-2 text-xs font-semibold uppercase text-slate-500">{formatDate(record.effective_date) || formatLabel(record.status)}</p>{record.slug ? <Link href={record.resource_type ? `/resources-tools/${record.slug}` : `/guidelines/${record.slug}`} className="mt-3 inline-flex text-sm font-semibold text-primary">Open details</Link> : null}</article>)}{records.length === 0 ? <p className="py-4 text-sm text-slate-600">No records are published yet.</p> : null}</div></section>;
}
