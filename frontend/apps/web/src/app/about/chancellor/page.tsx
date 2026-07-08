import Link from "next/link";
import type { ReactNode } from "react";
import {
  ArrowRight,
  Award,
  Landmark,
  PhoneCall,
  Quote,
  Scale,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import { PublicImage } from "@/components/public/public-image";
import { BreadcrumbTrail, PageShell } from "@/components/site-shell";
import { AboutPageLenis } from "@/components/ui/about-page-lenis";
import { getOverviewData } from "@/lib/about-data";

const CHANCELLOR_IMAGE =
  "/images/COUNCIL/Dr.SaraJ.Ruto-Chairperson-Edited.png";

const FALLBACK_CHANCELLOR_MESSAGE = [
  "The Chancellor is the titular head of Kisii University. In the name of the University, the Chancellor confers degrees and awards diplomas, certificates, and other awards in consultation with the University Council and Senate.",
  "The office also provides institutional counsel by advising the Council from time to time and, where necessary, recommending to the Cabinet Secretary for Education that a visitation of the University be undertaken.",
  "This stewardship connects ceremonial authority, public accountability, and the academic mission of a chartered public university committed to quality education, research, innovation, and service to humanity.",
];

const CHANCELLOR_MANDATES = [
  {
    title: "Ceremonial authority",
    body: "Confers degrees and awards diplomas, certificates, and other University awards.",
    icon: Award,
  },
  {
    title: "Council counsel",
    body: "May give advice to the University Council from time to time.",
    icon: Scale,
  },
  {
    title: "Public stewardship",
    body: "Links the University charter, Council, Senate, and national education mandate.",
    icon: ShieldCheck,
  },
];

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

function fallbackParagraphs(message: string | null | undefined) {
  const backendParagraphs = splitMessageParagraphs(message);
  return backendParagraphs.length ? backendParagraphs : FALLBACK_CHANCELLOR_MESSAGE;
}

function LeadershipMandateCard({
  title,
  body,
  icon: Icon,
  index,
}: {
  title: string;
  body: string;
  icon: LucideIcon;
  index: number;
}) {
  return (
    <article
      className="group border border-slate-200 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-4"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <span className="flex h-12 w-12 items-center justify-center rounded-md bg-primary/10 text-primary transition group-hover:bg-primary group-hover:text-white">
        <Icon aria-hidden className="h-6 w-6" />
      </span>
      <h3 className="mt-5 text-lg font-semibold text-slate-950">{title}</h3>
      <p className="mt-3 text-sm leading-7 text-slate-600">{body}</p>
    </article>
  );
}

function MessageCtas() {
  return (
    <section className="bg-slate-950 px-4 py-12 text-white sm:px-6 lg:px-8">
      <div className="grid max-w-none gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
        <div>
          <SectionKicker>Connect with Kisii University</SectionKicker>
          <h2 className="mt-3 max-w-4xl font-[family-name:var(--font-display)] text-3xl font-semibold leading-tight">
            Engage with a public university guided by accountable leadership,
            academic excellence, research, and service.
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
  const paragraphs = fallbackParagraphs(overview?.chancellor_message);

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

          <div className="grid max-w-none border-y border-slate-200 lg:grid-cols-[minmax(0,1fr)_minmax(320px,420px)]">
            <div className="flex items-center px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
              <div className="max-w-5xl motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-5">
                <SectionKicker>Office of the Chancellor</SectionKicker>
                <h1 className="mt-4 font-[family-name:var(--font-display)] text-4xl font-semibold leading-tight text-primary sm:text-5xl lg:text-6xl">
                  {messageTitle}
                </h1>
                <p className="mt-5 max-w-3xl text-base leading-8 text-slate-700">
                  The Chancellor&apos;s office represents ceremonial authority,
                  institutional counsel, and public stewardship within Kisii
                  University&apos;s governance structure.
                </p>
                <div className="mt-8 grid gap-3 sm:grid-cols-3">
                  {["Titular head", "Council advice", "Awards authority"].map(
                    (item) => (
                      <div
                        key={item}
                        className="border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700"
                      >
                        {item}
                      </div>
                    ),
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center border-t border-slate-200 bg-slate-50 p-4 sm:p-6 lg:border-l lg:border-t-0 lg:p-8">
              <div className="mx-auto w-full max-w-[340px] border border-slate-200 bg-white shadow-sm motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-right-5">
                <PublicImage
                  src={CHANCELLOR_IMAGE}
                  alt="Dr. Sara J. Ruto, The Chancellor"
                  ratio="profile"
                  priority
                  sizes="(min-width: 1280px) 340px, (min-width: 1024px) 28vw, 100vw"
                  className="rounded-none bg-slate-100"
                  imageClassName="object-cover object-top"
                />
                <div className="border-t border-slate-200 p-5">
                  <p className="text-2xl font-bold text-slate-950">
                    Dr. Sara J. Ruto
                  </p>
                  <p className="mt-1 text-sm font-semibold text-primary">
                    The Chancellor
                  </p>
                  <div className="mt-5 h-0.5 w-16 bg-secondary" />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-slate-50 px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid max-w-none gap-8 lg:grid-cols-[minmax(260px,320px)_minmax(0,1fr)]">
            <div className="sticky top-24 self-start">
              <Quote aria-hidden className="h-8 w-8 text-primary" />
              <SectionKicker>Leadership message</SectionKicker>
              <h2 className="mt-3 text-3xl font-semibold leading-tight text-slate-950">
                Stewardship anchored in governance
              </h2>
              <p className="mt-4 text-sm leading-7 text-slate-600">
                Backend content is used when available. If it is missing, this
                page falls back to handbook-based governance content.
              </p>
            </div>

            <article className="relative overflow-hidden border border-slate-200 bg-white p-5 shadow-sm motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-5 sm:p-7 lg:p-10">
              <Quote
                aria-hidden
                className="absolute right-6 top-6 h-16 w-16 text-primary/10"
              />
              <div className="relative space-y-6 text-base leading-8 text-slate-700 lg:text-lg lg:leading-9">
                {paragraphs.map((paragraph, index) => (
                  <p
                    key={paragraph}
                    className={
                      index === 0
                        ? "border-l-4 border-secondary pl-5 font-medium text-slate-950"
                        : undefined
                    }
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
              <div className="mt-10 border-t border-slate-200 pt-7">
                <p className="font-[family-name:var(--font-display)] text-2xl font-semibold text-primary">
                  Dr. Sara J. Ruto
                </p>
                <p className="mt-1 text-sm font-bold uppercase tracking-[0.14em] text-slate-500">
                  The Chancellor
                </p>
              </div>
            </article>
          </div>
        </section>

        <section className="bg-white px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid max-w-none gap-4 md:grid-cols-3">
            {CHANCELLOR_MANDATES.map((item, index) => (
              <LeadershipMandateCard key={item.title} {...item} index={index} />
            ))}
          </div>
        </section>

        <section className="bg-white px-4 py-10 sm:px-6 lg:px-8">
          <div className="max-w-none border-y border-slate-200 py-10">
            <Landmark aria-hidden className="h-7 w-7 text-primary" />
            <SectionKicker>Governance context</SectionKicker>
            <h2 className="mt-3 max-w-3xl text-3xl font-semibold leading-tight text-slate-950">
              The Chancellor works within a governance structure that includes
              Council, Senate, and University Management.
            </h2>
          </div>
        </section>

        <MessageCtas />
      </AboutPageLenis>
    </PageShell>
  );
}
