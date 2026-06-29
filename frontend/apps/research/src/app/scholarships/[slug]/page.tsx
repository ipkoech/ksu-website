import { notFound } from "next/navigation";
import type { ResearchGenericRecord } from "@ksu/api-client";
import { researchServiceApi } from "@ksu/api-client";
import { ResearchDetailHero, ResearchDetailSidebar, ResearchRecordPanel } from "../../../components/research-detail";
import { ResearchSection, StatusMessage } from "../../../components/research-ui";
import { compactText, formatDate, generateSlugParams, getScholarshipBySlug } from "../../../lib/research-public-data";
import { getNarrativeSections, getRecordSummary, getRecordTitle } from "../../../lib/research-page-model";

export const revalidate = 300;

export async function generateStaticParams() {
  return generateSlugParams(researchServiceApi.scholarships.list);
}

export default async function ScholarshipDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { data, error } = await getScholarshipBySlug(slug);
  if (!data) notFound();
  const scholarship = data as ResearchGenericRecord;
  const documents = Array.isArray(scholarship.documents) ? (scholarship.documents as ResearchGenericRecord[]) : [];
  const applications = Array.isArray(scholarship.applications) ? (scholarship.applications as ResearchGenericRecord[]) : [];
  const title = getRecordTitle(scholarship, "Research scholarship");
  const storySections = getNarrativeSections(scholarship, [
    { title: "Opportunity at a glance", fields: ["summary", "description"] },
    { title: "Who can apply", fields: ["eligibility", "requirements", "selection_criteria"] },
    { title: "What the award covers", fields: ["benefits", "obligations"] },
    { title: "How to apply", fields: ["application_instructions", "application_process", "contact_email"] },
  ]);

  return (
    <main id="research-main" className="min-h-screen bg-white">
      <ResearchDetailHero eyebrow="Scholarship Call" title={title} body={getRecordSummary(scholarship)} breadcrumbs={[{ label: "Home", href: "/" }, { label: "Scholarships", href: "/scholarships" }, { label: title }]} labels={[scholarship.scholarship_type, scholarship.status, scholarship.is_featured ? "featured" : null]} facts={[{ label: "Deadline", value: formatDate(scholarship.application_deadline) }, { label: "Value", value: formatMoney(scholarship.value, compactText(scholarship.currency) || "KES") }, { label: "Available", value: scholarship.number_available }, { label: "Funder", value: scholarship.funder_name }]} actions={[{ label: "Back to scholarships", href: "/scholarships", variant: "secondary" }, ...(compactText(scholarship.application_url) ? [{ label: "Apply online", href: compactText(scholarship.application_url) }] : [])]} imageSrc="/images/research/research-projects-hero.svg" imageAlt="Research scholarship call and application information" />
      {error ? <section className="px-4 pt-4 sm:px-6 lg:px-8"><div className="mx-auto max-w-[1680px]"><StatusMessage tone="error">{error}</StatusMessage></div></section> : null}
      <ResearchSection eyebrow="Application Brief" title="Eligibility, benefits, and deadline" body="Published scholarship fields are grouped into a compact application story with deadlines, value, documents, and contact context nearby." tone="white">
        <div className="grid grid-cols-[minmax(0,1fr)] gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="flex min-w-0 flex-col gap-5">
            <ScholarshipStory sections={storySections} />
            <ResearchRecordPanel title="Documents" records={documents} empty="No scholarship documents are linked yet." />
          </div>
          <ResearchDetailSidebar
            labels={[scholarship.scholarship_type ?? "scholarship", scholarship.status]}
            facts={[
              { label: "Deadline", value: formatDate(scholarship.application_deadline) },
              { label: "Applications open", value: formatDate(scholarship.application_open) },
              { label: "Award date", value: formatDate(scholarship.award_date) },
              { label: "Start date", value: formatDate(scholarship.start_date) },
              { label: "Value", value: formatMoney(scholarship.value, compactText(scholarship.currency) || "KES") },
              { label: "Duration", value: scholarship.duration_months ? `${scholarship.duration_months} months` : "" },
              { label: "Awards available", value: scholarship.number_available },
              { label: "Funder", value: scholarship.funder_name },
            ]}
            actions={[
              ...(compactText(scholarship.application_url) ? [{ label: "Apply online", href: compactText(scholarship.application_url) }] : []),
              ...(compactText(scholarship.external_url) ? [{ label: "Open funder page", href: compactText(scholarship.external_url), variant: "secondary" as const }] : []),
            ]}
          />
        </div>
      </ResearchSection>
      <ResearchSection eyebrow="Support" title="Documents, coverage, and contact" body="Documents and coverage options are shown when they are published.">
        <div className="grid gap-5 lg:grid-cols-3">
          <ResearchRecordPanel title="Documents" records={documents} empty="No documents are linked yet." />
          <CoveragePanel scholarship={scholarship} />
          <ContactPanel scholarship={scholarship} applicationCount={applications.length} />
        </div>
      </ResearchSection>
    </main>
  );
}

