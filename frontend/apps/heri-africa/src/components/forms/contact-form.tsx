"use client";

import { FormEvent, useState } from "react";
import { submitContact } from "../../lib/api";

export function ContactForm() {
  const [state, setState] = useState<"idle" | "pending" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("pending");
    const values = Object.fromEntries(new FormData(event.currentTarget).entries());
    try {
      const result = await submitContact({ ...values, consent: values.consent === "on" });
      setMessage(result.message);
      setState("success");
      event.currentTarget.reset();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to submit enquiry");
      setState("error");
    }
  }
  return <form className="grid gap-5 rounded-3xl bg-white p-8 shadow-sm ring-1 ring-heri-teal/10" onSubmit={onSubmit}><label className="grid gap-2 text-sm font-semibold">Full name<input className="rounded-xl border border-heri-teal/20 px-4 py-3 font-normal" name="name" required /></label><label className="grid gap-2 text-sm font-semibold">Email address<input className="rounded-xl border border-heri-teal/20 px-4 py-3 font-normal" name="email" type="email" required /></label><label className="grid gap-2 text-sm font-semibold">Subject<input className="rounded-xl border border-heri-teal/20 px-4 py-3 font-normal" name="subject" required /></label><label className="grid gap-2 text-sm font-semibold">Message<textarea className="min-h-36 rounded-xl border border-heri-teal/20 px-4 py-3 font-normal" name="message" required /></label><label className="flex items-start gap-3 text-sm font-normal"><input name="consent" type="checkbox" required /> I consent to HERI Africa storing this information to respond to my enquiry.</label><button className="w-fit rounded-full bg-heri-lime px-6 py-3 font-semibold text-heri-ink disabled:cursor-wait disabled:opacity-60" disabled={state === "pending"} type="submit">{state === "pending" ? "Sending…" : "Send enquiry"}</button>{message && <p aria-live="polite" className={state === "error" ? "text-sm text-red-700" : "text-sm text-heri-teal"}>{message}</p>}</form>;
}
