import { notFound } from "next/navigation";
import type { ResearchGenericRecord } from "@ksu/api-client";
import { researchServiceApi } from "@ksu/api-client";
import { ResearchRecordPanel } from "../../../components/research-detail";
import { ResearchSection, StatusMessage } from "../../../components/research-ui";
import { ResearchStoryAccordion } from "../../../components/research-rich-text";
import { compactText, formatDate, generateSlugParams, getScholarshipBySlug } from "../../../lib/research-public-data";
import { getNarrativeSections, getRecordSummary, getRecordTitle } from "../../../lib/research-page-model";
import {
  CompactFactGrid,
  FundingIllustratedHero,
  FundingSidebar,
  formatMoney,
  getDeadlineState,
  DeadlineStatusBadge,
  fundingIcons,
} from "../../../components/funding-ui";

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
      <FundingIllustratedHero
        eyebrow="Scholarship Call"
        title={title}
        body={getRecordSummary(scholarship)}
        tone="scholarship"
        facts={[
          { label: "Deadline", value: formatDate(scholarship.application_deadline), icon: fundingIcons.calendar },
          { label: "Value", value: formatMoney(scholarship.value, compactText(scholarship.currency) || "KES"), icon: fundingIcons.money },
          { label: "Available", value: scholarship.number_available, icon: fundingIcons.award },
          { label: "Funder", value: scholarship.funder_name, icon: fundingIcons.bank },
        ]}
        actions={[{ label: "Back to scholarships", href: "/scholarships", variant: "secondary" }, ...(compactText(scholarship.application_url) ? [{ label: "Apply online", href: compactText(scholarship.application_url) }] : [])]}
      />
      {error ? <section className="px-4 pt-4 sm:px-6 lg:px-8"><div className="mx-auto max-w-[1680px]"><StatusMessage tone="error">{error}</StatusMessage></div></section> : null}
      <ResearchSection eyebrow="Application Brief" title="Eligibility, benefits, and deadline" body="Published scholarship fields are grouped into a compact application story with deadlines, value, documents, and contact context nearby." tone="white">
        <div className="grid grid-cols-[minmax(0,1fr)] gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="flex min-w-0 flex-col gap-5">
            <ScholarshipDeadlinePanel scholarship={scholarship} />
            <CompactFactGrid
              facts={[
                { label: "Applications open", value: formatDate(scholarship.application_open), icon: fundingIcons.calendar },
                { label: "Deadline", value: formatDate(scholarship.application_deadline), icon: fundingIcons.calendar },
                { label: "Award date", value: formatDate(scholarship.award_date), icon: fundingIcons.award },
                { label: "Duration", value: scholarship.duration_months ? `${scholarship.duration_months} months` : "", icon: fundingIcons.check },
              ]}
            />
            <ScholarshipStory sections={storySections} />
            {documents.length > 0 ? <ResearchRecordPanel title="Documents" records={documents} empty="" /> : null}
          </div>
          <FundingSidebar
            title="Scholarship facts"
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
  return (
    <ResearchStoryAccordion
      sections={sections}
      empty="The application story appears when summary, eligibility, benefits, or application fields are published."
    />
  );
}

function ScholarshipDeadlinePanel({ scholarship }: { scholarship: ResearchGenericRecord }) {
  const deadline = getDeadlineState(compactText(scholarship.application_deadline), compactText(scholarship.status));
  if (!deadline.value) return null;
  return (
    <section className="rounded-lg border-2 border-primary bg-primary/[0.04] p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Application deadline</p>
          <h2 className="mt-3 font-[family-name:var(--font-display)] text-2xl font-semibold leading-tight text-slate-950">{deadline.label}</h2>
          <p className="mt-2 text-lg font-semibold text-slate-800">{deadline.value}</p>
        </div>
        <DeadlineStatusBadge deadline={deadline} large />
      </div>
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

  if (items.length === 0) return null;

  return (
    <section className="min-w-0 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-xl font-semibold text-slate-950">Coverage</h2>
      <dl className="mt-4 grid gap-3 text-sm">
        {items.map(([label, value]) => <div key={label} className="rounded-md bg-slate-50 p-3"><dt className="text-xs font-semibold uppercase text-slate-500">{label}</dt><dd className="mt-1 font-semibold text-slate-950">{value}</dd></div>)}
      </dl>
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

  if (items.length === 0) return null;

  return (
    <section className="min-w-0 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-xl font-semibold text-slate-950">Contact</h2>
      <dl className="mt-4 grid gap-3 text-sm">
        {items.map(([label, value]) => <div key={label} className="rounded-md bg-slate-50 p-3"><dt className="text-xs font-semibold uppercase text-slate-500">{label}</dt><dd className="mt-1 break-words font-semibold text-slate-950">{value}</dd></div>)}
      </dl>
    </section>
  );
}