function ScholarshipStory({ sections }: { sections: Array<{ title: string; body: string }> }) {
  if (sections.length === 0) return <StatusMessage>The application story appears when summary, eligibility, benefits, or application fields are published.</StatusMessage>;

  return (
    <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      {sections.map((section, index) => (
        <details key={section.title} className="group border-b border-slate-200 last:border-b-0" open={index === 0}>
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-base font-semibold text-slate-950 transition hover:bg-slate-50">
            {section.title}
            <span className="text-primary transition group-open:rotate-45">+</span>
          </summary>
          <p className="px-5 pb-5 text-sm leading-7 text-slate-600">{section.body}</p>
        </details>
      ))}
    </section>
  );
}

function CoveragePanel({ scholarship }: { scholarship: ResearchGenericRecord }) {
  const items = [
    ["Tuition", scholarship.covers_tuition ? "Covered" : ""],
    ["Stipend", scholarship.covers_stipend ? "Covered" : ""],
    ["Travel", scholarship.covers_travel ? "Covered" : ""],
    ["Research costs", scholarship.covers_research ? "Covered" : ""],
    ["Renewable", scholarship.renewable ? "Yes" : ""],
  ].filter(([, value]) => value);

  return (
    <section className="min-w-0 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-xl font-semibold text-slate-950">Coverage</h2>
      {items.length ? (
        <dl className="mt-4 grid gap-3 text-sm">
          {items.map(([label, value]) => <div key={label} className="rounded-md bg-slate-50 p-3"><dt className="text-xs font-semibold uppercase text-slate-500">{label}</dt><dd className="mt-1 font-semibold text-slate-950">{value}</dd></div>)}
        </dl>
      ) : <p className="mt-3 text-sm leading-7 text-slate-600">Coverage details are not published yet.</p>}
    </section>
  );
}

function ContactPanel({ scholarship, applicationCount }: { scholarship: ResearchGenericRecord; applicationCount: number }) {
  const items = [
    ["Name", compactText(scholarship.contact_name)],
    ["Email", compactText(scholarship.contact_email)],
    ["Phone", compactText(scholarship.contact_phone)],
    ["Application records", applicationCount ? `${applicationCount} submitted records` : ""],
  ].filter(([, value]) => value);

  return (
    <section className="min-w-0 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-xl font-semibold text-slate-950">Contact</h2>
      {items.length ? (
        <dl className="mt-4 grid gap-3 text-sm">
          {items.map(([label, value]) => <div key={label} className="rounded-md bg-slate-50 p-3"><dt className="text-xs font-semibold uppercase text-slate-500">{label}</dt><dd className="mt-1 break-words font-semibold text-slate-950">{value}</dd></div>)}
        </dl>
      ) : <p className="mt-3 text-sm leading-7 text-slate-600">Contact details are not published yet.</p>}
    </section>
  );
}

function formatMoney(value?: string | number | null, currency = "KES") {
  if (value === null || value === undefined || value === "") return "";
  const amount = Number(value);
  return Number.isNaN(amount) ? compactText(value) : `${currency} ${new Intl.NumberFormat("en-KE").format(amount)}`;
}
