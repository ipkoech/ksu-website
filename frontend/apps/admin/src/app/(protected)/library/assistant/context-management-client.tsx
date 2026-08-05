"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Archive, Plus, Save, Send, Trash2 } from "lucide-react";
import {
  libraryServiceApi,
  type LibraryAssistantContext,
  type LibraryAssistantContextPayload,
  type LibraryAssistantSourcePayload,
} from "@ksu/api-client";
import { Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input, Textarea } from "@ksu/ui/components";
import { toast } from "@ksu/ui";
import { PageHeader } from "../../../../components/layout";

const sourceTypes = ["branch", "catalog", "database", "download", "external_link", "guide", "specialist", "service", "staff", "workflow", "policy", "regulation"];

type SourceDraft = LibraryAssistantSourcePayload & { localId: string };
type ContextDraft = Omit<LibraryAssistantContextPayload, "sources"> & { id?: string; status?: string; is_public?: boolean; sources: SourceDraft[] };

const emptyDraft = (): ContextDraft => ({
  name: "",
  slug: "",
  description: "",
  audience: "",
  instructions: "",
  allowed_source_types: ["guide", "catalog", "service"],
  suggested_prompts: [],
  escalation_guidance: "",
  sort_order: 0,
  sources: [],
});

function toDraft(context: LibraryAssistantContext): ContextDraft {
  return {
    id: context.id,
    name: context.name,
    slug: context.slug,
    library_id: context.library_id,
    description: context.description ?? "",
    audience: context.audience ?? "",
    instructions: context.instructions ?? "",
    allowed_source_types: context.allowed_source_types ?? [],
    suggested_prompts: context.suggested_prompts ?? [],
    escalation_guidance: context.escalation_guidance ?? "",
    sort_order: context.sort_order ?? 0,
    status: context.status,
    is_public: context.is_public,
    sources: (context.sources ?? []).map((source) => ({
      localId: source.id,
      source_type: source.source_type,
      source_id: source.source_id,
      title: source.title,
      public_url: source.public_url ?? "",
      sort_order: source.sort_order ?? 0,
    })),
  };
}

