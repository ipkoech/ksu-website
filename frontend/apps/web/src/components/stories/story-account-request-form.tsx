"use client";

import { useState, type FormEvent } from "react";
import { ArrowRight, Loader2 } from "lucide-react";
import { storiesApi } from "@ksu/api-client";

type SubmitState = "idle" | "submitting" | "success" | "error";

export function StoryAccountRequestForm() {
  const [state, setState] = useState<SubmitState>("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setState("submitting");
    setMessage("");

    try {
      await storiesApi.requestContributorAccount({
        full_name: String(form.get("full_name") ?? "").trim(),
        email: String(form.get("email") ?? "").trim().toLowerCase(),
        phone: String(form.get("phone") ?? "").trim() || null,
        affiliation: String(form.get("affiliation") ?? "").trim() || null,
        contributor_type: String(form.get("contributor_type") ?? "external"),
        reason_for_request:
          String(form.get("reason_for_request") ?? "").trim() || null,
      });
      event.currentTarget.reset();
      setState("success");
      setMessage(
        "Your request has been submitted. Corporate Communication will review it before account access is granted.",
      );
    } catch {
      setState("error");
      setMessage(
        "We could not submit the request. Confirm the email is not already pending, then try again.",
      );
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="grid gap-4 rounded-[1.5rem] border border-primary/10 bg-white/85 p-5 shadow-[0_18px_60px_rgba(0,53,37,.10)] sm:p-7"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field name="full_name" label="Full name" required />
        <Field name="email" label="Email address" type="email" required />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field name="phone" label="Phone" />
        <Field name="affiliation" label="Affiliation" />
      </div>
      <label className="grid gap-2 text-sm font-semibold text-primary">
        Contributor type
        <select
          name="contributor_type"
          className="min-h-12 rounded-xl border border-primary/15 bg-white px-4 text-foreground outline-none focus:ring-2 focus:ring-primary/25"
          defaultValue="external"
        >
          <option value="external">External contributor</option>
          <option value="student">Student</option>
          <option value="staff">Staff</option>
          <option value="alumni">Alumni</option>
          <option value="partner">Partner</option>
        </select>
      </label>
      <label className="grid gap-2 text-sm font-semibold text-primary">
        Why do you want to submit stories?
        <textarea
          name="reason_for_request"
          rows={5}
          className="rounded-xl border border-primary/15 bg-white px-4 py-3 text-foreground outline-none focus:ring-2 focus:ring-primary/25"
          placeholder="Briefly describe the type of Kisii University stories you intend to share."
        />
      </label>
      <button
        type="submit"
        disabled={state === "submitting"}
        className="inline-flex min-h-12 w-fit items-center gap-3 rounded-full bg-primary px-6 text-sm font-bold text-white transition-colors duration-200 hover:bg-primary/90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
      >
        {state === "submitting" ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <ArrowRight className="h-4 w-4" />
        )}
        Request account
      </button>
      {message ? (
        <p
          className={`text-sm font-medium ${
            state === "error" ? "text-red-700" : "text-primary"
          }`}
          role={state === "error" ? "alert" : "status"}
        >
          {message}
        </p>
      ) : null}
    </form>
  );
}

function Field({
  name,
  label,
  type = "text",
  required = false,
}: {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-primary">
      {label}
      <input
        name={name}
        type={type}
        required={required}
        className="min-h-12 rounded-xl border border-primary/15 bg-white px-4 text-foreground outline-none focus:ring-2 focus:ring-primary/25"
      />
    </label>
  );
}
