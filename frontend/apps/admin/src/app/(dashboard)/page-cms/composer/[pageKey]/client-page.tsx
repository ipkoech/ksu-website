"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Eye, RefreshCw, ShieldAlert } from "lucide-react";
import { Alert, AlertDescription, AlertTitle, Badge, Button } from "@ksu/ui/components";
import { CompletenessPanel } from "@/components/page-cms/completeness-panel";
import { ComposerPreview } from "@/components/page-cms/composer-preview";
import { PageScopePicker, type PageScopePickerValue } from "@/components/page-cms/page-scope-picker";
import { SectionInspector } from "@/components/page-cms/section-inspector";
import { SectionTemplatePicker } from "@/components/page-cms/section-template-picker";
import { SortableSectionOutline } from "@/components/page-cms/sortable-section-outline";
import { PageHeader } from "@/components/shared/page-header";
import { usePermissions } from "@/hooks/use-permissions";
import { PageTransition } from "@/lib/animations";
import {
  PAGE_SCOPE_TYPES,
  pageCmsApi,
  pageSectionsApi,
  type PageCmsPreview,
  type PageCmsSectionDefinition,
  type PageCmsValidationResult,
  type PageScopeType,
  type PageSection,
  type PageSectionWorkflowAction,
} from "@/lib/api/page-cms";
import {
  composerCapabilities,
  composerHref,
  createRequestSequence,
  createSectionPayloadFromDefinition,
  isReloadRequiredConflict,
  isScopeComplete,
  shouldConfirmComposerNavigation,
} from "../composer-state";

function scopeTypeFromQuery(value: string | null): PageScopeType {
  return PAGE_SCOPE_TYPES.includes(value as PageScopeType) ? value as PageScopeType : "university";
}

function workflowActionsFor(section: PageSection, canUpdate: boolean, canReview: boolean, canPublish: boolean) {
  const actions: PageSectionWorkflowAction[] = [];
  if (["draft", "changes_requested"].includes(section.status) && canUpdate) actions.push("submit");
  if (section.status === "in_review" && canReview) actions.push("approve", "request_changes");
  if (section.status === "approved" && canPublish) actions.push("publish");
  if (section.status === "published" && canPublish) actions.push("unpublish");
  return actions;
}

function scopeDisplayName(scope: PageScopePickerValue) {
  return scope.scopeLabel || (scope.scopeType === "university" ? "University" : scope.scopeType.replace(/_/g, " "));
}

