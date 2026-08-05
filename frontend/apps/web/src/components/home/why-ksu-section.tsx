import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export interface LandingStat {
  value: number;
  suffix?: string;
  label: string;
  description?: string;
}

interface WhyKsuSectionProps {
  stats: LandingStat[];
}

/* Cool light wash of the brand primary — the section ground the hero hands
   over to. All ink is the deep navy brand overlay. */
const ground = "color-mix(in srgb, hsl(var(--primary)) 6%, white)";

const numeralGradient =
  "linear-gradient(294deg, hsl(var(--brand-overlay)) 20%, hsl(var(--primary)))";

/**
 * "Why Kisii University" — full-viewport interlude on the cool primary wash:
 * display heading beside the university's story, then a row of compact stat
 * cards over campus scenes, the middle one staggered.
 */
export function WhyKsuSection({ stats }: WhyKsuSectionProps) {
  const cardStats = stats;

  return (
    <section
      id="why-ksu"
      aria-labelledby="why-ksu-heading"
      className="relative z-10 rounded-t-[28px] px-6 py-14 text-brand-overlay sm:px-10 sm:py-16"
      style={{ backgroundColor: ground }}
    >
      <div className="mx-auto w-full max-w-7xl">
        {/* Heading + story */}
        <div className="flex flex-col items-start justify-between gap-10 lg:flex-row lg:gap-20">
          <h2
            id="why-ksu-heading"
            className="font-[family-name:var(--font-display)] text-[36px] font-normal leading-[0.98] tracking-tight sm:text-[48px] lg:text-[54px]"
          >
            Why Kisii
            <br />
            <em className="italic">University.</em>
          </h2>

          <div className="flex max-w-xl flex-col">
            <div className="text-[17px] leading-[1.55] sm:text-[18px]">
              <p>
                Kisii University is a leading public university at the centre
                of Kisii. Eight schools, applied research, and community
                transformation. Founded 1965, chartered 2013.
              </p>
              <p className="mt-4">
                We nurture minds, advance research, and serve community:
                programmes shaped with employers and professional bodies,
                research that answers local questions, and a campus with room
                to become.
              </p>
            </div>
            <Link
              href="/about"
              className="group mt-6 inline-flex items-center gap-4 text-[14px] font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              About Kisii University
              <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-current transition-transform duration-200 group-hover:-translate-y-0.5">
                <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
              </span>
            </Link>
          </div>
        </div>

        {/* Compact stat cards */}
        {cardStats.length > 0 && (
          <ul className="mt-14 grid list-none grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {cardStats.map((stat, index) => (
              <li
                key={stat.label}
                className={
                  index % 3 === 1
                    ? "relative h-[130px] w-full sm:h-[160px] lg:mt-10"
                    : "relative h-[130px] w-full sm:h-[160px]"
                }
              >
                <div
                  className="relative h-full w-full overflow-hidden rounded-2xl bg-white ring-1 ring-primary/10"
                >
                  <div className="absolute bottom-5 left-5 right-5">
                    <p
                      className="font-[family-name:var(--font-display)] text-[28px] font-semibold leading-none sm:text-[36px]"
                      style={{
                        background: numeralGradient,
                        WebkitBackgroundClip: "text",
                        backgroundClip: "text",
                        color: "transparent",
                      }}
                    >
                      {stat.value.toLocaleString()}
                      {stat.suffix || "+"}
                    </p>
                    <p className="mt-2 text-[13px] leading-[1.4]">
                      {stat.label}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Hand over to the partnership section's white ground */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-14 sm:h-20"
        aria-hidden
        style={{
          background:
            "linear-gradient(to bottom, transparent 0%, rgba(255,255,255,0.7) 60%, #ffffff 100%)",
        }}
      />
    </section>
  );
}
