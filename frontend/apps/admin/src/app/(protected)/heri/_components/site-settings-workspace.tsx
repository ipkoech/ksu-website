"use client";

import { useEffect, useState } from "react";
import { Loader2, Save } from "lucide-react";
import { toast } from "@ksu/ui";
import { usePermissions } from "@/hooks/use-permissions";
import {
  useHeriResourceMutation,
  useHeriResourceQuery,
  type HeriRecord,
} from "@/lib/api/heri";

type Settings = HeriRecord & {
  name?: string;
  tagline?: string;
  research_center_slug?: string;
  contact?: Record<string, unknown>;
  social_links?: Record<string, unknown>;
  seo_defaults?: Record<string, unknown>;
};
const emptyJson = "{}";
function parseJson(value: string) {
  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? parsed
      : null;
  } catch {
    return null;
  }
}

export function SiteSettingsWorkspace() {
  const { hasPermission, isAdmin } = usePermissions();
  const canWrite = isAdmin || hasPermission("heri.settings.write");
  const query = useHeriResourceQuery<Settings>("site-settings", {
    page: 1,
    per_page: 1,
  });
  const mutation = useHeriResourceMutation("site-settings");
  const [record, setRecord] = useState<Settings | null>(null);
  const [contact, setContact] = useState(emptyJson);
  const [social, setSocial] = useState(emptyJson);
  const [seo, setSeo] = useState(emptyJson);
  const [error, setError] = useState("");
  useEffect(() => {
    const item = query.data?.data?.[0];
    if (item) {
      setRecord(item);
      setContact(JSON.stringify(item.contact ?? {}, null, 2));
      setSocial(JSON.stringify(item.social_links ?? {}, null, 2));
      setSeo(JSON.stringify(item.seo_defaults ?? {}, null, 2));
    }
  }, [query.data]);
  const save = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!record || !canWrite) return;
    const contactValue = parseJson(contact);
    const socialValue = parseJson(social);
    const seoValue = parseJson(seo);
    if (!contactValue || !socialValue || !seoValue) {
      setError(
        "Contact, social, and SEO values must each be valid JSON objects.",
      );
      return;
    }
    setError("");
    const form = new FormData(event.currentTarget);
    try {
      await mutation.mutateAsync({
        id: record.id,
        payload: {
          name: form.get("name"),
          tagline: form.get("tagline"),
          research_center_slug: form.get("research_center_slug"),
          contact: contactValue,
          social_links: socialValue,
          seo_defaults: seoValue,
        },
      });
      toast.success("Site settings saved");
    } catch (reason) {
      toast.error(
        reason instanceof Error
          ? reason.message
          : "Unable to save site settings",
      );
    }
  };
  if (query.isLoading || !record)
    return (
      <div className="p-6 md:p-10">
        <p className="rounded-xl border bg-white p-6 text-sm text-slate-500">
          <Loader2 className="mr-2 inline size-4 animate-spin" />
          Loading site settings…
        </p>
      </div>
    );
  return (
    <main className="space-y-6 p-6 md:p-10">
      <header>
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-700">
          HERI Africa administration
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-950">
          Site Settings
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
          Manage public identity, contact details, social channels, SEO
          defaults, and the configured Research Service centre.
        </p>
      </header>
      <div className="grid gap-5 xl:grid-cols-[1fr_.8fr]">
        <form
          onSubmit={save}
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <div className="grid gap-4">
            <Field
              name="name"
              label="Site name"
              required
              defaultValue={String(record.name ?? "")}
            />
            <Field
              name="tagline"
              label="Tagline"
              defaultValue={String(record.tagline ?? "")}
            />
            <Field
              name="research_center_slug"
              label="Primary research centre slug"
              defaultValue={String(record.research_center_slug ?? "")}
              placeholder="heri-africa-language-education-research-chair"
            />
            <JsonField
              label="Contact details JSON"
              value={contact}
              onChange={setContact}
            />
            <JsonField
              label="Social links JSON"
              value={social}
              onChange={setSocial}
            />
            <JsonField
              label="SEO defaults JSON"
              value={seo}
              onChange={setSeo}
            />
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button
              type="submit"
              disabled={mutation.isPending}
              className="inline-flex w-fit items-center gap-2 rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
            >
              {mutation.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Save className="size-4" />
              )}
              Save settings
            </button>
          </div>
        </form>
        <aside className="rounded-2xl bg-[#003c39] p-6 text-white shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-lime-300">
            Public identity preview
          </p>
          <h2 className="mt-4 text-3xl font-bold">
            {String(record.name ?? "HERI Africa")}
          </h2>
          <p className="mt-3 leading-7 text-white/80">
            {String(
              record.tagline ??
                "Language education research for transformation across Africa.",
            )}
          </p>
          <div className="mt-8 border-t border-white/20 pt-5 text-sm text-white/80">
            <p>
              <strong className="text-lime-300">Centre:</strong>{" "}
              {String(record.research_center_slug || "Not configured")}
            </p>
            <p className="mt-2">
              <strong className="text-lime-300">Contact channels:</strong>{" "}
              {Object.keys(record.contact ?? {}).length}
            </p>
            <p className="mt-2">
              <strong className="text-lime-300">Social channels:</strong>{" "}
              {Object.keys(record.social_links ?? {}).length}
            </p>
          </div>
        </aside>
      </div>
    </main>
  );
}
function Field({
  name,
  label,
  defaultValue,
  required,
  placeholder,
}: {
  name: string;
  label: string;
  defaultValue: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <label className="text-sm font-medium text-slate-700">
      {label}
      {required && <span className="text-red-600"> *</span>}
      <input
        name={name}
        required={required}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 font-normal"
      />
    </label>
  );
}
function JsonField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="text-sm font-medium text-slate-700">
      {label}
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={5}
        className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-xs"
      />
    </label>
  );
}
