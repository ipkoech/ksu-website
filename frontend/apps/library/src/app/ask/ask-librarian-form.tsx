"use client";

import { useMemo, useState } from "react";
import { ApiClientError, libraryServiceApi } from "@ksu/api-client";
import type { LibraryBranch, LibraryInquiryPayload } from "@ksu/api-client";
import { Send } from "lucide-react";

type FormStatus =
  | { type: "idle"; message: null }
  | { type: "success"; message: string }
  | { type: "error"; message: string };

type AskLibrarianFormProps = {
  branches: LibraryBranch[];
};

const inquiryTopics = [
  "Catalog help",
  "Electronic resources access",
  "Borrowing and circulation",
  "Research support",
  "Training request",
  "Library rules",
  "Other library question",
];

const fieldControlClass =
  "flex min-h-11 w-full rounded-md border border-input bg-white px-3 py-2 text-sm text-slate-950 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

export function AskLibrarianForm({ branches }: AskLibrarianFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<FormStatus>({
    type: "idle",
    message: null,
  });

  const defaultBranchId = useMemo(() => branches[0]?.id ?? "", [branches]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload = buildPayload(formData);

    if (!payload.sender_name || !payload.sender_email || !payload.subject || !payload.message) {
      setStatus({
        type: "error",
        message: "Add your name, email, subject, and question before sending.",
      });
      return;
    }

    setIsSubmitting(true);
    setStatus({ type: "idle", message: null });

    try {
      await libraryServiceApi.inquiries.create(payload);
      form.reset();
      setStatus({
        type: "success",
        message:
          "Your question has been sent to the library team. They will reply using the email address provided.",
      });
    } catch (error) {
      setStatus({
        type: "error",
        message: getErrorMessage(error),
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
    >
      <div className="grid gap-5 lg:grid-cols-2">
        <Field label="Full name" htmlFor="sender_name" required>
          <input
            id="sender_name"
            name="sender_name"
            type="text"
            autoComplete="name"
            required
            maxLength={255}
            className={fieldControlClass}
            placeholder="Your full name"
          />
        </Field>

        <Field label="Email address" htmlFor="sender_email" required>
          <input
            id="sender_email"
            name="sender_email"
            type="email"
            autoComplete="email"
            required
            maxLength={255}
            className={fieldControlClass}
            placeholder="name@example.com"
          />
        </Field>

        <Field label="Phone number" htmlFor="sender_phone">
          <input
            id="sender_phone"
            name="sender_phone"
            type="tel"
            autoComplete="tel"
            maxLength={30}
            className={fieldControlClass}
            placeholder="+254..."
          />
        </Field>

        <Field label="Library branch" htmlFor="library_id">
          <select
            id="library_id"
            name="library_id"
            defaultValue={defaultBranchId}
            className={fieldControlClass}
          >
            {branches.length === 0 ? (
              <option value="">General library desk</option>
            ) : null}
            {branches.map((branch) => (
              <option key={branch.id} value={branch.id}>
                {branch.name}
              </option>
            ))}
            {branches.length > 0 ? (
              <option value="">General library desk</option>
            ) : null}
          </select>
        </Field>
      </div>

      <div className="mt-5 grid gap-5">
        <Field label="Topic" htmlFor="subject" required>
          <select
            id="subject"
            name="subject"
            required
            defaultValue=""
            className={fieldControlClass}
          >
            <option value="" disabled>
              Choose a topic
            </option>
            {inquiryTopics.map((topic) => (
              <option key={topic} value={topic}>
                {topic}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Question" htmlFor="message" required>
          <textarea
            id="message"
            name="message"
            required
            minLength={10}
            rows={7}
            className={`${fieldControlClass} min-h-40 resize-y`}
            placeholder="Include the resource title, database name, call number, branch, or deadline if it helps the library team answer quickly."
          />
        </Field>
      </div>

      {status.message ? (
        <p
          className={
            status.type === "success"
              ? "mt-5 rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm leading-6 text-emerald-800"
              : "mt-5 rounded-md border border-red-200 bg-red-50 p-3 text-sm leading-6 text-red-800"
          }
          role={status.type === "error" ? "alert" : "status"}
        >
          {status.message}
        </p>
      ) : null}

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs leading-5 text-slate-500">
          Required fields are marked with an asterisk. Please do not submit
          passwords or payment details.
        </p>
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70"
        >
          <Send aria-hidden className="h-4 w-4" />
          {isSubmitting ? "Sending..." : "Send question"}
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  htmlFor,
  required,
  children,
}: {
  label: string;
  htmlFor: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold text-slate-900" htmlFor={htmlFor}>
        {label}
        {required ? <span className="text-red-600"> *</span> : null}
      </label>
      {children}
    </div>
  );
}

function buildPayload(formData: FormData): LibraryInquiryPayload {
  const libraryId = textValue(formData, "library_id");
  const phone = textValue(formData, "sender_phone");

  return {
    library_id: libraryId || null,
    sender_name: textValue(formData, "sender_name"),
    sender_email: textValue(formData, "sender_email"),
    sender_phone: phone || null,
    subject: textValue(formData, "subject"),
    message: textValue(formData, "message"),
  };
}

function textValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function getErrorMessage(error: unknown) {
  if (error instanceof ApiClientError) {
    if (error.status === 429) {
      return "Too many questions were sent in a short time. Please wait a minute and try again.";
    }
    return error.message || "The question could not be sent. Try again later.";
  }

  return "The question could not be sent. Check your connection and try again.";
}
