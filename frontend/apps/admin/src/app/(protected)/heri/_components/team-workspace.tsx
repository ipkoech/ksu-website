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
import { HeriMediaPicker } from "./heri-media-picker";

type Member = HeriRecord & {
  slug?: string;
  name?: string;
  role?: string;
  biography?: string;
  photo_url?: string;
  is_active?: boolean;
  position?: number;
};
type Draft = Partial<Member> & { id?: string };
function validate(draft: Draft) {
  const errors: Record<string, string> = {};
  if (!String(draft.name ?? "").trim()) errors.name = "Name is required.";
  if (!String(draft.role ?? "").trim()) errors.role = "Role is required.";
  const slug = String(draft.slug ?? "");
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug))
    errors.slug = "Use a lowercase hyphenated slug.";
  if (!String(draft.biography ?? "").trim())
    errors.biography = "Biography is required.";
  return errors;
}

export function TeamWorkspace() {
  const { hasPermission, isAdmin } = usePermissions();
  const canWrite = isAdmin || hasPermission("heri.content.write");
  const query = useHeriResourceQuery<Member>("team", {
    page: 1,
    per_page: 100,
  });
  const mutation = useHeriResourceMutation("team");
  const [draft, setDraft] = useState<Draft | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [dragged, setDragged] = useState<string | null>(null);
  const members = useMemo(
    () =>
      [...(query.data?.data ?? [])].sort(
        (a, b) => Number(a.position ?? 0) - Number(b.position ?? 0),
      ),
    [query.data],
  );
  const open = (member?: Member) => {
    setErrors({});
    setDraft(
      member
        ? { ...member }
        : {
            name: "",
            slug: "",
            role: "",
            biography: "",
            photo_url: "",
            position: members.length,
            is_active: true,
          },
    );
  };
  const save = async () => {
    if (!draft || !canWrite) return;
    const next = validate(draft);
    setErrors(next);
    if (Object.keys(next).length) return;
    try {
      await mutation.mutateAsync({
        id: draft.id,
        payload: { ...draft, id: undefined },
      });
      toast.success(draft.id ? "Team member updated" : "Team member created");
      setDraft(null);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to save team member",
      );
    }
  };
  const remove = async (member: Member) => {
    if (
      !canWrite ||
      !window.confirm(`Delete “${member.name ?? "team member"}”?`)
    )
      return;
    try {
      await heriRequest(`/admin/team/${member.id}`, { method: "DELETE" });
      await query.refetch();
      toast.success("Team member deleted");
    } catch {
      toast.error("Unable to delete team member");
    }
  };
  const reorder = async (targetId: string) => {
    if (!dragged || dragged === targetId) return;
    const next = [...members];
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
      toast.success("Team order updated");
    } catch {
      toast.error("Unable to update team order");
    }
    setDragged(null);
  };
  return (
    <main className="space-y-6 p-6 md:p-10">
      <header className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-700">
            HERI Africa administration
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-950">
            Our Team
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
            Manage leadership, researchers, fellows, biographies, portraits,
            visibility, and public ordering.
          </p>
        </div>
        {canWrite && (
          <button
            type="button"
            onClick={() => open()}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white"
          >
            <Plus className="size-4" />
            Add team member
          </button>
        )}
      </header>
      <section className="grid gap-3 sm:grid-cols-3">
        <Stat label="Team members" value={members.length} />
        <Stat
          label="Visible"
          value={members.filter((item) => Boolean(item.is_active)).length}
        />
        <Stat
          label="Roles represented"
          value={
            new Set(
              members
                .map((item) => String(item.role ?? "").trim())
                .filter(Boolean),
            ).size
          }
        />
      </section>
      <section className="space-y-3">
        {members.map((member) => (
          <article
            key={member.id}
            draggable={canWrite}
            onDragStart={() => setDragged(String(member.id))}
            onDragOver={(event) => event.preventDefault()}
            onDrop={() => void reorder(String(member.id))}
            className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <GripVertical className="size-5 shrink-0 cursor-grab text-slate-400" />
            <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-emerald-50 text-lg font-semibold text-emerald-800">
              {member.photo_url ? (
                <img
                  src={String(member.photo_url)}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                String(member.name ?? "?").slice(0, 1)
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                  {String(member.role ?? "Role not set")}
                </span>
                {member.is_active ? (
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-800">
                    Visible
                  </span>
                ) : (
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500">
                    Hidden
                  </span>
                )}
              </div>
              <h2 className="truncate font-semibold text-slate-900">
                {member.name || "Unnamed member"}
              </h2>
              <p className="truncate text-sm text-slate-500">
                {member.biography || "No biography"}
              </p>
            </div>
            {canWrite && (
              <div className="flex gap-1">
                <button
                  type="button"
                  aria-label="Edit team member"
                  onClick={() => open(member)}
                  className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                >
                  <Pencil className="size-4" />
                </button>
                <button
                  type="button"
                  aria-label="Delete team member"
                  onClick={() => void remove(member)}
                  className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            )}
          </article>
        ))}
      </section>
      {draft && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/40 p-4 md:p-10">
          <form
            onSubmit={(event) => {
              event.preventDefault();
              void save();
            }}
            className="mx-auto max-w-2xl rounded-2xl bg-white p-6 shadow-xl"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">
                {draft.id ? "Edit" : "Add"} team member
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
              <Field
                label="Name"
                required
                error={errors.name}
                value={String(draft.name ?? "")}
                onChange={(value) => setDraft({ ...draft, name: value })}
              />
              <Field
                label="Slug"
                required
                error={errors.slug}
                value={String(draft.slug ?? "")}
                onChange={(value) => setDraft({ ...draft, slug: value })}
              />
              <Field
                label="Role"
                required
                error={errors.role}
                value={String(draft.role ?? "")}
                onChange={(value) => setDraft({ ...draft, role: value })}
              />
              <Field
                label="Biography"
                required
                textarea
                error={errors.biography}
                value={String(draft.biography ?? "")}
                onChange={(value) => setDraft({ ...draft, biography: value })}
              />
              <label className="text-sm font-medium text-slate-700">
                Portrait
                <HeriMediaPicker
                  value={String(draft.photo_url ?? "")}
                  onChange={(value) => setDraft({ ...draft, photo_url: value })}
                />
              </label>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  label="Position"
                  type="number"
                  value={String(draft.position ?? 0)}
                  onChange={(value) =>
                    setDraft({ ...draft, position: Number(value) })
                  }
                />
                <label className="flex items-center gap-2 pt-7 text-sm">
                  <input
                    type="checkbox"
                    checked={Boolean(draft.is_active)}
                    onChange={(event) =>
                      setDraft({ ...draft, is_active: event.target.checked })
                    }
                  />{" "}
                  Visible on public site
                </label>
              </div>
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
                Save member
              </button>
            </div>
          </form>
        </div>
      )}
    </main>
  );
}
function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold text-slate-900">{value}</p>
    </div>
  );
}
function Field({
  label,
  value,
  onChange,
  textarea,
  type = "text",
  required,
  error,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  textarea?: boolean;
  type?: string;
  required?: boolean;
  error?: string;
}) {
  return (
    <label className="text-sm font-medium text-slate-700">
      {label}
      {required && <span className="text-red-600"> *</span>}
      {error && (
        <span className="ml-2 text-xs font-normal text-red-600">{error}</span>
      )}
      {textarea ? (
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          rows={5}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 font-normal"
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 font-normal"
        />
      )}
    </label>
  );
}
