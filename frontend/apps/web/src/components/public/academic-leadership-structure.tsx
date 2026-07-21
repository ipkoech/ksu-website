import Link from "next/link";
import { ArrowRight, ChevronDown, Users } from "lucide-react";
import { ScrollReveal } from "@ksu/ui/components";
import { PublicImage } from "@/components/public/public-image";
import type {
  AcademicOrganization,
  AcademicOrganizationMember,
  AcademicOrganizationTier,
} from "@/lib/public-team-data";

function tierByKey(data: AcademicOrganization, key: string) {
  return data.tiers.find((tier) => tier.key === key) ?? null;
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function LeaderIdentity({
  member,
  featured = false,
}: {
  member: AcademicOrganizationMember;
  featured?: boolean;
}) {
  const content = (
    <>
      <div
        className={`relative shrink-0 overflow-hidden rounded-full bg-primary/10 text-primary ${
          featured ? "h-20 w-20 sm:h-24 sm:w-24" : "h-14 w-14"
        }`}
      >
        {member.photo_url ? (
          <PublicImage
            src={member.photo_url}
            alt={`${member.name}, ${member.title ?? member.position ?? "academic leader"}`}
            ratio="fill"
            className="h-full w-full rounded-full"
            imageClassName="object-cover"
            sizes={featured ? "96px" : "56px"}
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center font-[family-name:var(--font-display)] text-lg font-semibold">
            {initials(member.name)}
          </span>
        )}
      </div>
      <div className="min-w-0">
        <p
          className={`font-[family-name:var(--font-display)] font-semibold text-foreground ${
            featured ? "text-xl sm:text-2xl" : "text-base"
          }`}
        >
          {member.name}
        </p>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">
          {member.title ?? member.position ?? "Academic leader"}
        </p>
        {member.entity?.name ? (
          <p className="mt-1 text-xs font-semibold uppercase tracking-[0.12em] text-secondary">
            {member.entity.name}
          </p>
        ) : null}
      </div>
      {member.profile_url ? (
        <ArrowRight
          className="ml-auto h-4 w-4 shrink-0 text-primary transition-transform group-hover:translate-x-1"
          aria-hidden
        />
      ) : null}
    </>
  );

  return member.profile_url ? (
    <Link
      href={member.profile_url}
      className="group flex min-w-0 items-center gap-4 rounded-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
    >
      {content}
    </Link>
  ) : (
    <div className="flex min-w-0 items-center gap-4">{content}</div>
  );
}

function TierHeading({ tier }: { tier: AcademicOrganizationTier }) {
  const labelByKey: Record<string, string> = {
    dvc: "DVC · ARSA",
    registrar: "Registrar · Academics",
    elearning: "E-Learning Director",
    student_affairs: "Dean of Students",
    deans: "School Deans",
  };

  return (
    <div className="flex items-center gap-3">
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white">
        <Users className="h-4 w-4" aria-hidden />
      </span>
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-secondary">
          {labelByKey[tier.key] ?? tier.label}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          {tier.members.length}{" "}
          {tier.members.length === 1 ? "leader" : "leaders"}
        </p>
      </div>
    </div>
  );
}

export function AcademicLeadershipStructure({
  data,
}: {
  data: AcademicOrganization;
}) {
  const dvc = tierByKey(data, "dvc");
  const registrar = tierByKey(data, "registrar");
  const deans = tierByKey(data, "deans");
  const supportTiers = data.tiers.filter((tier) =>
    ["elearning", "student_affairs"].includes(tier.key),
  );
  if (!dvc && !registrar && !deans && !supportTiers.length) return null;

  return (
    <ScrollReveal
      as="section"
      aria-labelledby="academic-leadership-title"
      className="border-y border-border bg-white px-4 py-12 sm:px-6 lg:px-8 lg:py-16"
    >
      <div className="mx-auto grid w-full max-w-[1680px] gap-10 lg:grid-cols-[minmax(240px,0.32fr)_minmax(0,0.68fr)] lg:gap-16">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-secondary">
            Academic leadership
          </p>
          <h2
            id="academic-leadership-title"
            className="mt-3 max-w-sm font-[family-name:var(--font-display)] text-3xl font-semibold leading-tight text-foreground sm:text-4xl"
          >
            The people guiding learning and scholarship.
          </h2>
          <p className="mt-4 max-w-sm text-base leading-7 text-muted-foreground">
            Meet the academic leadership structure responsible for schools,
            programmes, research, and student-facing academic services.
          </p>
        </div>

        <div className="relative border-l border-primary/15 pl-6 sm:pl-8">
          {dvc ? (
            <div className="relative border-b border-border pb-8">
              <TierHeading tier={dvc} />
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                {dvc.members.map((member) => (
                  <LeaderIdentity key={member.id} member={member} featured />
                ))}
              </div>
              <ChevronDown
                className="absolute -bottom-3 -left-[1.03rem] h-6 w-6 rounded-full bg-white text-secondary"
                aria-hidden
              />
            </div>
          ) : null}

          {registrar ? (
            <div className="relative border-b border-border py-8">
              <TierHeading tier={registrar} />
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                {registrar.members.map((member) => (
                  <LeaderIdentity key={member.id} member={member} featured />
                ))}
              </div>
              <ChevronDown
                className="absolute -bottom-3 -left-[1.03rem] h-6 w-6 rounded-full bg-white text-secondary"
                aria-hidden
              />
            </div>
          ) : null}

          {supportTiers.map((tier, index) => (
            <div
              key={tier.key}
              className={`relative border-b border-border ${index === 0 ? "py-8" : "py-6"}`}
            >
              <TierHeading tier={tier} />
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                {tier.members.map((member) => (
                  <LeaderIdentity key={member.id} member={member} featured />
                ))}
              </div>
            </div>
          ))}

          {deans ? (
            <div className="pt-8">
              <TierHeading tier={deans} />
              <div className="mt-5 grid gap-x-6 gap-y-5 sm:grid-cols-2 xl:grid-cols-3">
                {deans.members.map((member) => (
                  <LeaderIdentity key={member.id} member={member} />
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </ScrollReveal>
  );
}
