"use client";

import { useState, type FormEvent } from "react";
import { mainApi } from "@ksu/api-client";
import {
  Button,
  Checkbox,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  Textarea,
} from "@ksu/ui/components";
import { CheckCircle2, Loader2, MessageCircle, Send } from "lucide-react";

export type PublicInquiryTarget = {
  type: "university" | "school" | "department" | "office" | "person";
  slug: string;
  name: string;
};

type InquiryResponse = {
  data: {
    reference_number: string;
    target_entity_name: string;
  };
};

export function EntityInquiryLauncher({ target }: { target: PublicInquiryTarget }) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [reference, setReference] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    const form = new FormData(event.currentTarget);

    try {
      const response = await mainApi.post<InquiryResponse>(
        `/api/v1/public/entities/${target.type}/${encodeURIComponent(target.slug)}/inquiries`,
        {
          sender_name: form.get("sender_name"),
          sender_email: form.get("sender_email"),
          sender_phone: form.get("sender_phone") || null,
          category: form.get("category"),
          subject: form.get("subject"),
          message: form.get("message"),
          consent_to_contact: form.get("consent_to_contact") === "on",
          website: form.get("website"),
          source_page_url: window.location.pathname,
        },
      );
      setReference(response.data.reference_number);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "We could not send your message. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) {
      setError("");
      setReference("");
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-[calc(1rem+env(safe-area-inset-bottom))] right-4 z-40 inline-flex min-h-12 items-center gap-2 rounded-full bg-primary px-4 text-sm font-bold text-white shadow-[0_16px_40px_-14px_rgba(15,48,120,0.7)] transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/25 sm:bottom-6 sm:right-6"
        aria-label={`Send a message to ${target.name}`}
      >
        <MessageCircle aria-hidden className="h-5 w-5" />
        <span className="hidden sm:inline">Send a message</span>
      </button>

      <DialogContent className="max-h-[calc(100dvh-1rem)] w-[calc(100%-1rem)] overflow-y-auto rounded-[1.5rem] p-0 sm:max-w-2xl">
        <DialogHeader className="border-b border-border bg-primary/[0.04] px-5 py-5 text-left sm:px-7">
          <DialogTitle className="font-[family-name:var(--font-display)] text-2xl text-foreground">
            Send a message to {target.name}
          </DialogTitle>
          <DialogDescription>
            Your inquiry will be routed to the team responsible for this {target.type}.
          </DialogDescription>
        </DialogHeader>

        {reference ? (
          <div className="px-6 py-10 text-center sm:px-8">
            <CheckCircle2 aria-hidden className="mx-auto h-12 w-12 text-emerald-600" />
            <h3 className="mt-4 text-xl font-bold text-foreground">Message received</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Keep this reference number for follow-up:
            </p>
            <p className="mt-3 rounded-xl bg-primary/[0.07] px-4 py-3 font-mono text-lg font-bold text-primary">
              {reference}
            </p>
            <Button type="button" className="mt-6" onClick={() => setOpen(false)}>
              Close
            </Button>
          </div>
        ) : (
          <form onSubmit={submit} className="grid gap-4 px-5 py-5 sm:grid-cols-2 sm:px-7">
            <div className="grid gap-1.5">
              <Label htmlFor="inquiry-name">Your name</Label>
              <Input id="inquiry-name" name="sender_name" minLength={2} required autoComplete="name" />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="inquiry-email">Email address</Label>
              <Input id="inquiry-email" name="sender_email" type="email" required autoComplete="email" />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="inquiry-phone">Phone (optional)</Label>
              <Input id="inquiry-phone" name="sender_phone" type="tel" autoComplete="tel" />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="inquiry-category">Category</Label>
              <select
                id="inquiry-category"
                name="category"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                defaultValue="general"
              >
                <option value="general">General inquiry</option>
                <option value="admissions">Admissions and programmes</option>
                <option value="academic">Academic support</option>
                <option value="research">Research and collaboration</option>
                <option value="services">Services and records</option>
                <option value="feedback">Feedback or complaint</option>
              </select>
            </div>
            <div className="grid gap-1.5 sm:col-span-2">
              <Label htmlFor="inquiry-subject">Subject</Label>
              <Input id="inquiry-subject" name="subject" minLength={3} required />
            </div>
            <div className="grid gap-1.5 sm:col-span-2">
              <Label htmlFor="inquiry-message">Message</Label>
              <Textarea id="inquiry-message" name="message" minLength={5} required rows={6} />
            </div>
            <div className="absolute -left-[9999px]" aria-hidden="true">
              <Label htmlFor="inquiry-website">Website</Label>
              <Input id="inquiry-website" name="website" tabIndex={-1} autoComplete="off" />
            </div>
            <label className="flex items-start gap-3 text-sm leading-5 text-muted-foreground sm:col-span-2">
              <Checkbox name="consent_to_contact" required className="mt-0.5" />
              <span>I consent to Kisii University using these details to respond to this inquiry.</span>
            </label>
            {error ? (
              <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700 sm:col-span-2">
                {error}
              </p>
            ) : null}
            <div className="sticky bottom-0 -mx-5 -mb-5 flex justify-end border-t border-border bg-white px-5 py-4 sm:static sm:col-span-2 sm:mx-0 sm:mb-0 sm:border-0 sm:p-0">
              <Button type="submit" disabled={submitting} className="min-w-36 gap-2">
                {submitting ? <Loader2 aria-hidden className="h-4 w-4 animate-spin" /> : <Send aria-hidden className="h-4 w-4" />}
                {submitting ? "Sending…" : "Send message"}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
