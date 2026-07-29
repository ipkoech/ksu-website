"use client";

import { FormEvent, useState } from "react";
import { submitContact } from "../../lib/api";

const inputClass =
  "rounded-lg border border-slate-300 px-4 py-3 font-normal outline-none focus:border-heri-teal focus:ring-2 focus:ring-heri-lime/40";

export function ContactForm() {
  const [state, setState] = useState<"idle" | "pending" | "success" | "error">(
    "idle",
  );
  const [message, setMessage] = useState("");
  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setState("pending");
    const values = Object.fromEntries(new FormData(form).entries());
    try {
      const result = await submitContact({
        ...values,
        consent: values.consent === "on",
      });
      setMessage(result.message);
      setState("success");
      form.reset();
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Unable to submit enquiry",
      );
      setState("error");
    }
  }
  return (
    <form
      className="grid gap-5 rounded-3xl bg-white p-6 shadow-lg ring-1 ring-slate-200 md:p-8"
      onSubmit={onSubmit}
    >
      <label className="grid gap-2 text-sm font-semibold">
        Full name *
        <input
          className={inputClass}
          name="name"
          placeholder="Enter your full name"
          required
        />
      </label>
      <label className="grid gap-2 text-sm font-semibold">
        Email address *
        <input
          className={inputClass}
          name="email"
          placeholder="Enter your email address"
          required
          type="email"
        />
      </label>
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="grid gap-2 text-sm font-semibold">
          Telephone number
          <input
            className={inputClass}
            name="phone"
            placeholder="e.g. +254 712 345 678"
          />
        </label>
        <label className="grid gap-2 text-sm font-semibold">
          Organisation
          <input
            className={inputClass}
            name="organisation"
            placeholder="Enter your organisation"
          />
        </label>
      </div>
      <label className="grid gap-2 text-sm font-semibold">
        Enquiry category *
        <select className={inputClass} defaultValue="" name="subject" required>
          <option disabled value="">
            Please select a category
          </option>
          <option>General enquiry</option>
          <option>Research and media</option>
          <option>Events and opportunities</option>
          <option>Partnership enquiry</option>
        </select>
      </label>
      <label className="grid gap-2 text-sm font-semibold">
        Message *
        <textarea
          className={`${inputClass} min-h-36`}
          name="message"
          placeholder="Tell us more about your enquiry"
          required
        />
      </label>
      <label className="flex items-start gap-3 text-sm">
        <input className="mt-1" name="consent" required type="checkbox" /> I
        consent to HERI Africa storing this information so the team can respond
        to my enquiry.
      </label>
      <button
        className="w-fit rounded-lg bg-heri-lime px-6 py-3 text-xs font-bold text-heri-ink disabled:cursor-wait disabled:opacity-60"
        disabled={state === "pending"}
        type="submit"
      >
        {state === "pending" ? "Sending…" : "SEND ENQUIRY →"}
      </button>
      {message && (
        <p
          aria-live="polite"
          className={
            state === "error"
              ? "text-sm text-red-700"
              : "text-sm text-heri-teal"
          }
        >
          {message}
        </p>
      )}
    </form>
  );
}
