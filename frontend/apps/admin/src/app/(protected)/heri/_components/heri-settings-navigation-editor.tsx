"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  Loader2,
  Pencil,
  Plus,
  Save,
  Trash2,
} from "lucide-react";
import { toast } from "@ksu/ui";
import {
  heriRequest,
  useHeriResourceMutation,
  useHeriResourceQuery,
} from "@/lib/api/heri";
import type { HeriRecord } from "@/lib/api/heri";

type NavigationItem = {
  id: string;
  label: string;
  href: string;
  position: number;
  is_visible: boolean;
};

const blankItem: Omit<NavigationItem, "id"> = {
  label: "",
  href: "",
  position: 0,
  is_visible: true,
};

export function HeriSettingsNavigationEditor() {
  const query = useHeriResourceQuery<HeriRecord>("navigation", {
    page: 1,
    per_page: 100,
  });
  const mutation = useHeriResourceMutation("navigation");
  const [items, setItems] = useState<NavigationItem[]>([]);
  const [draft, setDraft] = useState<Omit<NavigationItem, "id">>(blankItem);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (query.data) {
      setItems(
        [...(query.data.data as NavigationItem[])].sort(
          (a, b) => a.position - b.position,
        ),
      );
    }
  }, [query.data]);

  const loading = query.isPending || query.isFetching;
  const hasChanges = useMemo(
    () => items.some((item, index) => item.position !== index),
    [items],
  );

  const resetDraft = () => {
    setDraft(blankItem);
    setEditingId(null);
  };

  const edit = (item: NavigationItem) => {
    setEditingId(item.id);
    setDraft({
      label: item.label,
      href: item.href,
      position: item.position,
      is_visible: item.is_visible,
    });
  };

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!draft.label.trim() || !draft.href.trim()) {
      toast.error("Label and destination are required");
      return;
    }
    setSaving(true);
    try {
      await mutation.mutateAsync({
        id: editingId ?? undefined,
        payload: {
          ...draft,
          label: draft.label.trim(),
          href: draft.href.trim(),
          position: editingId ? draft.position : items.length,
        },
      });
      toast.success(
        editingId ? "Navigation item updated" : "Navigation item added",
      );
      resetDraft();
      await query.refetch();
    } catch (reason) {
      toast.error(
        reason instanceof Error
          ? reason.message
          : "Unable to save navigation item",
      );
    } finally {
      setSaving(false);
    }
  };

  const remove = async (item: NavigationItem) => {
    if (!window.confirm(`Remove “${item.label}” from navigation?`)) return;
    try {
      await heriRequest(`/admin/navigation/${item.id}`, { method: "DELETE" });
      toast.success("Navigation item removed");
      await query.refetch();
    } catch (reason) {
      toast.error(
        reason instanceof Error
          ? reason.message
          : "Unable to remove navigation item",
      );
    }
  };

  const move = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= items.length) return;
    setItems((current) => {
      const next = [...current];
      [next[index], next[target]] = [next[target], next[index]];
      return next.map((item, position) => ({ ...item, position }));
    });
  };

  const saveOrder = async () => {
    setSaving(true);
    try {
      await Promise.all(
        items.map((item) =>
          mutation.mutateAsync({
            id: item.id,
            payload: { position: item.position },
          }),
        ),
      );
      toast.success("Navigation order saved");
      await query.refetch();
    } catch (reason) {
      toast.error(
        reason instanceof Error
          ? reason.message
          : "Unable to save navigation order",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-emerald-700">
            Navigation editor
          </p>
          <h2 className="mt-1 text-2xl font-semibold text-slate-950">
            Public site navigation
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            Control visible links and their order in the HERI Africa public
            header. Changes are audited through the admin API.
          </p>
        </div>
        <button
          type="button"
          onClick={saveOrder}
          disabled={!hasChanges || saving}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-emerald-300 px-3 py-2 text-sm font-semibold text-emerald-800 hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {saving ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Save className="size-4" />
          )}
          Save order
        </button>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
        <div className="overflow-hidden rounded-xl border border-slate-200">
          <div className="border-b border-slate-200 bg-slate-50 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Menu items
          </div>
          {loading ? (
            <div className="flex items-center justify-center gap-2 px-4 py-10 text-sm text-slate-500">
              <Loader2 className="size-4 animate-spin" /> Loading navigation…
            </div>
          ) : items.length === 0 ? (
            <p className="px-4 py-10 text-center text-sm text-slate-500">
              No navigation items yet.
            </p>
          ) : (
            <ol className="divide-y divide-slate-100">
              {items.map((item, index) => (
                <li key={item.id} className="flex items-center gap-3 px-4 py-3">
                  <span className="w-6 text-center text-xs font-semibold text-slate-400">
                    {index + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-slate-900">
                      {item.label}
                    </p>
                    <p className="truncate text-xs text-slate-500">
                      {item.href}
                    </p>
                  </div>
                  <span
                    className={`hidden rounded-full px-2 py-1 text-[11px] font-semibold sm:inline-flex ${item.is_visible ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-500"}`}
                  >
                    {item.is_visible ? "Visible" : "Hidden"}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      aria-label={`Move ${item.label} up`}
                      onClick={() => move(index, -1)}
                      disabled={index === 0}
                      className="rounded p-1.5 text-slate-500 hover:bg-slate-100 disabled:opacity-30"
                    >
                      <ArrowUp className="size-4" />
                    </button>
                    <button
                      type="button"
                      aria-label={`Move ${item.label} down`}
                      onClick={() => move(index, 1)}
                      disabled={index === items.length - 1}
                      className="rounded p-1.5 text-slate-500 hover:bg-slate-100 disabled:opacity-30"
                    >
                      <ArrowDown className="size-4" />
                    </button>
                    <button
                      type="button"
                      aria-label={`Edit ${item.label}`}
                      onClick={() => edit(item)}
                      className="rounded p-1.5 text-emerald-700 hover:bg-emerald-50"
                    >
                      <Pencil className="size-4" />
                    </button>
                    <button
                      type="button"
                      aria-label={`Remove ${item.label}`}
                      onClick={() => void remove(item)}
                      className="rounded p-1.5 text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </div>

        <form
          onSubmit={submit}
          className="rounded-xl border border-slate-200 bg-slate-50 p-4"
        >
          <div className="flex items-center justify-between gap-3">
            <h3 className="font-semibold text-slate-900">
              {editingId ? "Edit menu item" : "Add menu item"}
            </h3>
            {editingId && (
              <button
                type="button"
                onClick={resetDraft}
                className="text-xs font-semibold text-slate-600 hover:text-slate-900"
              >
                Cancel
              </button>
            )}
          </div>
          <div className="mt-4 space-y-4">
            <label className="block text-sm font-medium text-slate-700">
              Label
              <input
                value={draft.label}
                onChange={(event) =>
                  setDraft({ ...draft, label: event.target.value })
                }
                required
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-normal outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                placeholder="About HERI Africa"
              />
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Destination
              <input
                value={draft.href}
                onChange={(event) =>
                  setDraft({ ...draft, href: event.target.value })
                }
                required
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-normal outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                placeholder="/about"
              />
            </label>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <input
                type="checkbox"
                checked={draft.is_visible}
                onChange={(event) =>
                  setDraft({ ...draft, is_visible: event.target.checked })
                }
                className="size-4 rounded border-slate-300 text-emerald-700"
              />{" "}
              Visible on public site
            </label>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="size-4 animate-spin" />
              ) : editingId ? (
                <Save className="size-4" />
              ) : (
                <Plus className="size-4" />
              )}
              {editingId ? "Save item" : "Add item"}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
