import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { ScrollReveal, ScrollRevealGroup } from "@ksu/ui/components";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Kisii University Research Portal data privacy and information handling policy.",
};

const sections = [
  {
    title: "Information we collect",
    body: "The Research Portal collects information necessary for research administration, innovation support, partnerships, events, inquiries, downloads, and public service delivery. This may include names, contact details, institutional affiliations, inquiry details, application information, and usage data from portal services.",
  },
  {
    title: "How we use information",
    body: "Information is used for the purpose for which it was collected, including research support, grant and project administration, event coordination, resource access, partner engagement, communications, and compliance with university and legal obligations. Kisii University does not sell personal information to third parties.",
  },
  {
    title: "Research records and confidentiality",
    body: "Research records may include proposal, ethics, grant, publication, collaboration, and innovation information. Access to confidential or restricted records is managed according to university policy, applicable approvals, and relevant legal or funder requirements.",
  },
  {
    title: "Data retention and security",
    body: "The university retains information for as long as necessary to fulfil the purpose for which it was collected, support institutional records, or meet legal and funder obligations. Appropriate technical and organisational measures are used to protect information against unauthorised access, alteration, disclosure, or destruction.",
  },
  {
    title: "Your rights",
    body: "Under the Data Protection Act, 2019, you may request access, correction, deletion, objection, or restriction of processing where applicable. Requests should be made through official Kisii University contact channels or the REIRM office where the matter concerns research portal records.",
  },
  {
    title: "Third-party services",
    body: "The portal may link to external systems including NACOSTI, funder portals, library platforms, repositories, publication systems, and partner websites. Each external service has its own privacy practices, and users should review those notices when accessing them.",
  },
];

export default function PrivacyPage() {
  return (
    <main id="research-main" className="min-h-screen bg-[hsl(var(--surface-muted))]">
      <LegalMasthead
        eyebrow="Privacy Policy"
        title="Data privacy and information handling"
        body="How the Kisii University Research Portal handles personal information, research support records, and public service data."
        current="Privacy Policy"
      />

      <article className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <ScrollRevealGroup className="space-y-8" staggerDelay={90}>
          {sections.map((section) => (
            <section key={section.title} className="rounded-lg border border-border bg-white p-6 shadow-sm">
              <h2 className="font-display text-2xl font-semibold text-foreground">
                {section.title}
              </h2>
              <p className="mt-3 text-base leading-8 text-muted-foreground">
                {section.body}
              </p>
            </section>
          ))}
        </ScrollRevealGroup>

        <ScrollReveal className="mt-10 rounded-lg border border-primary/15 bg-white p-6 shadow-[0_20px_70px_rgba(15,23,42,0.06)]">
          <div className="flex items-start gap-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
              <ShieldCheck aria-hidden className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                Data protection contact
              </h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                For privacy enquiries or requests about research portal records,
                contact the REIRM office. Broader institutional requests may be
                routed through central university administration.
              </p>
              <Link
                href="/connect"
                className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-secondary"
              >
                Contact REIRM
                <ArrowRight aria-hidden className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </ScrollReveal>
      </article>
    </main>
  );
}

function LegalMasthead({
  eyebrow,
  title,
  body,
  current,
}: {
  eyebrow: string;
  title: string;
  body: string;
  current: string;
}) {
  return (
    <section className="border-b border-border bg-white px-4 py-8 sm:px-6 lg:px-8 lg:py-10 xl:px-10 2xl:px-12">
      <ScrollReveal className="mx-auto max-w-[1680px]">
        <nav className="mb-5 flex flex-wrap items-center gap-2 text-xs font-semibold text-muted-foreground" aria-label="Breadcrumb">
          <Link href="/" className="transition hover:text-primary">Home</Link>
          <span className="text-muted-foreground/60">/</span>
          <span className="text-foreground">{current}</span>
        </nav>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-secondary">
          {eyebrow}
        </p>
        <h1 className="mt-3 max-w-5xl font-display text-4xl font-semibold leading-tight text-foreground">
          {title}
        </h1>
        <p className="mt-4 max-w-4xl text-base leading-8 text-muted-foreground">
          {body}
        </p>
      </ScrollReveal>
    </section>
  );
}
