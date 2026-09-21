"use client";

import Image from "next/image";
import Link from "next/link";
import { Mail } from "lucide-react";
import { Reveal } from "../motion/reveal";
import type { TeamSummary } from "../../lib/api";

export function TeamMemberDisplay({ member, isChair }: { member: TeamSummary; isChair: boolean }) {
  return (
    <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-16 lg:grid-cols-[0.42fr_0.58fr] lg:px-10 lg:py-24" data-server-data-display="heri-team-member">
      <Reveal>
        <div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-heri-cream shadow-xl">
          {member.photo_url ? (
            <Image
              alt={member.name}
              className="object-cover"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 42vw"
              src={member.photo_url}
              unoptimized
            />
          ) : (
            <div className="grid size-full place-items-center text-7xl font-bold text-heri-teal">
              {member.name.slice(0, 1)}
            </div>
          )}
        </div>
      </Reveal>
      <Reveal delay={0.1}>
        <article>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-heri-lime">
            {isChair ? "HERI Africa Research Chair" : "HERI Africa Research Team"}
          </p>
          <h1 className="mt-4 text-5xl font-bold leading-tight text-heri-blue">{member.name}</h1>
          <p className="mt-3 text-xl font-semibold text-heri-teal">{member.role}</p>
          <div className="mt-7 h-1 w-12 bg-heri-lime" />
          <p className="mt-7 whitespace-pre-line text-base leading-8 text-slate-600">{member.biography}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link className="inline-flex items-center gap-2 rounded-lg bg-heri-lime px-5 py-3 text-xs font-bold text-heri-ink" href="/contact">
              <Mail className="size-4" /> {isChair ? "CONTACT THE CHAIR" : "GET IN TOUCH"}
            </Link>
            <Link className="inline-flex rounded-lg border border-heri-teal px-5 py-3 text-xs font-bold text-heri-teal" href="/research/publications">
              RESEARCH &amp; PUBLICATIONS -&gt;
            </Link>
          </div>
        </article>
      </Reveal>
    </div>
  );
}
