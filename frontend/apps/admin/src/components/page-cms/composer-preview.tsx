"use client";

import { Alert, AlertDescription, AlertTitle, Button } from "@ksu/ui/components";
import type { PageCmsPreview, PageCmsValidationIssue } from "@/lib/api/page-cms";
import { useState } from "react";
import { SectionPreviewRenderer } from "./preview/section-preview-renderer";
import type { PreviewViewport } from "./preview/section-preview-shells";

const VIEWPORTS: Record<PreviewViewport, { label: string; widthClass: string }> = {
  desktop: { label: "Desktop", widthClass: "w-[1280px]" },
  tablet: { label: "Tablet", widthClass: "w-[768px]" },
  mobile: { label: "Mobile", widthClass: "w-[390px]" },
};

export type ComposerPreviewProps = {
  preview: PageCmsPreview | null;
  isLoading?: boolean;
  error?: string | null;
  validationIssues?: PageCmsValidationIssue[];
  isDirty?: boolean;
};

export function ComposerPreview({ preview, isLoading = false, error = null, validationIssues = [], isDirty = false }: ComposerPreviewProps) {
  const [viewport, setViewport] = useState<PreviewViewport>("desktop");
  const issues = validationIssues.length ? validationIssues : preview?.issues ?? [];

  return (
    <section aria-labelledby="composer-preview-heading" className="space-y-3 border-t border-border pt-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div><h2 id="composer-preview-heading" className="text-sm font-semibold">Preview</h2><p className="mt-1 text-sm text-muted-foreground">Representative draft content and hierarchy.</p></div>
        <div role="tablist" aria-label="Preview viewport" className="inline-flex h-9 shrink-0 border border-border bg-muted p-0.5">
          {(Object.keys(VIEWPORTS) as PreviewViewport[]).map((mode) => <Button key={mode} type="button" role="tab" aria-selected={viewport === mode} aria-label={`${VIEWPORTS[mode].label} preview`} variant={viewport === mode ? "secondary" : "ghost"} size="sm" className="h-8 min-w-20 rounded-sm px-2" onClick={() => setViewport(mode)}>{VIEWPORTS[mode].label}</Button>)}
        </div>
      </div>

      {isDirty ? <Alert variant="warning"><AlertTitle>Preview out of date</AlertTitle><AlertDescription>Unsaved changes are not in preview</AlertDescription></Alert> : null}
      {error ? <Alert variant="destructive"><AlertTitle>Preview could not be loaded.</AlertTitle><AlertDescription>{error}</AlertDescription></Alert> : null}
      {isLoading ? <p className="border border-dashed p-4 text-sm text-muted-foreground">Preview loading...</p> : null}
      {!isLoading && !preview && !error ? <p className="border border-dashed p-4 text-sm text-muted-foreground">Run Preview to resolve this page scope.</p> : null}
      {!isLoading && preview && !preview.sections.length ? <p className="border border-dashed p-4 text-sm text-muted-foreground">No preview sections are available.</p> : null}
      {!isLoading && preview?.sections.length ? (
        <div className="overflow-x-auto border border-border bg-muted/30 p-3">
          <div data-preview-viewport={viewport} className={`${VIEWPORTS[viewport].widthClass} overflow-hidden bg-background shadow-sm`}>
            {preview.sections.map((section) => <SectionPreviewRenderer key={section.id} section={section} viewport={viewport} validationIssues={issues} />)}
          </div>
        </div>
      ) : null}
    </section>
  );
}
