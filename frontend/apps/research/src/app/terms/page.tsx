import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, FileText } from "lucide-react";
import { ScrollReveal, ScrollRevealGroup } from "@ksu/ui/components";

export const metadata: Metadata = {
  title: "Terms of Use",
  description: "Kisii University Research Portal terms of use and public access guidance.",
};

const sections = [
  {
    title: "Purpose of this portal",
    body: "The Research Portal provides public information about Kisii University research, innovation, extension, resource mobilization, funding opportunities, partnerships, publications, services, events, resources, and institutional research support.",
  },
  {
    title: "Accuracy of information",
    body: "Kisii University makes reasonable efforts to keep portal information accurate and current. Users should verify time-sensitive notices, funding deadlines, application requirements, ethics procedures, event details, and official documents through the relevant office or linked official source.",
  },
  {
    title: "Research resources and downloads",
    body: "Policies, guidelines, forms, templates, and downloads are provided for public information and research support. Users must confirm current requirements with REIRM or the responsible unit before relying on a document for formal submissions.",
  },
  {
    title: "External links and third-party systems",
    body: "The portal may link to NACOSTI, funder portals, partner websites, repositories, journals, library systems, and other third-party services. Those services are governed by their own terms, policies, and availability.",
  },
  {
    title: "Intellectual property",
    body: "Portal content, including text, images, logos, documents, and multimedia, is owned by Kisii University or used under licence unless otherwise stated. Content may be used for personal, academic, and non-commercial reference. Redistribution or commercial use requires permission.",
  },
  {
    title: "Acceptable use",
    body: "Users must not use this portal in any way that damages, disrupts, overloads, or impairs university systems. Users must not conduct unlawful, fraudulent, harmful, automated, or systematic data collection without express university consent.",
  },
  {
    title: "Changes to these terms",
    body: "These terms may be updated from time to time. The current version is maintained on this page. Continued use of the Research Portal after changes constitutes acceptance of the revised terms.",
  },
];

export default function TermsPage() {
  return (
    <main id="research-main" className="min-h-screen bg-[#f4f6f4]">
      <LegalMasthead
        eyebrow="Terms of Use"
        title="Research portal terms and public use guidance"
        body="The terms that govern use of the Kisii University Research Portal, public research records, resources, and linked research services."
        current="Terms of Use"
      />

      <article className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <ScrollRevealGroup className="space-y-8" staggerDelay={90}>
          {sections.map((section) => (
            <section key={section.title} className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-slate-950">
                {section.title}
              </h2>
              <p className="mt-3 text-base leading-8 text-slate-600">
                {section.body}
              </p>
            </section>
          ))}
        </ScrollRevealGroup>

        <ScrollReveal className="mt-10 rounded-lg border border-primary/15 bg-white p-6 shadow-[0_20px_70px_rgba(15,23,42,0.06)]">
          <div className="flex items-start gap-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
              <FileText aria-hidden className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-lg font-semibold text-slate-950">
                Questions about these terms
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                For enquiries about research portal records, resources,
                partnerships, or public research communications, contact the
                REIRM office.
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
    <section className="border-b border-slate-200 bg-white px-4 py-8 sm:px-6 lg:px-8 lg:py-10 xl:px-10 2xl:px-12">
      <ScrollReveal className="mx-auto max-w-[1680px]">
        <nav className="mb-5 flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500" aria-label="Breadcrumb">
          <Link href="/" className="transition hover:text-primary">Home</Link>
          <span className="text-slate-300">/</span>
          <span className="text-slate-900">{current}</span>
        </nav>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-secondary">
          {eyebrow}
        </p>
        <h1 className="mt-3 max-w-5xl font-[family-name:var(--font-display)] text-4xl font-semibold leading-tight text-slate-950">
          {title}
        </h1>
        <p className="mt-4 max-w-4xl text-base leading-8 text-slate-600">
          {body}
        </p>
      </ScrollReveal>
    </section>
  );
}
