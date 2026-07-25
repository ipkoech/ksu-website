import Link from "next/link";
import { PublicImage } from "@/components/public/public-image";

export interface LeaderCardData {
  slug: string;
  name: string;
  role: string;
  credentials?: string;
  email?: string;
  phone?: string;
  summary: string;
  photoUrl?: string;
}

const nonNameInitialParts = new Set([
  "ag",
  "acting",
  "bed",
  "bsc",
  "cpa",
  "dr",
  "eng",
  "mphil",
  "mr",
  "mrs",
  "ms",
  "msc",
  "phd",
  "postdoc",
  "prof",
  "rev",
]);

function initialsFromName(name: string) {
  const nameParts = name
    .split(/\s+/)
    .map((part) => part.replace(/[^A-Za-z]/g, ""))
    .filter(Boolean)
    .filter((part) => !nonNameInitialParts.has(part.toLowerCase()));

  if (nameParts.length === 0) {
    return name.slice(0, 2).toUpperCase();
  }

  const selectedParts =
    nameParts.length === 1
      ? [nameParts[0]]
      : [nameParts[0], nameParts[nameParts.length - 1]];

  return selectedParts
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function LeaderPortrait({
  name,
  photoUrl,
}: {
  name: string;
  photoUrl?: string;
}) {
  if (photoUrl) {
    return (
      <PublicImage
        src={photoUrl}
        alt={name}
        ratio="profile"
        sizes="96px"
        className="h-24 w-24 rounded-3xl"
      />
    );
  }

  return (
    <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-[linear-gradient(135deg,#dbeafe,#bfdbfe_55%,#f8fafc)] font-[family-name:var(--font-display)] text-3xl text-primary">
      {initialsFromName(name)}
    </div>
  );
}

export function LeaderCard({
  leader,
  href,
  featured = false,
}: {
  leader: LeaderCardData;
  href?: string;
  featured?: boolean;
}) {
  return (
    <article
      className={`rounded-[1.75rem] border border-border bg-white p-6 shadow-lg shadow-primary/50 ${
        featured ? "md:p-8" : ""
      }`}
    >
      <div
        className={`gap-6 ${featured ? "md:grid md:grid-cols-[auto_1fr]" : ""}`}
      >
        <LeaderPortrait name={leader.name} photoUrl={leader.photoUrl} />
        <div className={featured ? "mt-6 md:mt-0" : "mt-5"}>
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-secondary">
            {leader.role}
          </p>
          <h3 className="mt-3 text-2xl font-semibold text-foreground">
            {leader.name}
          </h3>
          {leader.credentials ? (
            <p className="mt-2 text-sm text-muted-foreground">{leader.credentials}</p>
          ) : null}
          <p className="mt-4 text-base leading-7 text-muted-foreground">
            {leader.summary}
          </p>
          {(leader.email || leader.phone) && featured ? (
            <div className="mt-5 flex flex-col gap-2 text-sm text-muted-foreground">
              {leader.email ? <span>{leader.email}</span> : null}
              {leader.phone ? <span>{leader.phone}</span> : null}
            </div>
          ) : null}
          {href ? (
            <Link
              href={href}
              className="mt-6 inline-flex min-h-8 items-center text-sm font-semibold text-primary transition hover:translate-x-1"
            >
              View profile
            </Link>
          ) : null}
        </div>
      </div>
    </article>
  );
}
