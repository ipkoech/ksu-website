import type { Metadata } from "next";
import Link from "next/link";
import type { ResearchGenericRecord } from "@ksu/api-client";
import { Banknote, ClipboardList, FileText, GraduationCap, LifeBuoy, Wrench } from "lucide-react";
import { ResearchClusterHero } from "../../components/research-cluster";
import { Badge, FilledBadge, ResearchSection, StatusMessage } from "../../components/research-ui";
import { compactText, formatLabel, getCenters, getResources, getResourcesFiltered } from "../../lib/research-public-data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Resources & Tools", description: "Research equipment, tools, templates, platforms, and support resources." };

type ResourceParams = { q?: string; type?: string; access?: string; category?: string; center?: string; status?: string; sort?: string };
const resourceTypes = ["equipment", "software", "dataset", "template", "form", "facility", "platform", "guide"];
const accessTypes = ["internal", "public", "restricted", "bookable", "request"];
const statuses = ["available", "unavailable", "maintenance", "retired", "draft"];

const supportLinks = [
  { label: "Funding", href: "/funding", description: "Grant calls, internal funding, and deadlines.", icon: Banknote },
  { label: "Scholarships", href: "/scholarships", description: "Student research funding and fellowship calls.", icon: GraduationCap },
  { label: "Guidelines", href: "/guidelines", description: "Policies, procedures, templates, and grant guidance.", icon: FileText },
  { label: "Forms", href: "/forms", description: "Downloadable forms and research templates.", icon: ClipboardList },
  { label: "Resources", href: "/resources-tools", description: "Tools, platforms, equipment, and access routes.", icon: Wrench },
  { label: "Services", href: "/services", description: "Support services and request pathways.", icon: LifeBuoy },
];

export default async function ResourcesToolsPage({ searchParams }: { searchParams?: Promise<ResourceParams> }) {
  const params = (await searchParams) ?? {};
  const [resources, allResources, centers] = await Promise.all([
    getResourcesFiltered({ search: params.q, resourceType: params.type, accessType: params.access, category: params.category, centerId: params.center, status: params.status, sort: params.sort || "name", order: params.sort === "created_at" ? "desc" : "asc" }),
    getResources(),
    getCenters(),
  ]);
  const categories = Array.from(new Set(allResources.data.map((item) => compactText(item.category)).filter(Boolean))).sort();
  return (
    <main id="research-main" className="min-h-screen bg-white">
      <ResearchClusterHero eyebrow="Funding / Support" title="Research resources, tools, equipment, and platforms." body="Browse available research equipment, facilities, datasets, forms, software, and bookable tools with access and contact details." breadcrumbs={[{ label: "Home", href: "/" }, { label: "Funding", href: "/funding" }, { label: "Resources & Tools" }]} imageSrc="/images/research/research-hero-imagegen.png" imageAlt="Research tools, platforms, equipment, and support resources" links={supportLinks} primaryAction={{ label: "Open services", href: "/services" }} stats={[{ label: "Resource results", value: resources.data.length }, { label: "Published resources", value: allResources.data.length }, { label: "Centers", value: centers.data.length }, { label: "Categories", value: categories.length }]} />
      <ResearchSection eyebrow="Resource Catalogue" title="Find and access research tools" body="Resource records are filtered by type, access level, category, center, availability, and keyword." tone="white">
        <ResourceFilters params={params} categories={categories} centers={centers.data} />
        {[resources.error, allResources.error, centers.error].filter(Boolean).map((error) => <div key={error} className="mt-5"><StatusMessage tone="error">{error}</StatusMessage></div>)}
        {resources.data.length ? <div className="mt-7 grid gap-5 lg:grid-cols-3">{resources.data.map((item) => <ResourceCard key={item.id} item={item} />)}</div> : <div className="mt-7"><StatusMessage>No resources match the current filters.</StatusMessage></div>}
      </ResearchSection>
    </main>
  );
}

function ResourceFilters({ params, categories, centers }: { params: ResourceParams; categories: string[]; centers: ResearchGenericRecord[] }) {
  return <form className="rounded-lg border border-slate-200 bg-slate-50 p-4" action="/resources-tools"><div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6"><label className="xl:col-span-2"><span className="text-xs font-semibold uppercase text-slate-500">Search</span><input name="q" defaultValue={params.q ?? ""} placeholder="Equipment, tool, facility, capability" className="mt-2 h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-primary" /></label><SelectField name="type" label="Type" value={params.type} options={resourceTypes} /><SelectField name="access" label="Access" value={params.access} options={accessTypes} /><SelectField name="category" label="Category" value={params.category} options={categories} /><SelectField name="status" label="Status" value={params.status} options={statuses} /><label className="md:col-span-2 xl:col-span-3"><span className="text-xs font-semibold uppercase text-slate-500">Center</span><select name="center" defaultValue={params.center ?? ""} className="mt-2 h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-primary"><option value="">All centers</option>{centers.map((center) => <option key={center.id} value={center.id}>{center.name ?? center.title ?? center.code ?? center.id}</option>)}</select></label><label><span className="text-xs font-semibold uppercase text-slate-500">Sort</span><select name="sort" defaultValue={params.sort ?? "name"} className="mt-2 h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-primary"><option value="name">Name</option><option value="created_at">Newest</option><option value="status">Availability</option></select></label><div className="flex items-end gap-2 md:col-span-2"><button className="inline-flex h-11 items-center justify-center rounded-full bg-primary px-5 text-sm font-semibold text-white transition hover:bg-primary/90">Apply filters</button><Link href="/resources-tools" className="inline-flex h-11 items-center justify-center rounded-full border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:border-primary/40 hover:text-primary">Reset</Link></div></div></form>;
}

function ResourceCard({ item }: { item: ResearchGenericRecord }) {
  return <article className="flex min-h-[340px] flex-col rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:border-primary/30 hover:shadow-[0_22px_60px_-42px_rgba(15,23,42,0.45)]"><div className="flex flex-wrap gap-2"><Badge>{formatLabel(item.resource_type ?? "resource")}</Badge>{item.is_featured ? <FilledBadge>Featured</FilledBadge> : null}{item.status ? <Badge>{formatLabel(item.status)}</Badge> : null}</div><h2 className="mt-4 text-xl font-semibold leading-7 text-slate-950"><Link href={item.slug ? `/resources-tools/${item.slug}` : "/resources-tools"} className="transition hover:text-primary">{item.name ?? "Research resource"}</Link></h2><p className="mt-3 text-sm leading-7 text-slate-600">{compactText(item.description) || compactText(item.capabilities) || "Resource details are not published yet."}</p><dl className="mt-auto grid grid-cols-2 gap-3 pt-5 text-sm"><Fact label="Access" value={formatLabel(item.access_type)} /><Fact label="Location" value={[item.location, item.room].map(compactText).filter(Boolean).join(" · ")} /></dl></article>;
}

function SelectField({ name, label, value, options }: { name: string; label: string; value?: string; options: string[] }) {
  return <label><span className="text-xs font-semibold uppercase text-slate-500">{label}</span><select name={name} defaultValue={value ?? ""} className="mt-2 h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-primary"><option value="">All {label.toLowerCase()}</option>{options.map((option) => <option key={option} value={option}>{formatLabel(option)}</option>)}</select></label>;
}

function Fact({ label, value }: { label: string; value: string }) {
  return <div className="rounded-md bg-slate-50 p-3"><dt className="text-xs font-semibold uppercase text-slate-500">{label}</dt><dd className="mt-1 break-words font-semibold text-slate-950">{value || "Not published"}</dd></div>;
}
