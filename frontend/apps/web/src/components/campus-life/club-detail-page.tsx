import Link from "next/link";
import { ArrowRight, CalendarClock, Mail, Phone, Users } from "lucide-react";
import type { Club } from "@ksu/api-client";
import { CampusPageHeader } from "@ksu/ui/components";
import { AboutReveal } from "@/components/about/about-reveal";
import { PublicImage } from "@/components/public/public-image";
import { publicMediaUrl } from "@/lib/public-media";
import {
  CLUB_TRACK_META,
  CLUB_TRACKS,
  type ClubTrack,
  displayClubName,
} from "@/components/campus-life/club-roster-data";

/**
 * One club, on the campus-life design.
 *
 * The previous version wrapped every club in the shared sidebar shell and then
 * printed six rows of "Not published", because the official register carries a
 * name and a cohort and nothing else. This page drops the sidebar and the
 * quick-links rail, states what the club is, and shows a practical fact only
 * when the record actually holds one.
 */

function trackOf(club: Club): ClubTrack | null {
  const value = club.club_type as ClubTrack | undefined;
  return value && CLUB_TRACKS.includes(value) ? value : null;
}

function money(value?: number | null) {
  if (typeof value !== "number") return null;
  if (value === 0) return "Free to join";
  return `KES ${value.toLocaleString("en-KE")}`;
}

/** Paragraph-split for the seeded prose, which arrives as sentences. */
function sentences(value?: string | null): string[] {
  const text = (value ?? "").replace(/\s+/g, " ").trim();
  if (!text) return [];
  return text
    .split(/(?<=\.)\s+(?=[A-Z])/)
    .map((part) => part.trim())
    .filter(Boolean);
}

