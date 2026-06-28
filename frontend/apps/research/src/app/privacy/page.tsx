import type { Metadata } from "next";
import { ResearchClusterHero } from "../../components/research-cluster";
import { ResearchSection, StatusMessage } from "../../components/research-ui";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy policy for the Kisii University Research Portal.",
};

export default function PrivacyPage() {
  return (
    <main id="research-main" className="min-h-screen bg-white">
      <ResearchClusterHero
        eyebrow="Legal"
        title="Privacy policy"
        body="How the Kisii University Research Portal handles personal data and your privacy."
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Privacy" },
        ]}
        imageSrc="/images/research/research-about-hero.svg"
        imageAlt="Kisii University Research Portal privacy and legal information"
        links={[]}
        stats={[]}
        primaryAction={{ label: "Return home", href: "/" }}
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
