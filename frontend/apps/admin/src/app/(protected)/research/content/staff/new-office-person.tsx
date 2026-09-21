"use client";

import { useState, type FormEvent } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { personsApi } from "@ksu/api-client";
import { usePermissions } from "@ksu/auth";

export function NewOfficePerson() {
  const { hasScope } = usePermissions();
  const queryClient = useQueryClient();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  if (!hasScope("people.manage")) return null;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    const form = event.currentTarget;
    const values = new FormData(form);
    const first_name = String(values.get("first_name") ?? "").trim();
    const last_name = String(values.get("last_name") ?? "").trim();
    const email = String(values.get("email") ?? "").trim().toLowerCase();
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const existing = await personsApi.listAdmin({ search: email, per_page: 100, status: "all" });
      if (existing.data.some(person => person.email?.toLowerCase() === email)) {
        throw new Error("A profile with this email already exists. Select that person when adding a team member.");
      }
      await personsApi.create({ first_name, last_name, full_name: `${first_name} ${last_name}`, email, is_active: true, is_public: true, show_on_directory: true });
      form.reset();
      await queryClient.invalidateQueries({ predicate: query => query.queryKey.some(key => typeof key === "string" && /person|people|relationship/.test(key)) });
      setMessage(`${first_name} ${last_name}'s profile is ready. Use Add team member below to select them and choose their office role.`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to create the profile. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return <details className="rounded-lg border bg-background p-4">
    <summary className="cursor-pointer text-sm font-medium">Staff member missing from the search? Create a profile</summary>
    <p className="mt-3 text-sm text-muted-foreground">For existing university staff, use Add team member and search by name. Create a profile here only when they are missing, then add their office role.</p>
    <form onSubmit={submit} className="mt-4 grid gap-4 sm:grid-cols-3">
      <label className="text-sm">First name<input name="first_name" required maxLength={100} className="mt-1 w-full rounded-md border bg-background px-3 py-2" /></label>
      <label className="text-sm">Last name<input name="last_name" required maxLength={100} className="mt-1 w-full rounded-md border bg-background px-3 py-2" /></label>
      <label className="text-sm">University email<input name="email" type="email" required className="mt-1 w-full rounded-md border bg-background px-3 py-2" /></label>
      <p className="text-xs text-muted-foreground sm:col-span-3">This creates an active, public university staff profile visible in the directory.</p>
      <button disabled={busy} type="submit" className="w-fit rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground disabled:opacity-50">{busy ? "Creating…" : "Create profile"}</button>
      {message ? <p role="status" className="text-sm sm:col-span-3">{message}</p> : null}
      {error ? <p role="alert" className="text-sm text-destructive sm:col-span-3">{error}</p> : null}
    </form>
  </details>;
}
