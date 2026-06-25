import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { BreadcrumbTrail, PageShell } from "@/components/site-shell";

export const metadata = {
  title: "Privacy Policy",
  description: "Kisii University data privacy and information handling policy.",
};

export default function PrivacyPage() {
  return (
    <PageShell>
      <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
        <BreadcrumbTrail
          items={[
            { label: "Home", href: "/" },
            { label: "Privacy Policy" },
          ]}
        />

        <div className="mt-8">
          <p className="text-sm font-semibold uppercase text-secondary">
            Privacy Policy
          </p>
          <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl font-semibold leading-tight text-slate-950">
            Data privacy and information handling
          </h1>
          <p className="mt-4 text-base leading-8 text-slate-600">
            Kisii University is committed to responsible handling of personal
            information in accordance with the Data Protection Act, 2019 and
            the university's institutional policies.
          </p>
        </div>

        <div className="mt-10 space-y-8">
          <section>
            <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-slate-950">
              Information we collect
            </h2>
            <p className="mt-3 text-base leading-8 text-slate-600">
              The university collects personal information necessary for
              teaching, learning, research, administration, and service
              delivery. This may include names, contact details, academic
              records, employment data, and other information provided
              through university forms, applications, registrations, and
              digital services.
            </p>
          </section>

          <section>
            <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-slate-950">
              How we use information
            </h2>
            <p className="mt-3 text-base leading-8 text-slate-600">
              Personal information is used for the purposes for which it was
              collected, including academic administration, student services,
              human resources, research management, library services,
              communications, security, and compliance with legal obligations.
              The university does not sell personal information to third
              parties.
            </p>
          </section>

          <section>
            <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-slate-950">
              Data retention and security
            </h2>
            <p className="mt-3 text-base leading-8 text-slate-600">
              The university retains personal information for as long as
              necessary to fulfil the purposes for which it was collected, or
              as required by law. Appropriate technical and organisational
              measures are in place to protect personal information against
              unauthorised access, alteration, disclosure, or destruction.
            </p>
          </section>

          <section>
            <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-slate-950">
              Your rights
            </h2>
            <p className="mt-3 text-base leading-8 text-slate-600">
              Under the Data Protection Act, 2019, you have the right to
              access, correct, and request deletion of your personal
              information held by the university. You may also object to
              processing or request restriction of processing in certain
              circumstances. To exercise these rights, contact the
              university through the official channels below.
            </p>
          </section>

          <section>
            <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-slate-950">
              Third-party services
            </h2>
            <p className="mt-3 text-base leading-8 text-slate-600">
              The university website links to external systems including the
              student portal, digital service centre, library platforms, and
              research repositories. Each external system has its own privacy
              practices. Users should review the privacy notices applicable
              to those systems when accessing them.
            </p>
          </section>

          <section>
            <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-slate-950">
              Changes to this policy
            </h2>
            <p className="mt-3 text-base leading-8 text-slate-600">
              This privacy policy may be updated from time to time. The
              current version is maintained on this page. Material changes
              will be communicated through university channels.
            </p>
          </section>
        </div>

        <div className="mt-12 rounded-[1.25rem] border border-blue-100 bg-blue-50/60 p-6">
          <div className="flex items-start gap-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <ShieldCheck aria-hidden className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-lg font-semibold text-slate-950">
                Data protection contact
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                For privacy enquiries or to exercise your data protection
                rights, contact the university through the official contact
                channels. The Data Protection Officer can be reached through
                the university's central administration.
              </p>
              <Link
                href="/contact"
                className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-secondary"
              >
                Contact the university
                <ArrowRight aria-hidden className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </article>
    </PageShell>
  );
}
