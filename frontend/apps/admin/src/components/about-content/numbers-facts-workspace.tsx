"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BarChart3, CalendarDays, Copy, ExternalLink, Layers3, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "@ksu/ui";
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Switch,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Textarea,
} from "@ksu/ui/components";
import { MediaPicker } from "@/components/media";
import { usePermissions } from "@/hooks/use-permissions";
import { PageTransition } from "@/lib/animations";
import {
  factEditionsApi,
  factGroupsApi,
  factItemsApi,
  type FactEdition,
  type FactEditionPayload,
  type FactGroup,
  type FactGroupPayload,
  type FactItem,
  type FactItemPayload,
} from "@/lib/api/about-content";
import { AboutWorkflowActions } from "./about-workflow-actions";

const EDITIONS_KEY = ["about-content", "fact-editions"] as const;
const EVERGREEN_KEY = ["about-content", "fact-groups", "evergreen"] as const;
const ANNUAL_KEY = ["about-content", "fact-groups", "annual"] as const;

type GroupEditorState = { record: FactGroup | null; kind: "evergreen" | "annual" } | null;
type ItemEditorState = { record: FactItem | null; group: FactGroup; kind: "evergreen" | "annual" } | null;

function nullable(value: unknown) {
  const clean = String(value ?? "").trim();
  return clean ? clean : null;
}

function editionDefaults(record?: FactEdition | null): Partial<FactEditionPayload> {
  return {
    reporting_year: record?.reporting_year ?? new Date().getFullYear(),
    title: record?.title ?? "",
    introduction: record?.introduction ?? "",
    methodology_note: record?.methodology_note ?? "",
    verified_on: record?.verified_on ?? "",
    source_document_id: record?.source_document_id ?? "",
    is_current: record?.is_current ?? false,
    is_enabled: record?.is_enabled ?? true,
  };
}

function groupDefaults(record?: FactGroup | null): Partial<FactGroupPayload> {
  return {
    fact_edition_id: record?.fact_edition_id ?? null,
    slug: record?.slug ?? "",
    heading: record?.heading ?? "",
    summary: record?.summary ?? "",
    image_id: record?.image_id ?? "",
    image_alt_text: record?.image_alt_text ?? "",
    display_order: record?.display_order ?? 100,
    is_enabled: record?.is_enabled ?? true,
  };
}

function itemDefaults(record?: FactItem | null, group?: FactGroup, kind: "evergreen" | "annual" = "annual"): Partial<FactItemPayload> {
  return {
    fact_group_id: record?.fact_group_id ?? group?.id ?? "",
    fact_kind: record?.fact_kind ?? kind,
    label: record?.label ?? "",
    display_value: record?.display_value ?? "",
    numeric_value: record?.numeric_value ?? "",
    prefix: record?.prefix ?? "",
    suffix: record?.suffix ?? "",
    unit: record?.unit ?? "",
    explanation: record?.explanation ?? "",
    icon_key: record?.icon_key ?? "",
    link_url: record?.link_url ?? "",
    link_label: record?.link_label ?? "",
    source_title: record?.source_title ?? "",
    source_url: record?.source_url ?? "",
    verified_on: record?.verified_on ?? "",
    display_order: record?.display_order ?? 100,
    is_featured: record?.is_featured ?? false,
    is_enabled: record?.is_enabled ?? true,
  };
}

