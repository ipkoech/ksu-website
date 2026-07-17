"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  schoolPortalApi,
  schoolPortalQueryKeys,
  type SchoolContentRecord,
  type SchoolContentType,
} from "@ksu/api-client";
import { Eye, Loader2, RotateCcw, Save } from "lucide-react";
import {
  Alert,
  AlertDescription,
  Button,
  Input,
  Label,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Textarea,
} from "@ksu/ui/components";
import { MediaPicker } from "@/components/media/media-picker";
import { useSchoolPortal } from "@/components/schools/school-portal-provider";
import {
  ContentWorkflowPanel,
  LOCKED_SCHOOL_STATUSES,
} from "./content-workflow-panel";

type Draft = Record<string, string | boolean | number | null>;

function initialDraft(record?: SchoolContentRecord | null): Draft {
  if (!record) {
    return {
      title: "",
      slug: "",
      summary: "",
      rich_text: "",
      featured_media_id: null,
      start_date: "",
      end_date: "",
      location: "",
      file_id: null,
      media_id: null,
    };
  }
  return {
    title: String(record.title || record.name || ""),
    slug: String(record.slug || ""),
    summary: String(record.summary || record.description || ""),
    rich_text: String(record.rich_text || record.content || ""),
    featured_media_id: (record.featured_media_id as string | null) ?? null,
    start_date: String(record.start_date || ""),
    end_date: String(record.end_date || ""),
    location: String(record.location || ""),
    file_id: (record.file_id as string | null) ?? null,
    media_id: (record.media_id as string | null) ?? null,
  };
}

function compactDraft(contentType: SchoolContentType, draft: Draft) {
  const common = {
    title: draft.title,
    slug: draft.slug,
    summary: draft.summary || null,
    rich_text: draft.rich_text || null,
    featured_media_id: draft.featured_media_id || null,
  };
  if (contentType === "event" || contentType === "calendar_entry") {
    return {
      ...common,
      start_date: draft.start_date,
      end_date: draft.end_date || null,
      location: draft.location || null,
    };
  }
  if (contentType === "document" || contentType === "download") {
    return {
      title: draft.title,
      slug: draft.slug,
      description: draft.summary || draft.rich_text || null,
      document_type: contentType,
      file_id: draft.file_id,
    };
  }
  if (contentType === "gallery_link") {
    return {
      media_id: draft.media_id,
      role: "gallery",
      display_order: 100,
    };
  }
  return common;
}

