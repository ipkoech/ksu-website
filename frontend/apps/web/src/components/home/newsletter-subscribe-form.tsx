"use client";

import { useState, type FormEvent } from "react";
import { ArrowRight, Loader2 } from "lucide-react";
import { getMainApiBaseUrl } from "@ksu/api-client";

type SubscribeState = "idle" | "submitting" | "success" | "error";

export function NewsletterSubscribeForm() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<SubscribeState>("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) return;

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

  return (
    <form onSubmit={onSubmit} className="w-full">
      <div className="flex w-full flex-col overflow-hidden rounded-md border border-border bg-white shadow-sm sm:flex-row">
        <label className="sr-only" htmlFor="homepage-newsletter-email">
          Email address
        </label>
        <input
          id="homepage-newsletter-email"
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="Enter your email address"
          className="min-h-12 flex-1 px-4 text-sm text-foreground outline-none placeholder:text-muted-foreground/70 focus:ring-2 focus:ring-primary/30"
          disabled={state === "submitting"}
        />
        <button
          type="submit"
          disabled={state === "submitting"}
          className="inline-flex min-h-12 items-center justify-center gap-2 bg-primary px-5 text-sm font-bold text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {state === "submitting" ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          ) : (
            <ArrowRight className="h-4 w-4" aria-hidden />
          )}
          Subscribe
        </button>
      </div>
      {message ? (
        <p
          className={`mt-2 text-xs font-medium ${
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
