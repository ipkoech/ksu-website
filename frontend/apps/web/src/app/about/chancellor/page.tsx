import type { ReactNode } from "react";
import { Quote } from "lucide-react";
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

          <div className="grid min-h-[calc(100vh-180px)] max-w-none border-y border-border lg:grid-cols-[minmax(280px,360px)_minmax(0,1fr)] xl:grid-cols-[minmax(320px,400px)_minmax(0,1fr)]">
            <aside className="flex items-center border-b border-border bg-surface-subtle p-4 sm:p-6 lg:border-b-0 lg:border-r lg:p-8">
              <div className="mx-auto w-full max-w-[340px] border border-border bg-white shadow-sm motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-left-5">
                <PublicImage
                  src={CHANCELLOR_IMAGE}
                  alt="Dr. Sara J. Ruto, The Chancellor"
                  ratio="profile"
                  priority
                  sizes="(min-width: 1280px) 340px, (min-width: 1024px) 28vw, 100vw"
                  className="rounded-none bg-surface-muted"
                  imageClassName="object-cover object-top"
                />
                <div className="border-t border-border p-5">
                  <p className="text-2xl font-bold text-foreground">
                    Dr. Sara J. Ruto
                  </p>
                  <p className="mt-1 text-sm font-semibold text-primary">
                    The Chancellor
                  </p>
                  <div className="mt-5 h-0.5 w-16 bg-secondary" />
                </div>
              </div>
            </aside>

            <div className="flex items-center px-4 py-8 sm:px-6 lg:px-10 xl:px-14">
              <article className="relative w-full overflow-hidden border border-border bg-white p-5 shadow-sm motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-5 sm:p-7 lg:p-10 xl:p-12">
                <Quote
                  aria-hidden
                  className="absolute right-6 top-6 h-16 w-16 text-primary/10 lg:h-24 lg:w-24"
                />
                <div className="relative">
                  <SectionKicker>Office of the Chancellor</SectionKicker>
                  <h1 className="mt-4 max-w-5xl font-[family-name:var(--font-display)] text-4xl font-semibold leading-tight text-primary sm:text-5xl lg:text-6xl">
                    {messageTitle}
                  </h1>
                  <div className="mt-8 h-0.5 w-20 bg-secondary" />
                </div>

                <div className="relative mt-10 grid gap-8 xl:grid-cols-[minmax(0,1fr)_260px]">
                  <div className="space-y-6 text-base leading-8 text-muted-foreground lg:text-lg lg:leading-9">
                    {paragraphs.map((paragraph, index) => (
                      <p
                        key={paragraph}
                        className={
                          index === 0
                            ? "border-l-4 border-secondary pl-5 font-medium text-foreground"
                            : undefined
                        }
                      >
                        {paragraph}
                      </p>
                    ))}
                  </div>

                  <div className="self-end border-t border-border pt-6 xl:border-l xl:border-t-0 xl:pl-8 xl:pt-0">
                    <p className="font-[family-name:var(--font-display)] text-2xl font-semibold text-primary">
                      Dr. Sara J. Ruto
                    </p>
                    <p className="mt-1 text-sm font-bold uppercase tracking-[0.14em] text-muted-foreground">
                      The Chancellor
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
