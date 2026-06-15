"use client";

import { useMemo } from "react";
import { hierarchy } from "d3-hierarchy";
import type { HierarchyNode } from "d3-hierarchy";
import type { BoardMember } from "@/components/about/BoardMemberGrid";
import { PublicImage } from "@/components/public/public-image";

type GovernanceChartProps = {
  councilOnly?: boolean;
  managementOnly?: boolean;
  title?: string;
  description?: string;
  ariaLabel?: string;
  councilDescription?: string | null;
  senateDescription?: string | null;
  managementDescription?: string | null;
  councilMembers?: BoardMember[];
  senateMembers?: BoardMember[];
  managementMembers?: BoardMember[];
};

type OrgNode = {
  id: string;
  title: string;
  role: string;
  description?: string;
  photoUrl?: string | null;
  kind: "root" | "group" | "person" | "function";
  childCount?: number;
  children?: OrgNode[];
};

const NODE_WIDTH = 190;
const NODE_HEIGHT = 230;
const MIN_CHART_WIDTH = 1120;
const ROOT_Y = 0;
const GROUP_Y = 282;
const CHILD_Y = 584;
const SIBLING_GAP = 28;
const GROUP_GAP = 72;

type PositionedNode = {
  data: OrgNode;
  x: number;
  y: number;
  parent?: PositionedNode;
};

function normalize(value?: string | null) {
  return (value ?? "").trim().toLowerCase();
}

function isPlaceholderMember(member: BoardMember) {
  return normalize(member.name).startsWith("published via");
}

function roleIncludes(member: BoardMember, terms: string[]) {
  const role = normalize(member.role);
  return terms.some((term) => role.includes(term));
}

function samePerson(first?: BoardMember, second?: BoardMember) {
  return Boolean(
    first && second && normalize(first.name) === normalize(second.name),
  );
}

