"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowDown, ArrowUp, Save } from "lucide-react";
import { toast } from "@ksu/ui";
import { Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@ksu/ui/components";
import { governanceAdminApi, type CouncilMember, type CouncilOrderNode } from "@/lib/api/organization";

type DisplayGroup = CouncilOrderNode["display_group"];

const groupLabels: Record<DisplayGroup, string> = {
  chairperson: "Chairperson",
  member: "Council Members",
  secretary: "Secretary to Council",
};

const groupOrder: DisplayGroup[] = ["chairperson", "member", "secretary"];

function getMemberName(member?: CouncilMember) {
  return member?.person?.display_name ?? member?.person?.full_name ?? "Council member";
}

function getMemberRole(member?: CouncilMember) {
  return member?.public_role_label || member?.governance_role?.public_label || member?.role || "Council role";
}

function normalizeOrder(nodes: CouncilOrderNode[]) {
  return nodes.map((node, index) => ({
    ...node,
    display_order: index + 1,
    hierarchy_level: node.hierarchy_level || (node.display_group === "chairperson" ? 1 : node.display_group === "secretary" ? 3 : 2),
  }));
}

export function CouncilOrderManager() {
  const queryClient = useQueryClient();
  const [nodes, setNodes] = useState<CouncilOrderNode[]>([]);
  const [dragging, setDragging] = useState<{ group: DisplayGroup; assignmentId: string } | null>(null);

  const orderQuery = useQuery({
    queryKey: ["governance", "university-council", "order"],
    queryFn: () => governanceAdminApi.getCouncilOrder(),
  });
  const membersQuery = useQuery({
    queryKey: ["governance", "university-council", "members"],
    queryFn: () => governanceAdminApi.listCouncilMembers({ page: 1, per_page: 100 }),
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
    mutationFn: () => governanceAdminApi.updateCouncilOrder({ nodes: normalizeOrder(nodes) }),
    onSuccess: async () => {
      toast.success("Council order saved");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["governance", "university-council", "order"] }),
        queryClient.invalidateQueries({ queryKey: ["governance", "university-council", "preview"] }),
      ]);
    },
    onError: () => toast.error("Unable to save Council order"),
  });

  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <CardTitle>Official Display Order</CardTitle>
          <CardDescription>
            Arrange the Chairperson, Council Members, and Secretary to Council exactly as the public page should render them.
          </CardDescription>
        </div>
        <Button type="button" onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending || !nodes.length}>
          <Save className="size-4" />
          {saveMutation.isPending ? "Saving..." : "Save Order"}
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {orderQuery.isLoading || membersQuery.isLoading ? (
          <StateMessage label="Loading Council order..." />
        ) : null}
        {orderQuery.isError || membersQuery.isError ? (
          <StateMessage label="Council order could not be loaded. Check your connection and try again." tone="error" />
        ) : null}
        <div className="grid gap-4 xl:grid-cols-3">
        {groupOrder.map((group) => (
          <section key={group} className="rounded-lg border">
            <div className="border-b p-4">
              <h3 className="font-semibold">{groupLabels[group]}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{grouped[group].length} ordered records</p>
            </div>
            <div className="space-y-3 p-3">
              {grouped[group].map((node, index) => {
                const member = membersByAssignment.get(node.assignment_id);
                return (
                  <div
                    key={node.assignment_id}
                    className="rounded-md border bg-background p-3"
                    draggable
                    onDragStart={() => setDragging({ group, assignmentId: node.assignment_id })}
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={(event) => {
                      event.preventDefault();
                      if (!dragging || dragging.group !== group) return;
                      moveToIndex(group, dragging.assignmentId, index);
                      setDragging(null);
                    }}
                    onDragEnd={() => setDragging(null)}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium">{getMemberName(member)}</p>
                        <p className="text-sm text-muted-foreground">{getMemberRole(member)}</p>
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
