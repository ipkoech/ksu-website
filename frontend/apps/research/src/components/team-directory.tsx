"use client";

import Link from "next/link";
import Image from "next/image";
import { resolveMainMediaUrl } from "@ksu/api-client/media";
import { ArrowRight, Building2, ExternalLink, UserRound } from "lucide-react";
import { ResearchPageHero } from "./research-page-hero";
import { StatusMessage } from "./research-ui";
import { compactText } from "../lib/research-formatters";

export type ResearchPersonDto = {
  id: string;
  slug?: string | null;
  full_name?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  title?: string | null;
  photo_url?: string | null;
  academic_rank?: string | null;
  department_name?: string | null;
  department?: { name?: string | null } | null;
  institutional_role?: string | null;
  bio?: string | null;
  specialization?: string | null;
};

export function ResearchTeamDirectory({
  people,
  error,
  mainSite,
}: {
  people: ResearchPersonDto[];
  error: string | null;
  mainSite: string;
}) {
  return (
    <>
      <div data-server-data-display="research-team">
        <TeamMasthead />
        <section className="border-b border-border bg-white px-4 py-12 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
          <div className="mx-auto max-w-6xl">
            <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-eyebrow text-secondary">REIRM</p>
                <h2 className="mt-2 font-display text-3xl font-normal leading-tight text-foreground sm:text-4xl">Meet the office team</h2>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">Research, Extension, Innovation and Resource Mobilization at Kisii University.</p>
              </div>

            </div>

            {error ? (
              <StatusMessage tone="error">{error}</StatusMessage>
            ) : people.length === 0 ? (
              <StatusMessage tone="neutral">Research office staff profiles have not yet been published. Contact the office for assistance.</StatusMessage>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {people.map((person) => {
                  const name = personName(person);
                  const role = compactText(person.institutional_role) || compactText(person.title);
                  const department = person.department_name || person.department?.name;
                  return (
                    <a key={person.id} href={`${mainSite}/staff/${person.slug || person.id}`} target="_blank" rel="noopener noreferrer" className="group rounded-lg border border-border bg-card p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md">
                      <div className="relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-primary/10 text-primary">{person.photo_url ? <Image src={resolveMainMediaUrl(person.photo_url)!} alt={name} fill sizes="96px" className="object-cover" unoptimized /> : <UserRound aria-hidden className="h-6 w-6" />}</div>
                      <h3 className="mt-4 font-display text-lg font-semibold text-foreground group-hover:text-primary">{name}</h3>
                      {role ? <p className="mt-1 text-sm font-medium text-primary">{role}</p> : null}
                      {person.academic_rank ? <p className="mt-0.5 text-xs capitalize text-muted-foreground">{person.academic_rank}</p> : null}
                      {department ? <p className="mt-2 line-clamp-1 text-xs leading-5 text-muted-foreground">{department}</p> : null}
                      {person.specialization || person.bio ? <p className="mt-3 line-clamp-3 text-sm leading-6 text-muted-foreground">{compactText(person.specialization) || compactText(person.bio)}</p> : null}
                      <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-primary">View profile <ExternalLink aria-hidden className="h-3 w-3" /></span>
                    </a>
                  );
                })}
              </div>
            )}

            <div className="mt-8 rounded-lg border border-border bg-accent/60 p-6">
              <div className="flex items-start gap-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"><Building2 aria-hidden className="h-5 w-5" /></span>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">REIRM Research Office</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">The Directorate of Research, Extension, Innovation and Resource Mobilization is the administrative home for research at Kisii University.</p>
                  <Link href="/connect" className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-secondary">Contact the office <ArrowRight aria-hidden className="h-4 w-4" /></Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

function TeamMasthead() {
  return <ResearchPageHero eyebrow="" title="Team" imageSrc="/images/research/headers/innovation-week-8173.jpg" imageAlt="Kisii University research leadership" />;
}

function personName(person: ResearchPersonDto) {
  return compactText(person.full_name) || [person.first_name, person.last_name].map(compactText).filter(Boolean).join(" ") || person.id;
}
