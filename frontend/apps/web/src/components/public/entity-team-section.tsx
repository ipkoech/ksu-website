"use client";

import Link from "next/link";
import { ArrowRight, UserRound } from "lucide-react";
import { useState } from "react";
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
  position,
}: {
  member: PublicEntityTeamMember;
  position?: string;
}) {
  const photoUrl = resolvePublicMediaUrl(member.photo_url);
  const profileId = member.profile_slug || member.person_id;
  const displayPosition = position || member.position;

  return (
    <Link
      href={`/staff/${encodeURIComponent(profileId)}`}
      aria-label={`View ${member.name}, ${displayPosition}`}
      className="group relative flex min-h-24 min-w-0 items-center gap-2.5 rounded-xl border border-border bg-white p-2.5 pr-8 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
    >
      <span className="block h-14 w-12 shrink-0 overflow-hidden rounded-lg bg-surface-muted sm:h-16 sm:w-14">
        {photoUrl ? (
          <PublicImage
            src={photoUrl}
            alt={member.name}
            ratio="profile"
            sizes="56px"
            className="h-full w-full transition duration-300 group-hover:scale-105"
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center bg-primary/[0.08] font-[family-name:var(--font-display)] text-sm font-semibold text-primary">
            {initials(member.name)}
          </span>
        )}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[13px] font-bold leading-tight text-foreground group-hover:text-primary">
          {member.name}
        </span>
        <span className="mt-1 block text-[11px] font-semibold leading-4 text-primary">
          {displayPosition}
        </span>
        {member.department?.name ? (
          <span className="mt-1 line-clamp-2 block pr-1 text-[11px] leading-4 text-muted-foreground">
            {member.department.name}
          </span>
        ) : null}
      </span>
      <ArrowRight
        aria-hidden
        className="absolute bottom-2.5 right-2.5 h-3.5 w-3.5 shrink-0 text-muted-foreground/70 transition group-hover:translate-x-0.5 group-hover:text-primary"
      />
    </Link>
  );
}

type TeamFilter = "all" | "leadership" | "academic" | "administrative" | "support";

const FILTER_LABELS: Array<{ key: TeamFilter; label: string }> = [
  { key: "all", label: "All Staff" },
  { key: "leadership", label: "Leadership" },
  { key: "academic", label: "Academic" },
  { key: "administrative", label: "Administrative" },
  { key: "support", label: "Support" },
];

function tierCategory(key: string): Exclude<TeamFilter, "all"> {
  if (["leadership", "head", "dean", "cod", "department_leadership", "coordinators", "postgraduate_coordinator", "deputies"].includes(key)) {
    return "leadership";
  }
  if (key === "academic") return "academic";
  if (["administrative", "administrative_assistants"].includes(key)) return "administrative";
  return "support";
}

export function EntityTeamSection({
  team,
  emptyTitle,
}: {
  team?: PublicEntityTeam | null;
  emptyTitle: string;
}) {
  const [activeFilter, setActiveFilter] = useState<TeamFilter>("all");

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

  const availableCategories = new Set(
    team.tiers.filter((tier) => tier.members.length).map((tier) => tierCategory(tier.key)),
  );
  const filters = FILTER_LABELS.filter(
    (filter) => filter.key === "all" || availableCategories.has(filter.key),
  );
  const visibleTiers = team.tiers.filter(
    (tier) => activeFilter === "all" || tierCategory(tier.key) === activeFilter,
  );
  const visibleMembers = visibleTiers.flatMap((tier) =>
    tier.members.map((member) => ({
      member,
      position:
        tier.key === "dean"
          ? "Dean"
          : ["cod", "department_leadership"].includes(tier.key)
            ? "Chair of Department"
            : tier.key === "postgraduate_coordinator"
              ? "Postgraduate Coordinator"
              : undefined,
    })),
  );
  const filterGridClass =
    filters.length >= 5
      ? "sm:grid-cols-5"
      : filters.length === 4
        ? "sm:grid-cols-4"
        : "sm:grid-cols-3";

  return (
    <section className="grid gap-4">
      {filters.length > 2 ? (
        <div className={`grid grid-cols-2 overflow-hidden rounded-lg border border-border bg-white shadow-sm ${filterGridClass}`} aria-label="Filter staff groups">
          {filters.map((filter) => (
            <button
              key={filter.key}
              type="button"
              aria-pressed={activeFilter === filter.key}
              onClick={() => setActiveFilter(filter.key)}
              className={`min-h-10 border-b border-r border-border px-3 py-2 text-xs font-semibold transition last:border-r-0 sm:border-b-0 ${activeFilter === filter.key ? "bg-primary/[0.08] text-primary" : "bg-white text-foreground hover:bg-surface-subtle"}`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      ) : null}

      <section
        aria-labelledby="team-directory-heading"
        className="rounded-[1.25rem] border border-border/80 bg-white/80 p-4 shadow-sm backdrop-blur-sm sm:p-5"
      >
        <div className="mb-3 flex items-center gap-3">
          <h3
            id="team-directory-heading"
            className="text-xs font-bold uppercase tracking-[0.08em] text-primary"
          >
            Team Directory
          </h3>
          <span className="h-px flex-1 bg-surface-muted" />
          <span className="text-xs font-semibold tabular-nums text-muted-foreground">
            {visibleMembers.length}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
          {visibleMembers.map(({ member, position }) => (
            <TeamCard
              key={member.id}
              member={member}
              position={position}
            />
          ))}
        </div>
      </section>
    </section>
  );
}
