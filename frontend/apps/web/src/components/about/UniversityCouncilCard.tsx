import Link from "next/link";
import { PublicImage } from "@/components/public/public-image";
import type { UniversityCouncilMemberCard as UniversityCouncilMemberCardData } from "@/lib/about-data";

function profileHref(member: UniversityCouncilMemberCardData) {
  if (member.person_id) return `/staff/${member.person_id}`;
  return member.slug ? `/about/university-council/${member.slug}` : null;
}

export function UniversityCouncilCard({
  member,
  variant = "member",
}: {
  member: UniversityCouncilMemberCardData;
  variant?: "featured" | "member" | "secretary";
}) {
  const featured = variant === "featured";
  const secretary = variant === "secretary";
  const summary = member.profile_summary?.trim();
  const href = profileHref(member);

  const card = (
    <article
      className={`group relative overflow-hidden rounded-lg border border-border bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl ${
        featured ? "mx-auto w-full max-w-[310px]" : secretary ? "mx-auto w-full max-w-[420px]" : "w-full"
      }`}
    >
      <div className={secretary ? "grid gap-0 sm:grid-cols-[8.5rem_minmax(0,1fr)]" : ""}>
        <PublicImage
          src={member.portrait?.url}
          alt={member.portrait?.alt || `${member.name}, ${member.role}`}
          ratio="profile"
          className={secretary ? "h-full min-h-36" : featured ? "aspect-[4/3]" : "aspect-[4/3]"}
          sizes={secretary ? "136px" : featured ? "310px" : "200px"}
          imageClassName="object-cover object-top transition duration-500 group-hover:scale-[1.025]"
        />
        <div className={featured ? "p-5 text-center" : "p-3 text-center"}>
          <h3 className={`font-[family-name:var(--font-display)] font-semibold leading-tight text-foreground ${featured ? "text-xl" : "text-sm"}`}>
            {member.name}
          </h3>
          <p className={`mt-2 font-bold uppercase tracking-[0.08em] text-secondary ${featured ? "text-xs" : "text-[10px]"}`}>
            {member.role}
          </p>
          {member.is_acting ? (
            <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-secondary">
              Acting appointment
            </p>
          ) : null}
          {summary ? (
            <p className="mt-2 line-clamp-2 text-xs leading-5 text-muted-foreground">
              {summary}
            </p>
          ) : null}
        </div>
      </div>
      {href ? (
        <span className="pointer-events-none absolute inset-x-0 bottom-0 translate-y-full bg-primary/95 px-3 py-2 text-center text-[10px] font-bold uppercase tracking-[0.14em] text-white transition-transform duration-300 group-hover:translate-y-0 group-focus-within:translate-y-0">
          View staff profile
        </span>
      ) : null}
    </article>
  );

  return href ? (
    <Link
      href={href}
      aria-label={`View staff profile of ${member.name}, ${member.role}`}
      className={`block rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${featured || secretary ? "mx-auto" : ""}`}
    >
      {card}
    </Link>
  ) : card;
}