export function NumbersFactsWorkspace() {
  const queryClient = useQueryClient();
  const { hasAnyPermission } = usePermissions();
  const canManage = hasAnyPermission(["about.manage", "admin:*"]);
  const [selectedEditionId, setSelectedEditionId] = useState<string | null>(null);
  const [editionEditor, setEditionEditor] = useState<FactEdition | "new" | null>(null);
  const [cloneSource, setCloneSource] = useState<FactEdition | null>(null);
  const [groupEditor, setGroupEditor] = useState<GroupEditorState>(null);
  const [itemEditor, setItemEditor] = useState<ItemEditorState>(null);

  const editionsQuery = useQuery({ queryKey: EDITIONS_KEY, queryFn: () => factEditionsApi.list() });
  const editions = useMemo(
    () => [...(editionsQuery.data?.data ?? [])].sort((a, b) => b.reporting_year - a.reporting_year),
    [editionsQuery.data?.data],
  );

  useEffect(() => {
    if (selectedEditionId || editions.length === 0) return;
    setSelectedEditionId((editions.find((edition) => edition.is_current) ?? editions[0]).id);
  }, [editions, selectedEditionId]);

  const selectedEdition = editions.find((edition) => edition.id === selectedEditionId) ?? null;
  const evergreenQuery = useQuery({ queryKey: EVERGREEN_KEY, queryFn: () => factGroupsApi.listEvergreen() });
  const annualQuery = useQuery({
    queryKey: [...ANNUAL_KEY, selectedEditionId],
    queryFn: () => factGroupsApi.listForEdition(selectedEditionId!),
    enabled: Boolean(selectedEditionId),
  });

  const evergreenGroups = useMemo(() => [...(evergreenQuery.data?.data ?? [])].sort((a, b) => a.display_order - b.display_order), [evergreenQuery.data?.data]);
  const annualGroups = useMemo(() => [...(annualQuery.data?.data ?? [])].sort((a, b) => a.display_order - b.display_order), [annualQuery.data?.data]);

  const refreshEditions = async () => queryClient.invalidateQueries({ queryKey: EDITIONS_KEY });
  const refreshGroups = async () => Promise.all([
    queryClient.invalidateQueries({ queryKey: EVERGREEN_KEY }),
    queryClient.invalidateQueries({ queryKey: ANNUAL_KEY }),
  ]);

  return (
    <PageTransition>
      <section className="mb-5 overflow-hidden rounded-2xl border bg-[radial-gradient(circle_at_top_right,rgba(217,119,6,0.18),transparent_32%),linear-gradient(135deg,rgba(255,255,255,0.98),rgba(248,250,252,0.88))] p-4 shadow-sm dark:bg-[radial-gradient(circle_at_top_right,rgba(245,158,11,0.14),transparent_32%),linear-gradient(135deg,rgba(15,23,42,0.98),rgba(2,6,23,0.9))]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border bg-background/75 px-2.5 py-0.5 text-xs font-medium text-muted-foreground"><BarChart3 className="size-3.5 text-amber-600" />Verified institutional reporting</div>
            <h1 className="mt-2 text-xl font-semibold tracking-tight md:text-2xl">KSU Numbers & Facts</h1>
            <p className="mt-1 text-sm leading-5 text-muted-foreground">Evergreen identity remains stable across editions. Annual figures stay attached to the reporting year that verified them.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline"><Link href="/about/numbers-and-facts" target="_blank">Public preview <ExternalLink className="size-4" /></Link></Button>
            {canManage ? <Button type="button" onClick={() => setEditionEditor("new")}><Plus className="size-4" />New edition</Button> : null}
          </div>
        </div>
      </section>

      {!canManage ? <Alert className="mb-6"><AlertTitle>Read-only workspace</AlertTitle><AlertDescription>Your account needs the About content management scope to change facts.</AlertDescription></Alert> : null}

      <div className="grid gap-6 xl:grid-cols-[19rem_minmax(0,1fr)]">
        <Card className="h-fit">
          <CardHeader><CardTitle>Reporting editions</CardTitle><CardDescription>Select a year to manage its annual groups.</CardDescription></CardHeader>
          <CardContent className="space-y-3">
            {editionsQuery.isLoading ? <StateMessage label="Loading editions..." /> : null}
            {editionsQuery.isError ? <StateMessage label="Editions could not be loaded." tone="error" /> : null}
            {editions.map((edition) => (
              <button
                type="button"
                key={edition.id}
                onClick={() => setSelectedEditionId(edition.id)}
                className={`w-full rounded-2xl border p-4 text-left transition-colors ${edition.id === selectedEditionId ? "border-primary bg-primary/5" : "hover:border-primary/40"}`}
              >
                <div className="flex items-start justify-between gap-3"><span className="text-xl font-semibold">{edition.reporting_year}</span>{edition.is_current ? <Badge>Current</Badge> : null}</div>
                <p className="mt-2 line-clamp-2 text-sm font-medium">{edition.title}</p>
                <div className="mt-3 flex flex-wrap gap-2"><WorkflowBadge status={edition.workflow_status} />{!edition.is_enabled ? <Badge variant="outline">Disabled</Badge> : null}</div>
              </button>
            ))}
          </CardContent>
        </Card>

        <div className="min-w-0 space-y-5">
          {selectedEdition ? (
            <EditionSummary
              edition={selectedEdition}
              canManage={canManage}
              onEdit={() => setEditionEditor(selectedEdition)}
              onClone={() => setCloneSource(selectedEdition)}
              onChanged={refreshEditions}
            />
          ) : <StateMessage label="Create or select a reporting edition to begin." />}

          <Tabs defaultValue="annual" className="space-y-4">
            <TabsList className="h-auto w-full justify-start overflow-x-auto p-1 sm:w-fit">
              <TabsTrigger value="annual"><CalendarDays className="mr-2 size-4" />Annual · {selectedEdition?.reporting_year ?? "—"}<Badge variant="secondary" className="ml-2">{annualGroups.length}</Badge></TabsTrigger>
              <TabsTrigger value="evergreen"><Layers3 className="mr-2 size-4" />Evergreen<Badge variant="secondary" className="ml-2">{evergreenGroups.length}</Badge></TabsTrigger>
            </TabsList>

            <TabsContent value="annual">
              <GroupCollection
                title={selectedEdition ? `${selectedEdition.reporting_year} annual groups` : "Annual groups"}
                description="Figures and context that belong only to the selected reporting edition."
                kind="annual"
                groups={annualGroups}
                loading={annualQuery.isLoading}
                canManage={canManage && Boolean(selectedEdition)}
                onAdd={() => setGroupEditor({ record: null, kind: "annual" })}
                onEdit={(record) => setGroupEditor({ record, kind: "annual" })}
                onAddItem={(group) => setItemEditor({ record: null, group, kind: "annual" })}
                onEditItem={(record, group) => setItemEditor({ record, group, kind: "annual" })}
                onChanged={refreshGroups}
              />
            </TabsContent>
            <TabsContent value="evergreen">
              <GroupCollection
                title="Evergreen institutional facts"
                description="Stable facts automatically composed into every published reporting edition."
                kind="evergreen"
                groups={evergreenGroups}
                loading={evergreenQuery.isLoading}
                canManage={canManage}
                onAdd={() => setGroupEditor({ record: null, kind: "evergreen" })}
                onEdit={(record) => setGroupEditor({ record, kind: "evergreen" })}
                onAddItem={(group) => setItemEditor({ record: null, group, kind: "evergreen" })}
                onEditItem={(record, group) => setItemEditor({ record, group, kind: "evergreen" })}
                onChanged={refreshGroups}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <EditionEditorDialog record={editionEditor} onOpenChange={(open) => !open && setEditionEditor(null)} onSaved={async () => { setEditionEditor(null); await refreshEditions(); }} />
      <CloneEditionDialog source={cloneSource} onOpenChange={(open) => !open && setCloneSource(null)} onCloned={async (id) => { setCloneSource(null); setSelectedEditionId(id); await refreshEditions(); }} />
      <GroupEditorDialog state={groupEditor} editionId={selectedEditionId} onOpenChange={(open) => !open && setGroupEditor(null)} onSaved={async () => { setGroupEditor(null); await refreshGroups(); }} />
      <ItemEditorDialog state={itemEditor} onOpenChange={(open) => !open && setItemEditor(null)} onSaved={async (groupId) => { setItemEditor(null); await queryClient.invalidateQueries({ queryKey: ["about-content", "fact-items", groupId] }); }} />
    </PageTransition>
  );
}

