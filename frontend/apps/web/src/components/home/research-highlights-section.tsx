import { cn } from "@ksu/ui/lib/utils";
import { focusVisibleStyles } from "@ksu/ui/motion";
import { PublicImage } from "@/components/public/public-image";
import { CountUp, Reveal } from "@/components/home/motion-primitives";

export interface ResearchMeasure {
  id: string;
  value: string;
  label: string;
}

export interface ResearchProjectCard {
  id: string;
  title: string;
  summary?: string | null;
  status?: string | null;
  href: string;
}

export interface ResearchSpotlightContent {
  /** Section heading copy, describing the University's research as a whole. */
  title: string;
  summary?: string | null;
  imageUrl?: string | null;
  imageAlt?: string;
  /**
   * University-wide figures from the research service's stats endpoint. These
   * describe the whole research portfolio, never one project.
   */
  measures?: ResearchMeasure[];
  /** The research office's featured projects, in its own order. */
  projects?: ResearchProjectCard[];
  /** Goes to the research portal's index, not to any single project. */
  cta: { label: string; href: string };
}

/**
 * The University's research, on the homepage.
 *
 * Two things share this band and must not be confused: the figures describe
 * the whole research portfolio, and the cards below are individual featured
 * projects. An earlier version stacked portfolio-wide numbers directly under
 * one project's title, which read as that project's results. The heading now
 * owns the figures and each project stands in its own card.
 *
 * Renders nothing when the research service has no content to show.
 */
export function ResearchHighlightsSection({
  spotlight,
}: {
  spotlight: ResearchSpotlightContent | null;
}) {
  if (!spotlight) return null;

  const measures = (spotlight.measures ?? []).slice(0, 3);
  const projects = spotlight.projects ?? [];
  const external = /^https?:\/\//.test(spotlight.cta.href);

  return (
    <section
      id="research-spotlight"
      aria-labelledby="research-spotlight-heading"
      className="relative isolate overflow-hidden bg-[hsl(var(--surface-page))] py-20 text-white lg:py-28"
    >
      {/* `research-impact-bg` is the section's own ground, spanning the full
          width behind everything rather than sitting as a panel on one side.
          It is light artwork, so the gradients below pool brand ink where the
          type sits and let the illustration read where it does not. */}
      <div className="absolute inset-0 -z-10">
        <PublicImage
          src="/images/research/research-impact-bg.png"
          alt=""
          ratio="fill"
          className="absolute inset-0 h-full w-full bg-transparent"
          imageClassName="object-cover object-center"
          sizes="100vw"
        />
        {/* Ink pooled at the left, where the copy sits, clearing by the middle
            so the artwork still reads on the right. */}
        <div
          className="absolute inset-0 bg-[linear-gradient(100deg,hsl(var(--brand-overlay)/0.96)_0%,hsl(var(--brand-overlay)/0.90)_30%,hsl(var(--brand-overlay)/0.55)_52%,hsl(var(--brand-overlay)/0.12)_72%,transparent_100%)]"
          aria-hidden
        />
        {/* The cards need a legible ground of their own across the full width,
            which the angled wash alone does not give them on the right. */}
        {projects.length > 0 ? (
          <div
            className="absolute inset-x-0 bottom-0 h-1/2 bg-[linear-gradient(to_top,hsl(var(--brand-overlay)/0.93),transparent)]"
            aria-hidden
          />
        ) : null}
        {/* Short fades top and bottom so the band joins its neighbours
            without a hard seam. */}
        <div
          className="absolute inset-x-0 top-0 h-24 bg-[linear-gradient(to_bottom,hsl(var(--surface-page)),transparent)]"
          aria-hidden
        />
        <div
          className="absolute inset-x-0 bottom-0 h-24 bg-[linear-gradient(to_top,hsl(var(--surface-page)),transparent)]"
          aria-hidden
        />
      </div>

      <div className="ksu-shell relative">
        <Reveal className="max-w-[46rem] lg:max-w-[40rem]">
          <h2 id="research-spotlight-heading" className="ksu-l-h2 font-normal">
            {spotlight.title}
          </h2>

          {spotlight.summary ? (
            <p className="mt-5 max-w-[52ch] text-white/80">
              {spotlight.summary}
            </p>
          ) : null}

          {/* Attached to the heading, so these read as the University's
              figures rather than any one project's. */}
          {measures.length > 0 ? (
            <dl className="mt-10 grid max-w-[38rem] gap-6 sm:grid-cols-3">
              {measures.map((measure, index) => (
                <div
                  key={measure.id}
                  className={cn(
                    "min-w-0",
                    index > 0 && "sm:border-l sm:border-white/20 sm:pl-6",
                  )}
                >
                  <dt className="sr-only">{measure.label}</dt>
                  <dd>
                    <span className="ksu-l-card block font-medium text-white">
                      <CountUp value={measure.value} />
                    </span>
                    <span className="ksu-l-small mt-1 block text-white/65">
                      {measure.label}
                    </span>
                  </dd>
                </div>
              ))}
            </dl>
          ) : null}
        </Reveal>

        {projects.length > 0 ? (
          <>
            <Reveal delay={0.1}>
              <h3 className="ksu-l-card mt-14 font-normal text-[hsl(var(--gold-light))]">
                Featured projects
              </h3>
            </Reveal>
            <ul
              className={cn(
                "mt-6 grid gap-5 sm:grid-cols-2",
                projects.length > 2 && "lg:grid-cols-3",
              )}
            >
              {projects.map((project, index) => (
                <Reveal key={project.id} as="li" delay={0.14 + index * 0.06}>
                  <a
                    href={project.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      // Whole card is the target, so it stays one tap on a phone.
                      "group flex h-full flex-col rounded-2xl border border-white/20 bg-[hsl(var(--brand-overlay)/0.55)] p-6 backdrop-blur-sm transition-[background-color,border-color,transform] duration-200 hover:-translate-y-0.5 hover:border-[hsl(var(--gold-light))]/60 hover:bg-[hsl(var(--brand-overlay)/0.75)]",
                      focusVisibleStyles.primary,
                    )}
                  >
                    {project.status ? (
                      <span className="ksu-l-small mb-3 inline-flex w-fit items-center rounded-full border border-white/25 px-3 py-1 capitalize text-white/75">
                        {project.status}
                      </span>
                    ) : null}
                    <span className="ksu-l-card font-normal text-white">
                      {project.title}
                    </span>
                    {project.summary ? (
                      <span className="ksu-l-small mt-3 text-white/70">
                        {project.summary}
                      </span>
                    ) : null}
                    <span
                      className="ksu-l-small mt-auto pt-5 text-[hsl(var(--gold-light))]"
                      aria-hidden
                    >
                      Read the project{" "}
                      <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">
                        →
                      </span>
                    </span>
                  </a>
                </Reveal>
              ))}
            </ul>
          </>
        ) : null}

        <Reveal delay={0.2}>
          <a
            href={spotlight.cta.href}
            {...(external
              ? { target: "_blank", rel: "noopener noreferrer" }
              : {})}
            className={cn(
              "group mt-12 inline-flex min-h-11 items-center gap-2 rounded-lg bg-secondary px-7 py-3 font-medium text-white transition-[background-color,transform] duration-200 hover:bg-[hsl(var(--secondary))]/90 active:scale-[0.99]",
              focusVisibleStyles.primary,
            )}
          >
            {spotlight.cta.label}
            <span
              className="transition-transform duration-300 group-hover:translate-x-1"
              aria-hidden
            >
              →
            </span>
          </a>
        </Reveal>
      </div>
    </section>
  );
}

export default ResearchHighlightsSection;
