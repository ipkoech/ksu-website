"use client";

import { FormEvent, useState } from "react";

const apiBase =
  process.env.NEXT_PUBLIC_HERI_API_URL ?? "http://localhost:8003/api/v1/heri";
const inputClass =
  "rounded-lg border border-slate-300 px-4 py-3 font-normal outline-none focus:border-heri-teal focus:ring-2 focus:ring-heri-lime/40";

export function PartnershipForm() {
  const [state, setState] = useState<"idle" | "pending" | "success" | "error">(
    "idle",
  );
  const [message, setMessage] = useState("");
  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("pending");
    const values = Object.fromEntries(
      new FormData(event.currentTarget).entries(),
    );
    try {
      const response = await fetch(`${apiBase}/partnership-applications`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, consent: values.consent === "on" }),
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.detail ?? "Unable to submit partnership enquiry");
      setMessage(data.message ?? "Thank you. We will be in touch soon.");
      setState("success");
      event.currentTarget.reset();
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to submit partnership enquiry",
      );
      setState("error");
    }
  }
  return (
    <form
      className="grid gap-6 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 md:p-8"
      onSubmit={onSubmit}
    >
      <div>
        <p className="text-sm font-bold text-heri-blue">
          1. Contact Information
        </p>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <label className="grid gap-2 text-sm font-semibold">
            Full name *
            <input
              className={inputClass}
              name="contact_person"
              placeholder="e.g. Jane Wanjiku"
              required
            />
          </label>
          <label className="grid gap-2 text-sm font-semibold">
            Job title
            <input
              className={inputClass}
              name="job_title"
              placeholder="e.g. Program Manager"
            />
          </label>
          <label className="grid gap-2 text-sm font-semibold">
            Email address *
            <input
              className={inputClass}
              name="email"
              placeholder="jane@example.org"
              required
              type="email"
            />
          </label>
          <label className="grid gap-2 text-sm font-semibold">
            Phone number
            <input
              className={inputClass}
              name="phone"
              placeholder="+254 700 123 456"
            />
          </label>
        </div>
      </div>
      <div>
        <p className="text-sm font-bold text-heri-blue">
          2. Organisation Details
        </p>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <label className="grid gap-2 text-sm font-semibold">
            Organisation / institution *
            <input
              className={inputClass}
              name="organisation"
              placeholder="e.g. Kisii County Government"
              required
            />
          </label>
          <label className="grid gap-2 text-sm font-semibold">
            Country *
            <input
              className={inputClass}
              name="country"
              placeholder="Kenya"
              required
            />
          </label>
          <label className="grid gap-2 text-sm font-semibold sm:col-span-2">
            Website
            <input
              className={inputClass}
              name="website"
              placeholder="https://example.org"
              type="url"
            />
          </label>
        </div>
      </div>
      <label className="grid gap-2 text-sm font-semibold">
        3. Partnership interest *
        <select
          className={inputClass}
          name="partnership_interest"
          required
          defaultValue=""
        >
          <option disabled value="">
            Select an area of interest
          </option>
          <option>Research collaboration</option>
          <option>Funding and grants</option>
          <option>Policy engagement</option>
          <option>Schools and communities</option>
          <option>Researcher development</option>
          <option>Events and knowledge exchange</option>
        </select>
      </label>
      <label className="grid gap-2 text-sm font-semibold">
        4. Proposed collaboration *
        <textarea
          className={`${inputClass} min-h-32`}
          name="proposed_collaboration"
          placeholder="Tell us about the goal, scope and expected impact."
          required
        />
      </label>
      <label className="flex items-start gap-3 text-sm">
        <input className="mt-1" name="consent" required type="checkbox" /> I
        confirm this information is accurate and consent to HERI Africa
        contacting me about this enquiry. *
      </label>
      <button
        className="w-fit rounded-lg bg-heri-lime px-6 py-3 text-xs font-bold text-heri-ink disabled:cursor-wait disabled:opacity-60"
        disabled={state === "pending"}
        type="submit"
      >
        {state === "pending" ? "Submitting…" : "SUBMIT PARTNERSHIP ENQUIRY →"}
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