export function ClubDetailPage({ club }: { club?: Club | null }) {
  if (!club) {
    return (
      <div className="bg-surface text-foreground">
        <CampusPageHeader
          seed="/campus-life"
          variant="default"
          titleWeight="normal"
          eyebrow="Clubs & Societies"
          breadcrumbs={[
            { label: "Home", href: "/" },
            { label: "Campus Life", href: "/campus-life" },
            { label: "Club not found" },
          ]}
          title="Club not found"
          description="This club may have been unpublished or its address has changed."
        />
        <section className="px-5 py-14 sm:px-8 lg:px-16 lg:py-16 xl:px-20">
          <div className="mx-auto w-full max-w-7xl">
            <Link
              href="/campus-life#clubs"
              className="inline-flex min-h-11 items-center gap-2 text-sm font-bold text-primary hover:underline"
            >
              Browse every club <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        </section>
      </div>
    );
  }

  const track = trackOf(club);
  const meta = track ? CLUB_TRACK_META[track] : null;
  const name = displayClubName(club.name);
  const cover = publicMediaUrl(
    (club as { cover_image?: Parameters<typeof publicMediaUrl>[0] }).cover_image,
  );

  // Only facts the record actually carries. An unpublished contact is left out
  // rather than printed as "Not published" — the roster is the university's,
  // and a blank row tells a student nothing they can act on.
  const facts = [
    club.membership_count && club.membership_count > 0
      ? { label: "Members", value: String(club.membership_count), icon: Users }
      : null,
    club.meeting_schedule
      ? { label: "Meets", value: club.meeting_schedule, icon: CalendarClock }
      : null,
    money(club.membership_fee)
      ? { label: "Membership", value: money(club.membership_fee)!, icon: Users }
      : null,
    club.email ? { label: "Email", value: club.email, icon: Mail } : null,
    club.phone ? { label: "Phone", value: club.phone, icon: Phone } : null,
  ].filter((item): item is { label: string; value: string; icon: typeof Users } =>
    Boolean(item),
  );

  const about = sentences(club.about);
  const objectives = sentences(club.objectives);

  return (
    <div className="bg-surface text-foreground">
      <CampusPageHeader
        seed="/campus-life"
        variant="feature"
        titleWeight="normal"
        eyebrow={meta?.label ?? "Clubs & Societies"}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Campus Life", href: "/campus-life" },
          { label: name },
        ]}
        title={name}
        description={club.mission ?? undefined}
      />

      <section className="border-b border-primary/10 px-5 py-14 sm:px-8 lg:px-16 lg:py-16 xl:px-20">
        <div className="mx-auto grid w-full max-w-7xl gap-10 lg:grid-cols-[.78fr_1.22fr] lg:items-center">
          <AboutReveal variant="left">
            <h2 className="font-[family-name:var(--font-display)] text-3xl font-normal leading-tight tracking-tight text-primary sm:text-4xl">
              What This <em className="italic">Is.</em>
            </h2>
            {about.map((line, index) => (
              <p
                key={index}
                className="mt-4 max-w-xl text-base leading-8 text-muted-foreground"
              >
                {line}
              </p>
            ))}

            {facts.length > 0 ? (
              <div className="mt-8 grid grid-cols-2 border-t border-primary/15 sm:grid-cols-3">
                {facts.map(({ label, value, icon: Icon }) => (
                  <div
                    key={label}
                    className="border-b border-primary/15 px-3 py-5 first:pl-0 sm:border-r sm:last:border-r-0"
                  >
                    <Icon className="h-6 w-6 text-primary" aria-hidden />
                    <p className="mt-3 font-[family-name:var(--font-display)] text-lg font-normal tracking-tight text-primary">
                      {value}
                    </p>
                    <p className="mt-1 text-[0.68rem] font-bold uppercase tracking-wider text-muted-foreground">
                      {label}
                    </p>
                  </div>
                ))}
              </div>
            ) : null}
          </AboutReveal>

          <AboutReveal variant="right" delay={100}>
            <div className="relative min-h-[340px] overflow-hidden rounded-2xl ring-1 ring-primary/10 lg:min-h-[420px]">
              <PublicImage
                src={cover ?? meta?.image ?? "/images/about-us/pavilion-2.jpg"}
                alt={
                  cover
                    ? ""
                    : (meta?.imageAlt ?? "Kisii University students on campus")
                }
                ratio="fill"
                className="absolute inset-0 h-full w-full"
                imageClassName="object-cover"
                sizes="(min-width:1024px) 58vw, 100vw"
              />
            </div>
          </AboutReveal>
        </div>
      </section>

      {objectives.length > 0 ? (
        <section className="relative overflow-hidden bg-primary px-5 py-14 text-white sm:px-8 lg:px-16 lg:py-20 xl:px-20">
          <div
            className="absolute -left-20 top-0 h-full w-80 opacity-[0.06] [background-image:radial-gradient(circle_at_center,white_0,white_1px,transparent_1.5px)] [background-size:18px_18px]"
            aria-hidden
          />
          <AboutReveal className="relative mx-auto w-full max-w-7xl" variant="left">
            <h2 className="font-[family-name:var(--font-display)] text-3xl font-normal tracking-tight text-white sm:text-4xl">
              What Members <em className="italic">Do.</em>
            </h2>
            <ul className="mt-8 grid gap-x-10 gap-y-5 sm:grid-cols-2">
              {objectives.map((item) => (
                <li key={item} className="flex items-start gap-3.5">
                  <span
                    aria-hidden
                    className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-secondary"
                  />
                  <span className="text-base leading-8 text-white/75">{item}</span>
                </li>
              ))}
            </ul>
          </AboutReveal>
        </section>
      ) : null}

      <section className="bg-white px-5 py-14 sm:px-8 lg:px-16 lg:py-16 xl:px-20">
        <AboutReveal className="mx-auto w-full max-w-7xl" variant="up">
          <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
            <div>
              <h2 className="font-[family-name:var(--font-display)] text-2xl font-normal tracking-tight text-primary sm:text-3xl">
                Joining <em className="italic">In.</em>
              </h2>
              <p className="mt-4 max-w-xl text-base leading-8 text-muted-foreground">
                {club.email || club.phone
                  ? "Contact the club directly using the details above, or ask at the Office of the Dean of Students."
                  : "Membership is handled by the club itself. Ask at the Office of the Dean of Students, who keep the register and can point you to the current officials."}
              </p>
            </div>
            <div className="flex flex-wrap gap-4 lg:justify-end">
              <Link
                href="/campus-life#clubs"
                className="inline-flex min-h-12 items-center gap-3 rounded-2xl bg-primary px-6 py-3 text-xs font-bold uppercase text-white transition-colors duration-200 hover:bg-primary/90 active:scale-[0.98]"
              >
                Every Club <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
              <Link
                href="/campus-life/support"
                className="inline-flex min-h-12 items-center gap-3 rounded-2xl border border-primary/20 px-6 py-3 text-xs font-bold uppercase text-primary transition-colors duration-200 hover:bg-primary/5 active:scale-[0.98]"
              >
                Student Support
              </Link>
            </div>
          </div>
        </AboutReveal>
      </section>
    </div>
  );
}

export default ClubDetailPage;