export function ContentEditorSheet({
  contentType,
  record,
  open,
  onOpenChange,
  onSaved,
}: {
  contentType: SchoolContentType;
  record: SchoolContentRecord | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => Promise<void>;
}) {
  const { school, can } = useSchoolPortal();
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState<Draft>(() => initialDraft(record));
  const [currentRecord, setCurrentRecord] = useState(record);
  const [error, setError] = useState("");
  const recoveryKey = useMemo(
    () => `school-content-recovery:${school.id}:${contentType}:${record?.id ?? "new"}`,
    [contentType, record?.id, school.id],
  );
  const recovered = useMemo(() => {
    if (typeof window === "undefined") return null;
    try {
      return JSON.parse(localStorage.getItem(recoveryKey) || "null") as Draft | null;
    } catch {
      return null;
    }
  }, [recoveryKey]);

  useEffect(() => {
    if (!open) return;
    setDraft(initialDraft(record));
    setCurrentRecord(record);
    setError("");
  }, [open, record]);
  useEffect(() => {
    if (!open) return;
    const timer = window.setTimeout(() => {
      localStorage.setItem(recoveryKey, JSON.stringify(draft));
    }, 500);
    return () => window.clearTimeout(timer);
  }, [draft, open, recoveryKey]);

  const status = String(currentRecord?.workflow_status || currentRecord?.status || "draft");
  const readOnly = Boolean(currentRecord && LOCKED_SCHOOL_STATUSES.has(status));
  const mutation = useMutation({
    mutationFn: async () => {
      const payload = compactDraft(contentType, draft);
      return currentRecord
        ? (await schoolPortalApi.content.update(contentType, currentRecord.id, payload)).data
        : (await schoolPortalApi.content.create(contentType, payload)).data;
    },
    onSuccess: async (saved) => {
      setCurrentRecord(saved);
      localStorage.removeItem(recoveryKey);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: schoolPortalQueryKeys.content(school.id) }),
        onSaved(),
      ]);
    },
    onError: (caught) => setError(caught instanceof Error ? caught.message : "Unable to save content."),
  });
  const workflow = useMutation({
    mutationFn: ({ action, comments }: { action: "submit" | "withdraw"; comments: string }) =>
      schoolPortalApi.content.action(contentType, currentRecord!.id, action, comments),
    onSuccess: async (response) => {
      setCurrentRecord(response.data);
      await onSaved();
    },
    onError: (caught) => setError(caught instanceof Error ? caught.message : "Workflow action failed."),
  });

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-3xl">
        <SheetHeader>
          <SheetTitle>{record ? "Edit" : "Create"} {contentType.replaceAll("_", " ")}</SheetTitle>
          <SheetDescription>Local recovery is automatic. Use Save to server to persist changes.</SheetDescription>
        </SheetHeader>
        <div className="space-y-5 py-6">
          {recovered && !readOnly ? (
            <Alert>
              <RotateCcw className="size-4" />
              <AlertDescription className="flex flex-wrap items-center justify-between gap-2">
                A local recovery draft is available.
                <Button size="sm" variant="outline" onClick={() => setDraft(recovered)}>Restore local draft</Button>
              </AlertDescription>
            </Alert>
          ) : null}
          {readOnly ? <Alert><AlertDescription>This record is {status.replaceAll("_", " ")} and is read-only for school users. Withdraw it before editing when allowed.</AlertDescription></Alert> : null}
          {error ? <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert> : null}
          <Tabs defaultValue="edit">
            <TabsList><TabsTrigger value="edit">Editor</TabsTrigger><TabsTrigger value="preview"><Eye className="mr-2 size-4" /> Preview</TabsTrigger></TabsList>
            <TabsContent value="edit" className="space-y-4 pt-3">
              {contentType !== "gallery_link" ? (
                <>
                  <Field label="Title" value={draft.title} disabled={readOnly} onChange={(title) => setDraft((current) => ({ ...current, title }))} />
                  <Field label="Slug" value={draft.slug} disabled={readOnly} onChange={(slug) => setDraft((current) => ({ ...current, slug }))} />
                  <div className="space-y-2"><Label htmlFor="content-summary">Summary</Label><Textarea id="content-summary" rows={3} disabled={readOnly} value={String(draft.summary ?? "")} onChange={(event) => setDraft((current) => ({ ...current, summary: event.target.value }))} /></div>
                  <div className="space-y-2"><Label htmlFor="content-rich-text">Rich text</Label><Textarea id="content-rich-text" rows={12} disabled={readOnly} value={String(draft.rich_text ?? "")} onChange={(event) => setDraft((current) => ({ ...current, rich_text: event.target.value }))} /><p className="text-xs text-muted-foreground">Use clean semantic HTML. Scripts, event handlers, and embedded frames are rejected.</p></div>
                </>
              ) : null}
              {(contentType === "event" || contentType === "calendar_entry") ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Start date and time" type="datetime-local" value={draft.start_date} disabled={readOnly} onChange={(start_date) => setDraft((current) => ({ ...current, start_date }))} />
                  <Field label="End date and time" type="datetime-local" value={draft.end_date} disabled={readOnly} onChange={(end_date) => setDraft((current) => ({ ...current, end_date }))} />
                  <Field label="Location" value={draft.location} disabled={readOnly} onChange={(location) => setDraft((current) => ({ ...current, location }))} />
                </div>
              ) : null}
              {(contentType === "document" || contentType === "download") ? (
                <MediaPicker label="Document file and preview" value={String(draft.file_id || "")} disabled={readOnly} onChange={(file_id) => setDraft((current) => ({ ...current, file_id }))} mediaType="document" accept=".pdf,.doc,.docx" />
              ) : contentType === "gallery_link" ? (
                <MediaPicker label="Gallery image and preview" value={String(draft.media_id || "")} disabled={readOnly} onChange={(media_id) => setDraft((current) => ({ ...current, media_id }))} mediaType="image" accept="image/*" />
              ) : (
                <MediaPicker label="Featured media and preview" value={String(draft.featured_media_id || "")} disabled={readOnly} onChange={(featured_media_id) => setDraft((current) => ({ ...current, featured_media_id }))} mediaType="image" accept="image/*" />
              )}
            </TabsContent>
            <TabsContent value="preview" className="space-y-3 rounded-lg border p-5">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{contentType.replaceAll("_", " ")}</p>
              <h2 className="text-xl font-semibold">{String(draft.title || "Untitled content")}</h2>
              <p className="text-sm text-muted-foreground">{String(draft.summary || "No summary")}</p>
              <pre className="whitespace-pre-wrap font-sans text-sm">{String(draft.rich_text || "")}</pre>
            </TabsContent>
          </Tabs>
          {currentRecord ? (
            <ContentWorkflowPanel
              contentType={contentType}
              record={currentRecord}
              canSubmit={can("school.content.submit")}
              busy={workflow.isPending}
              onAction={async (action, comments) => { await workflow.mutateAsync({ action, comments }); }}
            />
          ) : null}
        </div>
        <SheetFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
          {!readOnly && can("school.content.manage") ? (
            <Button disabled={mutation.isPending} onClick={() => mutation.mutate()}>
              {mutation.isPending ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Save className="mr-2 size-4" />}
              Save to server
            </Button>
          ) : null}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

function Field({
  label,
  value,
  onChange,
  disabled,
  type = "text",
}: {
  label: string;
  value: Draft[string];
  onChange: (value: string) => void;
  disabled: boolean;
  type?: string;
}) {
  const id = `content-${label.toLowerCase().replaceAll(" ", "-")}`;
  return <div className="space-y-2"><Label htmlFor={id}>{label}</Label><Input id={id} type={type} disabled={disabled} value={String(value ?? "")} onChange={(event) => onChange(event.target.value)} /></div>;
}
