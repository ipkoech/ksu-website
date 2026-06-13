import { notFound } from "next/navigation";
import type { ResearchGenericRecord } from "@ksu/api-client";
import { Badge, ResearchPageIntro, ResearchSection, StatusMessage } from "../../../components/research-ui";
import { compactText, formatDate, formatLabel, getGuidelineBySlug } from "../../../lib/research-public-data";

export const dynamic = "force-dynamic";

export default async function GuidelineDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { data, error } = await getGuidelineBySlug(slug);
  if (!data) notFound();
  const guideline = data as ResearchGenericRecord;

  return (
    <main id="research-main" className="min-h-screen bg-white">
      <ResearchPageIntro eyebrow="Guideline" title={guideline.title ?? "Research guideline"} body={compactText(guideline.summary) || compactText(guideline.scope)} breadcrumbs={[{ label: "Home", href: "/" }, { label: "Guidelines", href: "/guidelines" }, { label: guideline.title ?? "Guideline" }]} />
      {error ? <section className="px-4 pt-4 sm:px-6 lg:px-8"><div className="mx-auto max-w-[1680px]"><StatusMessage tone="error">{error}</StatusMessage></div></section> : null}
      <ResearchSection eyebrow="Document Detail" title="Policy scope, applicability, and controlled version" body="Guidelines show public-facing document control and practical application details." tone="white">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-5"><TextPanel title="Summary" fields={[["Summary", guideline.summary], ["Content", guideline.content]]} /><TextPanel title="Scope and applicability" fields={[["Scope", guideline.scope], ["Applicability", guideline.applicability]]} /></div>
          <aside className="h-fit rounded-lg border border-slate-200 bg-white p-5 shadow-sm"><div className="flex flex-wrap gap-2"><Badge>{formatLabel(guideline.guideline_type ?? "guideline")}</Badge>{guideline.category ? <Badge>{formatLabel(guideline.category)}</Badge> : null}{guideline.is_mandatory ? <Badge>Mandatory</Badge> : null}</div><dl className="mt-5 grid gap-3 text-sm"><Fact label="Code" value={compactText(guideline.code)} /><Fact label="Version" value={compactText(guideline.version)} /><Fact label="Approved by" value={compactText(guideline.approved_by)} /><Fact label="Approval date" value={formatDate(guideline.approval_date)} /><Fact label="Effective date" value={formatDate(guideline.effective_date)} /><Fact label="Review date" value={formatDate(guideline.review_date)} /><Fact label="Contact" value={compactText(guideline.contact_email)} /></dl>{compactText(guideline.document_url) ? <a href={guideline.document_url} className="mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-full bg-primary px-4 text-sm font-semibold text-white">Download document</a> : null}</aside>
        </div>
      </ResearchSection>
    </main>
  );
}

function TextPanel({ title, fields }: { title: string; fields: Array<[string, string | number | null | undefined]> }) {
  const entries = fields.map(([label, value]) => [label, compactText(value)] as const).filter(([, value]) => value);
  return <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"><h2 className="font-[family-name:var(--font-display)] text-xl font-semibold text-slate-950">{title}</h2>{entries.length ? <div className="mt-4 space-y-4">{entries.map(([label, value]) => <div key={label}><p className="text-xs font-semibold uppercase text-slate-500">{label}</p><p className="mt-1 whitespace-pre-line text-sm leading-7 text-slate-600">{value}</p></div>)}</div> : <p className="mt-3 text-sm leading-7 text-slate-600">This information has not been published yet.</p>}</section>;
}

function Fact({ label, value }: { label: string; value: string }) {
  return <div className="rounded-md bg-slate-50 p-3"><dt className="text-xs font-semibold uppercase text-slate-500">{label}</dt><dd className="mt-1 break-words font-semibold text-slate-950">{value || "Not published"}</dd></div>;
}
