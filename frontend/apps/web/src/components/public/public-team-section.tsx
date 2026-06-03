"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowRight,
  ChevronDown,
  Mail,
  Search,
  UserRound,
  Users,
} from "lucide-react";
import { PublicImage } from "@/components/public/public-image";
import type {
  PublicTeamAssignment,
  PublicTeamData,
  PublicTeamPerson,
} from "@/lib/public-team-data";
import { publicFileUrl, resolvePublicMediaUrl } from "@/lib/public-media";

type TeamMember = {
  id: string;
  name: string;
  role: string;
  email: string | null;
  office: string | null;
  interests: string[];
  photoUrl: string | null;
  group: string;
  assignment: PublicTeamAssignment;
};

type StaffGroup = {
  key: string;
  label: string;
  members: TeamMember[];
};

const groupLabels: Record<string, string> = {
  academic: "Academic Staff",
  administrative: "Administrative Staff",
  technical: "Technical Staff",
  other: "Other Team Members",
};

function present(value?: string | number | null) {
  if (value === null || value === undefined) return null;
  const text = String(value).trim();
  return text.length ? text : null;
}

function displayName(person?: PublicTeamPerson | null) {
  if (!person) return "Staff profile";

  const title = present(person.title);
  const fullName = present(person.full_name);

  if (fullName) {
    if (title && !fullName.toLowerCase().startsWith(title.toLowerCase())) {
      return `${title} ${fullName}`;
    }
    return fullName;
  }

  return (
    [person.title, person.first_name, person.middle_name, person.last_name]
      .map((value) => present(value))
      .filter(Boolean)
      .join(" ") || "Staff profile"
  );
}

function initialsFromName(name: string) {
  const parts = name
    .split(/\s+/)
    .map((part) => part.replace(/[^A-Za-z]/g, ""))
    .filter(Boolean)
    .filter(
      (part) =>
        !new Set(["dr", "prof", "mr", "mrs", "ms", "rev", "eng"]).has(
          part.toLowerCase(),
        ),
    );

  if (!parts.length) return "S";
  const selected = parts.length === 1 ? [parts[0]] : [parts[0], parts.at(-1)!];
  return selected
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function personPhoto(person?: PublicTeamPerson | null) {
  return (
    resolvePublicMediaUrl(person?.photo_url) ??
    publicFileUrl(person?.photo_id) ??
    null
  );
}

function roleLabel(
  assignment: PublicTeamAssignment,
  person?: PublicTeamPerson,
) {
  return (
    present(assignment.title) ||
    present(assignment.role_display) ||
    present(assignment.role_label) ||
    present(assignment.role?.replace(/_/g, " ")) ||
    present(person?.institutional_role) ||
    present(person?.academic_rank) ||
    "Staff member"
  );
}

function groupKey(assignment: PublicTeamAssignment, person?: PublicTeamPerson) {
  if (assignment.group && assignment.group !== "leadership")
    return assignment.group;

  const role = assignment.role?.toLowerCase() ?? "";
  if (
    ["dean", "deputy_dean", "hod", "head", "cod", "coordinator"].includes(role)
  ) {
    return "leadership";
  }
  if (
    person?.academic_rank ||
    /lecturer|professor|tutorial|academic/.test(role)
  ) {
    return "academic";
  }
  if (/technician|laboratory|lab|ict|technical/.test(role)) return "technical";
  if (/admin|officer|accountant|secretary|assistant|staff/.test(role)) {
    return "administrative";
  }
  return "other";
}

function buildMembers(team: PublicTeamData): TeamMember[] {
  return team.assignments
    .map((assignment) => {
      const person = team.persons[assignment.person_id];
      const name = displayName(person);

      return {
        id: assignment.id,
        name,
        role: roleLabel(assignment, person),
        email: present(person?.email),
        office: present(person?.office_location),
        interests: (person?.research_interests ?? [])
          .map((item) => present(item))
          .filter((item): item is string => Boolean(item))
          .slice(0, 3),
        photoUrl: personPhoto(person),
        group: groupKey(assignment, person),
        assignment,
      };
    })
    .sort(
      (first, second) =>
        Number(first.assignment.hierarchy_level ?? 99) -
          Number(second.assignment.hierarchy_level ?? 99) ||
        Number(first.assignment.display_order ?? 100) -
          Number(second.assignment.display_order ?? 100) ||
        first.name.localeCompare(second.name),
    );
}

function memberLevel(member: TeamMember) {
  const value = Number(member.assignment.hierarchy_level ?? 99);
  return Number.isFinite(value) ? value : 99;
}

function isTopLeadership(member: TeamMember) {
  const role = member.assignment.role?.toLowerCase();
  const level = memberLevel(member);
  return (
    level <= 5 ||
    role === "dean" ||
    (Boolean(member.assignment.is_primary) &&
      ["hod", "head", "cod"].includes(role ?? ""))
  );
}

function isDeputyOrCoordinator(member: TeamMember) {
  const role = member.assignment.role?.toLowerCase() ?? "";
  return (
    !isTopLeadership(member) &&
    (memberLevel(member) <= 8 || /deputy|coordinator|cod|hod|head/.test(role))
  );
}

function groupStaffMembers(members: TeamMember[]): StaffGroup[] {
  const grouped = new Map<string, TeamMember[]>();

  for (const member of members) {
    const key = member.group === "leadership" ? "other" : member.group;
    grouped.set(key, [...(grouped.get(key) ?? []), member]);
  }

  return ["academic", "administrative", "technical", "other"]
    .map((key) => ({
      key,
      label: groupLabels[key] ?? "Team Members",
      members: grouped.get(key) ?? [],
    }))
    .filter((group) => group.members.length);
}

function roleOptions(members: TeamMember[]) {
  return Array.from(
    new Map(
      members.map((member) => [
        member.assignment.role ?? member.role,
        member.assignment.role_label ?? member.role,
      ]),
    ).entries(),
  )
    .map(([value, label]) => ({ value, label }))
    .sort((first, second) => first.label.localeCompare(second.label));
}

function filterMembers(members: TeamMember[], query: string, role: string) {
  const term = query.trim().toLowerCase();

  return members.filter((member) => {
    const matchesRole = role === "all" || member.assignment.role === role;
    const matchesQuery =
      !term ||
      [member.name, member.role, member.email, member.office]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(term));
    return matchesRole && matchesQuery;
  });
}

