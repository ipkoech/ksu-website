"use client";

import { useMemo, useState } from "react";
import type { Person, StaffAssignment } from "@ksu/api-client";
import { resolvePublicMediaUrl } from "@/lib/public-media";
import {
  Mail,
  MapPin,
  Network,
  Phone,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import type { DepartmentDetailData } from "@/lib/department-detail-data";

type TeamFilter = "all" | "leadership" | "software" | "network" | "support";

type TeamMember = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  office: string | null;
  photoUrl: string | null;
  role: string;
  category: TeamFilter;
  assignment: StaffAssignment | null;
  person: Person;
};

type HierarchyGroup = {
  level: number | null;
  label: string;
  members: TeamMember[];
};

const hierarchyLabels: Record<number, string> = {
  1: "Governing lead",
  2: "University leadership",
  3: "Deputy leadership",
  4: "Registrar or officer",
  5: "Dean or director",
  6: "Deputy leadership",
  7: "Head",
  8: "Coordinator",
  9: "Senior staff",
  10: "Staff",
  11: "Assistant staff",
};

const filters: Array<{ value: TeamFilter; label: string }> = [
  { value: "all", label: "All staff" },
  { value: "leadership", label: "Leadership" },
  { value: "software", label: "Software" },
  { value: "network", label: "Network" },
  { value: "support", label: "Support" },
];

function present(value?: string | number | null) {
  if (value === null || value === undefined) return null;
  const text = String(value).trim();
  return text.length ? text : null;
}

