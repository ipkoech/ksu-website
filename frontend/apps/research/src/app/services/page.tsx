import type { Metadata } from "next";
import type { ResearchGenericRecord } from "@ksu/api-client";
import { Banknote, ClipboardList, FileText, GraduationCap, LifeBuoy, Wrench } from "lucide-react";
import { ResearchClusterHero } from "../../components/research-cluster";
import { ResearchFilterForm, ResearchListCard } from "../../components/research-listing";
import { ResearchSection, StatusMessage } from "../../components/research-ui";
import { compactText, getCenters, getServices, getServicesFiltered } from "../../lib/research-public-data";

export const revalidate = 300;

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
      <ResearchClusterHero eyebrow="Funding / Support" title="Research support services." body="Find services for researchers, students, partners, and public engagement, with process, eligibility, turnaround, deliverables, fees, and request links." breadcrumbs={[{ label: "Home", href: "/" }, { label: "Funding", href: "/funding" }, { label: "Services" }]} imageSrc="/images/research/research-about-hero.svg" imageAlt="Research office service desk supporting researchers and partners" links={supportLinks} primaryAction={{ label: "Contact support", href: "/connect" }} stats={[{ label: "Service results", value: services.data.length }, { label: "Published services", value: allServices.data.length }, { label: "Centers", value: centers.data.length }, { label: "Categories", value: categories.length }]} />
      <ResearchSection eyebrow="Service Catalogue" title="Available research services" body="Filter services by type, category, center, and keyword." tone="white">
        <ServiceFilters params={params} categories={categories} centers={centers.data} />
        {[services.error, allServices.error, centers.error].filter(Boolean).map((error, i) => <div key={i} className="mt-5"><StatusMessage tone="error">{error}</StatusMessage></div>)}
        {services.data.length ? <div className="mt-7 grid gap-5 lg:grid-cols-3">{services.data.map((item) => <ServiceCard key={item.id} item={item} />)}</div> : <div className="mt-7"><StatusMessage>No services match the current filters.</StatusMessage></div>}
      </ResearchSection>
    </main>
  );
}

function ServiceFilters({ params, categories, centers }: { params: ServiceParams; categories: string[]; centers: ResearchGenericRecord[] }) {
  return (
    <ResearchFilterForm
      action="/services"
      resetHref="/services"
      searchValue={params.q}
      searchPlaceholder="Service, process, deliverable"
      selects={[
        { name: "type", label: "Type", value: params.type, options: serviceTypes },
        { name: "category", label: "Category", value: params.category, options: categories },
      ]}
      centers={centers}
      centerValue={params.center}
      sortValue={params.sort ?? "name"}
      sortOptions={[
        { value: "name", label: "Name" },
        { value: "created_at", label: "Newest" },
        { value: "turnaround_time", label: "Turnaround" },
      ]}
    />
  );
}

function ServiceCard({ item }: { item: ResearchGenericRecord }) {
  return (
    <ResearchListCard
      href={item.slug ? `/services/${item.slug}` : "/services"}
      title={item.name ?? "Research support service"}
      description={compactText(item.summary) || compactText(item.scope) || compactText(item.description) || "Service details are not published yet."}
      badges={[item.service_type ?? "service", item.category]}
      filledBadges={item.is_free ? ["Free"] : []}
      facts={[
        { label: "Turnaround", value: compactText(item.turnaround_time) },
        { label: "Access", value: compactText(item.how_to_access) },
      ]}
    />
  );
}
