"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import type { TeamSummary } from "../../lib/api";
import { RevealItem } from "../motion/reveal";

const groups = ["All", "Leadership", "Senior Researchers", "Research Fellows"];

function groupForRole(role: string) {
  const value = role.toLowerCase();
  if (value.includes("chair") || value.includes("coordinator"))
    return "Leadership";
  if (value.includes("fellow")) return "Research Fellows";
  return "Senior Researchers";
}

export function TeamDirectory({ members }: { members: TeamSummary[] }) {
  const [activeGroup, setActiveGroup] = useState("All");
  const filtered = useMemo(
    () =>
      activeGroup === "All"
        ? members
        : members.filter((member) => groupForRole(member.role) === activeGroup),
    [activeGroup, members],
  );

  return (
    <>
      <div className="mt-10 flex flex-wrap gap-2 rounded-2xl bg-heri-ink p-2 text-white">
        {groups.map((group) => (
          <button
            aria-pressed={activeGroup === group}
            className={`rounded-xl px-4 py-3 text-sm font-semibold transition ${activeGroup === group ? "bg-heri-lime text-heri-ink" : "text-white/80 hover:bg-white/10"}`}
            key={group}
            onClick={() => setActiveGroup(group)}
            type="button"
          >
            {group}
          </button>
        ))}
      </div>
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {filtered.map((member, index) => (
          <RevealItem key={member.id} index={index} className="h-full">
            <article
              className="group h-full overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-1 hover:shadow-xl"
            >
              <Link href={`/team/${member.slug}`}>
                <div className="relative aspect-[4/3] overflow-hidden bg-heri-cream">
                  {member.photo_url ? (
                    <Image
                      alt={member.name}
                      className="object-cover transition duration-500 group-hover:scale-105"
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      src={member.photo_url}
                      unoptimized
                    />
                  ) : (
                    <div className="grid size-full place-items-center text-4xl font-bold text-heri-teal">
                      {member.name.slice(0, 1)}
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <h2 className="text-lg font-bold text-heri-blue">
                    {member.name}
                  </h2>
                  <p className="mt-1 text-sm font-semibold text-heri-teal">
                    {member.role}
                  </p>
                  <p className="mt-4 line-clamp-3 text-sm leading-6 text-slate-600">
                    {member.biography}
                  </p>
                  <span className="mt-5 inline-flex text-xs font-bold uppercase tracking-wide text-heri-blue">
                    View profile <span className="ml-2 text-heri-lime">→</span>
                  </span>
                </div>
              </Link>
            </article>
          </RevealItem>
        ))}
      </div>
      {filtered.length === 0 && (
        <p className="mt-10 rounded-2xl border border-dashed border-slate-300 p-10 text-center text-slate-600">
          No team members are currently published in this group.
        </p>
      )}
    </>
  );
}
