import { notFound } from "next/navigation";
import type { ResearchGenericRecord } from "@ksu/api-client";
import { ResearchDetailHero, ResearchFact, ResearchTextPanel } from "../../../components/research-detail";
import { Badge, ResearchSection, StatusMessage } from "../../../components/research-ui";
import { compactText, formatDate, formatLabel, getGuidelineBySlug } from "../../../lib/research-public-data";

export const dynamic = "force-dynamic";

export default async function GuidelineDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { data, error } = await getGuidelineBySlug(slug);
  if (!data) notFound();
  const guideline = data as ResearchGenericRecord;

  return (
    <main id="research-main" className="min-h-screen bg-white">
      <ResearchDetailHero eyebrow="Guideline" title={guideline.title ?? "Research guideline"} body={compactText(guideline.summary) || compactText(guideline.scope)} breadcrumbs={[{ label: "Home", href: "/" }, { label: "Guidelines", href: "/guidelines" }, { label: guideline.title ?? "Guideline" }]} labels={[guideline.guideline_type, guideline.category, guideline.is_mandatory ? "mandatory" : null]} facts={[{ label: "Version", value: guideline.version }, { label: "Effective", value: formatDate(guideline.effective_date) }, { label: "Review", value: formatDate(guideline.review_date) }, { label: "Approved by", value: guideline.approved_by }]} actions={[{ label: "Back to guidelines", href: "/guidelines", variant: "secondary" }, ...(compactText(guideline.document_url) ? [{ label: "Download", href: compactText(guideline.document_url) }] : [])]} imageSrc="/images/research/research-workflows.png" imageAlt="Research guideline document control and download information" />
      {error ? <section className="px-4 pt-4 sm:px-6 lg:px-8"><div className="mx-auto max-w-[1680px]"><StatusMessage tone="error">{error}</StatusMessage></div></section> : null}
      <ResearchSection eyebrow="Document Detail" title="Policy scope, applicability, and controlled version" body="Guidelines show public-facing document control and practical application details." tone="white">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-5"><ResearchTextPanel title="Summary" fields={[["Summary", guideline.summary], ["Content", guideline.content]]} /><ResearchTextPanel title="Scope and applicability" fields={[["Scope", guideline.scope], ["Applicability", guideline.applicability]]} /></div>
          <aside className="h-fit rounded-lg border border-slate-200 bg-white p-5 shadow-sm"><div className="flex flex-wrap gap-2"><Badge>{formatLabel(guideline.guideline_type ?? "guideline")}</Badge>{guideline.category ? <Badge>{formatLabel(guideline.category)}</Badge> : null}{guideline.is_mandatory ? <Badge>Mandatory</Badge> : null}</div><dl className="mt-5 grid gap-3 text-sm"><ResearchFact label="Code" value={compactText(guideline.code)} /><ResearchFact label="Version" value={compactText(guideline.version)} /><ResearchFact label="Approved by" value={compactText(guideline.approved_by)} /><ResearchFact label="Approval date" value={formatDate(guideline.approval_date)} /><ResearchFact label="Effective date" value={formatDate(guideline.effective_date)} /><ResearchFact label="Review date" value={formatDate(guideline.review_date)} /><ResearchFact label="Contact" value={compactText(guideline.contact_email)} /></dl>{compactText(guideline.document_url) ? <a href={guideline.document_url} className="mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-full bg-primary px-4 text-sm font-semibold text-white">Download document</a> : null}</aside>
        </div>
      </ResearchSection>
    </main>
  );
}
