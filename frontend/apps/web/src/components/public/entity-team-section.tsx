import Link from "next/link";
import { UserRound } from "lucide-react";
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

function TeamCard({ member }: { member: PublicEntityTeamMember }) {
  const photoUrl = resolvePublicMediaUrl(member.photo_url);
  const profileId = member.profile_slug || member.person_id;

  return (
    <Link
      href={`/staff/${encodeURIComponent(profileId)}`}
      aria-label={`View ${member.name}, ${member.position}`}
      className="group flex min-w-0 items-center gap-3 rounded-lg border border-border bg-white p-3 shadow-sm transition hover:border-primary/30 hover:shadow-md sm:flex-col sm:text-center"
    >
      <span className="block h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-surface-muted sm:h-24 sm:w-24">
        {photoUrl ? (
          <PublicImage
            src={photoUrl}
            alt={member.name}
            ratio="profile"
            sizes="96px"
            className="h-full w-full transition duration-300 group-hover:scale-105"
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center bg-primary/[0.08] font-[family-name:var(--font-display)] text-lg font-semibold text-primary">
            {initials(member.name)}
          </span>
        )}
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-bold leading-5 text-foreground group-hover:text-primary">
          {member.name}
        </span>
        <span className="mt-1 block text-xs font-semibold leading-5 text-primary">
          {member.position}
        </span>
      </span>
    </Link>
  );
}

export function EntityTeamSection({
  team,
  title,
  emptyTitle,
}: {
  team?: PublicEntityTeam | null;
  title: string;
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
      <div className="rounded-lg border border-border bg-white p-4 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-[0.08em] text-primary">
          {team.entity.name}
        </p>
        <h2 className="mt-1 font-[family-name:var(--font-display)] text-2xl font-semibold text-foreground">
          {title}
        </h2>
      </div>

      {team.tiers.map((tier) => (
        <section key={tier.key} aria-labelledby={`team-tier-${tier.key}`}>
          <div className="mb-3 flex items-center gap-3">
            <h3
              id={`team-tier-${tier.key}`}
              className="text-xs font-bold uppercase tracking-[0.08em] text-primary"
            >
              {tier.label}
            </h3>
            <span className="h-px flex-1 bg-surface-muted" />
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {tier.members.map((member) => (
              <TeamCard key={member.person_id} member={member} />
            ))}
          </div>
        </section>
      ))}
    </section>
  );
}
