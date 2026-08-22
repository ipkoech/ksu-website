import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@ksu/ui/lib/utils";
import { AmbientPageBackground } from "@ksu/ui";
import { focusVisibleStyles } from "@ksu/ui/motion";
import { PublicImage } from "@/components/public/public-image";
import { ImageCurtainReveal } from "@/components/about/image-curtain-reveal";
import {
  Reveal,
  RevealGroup,
  RevealItem,
} from "@/components/home/motion-primitives";
import { defaultUniversityImage } from "@/lib/default-imagery";
import type { HomeSchoolCard } from "@/lib/homepage-data";

/**
 * The schools, as image cards leading to each school's own page.
 *
 * Sits directly after the programme finder: a visitor who searched and found
 * nothing that fitted has the other way in, which is to browse by discipline
 * rather than by programme name.
 */
export function SchoolsSection({ schools }: { schools: HomeSchoolCard[] }) {
  if (schools.length === 0) return null;

  return (
    <AmbientPageBackground
      as="section"
      variant="poster"
      intensity="soft"
      id="schools"
      aria-labelledby="schools-heading"
      className="overflow-hidden py-16 text-brand-overlay lg:py-24"
    >
      <div className="ksu-shell">
        <Reveal className="flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-[42rem]">
            <h2 id="schools-heading" className="ksu-l-h2 font-normal">
              Our schools
            </h2>
            <p className="mt-3 max-w-[56ch] text-brand-overlay/65">
              Every programme sits within a school. Start from the discipline
              and work down to the course that fits.
            </p>
          </div>
          <Link
            href="/academics/schools"
            className={cn(
              "group inline-flex min-h-11 items-center gap-2 font-medium text-[hsl(var(--secondary-ink))]",
              focusVisibleStyles.primary,
            )}
          >
            All schools
            <span
              className="transition-transform duration-300 group-hover:translate-x-1"
              aria-hidden
            >
              →
            </span>
          </Link>
        </Reveal>

        <RevealGroup
          as="ul"
          stagger={0.05}
          className="mt-10 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4"
        >
          {schools.map((school) => (
            <RevealItem as="li" key={school.href} className="min-w-0">
              {/* The whole card is the link, so the target is the card
                  rather than a line of text inside it. */}
              <Link
                href={school.href}
                className={cn(
                  "group block h-full rounded-3xl",
                  focusVisibleStyles.primary,
                )}
              >
                <article className="relative flex h-full min-h-[11rem] flex-col justify-end sm:min-h-[15rem] overflow-hidden rounded-3xl bg-brand-overlay shadow-[0_1px_2px_hsl(var(--brand-overlay)/0.05),0_16px_38px_-24px_hsl(var(--brand-overlay)/0.5)] transition-[transform,box-shadow] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] motion-safe:group-hover:-translate-y-1">
                  <ImageCurtainReveal className="absolute inset-0 z-0">
                    <PublicImage
                      src={
                        school.imageUrl ??
                        defaultUniversityImage(school.id ?? school.href)
                      }
                      /* The school name is already the card's heading, so a
                         cover with no authored alt text is decorative here. */
                      alt={school.imageAlt ?? ""}
                      ratio="fill"
                      className="absolute inset-0 h-full w-full bg-transparent"
                      imageClassName="object-cover transition-transform [transition-duration:900ms] [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] motion-safe:group-hover:scale-[1.07]"
                      sizes="(min-width: 1024px) 23vw, 46vw"
                    />
                  </ImageCurtainReveal>
                  {/* Ink from the base so the name reads on any photograph. */}
                  <div
                    className="absolute inset-0 bg-[linear-gradient(to_top,hsl(var(--brand-overlay)/0.92)_0%,hsl(var(--brand-overlay)/0.45)_45%,hsl(var(--brand-overlay)/0.05)_78%)]"
                    aria-hidden
                  />
                  <div className="relative flex items-end gap-2 p-4 sm:gap-3 sm:p-5">
                    <h3 className="ksu-l-small min-w-0 flex-1 font-medium text-white">
                      {school.title}
                    </h3>
                    <ArrowUpRight
                      className="h-4 w-4 shrink-0 text-white/60 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[hsl(var(--gold-light))]"
                      aria-hidden
                    />
                  </div>
                </article>
              </Link>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </AmbientPageBackground>
  );
}

export default SchoolsSection;
