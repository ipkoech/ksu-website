import type { Metadata } from "next";
import type { ResearchGenericRecord } from "@ksu/api-client";
import { Banknote, ClipboardList, FileText, GraduationCap, LifeBuoy, Wrench } from "lucide-react";
import { ResearchClusterHero } from "../../components/research-cluster";
import { ResearchFilterForm, ResearchRecordRow } from "../../components/research-listing";
import { Badge, ResearchSection, StatusMessage } from "../../components/research-ui";
import { compactText, formatDate, formatLabel, getGrantGuidelines, getGuidelines, getGuidelinesFiltered } from "../../lib/research-public-data";

export const revalidate = 300;

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
      <ResearchClusterHero eyebrow="Funding / Support" title="Research guidelines, policies, procedures, and grant guidance." body="Guidelines are presented as controlled documents with version, approval, effective date, review date, mandatory status, and download links." breadcrumbs={[{ label: "Home", href: "/" }, { label: "Funding", href: "/funding" }, { label: "Guidelines" }]} imageSrc="/images/research/research-events-hero.svg" imageAlt="Research support documents, policy guidance, and application procedures" links={supportLinks} primaryAction={{ label: "Open forms", href: "/forms" }} stats={[{ label: "Guideline results", value: guidelines.data.length }, { label: "Published guidelines", value: allGuidelines.data.length }, { label: "Grant guidance", value: grantGuidelines.data.length }, { label: "Categories", value: categories.length }]} />
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
  return (
    <ResearchFilterForm
      action="/guidelines"
      resetHref="/guidelines"
      searchValue={params.q}
      searchPlaceholder="Policy, procedure, code, scope"
      selects={[
        { name: "type", label: "Type", value: params.type, options: guidelineTypes },
        { name: "category", label: "Category", value: params.category, options: categories },
        { name: "status", label: "Status", value: params.status, options: statuses },
        { name: "year", label: "Year", value: params.year, options: years },
      ]}
      sortValue={params.sort ?? "effective_date"}
      sortOptions={[
        { value: "effective_date", label: "Effective date" },
        { value: "review_date", label: "Review date" },
        { value: "approval_date", label: "Approval date" },
        { value: "title", label: "Title" },
        { value: "created_at", label: "Newest" },
      ]}
    />
  );
}

function GuidelineRow({ item, hrefBase }: { item: ResearchGenericRecord; hrefBase: string }) {
  return (
    <ResearchRecordRow
      href={item.slug ? `${hrefBase}/${item.slug}` : hrefBase}
      title={item.title ?? "Research guideline"}
      description={compactText(item.summary) || compactText(item.scope) || "Guideline summary is not published yet."}
      badges={[item.guideline_type ?? item.category ?? "guideline", item.status]}
      filledBadges={item.is_mandatory ? ["Mandatory"] : []}
      facts={[
        { label: "Version", value: compactText(item.version) },
        { label: "Effective", value: formatDate(item.effective_date) },
        { label: "Review", value: formatDate(item.review_date) },
      ]}
    />
  );
}

function GuidelineCard({ item }: { item: ResearchGenericRecord }) {
  return <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"><Badge>{formatLabel(item.guideline_type ?? "grant guidance")}</Badge><h2 className="mt-4 text-xl font-semibold leading-7 text-slate-950">{item.title ?? "Grant guideline"}</h2><p className="mt-3 text-sm leading-7 text-slate-600">{compactText(item.summary) || compactText(item.description) || "Grant guidance details are not published yet."}</p>{compactText(item.document_url) ? <a href={item.document_url} className="mt-4 inline-flex text-sm font-semibold text-primary">Download document</a> : null}</article>;
}

function getYears(records: ResearchGenericRecord[]) {
  return Array.from(new Set(records.flatMap((record) => [record.effective_date, record.review_date, record.approval_date, record.created_at]).map((value) => compactText(value).slice(0, 4)).filter((year) => /^\d{4}$/.test(year)))).sort((a, b) => Number(b) - Number(a));
}
