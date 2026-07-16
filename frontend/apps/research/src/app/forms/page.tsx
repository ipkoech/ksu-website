import type { Metadata } from "next";
import Link from "next/link";
import type { ResearchGenericRecord } from "@ksu/api-client";
import { ResearchFilterForm } from "../../components/research-listing";
import { Badge, PrimaryLink, ResearchSection, SecondaryLink, StatusMessage } from "../../components/research-ui";
import { getResearchRecordDownloadHref } from "../../lib/research-downloads";
import { compactText, formatDate, formatLabel, getGuidelinesFiltered, getResourcesFiltered } from "../../lib/research-public-data";

export const revalidate = 300;

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
      <FormsMasthead
        formCount={forms.data.length}
        templateCount={templates.data.length}
        guidanceCount={guidance.data.length}
      />
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
        {[forms.error, templates.error, guidance.error].filter(Boolean).map((error, i) => <div key={i} className="mt-5"><StatusMessage tone="error">{error}</StatusMessage></div>)}
        <div className="mt-7 grid gap-5 lg:grid-cols-3"><ResourceColumn title="Forms" records={forms.data} /><ResourceColumn title="Templates" records={templates.data} /><ResourceColumn title="Related guidance" records={guidance.data} /></div>
      </ResearchSection>
    </main>
  );
}

function FormsMasthead({
  formCount,
  templateCount,
  guidanceCount,
}: {
  formCount: number;
  templateCount: number;
  guidanceCount: number;
}) {
  const stats = [
    { label: "Forms", value: formCount },
    { label: "Templates", value: templateCount },
    { label: "Related guidance", value: guidanceCount },
  ];

  return (
    <section className="border-b border-border bg-white px-4 py-6 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
      <div className="mx-auto grid max-w-[1680px] gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(300px,460px)] lg:items-end">
        <div>
          <nav className="mb-4 flex flex-wrap items-center gap-2 text-xs font-semibold text-muted-foreground" aria-label="Breadcrumb">
            <Link href="/" className="transition hover:text-primary">Home</Link>
            <span className="text-muted-foreground/60">/</span>
            <Link href="/funding" className="transition hover:text-primary">Funding</Link>
            <span className="text-muted-foreground/60">/</span>
            <span className="text-foreground">Forms</span>
          </nav>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-secondary">Funding / Support</p>
          <h1 className="mt-3 max-w-5xl text-balance font-[family-name:var(--font-display)] text-3xl font-semibold leading-tight text-foreground sm:text-4xl">Forms, templates, and practical research resources</h1>
          <p className="mt-3 max-w-4xl text-pretty text-sm leading-7 text-muted-foreground sm:text-base">Search backend-published forms, templates, and guidance records with direct detail links.</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <PrimaryLink href="/resources-tools">Open resources</PrimaryLink>
            <SecondaryLink href="/guidelines">Guidelines</SecondaryLink>
          </div>
        </div>
        <dl className="grid gap-2 sm:grid-cols-3 lg:grid-cols-1">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-md border border-border bg-surface-subtle px-3 py-2">
              <dt className="text-[11px] font-semibold uppercase text-muted-foreground">{stat.label}</dt>
              <dd className="mt-1 text-lg font-semibold text-foreground">{stat.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

function ResourceColumn({ title, records }: { title: string; records: ResearchGenericRecord[] }) {
  return <section className="rounded-lg border border-border bg-white p-5 shadow-sm"><h2 className="text-xl font-semibold text-foreground">{title}</h2><div className="mt-4 divide-y divide-slate-200">{records.map((record) => {
    const downloadHref = getResearchRecordDownloadHref(record, record.resource_type ? "resource" : "guideline");
    return <article key={record.id} className="py-4 first:pt-0 last:pb-0"><Badge>{formatLabel(record.resource_type ?? record.guideline_type ?? record.category ?? "document")}</Badge><h3 className="mt-3 text-base font-semibold leading-6 text-foreground">{record.name ?? record.title}</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">{compactText(record.description) || compactText(record.summary) || compactText(record.scope) || "Document details are not published yet."}</p><p className="mt-2 text-xs font-semibold uppercase text-muted-foreground">{formatDate(record.effective_date) || formatLabel(record.status)}</p><div className="mt-3 flex flex-wrap gap-3">{downloadHref ? <a href={downloadHref} className="inline-flex text-sm font-semibold text-primary">Download</a> : null}{record.slug ? <Link href={record.resource_type ? `/resources-tools/${record.slug}` : `/guidelines/${record.slug}`} className="inline-flex text-sm font-semibold text-primary">Open details</Link> : null}</div></article>;
  })}{records.length === 0 ? <p className="py-4 text-sm text-muted-foreground">No records are published yet.</p> : null}</div></section>;
}
