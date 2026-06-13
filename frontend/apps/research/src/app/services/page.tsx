import type { Metadata } from "next";
import Link from "next/link";
import type { ResearchGenericRecord } from "@ksu/api-client";
import { Banknote, ClipboardList, FileText, GraduationCap, LifeBuoy, Wrench } from "lucide-react";
import { ResearchClusterHero } from "../../components/research-cluster";
import { Badge, FilledBadge, ResearchSection, StatusMessage } from "../../components/research-ui";
import { compactText, formatLabel, getCenters, getServices, getServicesFiltered } from "../../lib/research-public-data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Research Services", description: "Research support services available through Kisii University." };

type ServiceParams = { q?: string; type?: string; category?: string; center?: string; sort?: string };
const serviceTypes = ["support", "consultation", "ethics", "data", "proposal", "training", "commercialization", "partnership"];

const supportLinks = [
  { label: "Funding", href: "/funding", description: "Grant calls, internal funding, and deadlines.", icon: Banknote },
  { label: "Scholarships", href: "/scholarships", description: "Student research funding and fellowship calls.", icon: GraduationCap },
  { label: "Guidelines", href: "/guidelines", description: "Policies, procedures, templates, and grant guidance.", icon: FileText },
  { label: "Forms", href: "/forms", description: "Downloadable forms and research templates.", icon: ClipboardList },
  { label: "Resources", href: "/resources-tools", description: "Tools, platforms, equipment, and access routes.", icon: Wrench },
  { label: "Services", href: "/services", description: "Support services and request pathways.", icon: LifeBuoy },
];

export default async function ServicesPage({ searchParams }: { searchParams?: Promise<ServiceParams> }) {
  const params = (await searchParams) ?? {};
  const [services, allServices, centers] = await Promise.all([
    getServicesFiltered({ search: params.q, serviceType: params.type, category: params.category, centerId: params.center, sort: params.sort || "name", order: params.sort === "created_at" ? "desc" : "asc" }),
    getServices(),
    getCenters(),
  ]);
  const categories = Array.from(new Set(allServices.data.map((item) => compactText(item.category)).filter(Boolean))).sort();
  return (
    <main id="research-main" className="min-h-screen bg-white">
      <ResearchClusterHero eyebrow="Funding / Support" title="Research support services." body="Find services for researchers, students, partners, and public engagement, with process, eligibility, turnaround, deliverables, fees, and request links." breadcrumbs={[{ label: "Home", href: "/" }, { label: "Funding", href: "/funding" }, { label: "Services" }]} imageSrc="/images/research/registrar-reirm-imagegen.png" imageAlt="Research office service desk supporting researchers and partners" links={supportLinks} primaryAction={{ label: "Contact support", href: "/connect" }} stats={[{ label: "Service results", value: services.data.length }, { label: "Published services", value: allServices.data.length }, { label: "Centers", value: centers.data.length }, { label: "Categories", value: categories.length }]} />
      <ResearchSection eyebrow="Service Catalogue" title="Available research services" body="Filter backend-backed services by type, category, center, and keyword." tone="white">
        <ServiceFilters params={params} categories={categories} centers={centers.data} />
        {[services.error, allServices.error, centers.error].filter(Boolean).map((error) => <div key={error} className="mt-5"><StatusMessage tone="error">{error}</StatusMessage></div>)}
        {services.data.length ? <div className="mt-7 grid gap-5 lg:grid-cols-3">{services.data.map((item) => <ServiceCard key={item.id} item={item} />)}</div> : <div className="mt-7"><StatusMessage>No services match the current filters.</StatusMessage></div>}
      </ResearchSection>
    </main>
  );
}

function ServiceFilters({ params, categories, centers }: { params: ServiceParams; categories: string[]; centers: ResearchGenericRecord[] }) {
  return <form className="rounded-lg border border-slate-200 bg-slate-50 p-4" action="/services"><div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6"><label className="xl:col-span-2"><span className="text-xs font-semibold uppercase text-slate-500">Search</span><input name="q" defaultValue={params.q ?? ""} placeholder="Service, process, deliverable" className="mt-2 h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-primary" /></label><SelectField name="type" label="Type" value={params.type} options={serviceTypes} /><SelectField name="category" label="Category" value={params.category} options={categories} /><label className="md:col-span-2 xl:col-span-2"><span className="text-xs font-semibold uppercase text-slate-500">Center</span><select name="center" defaultValue={params.center ?? ""} className="mt-2 h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-primary"><option value="">All centers</option>{centers.map((center) => <option key={center.id} value={center.id}>{center.name ?? center.title ?? center.code ?? center.id}</option>)}</select></label><label><span className="text-xs font-semibold uppercase text-slate-500">Sort</span><select name="sort" defaultValue={params.sort ?? "name"} className="mt-2 h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-primary"><option value="name">Name</option><option value="created_at">Newest</option><option value="turnaround_time">Turnaround</option></select></label><div className="flex items-end gap-2 md:col-span-2 xl:col-span-6"><button className="inline-flex h-11 items-center justify-center rounded-full bg-primary px-5 text-sm font-semibold text-white transition hover:bg-primary/90">Apply filters</button><Link href="/services" className="inline-flex h-11 items-center justify-center rounded-full border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:border-primary/40 hover:text-primary">Reset</Link></div></div></form>;
}

function ServiceCard({ item }: { item: ResearchGenericRecord }) {
  return <article className="flex min-h-[340px] flex-col rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:border-primary/30 hover:shadow-[0_22px_60px_-42px_rgba(15,23,42,0.45)]"><div className="flex flex-wrap gap-2"><Badge>{formatLabel(item.service_type ?? "service")}</Badge>{item.is_free ? <FilledBadge>Free</FilledBadge> : null}{item.category ? <Badge>{formatLabel(item.category)}</Badge> : null}</div><h2 className="mt-4 text-xl font-semibold leading-7 text-slate-950"><Link href={item.slug ? `/services/${item.slug}` : "/services"} className="transition hover:text-primary">{item.name ?? "Research service"}</Link></h2><p className="mt-3 text-sm leading-7 text-slate-600">{compactText(item.summary) || compactText(item.scope) || compactText(item.description) || "Service details are not published yet."}</p><dl className="mt-auto grid grid-cols-2 gap-3 pt-5 text-sm"><Fact label="Turnaround" value={compactText(item.turnaround_time)} /><Fact label="Access" value={compactText(item.how_to_access)} /></dl></article>;
}

function SelectField({ name, label, value, options }: { name: string; label: string; value?: string; options: string[] }) {
  return <label><span className="text-xs font-semibold uppercase text-slate-500">{label}</span><select name={name} defaultValue={value ?? ""} className="mt-2 h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-primary"><option value="">All {label.toLowerCase()}</option>{options.map((option) => <option key={option} value={option}>{formatLabel(option)}</option>)}</select></label>;
}

function Fact({ label, value }: { label: string; value: string }) {
  return <div className="rounded-md bg-slate-50 p-3"><dt className="text-xs font-semibold uppercase text-slate-500">{label}</dt><dd className="mt-1 break-words font-semibold text-slate-950">{value || "Not published"}</dd></div>;
}
