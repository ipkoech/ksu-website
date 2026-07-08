import type { ReactNode } from "react";
import { Quote } from "lucide-react";
import { PublicImage } from "@/components/public/public-image";
import { BreadcrumbTrail, PageShell } from "@/components/site-shell";
import { AboutPageLenis } from "@/components/ui/about-page-lenis";
import { getOverviewData } from "@/lib/about-data";

const VICE_CHANCELLOR_IMAGE =
  "/images/backgrounds/KSUB-RollPhotos2025-123.jpg";

const FALLBACK_VC_MESSAGE = [
  "On behalf of Kisii University Council, Management and the University community, the Vice Chancellor welcomes learners to a fast-growing and dynamic institution committed to academic preparation, research, consultation, and social interaction.",
  "The handbook presents Kisii University as a serene and congenial environment that advances academic excellence, research, innovation, social welfare, integrity, diligence, hard work, professionalism, academic freedom, civility, social responsiveness, and accountability.",
  "The Vice Chancellor is the chief executive officer, academic and administrative head of the University, with overall responsibility for direction, organization, administration, and implementation of academic programmes.",
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
  return backendParagraphs.length ? backendParagraphs : FALLBACK_VC_MESSAGE;
}

export default async function LeadershipMessagePage() {
  const overview = await getOverviewData();
  const messageTitle =
    overview?.vc_message_title?.trim() || "Message from the Vice Chancellor";
  const paragraphs = fallbackParagraphs(overview?.vc_message);

  return (
    <PageShell>
      <AboutPageLenis>
        <section className="overflow-hidden bg-white">
          <div className="max-w-none px-4 py-5 sm:px-6 lg:px-8">
            <BreadcrumbTrail
              items={[
                { label: "Home", href: "/" },
                { label: "About", href: "/about" },
                { label: "The Vice Chancellor" },
              ]}
            />
          </div>

          <div className="grid min-h-[calc(100vh-180px)] max-w-none border-y border-slate-200 lg:grid-cols-[minmax(280px,360px)_minmax(0,1fr)] xl:grid-cols-[minmax(320px,400px)_minmax(0,1fr)]">
            <aside className="flex items-center border-b border-slate-200 bg-slate-50 p-4 sm:p-6 lg:border-b-0 lg:border-r lg:p-8">
              <div className="mx-auto w-full max-w-[340px] overflow-hidden border border-slate-200 bg-white shadow-sm motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-left-5">
                <PublicImage
                  src={VICE_CHANCELLOR_IMAGE}
                  alt="Kisii University Vice Chancellor"
                  ratio="profile"
                  priority
                  sizes="(min-width: 1280px) 340px, (min-width: 1024px) 28vw, 100vw"
                  className="rounded-none"
                  imageClassName="object-cover object-[50%_22%]"
                />
                <div className="border-t border-slate-200 p-5">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-secondary">
                    Executive leadership
                  </p>
                  <p className="mt-2 text-xl font-bold text-slate-950">
                    The Vice Chancellor
                  </p>
                </div>
              </div>
            </aside>

            <div className="flex items-center px-4 py-8 sm:px-6 lg:px-10 xl:px-14">
              <article className="relative w-full overflow-hidden border border-slate-200 bg-white p-5 shadow-sm motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-5 sm:p-7 lg:p-10 xl:p-12">
                <Quote
                  aria-hidden
                  className="absolute right-6 top-6 h-16 w-16 text-primary/10 lg:h-24 lg:w-24"
                />
                <div className="relative">
                  <SectionKicker>Office of the Vice Chancellor</SectionKicker>
                  <h1 className="mt-4 max-w-5xl font-[family-name:var(--font-display)] text-4xl font-semibold leading-tight text-primary sm:text-5xl lg:text-6xl">
                    {messageTitle}
                  </h1>
                  <div className="mt-8 h-0.5 w-20 bg-secondary" />
                </div>

                <div className="relative mt-10 grid gap-8 xl:grid-cols-[minmax(0,1fr)_260px]">
                  <div className="space-y-6 text-base leading-8 text-slate-700 lg:text-lg lg:leading-9">
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

                  <div className="self-end border-t border-slate-200 pt-6 xl:border-l xl:border-t-0 xl:pl-8 xl:pt-0">
                    <p className="font-[family-name:var(--font-display)] text-2xl font-semibold text-primary">
                      The Vice Chancellor
                    </p>
                    <p className="mt-1 text-sm font-bold uppercase tracking-[0.14em] text-slate-500">
                      Kisii University
                    </p>
                  </div>
                </div>
              </article>
            </div>
          </div>
        </section>

      </AboutPageLenis>
    </PageShell>
  );
}
