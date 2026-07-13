import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { PublicImage } from "@/components/public/public-image";
import type { UniversityCouncilMemberCard as UniversityCouncilMemberCardData } from "@/lib/about-data";

function profileHref(member: UniversityCouncilMemberCardData) {
  return member.slug ? `/about/university-council/${member.slug}` : "/about/university-council";
}

export function UniversityCouncilCard({
  member,
  variant = "member",
}: {
  member: UniversityCouncilMemberCardData;
  variant?: "featured" | "member";
}) {
  const featured = variant === "featured";
  const summary = member.profile_summary?.trim();

  return (
    <Link
      href={profileHref(member)}
      aria-label={`View profile of ${member.name}, ${member.role}`}
      className={`group block overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
        featured ? "mx-auto max-w-md" : ""
      }`}
    >
      <div className={featured ? "grid gap-0 sm:grid-cols-[11rem_minmax(0,1fr)]" : ""}>
        <PublicImage
          src={member.portrait?.url}
          alt={member.portrait?.alt || `${member.name}, ${member.role}`}
          ratio="profile"
          className={featured ? "h-full min-h-48" : ""}
          sizes={featured ? "(min-width: 640px) 12rem, 100vw" : "(min-width: 1280px) 20vw, (min-width: 640px) 33vw, 100vw"}
        />
        <div className="p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="font-[family-name:var(--font-display)] text-xl font-semibold leading-tight text-slate-950">
                {member.name}
              </h3>
              <p className="mt-2 inline-flex rounded-md bg-primary/10 px-2.5 py-1 text-xs font-bold uppercase tracking-[0.12em] text-primary">
                {member.role}
              </p>
            </div>
            <ExternalLink aria-hidden className="mt-1 h-4 w-4 shrink-0 text-slate-400 transition group-hover:text-primary" />
          </div>
          {member.is_acting ? (
            <p className="mt-3 text-xs font-semibold uppercase tracking-[0.12em] text-secondary">
              Acting appointment
            </p>
          ) : null}
          {summary ? (
            <p className="mt-4 line-clamp-4 text-sm leading-6 text-slate-600">
              {summary}
            </p>
          ) : null}
        </div>
      </div>
    </Link>
  );
}
