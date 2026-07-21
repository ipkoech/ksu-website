import Link from "next/link";
import { ArrowUpRight, Building2, UserRound } from "lucide-react";
import type {
  PublicEntityTeam,
  PublicEntityTeamMember,
} from "@ksu/api-client";
import { PublicImage } from "@/components/public/public-image";
import { resolvePublicMediaUrl } from "@/lib/public-media";

function initials(name: string) {
  const parts = name
    .split(/\s+/)
    .map((part) => part.replace(/[^A-Za-z]/g, ""))
    .filter(Boolean)
    .filter(
      (part) =>
        !["dr", "prof", "mr", "mrs", "ms", "rev", "eng"].includes(
          part.toLowerCase(),
        ),
    );
  if (!parts.length) return "S";
  return (parts.length === 1 ? [parts[0]] : [parts[0], parts.at(-1)!])
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function TeamCard({
  member,
  featured = false,
  position,
}: {
  member: PublicEntityTeamMember;
  featured?: boolean;
  position?: string;
}) {
  const photoUrl = resolvePublicMediaUrl(member.photo_url);
  const profileId = member.profile_slug || member.person_id;
  const displayPosition = position || member.position;

  return (
    <Link
      href={`/staff/${encodeURIComponent(profileId)}`}
      aria-label={`View ${member.name}, ${displayPosition}`}
      className={`group flex min-w-0 items-center border border-border bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md ${featured ? "gap-4 rounded-[1.25rem] p-4" : "gap-3 rounded-xl p-3"}`}
    >
      <span className={`block shrink-0 overflow-hidden bg-surface-muted ${featured ? "h-24 w-20 rounded-xl sm:h-32 sm:w-28" : "h-16 w-16 rounded-lg"}`}>
        {photoUrl ? (
          <PublicImage
            src={photoUrl}
            alt={member.name}
            ratio="profile"
            sizes={featured ? "112px" : "64px"}
            className="h-full w-full transition duration-300 group-hover:scale-105"
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center bg-primary/[0.08] font-[family-name:var(--font-display)] text-lg font-semibold text-primary">
            {initials(member.name)}
          </span>
        )}
      </span>
      <span className="min-w-0 flex-1">
        <span className={`block font-bold leading-tight text-foreground group-hover:text-primary ${featured ? "font-[family-name:var(--font-display)] text-xl" : "text-sm"}`}>
          {member.name}
        </span>
        <span className={`mt-1 block font-semibold leading-5 text-primary ${featured ? "text-sm" : "text-xs"}`}>
          {displayPosition}
        </span>
        {member.department?.name ? (
          <span className="mt-2 flex items-start gap-1.5 text-xs leading-5 text-muted-foreground">
            <Building2 aria-hidden className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span>{member.department.name}</span>
          </span>
        ) : null}
        {featured ? <span className="mt-3 inline-flex items-center gap-1 text-xs font-bold uppercase tracking-[0.08em] text-primary">View profile <ArrowUpRight aria-hidden className="h-3.5 w-3.5" /></span> : null}
      </span>
    </Link>
  );
}

export function EntityTeamSection({
  team,
  emptyTitle,
}: {
  team?: PublicEntityTeam | null;
  emptyTitle: string;
}) {
  if (!team?.tiers.some((tier) => tier.members.length)) {
    return (
      <section className="rounded-lg border border-border bg-white p-6 shadow-sm">
        <div className="flex gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/[0.08] text-primary">
            <UserRound aria-hidden className="h-5 w-5" />
          </span>
          <div>
            <p className="text-sm font-semibold text-foreground">{emptyTitle}</p>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              Published members will appear here once active public assignments
              are attached to this unit.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="grid gap-6">
      {team.tiers.map((tier) => (
        <section key={tier.key} aria-labelledby={`team-tier-${tier.key}`} className="rounded-[1.25rem] border border-border/80 bg-white/80 p-4 shadow-sm backdrop-blur-sm sm:p-5">
          <div className="mb-4 flex items-center gap-3">
            <h3
              id={`team-tier-${tier.key}`}
              className="text-xs font-bold uppercase tracking-[0.08em] text-primary"
            >
              {tier.label}
            </h3>
            <span className="h-px flex-1 bg-surface-muted" />
          </div>
          <div className={`grid gap-3 ${["leadership", "head", "dean"].includes(tier.key) ? "lg:grid-cols-2" : "sm:grid-cols-2"}`}>
            {tier.members.map((member) => (
              <TeamCard
                key={member.id}
                member={member}
                featured={["leadership", "head", "dean"].includes(tier.key)}
                position={
                  tier.key === "dean"
                    ? "Dean"
                    : tier.key === "cod"
                      ? "Chairperson of Department"
                      : tier.key === "postgraduate_coordinator"
                        ? "Postgraduate Coordinator"
                        : undefined
                }
              />
            ))}
          </div>
        </section>
      ))}
    </section>
  );
}
