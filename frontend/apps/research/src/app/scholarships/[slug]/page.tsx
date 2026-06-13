import { notFound } from "next/navigation";
import type { ResearchGenericRecord } from "@ksu/api-client";
import { ResearchDetailHero } from "../../../components/research-detail";
import { Badge, ResearchSection, StatusMessage } from "../../../components/research-ui";
import { compactText, formatDate, formatLabel, getScholarshipBySlug } from "../../../lib/research-public-data";

export const dynamic = "force-dynamic";

export default async function ScholarshipDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { data, error } = await getScholarshipBySlug(slug);
  if (!data) notFound();
  const scholarship = data as ResearchGenericRecord;
  const documents = Array.isArray(scholarship.documents) ? (scholarship.documents as ResearchGenericRecord[]) : [];
  const applications = Array.isArray(scholarship.applications) ? (scholarship.applications as ResearchGenericRecord[]) : [];

  return (
    <main id="research-main" className="min-h-screen bg-white">
      <ResearchDetailHero eyebrow="Scholarship Call" title={scholarship.name ?? "Research scholarship"} body={compactText(scholarship.summary) || compactText(scholarship.description)} breadcrumbs={[{ label: "Home", href: "/" }, { label: "Scholarships", href: "/scholarships" }, { label: scholarship.name ?? "Scholarship" }]} labels={[scholarship.scholarship_type, scholarship.status]} facts={[{ label: "Deadline", value: formatDate(scholarship.application_deadline) }, { label: "Value", value: formatMoney(scholarship.value, compactText(scholarship.currency) || "KES") }, { label: "Available", value: scholarship.number_available }, { label: "Funder", value: scholarship.funder_name }]} actions={[{ label: "Back to scholarships", href: "/scholarships", variant: "secondary" }, ...(compactText(scholarship.application_url) ? [{ label: "Apply online", href: compactText(scholarship.application_url) }] : [])]} imageSrc="/images/research/research-demo-imagegen.png" imageAlt="Research scholarship call and application information" />
      {error ? <section className="px-4 pt-4 sm:px-6 lg:px-8"><div className="mx-auto max-w-[1680px]"><StatusMessage tone="error">{error}</StatusMessage></div></section> : null}
      <ResearchSection eyebrow="Application Brief" title="Eligibility, benefits, and deadline" body="Scholarship detail pages expose the practical application information managed by the backend." tone="white">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-5">
            <TextPanel title="Overview" fields={[["Summary", scholarship.summary], ["Description", scholarship.description]]} />
            <TextPanel title="Who can apply" fields={[["Eligibility", scholarship.eligibility], ["Requirements", scholarship.requirements], ["Selection criteria", scholarship.selection_criteria]]} />
            <TextPanel title="Award terms" fields={[["Benefits", scholarship.benefits], ["Obligations", scholarship.obligations]]} />
          </div>
          <aside className="h-fit rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap gap-2"><Badge>{formatLabel(scholarship.scholarship_type ?? "scholarship")}</Badge>{scholarship.status ? <Badge>{formatLabel(scholarship.status)}</Badge> : null}</div>
            <dl className="mt-5 grid gap-3 text-sm">
              <Fact label="Deadline" value={formatDate(scholarship.application_deadline)} />
              <Fact label="Applications open" value={formatDate(scholarship.application_open)} />
              <Fact label="Award date" value={formatDate(scholarship.award_date)} />
              <Fact label="Start date" value={formatDate(scholarship.start_date)} />
              <Fact label="Value" value={formatMoney(scholarship.value, compactText(scholarship.currency) || "KES")} />
              <Fact label="Duration" value={scholarship.duration_months ? `${scholarship.duration_months} months` : ""} />
              <Fact label="Awards available" value={compactText(scholarship.number_available)} />
              <Fact label="Funder" value={compactText(scholarship.funder_name)} />
            </dl>
            {compactText(scholarship.application_url) ? <a href={scholarship.application_url} className="mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-full bg-primary px-4 text-sm font-semibold text-white">Apply online</a> : null}
            {compactText(scholarship.external_url) ? <a href={scholarship.external_url} className="mt-3 inline-flex min-h-11 w-full items-center justify-center rounded-full border border-primary/25 px-4 text-sm font-semibold text-primary">Open funder page</a> : null}
          </aside>
        </div>
      </ResearchSection>
      <ResearchSection eyebrow="Support" title="Documents, coverage, and contact" body="Documents and coverage options are shown when they are published.">
        <div className="grid gap-5 lg:grid-cols-3">
          <RecordPanel title="Documents" records={documents} />
          <TextPanel title="Coverage" fields={[["Tuition", scholarship.covers_tuition ? "Covered" : ""], ["Stipend", scholarship.covers_stipend ? "Covered" : ""], ["Travel", scholarship.covers_travel ? "Covered" : ""], ["Research costs", scholarship.covers_research ? "Covered" : ""], ["Renewable", scholarship.renewable ? "Yes" : ""]]} />
          <TextPanel title="Contact" fields={[["Name", scholarship.contact_name], ["Email", scholarship.contact_email], ["Phone", scholarship.contact_phone], ["Application records", applications.length ? `${applications.length} submitted records` : ""]]} />
        </div>
      </ResearchSection>
    </main>
  );
}

function TextPanel({ title, fields }: { title: string; fields: Array<[string, string | number | null | undefined]> }) {
  const entries = fields.map(([label, value]) => [label, compactText(value)] as const).filter(([, value]) => value);
  return <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"><h2 className="font-[family-name:var(--font-display)] text-xl font-semibold text-slate-950">{title}</h2>{entries.length ? <div className="mt-4 space-y-4">{entries.map(([label, value]) => <div key={label}><p className="text-xs font-semibold uppercase text-slate-500">{label}</p><p className="mt-1 whitespace-pre-line text-sm leading-7 text-slate-600">{value}</p></div>)}</div> : <p className="mt-3 text-sm leading-7 text-slate-600">This information has not been published yet.</p>}</section>;
}

function RecordPanel({ title, records }: { title: string; records: ResearchGenericRecord[] }) {
  return <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"><h2 className="text-xl font-semibold text-slate-950">{title}</h2><div className="mt-4 divide-y divide-slate-200">{records.slice(0, 8).map((record, index) => <article key={record.id ?? `${title}-${index}`} className="py-4 first:pt-0 last:pb-0"><h3 className="text-base font-semibold text-slate-950">{record.name ?? record.title ?? record.document_name ?? `Document ${index + 1}`}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{compactText(record.description) || "Scholarship document"}</p>{record.url || record.document_url ? <a href={record.url ?? record.document_url} className="mt-2 inline-flex text-sm font-semibold text-primary">Open document</a> : null}</article>)}{records.length === 0 ? <p className="py-4 text-sm text-slate-600">No documents are linked yet.</p> : null}</div></section>;
}

function Fact({ label, value }: { label: string; value: string }) {
  return <div className="rounded-md bg-slate-50 p-3"><dt className="text-xs font-semibold uppercase text-slate-500">{label}</dt><dd className="mt-1 break-words font-semibold text-slate-950">{value || "Not published"}</dd></div>;
}

function formatMoney(value?: string | number | null, currency = "KES") {
  if (value === null || value === undefined || value === "") return "";
  const amount = Number(value);
  return Number.isNaN(amount) ? compactText(value) : `${currency} ${new Intl.NumberFormat("en-KE").format(amount)}`;
}
