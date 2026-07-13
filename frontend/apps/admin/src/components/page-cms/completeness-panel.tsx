"use client";

import { Alert, AlertDescription, AlertTitle, Badge } from "@ksu/ui/components";
import type { PageCmsValidationResult } from "@/lib/api/page-cms";

export type CompletenessPanelProps = {
  validation: PageCmsValidationResult | null;
  isLoading?: boolean;
  error?: string | null;
};

export function CompletenessPanel({ validation, isLoading, error }: CompletenessPanelProps) {
  const issues = validation?.issues ?? [];
  const blockers = issues.filter((issue) => issue.blocking);

  return (
    <section aria-labelledby="validation-heading" className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 id="validation-heading" className="text-sm font-semibold">Validation</h2>
          <p className="mt-1 text-sm text-muted-foreground">Completeness checks for the current page scope.</p>
        </div>
        <Badge variant={blockers.length ? "destructive" : "secondary"}>{blockers.length ? `${blockers.length} blockers` : "Ready"}</Badge>
      </div>
      {isLoading ? <p className="text-sm text-muted-foreground">Checking completeness...</p> : null}
      {error ? <Alert variant="destructive"><AlertTitle>Validation unavailable</AlertTitle><AlertDescription>{error}</AlertDescription></Alert> : null}
      {!isLoading && !error && !issues.length ? <p className="border border-dashed p-3 text-sm text-muted-foreground">No validation issues.</p> : null}
      {issues.map((issue) => (
        <div key={`${issue.section_id}-${issue.item_id ?? "section"}-${issue.code}`} role="alert" className={`border-l-2 p-3 text-sm ${issue.severity === "error" ? "border-destructive" : "border-warning"}`}>
          <p className="font-medium">{issue.message}</p>
          <p className="mt-1 text-xs text-muted-foreground">{issue.blocking ? "Blocks workflow" : "Advisory"}{issue.field ? ` · ${issue.field.replace(/_/g, " ")}` : ""}</p>
        </div>
      ))}
    </section>
  );
}
