import Link from "next/link";
import {
  Mail,
  Send,
  ShieldCheck,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import { PublicImage } from "@/components/public/public-image";
import { BreadcrumbTrail, PageShell } from "@/components/site-shell";
import { AboutPageLenis } from "@/components/ui/about-page-lenis";
import { getOverviewData } from "@/lib/about-data";

const VICE_CHANCELLOR_IMAGE =
  "/images/backgrounds/KSUB-RollPhotos2025-123.jpg";

function splitMessageParagraphs(message?: string | null) {
  return (
    message
      ?.split(/\n{2,}/)
      .map((paragraph) => paragraph.trim())
      .filter(Boolean) ?? []
  );
}

function EmptyMessage() {
  return (
    <p className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-5 text-sm leading-7 text-slate-500">
      The Vice Chancellor message has not been published yet.
    </p>
  );
}

function CallToAction({
  href,
  label,
  icon: Icon,
  primary = false,
}: {
  href: string;
  label: string;
  icon: LucideIcon;
  primary?: boolean;
}) {
  return (
    <Link
      href={href}
      className={
        primary
          ? "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-primary px-5 text-sm font-semibold text-white transition hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          : "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-950 transition hover:border-primary/40 hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
      }
    >
      <Icon aria-hidden className="h-4 w-4" />
      {label}
    </Link>
  );
}

export default async function LeadershipMessagePage() {
  const overview = await getOverviewData();
  const title =
    overview?.vc_message_title?.trim() || "Message from the Vice Chancellor";
  const paragraphs = splitMessageParagraphs(overview?.vc_message);

  return (
    <PageShell>
      <AboutPageLenis>
        <section className="border-b border-slate-200 bg-white px-4 py-6 sm:px-6 lg:px-8">
          <div className="max-w-none">
            <BreadcrumbTrail
              items={[
                { label: "Home", href: "/" },
                { label: "About", href: "/about" },
                { label: "The Vice Chancellor" },
              ]}
            />
          </div>
        </section>

        <section className="bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid max-w-none gap-8 lg:grid-cols-[minmax(360px,0.78fr)_minmax(0,1fr)] lg:items-stretch">
            <aside className="motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-left-4 motion-safe:duration-700">
              <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
                <PublicImage
                  src={VICE_CHANCELLOR_IMAGE}
                  alt="Kisii University Vice Chancellor"
                  ratio="hero"
                  priority
                  sizes="(min-width: 1280px) 42vw, (min-width: 1024px) 44vw, 100vw"
                  imageClassName="object-[50%_22%]"
                  className="rounded-none"
                />
                <div className="border-t border-slate-200 bg-slate-50 p-5">
                  <div className="flex items-start gap-4">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-primary text-white">
                      <UserRound aria-hidden className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.16em] text-secondary">
                        Office of the Vice Chancellor
                      </p>
                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        Executive leadership for academic excellence, research,
                        innovation, and service at Kisii University.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </aside>

            <article className="flex min-h-full flex-col rounded-lg border border-slate-200 bg-white shadow-sm motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-4 motion-safe:duration-700">
              <div className="border-b border-slate-200 p-6 sm:p-8 lg:p-10">
                <div className="flex items-center gap-3 text-primary">
                  <ShieldCheck aria-hidden className="h-5 w-5" />
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-secondary">
                    Kisii University Leadership
                  </p>
                </div>
                <h1 className="mt-4 font-[family-name:var(--font-display)] text-3xl font-semibold leading-tight text-slate-950 sm:text-4xl lg:text-5xl">
                  {title}
                </h1>
                <div className="mt-5 h-1 w-20 rounded-full bg-secondary" />
              </div>

              <div className="flex flex-1 flex-col justify-between p-6 sm:p-8 lg:p-10">
                <div className="space-y-5 text-base leading-8 text-slate-700">
                  {paragraphs.length ? (
                    paragraphs.map((paragraph) => (
                      <p
                        key={paragraph}
                        className="motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-3 motion-safe:duration-700"
                      >
                        {paragraph}
                      </p>
                    ))
                  ) : (
                    <EmptyMessage />
                  )}
                </div>

                <div className="mt-9 border-t border-slate-200 pt-6">
                  <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-950">
                        The Vice Chancellor
                      </p>
                      <p className="mt-1 text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
                        Kisii University
                      </p>
                    </div>
                    <div className="flex flex-col gap-3 sm:flex-row">
                      <CallToAction
                        href="/contact"
                        label="Contact Us"
                        icon={Mail}
                      />
                      <CallToAction
                        href="/admissions/apply"
                        label="Apply Now"
                        icon={Send}
                        primary
                      />
                    </div>
                  </div>
                </div>
              </div>
            </article>
          </div>
        </section>
      </AboutPageLenis>
    </PageShell>
  );
}