export default function ComposerClientPage() {
  const params = useParams<{ pageKey: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { hasAnyPermission } = usePermissions();
  const pageKey = String(params?.pageKey ?? "homepage");
  const scopeType = scopeTypeFromQuery(searchParams.get("scope_type"));
  const scopeId = searchParams.get("scope_id") || null;
  const sectionId = searchParams.get("section") || null;
  const [scopeLabel, setScopeLabel] = useState(scopeType === "university" ? "University" : "");
  const [pendingScope, setPendingScope] = useState<PageScopePickerValue | null>(null);
  const [sections, setSections] = useState<PageSection[]>([]);
  const [definitions, setDefinitions] = useState<PageCmsSectionDefinition[]>([]);
  const [validation, setValidation] = useState<PageCmsValidationResult | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [preview, setPreview] = useState<PageCmsPreview | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isValidating, setIsValidating] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [workflowBusy, setWorkflowBusy] = useState<PageSectionWorkflowAction | null>(null);
  const [isOrderDirty, setIsOrderDirty] = useState(false);
  const [isFormDirty, setIsFormDirty] = useState(false);
  const [validationOpen, setValidationOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conflict, setConflict] = useState(false);
  const [sorterResetKey, setSorterResetKey] = useState(0);
  const requestSequenceRef = useRef(createRequestSequence());
  const dirtyRef = useRef(false);
  const historyRestorePendingRef = useRef(false);
  const historyLeaveDeltaRef = useRef(0);

  const { canCreate, canUpdate } = composerCapabilities(hasAnyPermission);
  const canReview = hasAnyPermission(["page_sections.review", "page_sections.manage"]);
  const canPublish = hasAnyPermission(["page_sections.publish", "page_sections.manage", "homepage.publish"]);
  const canView = hasAnyPermission([
    "page_sections.view", "page_sections.create", "page_sections.update", "page_sections.review", "page_sections.publish",
    "page_sections.manage", "homepage.view", "homepage.manage", "homepage.publish",
  ]);

  const currentScope: PageScopePickerValue = { scopeType, scopeId, scopeLabel };
  const scope = pendingScope ?? currentScope;
  const hasCompleteCurrentScope = !pendingScope && isScopeComplete(currentScope);
  const requiresScopeSelection = !isScopeComplete(scope);
  const selectedSection = sections.find((section) => section.id === sectionId) ?? null;
  const selectedDefinition = selectedSection
    ? definitions.find((definition) => definition.key === selectedSection.layout_variant) ?? null
    : null;
  const pageParams = useMemo(() => ({ scope_type: scopeType, scope_id: scopeId ?? undefined }), [scopeId, scopeType]);
  const replaceLocation = useCallback((next: Partial<{ scopeType: PageScopeType; scopeId: string | null; sectionId: string | null }>) => {
    router.replace(composerHref(pageKey, {
      scopeType: next.scopeType ?? scopeType,
      scopeId: next.scopeId === undefined ? scopeId : next.scopeId,
      sectionId: next.sectionId === undefined ? sectionId : next.sectionId,
    }));
  }, [pageKey, router, scopeId, scopeType, sectionId]);

  const load = useCallback(async ({ discardDraft = false }: { discardDraft?: boolean } = {}) => {
    if (!hasCompleteCurrentScope) {
      requestSequenceRef.current.cancel();
      setIsLoading(false);
      return;
    }

    const request = requestSequenceRef.current.begin();
    setIsLoading(true);
    setError(null);
    try {
      const [pageResponse, definitionsResponse] = await Promise.all([
        pageCmsApi.getPage(pageKey, pageParams, { signal: request.signal }),
        pageCmsApi.definitions({ signal: request.signal }),
      ]);
      if (!requestSequenceRef.current.isCurrent(request.id)) return;
      setSections(pageResponse.data?.sections ?? []);
      setDefinitions(definitionsResponse.data ?? []);
      if (discardDraft) {
        setSorterResetKey((current) => current + 1);
        setIsOrderDirty(false);
        setIsFormDirty(false);
        setConflict(false);
      }
      if (sectionId && !pageResponse.data?.sections.some((section) => section.id === sectionId)) {
        replaceLocation({ sectionId: null });
      }
    } catch {
      if (!requestSequenceRef.current.isCurrent(request.id) || request.signal.aborted) return;
      setError("The page composition could not be loaded.");
    } finally {
      if (requestSequenceRef.current.isCurrent(request.id)) setIsLoading(false);
    }
  }, [hasCompleteCurrentScope, pageKey, pageParams, replaceLocation, sectionId]);

  useEffect(() => {
    const requestSequence = requestSequenceRef.current;
    if (!hasCompleteCurrentScope) {
      requestSequence.cancel();
      setIsLoading(false);
      return;
    }
    void load();
    return () => requestSequence.cancel();
  }, [hasCompleteCurrentScope, load]);
  useEffect(() => { setScopeLabel(scopeType === "university" ? "University" : ""); }, [scopeId, scopeType]);
  useEffect(() => {
    const receiveDirtyState = (event: Event) => setIsFormDirty(Boolean((event as CustomEvent<boolean>).detail));
    window.addEventListener("page-cms-composer-dirty", receiveDirtyState);
    return () => window.removeEventListener("page-cms-composer-dirty", receiveDirtyState);
  }, []);
  useEffect(() => {
    if (!isOrderDirty && !isFormDirty) return;
    const warnBeforeUnload = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ""; };
    window.addEventListener("beforeunload", warnBeforeUnload);
    return () => window.removeEventListener("beforeunload", warnBeforeUnload);
  }, [isFormDirty, isOrderDirty]);
  useEffect(() => { dirtyRef.current = isOrderDirty || isFormDirty; }, [isFormDirty, isOrderDirty]);

  const confirmNavigation = () => (
    !isOrderDirty && !isFormDirty
      ? true
      : window.confirm("You have unsaved page composer changes. Leave without saving?")
  );

  useEffect(() => {
    const handleDocumentClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const anchor = target.closest<HTMLAnchorElement>("a[href]");
      if (!anchor || !shouldConfirmComposerNavigation({
        dirty: dirtyRef.current,
        href: anchor.href,
        currentOrigin: window.location.origin,
        button: event.button,
        altKey: event.altKey,
        ctrlKey: event.ctrlKey,
        metaKey: event.metaKey,
        shiftKey: event.shiftKey,
        target: anchor.target,
        download: anchor.hasAttribute("download"),
      })) return;

      event.preventDefault();
      event.stopPropagation();
      if (window.confirm("You have unsaved page composer changes. Leave without saving?")) {
        const destination = new URL(anchor.href);
        router.push(`${destination.pathname}${destination.search}${destination.hash}`);
      }
    };

    document.addEventListener("click", handleDocumentClick, true);
    return () => document.removeEventListener("click", handleDocumentClick, true);
  }, [router]);

  useEffect(() => {
    const stateKey = "__pageCmsComposerHistory";
    type ComposerHistoryState = { token: string; position: number };
    const currentState = window.history.state as Record<string, unknown> | null;
    const existingState = currentState?.[stateKey] as ComposerHistoryState | undefined;
    const token = existingState?.token ?? `${Date.now()}-${Math.random()}`;
    const positionRef = { current: existingState?.position ?? 1 };

    if (!existingState) {
      window.history.replaceState({ ...currentState, [stateKey]: { token, position: 0 } }, "", window.location.href);
      window.history.pushState({ ...window.history.state, [stateKey]: { token, position: 1 } }, "", window.location.href);
    }

    const handlePopState = (event: PopStateEvent) => {
      const nextState = event.state?.[stateKey] as ComposerHistoryState | undefined;
      if (nextState?.token !== token) {
        if (!dirtyRef.current) return;
        historyRestorePendingRef.current = true;
        if (positionRef.current === 1) {
          historyLeaveDeltaRef.current = 1;
          window.history.go(-1);
        } else {
          historyLeaveDeltaRef.current = -2;
          window.history.go(1);
        }
        return;
      }

      positionRef.current = nextState.position;

      if (nextState.position === 0) {
        if (!dirtyRef.current) {
          window.history.go(-1);
          return;
        }
        historyRestorePendingRef.current = true;
        historyLeaveDeltaRef.current = -2;
        window.history.go(1);
        return;
      }

      if (nextState.position === 1 && historyRestorePendingRef.current) {
        historyRestorePendingRef.current = false;
        if (window.confirm("You have unsaved page composer changes. Leave without saving?")) window.history.go(historyLeaveDeltaRef.current);
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const handleScopeChange = (nextScope: PageScopePickerValue) => {
    if (!confirmNavigation()) return;
    setScopeLabel(nextScope.scopeLabel);
    setValidation(null);
    setValidationError(null);
    setPreview(null);
    setPreviewError(null);
    if (!isScopeComplete(nextScope)) {
      setPendingScope(nextScope);
      return;
    }
    setPendingScope(null);
    replaceLocation({ scopeType: nextScope.scopeType, scopeId: nextScope.scopeId, sectionId: null });
  };

  const handleSelectSection = (nextSectionId: string) => {
    if (!confirmNavigation()) return;
    replaceLocation({ sectionId: nextSectionId });
  };

  const handleOrderChange = async (orderedSections: PageSection[]) => {
    if (!hasCompleteCurrentScope) return;
    try {
      const response = await pageCmsApi.reorderSections(pageKey, {
        scope_type: scopeType,
        scope_id: scopeId,
        items: orderedSections.map(({ id, display_order, revision }) => ({ id, display_order, revision })),
      });
      setSections(response.data ?? []);
      setIsOrderDirty(false);
    } catch (requestError) {
      if (isReloadRequiredConflict(requestError)) setConflict(true);
      throw requestError;
    }
  };

  const handleCreate = async (definition: PageCmsSectionDefinition) => {
    if (!canCreate || !hasCompleteCurrentScope || isCreating) return;
    setIsCreating(true);
    setError(null);
    try {
      const response = await pageSectionsApi.create(createSectionPayloadFromDefinition(definition, {
        pageKey,
        scopeType,
        scopeId,
        nextDisplayOrder: (Math.max(0, ...sections.map((section) => section.display_order)) + 10),
        existingSectionKeys: sections.map((section) => section.section_key),
      }));
      setSections((current) => [...current, response.data].sort((left, right) => left.display_order - right.display_order));
      replaceLocation({ sectionId: response.data.id });
    } catch (requestError) {
      if (isReloadRequiredConflict(requestError)) setConflict(true);
      else setError("The section could not be created.");
    } finally {
      setIsCreating(false);
    }
  };

  const handleValidate = async () => {
    if (!hasCompleteCurrentScope) return;
    setIsValidating(true);
    setValidationError(null);
    try {
      const response = await pageCmsApi.validatePage(pageKey, pageParams);
      setValidation(response.data);
      setValidationOpen(true);
    } catch {
      setValidation(null);
      setValidationError("Validation could not be completed.");
    } finally {
      setIsValidating(false);
    }
  };

  const refreshPreviewAndValidation = async () => {
    if (!hasCompleteCurrentScope) return;
    setIsPreviewing(true);
    setIsValidating(true);
    setPreviewError(null);
    setValidationError(null);
    const [previewResult, validationResult] = await Promise.allSettled([
      Promise.resolve().then(() => pageCmsApi.previewPage(pageKey, pageParams)),
      Promise.resolve().then(() => pageCmsApi.validatePage(pageKey, pageParams)),
    ]);
    if (previewResult.status === "fulfilled") setPreview(previewResult.value.data);
    else setPreviewError("Preview could not be loaded.");
    if (validationResult.status === "fulfilled") {
      setValidation(validationResult.value.data);
      setValidationOpen(true);
    } else {
      setValidationError("Validation could not be completed.");
    }
    setIsPreviewing(false);
    setIsValidating(false);
  };

  const handlePreview = async () => refreshPreviewAndValidation();

  const handleWorkflow = async (action: PageSectionWorkflowAction) => {
    if (!selectedSection || workflowBusy) return;
    setWorkflowBusy(action);
    try {
      const response = await pageSectionsApi.workflow(selectedSection.id, action);
      setSections((current) => current.map((section) => section.id === response.data.id ? response.data : section));
    } catch (requestError) {
      if (isReloadRequiredConflict(requestError)) setConflict(true);
      else setError(`Unable to ${action.replace(/_/g, " ")} this section.`);
    } finally {
      setWorkflowBusy(null);
    }
  };

  const handleSectionSave = async (payload: Parameters<typeof pageSectionsApi.update>[1]) => {
    if (!selectedSection || !canUpdate) throw new Error("Section editing is unavailable.");
    if (conflict) throw new Error("Reload required before saving this section.");
    setError(null);
    try {
      const response = await pageSectionsApi.update(selectedSection.id, payload);
      setSections((current) => current.map((section) => section.id === response.data.id ? response.data : section));
      setIsFormDirty(false);
      await refreshPreviewAndValidation();
    } catch (requestError) {
      if (isReloadRequiredConflict(requestError)) setConflict(true);
      else setError("The section could not be saved. Your edits are still available to retry.");
      throw requestError;
    }
  };

  const actionButtons = selectedSection ? workflowActionsFor(selectedSection, canUpdate, canReview, canPublish) : [];

  if (!canView) {
    return <PageTransition><PageHeader title="Page Composer" backHref="/page-cms" /><Alert variant="destructive"><ShieldAlert /><AlertTitle>Access denied</AlertTitle><AlertDescription>You do not have access to page compositions.</AlertDescription></Alert></PageTransition>;
  }

  const validationPanel = <CompletenessPanel validation={validation} isLoading={isValidating} error={validationError} headingId="validation-desktop-heading" />;

  return (
    <PageTransition>
      <PageHeader
        title="Page Composer"
        description={`${pageKey.replace(/_/g, " ")} · ${scopeDisplayName(scope)}`}
        backHref="/page-cms"
        actions={<div className="flex flex-wrap gap-2"><Button type="button" variant="outline" onClick={() => void handleValidate()} disabled={isLoading || isValidating || !hasCompleteCurrentScope}>{isValidating ? "Checking..." : "Validate"}</Button><Button type="button" variant="outline" onClick={() => void handlePreview()} disabled={isLoading || isPreviewing || !hasCompleteCurrentScope}><Eye />{isPreviewing ? "Loading..." : "Preview"}</Button></div>}
      />

      {conflict ? <Alert variant="warning" className="mb-4"><RefreshCw /><AlertTitle>Reload required</AlertTitle><AlertDescription>This composition changed elsewhere. Reload before making more changes.<Button type="button" variant="link" className="h-auto px-0" onClick={() => void load({ discardDraft: true })}>Reload composition</Button></AlertDescription></Alert> : null}
      {error ? <Alert variant="destructive" className="mb-4"><AlertTitle>Composer unavailable</AlertTitle><AlertDescription>{error}</AlertDescription></Alert> : null}

      <section aria-label="Composer context" className="mb-4 border-y border-border py-4">
        <PageScopePicker value={scope} onChange={handleScopeChange} disabled={isLoading || isCreating || Boolean(conflict)} />
      </section>

      <div className="grid min-h-[36rem] gap-4 xl:grid-cols-[minmax(17rem,0.8fr)_minmax(0,1.6fr)_minmax(18rem,0.8fr)]">
        <aside aria-labelledby="outline-heading" className="border border-border p-4">
          <div className="mb-4"><h2 id="outline-heading" className="text-sm font-semibold">Page outline</h2><p className="mt-1 text-sm text-muted-foreground">Select and arrange sections for this scope.</p></div>
          <p className="sr-only">Use Save Order to persist a changed outline.</p>
          <div onPointerDownCapture={(event) => { if ((event.target as HTMLElement).closest("button[aria-label^='Reorder ']")) setIsOrderDirty(true); }} onClickCapture={(event) => { if ((event.target as HTMLElement).closest("button")?.textContent?.includes("Cancel Order")) setIsOrderDirty(false); }}>
            {requiresScopeSelection ? <p className="border border-dashed p-3 text-sm text-muted-foreground">Select {scopeDisplayName(scope)} first.</p> : isLoading ? <p className="text-sm text-muted-foreground">Loading page outline...</p> : sections.length ? <SortableSectionOutline sections={sections} selectedSectionId={selectedSection?.id} onSelect={handleSelectSection} onOrderChange={handleOrderChange} resetKey={sorterResetKey} /> : <p className="border border-dashed p-3 text-sm text-muted-foreground">No sections exist for this scope.</p>}
          </div>
        </aside>

        <main aria-labelledby="editor-heading" className="min-w-0 border border-border p-4">
          <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border pb-4"><div><h2 id="editor-heading" className="text-sm font-semibold">Section editor</h2><p className="mt-1 text-sm text-muted-foreground">{selectedSection ? selectedSection.title || selectedSection.section_key : "Select a section from the outline."}</p></div>{selectedSection ? <Badge variant={selectedSection.status === "published" ? "default" : "secondary"}>{selectedSection.status.replace(/_/g, " ")}</Badge> : null}</div>
          {selectedSection ? <div className="space-y-4 py-4">{selectedDefinition ? <SectionInspector key={`${selectedSection.id}:${selectedSection.revision}`} section={selectedSection} definition={selectedDefinition} onSave={handleSectionSave} onDirtyChange={setIsFormDirty} readOnly={!canUpdate} /> : <Alert variant="warning"><AlertTitle>Section definition unavailable</AlertTitle><AlertDescription>This section cannot be edited until its definition is available.</AlertDescription></Alert>}<div className="flex flex-wrap gap-2">{actionButtons.map((action) => <Button key={action} type="button" variant={action === "publish" ? "default" : "outline"} disabled={workflowBusy !== null || conflict} onClick={() => void handleWorkflow(action)}>{workflowBusy === action ? "Working..." : action.replace(/_/g, " ")}</Button>)}</div></div> : <div className="py-8 text-sm text-muted-foreground">Choose a section to inspect its workflow and editing controls.</div>}
          <SectionTemplatePicker scopeType={scope.scopeType} definitions={definitions} allowedScopes={PAGE_SCOPE_TYPES} disabled={!canCreate || !hasCompleteCurrentScope || isCreating || Boolean(conflict)} disabledMessage={requiresScopeSelection ? `Select ${scopeDisplayName(scope)} first.` : undefined} onSelect={handleCreate} />
          <ComposerPreview preview={preview} isLoading={isPreviewing} error={previewError} validationIssues={validation?.issues} isDirty={isOrderDirty || isFormDirty} />
        </main>

        <aside className="hidden border border-border p-4 xl:block">{validationPanel}</aside>
      </div>

      <div className="mt-4 xl:hidden"><details className="border border-border p-4" open={validationOpen} onToggle={(event) => setValidationOpen((event.target as HTMLDetailsElement).open)}><summary className="cursor-pointer text-sm font-semibold">Validation</summary><div className="pt-4"><CompletenessPanel validation={validation} isLoading={isValidating} error={validationError} headingId="validation-mobile-heading" /></div></details></div>
      <div className="sticky bottom-0 z-10 mt-4 flex gap-2 border-t border-border bg-background py-3 lg:hidden"><Button type="button" variant="outline" className="flex-1" onClick={() => void handleValidate()} disabled={isValidating || !hasCompleteCurrentScope}>{isValidating ? "Checking..." : "Validate"}</Button><Button type="button" className="flex-1" onClick={() => void handlePreview()} disabled={isPreviewing || !hasCompleteCurrentScope}>{isPreviewing ? "Loading..." : "Preview"}</Button></div>
    </PageTransition>
  );
}