function displayName(person?: Partial<Person> | null) {
  if (!person) return "Staff record";
  return (
    present(person.full_name) ||
    [person.title, person.first_name, person.middle_name, person.last_name]
      .map((value) => present(value))
      .filter(Boolean)
      .join(" ") ||
    "Staff record"
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
  return selected.map((part) => part[0]).join("").toUpperCase();
}

function roleLabel(assignment?: StaffAssignment | null, person?: Person) {
  return (
    present(assignment?.title) ||
    present(assignment?.role_display) ||
    present(assignment?.role?.replace(/_/g, " ")) ||
    present(person?.institutional_role?.replace(/_/g, " ")) ||
    present(person?.academic_rank) ||
    "Staff member"
  );
}

function categoryFor(memberRole: string, assignment?: StaffAssignment | null): TeamFilter {
  const value = `${memberRole} ${assignment?.role ?? ""}`.toLowerCase();
  const level = Number(assignment?.hierarchy_level ?? 99);
  if (level <= 7 || /manager|head|director|lead/.test(value)) return "leadership";
  if (/software|developer|systems|web|application/.test(value)) return "software";
  if (/network|connectivity|internet|lan|infrastructure/.test(value)) return "network";
  if (/support|cyber|security|installation|maintenance|help|service/.test(value)) return "support";
  return "all";
}

function mediaUrl(person: Person) {
  const raw = present(person.photo_url);
  return resolvePublicMediaUrl(raw);
}

function assignmentSort(first: StaffAssignment, second: StaffAssignment) {
  return (
    Number(first.hierarchy_level ?? 99) - Number(second.hierarchy_level ?? 99) ||
    Number(first.display_order ?? 100) - Number(second.display_order ?? 100) ||
    displayName(first.person).localeCompare(displayName(second.person))
  );
}

function buildMembers(data: DepartmentDetailData): TeamMember[] {
  const assignments = data.staffAssignments
    .filter((assignment) => assignment.is_public !== false)
    .filter((assignment) => !["ended", "inactive"].includes(assignment.status))
    .slice()
    .sort(assignmentSort);
  const assignmentByPerson = new Map(
    assignments
      .filter((assignment) => assignment.person_id)
      .map((assignment) => [assignment.person_id, assignment]),
  );
  const byId = new Map<string, TeamMember>();

  for (const person of data.staff) {
    const assignment = assignmentByPerson.get(person.id) ?? null;
    const role = roleLabel(assignment, person);
    byId.set(person.id, {
      id: person.id,
      name: displayName(person),
      email: present(person.email),
      phone: present(person.phone) ?? present(person.office_phone),
      office: present(person.office_location) ?? present(data.department.office_location),
      photoUrl: mediaUrl(person),
      role,
      category: categoryFor(role, assignment),
      assignment,
      person,
    });
  }

  for (const assignment of assignments) {
    const person = assignment.person;
    if (!person || byId.has(person.id)) continue;
    const role = roleLabel(assignment, person);
    byId.set(person.id, {
      id: person.id,
      name: displayName(person),
      email: present(person.email),
      phone: present(person.phone) ?? present(person.office_phone),
      office: present(person.office_location) ?? present(data.department.office_location),
      photoUrl: mediaUrl(person),
      role,
      category: categoryFor(role, assignment),
      assignment,
      person,
    });
  }

  return Array.from(byId.values()).sort((first, second) => {
    const firstAssignment = first.assignment;
    const secondAssignment = second.assignment;
    if (firstAssignment && secondAssignment) return assignmentSort(firstAssignment, secondAssignment);
    if (firstAssignment) return -1;
    if (secondAssignment) return 1;
    return first.name.localeCompare(second.name);
  });
}

function Avatar({ member }: { member: TeamMember }) {
  if (member.photoUrl) {
    return <img src={member.photoUrl} alt={member.name} className="h-full w-full object-cover" />;
  }

  return (
    <span className="flex h-full w-full items-center justify-center bg-primary/[0.08] font-[family-name:var(--font-display)] text-lg font-semibold text-primary">
      {initialsFromName(member.name)}
    </span>
  );
}

function MemberCard({
  member,
  reportsTo,
  directReports,
}: {
  member: TeamMember;
  reportsTo?: TeamMember;
  directReports: number;
}) {
  return (
    <article className="min-w-0 rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition hover:border-primary/25 hover:shadow-md">
      <div className="flex min-w-0 gap-3">
        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-slate-100">
          <Avatar member={member} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="truncate text-base font-semibold text-slate-950">{member.name}</h3>
              <p className="mt-1 line-clamp-2 text-sm font-semibold capitalize leading-5 text-primary">
                {member.role}
              </p>
            </div>
            {member.assignment?.is_primary ? (
              <span className="shrink-0 rounded-full bg-primary/[0.08] px-2 py-1 text-[0.68rem] font-bold uppercase tracking-[0.08em] text-primary">
                Primary
              </span>
            ) : null}
          </div>

          <div className="mt-3 grid gap-1.5 text-xs font-medium text-slate-600">
            {member.email ? (
              <a href={`mailto:${member.email}`} className="flex min-w-0 items-center gap-1.5 hover:text-primary">
                <Mail aria-hidden className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{member.email}</span>
              </a>
            ) : null}
            {member.phone ? (
              <a href={`tel:${member.phone}`} className="flex min-w-0 items-center gap-1.5 hover:text-primary">
                <Phone aria-hidden className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{member.phone}</span>
              </a>
            ) : null}
            {member.office ? (
              <span className="flex min-w-0 items-center gap-1.5">
                <MapPin aria-hidden className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{member.office}</span>
              </span>
            ) : null}
          </div>

          <div className="mt-3 flex min-w-0 flex-wrap gap-1.5 border-t border-slate-100 pt-3 text-xs font-bold">
            {member.assignment?.is_acting ? (
              <span className="rounded-full bg-orange-50 px-2 py-1 text-orange-700">
                Acting
              </span>
            ) : null}
            {reportsTo ? (
              <span className="max-w-full truncate rounded-full bg-slate-100 px-2 py-1 text-slate-700">
                Reports to {reportsTo.name}
              </span>
            ) : null}
            {directReports ? (
              <span className="rounded-full bg-slate-100 px-2 py-1 text-slate-700">
                {directReports} report{directReports === 1 ? "" : "s"}
              </span>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  );
}

function memberHierarchyLevel(member: TeamMember) {
  const raw = member.assignment?.hierarchy_level;
  if (raw === null || raw === undefined) return null;
  const level = Number(raw);
  return Number.isFinite(level) ? level : null;
}

function hierarchyLabel(level: number | null) {
  if (level === null) return "Staff profiles";
  return hierarchyLabels[level] ?? `Level ${level}`;
}

function groupMembersByHierarchy(members: TeamMember[]): HierarchyGroup[] {
  const groups = new Map<number | null, TeamMember[]>();

  for (const member of members) {
    const level = memberHierarchyLevel(member);
    groups.set(level, [...(groups.get(level) ?? []), member]);
  }

  return Array.from(groups.entries())
    .sort(([first], [second]) => (first ?? 999) - (second ?? 999))
    .map(([level, levelMembers]) => ({
      level,
      label: hierarchyLabel(level),
      members: levelMembers,
    }));
}

export function DepartmentTeamDirectory({ data }: { data: DepartmentDetailData }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<TeamFilter>("all");
  const members = useMemo(() => buildMembers(data), [data]);
  const visibleMembers = useMemo(() => {
    const term = query.trim().toLowerCase();
    return members.filter((member) => {
      const matchesFilter = filter === "all" || member.category === filter;
      const matchesQuery =
        !term ||
        [member.name, member.role, member.email, member.office]
          .filter(Boolean)
          .some((value) => value!.toLowerCase().includes(term));
      return matchesFilter && matchesQuery;
    });
  }, [filter, members, query]);
  const groups = useMemo(() => groupMembersByHierarchy(visibleMembers), [visibleMembers]);
  const assignmentMemberById = useMemo(() => {
    const byId = new Map<string, TeamMember>();

    for (const member of members) {
      if (member.assignment?.id) byId.set(member.assignment.id, member);
    }

    return byId;
  }, [members]);
  const directReportCounts = useMemo(() => {
    const counts = new Map<string, number>();

    for (const member of members) {
      const reportsToId = member.assignment?.reports_to_id;
      if (!reportsToId) continue;
      counts.set(reportsToId, (counts.get(reportsToId) ?? 0) + 1);
    }

    return counts;
  }, [members]);
  const assignmentCount = members.filter((member) => member.assignment).length;

  if (!members.length) {
    return (
      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold text-slate-950">No published ICT team records are available yet.</p>
      </section>
    );
  }

  return (
    <section id="ict-team-directory" className="rounded-[1.25rem] border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 border-b border-slate-100 pb-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-[0.08em] text-primary">Team Structure</p>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
            Staff are grouped by assignment hierarchy, with reporting lines shown where they are part of the public record.
          </p>
        </div>
        <div className="inline-flex w-fit items-center gap-2 rounded-xl bg-primary/[0.08] px-3 py-2 text-xs font-bold text-primary">
          <Network aria-hidden className="h-4 w-4" />
          {assignmentCount} active assignment{assignmentCount === 1 ? "" : "s"}
        </div>
      </div>

      <div className="mt-4 grid gap-2 lg:grid-cols-[minmax(220px,1fr)_auto]">
        <label className="relative block">
          <Search aria-hidden className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by name, role, email, or office"
            className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none ring-primary/20 transition placeholder:text-slate-400 focus:border-primary focus:ring-4"
          />
        </label>
        <div className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 p-1">
          <SlidersHorizontal aria-hidden className="ml-2 h-4 w-4 text-slate-500" />
          <select
            value={filter}
            onChange={(event) => setFilter(event.target.value as TeamFilter)}
            className="h-8 rounded-md bg-transparent px-2 text-sm font-semibold text-slate-700 outline-none"
          >
            {filters.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {groups.length ? (
        <ol className="mt-4 space-y-4">
          {groups.map((group, groupIndex) => (
            <li
              key={group.level ?? "unassigned"}
              className="relative grid gap-3 lg:grid-cols-[8.5rem_minmax(0,1fr)]"
            >
              {groupIndex > 0 ? (
                <span
                  aria-hidden
                  className="absolute -top-4 left-5 hidden h-4 border-l border-slate-200 lg:block"
                />
              ) : null}
              <div className="flex items-start gap-2 lg:block">
                <span className="flex h-10 min-w-10 shrink-0 items-center justify-center rounded-xl bg-primary px-2 text-sm font-bold text-white">
                  {group.level === null ? "Staff" : group.level}
                </span>
                <div className="min-w-0 lg:mt-2">
                  <p className="text-xs font-bold uppercase tracking-[0.08em] text-slate-500">
                    {group.level === null ? "Unassigned" : `Level ${group.level}`}
                  </p>
                  <p className="mt-1 text-sm font-bold text-slate-950">{group.label}</p>
                  <p className="mt-0.5 text-xs font-semibold text-slate-500">
                    {group.members.length} profile{group.members.length === 1 ? "" : "s"}
                  </p>
                </div>
              </div>
              <div className="grid min-w-0 gap-3 md:grid-cols-2 2xl:grid-cols-3">
                {group.members.map((member) => (
                  <MemberCard
                    key={member.id}
                    member={member}
                    reportsTo={
                      member.assignment?.reports_to_id
                        ? assignmentMemberById.get(member.assignment.reports_to_id)
                        : undefined
                    }
                    directReports={
                      member.assignment?.id
                        ? directReportCounts.get(member.assignment.id) ?? 0
                        : 0
                    }
                  />
                ))}
              </div>
            </li>
          ))}
        </ol>
      ) : (
        <p className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
          No team members match the current search and filter.
        </p>
      )}
    </section>
  );
}
