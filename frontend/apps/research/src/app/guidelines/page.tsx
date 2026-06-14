import type { Metadata } from "next";
import Link from "next/link";
import type { ResearchGenericRecord } from "@ksu/api-client";
import { Banknote, ClipboardList, FileText, GraduationCap, LifeBuoy, Wrench } from "lucide-react";
import { ResearchClusterHero } from "../../components/research-cluster";
import { ResearchFact } from "../../components/research-detail";
import { Badge, FilledBadge, ResearchSection, StatusMessage } from "../../components/research-ui";
import { compactText, formatDate, formatLabel, getGrantGuidelines, getGuidelines, getGuidelinesFiltered } from "../../lib/research-public-data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Research Guidelines",
  description: "Research guidelines, grant guidance, policies, and procedures.",
};

type GuidelineParams = { q?: string; type?: string; category?: string; status?: string; year?: string; sort?: string };
const guidelineTypes = ["guideline", "policy", "procedure", "manual", "sop", "template", "checklist"];
const statuses = ["active", "draft", "archived", "superseded"];

const supportLinks = [
  { label: "Funding", href: "/funding", description: "Grant calls, internal funding, and deadlines.", icon: Banknote },
  { label: "Scholarships", href: "/scholarships", description: "Student research funding and fellowship calls.", icon: GraduationCap },
  { label: "Guidelines", href: "/guidelines", description: "Policies, procedures, templates, and grant guidance.", icon: FileText },
  { label: "Forms", href: "/forms", description: "Downloadable forms and research templates.", icon: ClipboardList },
  { label: "Resources", href: "/resources-tools", description: "Tools, platforms, equipment, and access routes.", icon: Wrench },
  { label: "Services", href: "/services", description: "Support services and request pathways.", icon: LifeBuoy },
];

export default async function GuidelinesPage({ searchParams }: { searchParams?: Promise<GuidelineParams> }) {
  const params = (await searchParams) ?? {};
  const [guidelines, allGuidelines, grantGuidelines] = await Promise.all([
    getGuidelinesFiltered({ search: params.q, guidelineType: params.type, category: params.category, status: params.status, year: params.year, sort: params.sort || "effective_date", order: params.sort === "title" ? "asc" : "desc" }),
    getGuidelines(),
    getGrantGuidelines(),
  ]);
  const categories = Array.from(new Set(allGuidelines.data.map((item) => compactText(item.category)).filter(Boolean))).sort();

  return (
    <main id="research-main" className="min-h-screen bg-white">
      <ResearchClusterHero eyebrow="Funding / Support" title="Research guidelines, policies, procedures, and grant guidance." body="Guidelines are presented as controlled documents with version, approval, effective date, review date, mandatory status, and download links." breadcrumbs={[{ label: "Home", href: "/" }, { label: "Funding", href: "/funding" }, { label: "Guidelines" }]} imageSrc="/images/research/research-workflows.png" imageAlt="Research support documents, policy guidance, and application procedures" links={supportLinks} primaryAction={{ label: "Open forms", href: "/forms" }} stats={[{ label: "Guideline results", value: guidelines.data.length }, { label: "Published guidelines", value: allGuidelines.data.length }, { label: "Grant guidance", value: grantGuidelines.data.length }, { label: "Categories", value: categories.length }]} />
      <ResearchSection eyebrow="Document Control" title="Research guidelines" body="Filter by document type, category, status, effective year, and keyword." tone="white">
        <GuidelineFilters params={params} categories={categories} years={getYears(allGuidelines.data)} />
        {[guidelines.error, allGuidelines.error, grantGuidelines.error].filter(Boolean).map((error) => <div key={error} className="mt-5"><StatusMessage tone="error">{error}</StatusMessage></div>)}
        {guidelines.data.length ? <div className="mt-7 divide-y divide-slate-200 rounded-lg border border-slate-200 bg-white shadow-sm">{guidelines.data.map((item) => <GuidelineRow key={item.id} item={item} hrefBase="/guidelines" />)}</div> : <div className="mt-7"><StatusMessage>No guidelines match the current filters.</StatusMessage></div>}
      </ResearchSection>
      <ResearchSection eyebrow="Grant Guidance" title="Funding-specific guidance" body="Grant guideline records remain connected to the grant module and are shown separately from general research policy.">
        <div className="grid gap-5 lg:grid-cols-3">{grantGuidelines.data.map((item) => <GuidelineCard key={item.id} item={item} />)}{grantGuidelines.data.length === 0 ? <StatusMessage>No grant guidance is published yet.</StatusMessage> : null}</div>
      </ResearchSection>
    </main>
  );
}

