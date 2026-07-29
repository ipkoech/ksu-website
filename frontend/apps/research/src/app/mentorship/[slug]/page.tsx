import { notFound } from "next/navigation";
import type { ResearchGenericRecord } from "@ksu/api-client";
import { researchServiceApi } from "@ksu/api-client";
import { ResearchDetailHero, ResearchDetailSidebar, ResearchRecordPanel } from "../../../components/research-detail";
import { ResearchSection, StatusMessage } from "../../../components/research-ui";
import { ResearchStoryAccordion } from "../../../components/research-rich-text";
import { compactText, formatDate, generateSlugParams, getMentorshipBySlug } from "../../../lib/research-public-data";
import { getNarrativeSections, getRecordSummary, getRecordTitle } from "../../../lib/research-page-model";

export const revalidate = 300;

export async function generateStaticParams() {
  return generateSlugParams(researchServiceApi.mentorship.list);
}

export default async function MentorshipDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { data, error } = await getMentorshipBySlug(slug);
  if (!data) notFound();
  const mentorship = data as ResearchGenericRecord;
  const applications = Array.isArray(mentorship.applications) ? (mentorship.applications as ResearchGenericRecord[]) : [];
  const matches = Array.isArray(mentorship.matches) ? (mentorship.matches as ResearchGenericRecord[]) : [];
  const title = getRecordTitle(mentorship, "Mentorship programme");
  const storySections = getNarrativeSections(mentorship, [
    { title: "Programme fit", fields: ["summary", "description", "objectives"] },
    { title: "Who can participate", fields: ["mentor_requirements", "mentee_requirements"] },
    { title: "What participants gain", fields: ["benefits", "outcomes"] },
    { title: "Expectations and guidance", fields: ["expectations", "guidelines"] },
  ]);

  return (
    <main id="research-main" className="min-h-screen bg-white">
      <ResearchDetailHero
        eyebrow="Mentorship"
        title={title}
        body={getRecordSummary(mentorship)}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Mentorship", href: "/mentorship" },
          { label: title },
        ]}
        labels={[mentorship.program_type ?? "mentorship", mentorship.status, mentorship.is_featured ? "featured" : null]}
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
        imageSrc={compactText(mentorship.cover_image_url) || "/images/research/research-about-hero.webp"}
        imageAlt="Research mentorship programme and application information"
      />
      {error ? <section className="px-4 pt-4 sm:px-6 lg:px-8"><div className="mx-auto max-w-[1680px]"><StatusMessage tone="error">{error}</StatusMessage></div></section> : null}
      <ResearchSection eyebrow="Mentorship Story" title="Programme fit, expectations, and application window" body="The mentorship record is grouped around fit, participation requirements, benefits, and cohort expectations." tone="white">
        <div className="grid grid-cols-[minmax(0,1fr)] gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="flex min-w-0 flex-col gap-5">
            <MentorshipStoryPanel sections={storySections} />
            {matches.length > 0 ? <ResearchRecordPanel title="Matches" records={matches} /> : null}
          </div>
          <ResearchDetailSidebar
            labels={[mentorship.program_type ?? "mentorship", mentorship.status]}
            facts={[
              { label: "Applications open", value: formatDate(mentorship.application_open) },
              { label: "Deadline", value: formatDate(mentorship.application_deadline) },
              { label: "Cohort starts", value: formatDate(mentorship.cohort_start_date) },
              { label: "Cohort ends", value: formatDate(mentorship.cohort_end_date) },
              { label: "Duration", value: mentorship.duration_months ? `${mentorship.duration_months} months` : "" },
              { label: "Commitment", value: mentorship.commitment_hours_weekly ? `${mentorship.commitment_hours_weekly} hours weekly` : "" },
              { label: "Capacity", value: [mentorship.max_mentees ? `${mentorship.max_mentees} mentees` : "", mentorship.max_mentors ? `${mentorship.max_mentors} mentors` : ""].filter(Boolean).join(" · ") },
            ]}
            actions={compactText(mentorship.brochure_url) ? [{ label: "Download brochure", href: compactText(mentorship.brochure_url) }] : []}
          />
        </div>
      </ResearchSection>
      <ResearchSection eyebrow="Programme Records" title="Applications, matches, and contact" body="Programme applications, matches, and contact details appear when published.">
        <div className="grid gap-5 lg:grid-cols-3">
          <ApplicationWindowCard record={mentorship} />
          {applications.length > 0 ? <ResearchRecordPanel title="Applications" records={applications} /> : null}
          {matches.length > 0 ? <ResearchRecordPanel title="Matches" records={matches} /> : null}
          <ContactPanel record={mentorship} />
        </div>
      </ResearchSection>
    </main>
  );
}

function MentorshipStoryPanel({ sections }: { sections: Array<{ title: string; body: string }> }) {
  return (
    <ResearchStoryAccordion
      sections={sections}
      empty="The mentorship story appears when fit, requirements, benefits, or expectations fields are published."
    />
  );
}

function ApplicationWindowCard({ record }: { record: ResearchGenericRecord }) {
  const items = [
    ["Applications open", formatDate(record.application_open)],
    ["Application deadline", formatDate(record.application_deadline)],
    ["Cohort start", formatDate(record.cohort_start_date)],
    ["Cohort end", formatDate(record.cohort_end_date)],
  ].filter(([, value]) => value);

  if (items.length === 0) return null;

  return (
    <section className="min-w-0 rounded-lg border border-border bg-white p-5 shadow-sm">
      <h2 className="text-xl font-semibold text-foreground">Application window</h2>
      <dl className="mt-4 grid gap-3 text-sm">
        {items.map(([label, value]) => (
          <div key={label} className="rounded-md bg-surface-subtle p-3">
            <dt className="text-xs font-semibold uppercase text-muted-foreground">{label}</dt>
            <dd className="mt-1 font-semibold text-foreground">{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

function ContactPanel({ record }: { record: ResearchGenericRecord }) {
  const items = [
    ["Email", compactText(record.contact_email)],
    ["Phone", compactText(record.contact_phone)],
  ].filter(([, value]) => value);

  return (
    <section className="min-w-0 rounded-lg border border-border bg-white p-5 shadow-sm">
      <h2 className="text-xl font-semibold text-foreground">Contact</h2>
      {items.length ? (
        <dl className="mt-4 grid gap-3 text-sm">
          {items.map(([label, value]) => <div key={label} className="rounded-md bg-surface-subtle p-3"><dt className="text-xs font-semibold uppercase text-muted-foreground">{label}</dt><dd className="mt-1 break-words font-semibold text-foreground">{value}</dd></div>)}
        </dl>
      ) : <p className="mt-3 text-sm leading-7 text-muted-foreground">Contact details are not published yet.</p>}
    </section>
  );
}
