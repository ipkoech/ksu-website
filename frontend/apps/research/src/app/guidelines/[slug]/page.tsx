import { notFound } from "next/navigation";
import type { ResearchGenericRecord } from "@ksu/api-client";
import { ResearchDetailHero, ResearchDetailSidebar, ResearchTextPanel } from "../../../components/research-detail";
import { ResearchSection, StatusMessage } from "../../../components/research-ui";
import { compactText, formatDate, getGuidelineBySlug } from "../../../lib/research-public-data";

export const revalidate = 300;

export default async function GuidelineDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { data, error } = await getGuidelineBySlug(slug);
  if (!data) notFound();
  const guideline = data as ResearchGenericRecord;

  return (
    <main id="research-main" className="min-h-screen bg-white">
      <ResearchDetailHero eyebrow="Guideline" title={guideline.title ?? "Research guideline"} body={compactText(guideline.summary) || compactText(guideline.scope)} breadcrumbs={[{ label: "Home", href: "/" }, { label: "Guidelines", href: "/guidelines" }, { label: guideline.title ?? "Guideline" }]} labels={[guideline.guideline_type, guideline.category, guideline.is_mandatory ? "mandatory" : null]} facts={[{ label: "Version", value: guideline.version }, { label: "Effective", value: formatDate(guideline.effective_date) }, { label: "Review", value: formatDate(guideline.review_date) }, { label: "Approved by", value: guideline.approved_by }]} actions={[{ label: "Back to guidelines", href: "/guidelines", variant: "secondary" }, ...(compactText(guideline.document_url) ? [{ label: "Download", href: compactText(guideline.document_url) }] : [])]} imageSrc="/images/research/research-events-hero.svg" imageAlt="Research guideline document control and download information" />
      {error ? <section className="px-4 pt-4 sm:px-6 lg:px-8"><div className="mx-auto max-w-[1680px]"><StatusMessage tone="error">{error}</StatusMessage></div></section> : null}
      <ResearchSection eyebrow="Document Detail" title="Policy scope, applicability, and controlled version" body="Guidelines show public-facing document control and practical application details." tone="white">
        <div className="grid grid-cols-[minmax(0,1fr)] gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="flex min-w-0 flex-col gap-5"><ResearchTextPanel title="Summary" fields={[["Summary", guideline.summary], ["Content", guideline.content]]} /><ResearchTextPanel title="Scope and applicability" fields={[["Scope", guideline.scope], ["Applicability", guideline.applicability]]} /></div>
          <ResearchDetailSidebar
            labels={[guideline.guideline_type ?? "guideline", guideline.category, guideline.is_mandatory ? "mandatory" : null]}
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
