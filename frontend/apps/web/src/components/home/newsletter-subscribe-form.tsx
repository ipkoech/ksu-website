"use client";

import { useId, useState, type FormEvent } from "react";
import { Loader2 } from "lucide-react";
import { getMainApiBaseUrl } from "@ksu/api-client";
import { cn } from "@ksu/ui/lib/utils";
import { focusVisibleStyles } from "@ksu/ui/motion";

type SubscribeState = "idle" | "submitting" | "success" | "error";

/** Deliberately permissive: the server is the authority on deliverability,
 *  and a stricter pattern here only rejects addresses that are in fact
 *  valid. This catches the typo cases (missing @, missing domain). */
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function NewsletterSubscribeForm({
  variant = "light",
}: {
  /** `dark` is the navy CTA band; `light` is the composed CMS section. */
  variant?: "light" | "dark";
}) {
  const fieldId = useId();
  const messageId = `${fieldId}-message`;
  const [email, setEmail] = useState("");
  const [state, setState] = useState<SubscribeState>("idle");
  const [message, setMessage] = useState("");

  const invalid = state === "error";
  const submitting = state === "submitting";

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();

    if (!emailPattern.test(normalizedEmail)) {
      setState("error");
      setMessage("Enter a valid email address, for example name@example.com.");
      return;
    }

    setState("submitting");
    setMessage("");

    try {
      const response = await fetch(
        `${getMainApiBaseUrl()}/api/v1/newsletters/subscribe`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: normalizedEmail,
            frequency: "all",
            categories: ["news", "events", "articles"],
          }),
        },
      );

      if (!response.ok) {
        throw new Error("Subscription request failed");
      }

      setEmail("");
      setState("success");
      setMessage("You are subscribed to Kisii University updates.");
    } catch {
      setState("error");
      setMessage("Subscription failed. Please try again.");
    }
  }

  const dark = variant === "dark";

  return (
    <form onSubmit={onSubmit} className="w-full" noValidate>
      <div className="flex w-full min-w-0 flex-col gap-2 sm:flex-row">
        <label className="sr-only" htmlFor={fieldId}>
          Email address
        </label>
        <input
          id={fieldId}
          type="email"
          name="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => {
            setEmail(event.target.value);
            if (state !== "idle") {
              setState("idle");
              setMessage("");
            }
          }}
          placeholder="Enter your email address"
          disabled={submitting}
          aria-invalid={invalid || undefined}
          aria-describedby={message ? messageId : undefined}
          className={cn(
            "ksu-l-small min-h-12 min-w-0 flex-1 rounded-lg border bg-white px-4 text-brand-overlay outline-none placeholder:text-brand-overlay/45 disabled:opacity-70",
            invalid ? "border-[hsl(var(--destructive))]" : "border-transparent",
            focusVisibleStyles.primary,
          )}
        />
        <button
          type="submit"
          disabled={submitting}
          className={cn(
            "inline-flex min-h-12 items-center justify-center gap-2 rounded-lg px-8 font-medium transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-70",
            dark
              ? "bg-secondary text-white hover:bg-secondary/90"
              : "bg-primary text-white hover:bg-primary/90",
            dark ? focusVisibleStyles.white : focusVisibleStyles.primary,
          )}
        >
          {submitting ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          ) : null}
          {submitting ? "Subscribing…" : "Subscribe"}
        </button>
      </div>

      {/* Both live regions are always mounted, so a message that replaces an
          identical one is still announced. */}
      <p
        id={messageId}
        role={invalid ? "alert" : "status"}
        aria-live={invalid ? "assertive" : "polite"}
        className={cn(
          "ksu-l-small mt-2 min-h-[1.25rem]",
          invalid
            ? dark
              ? "text-[hsl(var(--destructive-soft))]"
              : "text-[hsl(var(--destructive))]"
            : dark
              ? "text-white/85"
              : "text-primary",
        )}
      >
        {message}
      </p>
    </form>
  );
}

export default NewsletterSubscribeForm;
