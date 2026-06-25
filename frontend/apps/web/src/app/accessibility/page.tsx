import Link from "next/link";
import { ArrowRight, Eye, Keyboard, Monitor, Phone } from "lucide-react";
import { BreadcrumbTrail, PageShell } from "@/components/site-shell";

export const metadata = {
  title: "Accessibility",
  description: "Kisii University accessibility statement and inclusive access guidance.",
};

export default function AccessibilityPage() {
  return (
    <PageShell>
      <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
        <BreadcrumbTrail
          items={[
            { label: "Home", href: "/" },
            { label: "Accessibility" },
          ]}
        />

        <div className="mt-8">
          <p className="text-sm font-semibold uppercase text-secondary">
            Accessibility
          </p>
          <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl font-semibold leading-tight text-slate-950">
            Accessibility and inclusive access
          </h1>
          <p className="mt-4 text-base leading-8 text-slate-600">
            Kisii University is committed to providing accessible public
            information and services for all users, including people with
            disabilities. This statement outlines our approach and how to get
            help.
          </p>
        </div>

        <div className="mt-10 space-y-8">
          <section>
            <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-slate-950">
              Our commitment
            </h2>
            <p className="mt-3 text-base leading-8 text-slate-600">
              We aim to ensure that this website and the public services it
              describes are perceivable, operable, understandable, and robust
              for the widest possible audience. We work toward conformance
              with the Web Content Accessibility Guidelines (WCAG) 2.1 at
              Level AA as the standard for public digital information.
            </p>
          </section>

          <section>
            <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-slate-950">
              Measures we take
            </h2>
            <p className="mt-3 text-base leading-8 text-slate-600">
              Accessibility is integrated into the design and maintenance of
              this website through structured page headings, keyboard-navigable
              controls, visible focus indicators, descriptive link text,
              semantic HTML landmarks, and responsive layouts that adapt across
              devices and screen sizes.
            </p>
          </section>

          <section>
            <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-slate-950">
              How to get help
            </h2>
            <p className="mt-3 text-base leading-8 text-slate-600">
              If you encounter a barrier while using this website or need
              information in an alternative format, please contact the
              university. We will work to provide the information you need
              through an accessible channel.
            </p>
          </section>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {[
            {
              icon: Phone,
              title: "Contact support",
              body: "Reach the university for help with accessing information.",
              href: "/contact",
            },
            {
              icon: Monitor,
              title: "Student support",
              body: "Wellbeing, health, and accessibility guidance for students.",
              href: "/campus-life/support",
            },
            {
              icon: Keyboard,
              title: "Digital services",
              body: "Access the student and staff portal for authenticated services.",
              href: "https://portal.kisiiuniversity.ac.ke",
            },
          ].map((item) => {
            const Icon = item.icon;
            const external = /^https?:\/\//i.test(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                target={external ? "_blank" : undefined}
                rel={external ? "noopener noreferrer" : undefined}
                className="group rounded-[1.25rem] border border-slate-200 bg-white p-5 shadow-sm transition hover:border-primary/30 hover:shadow-md"
              >
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon aria-hidden className="h-5 w-5" />
                </span>
                <h3 className="mt-4 font-[family-name:var(--font-display)] text-lg font-semibold text-slate-950">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {item.body}
                </p>
                <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-primary">
                  Open page
                  <ArrowRight aria-hidden className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
                </span>
              </Link>
            );
          })}
        </div>

        <div className="mt-12 rounded-[1.25rem] border border-blue-100 bg-blue-50/60 p-6">
          <div className="flex items-start gap-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Eye aria-hidden className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-lg font-semibold text-slate-950">
                Report an accessibility issue
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                If you find a problem with the accessibility of this website
                or have suggestions for improvement, please let us know
                through the official contact channels.
              </p>
              <Link
                href="/contact"
                className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-secondary"
              >
                Report an issue
                <ArrowRight aria-hidden className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </article>
    </PageShell>
  );
}