function initials(name: string) {
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

  if (!parts.length) return "K";

  const selected = parts.length === 1 ? [parts[0]] : [parts[0], parts.at(-1)!];
  return selected
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function nodeId(prefix: string, member: BoardMember, index: number) {
  return `${prefix}-${member.name}-${member.role}-${index}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function personNode(
  prefix: string,
  member: BoardMember,
  index: number,
): OrgNode {
  return {
    id: nodeId(prefix, member, index),
    title: member.name,
    role: member.role,
    photoUrl: member.photoUrl,
    kind: "person",
  };
}

function functionNode(prefix: string, title: string, index: number): OrgNode {
  return {
    id: `${prefix}-${index}`,
    title,
    role: "Published function",
    kind: "function",
  };
}

function buildTree({
  councilOnly = false,
  managementOnly = false,
  councilDescription,
  senateDescription,
  managementDescription,
  councilMembers = [],
  senateMembers = [],
  managementMembers = [],
}: GovernanceChartProps): OrgNode {
  const publicCouncilMembers = councilMembers.filter(
    (member) => !isPlaceholderMember(member),
  );
  const publicSenateMembers = senateMembers.filter(
    (member) => !isPlaceholderMember(member),
  );
  const managementRoles = managementMembers.filter(
    (member) => !isPlaceholderMember(member),
  );
  const councilSecretary = publicCouncilMembers.find((member) =>
    roleIncludes(member, ["secretary", "vice chancellor"]),
  );
  const chancellor = publicCouncilMembers.find(
    (member) =>
      roleIncludes(member, ["chancellor"]) &&
      !roleIncludes(member, ["vice chancellor"]),
  );
  const viceChancellor =
    managementRoles.find(
      (member) =>
        roleIncludes(member, ["vice chancellor"]) &&
        !roleIncludes(member, ["deputy", "dvc"]),
    ) ?? councilSecretary;
  const rootPerson =
    (councilOnly ? chancellor : viceChancellor) ??
    (!councilOnly ? councilSecretary : undefined) ??
    ({
      name: councilOnly ? "Chancellor" : "Office of the Vice Chancellor",
      role: councilOnly ? "University Council Lead" : "Vice Chancellor",
    } satisfies BoardMember);
  const councilSecretaryNode =
    councilSecretary && !samePerson(councilSecretary, rootPerson)
      ? councilSecretary
      : ({
          name: "Secretary to the University Council",
          role: "Council Secretary",
        } satisfies BoardMember);
  const councilPeople = publicCouncilMembers.filter(
    (member) =>
      !samePerson(member, rootPerson) && !samePerson(member, councilSecretaryNode),
  );
  const managementPeople = managementRoles.filter(
    (member) => !samePerson(member, rootPerson),
  );
  const senateFunctions = [
    "Curriculum and educational standards",
    "Research direction and examinations",
    "School-level academic leadership",
  ];

  if (managementOnly) {
    const deputyPeople = managementPeople.filter((member) =>
      roleIncludes(member, ["deputy", "dvc"]),
    );
    const registrarPeople = managementPeople.filter((member) =>
      roleIncludes(member, ["registrar", "finance"]),
    );
    const otherManagementPeople = managementPeople.filter(
      (member) =>
        !roleIncludes(member, ["deputy", "dvc", "registrar", "finance"]),
    );
    const managementChildren: OrgNode[] = [];

    if (deputyPeople.length) {
      managementChildren.push({
        id: "deputy-vice-chancellors",
        title: "Deputy Vice Chancellors",
        role: "Executive portfolios",
        description: "Academic, research, student affairs, administration, planning, and finance leadership.",
        kind: "group",
        childCount: deputyPeople.length,
        children: deputyPeople.map((member, index) =>
          personNode("deputy", member, index),
        ),
      });
    }

    if (registrarPeople.length) {
      managementChildren.push({
        id: "registrars-and-finance",
        title: "Registrars and Finance",
        role: "Administrative leadership",
        description: "Registrar portfolios and financial stewardship offices.",
        kind: "group",
        childCount: registrarPeople.length,
        children: registrarPeople.map((member, index) =>
          personNode("registrar-finance", member, index),
        ),
      });
    }

    if (otherManagementPeople.length) {
      managementChildren.push({
        id: "management-board",
        title: "Management Board",
        role: "Implementation",
        description:
          managementDescription ||
          "Day-to-day administration and implementation of university policies.",
        kind: "group",
        childCount: otherManagementPeople.length,
        children: otherManagementPeople.map((member, index) =>
          personNode("management", member, index),
        ),
      });
    }

    if (publicSenateMembers.length) {
      managementChildren.push({
        id: "senate",
        title: "Senate",
        role: "Academic authority",
        description:
          senateDescription ||
          "Academic standards, research, examinations, and scholarly direction.",
        kind: "group",
        childCount: publicSenateMembers.length,
        children: publicSenateMembers.map((member, index) =>
          personNode("senate", member, index),
        ),
      });
    }

    return {
      id: "vice-chancellor",
      title: rootPerson.name,
      role: rootPerson.role || "Vice Chancellor",
      description:
        "Executive lead for university management and institutional implementation.",
      photoUrl: rootPerson.photoUrl,
      kind: "root",
      children: managementChildren,
    };
  }

  const councilNode: OrgNode = {
    id: councilOnly ? "council-secretary" : "university-council",
    title: councilOnly ? councilSecretaryNode.name : "University Council",
    role: councilOnly ? councilSecretaryNode.role : "Council",
    description:
      councilOnly
        ? undefined
        : councilDescription ||
          "Policy oversight, fiduciary stewardship, and institutional accountability.",
    photoUrl: councilOnly ? councilSecretaryNode.photoUrl : undefined,
    kind: councilOnly ? "person" : "group",
    childCount: councilPeople.length,
    children: councilPeople.map((member, index) =>
      personNode("council", member, index),
    ),
  };
  const children: OrgNode[] = councilOnly
    ? [councilNode]
    : [
        councilNode,
        {
          id: "senate",
          title: "Senate",
          role: "Academic authority",
          description:
            senateDescription ||
            "Academic standards, research, examinations, and scholarly direction.",
          kind: "group",
          childCount: publicSenateMembers.length || senateFunctions.length,
          children: publicSenateMembers.length
            ? publicSenateMembers.map((member, index) =>
                personNode("senate", member, index),
              )
            : senateFunctions.map((item, index) =>
                functionNode("senate-function", item, index),
              ),
        },
        {
          id: "management-board",
          title: "Management Board",
          role: "Implementation",
          description:
            managementDescription ||
            "Day-to-day administration and implementation of university policies.",
          kind: "group",
          childCount: managementPeople.length,
          children: managementPeople.map((member, index) =>
            personNode("management", member, index),
          ),
        },
      ];

  return {
    id: councilOnly ? "chancellor" : "vice-chancellor",
    title: rootPerson.name,
    role:
      rootPerson.role ||
      (councilOnly ? "Chancellor" : "Vice Chancellor"),
    description: councilOnly
      ? undefined
      : "Executive lead connecting Council oversight, academic authority, and institutional implementation.",
    photoUrl: rootPerson.photoUrl,
    kind: "root",
    children,
  };
}

function linkPath(source: PositionedNode, target: PositionedNode) {
  const sourceX = source.x + NODE_WIDTH / 2;
  const sourceY = source.y + NODE_HEIGHT;
  const targetX = target.x + NODE_WIDTH / 2;
  const targetY = target.y;
  const middleY = sourceY + (targetY - sourceY) / 2;

  return `M ${sourceX} ${sourceY} C ${sourceX} ${middleY}, ${targetX} ${middleY}, ${targetX} ${targetY}`;
}

function NodeCard({
  node,
}: {
  node: PositionedNode;
}) {
  const data = node.data;
  const isRoot = data.kind === "root";
  const isPerson = data.kind === "person" || isRoot;
  const isFunction = data.kind === "function";

  return (
    <foreignObject
      x={node.x}
      y={node.y}
      width={NODE_WIDTH}
      height={NODE_HEIGHT}
    >
      <div
        className={`flex h-full w-full flex-col overflow-hidden rounded-[1rem] border shadow-sm ${
          isRoot
            ? "border-primary/25 bg-white"
            : isFunction
              ? "border-slate-200 bg-slate-50"
              : "border-slate-200 bg-white"
        }`}
      >
        {isPerson ? (
          <div className="flex h-24 w-full shrink-0 items-center justify-center overflow-hidden bg-[linear-gradient(135deg,#dbeafe,#eef4ff_56%,#fff7ed)] text-primary">
            {data.photoUrl ? (
              <PublicImage
                src={data.photoUrl}
                alt={data.title}
                ratio="card"
                sizes="190px"
                className="h-full w-full"
              />
            ) : (
              <span className="font-[family-name:var(--font-display)] text-3xl font-semibold">
                {initials(data.title)}
              </span>
            )}
          </div>
        ) : null}

        <div className="min-w-0 flex-1 p-3">
          <h3
            className={`line-clamp-2 font-semibold leading-tight ${
              isRoot ? "text-base text-slate-950" : "text-sm text-slate-950"
            }`}
          >
            {data.title}
          </h3>
          <p
            className={`mt-2 line-clamp-2 text-[0.64rem] font-bold uppercase tracking-[0.1em] ${
              isRoot ? "text-secondary" : "text-primary"
            }`}
          >
            {data.role}
          </p>
          {data.description ? (
            <p
              className="mt-2 line-clamp-3 text-xs leading-5 text-slate-500"
            >
              {data.description}
            </p>
          ) : null}
        </div>
      </div>
    </foreignObject>
  );
}

function layoutNodes(root: HierarchyNode<OrgNode>) {
  const groups = root.children ?? [];
  const groupWidths = groups.map((group) => {
    const childCount = group.children?.length ?? 0;

    if (!childCount) return NODE_WIDTH;

    return Math.max(
      NODE_WIDTH,
      childCount * NODE_WIDTH + (childCount - 1) * SIBLING_GAP,
    );
  });
  const contentWidth =
    groupWidths.reduce((total, width) => total + width, 0) +
    Math.max(0, groups.length - 1) * GROUP_GAP;
  const minimumWidth = groups.length <= 1 ? 760 : MIN_CHART_WIDTH;
  const chartWidth = Math.max(minimumWidth, contentWidth);
  let cursorX = (chartWidth - contentWidth) / 2;
  const rootNode: PositionedNode = {
    data: root.data,
    x: chartWidth / 2 - NODE_WIDTH / 2,
    y: ROOT_Y,
  };
  const positionedNodes: PositionedNode[] = [rootNode];
  const links: Array<{ source: PositionedNode; target: PositionedNode }> = [];

  groups.forEach((group, groupIndex) => {
    const groupWidth = groupWidths[groupIndex] ?? NODE_WIDTH;
    const groupLeft = cursorX;
    const groupNode: PositionedNode = {
      data: group.data,
      x: groupLeft + groupWidth / 2 - NODE_WIDTH / 2,
      y: GROUP_Y,
      parent: rootNode,
    };

    positionedNodes.push(groupNode);
    links.push({ source: rootNode, target: groupNode });

    group.children?.forEach((child, childIndex) => {
      const childCount = group.children?.length ?? 0;
      const childRowWidth =
        childCount * NODE_WIDTH + Math.max(0, childCount - 1) * SIBLING_GAP;
      const childStartX = groupLeft + (groupWidth - childRowWidth) / 2;
      const childNode: PositionedNode = {
        data: child.data,
        x: childStartX + childIndex * (NODE_WIDTH + SIBLING_GAP),
        y: CHILD_Y,
        parent: groupNode,
      };

      positionedNodes.push(childNode);
      links.push({ source: groupNode, target: childNode });
    });

    cursorX += groupWidth + GROUP_GAP;
  });

  return { positionedNodes, links, chartWidth };
}

export function GovernanceChart(props: GovernanceChartProps) {
  const fullTree = useMemo(() => buildTree(props), [props]);
  const root = hierarchy(fullTree);
  const { positionedNodes, links, chartWidth } = layoutNodes(root);
  const height =
    Math.max(...positionedNodes.map((node) => node.y)) + NODE_HEIGHT + 32;
  const isCouncilOnly = Boolean(props.councilOnly);
  const isManagementOnly = Boolean(props.managementOnly);

  return (
    <div className="w-full">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase text-secondary">
            Org Chart
          </p>
          <h2 className="mt-3 font-[family-name:var(--font-display)] text-4xl font-semibold leading-tight text-slate-950">
            {props.title ??
              (isCouncilOnly
                ? "Chancellor and University Council"
                : isManagementOnly
                  ? "Vice Chancellor and university management"
                  : "Vice Chancellor, governance bodies, and named members")}
          </h2>
        </div>
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-600">
        {props.description ??
          (isCouncilOnly
            ? "The hierarchy starts with the Chancellor, followed by the Council Secretary, then the remaining published Council members."
            : "The hierarchy is shown without interaction so governance relationships remain visible at a glance.")}
      </p>

      <div className="mt-6 overflow-x-auto">
        <svg
          role="img"
          aria-label={props.ariaLabel ?? "Kisii University governance org chart"}
          width={chartWidth}
          height={height}
          viewBox={`0 0 ${chartWidth} ${height}`}
          className="mx-auto block h-auto max-w-full"
        >
          <g fill="none" stroke="#cbd5e1" strokeLinecap="round" strokeWidth="2">
            {links.map((link) => (
              <path
                key={`${link.source.data.id}-${link.target.data.id}`}
                d={linkPath(link.source, link.target)}
              />
            ))}
          </g>
          {positionedNodes.map((node) => (
            <NodeCard
              key={node.data.id}
              node={node}
            />
          ))}
        </svg>
      </div>
    </div>
  );
}
