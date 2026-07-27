"use client";

import { FormEvent, useState } from "react";

const apiBase = process.env.NEXT_PUBLIC_HERI_API_URL ?? "http://localhost:8003/api/v1/heri";

export function PartnershipForm() {
  const [state, setState] = useState<"idle" | "pending" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("pending");
    const values = Object.fromEntries(new FormData(event.currentTarget).entries());
    try {
      const response = await fetch(`${apiBase}/partnership-applications`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...values, consent: values.consent === "on" }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail ?? "Unable to submit partnership enquiry");
      setMessage(data.message);
      setState("success");
      event.currentTarget.reset();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to submit partnership enquiry");
      setState("error");
    }
  }
  return <form className="grid gap-5 rounded-3xl bg-white p-8 shadow-sm ring-1 ring-heri-teal/10" onSubmit={onSubmit}><label className="grid gap-2 text-sm font-semibold">Organisation<input className="rounded-xl border border-heri-teal/20 px-4 py-3 font-normal" name="organisation" required /></label><label className="grid gap-2 text-sm font-semibold">Contact person<input className="rounded-xl border border-heri-teal/20 px-4 py-3 font-normal" name="contact_person" required /></label><label className="grid gap-2 text-sm font-semibold">Email<input className="rounded-xl border border-heri-teal/20 px-4 py-3 font-normal" name="email" type="email" required /></label><label className="grid gap-2 text-sm font-semibold">Country<input className="rounded-xl border border-heri-teal/20 px-4 py-3 font-normal" name="country" required /></label><label className="grid gap-2 text-sm font-semibold">Proposed collaboration<textarea className="min-h-36 rounded-xl border border-heri-teal/20 px-4 py-3 font-normal" name="proposed_collaboration" required /></label><label className="flex items-start gap-3 text-sm font-normal"><input name="consent" type="checkbox" required /> I consent to HERI Africa storing this information to respond to my enquiry.</label><button className="w-fit rounded-full bg-heri-lime px-6 py-3 font-semibold text-heri-ink disabled:cursor-wait disabled:opacity-60" disabled={state === "pending"} type="submit">{state === "pending" ? "Sending…" : "Start a partnership enquiry"}</button>{message && <p aria-live="polite" className={state === "error" ? "text-sm text-red-700" : "text-sm text-heri-teal"}>{message}</p>}</form>;
}
