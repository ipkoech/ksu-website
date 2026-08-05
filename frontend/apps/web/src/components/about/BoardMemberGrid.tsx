import { PublicImage } from "@/components/public/public-image";

export interface BoardMember {
  name: string;
  role: string;
  note?: string;
  photoUrl?: string | null;
  profileHref?: string;
}

export function BoardMemberGrid({ members }: { members: BoardMember[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {members.map((member, index) => (
        <article
          key={`${member.name}-${member.role}-${index}`}
          className="rounded-[1.5rem] border border-border bg-white p-5 shadow-lg shadow-primary/40"
        >
          <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl bg-[linear-gradient(135deg,#dbeafe,#f8fafc)] font-[family-name:var(--font-display)] text-xl text-primary">
            {member.photoUrl ? (
              <PublicImage
                src={member.photoUrl}
                alt={member.name}
                ratio="profile"
                sizes="56px"
                className="h-full w-full"
              />
            ) : (
              member.name
                .split(" ")
                .slice(0, 2)
                .map((part) => part[0])
                .join("")
            )}
          </div>
          <h3 className="mt-4 text-lg font-semibold text-foreground">
            {member.name}
          </h3>
          <p className="mt-2 text-sm font-medium uppercase tracking-[0.18em] text-muted-foreground">
            {member.role}
          </p>
          {member.note ? (
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              {member.note}
            </p>
          ) : null}
        </article>
      ))}
    </div>
  );
}