function GuidelineFilters({ params, categories, years }: { params: GuidelineParams; categories: string[]; years: string[] }) {
  return <form className="rounded-lg border border-slate-200 bg-slate-50 p-4" action="/guidelines"><div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6"><label className="xl:col-span-2"><span className="text-xs font-semibold uppercase text-slate-500">Search</span><input name="q" defaultValue={params.q ?? ""} placeholder="Policy, procedure, code, scope" className="mt-2 h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-primary" /></label><SelectField name="type" label="Type" value={params.type} options={guidelineTypes} /><SelectField name="category" label="Category" value={params.category} options={categories} /><SelectField name="status" label="Status" value={params.status} options={statuses} /><SelectField name="year" label="Year" value={params.year} options={years} /><label><span className="text-xs font-semibold uppercase text-slate-500">Sort</span><select name="sort" defaultValue={params.sort ?? "effective_date"} className="mt-2 h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-primary"><option value="effective_date">Effective date</option><option value="review_date">Review date</option><option value="approval_date">Approval date</option><option value="title">Title</option><option value="created_at">Newest</option></select></label><div className="flex items-end gap-2 md:col-span-2 xl:col-span-6"><button className="inline-flex h-11 items-center justify-center rounded-full bg-primary px-5 text-sm font-semibold text-white transition hover:bg-primary/90">Apply filters</button><Link href="/guidelines" className="inline-flex h-11 items-center justify-center rounded-full border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:border-primary/40 hover:text-primary">Reset</Link></div></div></form>;
}

function GuidelineRow({ item, hrefBase }: { item: ResearchGenericRecord; hrefBase: string }) {
  return <article className="grid gap-4 p-5 lg:grid-cols-[1fr_280px]"><div><div className="flex flex-wrap gap-2"><Badge>{formatLabel(item.guideline_type ?? item.category ?? "guideline")}</Badge>{item.is_mandatory ? <FilledBadge>Mandatory</FilledBadge> : null}{item.status ? <Badge>{formatLabel(item.status)}</Badge> : null}</div><h2 className="mt-4 text-xl font-semibold leading-7 text-slate-950"><Link href={item.slug ? `${hrefBase}/${item.slug}` : hrefBase} className="transition hover:text-primary">{item.title ?? "Research guideline"}</Link></h2><p className="mt-3 text-sm leading-7 text-slate-600">{compactText(item.summary) || compactText(item.scope) || "Guideline summary is not published yet."}</p></div><dl className="grid gap-3 text-sm"><ResearchFact label="Version" value={compactText(item.version)} /><ResearchFact label="Effective" value={formatDate(item.effective_date)} /><ResearchFact label="Review" value={formatDate(item.review_date)} /></dl></article>;
}

function GuidelineCard({ item }: { item: ResearchGenericRecord }) {
  return <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"><Badge>{formatLabel(item.guideline_type ?? "grant guidance")}</Badge><h2 className="mt-4 text-xl font-semibold leading-7 text-slate-950">{item.title ?? "Grant guideline"}</h2><p className="mt-3 text-sm leading-7 text-slate-600">{compactText(item.summary) || compactText(item.description) || "Grant guidance details are not published yet."}</p>{compactText(item.document_url) ? <a href={item.document_url} className="mt-4 inline-flex text-sm font-semibold text-primary">Download document</a> : null}</article>;
}

function SelectField({ name, label, value, options }: { name: string; label: string; value?: string; options: string[] }) {
  return <label><span className="text-xs font-semibold uppercase text-slate-500">{label}</span><select name={name} defaultValue={value ?? ""} className="mt-2 h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-primary"><option value="">All {label.toLowerCase()}</option>{options.map((option) => <option key={option} value={option}>{formatLabel(option)}</option>)}</select></label>;
}

function getYears(records: ResearchGenericRecord[]) {
  return Array.from(new Set(records.flatMap((record) => [record.effective_date, record.review_date, record.approval_date, record.created_at]).map((value) => compactText(value).slice(0, 4)).filter((year) => /^\d{4}$/.test(year)))).sort((a, b) => Number(b) - Number(a));
}
