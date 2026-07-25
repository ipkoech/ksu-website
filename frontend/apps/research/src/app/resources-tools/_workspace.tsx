import Link from "next/link";
import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import {
  BookOpen,
  ClipboardList,
  Database,
  Download,
  ExternalLink,
  FileArchive,
  FileText,
  RefreshCw,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Wrench,
} from "lucide-react";
import type { ResearchGenericRecord } from "@ksu/api-client";
import {
  Badge,
  FilledBadge,
  StatusMessage,
} from "../../components/research-ui";
import { ResearchPortfolioHero } from "../../components/research-portfolio";
import { getResearchRecordDirectFileHref, getResearchRecordDownloadHref } from "../../lib/research-downloads";
import {
  compactText,
  formatDate,
  formatLabel,
  getCenters,
  getGrantGuidelines,
  getGuidelines,
  getGuidelinesFiltered,
  getOutputs,
  getOutputsFiltered,
  getResources,
  getResourcesFiltered,
  getServices,
  getServicesFiltered,
} from "../../lib/research-public-data";
import {
  getRecordSummary,
  getRecordTitle,
} from "../../lib/research-page-model";

export type ResourceWorkspaceParams = {
  q?: string;
  type?: string;
  category?: string;
  status?: string;
  center?: string;
};

export type WorkspaceDataset = {
  resources: ResearchGenericRecord[];
  allResources: ResearchGenericRecord[];
  policies: ResearchGenericRecord[];
  allPolicies: ResearchGenericRecord[];
  grantGuidelines: ResearchGenericRecord[];
  forms: ResearchGenericRecord[];
  templates: ResearchGenericRecord[];
  services: ResearchGenericRecord[];
  allServices: ResearchGenericRecord[];
  outputs: ResearchGenericRecord[];
  allOutputs: ResearchGenericRecord[];
  centers: ResearchGenericRecord[];
  errors: string[];
};

export type DownloadRecord = {
  id: string;
  title: string;
  href: string;
  source: string;
  category: string;
  updated: string;
  detailsHref: string;
  extension: string;
};

export type WorkspaceSideItem = {
  id: string;
  label: string;
  count: number;
  icon: LucideIcon;
  href: string;
};

const resourceTypes = ["equipment", "software", "facility", "platform", "dataset", "guide"];
const guidelineTypes = ["policy", "guideline", "procedure", "manual", "sop", "template", "checklist"];
const serviceTypes = ["support", "consultation", "ethics", "data", "proposal", "training", "commercialization", "partnership"];
const outputTypes = ["dataset", "software", "report", "policy_brief", "prototype", "toolkit", "creative_work"];
const typeOptions = Array.from(new Set([...resourceTypes, ...guidelineTypes, ...serviceTypes, ...outputTypes, "form"])).sort();

const statusOptions = ["active", "available", "published", "open", "draft", "archived", "maintenance"];

export async function getResourcesWorkspacePageModel(params: ResourceWorkspaceParams) {
  const dataset = await loadResourcesWorkspace(params);
  const categories = Array.from(
    new Set(
      [
        ...dataset.allResources,
        ...dataset.allPolicies,
        ...dataset.allServices,
        ...dataset.allOutputs,
      ]
        .map((item) => compactText(item.category))
        .filter(Boolean),
    ),
  ).sort();
  const centerNames = new Map(
    dataset.centers.map((center) => [
      center.id,
      compactText(center.name) || compactText(center.title) || compactText(center.code),
    ]),
  );
  const downloads = collectDownloadRecords(dataset);
  const latestUpdate = getLatestUpdate([
    ...dataset.allResources,
    ...dataset.allPolicies,
    ...dataset.allServices,
    ...dataset.allOutputs,
    ...dataset.grantGuidelines,
  ]);

  return {
    params,
    categories,
    centers: dataset.centers,
    centerNames,
    latestUpdate,
    downloads,
    dataset,
  };
}

