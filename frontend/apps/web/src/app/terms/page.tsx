import Link from "next/link";
import { ArrowRight, FileText } from "lucide-react";
import { BreadcrumbTrail, PageShell } from "@/components/site-shell";

export const metadata = {
  title: "Terms of Use",
  description: "Kisii University website terms of use and public access guidance.",
};

export default function TermsPage() {
  return (
    <PageShell>
      <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
        <BreadcrumbTrail
          items={[
            { label: "Home", href: "/" },
            { label: "Terms of Use" },
          ]}
        />

        <div className="mt-8">
          <p className="text-sm font-semibold uppercase text-secondary">
            Terms of Use
          </p>
          <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl font-semibold leading-tight text-slate-950">
            Website terms and public use guidance
          </h1>
          <p className="mt-4 text-base leading-8 text-slate-600">
            By accessing and using the Kisii University website, you agree to
            these terms. If you do not agree, please do not use this website.
          </p>
        </div>

        <div className="mt-10 space-y-8">
          <section>
            <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-slate-950">
              Purpose of this website
            </h2>
            <p className="mt-3 text-base leading-8 text-slate-600">
              This website provides public information about Kisii University
              programmes, services, policies, news, events, and institutional
              records. It is intended for informational use by students,
              staff, applicants, partners, and the general public.
            </p>
          </section>

          <section>
            <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-slate-950">
              Accuracy of information
            </h2>
            <p className="mt-3 text-base leading-8 text-slate-600">
              The university makes reasonable efforts to ensure that
              information published on this website is accurate and current.
              However, users should verify time-sensitive notices, admission
              deadlines, examination timetables, fee structures, and
              programme requirements through the official channels linked on
              the relevant pages.
            </p>
          </section>

          <section>
            <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-slate-950">
              External links and third-party systems
            </h2>
            <p className="mt-3 text-base leading-8 text-slate-600">
              This website links to external university systems including
              the student portal, digital service centre, e-learning
              platform, library catalogue, and research repository. These
              systems are governed by their own terms of use and privacy
              practices. The university is not responsible for the content
              or availability of external non-university websites.
            </p>
          </section>

          <section>
            <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-slate-950">
              Intellectual property
            </h2>
            <p className="mt-3 text-base leading-8 text-slate-600">
              All content on this website — including text, images, logos,
              documents, and multimedia — is the property of Kisii
              University or used under licence. Content may be used for
              personal, non-commercial reference. Reproduction,
              redistribution, or commercial use requires prior written
              permission from the university.
            </p>
          </section>

          <section>
            <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-slate-950">
              Acceptable use
            </h2>
            <p className="mt-3 text-base leading-8 text-slate-600">
              Users must not use this website in any way that causes damage,
              impairs availability or accessibility, or is unlawful,
              fraudulent, or harmful. Users must not conduct systematic data
              collection — including scraping — without the university's
              express consent.
            </p>
          </section>

          <section>
            <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-slate-950">
              Limitation of liability
            </h2>
            <p className="mt-3 text-base leading-8 text-slate-600">
              To the fullest extent permitted by law, Kisii University shall
              not be liable for any loss or damage arising from the use of
              this website or reliance on its content. This includes direct,
              indirect, or consequential loss relating to academic,
              financial, or personal decisions made based on website
              information.
            </p>
          </section>

          <section>
            <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-slate-950">
              Changes to these terms
            </h2>
            <p className="mt-3 text-base leading-8 text-slate-600">
              These terms may be updated at any time. The current version is
              maintained on this page. Continued use of the website after
              changes constitutes acceptance of the revised terms.
            </p>
          </section>
        </div>

        <div className="mt-12 rounded-[1.25rem] border border-blue-100 bg-blue-50/60 p-6">
          <div className="flex items-start gap-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <FileText aria-hidden className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-lg font-semibold text-slate-950">
                Questions about these terms
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                For enquiries about these terms or institutional
                communications, contact the university through the official
                channels.
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
