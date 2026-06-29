import type { Metadata } from "next";
import Link from "next/link";
import { PrimaryLink, ResearchSection, StatusMessage } from "../../components/research-ui";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy policy for the Kisii University Research Portal.",
};

export default function PrivacyPage() {
  return (
    <main id="research-main" className="min-h-screen bg-white">
      <LegalMasthead
        title="Privacy policy"
        body="How the Kisii University Research Portal handles personal data and privacy."
        current="Privacy"
      />

      <ResearchSection
        eyebrow="Your Privacy"
        title="Data protection and confidentiality"
        body="This research portal follows the Kisii University privacy policy."
        tone="white"
      >
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm leading-7 text-slate-600">
            This research portal is operated by Kisii University and follows the
            university&apos;s institutional privacy policy for all data collection,
            processing, and retention practices. The full privacy policy is maintained
            on the main university website.
          </p>
          <div className="mt-5">
            <a
              href="https://kisiiuniversity.ac.ke/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
            >
              View full privacy policy
            </a>
          </div>
        </div>
      </ResearchSection>

      <ResearchSection
        eyebrow="Contact"
        title="Questions about your data"
        body="If you have questions about privacy or data practices, contact the research office or the university data protection officer."
      >
        <div className="flex flex-col gap-4">
          <StatusMessage tone="neutral">
            For privacy-related inquiries, please use the main university contact
            channels listed on the university privacy policy page.
          </StatusMessage>
        </div>
      </ResearchSection>
    </main>
  );
}

function LegalMasthead({ title, body, current }: { title: string; body: string; current: string }) {
  return (
    <section className="border-b border-slate-200 bg-white px-4 py-6 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
      <div className="mx-auto max-w-[1680px]">
        <nav className="mb-4 flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500" aria-label="Breadcrumb">
          <Link href="/" className="transition hover:text-primary">Home</Link>
          <span className="text-slate-300">/</span>
          <span className="text-slate-900">{current}</span>
        </nav>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-secondary">Legal</p>
        <h1 className="mt-3 max-w-5xl text-balance font-[family-name:var(--font-display)] text-3xl font-semibold leading-tight text-slate-950 sm:text-4xl">{title}</h1>
        <p className="mt-3 max-w-4xl text-pretty text-sm leading-7 text-slate-700 sm:text-base">{body}</p>
        <div className="mt-4">
          <PrimaryLink href="/">Return home</PrimaryLink>
        </div>
      </div>
    </section>
  );
}