export async function loadResourcesWorkspace(params: ResourceWorkspaceParams): Promise<WorkspaceDataset> {
  const resourceType = resourceTypes.includes(params.type ?? "") ? params.type : undefined;
  const guidelineType = guidelineTypes.includes(params.type ?? "") ? params.type : undefined;
  const serviceType = serviceTypes.includes(params.type ?? "") ? params.type : undefined;
  const outputType = outputTypes.includes(params.type ?? "") ? params.type : undefined;
  const commonFilters = {
    search: params.q,
    category: params.category,
    status: params.status,
  };

  const [
    resources,
    allResources,
    policies,
    allPolicies,
    grantGuidelines,
    forms,
    templates,
    services,
    allServices,
    outputs,
    allOutputs,
    centers,
  ] = await Promise.all([
    getResourcesFiltered({
      ...commonFilters,
      resourceType,
      centerId: params.center,
      sort: "name",
      order: "asc",
    }),
    getResources(),
    getGuidelinesFiltered({
      ...commonFilters,
      guidelineType,
      sort: "effective_date",
      order: "desc",
    }),
    getGuidelines(),
    getGrantGuidelines(),
    getResourcesFiltered({
      search: params.q,
      resourceType: "form",
      category: params.category,
      status: params.status,
      centerId: params.center,
      sort: "name",
      order: "asc",
    }),
    getResourcesFiltered({
      search: params.q,
      resourceType: "template",
      category: params.category,
      status: params.status,
      centerId: params.center,
      sort: "name",
      order: "asc",
    }),
    getServicesFiltered({
      ...commonFilters,
      serviceType,
      centerId: params.center,
      sort: "name",
      order: "asc",
    }),
    getServices(),
    getOutputsFiltered({
      search: params.q,
      outputType,
      status: params.status,
      centerId: params.center,
      sort: "release_date",
      order: "desc",
      perPage: 100,
    }),
    getOutputs(),
    getCenters(),
  ]);

  return {
    resources: resources.data,
    allResources: allResources.data,
    policies: policies.data,
    allPolicies: allPolicies.data,
    grantGuidelines: grantGuidelines.data,
    forms: forms.data,
    templates: templates.data,
    services: services.data,
    allServices: allServices.data,
    outputs: outputs.data,
    allOutputs: allOutputs.data,
    centers: centers.data,
    errors: [
      resources.error,
      allResources.error,
      policies.error,
      allPolicies.error,
      grantGuidelines.error,
      forms.error,
      templates.error,
      services.error,
      allServices.error,
      outputs.error,
      allOutputs.error,
      centers.error,
    ].filter((error): error is string => Boolean(error)),
  };
}

