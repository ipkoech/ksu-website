import type { ReactNode } from "react";
import { Building2, GraduationCap, Landmark, Users } from "lucide-react";
import { cn } from "@ksu/ui/lib/utils";
import { CountUp } from "@/components/home/motion-primitives";

export interface HomeStat {
  value: string;
  label: string;
}

/** Icons follow the band's reading order rather than the label text, which
 *  the CMS controls. Beyond the fourth the row has no icon to offer. */
const icons: ReactNode[] = [
  <Landmark key="0" className="h-6 w-6" aria-hidden />,
  <Users key="1" className="h-6 w-6" aria-hidden />,
  <GraduationCap key="2" className="h-6 w-6" aria-hidden />,
  <Building2 key="3" className="h-6 w-6" aria-hidden />,
];

/**
 * Grid shape for the number of figures actually published.
 *
 * The band is laid out for four, but the backend decides how many exist and
 * nothing is invented to fill a gap — so three must read as a deliberate row
 * of three rather than as four with one missing.
 */
function gridColumns(count: number) {
  if (count >= 4) return "grid-cols-2 lg:grid-cols-4";
  if (count === 3) return "grid-cols-1 sm:grid-cols-3";
  if (count === 2) return "grid-cols-2";
  return "grid-cols-1";
}

/** Hairline rules between cells only — never around the panel's outer edge. */
function cellRules(index: number, count: number) {
  if (count >= 4) {
    return cn(
      index % 2 === 1 && "border-l border-white/15",
      index >= 2 && "border-t border-white/15 lg:border-t-0",
      index % 4 !== 0 && "lg:border-l lg:border-white/15",
      index % 2 === 0 && "border-l-0",
      index % 4 === 0 && "lg:border-l-0",
    );
  }
  if (count === 3) {
    return cn(
      index > 0 && "border-t border-white/15 sm:border-t-0",
      index > 0 && "sm:border-l sm:border-white/15",
    );
  }
  if (count === 2) return cn(index === 1 && "border-l border-white/15");
  return "";
}

/**
 * The statistics band that straddles the hero / partnership boundary.
 *
 * The panel is pulled up into the hero's dark lower edge, so its top half
 * sits on the hero overlay and its bottom half on the warm ground that
 * carries into the partnership section.
 */
export function HomeStatsBand({ stats }: { stats: HomeStat[] }) {
  const shown = stats.slice(0, 4);
  if (shown.length === 0) return null;

  return (
    <section
      aria-labelledby="stats-heading"
      className="relative z-20 -mt-10 lg:-mt-24"
    >
      <h2 id="stats-heading" className="sr-only">
        Kisii University at a glance
      </h2>
      {/* The warm ground under the panel's lower half. The section is pulled
          up into the hero by roughly half the panel's height, so the top edge
          sits on the hero's dark overlay while this layer carries the bottom
          edge into the partnership section's background without a seam. */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 top-1/2 bg-[hsl(var(--surface-band))]"
        aria-hidden
      />
      <div className="ksu-shell relative">
        <dl
          className={cn(
            "relative grid overflow-hidden rounded-3xl shadow-[0_28px_70px_-28px_hsl(var(--brand-overlay)/0.8)] ring-1 ring-white/12",
            "bg-[linear-gradient(105deg,hsl(var(--primary-deep))_0%,hsl(var(--panel))_58%,hsl(var(--panel))_100%)]",
            gridColumns(shown.length),
          )}
        >
          <span
            className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-[radial-gradient(circle,hsl(var(--cyan-bright)/0.30),transparent_65%)]"
            aria-hidden
          />
          <span
            className="pointer-events-none absolute -bottom-20 left-1/3 h-52 w-52 rounded-full bg-[radial-gradient(circle,hsl(var(--secondary)/0.24),transparent_68%)]"
            aria-hidden
          />
          {shown.map((stat, index) => (
            <div
              key={stat.label}
              className={cn(
                "relative flex min-w-0 items-center gap-3 px-4 py-6 sm:gap-4 sm:px-6 lg:px-8",
                cellRules(index, shown.length),
              )}
            >
              <span className="hidden shrink-0 text-[hsl(var(--cyan-bright))] sm:block">
                {icons[index]}
              </span>
              {/* `dt` must precede its `dd` in the markup; the figure reads
                  above the label, so the column is reversed visually. */}
              <div className="flex min-w-0 flex-col-reverse">
                <dt className="ksu-l-small mt-1.5 text-white/85">
                  {stat.label}
                </dt>
                {/* Not `ksu-l-h2`: at two-up on a 390px screen a figure like
                    "30,000+" at the section-heading size overflows its cell.
                    This scale tops out at the same place on desktop. */}
                <dd className="truncate text-[1.5rem] font-normal leading-none text-white sm:text-[1.875rem] lg:text-[2.25rem]">
                  <CountUp value={stat.value} />
                </dd>
              </div>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

export default HomeStatsBand;