function EditionSummary({ edition, canManage, onEdit, onClone, onChanged }: { edition: FactEdition; canManage: boolean; onEdit: () => void; onClone: () => void; onChanged: () => Promise<void> }) {
  return (
    <Card>
      <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div><div className="flex flex-wrap items-center gap-2"><CardTitle>{edition.title}</CardTitle><WorkflowBadge status={edition.workflow_status} />{edition.is_current ? <Badge>Current edition</Badge> : null}</div><CardDescription className="mt-2">Verified {edition.verified_on || "date not supplied"}</CardDescription></div>
        <div className="flex flex-wrap gap-2">
          {canManage ? <Button type="button" variant="outline" onClick={onEdit}><Pencil className="size-4" />Edit</Button> : null}
          {canManage ? <Button type="button" variant="outline" onClick={onClone}><Copy className="size-4" />Clone year</Button> : null}
          <AboutWorkflowActions kind="edition" id={edition.id} status={edition.workflow_status} onCompleted={onChanged} />
        </div>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl bg-muted/40 p-4"><p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Introduction</p><p className="mt-2 text-sm leading-6">{edition.introduction || "No introduction supplied."}</p></div>
        <div className="rounded-xl bg-muted/40 p-4"><p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Methodology</p><p className="mt-2 text-sm leading-6">{edition.methodology_note || "No methodology note supplied."}</p></div>
      </CardContent>
    </Card>
  );
}

