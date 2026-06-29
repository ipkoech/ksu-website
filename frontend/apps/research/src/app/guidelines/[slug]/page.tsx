import { notFound } from "next/navigation";
import type { ResearchGenericRecord } from "@ksu/api-client";
import { researchServiceApi } from "@ksu/api-client";
import { ResearchDetailHero, ResearchDetailSidebar } from "../../../components/research-detail";
import { ResearchSection, StatusMessage } from "../../../components/research-ui";
import { compactText, formatDate, generateSlugParams, getGuidelineBySlug } from "../../../lib/research-public-data";
import { getNarrativeSections, getRecordSummary, getRecordTitle } from "../../../lib/research-page-model";

export const revalidate = 300;

export async function generateStaticParams() {
  return generateSlugParams(researchServiceApi.guidelines.list);
}

export default async function GuidelineDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { data, error } = await getGuidelineBySlug(slug);
  if (!data) notFound();
  const guideline = data as ResearchGenericRecord;
  const title = getRecordTitle(guideline, "Research guideline");
  const storySections = getNarrativeSections(guideline, [
    { title: "What this document governs", fields: ["summary", "scope", "content"] },
    { title: "Who it applies to", fields: ["applicability", "audience", "eligibility"] },
    { title: "How to use it", fields: ["procedure", "instructions", "requirements"] },
    { title: "Version notes", fields: ["version_notes", "change_summary", "review_notes"] },
  ]);

  return (
    <main id="research-main" className="min-h-screen bg-white">
      <ResearchDetailHero eyebrow="Guideline" title={title} body={getRecordSummary(guideline) || compactText(guideline.scope)} breadcrumbs={[{ label: "Home", href: "/" }, { label: "Guidelines", href: "/guidelines" }, { label: title }]} labels={[guideline.guideline_type, guideline.category, guideline.status, guideline.is_mandatory ? "mandatory" : null, guideline.is_featured ? "featured" : null]} facts={[{ label: "Version", value: guideline.version }, { label: "Effective", value: formatDate(guideline.effective_date) }, { label: "Review", value: formatDate(guideline.review_date) }, { label: "Approved by", value: guideline.approved_by }]} actions={[{ label: "Back to guidelines", href: "/guidelines", variant: "secondary" }, ...(compactText(guideline.document_url) ? [{ label: "Download document", href: compactText(guideline.document_url) }] : [])]} imageSrc="/images/research/research-events-hero.svg" imageAlt="Research guideline document control and download information" />
      {error ? <section className="px-4 pt-4 sm:px-6 lg:px-8"><div className="mx-auto max-w-[1680px]"><StatusMessage tone="error">{error}</StatusMessage></div></section> : null}
      <ResearchSection eyebrow="Document Story" title="Scope, use, and controlled version" body="Document fields are grouped into compact sections for quick scanning while keeping the source record backend-backed." tone="white">
        <div className="grid grid-cols-[minmax(0,1fr)] gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="flex min-w-0 flex-col gap-5">
            <GuidelineStory sections={storySections} />
          </div>
          <ResearchDetailSidebar
            labels={[guideline.guideline_type ?? "guideline", guideline.category, guideline.status, guideline.is_mandatory ? "mandatory" : null]}
            facts={[
              { label: "Code", value: guideline.code },
              { label: "Version", value: guideline.version },
              { label: "Approved by", value: guideline.approved_by },
              { label: "Approval date", value: formatDate(guideline.approval_date) },
              { label: "Effective date", value: formatDate(guideline.effective_date) },
              { label: "Review date", value: formatDate(guideline.review_date) },
              { label: "Contact", value: guideline.contact_email },
            ]}
            actions={compactText(guideline.document_url) ? [{ label: "Download document", href: compactText(guideline.document_url) }] : []}
          />
        </div>
      </ResearchSection>
    </main>
  );
}

function GuidelineStory({ sections }: { sections: Array<{ title: string; body: string }> }) {
  if (sections.length === 0) return <StatusMessage>Guideline story sections appear when scope, applicability, procedure, or version notes are published.</StatusMessage>;

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
