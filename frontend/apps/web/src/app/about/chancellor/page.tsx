import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight, Mail, PenLine, PhoneCall, Quote } from "lucide-react";
import { PublicImage } from "@/components/public/public-image";
import { BreadcrumbTrail, PageShell } from "@/components/site-shell";
import { AboutPageLenis } from "@/components/ui/about-page-lenis";
import { getOverviewData } from "@/lib/about-data";

const CHANCELLOR_IMAGE =
  "/images/COUNCIL/Dr.SaraJ.Ruto-Chairperson-Edited.png";

function SectionKicker({ children }: { children: ReactNode }) {
  return (
    <p className="text-xs font-bold uppercase tracking-[0.16em] text-secondary">
      {children}
    </p>
  );
}

function splitMessageParagraphs(message?: string | null) {
  return (
    message
      ?.split(/\n{2,}/)
      .map((paragraph) => paragraph.trim())
      .filter(Boolean) ?? []
  );
}

function MessageFallback() {
  return (
    <p className="rounded-md border border-dashed border-slate-300 bg-slate-50 p-4 text-sm leading-7 text-slate-500">
      The Chancellor&apos;s message has not been published yet.
    </p>
  );
}

function ChancellorPortrait() {
  return (
    <aside className="motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-5">
      <div className="border border-slate-200 bg-white shadow-sm">
        <div className="bg-primary px-5 py-4 text-white">
          <SectionKicker>University leadership</SectionKicker>
          <p className="mt-2 text-lg font-semibold">The Chancellor</p>
        </div>
        <PublicImage
          src={CHANCELLOR_IMAGE}
          alt="Dr. Sara J. Ruto, The Chancellor"
          ratio="profile"
          priority
          sizes="(min-width: 1280px) 420px, (min-width: 1024px) 34vw, 100vw"
          className="rounded-none bg-slate-100"
          imageClassName="object-cover object-top"
        />
        <div className="border-t border-slate-200 p-5">
          <p className="text-xl font-bold text-slate-950">Dr. Sara J. Ruto</p>
          <p className="mt-1 text-sm font-semibold text-primary">
            The Chancellor
          </p>
          <div className="mt-5 h-0.5 w-14 bg-secondary" />
          <p className="mt-5 text-sm leading-7 text-slate-600">
            Providing ceremonial stewardship and institutional advocacy for
            Kisii University&apos;s public mandate.
          </p>
        </div>
      </div>
    </aside>
  );
}

function MessageSignature() {
  return (
    <div className="mt-10 border-t border-slate-200 pt-7">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-[family-name:var(--font-display)] text-2xl font-semibold text-primary">
            Dr. Sara J. Ruto
          </p>
          <p className="mt-1 text-sm font-bold uppercase tracking-[0.14em] text-slate-500">
            The Chancellor
          </p>
        </div>
        <PenLine aria-hidden className="h-8 w-8 text-secondary" />
      </div>
    </div>
  );
}

function MessageCtas() {
  return (
    <section className="bg-primary px-4 py-10 text-white sm:px-6 lg:px-8">
      <div className="grid max-w-none gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
        <div className="motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-4">
          <SectionKicker>Connect with Kisii University</SectionKicker>
          <h2 className="mt-3 max-w-3xl font-[family-name:var(--font-display)] text-3xl font-semibold leading-tight">
            Engage with a public university committed to academic excellence,
            research and community service.
          </h2>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href="/contact"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md border border-white/30 px-5 text-sm font-semibold text-white transition hover:bg-white hover:text-primary"
          >
            <PhoneCall aria-hidden className="h-4 w-4" />
            Contact Us
          </Link>
          <Link
            href="/admissions/how-to-apply"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-secondary px-5 text-sm font-semibold text-slate-950 transition hover:bg-white"
          >
            Apply Now
            <ArrowRight aria-hidden className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

export default async function LeadershipMessagePage() {
  const overview = await getOverviewData();
  const messageTitle =
    overview?.chancellor_message_title?.trim() ||
    "Message from the Chancellor";
  const paragraphs = splitMessageParagraphs(overview?.chancellor_message);

  return (
    <PageShell>
      <AboutPageLenis>
        <section className="overflow-hidden bg-white">
          <div className="max-w-none px-4 py-5 sm:px-6 lg:px-8">
            <BreadcrumbTrail
              items={[
                { label: "Home", href: "/" },
                { label: "About", href: "/about" },
                { label: "The Chancellor" },
              ]}
            />
          </div>

          <div className="grid max-w-none border-y border-slate-200 lg:grid-cols-[minmax(0,0.94fr)_minmax(360px,0.52fr)]">
            <div className="flex items-center px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
              <div className="max-w-5xl motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-4">
                <SectionKicker>Office of the Chancellor</SectionKicker>
                <h1 className="mt-4 font-[family-name:var(--font-display)] text-4xl font-semibold leading-tight text-primary sm:text-5xl lg:text-6xl">
                  {messageTitle}
                </h1>
                <p className="mt-5 max-w-3xl text-base leading-8 text-slate-700">
                  A message of stewardship, academic purpose and public service
                  from the Chancellor of Kisii University.
                </p>
              </div>
            </div>
            <div className="border-t border-slate-200 bg-slate-50 p-4 sm:p-6 lg:border-l lg:border-t-0 lg:p-8">
              <ChancellorPortrait />
            </div>
          </div>
        </section>

        <section className="bg-slate-50 px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid max-w-none gap-8 lg:grid-cols-[310px_minmax(0,1fr)]">
            <aside className="motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-4">
              <Quote aria-hidden className="h-8 w-8 text-primary" />
              <SectionKicker>Chancellor&apos;s message</SectionKicker>
              <h2 className="mt-3 text-3xl font-semibold leading-tight text-slate-950">
                Leadership grounded in service
              </h2>
              <p className="mt-4 text-sm leading-7 text-slate-600">
                The Chancellor&apos;s address is published from the university
                overview profile to keep this page aligned with official
                institutional records.
              </p>
            </aside>

            <article className="border border-slate-200 bg-white p-5 shadow-sm motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-5 sm:p-7 lg:p-9">
              {paragraphs.length ? (
                <div className="space-y-5 text-base leading-8 text-slate-700">
                  {paragraphs.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              ) : (
                <MessageFallback />
              )}
              <MessageSignature />
            </article>
          </div>
        </section>

        <section className="bg-white px-4 py-10 sm:px-6 lg:px-8">
          <div className="grid max-w-none gap-5 border-y border-slate-200 py-8 md:grid-cols-3">
            {[
              ["Institutional mandate", "Chartered public university"],
              ["Leadership office", "The Chancellor"],
              [
                "Official contact",
                overview?.email ?? "info@kisiiuniversity.ac.ke",
              ],
            ].map(([label, value]) => (
              <div
                key={label}
                className="flex min-h-24 items-center gap-4 border border-slate-200 bg-slate-50 p-4 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-4"
              >
                <Mail aria-hidden className="h-6 w-6 text-primary" />
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
                    {label}
                  </p>
                  <p className="mt-2 text-sm font-semibold text-slate-950">
                    {value}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <MessageCtas />
      </AboutPageLenis>
    </PageShell>
  );
}