function Avatar({ member }: { member: TeamMember }) {
  if (member.photoUrl) {
    return (
      <PublicImage
        src={member.photoUrl}
        alt={member.name}
        ratio="profile"
        sizes="64px"
        className="h-full w-full"
      />
    );
  }

  return (
    <span className="flex h-full w-full items-center justify-center bg-primary/[0.08] font-[family-name:var(--font-display)] text-lg font-semibold text-primary">
      {initialsFromName(member.name)}
    </span>
  );
}

function SearchControls({
  query,
  role,
  roles,
  onQuery,
  onRole,
}: {
  query: string;
  role: string;
  roles: Array<{ value: string; label: string }>;
  onQuery: (value: string) => void;
  onRole: (value: string) => void;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-[minmax(220px,1fr)_10rem]">
      <label className="relative block">
        <Search
          aria-hidden
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
        />
        <input
          value={query}
          onChange={(event) => onQuery(event.target.value)}
          placeholder="Search team member..."
          className="h-11 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none ring-primary/20 transition placeholder:text-slate-400 focus:border-primary focus:ring-4"
        />
      </label>
      <label className="relative block">
        <select
          value={role}
          onChange={(event) => onRole(event.target.value)}
          className="h-11 w-full appearance-none rounded-lg border border-slate-200 bg-white px-3 pr-9 text-sm font-semibold text-slate-700 outline-none ring-primary/20 transition focus:border-primary focus:ring-4"
        >
          <option value="all">All Roles</option>
          {roles.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
        <ChevronDown
          aria-hidden
          className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
        />
      </label>
    </div>
  );
}

function ProfileLink({ member }: { member: TeamMember }) {
  return (
    <Link
      href={`/staff/${member.assignment.person_id}`}
      className="mt-2 inline-flex min-h-7 items-center gap-1.5 text-xs font-bold text-primary"
    >
      View profile
      <ArrowRight aria-hidden className="h-3.5 w-3.5" />
    </Link>
  );
}

function LeadershipCard({
  member,
  top = false,
}: {
  member: TeamMember;
  top?: boolean;
}) {
  return (
    <article
      className={`relative min-w-0 rounded-lg border border-slate-200 bg-white shadow-sm transition hover:border-primary/25 hover:shadow-md ${
        top ? "mx-auto w-full max-w-sm p-4" : "p-3"
      }`}
    >
      <span className="absolute right-3 top-[-0.7rem] rounded bg-primary px-2 py-1 text-[0.65rem] font-bold uppercase tracking-[0.08em] text-white">
        Leadership
      </span>
      <div className="flex min-w-0 gap-3">
        <div
          className={`${
            top ? "h-20 w-20" : "h-14 w-14"
          } shrink-0 overflow-hidden rounded-lg bg-slate-100`}
        >
          <Avatar member={member} />
        </div>
        <div className="min-w-0 flex-1">
          <h2
            className={`${
              top ? "text-base" : "text-sm"
            } truncate font-bold text-slate-950`}
          >
            {member.name}
          </h2>
          <p className="mt-1 line-clamp-2 text-xs font-semibold capitalize leading-4 text-primary">
            {member.role}
          </p>
          {member.email ? (
            <a
              href={`mailto:${member.email}`}
              className="mt-3 flex min-w-0 items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-primary"
            >
              <Mail aria-hidden className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{member.email}</span>
            </a>
          ) : null}
          <ProfileLink member={member} />
        </div>
      </div>
    </article>
  );
}

function MiniMemberCard({ member }: { member: TeamMember }) {
  return (
    <article className="min-w-0 rounded-lg border border-slate-200 bg-white p-3 shadow-sm transition hover:border-primary/25 hover:shadow-md">
      <div className="flex min-w-0 gap-3">
        <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-slate-100">
          <Avatar member={member} />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-bold text-slate-950">
            {member.name}
          </h3>
          <p className="mt-1 line-clamp-2 text-xs font-semibold capitalize leading-4 text-primary">
            {member.role}
          </p>
          {member.email ? (
            <a
              href={`mailto:${member.email}`}
              className="mt-2 flex min-w-0 items-center gap-1.5 text-[0.72rem] font-medium text-slate-500 hover:text-primary"
            >
              <Mail aria-hidden className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{member.email}</span>
            </a>
          ) : null}
          <ProfileLink member={member} />
        </div>
      </div>
    </article>
  );
}

function LeadershipFeature({ member }: { member: TeamMember }) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="grid gap-4 md:grid-cols-[auto_minmax(0,1fr)_auto] md:items-center">
        <div className="h-24 w-24 overflow-hidden rounded-lg bg-slate-100">
          <Avatar member={member} />
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded bg-primary px-2 py-1 text-[0.65rem] font-bold uppercase tracking-[0.08em] text-white">
              Leadership
            </span>
            <span className="text-xs font-bold uppercase tracking-[0.08em] text-slate-500">
              {member.role}
            </span>
          </div>
          <h2 className="mt-2 font-[family-name:var(--font-display)] text-2xl font-semibold leading-tight text-slate-950">
            {member.name}
          </h2>
          {member.email ? (
            <a
              href={`mailto:${member.email}`}
              className="mt-2 flex min-w-0 items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-primary"
            >
              <Mail aria-hidden className="h-4 w-4 shrink-0" />
              <span className="truncate">{member.email}</span>
            </a>
          ) : null}
          {member.interests.length ? (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {member.interests.map((interest) => (
                <span
                  key={interest}
                  className="rounded-full bg-primary/[0.07] px-2 py-1 text-[0.7rem] font-semibold text-primary"
                >
                  {interest}
                </span>
              ))}
            </div>
          ) : null}
        </div>
        <Link
          href={`/staff/${member.assignment.person_id}`}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-bold text-white transition hover:bg-primary/90"
        >
          View profile
          <ArrowRight aria-hidden className="h-4 w-4" />
        </Link>
      </div>
    </article>
  );
}

