"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@ksu/ui/button";
import { WorkspaceFeedback } from "@ksu/ui/components/workspace-feedback";
import { useResearchWorkspace } from "./admin-shell";
import { ResourceList } from "./resource-list";

export function ReviewQueue() {
  const { context, modules } = useResearchWorkspace();
  const router = useRouter();
  const allowed = modules.filter(module => module.workflow);
  const [selected, setSelected] = useState(allowed[0]?.key ?? "projects");
  if (!(context.can_review || context.can_publish) || !allowed.length) return <WorkspaceFeedback title="Review authority is required">
    Your assignment does not include this editorial review area.</WorkspaceFeedback>;
  const current = allowed.some(module => module.key === selected) ? selected : allowed[0].key;
  return <div className="rw-stack"><div className="rw-tabs" role="group" aria-label="Choose review resource">{allowed.map(module =>
    <Button key={module.key} variant={module.key === current ? "default" : "outline"} aria-pressed={module.key === current} onClick={() => { router.replace("/admin/reviews", { scroll: false }); setSelected(module.key); }}>{module.label}</Button>)}</div>
    <ResourceList resource={current} review /><p className="rw-help">This queue uses paginated, scoped pending-record reads. It does not treat the legacy workflow queue’s capped returned count as a global total.</p></div>;
}
