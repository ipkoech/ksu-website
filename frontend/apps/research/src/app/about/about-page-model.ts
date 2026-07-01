export type AboutRecord = {
  id?: string | number | null;
  title?: string | null;
  name?: string | null;
  display_name?: string | null;
  slug?: string | null;
  summary?: string | null;
  description?: string | null;
  about?: string | null;
  mandate?: string | null;
  objectives?: string | null;
  category?: string | null;
  service_type?: string | null;
  center_type?: string | null;
  program_type?: string | null;
  partner_type?: string | null;
  guideline_type?: string | null;
  status?: string | null;
  is_featured?: boolean | null;
};

export type AboutPerson = {
  id?: string | number | null;
  full_name?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  title?: string | null;
  academic_rank?: string | null;
  institutional_role?: string | null;
  is_featured?: boolean | null;
};

export type AboutTeamPerson = {
  id: string;
  slug?: string | null;
  title?: string | null;
  full_name?: string | null;
  email?: string | null;
  photo_url?: string | null;
  academic_rank?: string | null;
  institutional_role?: string | null;
  office_location?: string | null;
  specialization?: string | null;
  research_interests?: string[] | null;
};

export type AboutTeamAssignment = {
  id: string;
  person_id: string;
  role?: string | null;
  role_label?: string | null;
  role_display?: string | null;
  group?: string | null;
  title?: string | null;
  hierarchy_level?: number | null;
  reports_to_id?: string | null;
  display_order?: number | null;
  is_acting?: boolean | null;
};

export type AboutTeamGroup = {
  key: string;
  label: string;
  count: number;
  assignment_ids: string[];
};

export type AboutTeamHierarchy = {
  level: number;
  label: string;
  assignment_ids: string[];
};

export type AboutTeamResponse = {
  assignments?: AboutTeamAssignment[];
  persons?: Record<string, AboutTeamPerson>;
  groups?: AboutTeamGroup[];
  hierarchy?: AboutTeamHierarchy[];
  counts?: {
    assignments?: number;
    persons?: number;
    leadership?: number;
  };
};

export type AboutTeamMember = AboutTeamPerson & {
  assignmentId: string;
  assignmentTitle: string;
  roleLabel: string;
  groupKey: string;
  groupLabel: string;
  hierarchyLevel: number;
  displayOrder: number;
  reportsToId?: string | null;
  isActing: boolean;
};

export type AboutCollection<T = AboutRecord> = {
  data: T[];
  total?: number;
};

export type PublicStat = {
  key: string;
  label: string;
  value: number;
  suffix?: string;
  description?: string;
};

export type PublicStats = {
  stats?: PublicStat[];
};

export type AboutMetricTile = {
  label: string;
  value: number;
  suffix?: string;
  description: string;
};

export type AboutSupportAreaCard = {
  title: string;
  body: string;
  count: number;
  href: string;
  recordTitle: string;
  recordSummary: string;
  recordHref: string;
};

export function getLeadResearchPerson<T extends AboutPerson>(people: T[]) {
  return (
    people.find((person) =>
      compactText(person.institutional_role).toLowerCase().includes("research"),
    ) ??
    people.find((person) => person.is_featured) ??
    people[0] ??
    null
  );
}

export function buildTeamMembers(team?: AboutTeamResponse | null): AboutTeamMember[] {
  const people = team?.persons ?? {};
  const groupLabels = new Map(
    (team?.groups ?? []).map((group) => [group.key, group.label]),
  );

  return [...(team?.assignments ?? [])]
    .map((assignment) => {
      const person = people[String(assignment.person_id)];
      if (!person) return null;
      const groupKey = compactText(assignment.group) || "other";
      const roleLabel =
        compactText(assignment.role_display) ||
        compactText(assignment.role_label) ||
        formatRole(assignment.role) ||
        compactText(person.institutional_role) ||
        "Research Staff";
      const assignmentTitle =
        compactText(assignment.title) ||
        compactText(person.institutional_role) ||
        roleLabel;

      const member: AboutTeamMember = {
        ...person,
        assignmentId: String(assignment.id),
        assignmentTitle,
        roleLabel,
        groupKey,
        groupLabel: groupLabels.get(groupKey) ?? formatRole(groupKey) ?? "Team",
        hierarchyLevel: Number(assignment.hierarchy_level ?? 99),
        displayOrder: Number(assignment.display_order ?? 999),
        reportsToId: assignment.reports_to_id,
        isActing: Boolean(assignment.is_acting),
      };
      return member;
    })
    .filter((member): member is AboutTeamMember => member !== null)
    .sort((a, b) => {
      if (a.hierarchyLevel !== b.hierarchyLevel) {
        return a.hierarchyLevel - b.hierarchyLevel;
      }
      if (a.displayOrder !== b.displayOrder) {
        return a.displayOrder - b.displayOrder;
      }
      return compactText(a.full_name).localeCompare(compactText(b.full_name));
    });
}

export function getLeadTeamMember(members: AboutTeamMember[]) {
  return (
    members.find((member) => member.groupKey === "leadership") ??
    members.find((member) =>
      compactText(member.assignmentTitle).toLowerCase().includes("director"),
    ) ??
    members[0] ??
    null
  );
}