function GroupCollection({ title, description, kind, groups, loading, canManage, onAdd, onEdit, onAddItem, onEditItem, onChanged }: { title: string; description: string; kind: "evergreen" | "annual"; groups: FactGroup[]; loading: boolean; canManage: boolean; onAdd: () => void; onEdit: (record: FactGroup) => void; onAddItem: (group: FactGroup) => void; onEditItem: (record: FactItem, group: FactGroup) => void; onChanged: () => Promise<unknown> }) {
  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div><CardTitle>{title}</CardTitle><CardDescription>{description}</CardDescription></div>{canManage ? <Button type="button" onClick={onAdd}><Plus className="size-4" />Add group</Button> : null}</CardHeader>
      <CardContent className="space-y-4">
        {loading ? <StateMessage label="Loading fact groups..." /> : null}
        {!loading && groups.length === 0 ? <StateMessage label={`No ${kind} groups have been created.`} /> : null}
        {groups.map((group) => <FactGroupCard key={group.id} group={group} kind={kind} canManage={canManage} onEdit={() => onEdit(group)} onAddItem={() => onAddItem(group)} onEditItem={(item) => onEditItem(item, group)} onChanged={onChanged} />)}
      </CardContent>
    </Card>
  );
}

function FactGroupCard({ group, kind, canManage, onEdit, onAddItem, onEditItem, onChanged }: { group: FactGroup; kind: "evergreen" | "annual"; canManage: boolean; onEdit: () => void; onAddItem: () => void; onEditItem: (record: FactItem) => void; onChanged: () => Promise<unknown> }) {
  const queryClient = useQueryClient();
  const itemsKey = ["about-content", "fact-items", group.id] as const;
  const itemsQuery = useQuery({ queryKey: itemsKey, queryFn: () => factItemsApi.list(group.id) });
  const items = useMemo(() => [...(itemsQuery.data?.data ?? [])].sort((a, b) => a.display_order - b.display_order), [itemsQuery.data?.data]);
  const deleteGroup = useMutation({ mutationFn: () => factGroupsApi.delete(group.id), onSuccess: async () => { toast.success("Fact group deleted"); await onChanged(); }, onError: () => toast.error("Published groups must be unpublished before deletion") });

  const refresh = async () => { await Promise.all([queryClient.invalidateQueries({ queryKey: itemsKey }), onChanged()]); };

  return (
    <section className="overflow-hidden rounded-2xl border">
      <div className="flex flex-col gap-3 border-b bg-muted/25 p-4 sm:flex-row sm:items-start sm:justify-between">
        <div><div className="flex flex-wrap items-center gap-2"><h3 className="font-semibold">{group.heading}</h3><Badge variant="outline">{kind}</Badge><WorkflowBadge status={group.workflow_status} /></div><p className="mt-1 text-sm text-muted-foreground">{group.summary || `Order ${group.display_order}`}</p></div>
        <div className="flex flex-wrap gap-2">{canManage ? <Button type="button" size="sm" variant="outline" onClick={onEdit}><Pencil className="size-4" />Edit group</Button> : null}{canManage ? <Button type="button" size="sm" variant="outline" onClick={onAddItem}><Plus className="size-4" />Add fact</Button> : null}<AboutWorkflowActions kind="group" id={group.id} status={group.workflow_status} compact onCompleted={refresh} />{canManage ? <Button type="button" size="icon" variant="ghost" aria-label={`Delete ${group.heading}`} disabled={group.workflow_status === "published" || deleteGroup.isPending} onClick={() => { if (window.confirm(`Delete ${group.heading}?`)) deleteGroup.mutate(); }}><Trash2 className="size-4" /></Button> : null}</div>
      </div>
      <div className="divide-y">
        {itemsQuery.isLoading ? <StateMessage label="Loading facts..." /> : null}
        {!itemsQuery.isLoading && items.length === 0 ? <p className="p-4 text-sm text-muted-foreground">No facts in this group.</p> : null}
        {items.map((item) => <FactItemRow key={item.id} item={item} canManage={canManage} onEdit={() => onEditItem(item)} onChanged={refresh} />)}
      </div>
    </section>
  );
}