export function LibraryAssistantContextManagementClient() {
  const queryClient = useQueryClient();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState<ContextDraft>(emptyDraft);
  const query = useQuery({
    queryKey: ["library", "assistant", "contexts"],
    queryFn: () => libraryServiceApi.assistantContexts.list(),
  });
  const contexts = useMemo(() => query.data?.data ?? [], [query.data]);

  useEffect(() => {
    const selected = contexts.find((context) => context.id === selectedId) ?? contexts[0];
    if (selected) {
      setSelectedId(selected.id);
      setDraft(toDraft(selected));
    }
  }, [contexts, selectedId]);

  const saveMutation = useMutation({
    mutationFn: (payload: { id?: string; data: LibraryAssistantContextPayload }) =>
      payload.id ? libraryServiceApi.assistantContexts.update(payload.id, payload.data) : libraryServiceApi.assistantContexts.create(payload.data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["library", "assistant", "contexts"] });
      setSelectedId(response.data.id);
      setDraft(toDraft(response.data));
      toast.success("Assistant context saved");
    },
    onError: () => toast.error("Could not save assistant context"),
  });
  const publishMutation = useMutation({
    mutationFn: (id: string) => libraryServiceApi.assistantContexts.publish(id),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["library", "assistant", "contexts"] });
      setDraft(toDraft(response.data));
      toast.success("Assistant context published");
    },
    onError: () => toast.error("Add at least one approved source before publishing"),
  });
  const archiveMutation = useMutation({
    mutationFn: (id: string) => libraryServiceApi.assistantContexts.archive(id),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["library", "assistant", "contexts"] });
      setDraft(toDraft(response.data));
      toast.success("Assistant context archived");
    },
    onError: () => toast.error("Could not archive assistant context"),
  });

  function updateDraft(patch: Partial<ContextDraft>) {
    setDraft((current) => ({ ...current, ...patch }));
  }

  function updateSource(localId: string, patch: Partial<SourceDraft>) {
    setDraft((current) => ({
      ...current,
      sources: current.sources.map((source) => source.localId === localId ? { ...source, ...patch } : source),
    }));
  }

  function submit() {
    const data: LibraryAssistantContextPayload = {
      library_id: draft.library_id,
      name: draft.name.trim(),
      slug: draft.slug.trim(),
      description: draft.description?.trim() || null,
      audience: draft.audience?.trim() || null,
      instructions: draft.instructions.trim(),
      allowed_source_types: draft.allowed_source_types,
      suggested_prompts: draft.suggested_prompts,
      escalation_guidance: draft.escalation_guidance?.trim() || null,
      sort_order: draft.sort_order,
      sources: draft.sources.map((source) => {
        const { localId: _localId, ...cleanSource } = source;
        return cleanSource;
      }),
    };
    saveMutation.mutate({ id: draft.id, data });
  }

  return (
    <div>
      <PageHeader title="Assistant contexts" description="Define what the Library assistant knows, how it answers, and which sources it may use." backHref="/library" />
      <div className="grid gap-6 p-4 sm:p-6 xl:grid-cols-[minmax(0,0.7fr)_minmax(0,1.3fr)]">
        <Card>
          <CardHeader className="flex-row items-start justify-between gap-3">
            <div><CardTitle>Support areas</CardTitle><CardDescription>Only published contexts appear on the public Ask page.</CardDescription></div>
            <Button variant="outline" size="sm" onClick={() => { setSelectedId(null); setDraft(emptyDraft()); }}><Plus className="mr-2 h-4 w-4" />New</Button>
          </CardHeader>
          <CardContent>
            {query.isLoading ? <p className="text-sm text-muted-foreground">Loading contexts…</p> : query.isError ? <p role="alert" className="text-sm text-destructive">Could not load assistant contexts.</p> : contexts.length === 0 ? <p className="rounded-md border p-4 text-sm text-muted-foreground">No contexts yet. Create the first support area.</p> : <div className="divide-y rounded-md border">{contexts.map((context) => <button type="button" key={context.id} onClick={() => { setSelectedId(context.id); setDraft(toDraft(context)); }} className={`block w-full p-4 text-left ${selectedId === context.id ? "bg-primary/5" : "hover:bg-muted/40"}`}><div className="flex items-center justify-between gap-3"><span className="font-medium">{context.name}</span><Badge variant={context.status === "active" ? "secondary" : "outline"}>{context.status ?? "draft"}</Badge></div><span className="mt-1 block text-xs text-muted-foreground">{context.sources?.filter((source) => source.is_approved).length ?? 0} approved sources · {context.slug}</span></button>)}</div>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>{draft.id ? "Edit context" : "New context"}</CardTitle><CardDescription>Keep instructions specific and approve only sources the assistant is allowed to cite.</CardDescription></CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Name" value={draft.name} onChange={(value) => updateDraft({ name: value })} required />
              <Field label="Slug" value={draft.slug} onChange={(value) => updateDraft({ slug: value })} required />
              <Field label="Audience" value={draft.audience ?? ""} onChange={(value) => updateDraft({ audience: value })} />
              <Field label="Sort order" type="number" value={String(draft.sort_order ?? 0)} onChange={(value) => updateDraft({ sort_order: Number(value) || 0 })} />
            </div>
            <TextField label="Description" value={draft.description ?? ""} onChange={(value) => updateDraft({ description: value })} rows={2} />
            <TextField label="Assistant instructions" value={draft.instructions} onChange={(value) => updateDraft({ instructions: value })} rows={5} required />
            <TextField label="Escalation guidance" value={draft.escalation_guidance ?? ""} onChange={(value) => updateDraft({ escalation_guidance: value })} rows={3} />

            <div className="border-t pt-5">
              <div className="flex items-start justify-between gap-3"><div><h3 className="font-semibold">Approved sources</h3><p className="text-sm text-muted-foreground">These records ground answers in this context.</p></div><Button type="button" variant="outline" size="sm" onClick={() => updateDraft({ sources: [...draft.sources, { localId: crypto.randomUUID(), source_type: "guide", source_id: "", title: "", public_url: "", sort_order: draft.sources.length }] })}><Plus className="mr-2 h-4 w-4" />Add source</Button></div>
              <div className="mt-4 space-y-4">{draft.sources.length === 0 ? <p className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">No approved sources. Add at least one before publishing.</p> : draft.sources.map((source) => <div key={source.localId} className="rounded-md border p-4"><div className="grid gap-3 md:grid-cols-[150px_1fr] md:items-end"><label className="text-sm font-medium">Source type<select aria-label="Source type" value={source.source_type} onChange={(event) => updateSource(source.localId, { source_type: event.target.value })} className="mt-1 h-10 w-full rounded-md border bg-background px-3 text-sm">{sourceTypes.map((type) => <option key={type} value={type}>{type.replaceAll("_", " ")}</option>)}</select></label><Field label="Source title" value={source.title} onChange={(value) => updateSource(source.localId, { title: value })} required /></div><div className="mt-3 grid gap-3 md:grid-cols-[1fr_1fr_auto] md:items-end"><Field label="Source record UUID" value={source.source_id ?? ""} onChange={(value) => updateSource(source.localId, { source_id: value })} required /><Field label="Public URL" value={source.public_url ?? ""} onChange={(value) => updateSource(source.localId, { public_url: value })} /><Button type="button" variant="ghost" size="icon" aria-label="Remove source" onClick={() => updateDraft({ sources: draft.sources.filter((item) => item.localId !== source.localId) })}><Trash2 className="h-4 w-4 text-destructive" /></Button></div></div>)}</div>
            </div>
            <div className="flex flex-wrap gap-3 border-t pt-5"><Button onClick={submit} disabled={saveMutation.isPending || !draft.name.trim() || !draft.slug.trim() || !draft.instructions.trim()}><Save className="mr-2 h-4 w-4" />Save context</Button>{draft.id ? <><Button variant="secondary" onClick={() => { if (draft.id) publishMutation.mutate(draft.id); }} disabled={publishMutation.isPending || draft.sources.length === 0}><Send className="mr-2 h-4 w-4" />Publish</Button><Button variant="outline" onClick={() => { if (draft.id) archiveMutation.mutate(draft.id); }} disabled={archiveMutation.isPending}><Archive className="mr-2 h-4 w-4" />Archive</Button></> : null}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, type = "text", required = false }: { label: string; value: string; onChange: (value: string) => void; type?: string; required?: boolean }) {
  return <label className="text-sm font-medium">{label}<Input aria-label={label} required={required} type={type} value={value} onChange={(event) => onChange(event.target.value)} className="mt-1" /></label>;
}

function TextField({ label, value, onChange, rows, required = false }: { label: string; value: string; onChange: (value: string) => void; rows: number; required?: boolean }) {
  return <label className="block text-sm font-medium">{label}<Textarea aria-label={label} required={required} value={value} onChange={(event) => onChange(event.target.value)} rows={rows} className="mt-1" /></label>;
}
