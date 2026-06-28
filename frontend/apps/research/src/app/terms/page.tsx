import type { Metadata } from "next";
import { ResearchClusterHero } from "../../components/research-cluster";
import { ResearchSection, StatusMessage } from "../../components/research-ui";

export const metadata: Metadata = {
  title: "Terms of Use",
  description: "Terms of use for the Kisii University Research Portal.",
};

export default function TermsPage() {
  return (
    <main id="research-main" className="min-h-screen bg-white">
      <ResearchClusterHero
        eyebrow="Legal"
        title="Terms of use"
        body="The terms that govern your use of the Kisii University Research Portal."
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Terms" },
        ]}
        imageSrc="/images/research/research-about-hero.svg"
        imageAlt="Kisii University Research Portal terms and legal information"
        links={[]}
        stats={[]}
        primaryAction={{ label: "Return home", href: "/" }}
      />

      <ResearchSection
        eyebrow="Terms"
        title="Portal usage terms"
        body="This research portal follows the Kisii University terms of use."
        tone="white"
      >
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm leading-7 text-slate-600">
            This research portal is operated by Kisii University and follows the
            university&apos;s institutional terms of use. By accessing and using
            this portal, you agree to comply with the terms and conditions
            published on the main university website.
          </p>
          <div className="mt-5">
            <a
              href="https://kisiiuniversity.ac.ke/terms"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
            >
              View full terms of use
            </a>
          </div>
        </div>
      </ResearchSection>

      <ResearchSection
        eyebrow="Contact"
        title="Questions about terms"
        body="If you have questions about these terms, contact the research office."
      >
        <div className="flex flex-col gap-4">
          <StatusMessage tone="neutral">
            For terms-related inquiries, please use the main university contact
            channels listed on the university terms of use page.
          </StatusMessage>
        </div>
      </ResearchSection>
    </main>
  );
}
