"use client";

import { useMemo, useState } from "react";
import {
  GripVertical,
  Loader2,
  Pencil,
  Plus,
  Save,
  Trash2,
} from "lucide-react";
import { toast } from "@ksu/ui";
import { usePermissions } from "@/hooks/use-permissions";
import {
  heriRequest,
  useHeriResourceMutation,
  useHeriResourceQuery,
  type HeriRecord,
} from "@/lib/api/heri";

type Page = HeriRecord & { slug?: string; title?: string; status?: string };
type Section = HeriRecord & {
  page_id?: string;
  section_type?: string;
  position?: number;
  is_visible?: boolean;
  configuration?: Record<string, unknown>;
  title?: string;
  eyebrow?: string;
  description?: string;
  background_variant?: string;
  image_url?: string;
  cta_label?: string;
  cta_href?: string;
};
type Draft = Partial<Section> & { id?: string };
function parseConfig(value: string) {
  try {
    const parsed = JSON.parse(value);
    if (!parsed || Array.isArray(parsed) || typeof parsed !== "object")
      return null;
    return parsed as Record<string, unknown>;
  } catch {
    return null;
  }
}

export function PageSectionsWorkspace() {
  const { hasPermission, isAdmin } = usePermissions();
  const canWrite = isAdmin || hasPermission("heri.content.write");
  const pagesQuery = useHeriResourceQuery<Page>("pages", {
    page: 1,
    per_page: 100,
  });
  const sectionsQuery = useHeriResourceQuery<Section>("page-sections", {
    page: 1,
    per_page: 100,
  });
  const mutation = useHeriResourceMutation("page-sections");
  const [pageId, setPageId] = useState("");
  const [draft, setDraft] = useState<Draft | null>(null);
  const [configText, setConfigText] = useState("{}");
  const [error, setError] = useState("");
  const [dragged, setDragged] = useState<string | null>(null);
  const pages = pagesQuery.data?.data ?? [];
  const sections = useMemo(
    () =>
      (sectionsQuery.data?.data ?? [])
        .filter((item) => !pageId || String(item.page_id) === pageId)
        .sort((a, b) => Number(a.position ?? 0) - Number(b.position ?? 0)),
    [sectionsQuery.data, pageId],
  );
  const open = (section?: Section) => {
    setError("");
    setDraft(
      section
        ? { ...section }
        : {
            page_id: pageId || pages[0]?.id,
            section_type: "content",
            position: sections.length,
            is_visible: true,
            configuration: {},
          },
    );
    setConfigText(JSON.stringify(section?.configuration ?? {}, null, 2));
  };
  const save = async () => {
    if (!draft || !canWrite) return;
    const configuration = parseConfig(configText);
    if (!draft.page_id) {
      setError("Choose a page.");
      return;
    }
    if (!draft.section_type?.trim()) {
      setError("Section type is required.");
      return;
    }
    if (!configuration) {
      setError("Configuration must be a valid JSON object.");
      return;
    }
    try {
      await mutation.mutateAsync({
        id: draft.id,
        payload: { ...draft, id: undefined, configuration },
      });
      toast.success("Page section saved");
      setDraft(null);
      await sectionsQuery.refetch();
    } catch (reason) {
      toast.error(
        reason instanceof Error
          ? reason.message
          : "Unable to save page section",
      );
    }
  };
  const remove = async (section: Section) => {
    if (!canWrite || !window.confirm("Delete this page section?")) return;
    try {
      await heriRequest(`/admin/page-sections/${section.id}`, {
        method: "DELETE",
      });
      await sectionsQuery.refetch();
      toast.success("Page section deleted");
    } catch {
      toast.error("Unable to delete page section");
    }
  };
  const reorder = async (targetId: string) => {
    if (!dragged || dragged === targetId || !canWrite) return;
    const next = [...sections];
    const from = next.findIndex((item) => item.id === dragged);
    const to = next.findIndex((item) => item.id === targetId);
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    try {
      await Promise.all(
        next.map((item, index) =>
          mutation.mutateAsync({ id: item.id, payload: { position: index } }),
        ),
      );
      toast.success("Section order updated");
      await sectionsQuery.refetch();
    } catch {
      toast.error("Unable to update section order");
    }
    setDragged(null);
  };
  return (
    <main className="space-y-5 p-4 md:p-6">
      <header className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-700">
            HERI Africa administration
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-950">
            Page Sections
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
            Compose structured public pages with ordered sections, validated
            configuration, visibility controls, and human-readable page
            selection.
          </p>
        </div>
        {canWrite && (
          <button
            type="button"
            onClick={() => open()}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white"
          >
            <Plus className="size-4" />
            Add section
          </button>
        )}
      </header>
      <section className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white p-4">
        <label className="text-sm font-medium text-slate-700">
          Page
          <select
            aria-label="Choose page"
            value={pageId}
            onChange={(event) => setPageId(event.target.value)}
            className="ml-3 rounded-lg border border-slate-300 px-3 py-2 font-normal"
          >
            <option value="">All pages</option>
            {pages.map((page) => (
              <option key={page.id} value={String(page.id)}>
                {page.title || page.slug} · {page.status}
              </option>
            ))}
          </select>
        </label>
        <span className="text-sm text-slate-500">
          {sections.length} section{sections.length === 1 ? "" : "s"}
        </span>
      </section>
      <section className="space-y-3">
        {sections.map((section) => (
          <article
            key={section.id}
            draggable={canWrite}
            onDragStart={() => setDragged(String(section.id))}
            onDragOver={(event) => event.preventDefault()}
            onDrop={() => void reorder(String(section.id))}
            className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <GripVertical className="size-5 shrink-0 cursor-grab text-slate-400" />
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-sm font-bold text-emerald-800">
              {Number(section.position ?? 0) + 1}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-semibold text-slate-900">
                  {section.section_type || "Unnamed section"}
                </span>
                {section.is_visible ? (
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-800">
                    Visible
                  </span>
                ) : (
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500">
                    Hidden
                  </span>
                )}
              </div>
              <p className="mt-1 line-clamp-1 text-xs text-slate-500">
                {JSON.stringify(section.configuration ?? {})}
              </p>
            </div>
            {canWrite && (
              <div className="flex gap-1">
                <button
                  type="button"
                  aria-label="Edit section"
                  onClick={() => open(section)}
                  className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                >
                  <Pencil className="size-4" />
                </button>
                <button
                  type="button"
                  aria-label="Delete section"
                  onClick={() => void remove(section)}
                  className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            )}
          </article>
        ))}
        {!sectionsQuery.isLoading && sections.length === 0 && (
          <p className="rounded-xl border bg-white p-6 text-sm text-slate-500">
            No sections for this page.
          </p>
        )}
      </section>
      {draft && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/40 p-4 md:p-10">
          <form
            onSubmit={(event) => {
              event.preventDefault();
              void save();
            }}
            className="mx-auto grid max-w-5xl gap-5 lg:grid-cols-[1fr_.8fr]"
          >
            <div className="rounded-2xl bg-white p-6 shadow-xl">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">
                  {draft.id ? "Edit" : "Add"} page section
                </h2>
                <button
                  type="button"
                  onClick={() => setDraft(null)}
                  className="text-2xl text-slate-400"
                >
                  ×
                </button>
              </div>
              <div className="mt-5 grid gap-4">
                <label className="text-sm font-medium text-slate-700">
                  Page
                  <select
                    value={String(draft.page_id ?? "")}
                    onChange={(event) =>
                      setDraft({ ...draft, page_id: event.target.value })
                    }
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 font-normal"
                  >
                    <option value="">Choose a page…</option>
                    {pages.map((page) => (
                      <option key={page.id} value={String(page.id)}>
                        {page.title || page.slug}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="text-sm font-medium text-slate-700">
                  Section type
                  <select
                    required
                    value={String(draft.section_type ?? "")}
                    onChange={(event) =>
                      setDraft({ ...draft, section_type: event.target.value })
                    }
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 font-normal"
                  >
                    {[
                      "chair_intro", "vision_mission", "values", "research_focus", "research_approach", "key_activities", "impact_metrics", "featured_research", "featured_news", "featured_events", "featured_opportunities", "team_spotlight", "partner_strip", "partner_map", "newsletter_cta", "contact_cta",
                    ].map((type) => <option key={type} value={type}>{type.replaceAll("_", " ")}</option>)}
                  </select>
                </label>
                <div className="grid gap-4 sm:grid-cols-2">
                  {(["eyebrow", "title", "description", "background_variant", "image_url", "cta_label", "cta_href"] as const).map((field) => (
                    <label key={field} className={`text-sm font-medium text-slate-700 ${field === "description" ? "sm:col-span-2" : ""}`}>
                      {field.replaceAll("_", " ")}
                      {field === "description" ? <textarea value={String(draft[field] ?? "")} onChange={(event) => setDraft({ ...draft, [field]: event.target.value })} rows={3} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 font-normal" /> : <input value={String(draft[field] ?? "")} onChange={(event) => setDraft({ ...draft, [field]: event.target.value })} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 font-normal" />}
                    </label>
                  ))}
                </div>
                <label className="text-sm font-medium text-slate-700">
                  Configuration JSON
                  <textarea
                    required
                    value={configText}
                    onChange={(event) => setConfigText(event.target.value)}
                    rows={14}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-xs"
                  />
                </label>
                {error && <p className="text-sm text-red-600">{error}</p>}
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={Boolean(draft.is_visible)}
                    onChange={(event) =>
                      setDraft({ ...draft, is_visible: event.target.checked })
                    }
                  />{" "}
                  Visible on public page
                </label>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setDraft(null)}
                  className="rounded-lg border px-4 py-2 text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={mutation.isPending}
                  className="inline-flex items-center gap-2 rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                >
                  {mutation.isPending ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Save className="size-4" />
                  )}
                  Save section
                </button>
              </div>
            </div>
            <aside className="rounded-2xl bg-white p-6 shadow-xl">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">
                Configuration preview
              </p>
              <pre className="mt-4 max-h-[520px] overflow-auto whitespace-pre-wrap rounded-xl bg-slate-950 p-4 text-xs leading-6 text-emerald-200">
                {JSON.stringify(
                  parseConfig(configText) ?? { invalid: "JSON" },
                  null,
                  2,
                )}
              </pre>
            </aside>
          </form>
        </div>
      )}
    </main>
  );
}
