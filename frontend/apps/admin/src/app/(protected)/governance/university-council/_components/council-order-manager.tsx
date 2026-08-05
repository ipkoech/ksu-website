"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowDown, ArrowUp, GripVertical, Save } from "lucide-react";
import { toast } from "@ksu/ui";
import { Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@ksu/ui/components";
import { councilGovernanceProfile, type CouncilMember, type CouncilOrderNode, type GovernanceWorkspaceProfile } from "@/lib/api/organization";

type DisplayGroup = CouncilOrderNode["display_group"];

const groupOrder: DisplayGroup[] = ["chairperson", "member", "secretary"];

function getMemberName(member: CouncilMember | undefined, profile: GovernanceWorkspaceProfile) {
  return member?.person?.display_name ?? member?.person?.full_name ?? profile.memberFallbackName;
}

function getMemberRole(member: CouncilMember | undefined, profile: GovernanceWorkspaceProfile) {
  return member?.public_role_label || member?.governance_role?.public_label || member?.role || profile.roleFallbackLabel;
}

function normalizeOrder(nodes: CouncilOrderNode[]) {
  return nodes.map((node, index) => ({
    ...node,
    display_order: index + 1,
    hierarchy_level: node.hierarchy_level || (node.display_group === "chairperson" ? 1 : node.display_group === "secretary" ? 3 : 2),
  }));
}

export function CouncilOrderManager({ profile = councilGovernanceProfile }: { profile?: GovernanceWorkspaceProfile }) {
  const queryClient = useQueryClient();
  const [nodes, setNodes] = useState<CouncilOrderNode[]>([]);
  const [dragging, setDragging] = useState<{ group: DisplayGroup; assignmentId: string } | null>(null);
  const [dropTarget, setDropTarget] = useState<string | null>(null);

  const orderQuery = useQuery({
    queryKey: ["governance", profile.key, "order"],
    queryFn: () => profile.api.getOrder(),
  });
  const membersQuery = useQuery({
    queryKey: ["governance", profile.key, "members"],
    queryFn: () => profile.api.listMembers({ page: 1, per_page: 100 }),
  });

  useEffect(() => {
    if (orderQuery.data?.data) setNodes(normalizeOrder(orderQuery.data.data));
  }, [orderQuery.data?.data]);

  const membersByAssignment = useMemo(() => {
    const map = new Map<string, CouncilMember>();
    for (const member of (membersQuery.data?.data ?? []) as CouncilMember[]) {
      map.set(member.id, member);
    }
    return map;
  }, [membersQuery.data?.data]);

  const grouped = useMemo(() => {
    return groupOrder.reduce<Record<DisplayGroup, CouncilOrderNode[]>>(
      (acc, group) => {
        acc[group] = nodes
          .filter((node) => node.display_group === group)
          .sort((a, b) => a.display_order - b.display_order);
        return acc;
      },
      { chairperson: [], member: [], secretary: [] },
    );
  }, [nodes]);

  const move = (group: DisplayGroup, assignmentId: string, direction: -1 | 1) => {
    const groupNodes = grouped[group];
    const index = groupNodes.findIndex((node) => node.assignment_id === assignmentId);
    const nextIndex = index + direction;
    if (index < 0 || nextIndex < 0 || nextIndex >= groupNodes.length) return;

    const reordered = [...groupNodes];
    const [item] = reordered.splice(index, 1);
    reordered.splice(nextIndex, 0, item);

    setNodes((current) => {
      const otherGroups = current.filter((node) => node.display_group !== group);
      const updatedGroup = reordered.map((node, orderIndex) => ({
        ...node,
        display_order: orderIndex + 1,
      }));
      return normalizeOrder([...otherGroups, ...updatedGroup]);
    });
  };

  const moveToIndex = (group: DisplayGroup, assignmentId: string, nextIndex: number) => {
    const groupNodes = grouped[group];
    const index = groupNodes.findIndex((node) => node.assignment_id === assignmentId);
    if (index < 0 || nextIndex < 0 || nextIndex >= groupNodes.length || index === nextIndex) return;

    const reordered = [...groupNodes];
    const [item] = reordered.splice(index, 1);
    reordered.splice(nextIndex, 0, item);

    setNodes((current) => {
      const otherGroups = current.filter((node) => node.display_group !== group);
      const updatedGroup = reordered.map((node, orderIndex) => ({
        ...node,
        display_order: orderIndex + 1,
      }));
      return normalizeOrder([...otherGroups, ...updatedGroup]);
    });
  };

  const saveMutation = useMutation({
    mutationFn: () => profile.api.updateOrder({ nodes: normalizeOrder(nodes) }),
    onSuccess: async () => {
      toast.success(`${profile.badgeLabel} order saved`);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["governance", profile.key, "order"] }),
        queryClient.invalidateQueries({ queryKey: ["governance", profile.key, "preview"] }),
      ]);
    },
    onError: () => toast.error(`Unable to save ${profile.badgeLabel} order`),
  });

  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <CardTitle>Official Display Order</CardTitle>
          <CardDescription>
            Arrange the {profile.groupLabels.chairperson}, {profile.groupLabels.member}, and {profile.groupLabels.secretary} exactly as the public page should render them.
          </CardDescription>
        </div>
        <Button type="button" onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending || !nodes.length}>
          <Save className="size-4" />
          {saveMutation.isPending ? "Saving..." : "Save Order"}
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {orderQuery.isLoading || membersQuery.isLoading ? (
          <StateMessage label={`Loading ${profile.badgeLabel} order...`} />
        ) : null}
        {orderQuery.isError || membersQuery.isError ? (
          <StateMessage label={`${profile.badgeLabel} order could not be loaded. Check your connection and try again.`} tone="error" />
        ) : null}
        <div className="grid gap-4 xl:grid-cols-3">
        {groupOrder.map((group) => (
          <section key={group} className="rounded-lg border">
            <div className="border-b p-4">
              <h3 className="font-semibold">{profile.groupLabels[group]}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{grouped[group].length} ordered records</p>
            </div>
            <div className="space-y-3 p-3">
              {grouped[group].map((node, index) => {
                const member = membersByAssignment.get(node.assignment_id);
                return (
                  <div
                    key={node.assignment_id}
                    className={`rounded-md border bg-background p-3 transition ${
                      dropTarget === node.assignment_id ? "border-primary bg-primary/5 ring-2 ring-primary/30" : ""
                    } ${dragging?.assignmentId === node.assignment_id ? "opacity-60" : ""}`}
                    draggable
                    aria-grabbed={dragging?.assignmentId === node.assignment_id}
                    onDragStart={(event) => {
                      event.dataTransfer.effectAllowed = "move";
                      event.dataTransfer.setData("text/plain", node.assignment_id);
                      setDragging({ group, assignmentId: node.assignment_id });
                    }}
                    onDragEnter={(event) => {
                      event.preventDefault();
                      if (dragging?.group === group) setDropTarget(node.assignment_id);
                    }}
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={(event) => {
                      event.preventDefault();
                      if (!dragging || dragging.group !== group) return;
                      moveToIndex(group, dragging.assignmentId, index);
                      setDragging(null);
                      setDropTarget(null);
                    }}
                    onDragLeave={() => {
                      if (dropTarget === node.assignment_id) setDropTarget(null);
                    }}
                    onDragEnd={() => {
                      setDragging(null);
                      setDropTarget(null);
                    }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-start gap-3">
                        <span
                          className="mt-0.5 inline-flex size-8 shrink-0 cursor-grab items-center justify-center rounded-md border bg-muted/40 text-muted-foreground active:cursor-grabbing"
                          aria-label={`Drag to reorder ${getMemberName(member, profile)}`}
                          title="Drag to reorder"
                        >
                          <GripVertical className="size-4" />
                        </span>
                        <div className="min-w-0">
                          <p className="truncate font-medium">{getMemberName(member, profile)}</p>
                          <p className="text-sm text-muted-foreground">{getMemberRole(member, profile)}</p>
                        </div>
                      </div>
                      <Badge variant="outline">{member?.workflow_status ?? "ordered"}</Badge>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={index === 0}
                        onClick={() => move(group, node.assignment_id, -1)}
                      >
                        <ArrowUp className="size-4" />
                        Move up
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={index === grouped[group].length - 1}
                        onClick={() => move(group, node.assignment_id, 1)}
                      >
                        <ArrowDown className="size-4" />
                        Move down
                      </Button>
                    </div>
                  </div>
                );
              })}
              {!grouped[group].length && !orderQuery.isLoading && !membersQuery.isLoading && !orderQuery.isError && !membersQuery.isError ? (
                <p className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
                  No records assigned to this group yet.
                </p>
              ) : null}
            </div>
          </section>
        ))}
        </div>
      </CardContent>
    </Card>
  );
}

function StateMessage({ label, tone = "neutral" }: { label: string; tone?: "neutral" | "error" }) {
  return (
    <p className={`rounded-md border p-4 text-sm ${tone === "error" ? "border-destructive/30 bg-destructive/5 text-destructive" : "bg-muted/20 text-muted-foreground"}`}>
      {label}
    </p>
  );
}
