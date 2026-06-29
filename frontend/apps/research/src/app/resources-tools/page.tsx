import type { Metadata } from "next";
import type { ResearchGenericRecord } from "@ksu/api-client";
import { Banknote, ClipboardList, FileText, GraduationCap, LifeBuoy, Wrench } from "lucide-react";
import { ResearchClusterHero } from "../../components/research-cluster";
import { ResearchFilterForm, ResearchListCard } from "../../components/research-listing";
import { ResearchSection, StatusMessage } from "../../components/research-ui";
import { compactText, formatLabel, getCenters, getResources, getResourcesFiltered } from "../../lib/research-public-data";

export const revalidate = 300;

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
      <ResearchClusterHero eyebrow="Funding / Support" title="Research resources, tools, equipment, and platforms." body="Browse available research equipment, facilities, datasets, forms, software, and bookable tools with access and contact details." breadcrumbs={[{ label: "Home", href: "/" }, { label: "Funding", href: "/funding" }, { label: "Resources & Tools" }]} imageSrc="/images/research/research-home-hero.svg" imageAlt="Research tools, platforms, equipment, and support resources" links={supportLinks} primaryAction={{ label: "Open services", href: "/services" }} stats={[{ label: "Resource results", value: resources.data.length }, { label: "Published resources", value: allResources.data.length }, { label: "Centers", value: centers.data.length }, { label: "Categories", value: categories.length }]} />
      <ResearchSection eyebrow="Resource Catalogue" title="Find and access research tools" body="Resource records are filtered by type, access level, category, center, availability, and keyword." tone="white">
        <ResourceFilters params={params} categories={categories} centers={centers.data} />
        {[resources.error, allResources.error, centers.error].filter(Boolean).map((error) => <div key={error} className="mt-5"><StatusMessage tone="error">{error}</StatusMessage></div>)}
        {resources.data.length ? <div className="mt-7 grid gap-5 lg:grid-cols-3">{resources.data.map((item) => <ResourceCard key={item.id} item={item} />)}</div> : <div className="mt-7"><StatusMessage>No resources match the current filters.</StatusMessage></div>}
      </ResearchSection>
    </main>
  );
}

function ResourceFilters({ params, categories, centers }: { params: ResourceParams; categories: string[]; centers: ResearchGenericRecord[] }) {
  return (
    <ResearchFilterForm
      action="/resources-tools"
      resetHref="/resources-tools"
      searchValue={params.q}
      searchPlaceholder="Equipment, tool, facility, capability"
      selects={[
        { name: "type", label: "Type", value: params.type, options: resourceTypes },
        { name: "access", label: "Access", value: params.access, options: accessTypes },
        { name: "category", label: "Category", value: params.category, options: categories },
        { name: "status", label: "Status", value: params.status, options: statuses },
      ]}
      centers={centers}
      centerValue={params.center}
      sortValue={params.sort ?? "name"}
      sortOptions={[
        { value: "name", label: "Name" },
        { value: "created_at", label: "Newest" },
        { value: "status", label: "Availability" },
      ]}
    />
  );
}

function ResourceCard({ item }: { item: ResearchGenericRecord }) {
  return (
    <ResearchListCard
      href={item.slug ? `/resources-tools/${item.slug}` : "/resources-tools"}
      title={item.name ?? "Research resource"}
      description={compactText(item.description) || compactText(item.capabilities) || "Resource details are not published yet."}
      badges={[item.resource_type ?? "resource", item.status]}
      filledBadges={item.is_featured ? ["Featured"] : []}
      facts={[
        { label: "Access", value: formatLabel(item.access_type) },
        { label: "Location", value: [item.location, item.room].map(compactText).filter(Boolean).join(" · ") },
      ]}
    />
  );
}