export function buildAboutMetricTiles({
  staffCount,
  centers,
  programs,
  services,
  partners,
  stats,
}: {
  staffCount: number;
  centers: AboutCollection;
  programs: AboutCollection;
  services: AboutCollection;
  partners: AboutCollection;
  stats?: PublicStats | null;
}): AboutMetricTile[] {
  const preferredStatKeys = [
    "research_projects",
    "publications",
    "research_centres",
    "partner_count",
  ];
  const preferredStats = preferredStatKeys
    .map((key) => stats?.stats?.find((item) => item.key === key))
    .filter((item): item is PublicStat => Boolean(item))
    .map((item) => ({
      label: item.label,
      value: item.value,
      suffix: item.suffix,
      description: item.description || "Published research statistic.",
    }));

  const fallbackMetrics: AboutMetricTile[] = [
    {
      label: "Research staff",
      value: staffCount,
      description: "Published researcher profiles from the university people service.",
    },
    {
      label: "Centers and programs",
      value: collectionCount(centers) + collectionCount(programs),
      description: "Backend-published centers, hubs, and strategic research programmes.",
    },
    {
      label: "Support services",
      value: collectionCount(services),
      description: "Research support services currently published for public discovery.",
    },
    {
      label: "Partners",
      value: collectionCount(partners),
      description: "Published partner and collaboration records.",
    },
  ];

  return [fallbackMetrics[0], ...preferredStats, ...fallbackMetrics.slice(1)].slice(0, 4);
}

export function buildSupportAreaCards({
  services,
  centers,
  programs,
  partners,
  guidelines,
}: {
  services: AboutCollection;
  centers: AboutCollection;
  programs: AboutCollection;
  partners: AboutCollection;
  guidelines: AboutCollection;
}): AboutSupportAreaCard[] {
  const researchService = firstMatching(services.data, ["grant", "ethic", "data", "support"]) ??
    services.data[0] ??
    guidelines.data[0];
  const extension = firstMatching(centers.data, ["extension", "community", "farm", "outreach"]) ??
    centers.data[0];
  const innovation = firstMatching(programs.data, ["innovation", "startup", "ip", "commercial"]) ??
    firstMatching(centers.data, ["innovation", "technology"]) ??
    programs.data[0];
  const resourceMobilization = firstMatching(partners.data, ["funder", "foundation", "donor", "partner"]) ??
    partners.data[0] ??
    firstMatching(services.data, ["grant", "fund"]);

  return [
    {
      title: "Research Support",
      body: "Administrative and technical support for proposals, ethics, compliance, data, publication, and reporting workflows.",
      count: collectionCount(services) + collectionCount(guidelines),
      href: "/services",
      ...recordPreview(researchService, "/services"),
    },
    {
      title: "Extension",
      body: "Public and community-facing pathways that connect research knowledge to field work, outreach, farms, and local impact.",
      count: collectionCount(centers),
      href: "/community-impact",
      ...recordPreview(extension, "/centers"),
    },
    {
      title: "Innovation",
      body: "Programmes and centers that help ideas move toward IP, prototypes, incubation, enterprise, and commercialization.",
      count: collectionCount(programs),
      href: "/innovations",
      ...recordPreview(innovation, "/programs"),
    },
    {
      title: "Resource Mobilization",
      body: "Partnership and funding pathways that connect university research priorities with funders, donors, and collaborators.",
      count: collectionCount(partners),
      href: "/partners",
      ...recordPreview(resourceMobilization, "/partners"),
    },
  ];
}

export function recordTitle(record?: AboutRecord | null, fallback = "Published record") {
  return (
    compactText(record?.title) ||
    compactText(record?.name) ||
    compactText(record?.display_name) ||
    fallback
  );
}

export function recordSummary(record?: AboutRecord | null) {
  return (
    compactText(record?.summary) ||
    compactText(record?.description) ||
    compactText(record?.about) ||
    compactText(record?.mandate) ||
    compactText(record?.objectives)
  );
}

function recordPreview(record: AboutRecord | undefined, baseHref: string) {
  const slug = compactText(record?.slug);
  return {
    recordTitle: recordTitle(record, "Records publish here when available"),
    recordSummary: recordSummary(record),
    recordHref: slug ? `${baseHref}/${slug}` : baseHref,
  };
}

function collectionCount(collection: AboutCollection) {
  return collection.total ?? collection.data.length;
}

function firstMatching(records: AboutRecord[], terms: string[]) {
  return records.find((record) => {
    const haystack = [
      record.title,
      record.name,
      record.summary,
      record.description,
      record.about,
      record.category,
      record.service_type,
      record.center_type,
      record.program_type,
      record.partner_type,
      record.guideline_type,
    ]
      .map(compactText)
      .join(" ")
      .toLowerCase();
    return terms.some((term) => haystack.includes(term));
  });
}

function compactText(value?: string | number | null) {
  if (value === null || value === undefined) return "";
  return String(value).replace(/\s+/g, " ").trim();
}

function formatRole(value?: string | number | null) {
  const text = compactText(value);
  if (!text) return "";
  return text
    .split(/[_\s-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
