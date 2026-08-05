import Link from "next/link";
import type { LibraryBranch, LibraryServiceRecord } from "@ksu/api-client";
import {
  EditorialPageHero,
  EditorialSection,
  TextActionLink,
} from "../../components/library-page-sections";
import { LibraryFilterToolbar } from "../../components/library-filter-toolbar";
import { LibraryActionLink, PrimaryLink, SecondaryLink, StatusMessage } from "../../components/library-ui";
import { compactText, formatLabel, getLibraryServicesData } from "../../lib/library-public-data";
import { ServiceAccordion, type ServiceAccordionItem } from "./service-accordion";

export const metadata = {
  title: "Library Services",
  description: "Kisii University Library branches, contacts, regulations, and service information.",
};

export const dynamic = "force-dynamic";

type PublishedService = LibraryServiceRecord & { branch: LibraryBranch };

type ServicesPageProps = {
  searchParams?: Promise<{ q?: string; type?: string; branch?: string }>;
};

export default async function LibraryServicesPage({ searchParams }: ServicesPageProps) {
  const params = (await searchParams) ?? {};
  const { branches, groupedServices, regulations, errors } = await getLibraryServicesData();
  const query = params.q?.trim().toLowerCase() ?? "";
  const serviceType = params.type?.trim() ?? "";
  const branchId = params.branch?.trim() ?? "";
  const allServices: PublishedService[] = groupedServices.flatMap(({ branch, services }) => services.map((service) => ({ ...service, branch })));
  const filteredServices = allServices.filter((service) => {
    const text = [service.name, service.description, service.service_type, service.how_to_access, service.contact_info].filter(Boolean).join(" ").toLowerCase();
    return (!query || text.includes(query)) && (!serviceType || service.service_type === serviceType) && (!branchId || service.branch.id === branchId);
  });
  const serviceItems: ServiceAccordionItem[] = filteredServices.map((service) => ({
    id: service.id,
    title: service.name ?? "Library service",
    content: compactText(service.description) || "Contact the branch desk for service details.",
    meta: [formatLabel(service.service_type ?? "service"), service.branch.name, compactText(service.how_to_access)].filter(Boolean),
  }));
  const typeOptions = Array.from(new Set(allServices.map((service) => service.service_type).filter(Boolean) as string[])).sort().map((value) => ({ value, label: formatLabel(value) }));

  return (
    <main id="library-main" className="min-h-screen bg-background">
      <EditorialPageHero
        eyebrow="Library Services"
        title="Support for learning, teaching, and research."
        body="Find the right service, understand how to access it, and connect with the branch or librarian who can help you move forward."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Library", href: "/" }, { label: "Services" }]}
        actions={<><PrimaryLink href="/catalog">Search the catalog</PrimaryLink><SecondaryLink href="/ask">Ask a librarian</SecondaryLink></>}
      />

      {errors.map((error) => <section key={error} className="px-4 pt-6 sm:px-6 lg:px-8"><div className="mx-auto max-w-[1680px]"><StatusMessage tone="error">{error}</StatusMessage></div></section>)}

      <section className="bg-primary px-4 py-8 sm:px-6 lg:px-8"><div className="mx-auto max-w-[1680px]"><div className="mb-4"><p className="text-xs font-semibold uppercase tracking-[0.2em] text-secondary">Find a service</p><h2 className="mt-2 text-2xl font-semibold text-white">What do you need help with?</h2></div><div className="rounded-lg bg-white p-3"><LibraryFilterToolbar actionUrl="/services" resetHref="/services" searchValue={params.q} searchPlaceholder="Search borrowing, research, training, printing…" searchLabel="Search services" selects={[{ name: "type", label: "Category", value: serviceType, options: typeOptions, allLabel: "All categories" }, { name: "branch", label: "Branch", value: branchId, options: branches.data.map((branch) => ({ value: branch.id, label: branch.name })), allLabel: "All branches" }]} /></div></div></section>

      <div id="services-heading" className="scroll-mt-24"><EditorialSection title="A library service for every academic task" body="Library services are published by branch and maintained by the library team. Start with the service list, then contact us when your request needs personal support.">
        <div className="grid gap-10 lg:grid-cols-[0.75fr_1.25fr] lg:gap-20"><div><p className="text-base leading-8 text-muted-foreground">From borrowing and information literacy to research support and e-resource access, the Library helps you discover, evaluate, and use information with confidence.</p><div className="mt-7 flex flex-wrap gap-5"><TextActionLink href="/contact">Contact a branch</TextActionLink><TextActionLink href="/ask">Ask a librarian</TextActionLink></div></div><ServiceAccordion items={serviceItems} /></div>
      </EditorialSection></div>

      <div id="branches-heading" className="scroll-mt-24"><EditorialSection eyebrow="Branches" title="Where services are available" body="Choose a branch for local contacts and visit planning.">
        {branches.data.length === 0 ? <StatusMessage>No public library branches are available yet.</StatusMessage> : <div className="divide-y divide-border border-y border-border">{branches.data.map((branch) => { const count = allServices.filter((service) => service.branch.id === branch.id).length; return <div key={branch.id} className="flex flex-col gap-3 py-5 sm:flex-row sm:items-center sm:justify-between"><div><h3 className="text-lg font-semibold text-foreground">{branch.name}</h3><p className="mt-1 text-sm text-muted-foreground">{branch.address ?? branch.location ?? "Location being updated"} · {count} published service{count === 1 ? "" : "s"}</p></div><Link href="/contact#hours" className="text-sm font-semibold text-primary hover:text-secondary">View opening hours</Link></div>; })}</div>}
      </EditorialSection></div>

      <div id="regulations-heading" className="scroll-mt-24"><EditorialSection eyebrow="Policies" title="Know the guidance before you visit" body="Review active borrowing, access, conduct, and fee guidance published by the Library.">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:gap-20"><div className="divide-y divide-border border-y border-border">{regulations.data.length === 0 ? <StatusMessage>No active library regulations are available yet.</StatusMessage> : regulations.data.map((regulation) => <article key={regulation.id} className="py-5"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-secondary">{formatLabel(regulation.category ?? "Regulation")}</p><h3 className="mt-2 text-xl font-semibold text-foreground">{regulation.title ?? "Library regulation"}</h3><p className="mt-2 text-sm leading-7 text-muted-foreground">{compactText(regulation.content) || "Regulation details are being updated."}</p></article>)}</div><div className="border-l-4 border-secondary bg-surface-subtle p-6"><p className="text-sm font-semibold uppercase tracking-[0.16em] text-secondary">Need clarification?</p><h3 className="mt-3 text-2xl font-semibold text-foreground">Talk to the Library team.</h3><p className="mt-3 text-sm leading-7 text-muted-foreground">If a policy or service record does not answer your question, send the team the branch, resource, or deadline involved.</p><div className="mt-6 flex flex-wrap gap-3"><LibraryActionLink href="/ask">Ask a librarian</LibraryActionLink><LibraryActionLink href="/contact">Contact us</LibraryActionLink></div></div></div>
      </EditorialSection></div>
    </main>
  );
}