function FactItemRow({ item, canManage, onEdit, onChanged }: { item: FactItem; canManage: boolean; onEdit: () => void; onChanged: () => Promise<void> }) {
  const deleteItem = useMutation({ mutationFn: () => factItemsApi.delete(item.id), onSuccess: async () => { toast.success("Fact deleted"); await onChanged(); }, onError: () => toast.error("Published facts must be unpublished before deletion") });
  return (
    <div className="grid gap-3 p-4 md:grid-cols-[minmax(0,1fr)_minmax(10rem,0.45fr)_auto] md:items-center">
      <div><div className="flex flex-wrap items-center gap-2"><p className="font-medium">{item.label}</p><WorkflowBadge status={item.workflow_status} />{item.is_featured ? <Badge variant="secondary">Featured</Badge> : null}</div><p className="mt-1 text-xs text-muted-foreground">{item.source_title || "Source required before publishing"}{item.verified_on ? ` · verified ${item.verified_on}` : ""}</p></div>
      <p className="text-lg font-semibold text-primary">{item.prefix}{item.display_value}{item.suffix}{item.unit ? ` ${item.unit}` : ""}</p>
      <div className="flex flex-wrap gap-2"><AboutWorkflowActions kind="item" id={item.id} status={item.workflow_status} compact onCompleted={onChanged} />{canManage ? <Button type="button" size="icon" variant="outline" aria-label={`Edit ${item.label}`} onClick={onEdit}><Pencil className="size-4" /></Button> : null}{canManage ? <Button type="button" size="icon" variant="ghost" aria-label={`Delete ${item.label}`} disabled={item.workflow_status === "published" || deleteItem.isPending} onClick={() => { if (window.confirm(`Delete ${item.label}?`)) deleteItem.mutate(); }}><Trash2 className="size-4" /></Button> : null}</div>
    </div>
  );
}

