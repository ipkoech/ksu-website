import { notFound } from "next/navigation";
import type { ResearchGenericRecord } from "@ksu/api-client";
import { ResearchDetailHero } from "../../../components/research-detail";
import { Badge, ResearchSection, StatusMessage } from "../../../components/research-ui";
import { compactText, formatDate, formatLabel, getMentorshipBySlug } from "../../../lib/research-public-data";

export const dynamic = "force-dynamic";

export default async function MentorshipDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { data, error } = await getMentorshipBySlug(slug);
  if (!data) notFound();
  const mentorship = data as ResearchGenericRecord;
  const applications = Array.isArray(mentorship.applications) ? (mentorship.applications as ResearchGenericRecord[]) : [];
  const matches = Array.isArray(mentorship.matches) ? (mentorship.matches as ResearchGenericRecord[]) : [];

  return (
    <main id="research-main" className="min-h-screen bg-white">
      <ResearchDetailHero
        eyebrow="Mentorship"
        title={mentorship.name ?? mentorship.title ?? "Mentorship programme"}
        body={compactText(mentorship.summary) || compactText(mentorship.description)}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Mentorship", href: "/mentorship" },
          { label: mentorship.name ?? mentorship.title ?? "Mentorship" },
        ]}
        labels={[mentorship.program_type ?? "mentorship", mentorship.status]}
        facts={[
          { label: "Deadline", value: formatDate(mentorship.application_deadline) },
          { label: "Cohort starts", value: formatDate(mentorship.cohort_start_date) },
          { label: "Duration", value: mentorship.duration_months ? `${mentorship.duration_months} months` : "" },
          { label: "Capacity", value: [mentorship.max_mentees ? `${mentorship.max_mentees} mentees` : "", mentorship.max_mentors ? `${mentorship.max_mentors} mentors` : ""].filter(Boolean).join(" · ") },
        ]}
        actions={[
          { label: "Back to mentorship", href: "/mentorship", variant: "secondary" },
          ...(compactText(mentorship.brochure_url) ? [{ label: "Download brochure", href: compactText(mentorship.brochure_url) }] : []),
        ]}
        imageSrc="/images/research/registrar-reirm-imagegen.png"
        imageAlt="Research mentorship programme and application information"
      />
      {error ? <section className="px-4 pt-4 sm:px-6 lg:px-8"><div className="mx-auto max-w-[1680px]"><StatusMessage tone="error">{error}</StatusMessage></div></section> : null}
      <ResearchSection eyebrow="Mentorship Pathway" title="Programme fit, expectations, and application window" body="Mentorship detail explains who the pathway serves, how it works, what applicants need, and how cohorts are organized." tone="white">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-5">
            <TextPanel title="Overview" fields={[["Summary", mentorship.summary], ["Description", mentorship.description], ["Objectives", mentorship.objectives], ["Benefits", mentorship.benefits]]} />
            <TextPanel title="Requirements and expectations" fields={[["Mentor requirements", mentorship.mentor_requirements], ["Mentee requirements", mentorship.mentee_requirements], ["Expectations", mentorship.expectations], ["Guidelines", mentorship.guidelines]]} />
          </div>
          <aside className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap gap-2"><Badge>{formatLabel(mentorship.program_type ?? "mentorship")}</Badge>{mentorship.status ? <Badge>{formatLabel(mentorship.status)}</Badge> : null}</div>
            <dl className="mt-5 grid gap-3 text-sm">
              <Fact label="Applications open" value={formatDate(mentorship.application_open)} />
              <Fact label="Deadline" value={formatDate(mentorship.application_deadline)} />
              <Fact label="Cohort starts" value={formatDate(mentorship.cohort_start_date)} />
              <Fact label="Cohort ends" value={formatDate(mentorship.cohort_end_date)} />
              <Fact label="Duration" value={mentorship.duration_months ? `${mentorship.duration_months} months` : ""} />
              <Fact label="Commitment" value={mentorship.commitment_hours_weekly ? `${mentorship.commitment_hours_weekly} hours weekly` : ""} />
              <Fact label="Capacity" value={[mentorship.max_mentees ? `${mentorship.max_mentees} mentees` : "", mentorship.max_mentors ? `${mentorship.max_mentors} mentors` : ""].filter(Boolean).join(" · ")} />
            </dl>
            {compactText(mentorship.brochure_url) ? <a href={mentorship.brochure_url} className="mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-full bg-primary px-4 text-sm font-semibold text-white">Download brochure</a> : null}
          </aside>
        </div>
      </ResearchSection>
      <ResearchSection eyebrow="Programme Records" title="Applications, matches, and contact" body="Embedded programme records are shown when published by the backend.">
        <div className="grid gap-5 lg:grid-cols-3">
          <RecordPanel title="Applications" records={applications} />
          <RecordPanel title="Matches" records={matches} />
          <TextPanel title="Contact" fields={[["Email", mentorship.contact_email], ["Phone", mentorship.contact_phone]]} />
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
  return <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"><h2 className="text-xl font-semibold text-slate-950">{title}</h2><div className="mt-4 divide-y divide-slate-200">{records.slice(0, 8).map((record, index) => <article key={record.id ?? `${title}-${index}`} className="py-4 first:pt-0 last:pb-0"><h3 className="text-base font-semibold text-slate-950">{record.project_title ?? record.name ?? record.title ?? record.application_type ?? `Record ${index + 1}`}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{compactText(record.motivation) || compactText(record.goals) || compactText(record.status) || "Additional details are not published yet."}</p></article>)}{records.length === 0 ? <p className="py-4 text-sm text-slate-600">No public records are linked yet.</p> : null}</div></section>;
}

function Fact({ label, value }: { label: string; value: string }) {
  return <div className="rounded-md bg-slate-50 p-3"><dt className="text-xs font-semibold uppercase text-slate-500">{label}</dt><dd className="mt-1 break-words font-semibold text-slate-950">{value || "Not published"}</dd></div>;
}
