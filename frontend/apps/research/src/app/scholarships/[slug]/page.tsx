import { notFound } from "next/navigation";
import type { ResearchGenericRecord } from "@ksu/api-client";
import { researchServiceApi } from "@ksu/api-client";
import { ResearchDetailHero, ResearchDetailSidebar, ResearchRecordPanel, ResearchTextPanel } from "../../../components/research-detail";
import { ResearchSection, StatusMessage } from "../../../components/research-ui";
import { compactText, formatDate, generateSlugParams, getScholarshipBySlug } from "../../../lib/research-public-data";

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

  return (
    <main id="research-main" className="min-h-screen bg-white">
      <ResearchDetailHero eyebrow="Scholarship Call" title={scholarship.name ?? "Research scholarship"} body={compactText(scholarship.summary) || compactText(scholarship.description)} breadcrumbs={[{ label: "Home", href: "/" }, { label: "Scholarships", href: "/scholarships" }, { label: scholarship.name ?? "Scholarship" }]} labels={[scholarship.scholarship_type, scholarship.status]} facts={[{ label: "Deadline", value: formatDate(scholarship.application_deadline) }, { label: "Value", value: formatMoney(scholarship.value, compactText(scholarship.currency) || "KES") }, { label: "Available", value: scholarship.number_available }, { label: "Funder", value: scholarship.funder_name }]} actions={[{ label: "Back to scholarships", href: "/scholarships", variant: "secondary" }, ...(compactText(scholarship.application_url) ? [{ label: "Apply online", href: compactText(scholarship.application_url) }] : [])]} imageSrc="/images/research/research-projects-hero.svg" imageAlt="Research scholarship call and application information" />
      {error ? <section className="px-4 pt-4 sm:px-6 lg:px-8"><div className="mx-auto max-w-[1680px]"><StatusMessage tone="error">{error}</StatusMessage></div></section> : null}
      <ResearchSection eyebrow="Application Brief" title="Eligibility, benefits, and deadline" body="Scholarship detail pages present eligibility, benefits, deadlines, documents, and contact information." tone="white">
        <div className="grid grid-cols-[minmax(0,1fr)] gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="flex min-w-0 flex-col gap-5">
            <ResearchTextPanel title="Overview" fields={[["Summary", scholarship.summary], ["Description", scholarship.description]]} />
            <ResearchTextPanel title="Who can apply" fields={[["Eligibility", scholarship.eligibility], ["Requirements", scholarship.requirements], ["Selection criteria", scholarship.selection_criteria]]} />
            <ResearchTextPanel title="Award terms" fields={[["Benefits", scholarship.benefits], ["Obligations", scholarship.obligations]]} />
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
          <ResearchTextPanel title="Coverage" fields={[["Tuition", scholarship.covers_tuition ? "Covered" : ""], ["Stipend", scholarship.covers_stipend ? "Covered" : ""], ["Travel", scholarship.covers_travel ? "Covered" : ""], ["Research costs", scholarship.covers_research ? "Covered" : ""], ["Renewable", scholarship.renewable ? "Yes" : ""]]} />
          <ResearchTextPanel title="Contact" fields={[["Name", scholarship.contact_name], ["Email", scholarship.contact_email], ["Phone", scholarship.contact_phone], ["Application records", applications.length ? `${applications.length} submitted records` : ""]]} />
        </div>
      </ResearchSection>
    </main>
  );
}

function formatMoney(value?: string | number | null, currency = "KES") {
  if (value === null || value === undefined || value === "") return "";
  const amount = Number(value);
  return Number.isNaN(amount) ? compactText(value) : `${currency} ${new Intl.NumberFormat("en-KE").format(amount)}`;
}
