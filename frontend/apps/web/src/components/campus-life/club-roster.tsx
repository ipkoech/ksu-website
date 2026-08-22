import Link from "next/link";
import type { Club } from "@ksu/api-client";
import { cn } from "@ksu/ui/lib/utils";
import { AboutReveal } from "@/components/about/about-reveal";
import { PublicImage } from "@/components/public/public-image";
import { publicMediaUrl } from "@/lib/public-media";
import {
  CLUB_TRACKS,
  CLUB_TRACK_META,
  type ClubTrack,
  clubShortName,
  displayClubName,
} from "@/components/campus-life/club-roster-data";

/**
 * The register, printed.
 *
 * Every one of the seventy-one clubs appears by name. That is the section's
 * whole argument: a prospective student scans for their own county and finds
 * it, and no competitor's page can copy the list because it is a fact about
 * this institution's membership rather than a claim about it.
 *
 * No club has a cover photograph yet, and DESIGN.md §10 forbids repeating one
 * photograph across a run of sibling cards. So the photography sits once behind
 * each track's heading band, and the entries themselves are typographic — set
 * in a hairline grid rather than boxed, per §5. When real covers are uploaded,
 * `ClubEntry` picks them up with no further change.
 */

function trackOf(club: Club): ClubTrack | null {
  const value = club.club_type as ClubTrack | undefined;
  return value && CLUB_TRACKS.includes(value) ? value : null;
}

function groupByTrack(clubs: Club[]) {
  const groups = new Map<ClubTrack, Club[]>();
  for (const club of clubs) {
    const track = trackOf(club);
    if (!track) continue;
    const bucket = groups.get(track);
    if (bucket) bucket.push(club);
    else groups.set(track, [club]);
  }
  for (const bucket of groups.values()) {
    bucket.sort((first, second) =>
      clubShortName(first.name).localeCompare(clubShortName(second.name)),
    );
  }
  return groups;
}

function ClubEntry({ club }: { club: Club }) {
  const cover = publicMediaUrl(
    (club as { cover_image?: Parameters<typeof publicMediaUrl>[0] }).cover_image,
  );
  const short = clubShortName(club.name);
  const full = displayClubName(club.name);

  return (
    <Link
      href={`/campus-life/clubs/${club.slug}`}
      // The full registered name is the accessible name; the entry prints the
      // distinguishing part, because twenty-nine entries share a suffix.
      aria-label={full}
      title={full}
      className={cn(
        "group/entry flex h-full min-h-[4.5rem] items-center gap-3 px-3 py-4",
        "transition-colors duration-200 hover:bg-primary/[0.04]",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-primary",
      )}
    >
      {cover ? (
        <span className="relative h-11 w-11 shrink-0 overflow-hidden rounded-2xl ring-1 ring-primary/15">
          <PublicImage
            src={cover}
            alt=""
            ratio="fill"
            className="absolute inset-0 h-full w-full"
            imageClassName="object-cover"
            sizes="44px"
          />
        </span>
      ) : null}
      <span className="min-w-0 font-[family-name:var(--font-display)] text-[15px] font-normal leading-snug tracking-tight text-primary transition-colors duration-200 group-hover/entry:text-secondary">
        {short}
      </span>
    </Link>
  );
}

function Track({
  track,
  clubs,
  index,
}: {
  track: ClubTrack;
  clubs: Club[];
  index: number;
}) {
  const meta = CLUB_TRACK_META[track];

  return (
    <section
      aria-labelledby={`track-${track}`}
      className={cn(index > 0 && "mt-12 lg:mt-16")}
    >
      <AboutReveal variant="up">
        <div className="relative isolate overflow-hidden rounded-2xl bg-[#04162f] ring-1 ring-primary/10">
          <PublicImage
            src={meta.image}
            alt={meta.imageAlt}
            ratio="fill"
            className="absolute inset-0 h-full w-full"
            imageClassName="object-cover object-center"
            sizes="100vw"
          />
          {/* Weighted to the left so the heading holds contrast while the
              photograph stays visible on the right, matching the header band's
              principle of scrimming only where type sits. */}
          <span
            aria-hidden
            className="absolute inset-0 bg-[linear-gradient(92deg,rgba(3,17,40,0.92)_0%,rgba(3,17,40,0.74)_52%,rgba(3,17,40,0.42)_100%)]"
          />
          <div className="relative flex flex-wrap items-end justify-between gap-x-10 gap-y-3 px-6 py-7 lg:px-9 lg:py-8">
            <div className="max-w-[46rem]">
              <h3
                id={`track-${track}`}
                className="font-[family-name:var(--font-display)] text-2xl font-normal leading-tight tracking-tight text-white sm:text-3xl"
              >
                {meta.title}
              </h3>
              <p className="mt-2 max-w-[54ch] text-sm leading-7 text-white/75">
                {meta.line}
              </p>
            </div>
            <p className="font-[family-name:var(--font-display)] text-4xl font-normal leading-none tracking-tight text-white/90 lg:text-5xl">
              {clubs.length}
            </p>
          </div>
        </div>
      </AboutReveal>

      {/* The rule belongs to the item, not the grid: a partial final row would
          otherwise leave a hairline hanging under an empty cell. */}
      <ul className="mt-2 grid border-t border-primary/15 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {clubs.map((club) => (
          <li key={club.id} className="min-w-0 border-b border-primary/15">
            <ClubEntry club={club} />
          </li>
        ))}
      </ul>
    </section>
  );
}

export function ClubRoster({ clubs }: { clubs: Club[] }) {
  if (clubs.length === 0) return null;

  const groups = groupByTrack(clubs);
  const tracks = CLUB_TRACKS.filter((track) => (groups.get(track)?.length ?? 0) > 0);
  if (tracks.length === 0) return null;

  const counted = tracks.reduce(
    (total, track) => total + (groups.get(track)?.length ?? 0),
    0,
  );

  return (
    <section
      id="clubs"
      aria-labelledby="roster-heading"
      className="border-y border-primary/10 bg-white px-5 py-14 sm:px-8 lg:px-16 lg:py-16 xl:px-20"
    >
      <div className="mx-auto w-full max-w-7xl">
        <AboutReveal variant="left">
          <div className="grid gap-5 lg:grid-cols-2 lg:items-end">
            <h2
              id="roster-heading"
              className="font-[family-name:var(--font-display)] text-3xl font-normal tracking-tight text-primary sm:text-4xl"
            >
              {counted} Ways to Not Be a <em className="italic">Stranger.</em>
            </h2>
            <p className="text-sm leading-7 text-muted-foreground">
              Every registered club and association at Kisii University, listed
              in full. Find the one that already knows you — then find the one
              that will make you into something else.
            </p>
          </div>
        </AboutReveal>

        <div className="mt-10 lg:mt-12">
          {tracks.map((track, index) => (
            <Track
              key={track}
              track={track}
              clubs={groups.get(track) ?? []}
              index={index}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default ClubRoster;
