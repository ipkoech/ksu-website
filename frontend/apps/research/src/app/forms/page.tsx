import type { Metadata } from "next";
import { ResearchPageHero, ResearchPageHeroStats } from "../../components/research-page-hero";
import Link from "next/link";
import type { ResearchGenericRecord } from "@ksu/api-client";
import { ResearchFilterForm } from "../../components/research-listing";
import { Badge, ResearchSection, StatusMessage } from "../../components/research-ui";
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
    <ResearchPageHero eyebrow="Funding / Support" title="Forms, templates, and practical research resources" description="Search backend-published forms, templates, and guidance records with direct detail links." breadcrumbs={[{ label: "Home", href: "/" }, { label: "Funding", href: "/funding" }, { label: "Forms" }]} actions={[{ label: "Open resources", href: "/resources-tools" }, { label: "Guidelines", href: "/guidelines", variant: "secondary" }]} imageSrc="/institutional-research-images/KSUGreenLandscapingWithoutWMJuly2026-7606.jpg" imageAlt="Kisii University research resources">
      <ResearchPageHeroStats facts={stats} />
    </ResearchPageHero>
  );
}

function ResourceColumn({ title, records }: { title: string; records: ResearchGenericRecord[] }) {
  return <section className="rounded-lg border border-border bg-white p-5 shadow-sm"><h2 className="text-xl font-semibold text-foreground">{title}</h2><div className="mt-4 divide-y divide-border">{records.map((record) => {
    const downloadHref = getResearchRecordDownloadHref(record, record.resource_type ? "resource" : "guideline");
    return <article key={record.id} className="py-4 first:pt-0 last:pb-0"><Badge>{formatLabel(record.resource_type ?? record.guideline_type ?? record.category ?? "document")}</Badge><h3 className="mt-3 text-base font-semibold leading-6 text-foreground">{record.name ?? record.title}</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">{compactText(record.description) || compactText(record.summary) || compactText(record.scope) || "Document details are not published yet."}</p><p className="mt-2 text-xs font-semibold uppercase text-muted-foreground">{formatDate(record.effective_date) || formatLabel(record.status)}</p><div className="mt-3 flex flex-wrap gap-3">{downloadHref ? <a href={downloadHref} className="inline-flex text-sm font-semibold text-primary">Download</a> : null}{record.slug ? <Link href={record.resource_type ? `/resources-tools/${record.slug}` : `/guidelines/${record.slug}`} className="inline-flex text-sm font-semibold text-primary">Open details</Link> : null}</div></article>;
  })}{records.length === 0 ? <p className="py-4 text-sm text-muted-foreground">No records are published yet.</p> : null}</div></section>;
}