function EditionEditorDialog({ record, onOpenChange, onSaved }: { record: FactEdition | "new" | null; onOpenChange: (open: boolean) => void; onSaved: () => Promise<void> }) {
  const editing = record && record !== "new" ? record : null;
  const [values, setValues] = useState<Partial<FactEditionPayload>>(() => editionDefaults());
  useEffect(() => { if (record) setValues(editionDefaults(editing)); }, [editing, record]);
  const mutation = useMutation({
    mutationFn: () => {
      const payload: FactEditionPayload = { reporting_year: Number(values.reporting_year), title: String(values.title ?? "").trim(), introduction: nullable(values.introduction), methodology_note: nullable(values.methodology_note), verified_on: nullable(values.verified_on), source_document_id: nullable(values.source_document_id), is_current: values.is_current ?? false, is_enabled: values.is_enabled ?? true };
      if (!payload.title) throw new Error("Title required");
      if (editing) { const { reporting_year: _year, ...update } = payload; return factEditionsApi.update(editing.id, update); }
      return factEditionsApi.create(payload);
    },
    onSuccess: async () => { toast.success(editing ? "Edition updated" : "Edition created"); await onSaved(); },
    onError: () => toast.error("Check the reporting year and edition fields"),
  });
  return <Dialog open={Boolean(record)} onOpenChange={onOpenChange}><DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl"><DialogHeader><DialogTitle>{editing ? "Edit reporting edition" : "Create reporting edition"}</DialogTitle><DialogDescription>Edition metadata establishes the reporting context for annual facts.</DialogDescription></DialogHeader><div className="grid gap-4 sm:grid-cols-2"><TextField label="Reporting year" type="number" value={values.reporting_year} disabled={Boolean(editing)} onChange={(value) => setValues((current) => ({ ...current, reporting_year: Number(value) }))} /><TextField label="Verification date" type="date" value={values.verified_on} onChange={(value) => setValues((current) => ({ ...current, verified_on: value }))} /></div><TextField label="Title" value={values.title} onChange={(value) => setValues((current) => ({ ...current, title: value }))} /><AreaField label="Introduction" rows={5} value={values.introduction} onChange={(value) => setValues((current) => ({ ...current, introduction: value }))} /><AreaField label="Methodology note" rows={5} value={values.methodology_note} onChange={(value) => setValues((current) => ({ ...current, methodology_note: value }))} /><TextField label="Source document ID" value={values.source_document_id} onChange={(value) => setValues((current) => ({ ...current, source_document_id: value }))} placeholder="Optional document UUID" /><div className="grid gap-3 sm:grid-cols-2"><ToggleField label="Current edition" checked={values.is_current ?? false} onChange={(checked) => setValues((current) => ({ ...current, is_current: checked }))} /><ToggleField label="Enabled" checked={values.is_enabled ?? true} onChange={(checked) => setValues((current) => ({ ...current, is_enabled: checked }))} /></div><DialogFooter><Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button><Button type="button" disabled={mutation.isPending} onClick={() => mutation.mutate()}>{mutation.isPending ? "Saving..." : "Save edition"}</Button></DialogFooter></DialogContent></Dialog>;
}

function CloneEditionDialog({ source, onOpenChange, onCloned }: { source: FactEdition | null; onOpenChange: (open: boolean) => void; onCloned: (id: string) => Promise<void> }) {
  const [year, setYear] = useState(new Date().getFullYear() + 1);
  useEffect(() => { if (source) setYear(source.reporting_year + 1); }, [source]);
  const mutation = useMutation({ mutationFn: () => factEditionsApi.clone(source!.id, year), onSuccess: async (response) => { toast.success(`Created ${year} draft from ${source?.reporting_year}`); await onCloned(response.data.id); }, onError: () => toast.error("That reporting year may already exist") });
  return <Dialog open={Boolean(source)} onOpenChange={onOpenChange}><DialogContent><DialogHeader><DialogTitle>Clone reporting edition</DialogTitle><DialogDescription>Annual groups and facts are copied into a new draft. Evergreen groups remain shared.</DialogDescription></DialogHeader><TextField label="New reporting year" type="number" value={year} onChange={(value) => setYear(Number(value))} /><DialogFooter><Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button><Button type="button" disabled={mutation.isPending} onClick={() => mutation.mutate()}>{mutation.isPending ? "Cloning..." : "Clone edition"}</Button></DialogFooter></DialogContent></Dialog>;
}