export function ResourcesWorkspace({
  params,
  categories,
  centers,
  centerNames,
  latestUpdate,
  downloads,
  dataset,
  activeItem = "resources",
  visibleSections = ["resources", "policies", "forms", "services", "outputs", "downloads"],
}: {
  params: ResourceWorkspaceParams;
  categories: string[];
  centers: ResearchGenericRecord[];
  centerNames: Map<unknown, string>;
  latestUpdate: string;
  downloads: DownloadRecord[];
  dataset: WorkspaceDataset;
  activeItem?: string;
  visibleSections?: string[];
}) {
  const sideItems = [
    {
      id: "resources",
      label: "Resource Library",
      count: dataset.allResources.length,
      icon: BookOpen,
      href: "/resources-tools/library",
    },
    {
      id: "policies",
      label: "Policies",
      count: dataset.allPolicies.length + dataset.grantGuidelines.length,
      icon: ShieldCheck,
      href: "/resources-tools/policies",
    },
    {
      id: "forms",
      label: "Forms & Templates",
      count: dataset.forms.length + dataset.templates.length,
      icon: ClipboardList,
      href: "/resources-tools/forms",
    },
    {
      id: "services",
      label: "Research Services",
      count: dataset.allServices.length,
      icon: Wrench,
      href: "/resources-tools/services",
    },
    {
      id: "outputs",
      label: "Outputs",
      count: dataset.allOutputs.length,
      icon: Database,
      href: "/resources-tools/outputs",
    },
    {
      id: "downloads",
      label: "Downloads",
      count: downloads.length,
      icon: Download,
      href: "/resources-tools/downloads",
    },
  ];

  return (
    <div className="w-full max-w-none border-t border-border bg-white">
      <WorkspaceHero
        latestUpdate={latestUpdate}
        params={params}
        categories={categories}
        centers={centers}
      />
      <section className="w-full max-w-none px-4 py-5 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
        <div className="grid w-full gap-5 lg:grid-cols-[244px_minmax(0,1fr)]">
          <WorkspaceSideNav items={sideItems} activeItem={activeItem} />
          <div className="min-w-0">
            {dataset.errors.length ? (
              <div className="mt-4 grid gap-2">
                {dataset.errors.map((error) => (
                  <StatusMessage key={error} tone="error">{error}</StatusMessage>
                ))}
              </div>
            ) : null}
            <div className="mt-5 space-y-5">
              {visibleSections.includes("resources") ? <ResourceLibraryPanel resources={dataset.resources} centerNames={centerNames} /> : null}
              {visibleSections.includes("policies") ? <PoliciesPanel policies={dataset.policies} grantGuidelines={dataset.grantGuidelines} /> : null}
              {visibleSections.includes("forms") ? <FormsPanel forms={dataset.forms} templates={dataset.templates} /> : null}
              {visibleSections.includes("services") ? <ServicesPanel services={dataset.services} /> : null}
              {visibleSections.includes("outputs") ? <OutputsPanel outputs={dataset.outputs} centerNames={centerNames} /> : null}
              {visibleSections.includes("downloads") ? <DownloadsPanel downloads={downloads} /> : null}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function WorkspaceHero({
  latestUpdate,
  params,
  categories,
  centers,
}: {
  latestUpdate: string;
  params: ResourceWorkspaceParams;
  categories: string[];
  centers: ResearchGenericRecord[];
}) {
  return (
    <>
      <ResearchPortfolioHero
        eyebrow="Published resource workspace"
        title="Resources & Tools"
        body="Access backend-published policies, forms, services, outputs and public downloads from one research support workspace."
        primary={{ label: "Open resource library", href: "/resources-tools/library" }}
        secondary={{ label: "View downloads", href: "/resources-tools/downloads" }}
        illustration="projects"
      />
      <section className="border-b border-border bg-white px-4 py-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
          <nav className="flex flex-wrap items-center gap-2 font-medium" aria-label="Breadcrumb">
            <Link href="/" className="transition hover:text-primary">Home</Link>
            <span className="text-muted-foreground/60">/</span>
            <span className="text-foreground">Resources & Tools</span>
          </nav>
          <div className="flex items-center gap-2">
            <span>{latestUpdate ? `Data as of ${latestUpdate}` : "Backend records loaded"}</span>
            <RefreshCw aria-hidden className="h-3.5 w-3.5 text-primary" />
          </div>
        </div>
        <form action="/resources-tools" className="grid gap-3 xl:grid-cols-[minmax(260px,1fr)_repeat(4,minmax(150px,190px))_auto]">
          <label className="relative block">
            <span className="sr-only">Search resources</span>
            <Search aria-hidden className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/70" />
            <input
              name="q"
              defaultValue={params.q}
              placeholder="Search resources, policies, forms, services, outputs..."
              className="h-11 w-full rounded-md border border-border bg-white pl-10 pr-3 text-sm outline-none transition placeholder:text-muted-foreground/70 focus:border-primary focus:ring-4 focus:ring-primary/10"
            />
          </label>
          <FilterSelect name="type" label="All Types" value={params.type} options={typeOptions} />
          <FilterSelect name="category" label="All Categories" value={params.category} options={categories} />
          <FilterSelect name="status" label="All Status" value={params.status} options={statusOptions} />
          <FilterSelect
            name="center"
            label="All Centers"
            value={params.center}
            options={centers.map((center) => ({
              value: String(center.id),
              label: compactText(center.name) || compactText(center.title) || compactText(center.code) || "Research center",
            }))}
          />
          <div className="flex gap-2">
            <button className="inline-flex h-11 min-w-28 items-center justify-center gap-2 rounded-md border border-primary/30 bg-white px-4 text-sm font-semibold text-primary transition hover:bg-primary/5" type="submit">
              <SlidersHorizontal aria-hidden className="h-4 w-4" />
              Filter
            </button>
            <Link href="/resources-tools" className="inline-flex h-11 items-center justify-center rounded-md px-3 text-sm font-semibold text-primary transition hover:bg-primary/5">
              Reset
            </Link>
          </div>
        </form>
      </section>
    </>
  );
}

function FilterSelect({
  name,
  label,
  value,
  options,
}: {
  name: string;
  label: string;
  value?: string;
  options: Array<string | { value: string; label: string }>;
}) {
  return (
    <label className="block">
      <span className="sr-only">{label}</span>
      <select
        name={name}
        defaultValue={value ?? ""}
        className="h-11 w-full rounded-md border border-border bg-white px-3 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
      >
        <option value="">{label}</option>
        {options.map((option) => {
          const next = typeof option === "string" ? { value: option, label: formatLabel(option) } : option;
          return <option key={`${name}-${next.value}`} value={next.value}>{next.label}</option>;
        })}
      </select>
    </label>
  );
}

function WorkspaceSideNav({
  items,
  activeItem,
}: {
  items: WorkspaceSideItem[];
  activeItem: string;
}) {
  return (
    <aside className="lg:sticky lg:top-24 lg:self-start">
      <nav className="grid gap-1 rounded-lg border border-border bg-white p-2 shadow-sm lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none" aria-label="Resources workspace sections">
        {items.map((item) => {
          const Icon = item.icon;
          const active = item.id === activeItem;
          return (
            <a
              key={item.id}
              href={item.href}
              className={`group flex min-h-11 items-center justify-between gap-3 rounded-md px-3 py-2 text-sm font-semibold transition ${active ? "bg-primary text-white shadow-sm" : "text-muted-foreground hover:bg-primary/5 hover:text-primary"}`}
            >
              <span className="inline-flex items-center gap-2">
                <Icon aria-hidden className="h-4 w-4" />
                {item.label}
              </span>
              <span className={`rounded-full px-2 py-0.5 text-xs ${active ? "bg-white/90 text-primary" : "bg-surface-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"}`}>
                {item.count}
              </span>
            </a>
          );
        })}
      </nav>
      <div className="mt-5 hidden rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm lg:block">
        <p className="font-semibold text-foreground">Need access?</p>
        <p className="mt-2 leading-6 text-muted-foreground">Contact the research office for resource booking, policy documents, and file access support.</p>
        <Link href="/connect" className="mt-3 inline-flex text-sm font-semibold text-primary">Contact Research Office</Link>
      </div>
    </aside>
  );
}

function ResourceLibraryPanel({
  resources,
  centerNames,
}: {
  resources: ResearchGenericRecord[];
  centerNames: Map<unknown, string>;
}) {
  return (
    <WorkspacePanel id="resources" title="Resource Library" href="/resources-tools" action="View all resources">
      <DesktopTable
        columns={["Resource", "Type", "Access", "Status", "Managing Center", "Location", "Actions"]}
        empty="No resource records match the current filters."
      >
        {resources.slice(0, 6).map((resource) => (
          <tr key={resource.id} className="border-b border-border last:border-b-0">
            <NameCell title={getRecordTitle(resource, "Research resource")} body={getRecordSummary(resource) || compactText(resource.description)} icon={BookOpen} />
            <td><Badge>{formatLabel(resource.resource_type ?? "resource")}</Badge></td>
            <td><AccessBadge value={resource.access_type ?? "internal"} /></td>
            <td><StatusBadge value={resource.status} /></td>
            <td className="max-w-[180px] text-sm text-muted-foreground">{centerNames.get(resource.center_id) || "Not published"}</td>
            <td className="text-sm text-muted-foreground">{formatLocation(resource)}</td>
            <td><RowActions detailHref={resource.slug ? `/resources-tools/${resource.slug}` : "/resources-tools"} primaryHref={compactText(resource.booking_url) || compactText(resource.access_url)} primaryLabel={compactText(resource.booking_url) ? "Book" : "Access"} /></td>
          </tr>
        ))}
      </DesktopTable>
      <MobileList records={resources.slice(0, 5)} hrefBase="/resources-tools" actionLabel="Open details" />
    </WorkspacePanel>
  );
}

function PoliciesPanel({
  policies,
  grantGuidelines,
}: {
  policies: ResearchGenericRecord[];
  grantGuidelines: ResearchGenericRecord[];
}) {
  const policyRows = [...policies, ...grantGuidelines].slice(0, 6);
  return (
    <WorkspacePanel id="policies" title="Policies & Guidelines" href="/guidelines" action="View all policies">
      <DesktopTable
        columns={["Document", "Type", "Version", "Effective Date", "Review Date", "Status", "Mandatory", "Actions"]}
        empty="No policy or guideline records match the current filters."
      >
        {policyRows.map((policy) => {
          const href = getBackendDownloadHref(policy, "Policy") || getDownloadHref(policy);
          return (
            <tr key={policy.id} className="border-b border-border last:border-b-0">
              <NameCell title={getRecordTitle(policy, "Research guideline")} body={getRecordSummary(policy) || compactText(policy.scope)} icon={FileText} />
              <td><Badge>{formatLabel(policy.guideline_type ?? "policy")}</Badge></td>
              <td className="text-sm text-muted-foreground">{compactText(policy.version) || "Not set"}</td>
              <td className="text-sm text-muted-foreground">{formatDate(policy.effective_date) || "Not set"}</td>
              <td className="text-sm text-muted-foreground">{formatDate(policy.review_date) || "Not set"}</td>
              <td><StatusBadge value={policy.status} /></td>
              <td>{policy.is_mandatory || policy.is_required ? <FilledBadge>Mandatory</FilledBadge> : <Badge>No</Badge>}</td>
              <td><RowActions detailHref={policy.slug ? `/guidelines/${policy.slug}` : "/guidelines"} primaryHref={href} primaryLabel="Download" download /></td>
            </tr>
          );
        })}
      </DesktopTable>
      <MobileList records={policyRows} hrefBase="/guidelines" actionLabel="Open policy" />
    </WorkspacePanel>
  );
}

function FormsPanel({
  forms,
  templates,
}: {
  forms: ResearchGenericRecord[];
  templates: ResearchGenericRecord[];
}) {
  const records = [...forms, ...templates].slice(0, 6);
  return (
    <WorkspacePanel id="forms" title="Forms & Templates" href="/forms" action="View all forms">
      <CompactCardGrid records={records} hrefBase="/resources-tools" empty="No forms or templates match the current filters." />
    </WorkspacePanel>
  );
}

function ServicesPanel({ services }: { services: ResearchGenericRecord[] }) {
  return (
    <WorkspacePanel id="services" title="Research Services" href="/services" action="View all services">
      <CompactCardGrid records={services.slice(0, 6)} hrefBase="/services" empty="No service records match the current filters." />
    </WorkspacePanel>
  );
}

function OutputsPanel({
  outputs,
  centerNames,
}: {
  outputs: ResearchGenericRecord[];
  centerNames: Map<unknown, string>;
}) {
  return (
    <WorkspacePanel id="outputs" title="Outputs" href="/outputs" action="View all outputs">
      <DesktopTable
        columns={["Output", "Type", "Access", "Status", "Center", "Released", "Actions"]}
        empty="No output records match the current filters."
      >
        {outputs.slice(0, 6).map((output) => (
          <tr key={output.id} className="border-b border-border last:border-b-0">
            <NameCell title={getRecordTitle(output, "Research output")} body={getRecordSummary(output)} icon={Database} />
            <td><Badge>{formatLabel(output.output_type ?? "output")}</Badge></td>
            <td><Badge>{formatLabel(output.access_type ?? "not set")}</Badge></td>
            <td><StatusBadge value={output.status} /></td>
            <td className="text-sm text-muted-foreground">{centerNames.get(output.center_id) || "Not published"}</td>
            <td className="text-sm text-muted-foreground">{formatDate(output.release_date) || formatDate(output.created_at) || "Not set"}</td>
            <td><RowActions detailHref={output.slug ? `/outputs/${output.slug}` : "/outputs"} primaryHref={getDownloadHref(output)} primaryLabel="Download" download /></td>
          </tr>
        ))}
      </DesktopTable>
      <MobileList records={outputs.slice(0, 5)} hrefBase="/outputs" actionLabel="Open output" />
    </WorkspacePanel>
  );
}

function DownloadsPanel({ downloads }: { downloads: DownloadRecord[] }) {
  return (
    <WorkspacePanel id="downloads" title="Downloads" href="/resources-tools/downloads" action="File library">
      {downloads.length ? (
        <div className="grid gap-3 md:grid-cols-2">
          {downloads.slice(0, 10).map((item) => (
            <article key={item.id} className="flex min-w-0 items-start gap-3 rounded-md border border-border bg-white p-4">
              <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/5 text-primary">
                <FileArchive aria-hidden className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge>{item.extension}</Badge>
                  <Badge>{item.source}</Badge>
                </div>
                <h3 className="mt-2 line-clamp-2 text-sm font-semibold text-foreground">{item.title}</h3>
                <p className="mt-1 text-xs text-muted-foreground">{item.category} {item.updated ? `- ${item.updated}` : ""}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <a href={item.href} download className="inline-flex min-h-9 items-center gap-2 rounded-md border border-primary/25 px-3 text-xs font-semibold text-primary transition hover:bg-primary/5">
                    <Download aria-hidden className="h-3.5 w-3.5" />
                    Download
                  </a>
                  <Link href={item.detailsHref} className="inline-flex min-h-9 items-center rounded-md border border-border px-3 text-xs font-semibold text-muted-foreground transition hover:border-primary/30 hover:text-primary">
                    Details
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <StatusMessage>No downloadable files are published in the current backend records.</StatusMessage>
      )}
    </WorkspacePanel>
  );
}

function WorkspacePanel({
  id,
  title,
  href,
  action,
  children,
}: {
  id: string;
  title: string;
  href: string;
  action: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-28 rounded-lg border border-border bg-white shadow-sm">
      <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-4 sm:px-5">
        <h2 className="text-lg font-semibold text-primary">{title}</h2>
        <Link href={href} className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
          {action}
          <ExternalLink aria-hidden className="h-3.5 w-3.5" />
        </Link>
      </div>
      <div className="p-0 sm:p-0">{children}</div>
    </section>
  );
}

function DesktopTable({
  columns,
  empty,
  children,
}: {
  columns: string[];
  empty: string;
  children: ReactNode;
}) {
  const hasRows = Array.isArray(children) ? children.length > 0 : Boolean(children);
  return (
    <div className="hidden overflow-x-auto lg:block">
      <table className="min-w-full text-left">
        <thead className="bg-surface-subtle text-xs font-semibold text-muted-foreground">
          <tr>
            {columns.map((column) => <th key={column} className="px-4 py-3">{column}</th>)}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
      {!hasRows ? <div className="p-5"><StatusMessage>{empty}</StatusMessage></div> : null}
    </div>
  );
}

function NameCell({
  title,
  body,
  icon: Icon,
}: {
  title: string;
  body?: string;
  icon: LucideIcon;
}) {
  return (
    <td className="min-w-[240px] px-4 py-3">
      <div className="flex items-start gap-3">
        <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-surface-muted text-primary">
          <Icon aria-hidden className="h-4 w-4" />
        </span>
        <div>
          <p className="text-sm font-semibold text-foreground">{title}</p>
          {body ? <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">{body}</p> : null}
        </div>
      </div>
    </td>
  );
}

function RowActions({
  detailHref,
  primaryHref,
  primaryLabel,
  download = false,
}: {
  detailHref: string;
  primaryHref?: string;
  primaryLabel: string;
  download?: boolean;
}) {
  return (
    <div className="flex gap-2 whitespace-nowrap px-4 py-3">
      {primaryHref ? (
        <a
          href={primaryHref}
          download={download}
          className="inline-flex min-h-9 items-center gap-1 rounded-md border border-primary/25 px-3 text-xs font-semibold text-primary transition hover:bg-primary/5"
        >
          {download ? <Download aria-hidden className="h-3.5 w-3.5" /> : <ExternalLink aria-hidden className="h-3.5 w-3.5" />}
          {primaryLabel}
        </a>
      ) : null}
      <Link href={detailHref} className="inline-flex min-h-9 items-center rounded-md border border-border px-3 text-xs font-semibold text-muted-foreground transition hover:border-primary/30 hover:text-primary">
        Details
      </Link>
    </div>
  );
}

function MobileList({
  records,
  hrefBase,
  actionLabel,
}: {
  records: ResearchGenericRecord[];
  hrefBase: string;
  actionLabel: string;
}) {
  if (!records.length) {
    return <div className="p-4 lg:hidden"><StatusMessage>No records match the current filters.</StatusMessage></div>;
  }
  return (
    <div className="divide-y divide-slate-200 lg:hidden">
      {records.map((record) => {
        const href = record.slug ? `${hrefBase}/${record.slug}` : hrefBase;
        return (
          <article key={record.id} className="flex items-start gap-3 p-4">
            <span className="mt-1 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-surface-muted text-primary">
              <BookOpen aria-hidden className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-semibold text-foreground">{getRecordTitle(record, "Research record")}</h3>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">{[formatLabel(record.resource_type ?? record.guideline_type ?? record.service_type ?? record.output_type), formatLabel(record.status), formatLocation(record)].filter(Boolean).join(" - ")}</p>
            </div>
            <Link href={href} className="inline-flex min-h-9 items-center rounded-md border border-border px-3 text-xs font-semibold text-primary">
              {actionLabel}
            </Link>
          </article>
        );
      })}
    </div>
  );
}

function CompactCardGrid({
  records,
  hrefBase,
  empty,
}: {
  records: ResearchGenericRecord[];
  hrefBase: string;
  empty: string;
}) {
  if (!records.length) {
    return <div className="p-5"><StatusMessage>{empty}</StatusMessage></div>;
  }
  return (
    <div className="grid gap-3 p-4 md:grid-cols-2 xl:grid-cols-3">
      {records.map((record) => (
        <Link
          key={record.id}
          href={record.slug ? `${hrefBase}/${record.slug}` : hrefBase}
          className="rounded-md border border-border bg-white p-4 transition hover:border-primary/30 hover:bg-primary/5"
        >
          <div className="flex flex-wrap gap-2">
            <Badge>{formatLabel(record.resource_type ?? record.service_type ?? record.guideline_type ?? record.output_type ?? "record")}</Badge>
            {record.status ? <StatusBadge value={record.status} /> : null}
          </div>
          <h3 className="mt-3 line-clamp-2 text-sm font-semibold text-foreground">{getRecordTitle(record, "Research record")}</h3>
          <p className="mt-2 line-clamp-2 text-xs leading-5 text-muted-foreground">{getRecordSummary(record) || compactText(record.description) || compactText(record.scope) || "Details are published in the backend record."}</p>
        </Link>
      ))}
    </div>
  );
}

function StatusBadge({ value }: { value?: unknown }) {
  const text = formatLabel(toCompactString(value) || "active");
  const positive = /active|available|published|open/i.test(text);
  return (
    <span className={`inline-flex items-center rounded-md border px-3 py-1 text-xs font-semibold ${positive ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-border bg-surface-subtle text-muted-foreground"}`}>
      {text}
    </span>
  );
}

function AccessBadge({ value }: { value?: unknown }) {
  return (
    <span className="inline-flex items-center rounded-md border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800">
      {formatLabel(toCompactString(value) || "internal")}
    </span>
  );
}

function toCompactString(value: unknown) {
  if (typeof value === "string" || typeof value === "number") return compactText(value);
  return "";
}

function collectDownloadRecords(dataset: WorkspaceDataset): DownloadRecord[] {
  const records = [
    ...dataset.resources.map((record) => buildDownloadRecord(record, "Resource", "/resources-tools")),
    ...dataset.policies.map((record) => buildDownloadRecord(record, "Policy", "/guidelines")),
    ...dataset.grantGuidelines.map((record) => buildDownloadRecord(record, "Grant guideline", "/guidelines")),
    ...dataset.forms.map((record) => buildDownloadRecord(record, "Form", "/resources-tools")),
    ...dataset.templates.map((record) => buildDownloadRecord(record, "Template", "/resources-tools")),
    ...dataset.services.map((record) => buildDownloadRecord(record, "Service", "/services")),
    ...dataset.outputs.map((record) => buildDownloadRecord(record, "Output", "/outputs")),
  ].filter(Boolean) as DownloadRecord[];

  return Array.from(new Map(records.map((record) => [record.href, record])).values());
}

function buildDownloadRecord(record: ResearchGenericRecord, source: string, hrefBase: string): DownloadRecord | null {
  const href = getBackendDownloadHref(record, source) || getDownloadHref(record);
  if (!href) return null;
  const title = compactText(record.document_name) || getRecordTitle(record, source);
  return {
    id: `${source}-${record.id}`,
    title,
    href,
    source,
    category: formatLabel(record.category ?? record.resource_type ?? record.guideline_type ?? record.service_type ?? record.output_type ?? source),
    updated: formatDate(record.updated_at) || formatDate(record.effective_date) || formatDate(record.release_date) || "",
    detailsHref: record.slug ? `${hrefBase}/${record.slug}` : hrefBase,
    extension: getFileExtension(href),
  };
}

function getDownloadHref(record: ResearchGenericRecord): string {
  return getResearchRecordDirectFileHref(record);
}

function getBackendDownloadHref(record: ResearchGenericRecord, source: string): string {
  if (source === "Resource" || source === "Form" || source === "Template") {
    return getResearchRecordDownloadHref(record, "resource");
  }
  if (source === "Policy") {
    return getResearchRecordDownloadHref(record, "guideline");
  }
  return "";
}

function getFileExtension(href: string) {
  const clean = href.split("?")[0]?.split("#")[0] ?? "";
  const extension = clean.includes(".") ? clean.split(".").pop() : "";
  return extension ? extension.slice(0, 6).toUpperCase() : "FILE";
}

function formatLocation(record: ResearchGenericRecord) {
  return [record.location, record.room].map(compactText).filter(Boolean).join(" - ") || "Not published";
}

function getLatestUpdate(records: ResearchGenericRecord[]) {
  const dates = records
    .map((record) => compactText(record.updated_at) || compactText(record.created_at))
    .filter(Boolean)
    .map((value) => new Date(value))
    .filter((date) => !Number.isNaN(date.getTime()))
    .sort((a, b) => b.getTime() - a.getTime());

  return dates[0] ? formatDate(dates[0].toISOString()) : "";
}
