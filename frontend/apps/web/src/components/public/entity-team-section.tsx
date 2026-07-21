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
      className={`group relative flex h-full min-w-0 items-center border border-border bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${featured ? "gap-4 rounded-[1.25rem] p-4 pr-12" : "gap-2.5 rounded-lg p-2.5 pr-8"}`}
    >
      <span className={`block shrink-0 overflow-hidden bg-surface-muted ${featured ? "h-24 w-20 rounded-xl sm:h-28 sm:w-24" : "h-11 w-11 rounded-md"}`}>
        {photoUrl ? (
          <PublicImage
            src={photoUrl}
            alt={member.name}
            ratio="profile"
            sizes={featured ? "96px" : "44px"}
            className="h-full w-full transition duration-300 group-hover:scale-105"
          />
        ) : (
          <span className={`flex h-full w-full items-center justify-center bg-primary/[0.08] font-[family-name:var(--font-display)] font-semibold text-primary ${featured ? "text-lg" : "text-sm"}`}>
            {initials(member.name)}
          </span>
        )}
      </span>
      <span className="min-w-0 flex-1">
        <span className={`block font-bold leading-tight text-foreground group-hover:text-primary ${featured ? "font-[family-name:var(--font-display)] text-xl" : "text-[13px]"}`}>
          {member.name}
        </span>
        <span className={`mt-1 block font-semibold text-primary ${featured ? "text-sm leading-5" : "text-[11px] leading-4"}`}>
          {displayPosition}
        </span>
        {member.department?.name ? (
          <span className={`block text-muted-foreground ${featured ? "mt-2 text-xs leading-5" : "mt-1 line-clamp-2 pr-1 text-[11px] leading-4"}`}>
            {member.department.name}
          </span>
        ) : null}
      </span>
      <ArrowRight aria-hidden className={`absolute right-2.5 shrink-0 text-muted-foreground/70 transition group-hover:translate-x-0.5 group-hover:text-primary ${featured ? "top-1/2 h-5 w-5 -translate-y-1/2" : "bottom-2.5 h-3.5 w-3.5"}`} />
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

function tierLabel(key: string, label: string) {
  return key === "cod" ? "Department Leadership" : label;
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

      {visibleTiers.map((tier) => (
        <section key={tier.key} aria-labelledby={`team-tier-${tier.key}`} className="rounded-[1.25rem] border border-border/80 bg-white/80 p-4 shadow-sm backdrop-blur-sm sm:p-5">
          <div className="mb-4 flex items-center gap-3">
            <h3
              id={`team-tier-${tier.key}`}
              className="text-xs font-bold uppercase tracking-[0.08em] text-primary"
            >
              {tierLabel(tier.key, tier.label)}
            </h3>
            <span className="h-px flex-1 bg-surface-muted" />
          </div>
          <div className={`grid gap-2.5 ${["leadership", "head", "dean"].includes(tier.key) ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-2 xl:grid-cols-4"}`}>
            {tier.members.map((member) => (
              <TeamCard
                key={member.id}
                member={member}
                featured={["leadership", "head", "dean"].includes(tier.key)}
                position={
                  tier.key === "dean"
                    ? "Dean"
                    : tier.key === "cod"
                      ? "Chair of Department"
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