function GroupEditorDialog({ state, editionId, onOpenChange, onSaved }: { state: GroupEditorState; editionId: string | null; onOpenChange: (open: boolean) => void; onSaved: () => Promise<void> }) {
  const [values, setValues] = useState<Partial<FactGroupPayload>>(() => groupDefaults());
  useEffect(() => { if (state) setValues(groupDefaults(state.record)); }, [state]);
  const mutation = useMutation({
    mutationFn: () => {
      if (!state) throw new Error("Group scope missing");
      const payload: FactGroupPayload = { fact_edition_id: state.kind === "annual" ? editionId : null, slug: String(values.slug ?? "").trim(), heading: String(values.heading ?? "").trim(), summary: nullable(values.summary), image_id: nullable(values.image_id), image_alt_text: nullable(values.image_alt_text), display_order: Number(values.display_order ?? 100), is_enabled: values.is_enabled ?? true };
      if (!payload.slug || !payload.heading) throw new Error("Group fields required");
      if (state.record) { const { fact_edition_id: _editionId, slug: _slug, ...update } = payload; return factGroupsApi.update(state.record.id, update); }
      return state.kind === "evergreen" ? factGroupsApi.createEvergreen(payload) : factGroupsApi.createForEdition(editionId!, payload);
    },
    onSuccess: async () => { toast.success(state?.record ? "Fact group updated" : "Fact group created"); await onSaved(); },
    onError: () => toast.error("Check the group name, slug and edition"),
  });
  return <Dialog open={Boolean(state)} onOpenChange={onOpenChange}><DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl"><DialogHeader><DialogTitle>{state?.record ? "Edit" : "Add"} {state?.kind} group</DialogTitle><DialogDescription>{state?.kind === "evergreen" ? "This group will appear in every public edition." : "This group belongs only to the selected reporting year."}</DialogDescription></DialogHeader><div className="grid gap-4 sm:grid-cols-2"><TextField label="Slug" value={values.slug} disabled={Boolean(state?.record)} onChange={(value) => setValues((current) => ({ ...current, slug: value }))} /><TextField label="Display order" type="number" value={values.display_order} onChange={(value) => setValues((current) => ({ ...current, display_order: Number(value) }))} /></div><TextField label="Heading" value={values.heading} onChange={(value) => setValues((current) => ({ ...current, heading: value }))} /><AreaField label="Summary" rows={4} value={values.summary} onChange={(value) => setValues((current) => ({ ...current, summary: value }))} /><MediaPicker value={values.image_id ?? ""} onChange={(value) => setValues((current) => ({ ...current, image_id: value }))} mediaType="image" accept="image/*" label="Section image" /><TextField label="Image alt text" value={values.image_alt_text} onChange={(value) => setValues((current) => ({ ...current, image_alt_text: value }))} /><ToggleField label="Enabled" checked={values.is_enabled ?? true} onChange={(checked) => setValues((current) => ({ ...current, is_enabled: checked }))} /><DialogFooter><Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button><Button type="button" disabled={mutation.isPending} onClick={() => mutation.mutate()}>{mutation.isPending ? "Saving..." : "Save group"}</Button></DialogFooter></DialogContent></Dialog>;
}

function ItemEditorDialog({ state, onOpenChange, onSaved }: { state: ItemEditorState; onOpenChange: (open: boolean) => void; onSaved: (groupId: string) => Promise<void> }) {
  const [values, setValues] = useState<Partial<FactItemPayload>>(() => itemDefaults());
  useEffect(() => { if (state) setValues(itemDefaults(state.record, state.group, state.kind)); }, [state]);
  const mutation = useMutation({
    mutationFn: () => {
      if (!state) throw new Error("Fact group missing");
      const numeric = String(values.numeric_value ?? "").trim();
      const payload: FactItemPayload = { fact_group_id: state.group.id, fact_kind: state.kind, label: String(values.label ?? "").trim(), display_value: String(values.display_value ?? "").trim(), numeric_value: numeric ? Number(numeric) : null, prefix: nullable(values.prefix), suffix: nullable(values.suffix), unit: nullable(values.unit), explanation: nullable(values.explanation), icon_key: nullable(values.icon_key), link_url: nullable(values.link_url), link_label: nullable(values.link_label), source_title: nullable(values.source_title), source_url: nullable(values.source_url), verified_on: nullable(values.verified_on), display_order: Number(values.display_order ?? 100), is_featured: values.is_featured ?? false, is_enabled: values.is_enabled ?? true };
      if (!payload.label || !payload.display_value) throw new Error("Fact fields required");
      if (state.record) { const { fact_group_id: _groupId, fact_kind: _kind, ...update } = payload; return factItemsApi.update(state.record.id, update); }
      return factItemsApi.create(state.group.id, payload);
    },
    onSuccess: async () => { toast.success(state?.record ? "Fact updated" : "Fact created"); await onSaved(state!.group.id); },
    onError: () => toast.error("Check the fact value, source and verification fields"),
  });
  return <Dialog open={Boolean(state)} onOpenChange={onOpenChange}><DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl"><DialogHeader><DialogTitle>{state?.record ? "Edit" : "Add"} {state?.kind} fact</DialogTitle><DialogDescription>Display values may be numeric or descriptive. Source and verification are required before publication.</DialogDescription></DialogHeader><div className="grid gap-4 sm:grid-cols-2"><TextField label="Label" value={values.label} onChange={(value) => setValues((current) => ({ ...current, label: value }))} /><TextField label="Display value" value={values.display_value} onChange={(value) => setValues((current) => ({ ...current, display_value: value }))} /></div><div className="grid gap-4 sm:grid-cols-4"><TextField label="Numeric value" type="number" value={values.numeric_value} onChange={(value) => setValues((current) => ({ ...current, numeric_value: value }))} /><TextField label="Prefix" value={values.prefix} onChange={(value) => setValues((current) => ({ ...current, prefix: value }))} /><TextField label="Suffix" value={values.suffix} onChange={(value) => setValues((current) => ({ ...current, suffix: value }))} /><TextField label="Unit" value={values.unit} onChange={(value) => setValues((current) => ({ ...current, unit: value }))} /></div><AreaField label="Explanation" rows={4} value={values.explanation} onChange={(value) => setValues((current) => ({ ...current, explanation: value }))} /><div className="grid gap-4 sm:grid-cols-2"><TextField label="Icon key" value={values.icon_key} onChange={(value) => setValues((current) => ({ ...current, icon_key: value }))} /><TextField label="Display order" type="number" value={values.display_order} onChange={(value) => setValues((current) => ({ ...current, display_order: Number(value) }))} /><TextField label="Link label" value={values.link_label} onChange={(value) => setValues((current) => ({ ...current, link_label: value }))} /><TextField label="Link URL" value={values.link_url} onChange={(value) => setValues((current) => ({ ...current, link_url: value }))} placeholder="https://..." /></div><div className="grid gap-4 sm:grid-cols-2"><TextField label="Source title" value={values.source_title} onChange={(value) => setValues((current) => ({ ...current, source_title: value }))} /><TextField label="Verification date" type="date" value={values.verified_on} onChange={(value) => setValues((current) => ({ ...current, verified_on: value }))} /></div><TextField label="Source URL" value={values.source_url} onChange={(value) => setValues((current) => ({ ...current, source_url: value }))} placeholder="https://..." /><div className="grid gap-3 sm:grid-cols-2"><ToggleField label="Featured" checked={values.is_featured ?? false} onChange={(checked) => setValues((current) => ({ ...current, is_featured: checked }))} /><ToggleField label="Enabled" checked={values.is_enabled ?? true} onChange={(checked) => setValues((current) => ({ ...current, is_enabled: checked }))} /></div><DialogFooter><Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button><Button type="button" disabled={mutation.isPending} onClick={() => mutation.mutate()}>{mutation.isPending ? "Saving..." : "Save fact"}</Button></DialogFooter></DialogContent></Dialog>;
}

function TextField({ label, value, onChange, placeholder, type = "text", disabled = false }: { label: string; value: unknown; onChange: (value: string) => void; placeholder?: string; type?: string; disabled?: boolean }) { return <label className="space-y-2 text-sm font-medium"><span>{label}</span><Input type={type} value={String(value ?? "")} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} disabled={disabled} /></label>; }
function AreaField({ label, value, onChange, rows }: { label: string; value: unknown; onChange: (value: string) => void; rows: number }) { return <label className="space-y-2 text-sm font-medium"><span>{label}</span><Textarea rows={rows} value={String(value ?? "")} onChange={(event) => onChange(event.target.value)} /></label>; }
function ToggleField({ label, checked, onChange }: { label: string; checked: boolean; onChange: (checked: boolean) => void }) { return <label className="flex items-center justify-between rounded-xl border p-3 text-sm font-medium"><span>{label}</span><Switch checked={checked} onCheckedChange={onChange} /></label>; }
function WorkflowBadge({ status }: { status: string }) { return <Badge variant={status === "published" ? "default" : status === "approved" ? "secondary" : "outline"}>{status.replace(/_/g, " ")}</Badge>; }
function StateMessage({ label, tone = "default" }: { label: string; tone?: "default" | "error" }) { return <p className={`rounded-xl border border-dashed p-5 text-center text-sm ${tone === "error" ? "border-destructive/40 text-destructive" : "text-muted-foreground"}`}>{label}</p>; }
