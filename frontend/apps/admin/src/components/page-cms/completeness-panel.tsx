"use client";

import { Alert, AlertDescription, AlertTitle, Badge } from "@ksu/ui/components";
import type { PageCmsValidationResult } from "@/lib/api/page-cms";
import { validationDisplayState } from "@/app/(dashboard)/page-cms/composer/composer-state";

export type CompletenessPanelProps = {
  validation: PageCmsValidationResult | null;
  isLoading?: boolean;
  error?: string | null;
  headingId?: string;
};

export function CompletenessPanel({ validation, isLoading = false, error = null, headingId = "validation-heading" }: CompletenessPanelProps) {
  const issues = validation?.issues ?? [];
  const blockers = issues.filter((issue) => issue.blocking);
  const state = validationDisplayState({ validation, isLoading, error });
  const badge = state === "loading"
    ? "Checking"
    : state === "error"
      ? "Unavailable"
      : state === "unvalidated"
        ? "Not validated"
        : blockers.length ? `${blockers.length} blockers` : "Ready";

  return (
    <section aria-labelledby={headingId} className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 id={headingId} className="text-sm font-semibold">Validation</h2>
          <p className="mt-1 text-sm text-muted-foreground">Completeness checks for the current page scope.</p>
        </div>
        <Badge variant={state === "error" || (state === "validated" && blockers.length) ? "destructive" : "secondary"}>{badge}</Badge>
      </div>
      {isLoading ? <p className="text-sm text-muted-foreground">Checking completeness...</p> : null}
      {error ? <Alert variant="destructive"><AlertTitle>Validation unavailable</AlertTitle><AlertDescription>{error}</AlertDescription></Alert> : null}
      {state === "unvalidated" ? <p className="border border-dashed p-3 text-sm text-muted-foreground">Run validation to check this page scope.</p> : null}
      {state === "validated" && !issues.length ? <p className="border border-dashed p-3 text-sm text-muted-foreground">No validation issues.</p> : null}
      {issues.map((issue) => (
        <div key={`${issue.section_id}-${issue.item_id ?? "section"}-${issue.code}`} role="alert" className={`border-l-2 p-3 text-sm ${issue.severity === "error" ? "border-destructive" : "border-warning"}`}>
          <p className="font-medium">{issue.message}</p>
          <p className="mt-1 text-xs text-muted-foreground">{issue.blocking ? "Blocks workflow" : "Advisory"}{issue.field ? ` · ${issue.field.replace(/_/g, " ")}` : ""}</p>
        </div>
      ))}
    </section>
  );
}
