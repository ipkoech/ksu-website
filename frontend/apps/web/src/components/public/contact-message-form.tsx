"use client";

import { useState, type FormEvent } from "react";
import { mainApi } from "@ksu/api-client";
import { CheckCircle2, Loader2, Send } from "lucide-react";

type InquiryResponse = {
  data: { reference_number: string };
};

export function ContactMessageForm({
  universitySlug,
  compact = false,
}: {
  universitySlug: string;
  compact?: boolean;
}) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [reference, setReference] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.checkValidity()) return form.reportValidity();

    const data = new FormData(form);
    setSubmitting(true);
    setError("");
    try {
      const response = await mainApi.post<InquiryResponse>(
        `/api/v1/public/entities/university/${encodeURIComponent(universitySlug)}/inquiries`,
        {
          sender_name: data.get("sender_name"),
          sender_email: data.get("sender_email"),
          sender_phone: data.get("sender_phone") || null,
          category: data.get("category"),
          subject: data.get("subject"),
          message: data.get("message"),
          consent_to_contact: data.get("consent_to_contact") === "on",
          website: data.get("website"),
          source_page_url: window.location.pathname,
        },
      );
      setReference(response.data.reference_number);
      form.reset();
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "We could not send your message. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (reference) {
    return (
      <div
        className={`flex flex-col items-center justify-center text-center ${compact ? "min-h-52" : "min-h-[390px]"}`}
        role="status"
      >
        <CheckCircle2 aria-hidden className="h-12 w-12 text-emerald-500" />
        <h3 className="mt-4 font-[family-name:var(--font-display)] text-3xl text-primary">
          Message received
        </h3>
        <p className="mt-3 max-w-md text-sm leading-6 text-muted-foreground">
          Keep this reference number if you need to follow up.
        </p>
        <p className="mt-5 rounded-xl bg-primary/5 px-5 py-3 font-mono text-lg font-bold text-primary">
          {reference}
        </p>
        <button
          type="button"
          onClick={() => setReference("")}
          className="mt-6 text-sm font-bold text-primary underline underline-offset-4"
        >
          Send another message
        </button>
      </div>
    );
  }

  const fieldClass = `${compact ? "h-9 rounded-md px-3 text-xs" : "h-12 rounded-xl px-4 text-sm"} w-full border border-primary/15 bg-white text-foreground placeholder:text-muted-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10`;

  return (
    <form
      onSubmit={submit}
      className={`grid sm:grid-cols-2 ${compact ? "gap-2 [&>label:not(:has(input[type=checkbox]))]:gap-0 [&>label:not(:has(input[type=checkbox]))]:text-[0px]" : "gap-4"}`}
    >
      <label className="grid gap-1 text-[0.65rem] font-bold uppercase tracking-wide text-muted-foreground">
        Your name
        <input
          name="sender_name"
          required
          minLength={2}
          autoComplete="name"
          className={fieldClass}
          placeholder="Full name"
        />
      </label>
      <label className="grid gap-1 text-[0.65rem] font-bold uppercase tracking-wide text-muted-foreground">
        Email address
        <input
          name="sender_email"
          type="email"
          required
          autoComplete="email"
          className={fieldClass}
          placeholder="you@example.com"
        />
      </label>
      <label className="grid gap-1 text-[0.65rem] font-bold uppercase tracking-wide text-muted-foreground">
        Phone <span className="sr-only">optional</span>
        <input
          name="sender_phone"
          type="tel"
          autoComplete="tel"
          className={fieldClass}
          placeholder="Optional"
        />
      </label>
      <label className="grid gap-1 text-[0.65rem] font-bold uppercase tracking-wide text-muted-foreground">
        Enquiry type
        <select name="category" className={fieldClass} defaultValue="general">
          <option value="general" className="text-foreground">
            General enquiry
          </option>
          <option value="admissions" className="text-foreground">
            Admissions and programmes
          </option>
          <option value="academic" className="text-foreground">
            Academic support
          </option>
          <option value="research" className="text-foreground">
            Research and collaboration
          </option>
          <option value="services" className="text-foreground">
            Services and records
          </option>
          <option value="feedback" className="text-foreground">
            Feedback or complaint
          </option>
        </select>
      </label>
      <label className="grid gap-1 text-[0.65rem] font-bold uppercase tracking-wide text-muted-foreground sm:col-span-2">
        Subject
        <input
          name="subject"
          required
          minLength={3}
          className={fieldClass}
          placeholder="How can we help?"
        />
      </label>
      <label className="grid gap-1 text-[0.65rem] font-bold uppercase tracking-wide text-muted-foreground sm:col-span-2">
        Message
        <textarea
          name="message"
          required
          minLength={5}
          rows={compact ? 2 : 5}
          className={`${fieldClass} h-auto py-3`}
          placeholder="Tell us what you need help with"
        />
      </label>
      <div className="absolute -left-[9999px]" aria-hidden>
        <label>
          Website
          <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <label
        className={`${compact ? "text-xs leading-5" : "text-sm leading-6"} flex items-start gap-2 text-muted-foreground sm:col-span-2`}
      >
        <input
          name="consent_to_contact"
          type="checkbox"
          required
          className="mt-1 h-4 w-4 accent-[hsl(var(--secondary))]"
        />
        <span>
          I consent to Kisii University using these details to respond to this
          enquiry.
        </span>
      </label>
      {error ? (
        <p
          role="alert"
          className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 sm:col-span-2"
        >
          {error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={submitting}
        className={`${compact ? "min-h-9 rounded-md px-4 text-xs" : "min-h-12 rounded-xl px-6 text-sm"} inline-flex items-center justify-center gap-2 bg-secondary font-bold text-foreground transition hover:-translate-y-0.5 disabled:opacity-60 sm:col-span-2 sm:justify-self-start`}
      >
        {submitting ? (
          <Loader2 aria-hidden className="h-4 w-4 animate-spin" />
        ) : (
          <Send aria-hidden className="h-4 w-4" />
        )}
        {submitting ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}
