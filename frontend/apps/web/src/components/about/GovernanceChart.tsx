"use client";

import { useMemo, useState } from "react";
import { hierarchy } from "d3-hierarchy";
import type { HierarchyNode } from "d3-hierarchy";
import { Network } from "lucide-react";
import type { BoardMember } from "@/components/about/BoardMemberGrid";

type GovernanceChartProps = {
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

const NODE_WIDTH = 250;
const NODE_HEIGHT = 150;
const MIN_CHART_WIDTH = 1120;
const ROOT_Y = 0;
const GROUP_Y = 240;
const CHILD_Y = 492;
const SIBLING_GAP = 36;
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
  return Boolean(first && second && normalize(first.name) === normalize(second.name));
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
  return selected.map((part) => part[0]).join("").toUpperCase();
}

function nodeId(prefix: string, member: BoardMember, index: number) {
  return `${prefix}-${member.name}-${member.role}-${index}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function personNode(prefix: string, member: BoardMember, index: number): OrgNode {
  return {
    id: nodeId(prefix, member, index),
    title: member.name,
    role: member.role,
    description: member.note,
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
  const viceChancellor =
    managementRoles.find(
      (member) =>
        roleIncludes(member, ["vice chancellor"]) &&
        !roleIncludes(member, ["deputy", "dvc"]),
    ) ?? councilSecretary;
  const rootPerson =
    viceChancellor ??
    ({
      name: "Office of the Vice Chancellor",
      role: "Vice Chancellor",
    } satisfies BoardMember);
  const councilPeople = publicCouncilMembers.filter(
    (member) => !samePerson(member, rootPerson),
  );
  const managementPeople = managementRoles.filter(
    (member) => !samePerson(member, rootPerson),
  );
  const senateFunctions = [
    "Curriculum and educational standards",
    "Research direction and examinations",
    "School-level academic leadership",
  ];

  return {
    id: "vice-chancellor",
    title: rootPerson.name,
    role: roleIncludes(rootPerson, ["vice chancellor"])
      ? rootPerson.role
      : "Vice Chancellor",
    description:
      "Executive lead connecting Council oversight, academic authority, and institutional implementation.",
    photoUrl: rootPerson.photoUrl,
    kind: "root",
    children: [
      {
        id: "university-council",
        title: "University Council",
        role: "Council",
        description:
          councilDescription ||
          "Policy oversight, fiduciary stewardship, and institutional accountability.",
        kind: "group",
        childCount: councilPeople.length,
        children: councilPeople.map((member, index) =>
          personNode("council", member, index),
        ),
      },
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
    ],
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

function toVisibleTree(node: OrgNode, expandedGroups: Set<string>): OrgNode {
  if (!node.children?.length) return node;

  if (node.kind === "group" && !expandedGroups.has(node.id)) {
    return {
      ...node,
      children: [],
    };
  }

  return {
    ...node,
    children: node.children.map((child) => toVisibleTree(child, expandedGroups)),
  };
}

function NodeCard({
  node,
  expanded,
  onToggle,
}: {
  node: PositionedNode;
  expanded: boolean;
  onToggle: (id: string) => void;
}) {
  const data = node.data;
  const isRoot = data.kind === "root";
  const isPerson = data.kind === "person" || isRoot;
  const isFunction = data.kind === "function";
  const canExpand = data.kind === "group" && Boolean(data.childCount);

  return (
    <foreignObject
      x={node.x}
      y={node.y}
      width={NODE_WIDTH}
      height={NODE_HEIGHT}
    >
      <div
        className={`flex h-full w-full overflow-hidden rounded-[1rem] border p-3 shadow-sm ${
          isRoot
            ? "border-primary/25 bg-white"
            : isFunction
              ? "border-slate-200 bg-slate-50"
              : "border-slate-200 bg-white"
        }`}
      >
        {isPerson ? (
          <div className="mr-3 h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-[linear-gradient(135deg,#dbeafe,#eef4ff_56%,#fff7ed)] text-primary ring-1 ring-primary/10">
            {data.photoUrl ? (
              <img
                src={data.photoUrl}
                alt={data.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="flex h-full w-full items-center justify-center font-[family-name:var(--font-display)] text-lg font-semibold">
                {initials(data.title)}
              </span>
            )}
          </div>
        ) : null}

        <div className="min-w-0 flex-1">
          <p
            className={`text-[0.65rem] font-bold uppercase tracking-[0.12em] ${
              isRoot ? "text-secondary" : "text-primary"
            }`}
          >
            {data.role}
          </p>
          <h3
            className={`mt-1 line-clamp-2 font-semibold leading-tight ${
              isRoot ? "text-base text-slate-950" : "text-sm text-slate-950"
            }`}
          >
            {data.title}
          </h3>
          {data.description ? (
            <p
              className={`mt-2 text-xs leading-5 text-slate-500 ${
                canExpand ? "line-clamp-2" : "line-clamp-3"
              }`}
            >
              {data.description}
            </p>
          ) : null}
          {canExpand ? (
            <button
              type="button"
              onClick={() => onToggle(data.id)}
              className="mt-2 inline-flex items-center rounded-full bg-primary/[0.08] px-2.5 py-1 text-[0.68rem] font-bold uppercase tracking-[0.08em] text-primary transition hover:bg-primary hover:text-white"
            >
              {expanded ? "Collapse" : `Show ${data.childCount}`}
            </button>
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
  const chartWidth = Math.max(MIN_CHART_WIDTH, contentWidth);
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
  const groupIds = useMemo(
    () => fullTree.children?.map((child) => child.id) ?? [],
    [fullTree],
  );
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
    () => new Set(),
  );
  const visibleTree = useMemo(
    () => toVisibleTree(fullTree, expandedGroups),
    [expandedGroups, fullTree],
  );
  const root = hierarchy(visibleTree);
  const { positionedNodes, links, chartWidth } = layoutNodes(root);
  const height =
    Math.max(...positionedNodes.map((node) => node.y)) + NODE_HEIGHT + 32;
  const expandedCount = expandedGroups.size;

  function toggleGroup(id: string) {
    setExpandedGroups((current) => {
      const next = new Set(current);

      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }

      return next;
    });
  }

  return (
    <div className="w-full">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase text-secondary">
            Org Chart
          </p>
          <h2 className="mt-3 font-[family-name:var(--font-display)] text-4xl font-semibold leading-tight text-slate-950">
            Vice Chancellor, governance bodies, and named members
          </h2>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setExpandedGroups(new Set(groupIds))}
            className="inline-flex items-center gap-2 rounded-xl bg-primary/[0.08] px-3 py-2 text-xs font-bold uppercase tracking-[0.08em] text-primary transition hover:bg-primary hover:text-white"
          >
            <Network aria-hidden className="h-4 w-4" />
            Expand all
          </button>
          <button
            type="button"
            onClick={() => setExpandedGroups(new Set())}
            className="inline-flex items-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold uppercase tracking-[0.08em] text-slate-600 transition hover:border-primary/30 hover:text-primary"
          >
            Collapse all
          </button>
        </div>
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-600">
        Starts minimized with the Vice Chancellor at the top. Expand branches to
        inspect named Council, Senate, and Management records.
        {expandedCount ? ` ${expandedCount} branch${expandedCount === 1 ? "" : "es"} expanded.` : ""}
      </p>

      <div className="mt-6 overflow-x-auto">
        <svg
          role="img"
          aria-label="Kisii University governance org chart"
          width={chartWidth}
          height={height}
          viewBox={`0 0 ${chartWidth} ${height}`}
          className="mx-auto block max-w-none"
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
              expanded={expandedGroups.has(node.data.id)}
              onToggle={toggleGroup}
            />
          ))}
        </svg>
      </div>
    </div>
  );
}