function StaffGroupPanel({ group }: { group: StaffGroup }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <Users aria-hidden className="h-4 w-4 shrink-0 text-primary" />
          <h2 className="truncate text-sm font-bold uppercase tracking-[0.06em] text-primary">
            {group.label}
          </h2>
        </div>
        <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-bold text-slate-600">
          {group.members.length}
        </span>
      </div>
      <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
        {group.members.map((member) => (
          <MiniMemberCard key={member.id} member={member} />
        ))}
      </div>
    </section>
  );
}

export function PublicTeamSection({
  team,
  title,
  emptyTitle = "No public team records are available yet.",
}: {
  team?: PublicTeamData | null;
  title?: string;
  emptyTitle?: string;
}) {
  const [query, setQuery] = useState("");
  const [role, setRole] = useState("all");
  const members = useMemo(() => (team ? buildMembers(team) : []), [team]);
  const roles = useMemo(() => roleOptions(members), [members]);
  const visibleMembers = useMemo(
    () => filterMembers(members, query, role),
    [members, query, role],
  );
  const topLeadership = visibleMembers.filter(isTopLeadership);
  const deputies = visibleMembers.filter(isDeputyOrCoordinator);
  const staffMembers = visibleMembers.filter(
    (member) => !isTopLeadership(member) && !isDeputyOrCoordinator(member),
  );
  const staffGroups = groupStaffMembers(staffMembers);
  const heading = title ?? `${team?.entity?.name ?? "Team"} Team`;
  const subtitle = team?.entity?.name ?? "Published team members";

  if (!members.length) {
    return (
      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/[0.08] text-primary">
            <UserRound aria-hidden className="h-5 w-5" />
          </span>
          <div>
            <p className="text-sm font-semibold text-slate-950">{emptyTitle}</p>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              Published members will appear here once active public assignments
              are attached to this unit.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="grid gap-5">
      <div className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.08em] text-primary">
            {subtitle}
          </p>
          <h2 className="mt-1 font-[family-name:var(--font-display)] text-2xl font-semibold text-slate-950">
            {heading}
          </h2>
        </div>
        <SearchControls
          query={query}
          role={role}
          roles={roles}
          onQuery={setQuery}
          onRole={setRole}
        />
      </div>

      {visibleMembers.length ? (
        <div className="grid gap-5">
          {topLeadership.length ? (
            <div className="grid gap-3">
              <LeadershipFeature member={topLeadership[0]} />
              {topLeadership.length > 1 ? (
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                  {topLeadership.slice(1).map((member) => (
                    <LeadershipCard key={member.id} member={member} />
                  ))}
                </div>
              ) : null}
            </div>
          ) : null}

          {deputies.length ? (
            <section className="relative rounded-lg border border-primary/25 bg-primary/[0.02] p-4">
              <div className="absolute left-1/2 top-[-1.25rem] hidden h-5 border-l border-primary/30 md:block" />
              <div className="mb-4 flex justify-center">
                <span className="rounded bg-primary px-2 py-1 text-[0.65rem] font-bold uppercase tracking-[0.08em] text-white">
                  Coordinators
                </span>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                {deputies.map((member) => (
                  <LeadershipCard key={member.id} member={member} />
                ))}
              </div>
            </section>
          ) : null}

          {staffGroups.length ? (
            <div
              className={
                staffGroups.length === 1
                  ? "grid gap-5"
                  : "grid gap-5 xl:grid-cols-2"
              }
            >
              {staffGroups.map((group) => (
                <StaffGroupPanel key={group.key} group={group} />
              ))}
            </div>
          ) : null}
        </div>
      ) : (
        <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold text-slate-950">
            No team members match the current search.
          </p>
          <p className="mt-1 text-sm leading-6 text-slate-600">
            Clear the search field or choose All Roles to view the full team.
          </p>
        </section>
      )}
    </section>
  );
}
